function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

function hasValue(value: unknown) {
  if (value === null || value === undefined) return false
  if (typeof value === "string") return value.trim().length > 0
  return true
}

export function isHeadwindApplicationRow(item: unknown) {
  if (!isRecord(item)) return false

  return [
    item.pkg,
    item.packageId,
    item.packageName,
    item.package,
    item.applicationId,
    item.applicationVersionId,
    item.applicationName,
    item.latestVersion,
    item.version,
    item.versionCode,
    item.url,
    item.icon,
    item.showIcon,
    item.system,
    item.runAfterInstall,
  ].some(hasValue)
}

export function isHeadwindDeviceRow(item: unknown) {
  if (!isRecord(item)) return false
  if (isHeadwindApplicationRow(item)) return false

  const info = isRecord(item.info) ? item.info : {}
  const hasConfigurationIdentity = hasValue(item.configurationId) || hasValue(item.configId)
  const hasDeviceIdentity = [
    item.number,
    item.deviceId,
    item.neotreeDeviceId,
    item.customDeviceId,
    item.lastUpdate,
    item.lastSeen,
    item.lastLogin,
    item.statusCode,
    item.imei,
    item.serial,
    item.serialNumber,
    item.phone,
    item.publicIp,
    item.launcherVersion,
    item.mdmMode,
    item.kioskMode,
    item.enrollTime,
    item.androidVersion,
    info.deviceId,
    info.serial,
    info.serialNumber,
  ].some(hasValue)

  return hasDeviceIdentity || (hasConfigurationIdentity && hasValue(item.id))
}
