import { and, desc, eq } from "drizzle-orm"

import db from "@/databases/pg/drizzle"
import { appUpdatePolicies, apkReleases, deviceAppStates, deviceMdmLinks, deviceRolloutStates, mdmProviderProfiles } from "@/databases/pg/schema"
import { createMdmProvider } from "@/lib/mdm"
import { decryptSecret } from "@/lib/server/secret-box"
import { getAppUrl } from "@/lib/urls"
import { createApkDownloadToken } from "@/lib/app-updates/download-token"
import logger from "@/lib/logger"

type Policy = typeof appUpdatePolicies.$inferSelect
type Link = typeof deviceMdmLinks.$inferSelect
type Release = typeof apkReleases.$inferSelect

function getServiceAuthSettings(settings?: Record<string, any> | null) {
  return (settings?.serviceAuth || {}) as {
    username?: string | null
    passwordEncrypted?: string | null
  }
}

function createProviderFromProfile(profile: typeof mdmProviderProfiles.$inferSelect) {
  const settings = (profile.settings || {}) as Record<string, any>
  const serviceAuth = getServiceAuthSettings(settings)

  return createMdmProvider({
    profileId: profile.profileId,
    provider: profile.provider,
    baseUrl: profile.baseUrl,
    apiKey: decryptSecret(profile.apiKey),
    username: serviceAuth.username,
    password: decryptSecret(serviceAuth.passwordEncrypted),
    settings,
  })
}

function policyMatchesLink(policy: Policy, link: Link) {
  if (policy.targetScope === "group") return !!policy.targetGroupId && policy.targetGroupId === link.mdmGroupId
  if (policy.targetScope === "hospital") return !!policy.targetHospitalId && policy.targetHospitalId === link.hospitalId
  return true
}

function buildDownloadUrl(release: Release) {
  // #9 — release-scoped, expiring token instead of the global MDM secret in the URL.
  const token = createApkDownloadToken(release.apkReleaseId)
  return getAppUrl(`/api/mdm/apk-releases/${release.apkReleaseId}/download?token=${encodeURIComponent(token)}`)
}

async function pushReleaseToLink(link: Link & { profile?: typeof mdmProviderProfiles.$inferSelect | null }, release: Release, policy: Policy) {
  const profile = link.profile
  if (!profile || !link.mdmDeviceId) return { success: false, message: "Device is not linked to an MDM profile" }

  const provider = createProviderFromProfile(profile)
  const result = await provider.pushApk(link.mdmDeviceId, {
    apkReleaseId: release.apkReleaseId,
    downloadUrl: buildDownloadUrl(release),
  })

  await db
    .insert(deviceRolloutStates)
    .values({
      deviceId: link.deviceId,
      apkReleaseId: release.apkReleaseId,
      countryISO: link.countryISO,
      deliveryMode: policy.apkDeliveryMode,
      rolloutState: result.success ? "mdm_push_requested" : "failed",
      mdmPushRequestedAt: result.success ? new Date() : null,
      lastErrorCode: result.success ? null : "mdm_push_failed",
      lastErrorMessage: result.success ? null : result.message || "MDM push failed",
    })
    .onConflictDoUpdate({
      target: [deviceRolloutStates.deviceId, deviceRolloutStates.apkReleaseId],
      set: {
        countryISO: link.countryISO,
        deliveryMode: policy.apkDeliveryMode,
        rolloutState: result.success ? "mdm_push_requested" : "failed",
        mdmPushRequestedAt: result.success ? new Date() : null,
        lastErrorCode: result.success ? null : "mdm_push_failed",
        lastErrorMessage: result.success ? null : result.message || "MDM push failed",
        updatedAt: new Date(),
      },
    })

  return result
}

async function getAvailableRelease(apkReleaseId: string | null): Promise<Release | null> {
  if (!apkReleaseId) return null
  const release = await db.query.apkReleases.findFirst({ where: eq(apkReleases.apkReleaseId, apkReleaseId) })
  if (!release?.isAvailable || release.status !== "available") return null
  return release
}

export async function requestMdmApkRolloutForPolicy(policy: Policy) {
  if (!policy.currentApkReleaseId) {
    return { requested: 0, failed: 0, skipped: 0, errors: ["Policy has no current APK release"] }
  }
  if (!process.env.NEXTAUTH_SECRET) {
    return { requested: 0, failed: 0, skipped: 0, errors: ["NEXTAUTH_SECRET is required for MDM APK delivery"] }
  }
  if (!["mdm", "hybrid"].includes(policy.apkDeliveryMode)) {
    return { requested: 0, failed: 0, skipped: 0, errors: [] }
  }

  const release = await getAvailableRelease(policy.currentApkReleaseId)
  if (!release) {
    return { requested: 0, failed: 0, skipped: 0, errors: ["Current APK release is not available"] }
  }

  const links = await db.query.deviceMdmLinks.findMany({
    where: and(eq(deviceMdmLinks.provider, "headwind"), eq(deviceMdmLinks.managementState, "managed")),
    with: { profile: true },
  })
  const eligibleLinks = links.filter((link) => link.profile && link.mdmDeviceId && policyMatchesLink(policy, link))

  let requested = 0
  let failed = 0
  let skipped = links.length - eligibleLinks.length
  const errors: string[] = []

  for (const link of eligibleLinks) {
    const result = await pushReleaseToLink(link, release, policy)
    if (result.success) {
      requested += 1
    } else {
      failed += 1
      errors.push(`${link.deviceId}: ${result.message || "MDM push failed"}`)
    }
  }

  return { requested, failed, skipped, errors }
}

/**
 * #4 — Push the applicable managed APK to a single device when it links/enrolls,
 * so devices that come online after a policy was published still receive it
 * without waiting for the next publish.
 */
export async function requestMdmApkRolloutForDevice(deviceId: string) {
  if (!deviceId) return { requested: 0, failed: 0, skipped: 0, errors: ["Missing deviceId"] }
  if (!process.env.NEXTAUTH_SECRET) return { requested: 0, failed: 0, skipped: 1, errors: [] }

  try {
    const link = await db.query.deviceMdmLinks.findFirst({
      where: and(eq(deviceMdmLinks.deviceId, deviceId), eq(deviceMdmLinks.provider, "headwind")),
      with: { profile: true },
    })
    if (!link || link.managementState !== "managed" || !link.mdmDeviceId || !link.profile) {
      return { requested: 0, failed: 0, skipped: 1, errors: [] }
    }

    // Prefer a policy matching the device's known runtime; fall back to the
    // newest mdm/hybrid policy this device is targeted by.
    const appState = await db.query.deviceAppStates.findFirst({ where: eq(deviceAppStates.deviceId, deviceId) })

    const policies = await db.query.appUpdatePolicies.findMany({
      orderBy: [desc(appUpdatePolicies.policyVersion), desc(appUpdatePolicies.updatedAt)],
    })
    const candidate = policies.find((policy) =>
      ["mdm", "hybrid"].includes(policy.apkDeliveryMode) &&
      policy.currentApkReleaseId &&
      policyMatchesLink(policy, link) &&
      (!appState?.runtimeVersion || policy.runtimeVersion === appState.runtimeVersion),
    ) || policies.find((policy) =>
      ["mdm", "hybrid"].includes(policy.apkDeliveryMode) &&
      policy.currentApkReleaseId &&
      policyMatchesLink(policy, link),
    )

    if (!candidate) return { requested: 0, failed: 0, skipped: 1, errors: [] }

    const release = await getAvailableRelease(candidate.currentApkReleaseId)
    if (!release) return { requested: 0, failed: 0, skipped: 1, errors: [] }

    const result = await pushReleaseToLink(link, release, candidate)
    return result.success
      ? { requested: 1, failed: 0, skipped: 0, errors: [] }
      : { requested: 0, failed: 1, skipped: 0, errors: [`${deviceId}: ${result.message || "MDM push failed"}`] }
  } catch (e: any) {
    logger.error("requestMdmApkRolloutForDevice ERROR", e.message)
    return { requested: 0, failed: 1, skipped: 0, errors: [e.message] }
  }
}
