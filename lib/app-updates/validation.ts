const apkReleaseStatuses = new Set([
  "uploaded",
  "validated",
  "approved",
  "available",
  "deprecated",
  "revoked",
  "rolled_back",
])

const installWindows = new Set(["on_restart", "idle", "immediate"])
const sha256Pattern = /^[a-f0-9]{64}$/i

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
  apkInstallWindow?: string | null
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
  }
}

export function normalizeAppUpdatePolicyPayload<T extends Record<string, any>>(payload: T): T {
  return {
    ...payload,
    runtimeVersion: `${payload.runtimeVersion || ""}`.trim(),
    otaChannel: `${payload.otaChannel || "production"}`.trim(),
    apkInstallWindow: `${payload.apkInstallWindow || "on_restart"}`.trim(),
    apkMessageTitle: `${payload.apkMessageTitle || ""}`.trim(),
    apkMessageBody: `${payload.apkMessageBody || ""}`.trim(),
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
  if (policy.apkGracePeriodHours != null && (!Number.isInteger(policy.apkGracePeriodHours) || policy.apkGracePeriodHours < 0)) {
    errors.push("APK grace period must be a non-negative whole number")
  }
  if (policy.apkInstallWindow && !installWindows.has(policy.apkInstallWindow)) {
    errors.push(`Invalid APK install window: ${policy.apkInstallWindow}`)
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
