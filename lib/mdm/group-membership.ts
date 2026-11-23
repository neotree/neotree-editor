type GroupAwareDevice = {
  mdmGroupId?: string | null
  deviceCapabilities?: unknown
}

function normalizeGroupId(value: unknown) {
  return `${value || ""}`.trim().toLowerCase()
}

export function getMdmGroupIds(device: GroupAwareDevice) {
  const capabilities = (device.deviceCapabilities || {}) as Record<string, any>
  const groups = (capabilities.groups || {}) as Record<string, any>
  const memberships = Array.isArray(groups.memberships) ? groups.memberships : []

  return Array.from(new Set([
    device.mdmGroupId,
    ...(Array.isArray(groups.ids) ? groups.ids : []),
    ...memberships.map((group: any) => group?.id),
  ].map(normalizeGroupId).filter(Boolean)))
}

export function deviceBelongsToMdmGroup(device: GroupAwareDevice, targetGroupId?: string | null) {
  const target = normalizeGroupId(targetGroupId)
  return !!target && getMdmGroupIds(device).includes(target)
}
