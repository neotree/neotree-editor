function normalizeScope(value: unknown) {
  return `${value || ""}`.trim().toLowerCase()
}

function uniqueScopes(values: unknown[]) {
  return Array.from(new Set(values.map(normalizeScope).filter(Boolean)))
}

export function getProfileConfigurationScopes(settingsValue?: unknown) {
  const settings = (settingsValue || {}) as Record<string, any>
  return uniqueScopes([
    settings.syncConfigurationId,
    settings.syncConfigurationName,
    ...(Array.isArray(settings.syncConfigurationIds) ? settings.syncConfigurationIds : []),
    ...(Array.isArray(settings.syncConfigurationNames) ? settings.syncConfigurationNames : []),
  ])
}

export function remoteDeviceMatchesProfileScope(
  remote: { mdmConfigId?: string | null; mdmConfigName?: string | null; payload?: Record<string, any> },
  scopes: string[],
) {
  if (!scopes.length) return true
  const payload = remote.payload || {}
  const config = (payload.configuration || payload.config || {}) as Record<string, any>
  const values = uniqueScopes([
    remote.mdmConfigId,
    remote.mdmConfigName,
    payload.configurationId,
    payload.configId,
    payload.configurationName,
    payload.configName,
    config.id,
    config.name,
  ])
  return values.some((value) => scopes.includes(value))
}
