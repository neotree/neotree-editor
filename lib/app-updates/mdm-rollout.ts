import { and, eq } from "drizzle-orm"

import db from "@/databases/pg/drizzle"
import { appUpdatePolicies, apkReleases, deviceMdmLinks, deviceRolloutStates, mdmProviderProfiles } from "@/databases/pg/schema"
import { createMdmProvider } from "@/lib/mdm"
import { decryptSecret } from "@/lib/server/secret-box"
import { getAppUrl } from "@/lib/urls"

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

function policyMatchesLink(
  policy: typeof appUpdatePolicies.$inferSelect,
  link: typeof deviceMdmLinks.$inferSelect,
) {
  if (policy.targetScope === "group") return !!policy.targetGroupId && policy.targetGroupId === link.mdmGroupId
  if (policy.targetScope === "hospital") return !!policy.targetHospitalId && policy.targetHospitalId === link.hospitalId
  return true
}

export async function requestMdmApkRolloutForPolicy(policy: typeof appUpdatePolicies.$inferSelect) {
  if (!policy.currentApkReleaseId) {
    return { requested: 0, failed: 0, skipped: 0, errors: ["Policy has no current APK release"] }
  }
  if (!process.env.MDM_SYNC_SECRET) {
    return { requested: 0, failed: 0, skipped: 0, errors: ["MDM_SYNC_SECRET is required for MDM APK delivery"] }
  }
  if (!["mdm", "hybrid"].includes(policy.apkDeliveryMode)) {
    return { requested: 0, failed: 0, skipped: 0, errors: [] }
  }

  const release = await db.query.apkReleases.findFirst({
    where: eq(apkReleases.apkReleaseId, policy.currentApkReleaseId),
  })
  if (!release?.isAvailable || release.status !== "available") {
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
    if (!link.profile || !link.mdmDeviceId) {
      skipped += 1
      continue
    }

    const provider = createProviderFromProfile(link.profile)
    const downloadUrl = getAppUrl(`/api/mdm/apk-releases/${release.apkReleaseId}/download?token=${encodeURIComponent(process.env.MDM_SYNC_SECRET)}`)
    const result = await provider.pushApk(link.mdmDeviceId, {
      apkReleaseId: release.apkReleaseId,
      downloadUrl,
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

    if (result.success) {
      requested += 1
    } else {
      failed += 1
      errors.push(`${link.deviceId}: ${result.message || "MDM push failed"}`)
    }
  }

  return { requested, failed, skipped, errors }
}
