function normalizeVersion(value?: number | null): number | null {
  if (typeof value !== "number") return null
  if (!Number.isFinite(value)) return null
  return value
}

export function inferParentVersion(currentVersion?: number | null, previousVersion?: number | null): number | null {
  const normalizedPrevious = normalizeVersion(previousVersion)
  if (normalizedPrevious && normalizedPrevious > 0) {
    return normalizedPrevious
  }

  const normalizedCurrent = normalizeVersion(currentVersion)
  if (normalizedCurrent && normalizedCurrent > 1) {
    return normalizedCurrent - 1
  }

  return null
}
