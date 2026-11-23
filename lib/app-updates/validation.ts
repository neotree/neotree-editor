const apkReleaseStatuses = new Set([
  "uploaded",
  "validated",
  "approved",
  "available",
  "deprecated",
  "revoked",
  "rolled_back",
])

import { clampPercentage } from "./rollout-canary"

const installWindows = new Set(["on_restart", "idle", "immediate"])
const deliveryModes = new Set(["in_app", "mdm", "hybrid", "manual"])

const toPositiveInt = (value: unknown, fallback: number) => {
  const n = Math.round(Number(value))
  return Number.isFinite(n) && n >= 1 ? n : fallback
}
export const appUpdateChannels = [
  { value: "demo", label: "Demo" },
  { value: "stage", label: "Stage" },
  { value: "prod", label: "Prod" },
] as const

const appUpdateChannelValues = new Set(appUpdateChannels.map((channel) => channel.value))
const sha256Pattern = /^[a-f0-9]{64}$/i

export function normalizeNullableDate(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  return null
}

export type ReleaseReadinessCheck = {
  key: string
  label: string
  passed: boolean
}

type ApkReleaseLike = {
  apkReleaseId?: string | null
  runtimeVersion?: string | null
  versionName?: string | null
  versionCode?: number | null
  status?: string | null
  isAvailable?: boolean | null
  fileId?: string | null
  fileSize?: number | null
  checksumSha256?: string | null
  signatureSha256?: string | null
}

type PolicyLike = {
  runtimeVersion?: string | null
  otaChannel?: string | null
  apkGracePeriodHours?: number | null
  apkDeliveryMode?: string | null
  apkInstallWindow?: string | null
  apkRolloutPercentage?: number | null
  apkAutoHaltThresholdPercent?: number | null
  apkAutoHaltMinDevices?: number | null
  apkHealthCheckHours?: number | null
  targetScope?: string | null
  targetGroupId?: string | null
  targetHospitalId?: string | null
  targetCountryISO?: string | null
  currentApkReleaseId?: string | null
  rollbackApkReleaseId?: string | null
}

export function normalizeApkReleasePayload<T extends Record<string, any>>(payload: T): T {
  return {
    ...payload,
    runtimeVersion: `${payload.runtimeVersion || ""}`.trim(),
    versionName: `${payload.versionName || ""}`.trim(),
    status: `${payload.status || "uploaded"}`.trim(),
    releaseNotes: `${payload.releaseNotes || ""}`,
    checksumSha256: payload.checksumSha256 ? `${payload.checksumSha256}`.trim().toLowerCase() : null,
    signatureSha256: payload.signatureSha256 ? `${payload.signatureSha256}`.trim().toLowerCase() : null,
    fileId: payload.fileId || null,
    fileSize: payload.fileSize ?? null,
    isAvailable: !!payload.isAvailable,
    validatedAt: normalizeNullableDate(payload.validatedAt),
    approvedAt: normalizeNullableDate(payload.approvedAt),
    releasedAt: normalizeNullableDate(payload.releasedAt),
  }
}

export function sanitizeApkReleaseWritePayload<T extends Record<string, any>>(payload: T): T {
  const normalized = normalizeApkReleasePayload(payload)
  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    deletedAt: _deletedAt,
    ...writePayload
  } = normalized as any

  return writePayload as T
}

export function normalizeAppUpdateChannel(value?: string | null) {
  const channel = `${value || "prod"}`.trim().toLowerCase()
  if (channel === "production") return "prod"
  return channel
}

export function normalizeAppUpdatePolicyPayload<T extends Record<string, any>>(payload: T): T {
  return {
    ...payload,
    runtimeVersion: `${payload.runtimeVersion || ""}`.trim(),
    otaChannel: normalizeAppUpdateChannel(payload.otaChannel),
    apkDeliveryMode: `${payload.apkDeliveryMode || "in_app"}`.trim(),
    apkInstallWindow: `${payload.apkInstallWindow || "on_restart"}`.trim(),
    apkForceAfter: normalizeNullableDate(payload.apkForceAfter),
    apkMessageTitle: `${payload.apkMessageTitle || ""}`.trim(),
    apkMessageBody: `${payload.apkMessageBody || ""}`.trim(),
    targetScope: `${payload.targetScope || "country"}`.trim(),
    targetGroupId: payload.targetGroupId || null,
    targetHospitalId: payload.targetHospitalId === "none" ? null : payload.targetHospitalId || null,
    targetCountryISO: payload.targetCountryISO === "none"
      ? null
      : (payload.targetCountryISO ? `${payload.targetCountryISO}`.trim().toUpperCase() : null),
    rollbackEnabled: !!payload.rollbackEnabled,
    apkWifiOnly: !!payload.apkWifiOnly,
    apkRolloutPercentage: clampPercentage(
      payload.apkRolloutPercentage == null ? 100 : payload.apkRolloutPercentage,
    ),
    apkRolloutHalted: !!payload.apkRolloutHalted,
    apkRolloutHaltedReason: payload.apkRolloutHaltedReason
      ? `${payload.apkRolloutHaltedReason}`.trim()
      : null,
    apkHealthCheckHours: toPositiveInt(payload.apkHealthCheckHours, 24),
    apkAutoHaltThresholdPercent: clampPercentage(
      payload.apkAutoHaltThresholdPercent == null ? 25 : payload.apkAutoHaltThresholdPercent,
    ),
    apkAutoHaltMinDevices: toPositiveInt(payload.apkAutoHaltMinDevices, 5),
    currentApkReleaseId: payload.currentApkReleaseId || null,
    rollbackApkReleaseId: payload.rollbackApkReleaseId || null,
  }
}

export function getApkReleaseReadiness(release: ApkReleaseLike): ReleaseReadinessCheck[] {
  return [
    {
      key: "version",
      label: "Version and runtime are set",
      passed: !!release.runtimeVersion && !!release.versionName && Number.isInteger(release.versionCode) && Number(release.versionCode) > 0,
    },
    {
      key: "file",
      label: "APK file is attached",
      passed: !!release.fileId && Number(release.fileSize || 0) > 0,
    },
    {
      key: "checksum",
      label: "SHA-256 checksum is captured",
      passed: !!release.checksumSha256 && sha256Pattern.test(release.checksumSha256),
    },
    {
      key: "signature",
      label: "APK signing certificate SHA-256 is captured",
      passed: !!release.signatureSha256 && sha256Pattern.test(release.signatureSha256),
    },
    {
      key: "status",
      label: "Release is marked available",
      passed: release.status === "available" && release.isAvailable === true,
    },
  ]
}

export function isApkReleaseDeviceAvailable(release?: ApkReleaseLike | null) {
  if (!release) return false
  return getApkReleaseReadiness(release).every((check) => check.passed)
}

export function validateApkReleasePayload(release: ApkReleaseLike, opts?: {
  requireDeviceReady?: boolean
  fileContentType?: string | null
  fileName?: string | null
}) {
  const errors: string[] = []

  if (!release.runtimeVersion) errors.push("Runtime version is required")
  if (!release.versionName) errors.push("Version name is required")
  if (!Number.isInteger(release.versionCode) || Number(release.versionCode) <= 0) {
    errors.push("Version code must be a positive integer")
  }
  if (!release.status || !apkReleaseStatuses.has(release.status)) {
    errors.push(`Invalid APK release status: ${release.status || "blank"}`)
  }

  const shouldCheckFileType = !!release.fileId && (!!opts?.fileContentType || !!opts?.fileName)
  const hasApkFile =
    !shouldCheckFileType ||
    opts?.fileContentType === "application/vnd.android.package-archive" ||
    !!opts?.fileName?.toLowerCase().endsWith(".apk")

  if (!hasApkFile) errors.push("Attached file must be an APK")
  if (release.checksumSha256 && !sha256Pattern.test(release.checksumSha256)) errors.push("Checksum must be a SHA-256 hex digest")
  if (release.signatureSha256 && !sha256Pattern.test(release.signatureSha256)) errors.push("Signature must be a SHA-256 hex digest")

  if (release.isAvailable && release.status !== "available") {
    errors.push("Only releases with status 'available' can be available to devices")
  }
  if (release.status === "available" && !release.isAvailable) {
    errors.push("A release with status 'available' must be available to devices")
  }

  if (opts?.requireDeviceReady || release.isAvailable || release.status === "available") {
    for (const check of getApkReleaseReadiness(release)) {
      if (!check.passed) errors.push(check.label)
    }
  }

  return errors
}

export function validateAppUpdatePolicyPayload(policy: PolicyLike, releasesById?: Map<string, ApkReleaseLike>) {
  const errors: string[] = []

  if (!policy.runtimeVersion) errors.push("Runtime version is required")
  if (!policy.otaChannel) errors.push("OTA channel is required")
  if (policy.otaChannel && !appUpdateChannelValues.has(normalizeAppUpdateChannel(policy.otaChannel) as any)) {
    errors.push("OTA channel must be Demo, Stage, or Prod")
  }
  if (policy.apkGracePeriodHours != null && (!Number.isInteger(policy.apkGracePeriodHours) || policy.apkGracePeriodHours < 0)) {
    errors.push("APK grace period must be a non-negative whole number")
  }
  if (policy.apkInstallWindow && !installWindows.has(policy.apkInstallWindow)) {
    errors.push(`Invalid APK install window: ${policy.apkInstallWindow}`)
  }
  if (policy.apkDeliveryMode && !deliveryModes.has(policy.apkDeliveryMode)) {
    errors.push(`Invalid APK delivery mode: ${policy.apkDeliveryMode}`)
  }
  if (
    policy.apkRolloutPercentage != null &&
    (!Number.isInteger(policy.apkRolloutPercentage) || policy.apkRolloutPercentage < 0 || policy.apkRolloutPercentage > 100)
  ) {
    errors.push("APK rollout percentage must be a whole number between 0 and 100")
  }
  if (
    policy.apkAutoHaltThresholdPercent != null &&
    (!Number.isInteger(policy.apkAutoHaltThresholdPercent) || policy.apkAutoHaltThresholdPercent < 0 || policy.apkAutoHaltThresholdPercent > 100)
  ) {
    errors.push("APK auto-halt threshold must be a whole number between 0 and 100")
  }
  if (policy.apkAutoHaltMinDevices != null && (!Number.isInteger(policy.apkAutoHaltMinDevices) || policy.apkAutoHaltMinDevices < 1)) {
    errors.push("APK auto-halt minimum devices must be a whole number of at least 1")
  }
  if (policy.apkHealthCheckHours != null && (!Number.isInteger(policy.apkHealthCheckHours) || policy.apkHealthCheckHours < 1)) {
    errors.push("APK health check window must be a whole number of hours of at least 1")
  }
  if (policy.targetScope === "group" && !policy.targetGroupId) {
    errors.push("Select an MDM group for group-targeted rollout")
  }
  if (policy.targetScope === "hospital" && !policy.targetHospitalId) {
    errors.push("Select a hospital for hospital-targeted rollout")
  }

  const validateReferencedRelease = (releaseId: string | null | undefined, label: string) => {
    if (!releaseId || !releasesById) return
    const release = releasesById.get(releaseId)
    if (!release) {
      errors.push(`${label} APK release was not found`)
      return
    }
    if (release.runtimeVersion !== policy.runtimeVersion) {
      errors.push(`${label} APK runtime version must match the policy runtime version`)
    }
    if (!isApkReleaseDeviceAvailable(release)) {
      errors.push(`${label} APK release is not ready for devices`)
    }
  }

  validateReferencedRelease(policy.currentApkReleaseId, "Current")
  validateReferencedRelease(policy.rollbackApkReleaseId, "Rollback")

  if (policy.currentApkReleaseId && policy.rollbackApkReleaseId && policy.currentApkReleaseId === policy.rollbackApkReleaseId) {
    errors.push("Current and rollback APK releases must be different")
  }
  if (policy.currentApkReleaseId && policy.rollbackApkReleaseId && releasesById) {
    const current = releasesById.get(policy.currentApkReleaseId)
    const rollback = releasesById.get(policy.rollbackApkReleaseId)
    if (current && rollback && Number(rollback.versionCode) < Number(current.versionCode)) {
      errors.push("Rollback APK versionCode must be greater than or equal to the current APK versionCode; Android blocks downgrade installs")
    }
  }

  return errors
}
