"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import logger from "@/lib/logger"
import { isAllowed } from "./is-allowed"
import {
  _getDeviceMdmLink,
  _getDeviceManagementOverview,
  _getDeviceMdmLinks,
  _getMdmProviderProfile,
  _getMdmProviderProfiles,
} from "@/databases/queries/device-management"
import {
  _linkDeviceToMdm,
  _saveMdmProviderProfile,
  _unlinkDeviceFromMdm,
} from "@/databases/mutations/device-management"

function formErrorRedirect(formData: FormData, message: string) {
  const returnTo = `${formData.get("returnTo") || "/device-management"}`
  const separator = returnTo.includes("?") ? "&" : "?"
  redirect(`${returnTo}${separator}error=${encodeURIComponent(message)}`)
}

export const getDeviceManagementOverview: typeof _getDeviceManagementOverview = async (...args) => {
  try {
    await isAllowed()
    return await _getDeviceManagementOverview(...args)
  } catch (e: any) {
    logger.error("getDeviceManagementOverview ERROR", e.message)
    return { data: { profiles: [], links: [], devices: [] }, errors: [e.message] }
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

export async function saveMdmProviderProfileFromForm(formData: FormData) {
  let shouldRedirect = false

  try {
    await isAllowed()
    const settingsRaw = `${formData.get("settings") || ""}`.trim()
    let settings = {}
    try {
      settings = settingsRaw ? JSON.parse(settingsRaw) : {}
    } catch {
      formErrorRedirect(formData, "Provider settings must be valid JSON")
    }

    const profileId = `${formData.get("profileId") || ""}` || undefined
    const apiKeyInput = `${formData.get("apiKey") || ""}`.trim()
    const existing = profileId ? await _getMdmProviderProfile(profileId) : null
    const apiKey = apiKeyInput || existing?.data?.apiKey || null

    const result = await _saveMdmProviderProfile({
      profileId,
      name: `${formData.get("name") || ""}`,
      provider: "headwind",
      countryISO: `${formData.get("countryISO") || ""}`,
      hospitalId: `${formData.get("hospitalId") || ""}` || null,
      baseUrl: `${formData.get("baseUrl") || ""}`,
      apiKey,
      defaultKioskPolicy: `${formData.get("defaultKioskPolicy") || ""}` || null,
      settings,
      isEnabled: formData.get("isEnabled") !== "off",
    })

    if (result.success) {
      revalidatePath("/device-management")
      shouldRedirect = true
    } else {
      formErrorRedirect(formData, result.errors?.[0] || "Could not save MDM profile")
    }
  } catch (e: any) {
    if (`${e?.digest || ""}`.startsWith("NEXT_REDIRECT")) throw e
    logger.error("saveMdmProviderProfileFromForm ERROR", e.message)
    formErrorRedirect(formData, e.message || "Could not save MDM profile")
  }

  if (shouldRedirect) redirect("/device-management")
}

export async function linkDeviceToMdmFromForm(formData: FormData) {
  let shouldRedirect = false

  try {
    await isAllowed()
    const result = await _linkDeviceToMdm({
      linkId: `${formData.get("linkId") || ""}` || undefined,
      deviceId: `${formData.get("deviceId") || ""}`,
      provider: "headwind",
      profileId: `${formData.get("profileId") || ""}` || null,
      mdmDeviceId: `${formData.get("mdmDeviceId") || ""}`,
      mdmConfigId: `${formData.get("mdmConfigId") || ""}` || null,
      enrollmentStatus: "enrolled",
      managementState: "managed",
      serialNumber: `${formData.get("serialNumber") || ""}` || null,
      androidVersion: `${formData.get("androidVersion") || ""}` || null,
      lastSyncedAt: new Date(),
    })

    if (result.success) {
      revalidatePath("/device-management")
      shouldRedirect = true
    } else {
      formErrorRedirect(formData, result.errors?.[0] || "Could not save device MDM link")
    }
  } catch (e: any) {
    if (`${e?.digest || ""}`.startsWith("NEXT_REDIRECT")) throw e
    logger.error("linkDeviceToMdmFromForm ERROR", e.message)
    formErrorRedirect(formData, e.message || "Could not save device MDM link")
  }

  if (shouldRedirect) redirect("/device-management")
}

export async function unlinkDeviceFromMdmFromForm(formData: FormData) {
  try {
    await isAllowed()
    const linkId = `${formData.get("linkId") || ""}`
    const result = await _unlinkDeviceFromMdm(linkId)
    if (!result.success) formErrorRedirect(formData, result.errors?.[0] || "Could not unlink device")
    revalidatePath("/device-management")
  } catch (e: any) {
    if (`${e?.digest || ""}`.startsWith("NEXT_REDIRECT")) throw e
    logger.error("unlinkDeviceFromMdmFromForm ERROR", e.message)
    formErrorRedirect(formData, e.message || "Could not unlink device")
  }

  redirect("/device-management?section=devices")
}
