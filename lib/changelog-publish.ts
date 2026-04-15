export function buildDeleteChangeSnapshots<T>(params: {
  previousEntity?: T | null
  deletedFields?: Record<string, any>
  sanitize?: <U>(value: U) => U
}) {
  const baseEntity = { ...(params.previousEntity ?? {}) }
  const mergedFullSnapshot = { ...baseEntity, ...(params.deletedFields ?? {}) }

  if (params.sanitize) {
    return {
      previousSnapshot: params.sanitize(baseEntity),
      fullSnapshot: params.sanitize(mergedFullSnapshot),
    }
  }

  return {
    previousSnapshot: JSON.parse(JSON.stringify(baseEntity)),
    fullSnapshot: JSON.parse(JSON.stringify(mergedFullSnapshot)),
  }
}

export function getRollbackButtonTargetVersion(params: {
  action?: string | null
  parentVersion?: number | null
  mergedFromVersion?: number | null
}) {
  if (params.action === "rollback") {
    return params.mergedFromVersion ?? params.parentVersion ?? null
  }

  return params.parentVersion ?? null
}
