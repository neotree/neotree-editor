"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import logger from "@/lib/logger"
import { hardwareSerialsMatchForReview } from "@/lib/mdm/device-matching"
import { getProfileConfigurationScopes, remoteDeviceMatchesProfileScope } from "@/lib/mdm/profile-scope"
import { isAllowed } from "./is-allowed"
import {
  _getDeviceMdmLink,
  _getDeviceManagementOverview,
  _getDeviceMdmLinks,
  _getMdmDeviceInventory,
  _getMdmDeviceInventoryById,
  _getMdmProviderProfile,
  _getMdmProviderProfiles,
} from "@/databases/queries/device-management"
import {
  adminAuditLogs,
} from "@/databases/pg/schema"
import db from "@/databases/pg/drizzle"
import {
  _linkDeviceToMdm,
  _markMdmDeviceInventoryRowsIgnored,
  _upsertMdmDeviceInventory,
  _updateMdmDeviceInventoryReview,
  _saveMdmProviderProfile,
  _updateMdmProviderDeviceSyncStatus,
  _updateMdmProviderConnectionStatus,
  _unlinkDeviceFromMdm,
} from "@/databases/mutations/device-management"
import { createMdmProvider } from "@/lib/mdm"
import { isHeadwindApplicationRow } from "@/lib/mdm/headwind-shape"
import { decryptSecret, encryptSecret } from "@/lib/server/secret-box"
import { requestMdmApkRolloutForDevice } from "@/lib/app-updates/mdm-rollout"

const DEFAULT_MDM_AUTO_LINK_MIN_CONFIDENCE = 95
const MIN_MDM_AUTO_LINK_CONFIDENCE = 95
const DEFAULT_MDM_REVIEW_MIN_CONFIDENCE = 50

/** Runs an async mapper over items with a bounded number of concurrent workers (#13). */
async function mapWithConcurrency<T, R>(items: T[], limit: number, mapper: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await mapper(items[index])
    }
  })
  await Promise.all(workers)
  return results
}

function formErrorRedirect(formData: FormData, message: string): never {
  const returnTo = `${formData.get("returnTo") || "/device-management"}`
  const separator = returnTo.includes("?") ? "&" : "?"
  redirect(`${returnTo}${separator}error=${encodeURIComponent(message)}`)
}

async function requireDeviceManagementAdmin() {
  const session = await isAllowed()
  if (!["admin", "super_user"].includes(`${session.user?.role || ""}`)) {
    throw new Error("You do not have permission to manage devices")
  }
  return session
}

async function writeDeviceManagementAudit({
  actorUserId,
  action,
  beforeState,
  afterState,
  metadata,
}: {
  actorUserId?: string | null
  action: string
  beforeState?: Record<string, any>
  afterState?: Record<string, any>
  metadata?: Record<string, any>
}) {
  try {
    await db.insert(adminAuditLogs).values({
      area: "device_management",
      action,
      actorUserId: actorUserId || null,
      beforeState: beforeState || {},
      afterState: afterState || {},
      metadata: metadata || {},
    })
  } catch (e: any) {
    logger.error("writeDeviceManagementAudit ERROR", e.message)
  }
}

function cleanObject<T extends Record<string, any>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== "")) as Partial<T>
}

function buildEndpointSettings(formData: FormData) {
  const actionPaths = cleanObject({
    lockDevice: `${formData.get("lockDevicePath") || ""}`.trim(),
    wipeDevice: `${formData.get("wipeDevicePath") || ""}`.trim(),
    rebootDevice: `${formData.get("rebootDevicePath") || ""}`.trim(),
    resetPassword: `${formData.get("resetPasswordPath") || ""}`.trim(),
    assignKioskPolicy: `${formData.get("assignKioskPolicyPath") || ""}`.trim(),
    pushApk: `${formData.get("pushApkPath") || ""}`.trim(),
  })

  return cleanObject({
    configurationsPath: `${formData.get("configurationsPath") || ""}`.trim(),
    devicesPath: `${formData.get("devicesPath") || ""}`.trim(),
    deviceStatusPath: `${formData.get("deviceStatusPath") || ""}`.trim(),
    loginPath: `${formData.get("loginPath") || ""}`.trim(),
    actionPaths: Object.keys(actionPaths).length ? actionPaths : undefined,
  })
}

function getServiceAuthSettings(settings?: Record<string, any> | null) {
  return (settings?.serviceAuth || {}) as {
    username?: string | null
    passwordEncrypted?: string | null
  }
}

function getTokenOverride(formData: FormData, existingApiKey?: string | null) {
  const tokenInput = `${formData.get("accessTokenOverride") || formData.get("apiKey") || ""}`.trim()
  if (tokenInput) return tokenInput
  return decryptSecret(existingApiKey)
}

function buildStoredTokenOverride(formData: FormData, existingApiKey?: string | null) {
  const tokenInput = `${formData.get("accessTokenOverride") || formData.get("apiKey") || ""}`.trim()
  if (tokenInput) return encryptSecret(tokenInput)
  if (!existingApiKey) return null
  return existingApiKey.startsWith("ntsec:v1:") ? existingApiKey : encryptSecret(existingApiKey)
}

function getServiceUsername(formData: FormData, existingSettings?: Record<string, any> | null) {
  const existingAuth = getServiceAuthSettings(existingSettings)
  return `${formData.get("serviceUsername") || ""}`.trim() || existingAuth.username || null
}

function getServicePassword(formData: FormData, existingSettings?: Record<string, any> | null) {
  const passwordInput = `${formData.get("servicePassword") || ""}`.trim()
  if (passwordInput) return passwordInput

  const existingAuth = getServiceAuthSettings(existingSettings)
  return decryptSecret(existingAuth.passwordEncrypted)
}

function buildStoredSettings(
  formData: FormData,
  existingSettings?: Record<string, any> | null,
) {
  const passwordInput = `${formData.get("servicePassword") || ""}`.trim()
  const existingAuth = getServiceAuthSettings(existingSettings)
  const serviceUsername = getServiceUsername(formData, existingSettings)
  const passwordEncrypted = passwordInput
    ? encryptSecret(passwordInput)
    : existingAuth.passwordEncrypted || null
  const endpointSettings = buildEndpointSettings(formData)
  const reviewMinConfidence = Number(formData.get("reviewMinConfidence") || existingSettings?.reviewMinConfidence || DEFAULT_MDM_REVIEW_MIN_CONFIDENCE)
  const submittedSyncConfiguration = `${formData.get("syncConfigurationId") || ""}`.trim()

  const settings = {
    ...(existingSettings || {}),
    ...endpointSettings,
    reviewMinConfidence: Number.isFinite(reviewMinConfidence) ? reviewMinConfidence : DEFAULT_MDM_REVIEW_MIN_CONFIDENCE,
    serviceAuth: cleanObject({
      username: serviceUsername,
      passwordEncrypted,
    }),
  }
  const mutableSettings = settings as Record<string, any>

  if (formData.has("syncConfigurationId")) {
    delete mutableSettings.syncConfigurationName
    delete mutableSettings.syncConfigurationIds
    delete mutableSettings.syncConfigurationNames
    if (submittedSyncConfiguration && submittedSyncConfiguration !== "__all__") {
      mutableSettings.syncConfigurationId = submittedSyncConfiguration
    } else {
      delete mutableSettings.syncConfigurationId
    }
  }

  for (const key of ["configurationsPath", "devicesPath", "deviceStatusPath", "loginPath", "actionPaths"]) {
    if (!(endpointSettings as Record<string, any>)[key]) delete (settings as Record<string, any>)[key]
  }

  return settings
}

function checkboxIsOn(formData: FormData, name: string, defaultValue = false) {
  const values = formData.getAll(name).map((value) => `${value}`)
  if (!values.length) return defaultValue
  return values.includes("on")
}

function getReviewMinConfidence(settings?: unknown) {
  const value = Number((settings as Record<string, any> | null)?.reviewMinConfidence || DEFAULT_MDM_REVIEW_MIN_CONFIDENCE)
  if (!Number.isFinite(value)) return DEFAULT_MDM_REVIEW_MIN_CONFIDENCE
  return Math.max(1, Math.min(100, value))
}

function getAutoLinkMinConfidence(value: unknown) {
  const confidence = Number(value || DEFAULT_MDM_AUTO_LINK_MIN_CONFIDENCE)
  if (!Number.isFinite(confidence)) return DEFAULT_MDM_AUTO_LINK_MIN_CONFIDENCE
  return Math.max(MIN_MDM_AUTO_LINK_CONFIDENCE, Math.min(100, confidence))
}

export const getDeviceManagementOverview: typeof _getDeviceManagementOverview = async (...args) => {
  try {
    await isAllowed()
    return await _getDeviceManagementOverview(...args)
  } catch (e: any) {
    logger.error("getDeviceManagementOverview ERROR", e.message)
    return { data: { profiles: [], links: [], inventory: [], devices: [] }, errors: [e.message] }
  }
}

export const getMdmProviderProfiles: typeof _getMdmProviderProfiles = async (...args) => {
  try {
    await isAllowed()
    return await _getMdmProviderProfiles(...args)
  } catch (e: any) {
    logger.error("getMdmProviderProfiles ERROR", e.message)
    return { data: [], errors: [e.message] }
  }
}

export const getMdmProviderProfile: typeof _getMdmProviderProfile = async (...args) => {
  try {
    await isAllowed()
    return await _getMdmProviderProfile(...args)
  } catch (e: any) {
    logger.error("getMdmProviderProfile ERROR", e.message)
    return { data: null, errors: [e.message] }
  }
}

export const getDeviceMdmLinks: typeof _getDeviceMdmLinks = async (...args) => {
  try {
    await isAllowed()
    return await _getDeviceMdmLinks(...args)
  } catch (e: any) {
    logger.error("getDeviceMdmLinks ERROR", e.message)
    return { data: [], errors: [e.message] }
  }
}

export const getDeviceMdmLink: typeof _getDeviceMdmLink = async (...args) => {
  try {
    await isAllowed()
    return await _getDeviceMdmLink(...args)
  } catch (e: any) {
    logger.error("getDeviceMdmLink ERROR", e.message)
    return { data: null, errors: [e.message] }
  }
}

export const getMdmDeviceInventoryById: typeof _getMdmDeviceInventoryById = async (...args) => {
  try {
    await isAllowed()
    return await _getMdmDeviceInventoryById(...args)
  } catch (e: any) {
    logger.error("getMdmDeviceInventoryById ERROR", e.message)
    return { data: null, errors: [e.message] }
  }
}

export async function getMdmProviderConfigurations(profileId: string) {
  try {
    await isAllowed()
    const profile = await _getMdmProviderProfile(profileId)
    if (!profile.data) return { data: [], errors: ["MDM profile not found"] }

    const provider = createMdmProvider({
      profileId: profile.data.profileId,
      provider: profile.data.provider,
      baseUrl: profile.data.baseUrl,
      apiKey: decryptSecret(profile.data.apiKey),
      username: getServiceAuthSettings(profile.data.settings as Record<string, any>).username,
      password: decryptSecret(getServiceAuthSettings(profile.data.settings as Record<string, any>).passwordEncrypted),
      settings: profile.data.settings || {},
    })

    const configurations = await provider.listConfigurations()
    return { data: configurations }
  } catch (e: any) {
    logger.error("getMdmProviderConfigurations ERROR", e.message)
    return { data: [], errors: [e.message] }
  }
}

export async function getMdmProviderDevices(profileId: string) {
  try {
    await requireDeviceManagementAdmin()
    const profile = await _getMdmProviderProfile(profileId)
    if (!profile.data) return { data: [], errors: ["MDM profile not found"] }

    const provider = createProviderFromProfile(profile.data)
    const devices = await provider.syncDevices()
    return { data: devices, errors: [] }
  } catch (e: any) {
    logger.error("getMdmProviderDevices ERROR", e.message)
    return { data: [], errors: [e.message || "Could not load Headwind devices"] }
  }
}

// Remote device control commands and the provider capability each requires. The
// tokens match what the row-actions UI submits. Capability gating is default-deny,
// so a destructive action (factory reset) is impossible unless explicitly enabled
// on the profile.
export type MdmDeviceCommandToken = "lock" | "unlock" | "wipe" | "reboot" | "resetPassword"

const MDM_COMMAND_CAPABILITY: Record<MdmDeviceCommandToken, string> = {
  lock: "remoteLock",
  unlock: "remoteLock",
  wipe: "remoteWipe",
  reboot: "reboot",
  resetPassword: "resetPassword",
}

const MDM_COMMAND_AUDIT_ACTION: Record<MdmDeviceCommandToken, string> = {
  lock: "device_remote_lock_requested",
  unlock: "device_remote_unlock_requested",
  wipe: "device_remote_wipe_requested",
  reboot: "device_remote_reboot_requested",
  resetPassword: "device_remote_password_reset_requested",
}

function isMdmDeviceCommandToken(value: string): value is MdmDeviceCommandToken {
  return value in MDM_COMMAND_CAPABILITY
}

export async function testMdmProviderConnectionDraft(formData: FormData) {
  try {
    await requireDeviceManagementAdmin()
    const profileId = `${formData.get("profileId") || ""}` || undefined
    const existing = profileId ? await _getMdmProviderProfile(profileId) : null
    const existingSettings = (existing?.data?.settings || {}) as Record<string, any>
    const apiKey = getTokenOverride(formData, existing?.data?.apiKey || null)
    const username = getServiceUsername(formData, existingSettings)
    const password = getServicePassword(formData, existingSettings)

    if (!apiKey && (!username || !password)) {
      return {
        success: false,
        message: "Headwind service username and password are required before this profile can be tested.",
        configurations: [],
      }
    }

    const provider = createMdmProvider({
      profileId: profileId || "draft",
      provider: "headwind",
      baseUrl: `${formData.get("baseUrl") || ""}`,
      apiKey,
      username,
      password,
      settings: buildEndpointSettings(formData),
    })

    const configurations = await provider.listConfigurations()

    return {
      success: true,
      message: "Connection successful. NeoTree can reach Headwind and read configurations.",
      configurations,
    }
  } catch (e: any) {
    logger.error("testMdmProviderConnectionDraft ERROR", e.message)
    return {
      success: false,
      message: e.message || "Could not connect to Headwind.",
      configurations: [],
    }
  }
}

export async function testMdmProviderConnectionFromForm(formData: FormData) {
  const profileId = `${formData.get("profileId") || ""}`
  const returnTo = `${formData.get("returnTo") || (profileId ? `/device-management/profiles/${profileId}` : "/device-management")}`

  try {
    await requireDeviceManagementAdmin()
    const profile = await _getMdmProviderProfile(profileId)
    if (!profile.data) formErrorRedirect(formData, "MDM profile not found")

    const provider = createMdmProvider({
      profileId: profile.data!.profileId,
      provider: profile.data!.provider,
      baseUrl: profile.data!.baseUrl,
      apiKey: decryptSecret(profile.data!.apiKey),
      username: getServiceAuthSettings(profile.data!.settings as Record<string, any>).username,
      password: decryptSecret(getServiceAuthSettings(profile.data!.settings as Record<string, any>).passwordEncrypted),
      settings: profile.data!.settings || {},
    })

    const configurations = await provider.listConfigurations()
    await _updateMdmProviderConnectionStatus(profileId, {
      lastConnectionStatus: "connected",
      lastConnectionError: null,
      lastConnectionCheckedAt: new Date(),
    })

    revalidatePath("/device-management")
    revalidatePath(returnTo)
    const separator = returnTo.includes("?") ? "&" : "?"
    redirect(`${returnTo}${separator}connection=ok&configurations=${configurations.length}`)
  } catch (e: any) {
    if (`${e?.digest || ""}`.startsWith("NEXT_REDIRECT")) throw e
    logger.error("testMdmProviderConnectionFromForm ERROR", e.message)
    if (profileId) {
      await _updateMdmProviderConnectionStatus(profileId, {
        lastConnectionStatus: "failed",
        lastConnectionError: e.message || "Could not connect to Headwind",
        lastConnectionCheckedAt: new Date(),
      })
    }
    revalidatePath("/device-management")
    const separator = returnTo.includes("?") ? "&" : "?"
    redirect(`${returnTo}${separator}error=${encodeURIComponent(e.message || "Could not connect to Headwind")}`)
  }
}

function createProviderFromProfile(profile: {
  profileId: string
  provider: "headwind"
  baseUrl: string
  apiKey?: string | null
  settings?: unknown
}) {
  return createMdmProvider({
    profileId: profile.profileId,
    provider: profile.provider,
    baseUrl: profile.baseUrl,
    apiKey: decryptSecret(profile.apiKey),
    username: getServiceAuthSettings(profile.settings as Record<string, any>).username,
    password: decryptSecret(getServiceAuthSettings(profile.settings as Record<string, any>).passwordEncrypted),
    settings: (profile.settings as Record<string, any>) || {},
  })
}

async function saveMdmProviderProfile(formData: FormData) {
  try {
    const session = await requireDeviceManagementAdmin()
    const profileId = `${formData.get("profileId") || ""}` || undefined
    const existing = profileId ? await _getMdmProviderProfile(profileId) : null
    const existingSettings = (existing?.data?.settings || {}) as Record<string, any>
    const apiKey = buildStoredTokenOverride(formData, existing?.data?.apiKey || null)
    const settings = buildStoredSettings(formData, existingSettings)
    const isSharedInstance = formData.get("isSharedInstance") === "on"
    if (isSharedInstance && !getProfileConfigurationScopes(settings).length) {
      return {
        success: false,
        errors: ["Select the Headwind configuration whose devices belong to this shared profile."],
      }
    }

    const providerCapabilities = {
      deviceSync: formData.get("capability_deviceSync") === "on",
      kiosk: formData.get("capability_kiosk") === "on",
      apkPush: formData.get("capability_apkPush") === "on",
      remoteLock: formData.get("capability_remoteLock") === "on",
      remoteWipe: formData.get("capability_remoteWipe") === "on",
      reboot: formData.get("capability_reboot") === "on",
      resetPassword: formData.get("capability_resetPassword") === "on",
    }

    const result = await _saveMdmProviderProfile({
      profileId,
      name: `${formData.get("name") || ""}`,
      provider: "headwind",
      countryISO: `${formData.get("countryISO") || ""}`,
      hospitalId: `${formData.get("hospitalId") || ""}` || null,
      environment: `${formData.get("environment") || "production"}`,
      isSharedInstance,
      baseUrl: `${formData.get("baseUrl") || ""}`,
      apiKey,
      defaultKioskPolicy: `${formData.get("defaultKioskPolicy") || ""}` || null,
      providerCapabilities,
      settings,
      isEnabled: formData.get("isEnabled") !== "off",
      autoSyncEnabled: checkboxIsOn(formData, "autoSyncEnabled", true),
      autoLinkEnabled: checkboxIsOn(formData, "autoLinkEnabled", true),
      autoLinkMinConfidence: getAutoLinkMinConfidence(formData.get("autoLinkMinConfidence")),
    })

    if (result.success) {
      const connectionTestStatus = `${formData.get("__connectionTestStatus") || ""}`
      const saveAnywayReason = `${formData.get("saveAnywayReason") || ""}`.trim()
      if (result.data?.profileId && (connectionTestStatus === "connected" || connectionTestStatus === "failed")) {
        await _updateMdmProviderConnectionStatus(result.data.profileId, {
          lastConnectionStatus: connectionTestStatus,
          lastConnectionError: connectionTestStatus === "failed" ? `${formData.get("__connectionTestMessage") || "Could not connect to Headwind"}` : null,
          lastConnectionCheckedAt: new Date(),
        })
      }
      await writeDeviceManagementAudit({
        actorUserId: session.user?.userId,
        action: profileId ? "mdm_profile_updated" : "mdm_profile_created",
        beforeState: existing?.data || {},
        afterState: {
          profileId: result.data?.profileId,
          name: result.data?.name,
          provider: result.data?.provider,
          countryISO: result.data?.countryISO,
          environment: result.data?.environment,
          isEnabled: result.data?.isEnabled,
          baseUrl: result.data?.baseUrl,
        },
        metadata: {
          connectionTestStatus,
          saveAnywayReason: connectionTestStatus === "failed" ? saveAnywayReason : undefined,
        },
      })
      revalidatePath("/device-management")
      return { success: true, data: result.data }
    } else {
      return { success: false, errors: result.errors || ["Could not save MDM profile"] }
    }
  } catch (e: any) {
    if (`${e?.digest || ""}`.startsWith("NEXT_REDIRECT")) throw e
    logger.error("saveMdmProviderProfileFromForm ERROR", e.message)
    return { success: false, errors: [e.message || "Could not save MDM profile"] }
  }
}

export async function saveMdmProviderProfileDraft(formData: FormData) {
  return saveMdmProviderProfile(formData)
}

export async function saveMdmProviderProfileFromForm(formData: FormData) {
  const result = await saveMdmProviderProfile(formData)

  if (!result.success) {
    formErrorRedirect(formData, result.errors?.[0] || "Could not save MDM profile")
  }

  redirect("/device-management")
}

function buildDeviceCapabilitiesFromForm(formData: FormData) {
  return {
    kiosk: formData.get("capability_kiosk") === "on",
    apkInstall: formData.get("capability_apkInstall") === "on",
    remoteLock: formData.get("capability_remoteLock") === "on",
    remoteWipe: formData.get("capability_remoteWipe") === "on",
    inventorySync: formData.get("capability_inventorySync") === "on",
  }
}

function normalizeIdentifier(value: unknown) {
  return `${value || ""}`.trim().toLowerCase()
}

function uniqueIdentifiers(values: unknown[]) {
  return Array.from(new Set(values.map(normalizeIdentifier).filter(Boolean)))
}

function stableIdentifierVariants(value: unknown) {
  const normalized = normalizeIdentifier(value)
  if (!normalized) return []
  const prefixed = normalized.match(/^nt_(?:hash|device|android|headwind):(.+)$/)
  return prefixed?.[1] ? [normalized, prefixed[1]] : [normalized]
}

function uniqueStableIdentifiers(values: unknown[]) {
  return Array.from(new Set(values.flatMap(stableIdentifierVariants).filter(Boolean)))
}

function isStrongDeviceHash(value?: string | null) {
  if (!value) return false
  // Short human-facing codes like "9999" are useful review evidence but are not
  // strong enough to silently auto-link a clinical tablet.
  return value.length >= 8
}

function remoteIdentifiers(remote: any) {
  const payload = remote?.payload || {}
  const info = payload.info || {}
  const custom = payload.custom || payload.customData || payload.customFields || {}
  const capabilities = (remote?.deviceCapabilities || payload.deviceCapabilities || {}) as Record<string, any>
  const identifiers = (capabilities.identifiers || payload.identifiers || payload.deviceCapabilities?.identifiers || {}) as Record<string, any>
  const mdm = (capabilities.mdm || identifiers.mdm || payload.mdm || {}) as Record<string, any>
  const headwindNumber = normalizeIdentifier(
    mdm.deviceNumber ||
    mdm.headwindNumber ||
    identifiers.headwindNumber ||
    identifiers.deviceNumber ||
    identifiers.number ||
    payload.number ||
    info.deviceId,
  )
  const oldHeadwindNumber = normalizeIdentifier(
    mdm.oldDeviceNumber ||
    mdm.oldNumber ||
    identifiers.headwindOldNumber ||
    identifiers.oldNumber ||
    payload.oldNumber ||
    info.oldNumber,
  )
  const customValues = uniqueStableIdentifiers([
    payload.custom1,
    payload.custom2,
    payload.custom3,
    identifiers.custom1,
    identifiers.custom2,
    identifiers.custom3,
    mdm.custom1,
    mdm.custom2,
    custom.deviceId,
    custom.neotreeDeviceId,
    custom.deviceHash,
    custom.neotreeDeviceHash,
  ])

  return {
    mdmDeviceId: normalizeIdentifier(remote?.mdmDeviceId || identifiers.headwindId || mdm.headwindId || mdm.deviceId || payload.id),
    deviceId: normalizeIdentifier(
      remote?.deviceId ||
      payload.neotreeDeviceId ||
      payload.customDeviceId ||
      identifiers.neotreeDeviceId ||
      mdm.neotreeDeviceId ||
      custom.deviceId ||
      custom.neotreeDeviceId,
    ),
    deviceHash: normalizeIdentifier(
      payload.deviceHash ||
      payload.neotreeDeviceHash ||
      payload.neotreeDeviceCode ||
      custom.deviceHash ||
      custom.neotreeDeviceHash,
    ),
    headwindNumber,
    oldHeadwindNumber,
    serialNumber: normalizeIdentifier(
      remote?.serialNumber ||
      payload.serialNumber ||
      payload.serial ||
      payload.androidSerial ||
      info.serialNumber ||
      info.serial ||
      identifiers.serialNumber ||
      mdm.serialNumber,
    ),
    customValues,
    aliases: uniqueStableIdentifiers([
      remote?.mdmDeviceId,
      remote?.deviceId,
      payload.id,
      payload.neotreeDeviceId,
      payload.customDeviceId,
      headwindNumber,
      oldHeadwindNumber,
      info.deviceId,
      payload.custom1,
      payload.custom2,
      identifiers.headwindId,
      identifiers.headwindNumber,
      identifiers.deviceNumber,
      identifiers.number,
      identifiers.oldNumber,
      identifiers.neotreeDeviceId,
      identifiers.custom1,
      identifiers.custom2,
      mdm.headwindId,
      mdm.deviceId,
      mdm.deviceNumber,
      mdm.headwindNumber,
      mdm.oldDeviceNumber,
      mdm.oldNumber,
      mdm.custom1,
      mdm.custom2,
      custom.deviceId,
      custom.neotreeDeviceId,
      custom.deviceHash,
      custom.neotreeDeviceHash,
    ]),
  }
}

function localDeviceIdentifiers(device: any, appState?: any | null) {
  const details = (device?.details || {}) as Record<string, any>
  const capabilities = (appState?.deviceCapabilities || {}) as Record<string, any>
  const identifiers = (capabilities.identifiers || {}) as Record<string, any>
  const mdm = (capabilities.mdm || identifiers.mdm || {}) as Record<string, any>
  const deviceId = normalizeIdentifier(device?.deviceId)
  const deviceHash = normalizeIdentifier(device?.deviceHash || capabilities.deviceHash || identifiers.deviceHash)
  const serialNumber = normalizeIdentifier(
    details.serialNumber ||
    details.serial ||
    details.androidSerial ||
    capabilities.serialNumber ||
    identifiers.serialNumber ||
    identifiers.serial,
  )
  const mdmDeviceNumber = normalizeIdentifier(
    mdm.deviceNumber ||
    mdm.number ||
    mdm.headwindNumber ||
    identifiers.mdmDeviceNumber ||
    identifiers.headwindDeviceNumber ||
    identifiers.headwindNumber ||
    identifiers.deviceNumber,
  )
  const mdmOldDeviceNumber = normalizeIdentifier(
    mdm.oldDeviceNumber ||
    mdm.oldNumber ||
    identifiers.mdmOldDeviceNumber ||
    identifiers.headwindOldNumber ||
    identifiers.oldNumber,
  )
  return {
    deviceId,
    deviceHash,
    serialNumber,
    mdmDeviceId: normalizeIdentifier(mdm.deviceId || mdm.mdmDeviceId || mdm.headwindId || identifiers.mdmDeviceId || identifiers.headwindId),
    mdmDeviceNumber,
    mdmOldDeviceNumber,
    manufacturer: normalizeIdentifier(appState?.manufacturer || details.manufacturer),
    model: normalizeIdentifier(appState?.model || details.model),
    aliases: uniqueStableIdentifiers([
      deviceId,
      deviceHash,
      serialNumber,
      mdm.deviceId,
      mdm.mdmDeviceId,
      mdm.headwindId,
      mdm.deviceNumber,
      mdm.number,
      mdm.headwindNumber,
      mdm.oldDeviceNumber,
      mdm.oldNumber,
      mdm.serialNumber,
      mdm.custom1,
      mdm.custom2,
      identifiers.mdmDeviceId,
      identifiers.headwindId,
      identifiers.mdmDeviceNumber,
      identifiers.headwindDeviceNumber,
      identifiers.headwindNumber,
      identifiers.deviceNumber,
      identifiers.mdmOldDeviceNumber,
      identifiers.headwindOldNumber,
      identifiers.oldNumber,
      identifiers.mdmCustom1,
      identifiers.mdmCustom2,
    ]),
  }
}

function scoreMdmDeviceMatch(remote: any, device: any, appState?: any | null) {
  const remoteIds = remoteIdentifiers(remote)
  const localIds = localDeviceIdentifiers(device, appState)
  const reasons: string[] = []
  let score = 0

  if (remoteIds.deviceId && remoteIds.deviceId === localIds.deviceId) {
    score = Math.max(score, 100)
    reasons.push("NeoTree device ID matched")
  }
  if (remoteIds.mdmDeviceId && remoteIds.mdmDeviceId === localIds.mdmDeviceId) {
    score = Math.max(score, 100)
    reasons.push("Headwind device ID matched NeoTree-reported MDM device ID")
  }
  if (remoteIds.headwindNumber && remoteIds.headwindNumber === localIds.mdmDeviceNumber) {
    score = Math.max(score, 100)
    reasons.push("Headwind device number matched NeoTree-reported MDM device number")
  }
  if (remoteIds.oldHeadwindNumber && remoteIds.oldHeadwindNumber === localIds.mdmDeviceNumber) {
    score = Math.max(score, 98)
    reasons.push("Previous Headwind device number matched NeoTree-reported MDM device number")
  }
  if (remoteIds.oldHeadwindNumber && localIds.mdmOldDeviceNumber && remoteIds.oldHeadwindNumber === localIds.mdmOldDeviceNumber) {
    score = Math.max(score, 98)
    reasons.push("Previous Headwind device number matched NeoTree-reported previous MDM device number")
  }
  // Serial values are useful corroboration but are not safe automatic identity:
  // Android/OEM builds can expose placeholders or duplicated serials. Keep a
  // valid equality in the human-review range, below every auto-link threshold.
  if (hardwareSerialsMatchForReview(remoteIds.serialNumber, localIds.serialNumber)) {
    score = Math.max(score, 70)
    reasons.push("Hardware serial number matched (review required)")
  }
  if (remoteIds.customValues.includes(localIds.deviceId)) {
    score = Math.max(score, 100)
    reasons.push("Headwind custom field matched NeoTree device ID")
  }
  if (localIds.deviceHash && remoteIds.customValues.includes(localIds.deviceHash)) {
    score = Math.max(score, 100)
    reasons.push("Headwind custom field matched NeoTree device hash")
  }
  if (remoteIds.deviceHash && remoteIds.deviceHash === localIds.deviceHash) {
    if (isStrongDeviceHash(localIds.deviceHash)) {
      score = Math.max(score, 98)
      reasons.push("NeoTree device hash matched")
    } else {
      score = Math.max(score, 80)
      reasons.push("Short NeoTree device hash matched")
    }
  }
  if (localIds.deviceHash && remoteIds.aliases.includes(localIds.deviceHash)) {
    if (isStrongDeviceHash(localIds.deviceHash)) {
      score = Math.max(score, 95)
      reasons.push("Headwind stable identifiers contain NeoTree device hash")
    } else {
      score = Math.max(score, 80)
      reasons.push("Headwind stable identifiers contain short NeoTree device hash")
    }
  }

  return { device, score, reasons }
}

function mdmRecordLookupKeys(record: any) {
  const ids = remoteIdentifiers(record)
  return uniqueStableIdentifiers([
    record?.mdmDeviceId,
    ids.mdmDeviceId,
    ids.headwindNumber,
    ids.oldHeadwindNumber,
    ...(ids.aliases || []),
  ])
}

function buildMdmIdentityStamp(device: any, appState?: any | null) {
  const localIds = localDeviceIdentifiers(device, appState)
  return {
    neotreeDeviceId: localIds.deviceId || null,
    neotreeDeviceHash: localIds.deviceHash || null,
  }
}

async function stampLinkedMdmIdentity({
  provider,
  remote,
  device,
  appState,
  summary,
}: {
  provider: ReturnType<typeof createProviderFromProfile>
  remote: any
  device: any
  appState?: any | null
  summary: { identityStamped: number; identityStampSkipped: number; identityStampFailed: number }
}) {
  if (!provider.stampDeviceIdentity) return
  const stamp = buildMdmIdentityStamp(device, appState)
  if (!stamp.neotreeDeviceId && !stamp.neotreeDeviceHash) {
    summary.identityStampSkipped += 1
    return
  }

  try {
    const result = await provider.stampDeviceIdentity(remote, stamp)
    if (result.success) {
      if (result.payload?.skipped) summary.identityStampSkipped += 1
      else summary.identityStamped += 1
      return
    }
    summary.identityStampFailed += 1
    logger.error("stampLinkedMdmIdentity ERROR", result.message || "Headwind stamp-back failed")
  } catch (e: any) {
    summary.identityStampFailed += 1
    logger.error("stampLinkedMdmIdentity ERROR", e.message)
  }
}

/**
 * Stamp-back for the human-confirmed link paths (review-approval, manual link).
 * Makes the link deterministic for next time by writing NeoTree IDs into Headwind
 * custom fields. Best-effort: never blocks the link if Headwind is unreachable.
 */
async function stampMdmIdentityForLink({
  profile,
  remote,
  deviceId,
}: {
  profile: Parameters<typeof createProviderFromProfile>[0] | null | undefined
  remote: any
  deviceId: string
}) {
  try {
    if (!profile || !deviceId) return
    const provider = createProviderFromProfile(profile)
    if (!provider.stampDeviceIdentity) return

    const device = await db.query.devices.findFirst({
      where: (rows, { eq }) => eq(rows.deviceId, deviceId),
    })
    if (!device) return

    const stamp = buildMdmIdentityStamp(device, null)
    if (!stamp.neotreeDeviceId && !stamp.neotreeDeviceHash) return

    const result = await provider.stampDeviceIdentity(remote, stamp)
    if (!result.success) {
      logger.error("stampMdmIdentityForLink ERROR", JSON.stringify({
        deviceId,
        mdmDeviceId: remote?.mdmDeviceId || null,
        message: result.message || "Headwind stamp-back failed",
      }))
    }
  } catch (e: any) {
    logger.error("stampMdmIdentityForLink ERROR", e.message)
  }
}

async function reconcileMdmProfileDevices(profile: NonNullable<Awaited<ReturnType<typeof _getMdmProviderProfile>>["data"]>) {
  const provider = createProviderFromProfile(profile)
  const allRemoteDevices = await provider.syncDevices()
  // Default kiosk assignment and inventory ownership are separate concerns.
  // Shared tenants must explicitly identify the configuration this profile owns.
  const profileScopes = getProfileConfigurationScopes(profile.settings)
  if (profile.isSharedInstance && !profileScopes.length) {
    throw new Error("Shared MDM profiles require an explicit Headwind configuration scope before devices can be synchronized")
  }
  const applicationRowsFromProvider = allRemoteDevices.filter((remote) => isHeadwindApplicationRow(remote.payload || remote))
  const actualRemoteDevices = allRemoteDevices.filter((remote) => !isHeadwindApplicationRow(remote.payload || remote))
  const remoteDevices = actualRemoteDevices
    .filter((remote) => remoteDeviceMatchesProfileScope(remote, profileScopes))
  const syncDiagnostics = provider.getLastSyncDiagnostics?.() || null
  const [deviceRows, stateRows, existingLinks, existingInventory] = await Promise.all([
    db.query.devices.findMany(),
    db.query.deviceAppStates.findMany(),
    _getDeviceMdmLinks({ profileId: profile.profileId }),
    _getMdmDeviceInventory({ profileId: profile.profileId, includeIgnored: true }),
  ])

  const legacyApplicationRows = (existingInventory.data || []).filter((row) => {
    if (row.matchStatus === "ignored") return false
    return isHeadwindApplicationRow(row.payload)
  })
  if (legacyApplicationRows.length) {
    await _markMdmDeviceInventoryRowsIgnored(
      legacyApplicationRows.map((row) => row.inventoryId),
      "Ignored legacy Headwind application row imported before device response parsing was tightened",
    )
  }

  const appStateByDevice = new Map(stateRows.map((state) => [state.deviceId, state]))
  const deviceById = new Map(deviceRows.map((device) => [device.deviceId, device]))
  const linksByMdmDeviceId = new Map<string, NonNullable<typeof existingLinks.data>[number]>()
  for (const link of existingLinks.data || []) {
    for (const key of mdmRecordLookupKeys(link)) {
      if (!linksByMdmDeviceId.has(key)) linksByMdmDeviceId.set(key, link)
    }
  }
  const minConfidence = getAutoLinkMinConfidence(profile.autoLinkMinConfidence)
  const reviewMinConfidence = getReviewMinConfidence(profile.settings)
  const autoLinkEnabled = profile.autoLinkEnabled !== false
  const summary = {
    remoteDevices: remoteDevices.length,
    rawRemoteDevices: actualRemoteDevices.length,
    scopedOutRemoteDevices: actualRemoteDevices.length - remoteDevices.length,
    configurationScope: profileScopes,
    ignoredApplicationRows: applicationRowsFromProvider.length,
    ignoredLegacyApplicationRows: legacyApplicationRows.length,
    autoLinked: 0,
    refreshedLinks: 0,
    needsReview: 0,
    conflicts: 0,
    unmatched: 0,
    identityStamped: 0,
    identityStampSkipped: 0,
    identityStampFailed: 0,
    diagnostics: syncDiagnostics,
    startedAt: new Date().toISOString(),
  }
  // Devices auto-linked this run get the managed APK pushed afterwards (#4).
  const autoLinkedDeviceIds: string[] = []

  const processRemote = async (remote: typeof remoteDevices[number]) => {
    if (!remote.mdmDeviceId) return
    const mdmDeviceId = remote.mdmDeviceId
    const existingLink = mdmRecordLookupKeys(remote)
      .map((key) => linksByMdmDeviceId.get(key))
      .find(Boolean)

    if (existingLink) {
      await _linkDeviceToMdm({
        linkId: existingLink.linkId,
        deviceId: existingLink.deviceId,
        provider: existingLink.provider,
        profileId: existingLink.profileId,
        mdmDeviceId,
        mdmConfigId: remote.mdmConfigId || existingLink.mdmConfigId,
        mdmConfigName: remote.mdmConfigName || existingLink.mdmConfigName,
        mdmGroupId: remote.mdmGroupId || existingLink.mdmGroupId,
        mdmGroupName: remote.mdmGroupName || existingLink.mdmGroupName,
        countryISO: existingLink.countryISO || profile.countryISO,
        hospitalId: existingLink.hospitalId || profile.hospitalId,
        enrollmentStatus: remote.enrollmentStatus,
        managementState: remote.managementState,
        serialNumber: remote.serialNumber || existingLink.serialNumber,
        androidVersion: remote.androidVersion || existingLink.androidVersion,
        deviceCapabilities: remote.deviceCapabilities || existingLink.deviceCapabilities || {},
        lastMdmSeenAt: remote.lastMdmSeenAt ? new Date(remote.lastMdmSeenAt) : existingLink.lastMdmSeenAt,
        lastSyncedAt: new Date(),
        lastSyncStatus: "synced",
        lastSyncError: null,
        linkSource: existingLink.linkSource || "manual",
        matchConfidence: existingLink.matchConfidence,
        matchReasons: existingLink.matchReasons || [],
        payload: remote.payload || existingLink.payload || {},
      })

      await _upsertMdmDeviceInventory({
        provider: profile.provider,
        profileId: profile.profileId,
        mdmDeviceId,
        linkedDeviceId: existingLink.deviceId,
        suggestedDeviceId: existingLink.deviceId,
        countryISO: existingLink.countryISO || profile.countryISO,
        mdmConfigId: remote.mdmConfigId,
        mdmConfigName: remote.mdmConfigName,
        mdmGroupId: remote.mdmGroupId,
        mdmGroupName: remote.mdmGroupName,
        enrollmentStatus: remote.enrollmentStatus,
        managementState: remote.managementState,
        serialNumber: remote.serialNumber,
        androidVersion: remote.androidVersion,
        androidSdk: remote.androidSdk,
        deviceCapabilities: remote.deviceCapabilities || {},
        lastMdmSeenAt: remote.lastMdmSeenAt ? new Date(remote.lastMdmSeenAt) : null,
        matchStatus: existingLink.linkSource === "auto" ? "auto_linked" : "manually_linked",
        matchConfidence: existingLink.matchConfidence || 100,
        matchReasons: existingLink.matchReasons?.length ? existingLink.matchReasons : ["Existing NeoTree MDM link matched"],
        payload: remote.payload || {},
        lastSeenAt: new Date(),
      })
      const linkedDevice = deviceById.get(existingLink.deviceId)
      if (linkedDevice) {
        await stampLinkedMdmIdentity({
          provider,
          remote,
          device: linkedDevice,
          appState: appStateByDevice.get(linkedDevice.deviceId),
          summary,
        })
      }
      summary.refreshedLinks += 1
      return
    }

    const candidates = deviceRows
      .map((device) => scoreMdmDeviceMatch(remote, device, appStateByDevice.get(device.deviceId)))
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score)
    const best = candidates[0]
    const hasReviewableMatch = Boolean(best && best.score >= reviewMinConfidence)
    const hasConflict = Boolean(hasReviewableMatch && candidates[1] && candidates[1].score === best!.score)
    const canAutoLink = autoLinkEnabled && best && best.score >= minConfidence && !hasConflict
    const matchStatus = canAutoLink
      ? "auto_linked"
      : hasConflict
        ? "conflict"
        : hasReviewableMatch
          ? "needs_review"
          : "unmatched"

    if (canAutoLink && best) {
      const linkResult = await _linkDeviceToMdm({
        deviceId: best.device.deviceId,
        provider: profile.provider,
        profileId: profile.profileId,
        mdmDeviceId,
        mdmConfigId: remote.mdmConfigId || null,
        mdmConfigName: remote.mdmConfigName || null,
        mdmGroupId: remote.mdmGroupId || null,
        mdmGroupName: remote.mdmGroupName || null,
        countryISO: profile.countryISO,
        hospitalId: profile.hospitalId,
        enrollmentStatus: remote.enrollmentStatus,
        managementState: remote.managementState,
        serialNumber: remote.serialNumber || null,
        androidVersion: remote.androidVersion || null,
        deviceCapabilities: remote.deviceCapabilities || {},
        lastMdmSeenAt: remote.lastMdmSeenAt ? new Date(remote.lastMdmSeenAt) : null,
        lastSyncedAt: new Date(),
        lastSyncStatus: "auto_linked",
        lastSyncError: null,
        linkSource: "auto",
        matchConfidence: best.score,
        matchReasons: best.reasons,
        payload: remote.payload || {},
      })
      if (linkResult.success) {
        await stampLinkedMdmIdentity({
          provider,
          remote,
          device: best.device,
          appState: appStateByDevice.get(best.device.deviceId),
          summary,
        })
        summary.autoLinked += 1
        autoLinkedDeviceIds.push(best.device.deviceId)
      }
    } else if (hasConflict) {
      summary.conflicts += 1
    } else if (hasReviewableMatch) {
      summary.needsReview += 1
    } else {
      summary.unmatched += 1
    }

    await _upsertMdmDeviceInventory({
      provider: profile.provider,
      profileId: profile.profileId,
      mdmDeviceId,
      suggestedDeviceId: hasReviewableMatch || canAutoLink ? best?.device.deviceId || null : null,
      linkedDeviceId: canAutoLink ? best?.device.deviceId : null,
      countryISO: profile.countryISO,
      mdmConfigId: remote.mdmConfigId || null,
      mdmConfigName: remote.mdmConfigName || null,
      mdmGroupId: remote.mdmGroupId || null,
      mdmGroupName: remote.mdmGroupName || null,
      enrollmentStatus: remote.enrollmentStatus,
      managementState: remote.managementState,
      serialNumber: remote.serialNumber || null,
      androidVersion: remote.androidVersion || null,
      androidSdk: remote.androidSdk || null,
      deviceCapabilities: remote.deviceCapabilities || {},
      lastMdmSeenAt: remote.lastMdmSeenAt ? new Date(remote.lastMdmSeenAt) : null,
      matchStatus,
      matchConfidence: best?.score || 0,
      matchReasons: best?.reasons || [],
      payload: remote.payload || {},
      lastSeenAt: new Date(),
    })
  }

  // Process remote devices with bounded concurrency instead of one-at-a-time (#13).
  await mapWithConcurrency(
    remoteDevices.filter((remote) => remote.mdmDeviceId),
    8,
    processRemote,
  )

  // Push the managed APK to newly auto-linked devices (#4), best-effort.
  if (autoLinkedDeviceIds.length) {
    await mapWithConcurrency(autoLinkedDeviceIds, 5, async (deviceId) => {
      await requestMdmApkRolloutForDevice(deviceId).catch(() => null)
    })
  }

  await _updateMdmProviderDeviceSyncStatus(profile.profileId, {
    lastDeviceSyncStatus: "synced",
    lastDeviceSyncError: null,
    lastDeviceSyncAt: new Date(),
    lastDeviceSyncSummary: {
      ...summary,
      finishedAt: new Date().toISOString(),
    },
  })

  return summary
}

export async function testDeviceMdmLinkDraft(formData: FormData) {
  try {
    await requireDeviceManagementAdmin()

    const deviceId = `${formData.get("deviceId") || ""}`.trim()
    const mdmDeviceId = `${formData.get("mdmDeviceId") || ""}`.trim()
    const profileId = `${formData.get("profileId") || ""}`.trim()

    if (!deviceId) {
      return { success: false, message: "NeoTree device ID is required.", device: null }
    }
    if (!mdmDeviceId) {
      return { success: false, message: "Headwind device ID is required.", device: null }
    }
    if (!profileId || profileId === "none") {
      return {
        success: true,
        message: "Manual device link ready. No Headwind profile was selected, so NeoTree could not verify this device in MDM.",
        device: {
          mdmDeviceId,
          mdmConfigId: null,
          mdmConfigName: null,
          mdmGroupId: null,
          mdmGroupName: null,
          enrollmentStatus: "unknown",
          managementState: "unknown",
          serialNumber: null,
          androidVersion: null,
          androidSdk: null,
          deviceCapabilities: {},
          payload: {},
        },
      }
    }

    const profile = await _getMdmProviderProfile(profileId)
    if (!profile.data) return { success: false, message: "Selected MDM profile was not found.", device: null }

    const provider = createProviderFromProfile(profile.data)
    const devices = await provider.syncDevices()
    const normalizedMdmDeviceId = mdmDeviceId.toLowerCase()
    const device = devices.find((item) => {
      const payload = item.payload || {}
      return [
        item.mdmDeviceId,
        item.deviceId,
        item.serialNumber,
        payload.id,
        payload.number,
        payload.serial,
        payload.serialNumber,
      ]
        .filter(Boolean)
        .some((value) => `${value}`.toLowerCase() === normalizedMdmDeviceId)
    })

    if (!device) {
      return {
        success: false,
        message: "NeoTree connected to Headwind, but this device ID was not found in the selected profile.",
        device: null,
      }
    }

    return {
      success: true,
      message: "Device found in Headwind. The link is ready to save.",
      device,
    }
  } catch (e: any) {
    logger.error("testDeviceMdmLinkDraft ERROR", e.message)
    return {
      success: false,
      message: e.message || "Could not verify this device in Headwind.",
      device: null,
    }
  }
}

async function saveDeviceMdmLink(formData: FormData) {
  try {
    const session = await requireDeviceManagementAdmin()
    const linkId = `${formData.get("linkId") || ""}` || undefined
    const existing = linkId ? await _getDeviceMdmLink(linkId) : null

    const result = await _linkDeviceToMdm({
      linkId,
      deviceId: `${formData.get("deviceId") || ""}`,
      provider: "headwind",
      profileId: `${formData.get("profileId") || ""}` === "none" ? null : `${formData.get("profileId") || ""}` || null,
      mdmDeviceId: `${formData.get("mdmDeviceId") || ""}`,
      mdmConfigId: `${formData.get("mdmConfigId") || ""}` || null,
      mdmConfigName: `${formData.get("mdmConfigName") || ""}` || null,
      mdmGroupId: `${formData.get("mdmGroupId") || ""}` || null,
      mdmGroupName: `${formData.get("mdmGroupName") || ""}` || null,
      countryISO: `${formData.get("countryISO") || ""}` || null,
      hospitalId: `${formData.get("hospitalId") || ""}` || null,
      enrollmentStatus: `${formData.get("enrollmentStatus") || "enrolled"}` as any,
      managementState: `${formData.get("managementState") || "managed"}` as any,
      serialNumber: `${formData.get("serialNumber") || ""}` || null,
      androidVersion: `${formData.get("androidVersion") || ""}` || null,
      deviceCapabilities: buildDeviceCapabilitiesFromForm(formData),
      lastSyncStatus: `${formData.get("__linkTestStatus") || "manual"}`,
      lastSyncError: `${formData.get("__linkTestError") || ""}` || null,
      linkSource: "manual",
      matchConfidence: `${formData.get("__linkTestStatus") || ""}` === "verified" ? 100 : null,
      matchReasons: `${formData.get("__linkTestStatus") || ""}` === "verified" ? ["User verified against Headwind"] : [],
      lastSyncedAt: new Date(),
    })

    if (!result.success) return { success: false, errors: result.errors || ["Could not save device MDM link"] }
    await writeDeviceManagementAudit({
      actorUserId: session.user?.userId,
      action: linkId ? "device_mdm_link_updated" : "device_mdm_link_created",
      beforeState: existing?.data || {},
      afterState: result.data || {},
      metadata: {
        linkTestStatus: `${formData.get("__linkTestStatus") || "manual"}`,
        saveAnywayReason: `${formData.get("saveAnywayReason") || ""}`.trim() || undefined,
      },
    })
    // Stamp NeoTree identity back into Headwind so this link is deterministic next
    // time, and push the managed APK to the freshly linked device (#4). Both best-effort.
    if (result.data?.deviceId) {
      const profileId = `${formData.get("profileId") || ""}`
      if (profileId && profileId !== "none") {
        const profile = await _getMdmProviderProfile(profileId)
        if (profile.data) {
          await stampMdmIdentityForLink({
            profile: profile.data,
            remote: {
              mdmDeviceId: `${formData.get("mdmDeviceId") || ""}`,
              mdmConfigId: `${formData.get("mdmConfigId") || ""}` || null,
              payload: { number: `${formData.get("mdmDeviceId") || ""}` },
            },
            deviceId: result.data.deviceId,
          }).catch(() => null)
        }
      }
      await requestMdmApkRolloutForDevice(result.data.deviceId).catch(() => null)
    }
    revalidatePath("/device-management")
    return { success: true, data: result.data }
  } catch (e: any) {
    if (`${e?.digest || ""}`.startsWith("NEXT_REDIRECT")) throw e
    logger.error("saveDeviceMdmLink ERROR", e.message)
    return { success: false, errors: [e.message || "Could not save device MDM link"] }
  }
}

export async function linkDeviceToMdmDraft(formData: FormData) {
  return saveDeviceMdmLink(formData)
}

export async function linkDeviceToMdmFromForm(formData: FormData) {
  const result = await saveDeviceMdmLink(formData)

  if (!result.success) {
    formErrorRedirect(formData, result.errors?.[0] || "Could not save device MDM link")
  }

  redirect("/device-management?section=devices")
}

export async function syncMdmProfileDevicesFromForm(formData: FormData) {
  try {
    const session = await requireDeviceManagementAdmin()
    const profileId = `${formData.get("profileId") || ""}`
    const profile = await _getMdmProviderProfile(profileId)
    if (!profile.data) formErrorRedirect(formData, "MDM profile not found")

    const summary = await reconcileMdmProfileDevices(profile.data!)

    await _updateMdmProviderConnectionStatus(profileId, {
      lastConnectionStatus: "connected",
      lastConnectionError: null,
      lastConnectionCheckedAt: new Date(),
    })

    await writeDeviceManagementAudit({
      actorUserId: session.user?.userId,
      action: "mdm_profile_devices_synced",
      beforeState: { profileId },
      afterState: { profileId, ...summary },
      metadata: {
        reason: `${formData.get("reason") || ""}`.trim() || undefined,
      },
    })

    revalidatePath("/device-management")
  } catch (e: any) {
    if (`${e?.digest || ""}`.startsWith("NEXT_REDIRECT")) throw e
    logger.error("syncMdmProfileDevicesFromForm ERROR", e.message)
    const profileId = `${formData.get("profileId") || ""}`
    if (profileId) {
      await _updateMdmProviderDeviceSyncStatus(profileId, {
        lastDeviceSyncStatus: "failed",
        lastDeviceSyncError: e.message || "Could not sync Headwind devices",
        lastDeviceSyncAt: new Date(),
        lastDeviceSyncSummary: {
          success: false,
          error: e.message || "Could not sync Headwind devices",
          finishedAt: new Date().toISOString(),
        },
      })
      await _updateMdmProviderConnectionStatus(profileId, {
        lastConnectionStatus: "failed",
        lastConnectionError: e.message || "Could not sync Headwind devices",
        lastConnectionCheckedAt: new Date(),
      })
    }
    formErrorRedirect(formData, e.message || "Could not sync Headwind devices")
  }

  redirect("/device-management?section=profiles")
}

export async function syncMdmProfileDevicesReport(profileId: string, reason?: string) {
  try {
    const session = await requireDeviceManagementAdmin()
    const profile = await _getMdmProviderProfile(profileId)
    if (!profile.data) throw new Error("MDM profile not found")

    const summary = await reconcileMdmProfileDevices(profile.data)

    await _updateMdmProviderConnectionStatus(profileId, {
      lastConnectionStatus: "connected",
      lastConnectionError: null,
      lastConnectionCheckedAt: new Date(),
    })

    await writeDeviceManagementAudit({
      actorUserId: session.user?.userId,
      action: "mdm_profile_devices_synced",
      beforeState: { profileId },
      afterState: { profileId, ...summary },
      metadata: {
        reason: reason?.trim() || undefined,
      },
    })

    revalidatePath("/device-management")

    return {
      success: true,
      profileId,
      profileName: profile.data.name,
      summary,
      errors: [] as string[],
    }
  } catch (e: any) {
    logger.error("syncMdmProfileDevicesReport ERROR", e.message)
    if (profileId) {
      await _updateMdmProviderDeviceSyncStatus(profileId, {
        lastDeviceSyncStatus: "failed",
        lastDeviceSyncError: e.message || "Could not sync Headwind devices",
        lastDeviceSyncAt: new Date(),
        lastDeviceSyncSummary: {
          success: false,
          error: e.message || "Could not sync Headwind devices",
          finishedAt: new Date().toISOString(),
        },
      })
      await _updateMdmProviderConnectionStatus(profileId, {
        lastConnectionStatus: "failed",
        lastConnectionError: e.message || "Could not sync Headwind devices",
        lastConnectionCheckedAt: new Date(),
      })
    }

    return {
      success: false,
      profileId,
      profileName: "",
      summary: null,
      errors: [e.message || "Could not sync Headwind devices"],
    }
  }
}

export async function syncAllEnabledMdmProfilesFromForm(formData: FormData) {
  try {
    const session = await requireDeviceManagementAdmin()
    const results = await syncEnabledMdmProfilesForAutomation()

    await writeDeviceManagementAudit({
      actorUserId: session.user?.userId,
      action: "mdm_all_profiles_auto_sync_requested",
      afterState: { profiles: results },
      metadata: {
        reason: `${formData.get("reason") || ""}`.trim() || undefined,
      },
    })

    revalidatePath("/device-management")
  } catch (e: any) {
    if (`${e?.digest || ""}`.startsWith("NEXT_REDIRECT")) throw e
    logger.error("syncAllEnabledMdmProfilesFromForm ERROR", e.message)
    formErrorRedirect(formData, e.message || "Could not sync MDM profiles")
  }

  redirect("/device-management?section=review")
}

export async function syncAllEnabledMdmProfilesReport(reason?: string) {
  try {
    const session = await requireDeviceManagementAdmin()
    const results = await syncEnabledMdmProfilesForAutomation()

    await writeDeviceManagementAudit({
      actorUserId: session.user?.userId,
      action: "mdm_all_profiles_auto_sync_requested",
      afterState: { profiles: results },
      metadata: {
        reason: reason?.trim() || undefined,
      },
    })

    revalidatePath("/device-management")

    return { success: results.every((result) => result.success), results, errors: [] as string[] }
  } catch (e: any) {
    logger.error("syncAllEnabledMdmProfilesReport ERROR", e.message)
    return { success: false, results: [], errors: [e.message || "Could not sync MDM profiles"] }
  }
}

export async function syncEnabledMdmProfilesForAutomation() {
  const profiles = await _getMdmProviderProfiles({ includeDisabled: false })
  const enabledProfiles = (profiles.data || []).filter((profile) => profile.autoSyncEnabled !== false)
  const results = []

  for (const profile of enabledProfiles) {
    try {
      const summary = await reconcileMdmProfileDevices(profile)
      results.push({ profileId: profile.profileId, name: profile.name, success: true, ...summary })
    } catch (e: any) {
      await _updateMdmProviderDeviceSyncStatus(profile.profileId, {
        lastDeviceSyncStatus: "failed",
        lastDeviceSyncError: e.message || "Could not sync Headwind devices",
        lastDeviceSyncAt: new Date(),
        lastDeviceSyncSummary: {
          success: false,
          error: e.message || "Could not sync Headwind devices",
          finishedAt: new Date().toISOString(),
        },
      })
      results.push({ profileId: profile.profileId, name: profile.name, success: false, error: e.message })
    }
  }

  await writeDeviceManagementAudit({
    action: "mdm_all_profiles_auto_synced",
    afterState: { profiles: results },
    metadata: { source: "automation" },
  })

  revalidatePath("/device-management")
  return results
}

export async function reviewMdmInventoryFromForm(formData: FormData) {
  try {
    const session = await requireDeviceManagementAdmin()
    const inventoryId = `${formData.get("inventoryId") || ""}`
    const reviewAction = `${formData.get("reviewAction") || ""}`
    const reason = `${formData.get("reason") || ""}`.trim()

    if (!reason) formErrorRedirect(formData, "Reason is required")

    const inventory = await _getMdmDeviceInventoryById(inventoryId)
    if (!inventory.data) formErrorRedirect(formData, "MDM inventory row was not found")

    if (reviewAction === "ignore") {
      const result = await _updateMdmDeviceInventoryReview(inventoryId, {
        matchStatus: "ignored",
        reviewNote: reason,
        ignoredAt: new Date(),
        reviewedAt: new Date(),
        reviewedByUserId: session.user?.userId,
      })
      await writeDeviceManagementAudit({
        actorUserId: session.user?.userId,
        action: "mdm_inventory_ignored",
        beforeState: inventory.data,
        afterState: result.data || {},
        metadata: { reason },
      })
      revalidatePath("/device-management")
      redirect("/device-management?section=review")
    }

    if (reviewAction !== "approve") formErrorRedirect(formData, "Unsupported review action")

    const targetDeviceId = `${formData.get("deviceId") || inventory.data.suggestedDeviceId || ""}`.trim()
    if (!targetDeviceId) formErrorRedirect(formData, "Select a NeoTree device before approving this link")

    const linkResult = await _linkDeviceToMdm({
      deviceId: targetDeviceId,
      provider: inventory.data.provider,
      profileId: inventory.data.profileId,
      mdmDeviceId: inventory.data.mdmDeviceId,
      mdmConfigId: inventory.data.mdmConfigId,
      mdmConfigName: inventory.data.mdmConfigName,
      mdmGroupId: inventory.data.mdmGroupId,
      mdmGroupName: inventory.data.mdmGroupName,
      countryISO: inventory.data.countryISO || inventory.data.profile?.countryISO,
      hospitalId: inventory.data.profile?.hospitalId,
      enrollmentStatus: inventory.data.enrollmentStatus,
      managementState: inventory.data.managementState,
      serialNumber: inventory.data.serialNumber,
      androidVersion: inventory.data.androidVersion,
      deviceCapabilities: inventory.data.deviceCapabilities || {},
      lastMdmSeenAt: inventory.data.lastMdmSeenAt,
      lastSyncedAt: new Date(),
      lastSyncStatus: "review_approved",
      lastSyncError: null,
      linkSource: "review",
      matchConfidence: inventory.data.matchConfidence,
      matchReasons: inventory.data.matchReasons || [],
      payload: inventory.data.payload || {},
    })
    if (!linkResult.success) formErrorRedirect(formData, linkResult.errors?.[0] || "Could not approve MDM device link")

    const reviewResult = await _updateMdmDeviceInventoryReview(inventoryId, {
      matchStatus: "manually_linked",
      linkedDeviceId: targetDeviceId,
      suggestedDeviceId: targetDeviceId,
      reviewNote: reason,
      reviewedAt: new Date(),
      reviewedByUserId: session.user?.userId,
    })

    await writeDeviceManagementAudit({
      actorUserId: session.user?.userId,
      action: "mdm_inventory_link_approved",
      beforeState: inventory.data,
      afterState: { inventory: reviewResult.data, link: linkResult.data },
      metadata: { reason },
    })

    // Stamp NeoTree identity back into Headwind so this approved link becomes
    // deterministic, then push the managed APK (#4). Both best-effort.
    if (inventory.data.profile) {
      await stampMdmIdentityForLink({
        profile: inventory.data.profile,
        remote: {
          mdmDeviceId: inventory.data.mdmDeviceId,
          mdmConfigId: inventory.data.mdmConfigId,
          payload: inventory.data.payload || {},
          deviceCapabilities: inventory.data.deviceCapabilities || {},
        },
        deviceId: targetDeviceId,
      }).catch(() => null)
    }
    await requestMdmApkRolloutForDevice(targetDeviceId).catch(() => null)

    revalidatePath("/device-management")
  } catch (e: any) {
    if (`${e?.digest || ""}`.startsWith("NEXT_REDIRECT")) throw e
    logger.error("reviewMdmInventoryFromForm ERROR", e.message)
    formErrorRedirect(formData, e.message || "Could not review MDM inventory row")
  }

  redirect("/device-management?section=review")
}

export async function runDeviceMdmRemoteActionFromForm(formData: FormData) {
  let action: MdmDeviceCommandToken | null = null
  try {
    const session = await requireDeviceManagementAdmin()
    const linkId = `${formData.get("linkId") || ""}`
    const submittedAction = `${formData.get("action") || ""}`
    const reason = `${formData.get("reason") || ""}`.trim()
    const password = `${formData.get("password") || ""}`

    if (!reason) throw new Error("Reason is required")
    if (!isMdmDeviceCommandToken(submittedAction)) throw new Error("Unsupported remote action")
    action = submittedAction

    const link = await _getDeviceMdmLink(linkId)
    if (!link.data) throw new Error("Device MDM link not found")
    if (!link.data.profile) throw new Error("Device is not linked to an MDM profile")
    if (link.data.profile.isEnabled === false) throw new Error("This MDM profile is disabled")

    // The Headwind "Reboot, lock, reset" plugin keys on the INTERNAL device id
    // (Device.id), not the device number, so resolve that from the synced
    // capabilities. Fall back to the stored mdmDeviceId only if the internal id was
    // never captured (older link → prompt a re-sync).
    const caps = (link.data.deviceCapabilities || {}) as Record<string, any>
    const headwindId = `${caps?.identifiers?.headwindId ?? caps?.mdm?.headwindId ?? caps?.mdm?.deviceId ?? ""}`.trim()
    const targetId = headwindId || `${link.data.mdmDeviceId || ""}`.trim()
    if (!targetId) throw new Error("Headwind device id is missing; re-sync the profile first")

    // Default-deny capability gating: the action is only allowed when the profile
    // explicitly enables it (factory reset / reboot / password reset are opt-in).
    const capabilityKey = MDM_COMMAND_CAPABILITY[action]
    const capabilities = (link.data.profile.providerCapabilities || {}) as Record<string, any>
    if (!capabilities[capabilityKey]) {
      throw new Error(`This action is not enabled for the device's MDM profile`)
    }

    const provider = createProviderFromProfile(link.data.profile)
    const result =
      action === "lock" ? await provider.lockDevice(targetId, reason)
      : action === "unlock" ? await provider.unlockDevice(targetId, reason)
      : action === "wipe" ? await provider.wipeDevice(targetId, reason)
      : action === "reboot" ? await provider.rebootDevice(targetId, reason)
      : await provider.resetPassword(targetId, password || null)

    await writeDeviceManagementAudit({
      actorUserId: session.user?.userId,
      action: MDM_COMMAND_AUDIT_ACTION[action],
      beforeState: link.data,
      afterState: {
        success: result.success,
        providerActionId: result.providerActionId || null,
        providerStatus: result.providerStatus || null,
        message: result.message || null,
        state: result.state || null,
      },
      // Never store the password itself — only whether one was provided.
      metadata: { reason, passwordProvided: action === "resetPassword" ? !!password : undefined },
    })

    if (!result.success) {
      logger.error("runDeviceMdmRemoteActionFromForm PROVIDER ERROR", JSON.stringify({
        action,
        linkId,
        providerStatus: result.providerStatus || null,
        message: result.message || null,
      }))
      return {
        success: false as const,
        action,
        errors: [result.message || `Headwind ${action} failed`],
        result,
      }
    }

    revalidatePath("/device-management")
    return { success: true as const, action, errors: [], result }
  } catch (e: any) {
    logger.error("runDeviceMdmRemoteActionFromForm ERROR", JSON.stringify({
      action,
      message: e?.message || "Could not run remote device action",
    }))
    return {
      success: false as const,
      action,
      errors: [e?.message || "Could not run remote device action"],
      result: null,
    }
  }
}

export async function requestDeviceMdmApkRolloutFromForm(formData: FormData) {
  try {
    const session = await requireDeviceManagementAdmin()
    const linkId = `${formData.get("linkId") || ""}`
    const reason = `${formData.get("reason") || ""}`.trim()

    if (!reason) formErrorRedirect(formData, "Reason is required")

    const link = await _getDeviceMdmLink(linkId)
    if (!link.data) formErrorRedirect(formData, "Device MDM link not found")
    if (!link.data.mdmDeviceId || link.data.managementState !== "managed") {
      formErrorRedirect(formData, "Device must be managed by MDM before an APK can be pushed")
    }

    const result = await requestMdmApkRolloutForDevice(link.data.deviceId)

    await writeDeviceManagementAudit({
      actorUserId: session.user?.userId,
      action: "device_mdm_apk_push_requested",
      beforeState: link.data,
      afterState: result,
      metadata: { reason },
    })

    if (result.failed > 0 || result.errors.length > 0 || result.requested === 0) {
      formErrorRedirect(formData, result.errors[0] || "No eligible MDM APK rollout was found for this device")
    }

    revalidatePath("/device-management")
    revalidatePath("/app-updates")
    revalidatePath("/app-updates/ota")
  } catch (e: any) {
    if (`${e?.digest || ""}`.startsWith("NEXT_REDIRECT")) throw e
    logger.error("requestDeviceMdmApkRolloutFromForm ERROR", e.message)
    formErrorRedirect(formData, e.message || "Could not request MDM APK push")
  }

  redirect("/device-management?section=devices")
}

export async function unlinkDeviceFromMdmFromForm(formData: FormData) {
  try {
    const session = await requireDeviceManagementAdmin()
    const linkId = `${formData.get("linkId") || ""}`
    const existing = linkId ? await _getDeviceMdmLink(linkId) : null
    const result = await _unlinkDeviceFromMdm(linkId)
    if (!result.success) formErrorRedirect(formData, result.errors?.[0] || "Could not unlink device")
    await writeDeviceManagementAudit({
      actorUserId: session.user?.userId,
      action: "device_mdm_link_unlinked",
      beforeState: existing?.data || {},
      afterState: result.data || {},
      metadata: {
        reason: `${formData.get("reason") || ""}`.trim() || undefined,
      },
    })
    revalidatePath("/device-management")
  } catch (e: any) {
    if (`${e?.digest || ""}`.startsWith("NEXT_REDIRECT")) throw e
    logger.error("unlinkDeviceFromMdmFromForm ERROR", e.message)
    formErrorRedirect(formData, e.message || "Could not unlink device")
  }

  redirect("/device-management?section=devices")
}
