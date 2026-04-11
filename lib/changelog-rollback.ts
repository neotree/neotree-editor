import { createHash } from "crypto"

export const DEFAULT_RELEASE_ROLLBACK_CREATED_ENTITY_POLICY = "soft_delete" as const
export const RELEASE_ROLLBACK_MAX_RECENT_DEPTH = 5 as const
export const SCRIPT_CHILD_ENTITY_TYPES = ["screen", "diagnosis", "problem"] as const

type RollbackCandidate = {
  entityId: string
  entityType: string
  scriptId?: string | null
  dataVersion?: number | null
}

export function normalizePublishedRollbackVersion(version?: number | null): number | null {
  const numericVersion = Number.isFinite(version) ? Number(version) : null
  if (numericVersion === null) return null
  return numericVersion > 0 ? numericVersion : null
}

export function getReleaseRollbackDepth(params: {
  currentDataVersion: number
  targetDataVersion: number
}): number {
  return params.currentDataVersion - params.targetDataVersion
}

export function isReleaseRollbackWithinRecentWindow(params: {
  currentDataVersion: number
  targetDataVersion: number
  maxDepth?: number
}): boolean {
  const depth = getReleaseRollbackDepth(params)
  const maxDepth = Number.isFinite(params.maxDepth) ? Number(params.maxDepth) : RELEASE_ROLLBACK_MAX_RECENT_DEPTH
  return depth >= 1 && depth <= maxDepth
}

export function getRollbackParentVersion(targetVersion: number): number {
  return targetVersion
}

export function getRollbackAppliedEntityVersion(rollbackChangeLogVersion: number): number {
  return rollbackChangeLogVersion
}

export function getNextRollbackDataVersion(params: {
  editorDataVersion?: number | null
  currentDataVersion?: number | null
}): number {
  const editorDataVersion = Number.isFinite(params.editorDataVersion) ? Number(params.editorDataVersion) : null
  const currentDataVersion = Number.isFinite(params.currentDataVersion) ? Number(params.currentDataVersion) : null

  return Math.max(editorDataVersion ?? 0, currentDataVersion ?? 0) + 1
}

export function isChangeAlreadyAlignedToRollbackTarget(params: {
  currentDataVersion?: number | null
  targetDataVersion?: number | null
}): boolean {
  const currentDataVersion = Number.isFinite(params.currentDataVersion) ? Number(params.currentDataVersion) : null
  const targetDataVersion = Number.isFinite(params.targetDataVersion) ? Number(params.targetDataVersion) : null

  if (currentDataVersion === null || targetDataVersion === null) return false
  return currentDataVersion <= targetDataVersion
}

export function shouldIncludeEntityInReleaseRollback(params: {
  currentDataVersion?: number | null
  restoreSourceDataVersion?: number | null
}): boolean {
  const currentDataVersion = Number.isFinite(params.currentDataVersion) ? Number(params.currentDataVersion) : null
  const restoreSourceDataVersion = Number.isFinite(params.restoreSourceDataVersion)
    ? Number(params.restoreSourceDataVersion)
    : null

  if (currentDataVersion === null || restoreSourceDataVersion === null) return false
  return currentDataVersion > restoreSourceDataVersion
}

export function partitionReleaseRollbackCandidates<T extends RollbackCandidate>(params: {
  changes: T[]
  restoreSourceDataVersion: number
}) {
  const rollbackCandidates = params.changes.filter((change) =>
    shouldIncludeEntityInReleaseRollback({
      currentDataVersion: change.dataVersion,
      restoreSourceDataVersion: params.restoreSourceDataVersion,
    }),
  )

  const scriptIds = new Set(
    rollbackCandidates.filter((change) => change.entityType === "script").map((change) => change.entityId),
  )

  const scriptChanges = rollbackCandidates.filter((change) => change.entityType === "script")
  const standaloneChanges = rollbackCandidates.filter((change) => {
    if (change.entityType === "script") return false
    if (!(SCRIPT_CHILD_ENTITY_TYPES as readonly string[]).includes(change.entityType)) return true
    if (!change.scriptId) return true
    return !scriptIds.has(change.scriptId)
  })

  return {
    rollbackCandidates,
    scriptChanges,
    standaloneChanges,
  }
}

export function computeRollbackSnapshotHash(snapshot: any) {
  return createHash("sha256").update(JSON.stringify(snapshot ?? {})).digest("hex")
}

export function coerceRollbackSnapshotValues(
  payload: Record<string, any>,
  options: {
    numericKeys?: string[]
    timestampKeys?: string[]
    forceNullKeys?: string[]
  } = {},
) {
  const nextPayload = { ...payload }
  const temporalPattern = /(_at|_on|_date|_time|Date$|Time$)/i
  const dateLikeKeys = Object.keys(nextPayload).filter((key) => temporalPattern.test(key))

  for (const key of dateLikeKeys) {
    const value = nextPayload[key]
    if (value instanceof Date) continue
    if (value && (typeof value === "string" || typeof value === "number")) {
      const coerced = new Date(value)
      if (!isNaN(coerced.valueOf())) {
        nextPayload[key] = coerced
        continue
      }
    }

    nextPayload[key] = null
  }

  for (const key of options.numericKeys ?? []) {
    if (!(key in nextPayload)) continue
    const value = nextPayload[key]
    const num = typeof value === "number" ? value : Number(value)
    nextPayload[key] = Number.isFinite(num) ? num : null
  }

  for (const key of options.timestampKeys ?? []) {
    if (!(key in nextPayload)) continue
    const value = nextPayload[key]
    if (value instanceof Date) continue
    if (value && (typeof value === "string" || typeof value === "number")) {
      const coerced = new Date(value)
      if (!isNaN(coerced.valueOf())) {
        nextPayload[key] = coerced
        continue
      }
    }
    nextPayload[key] = null
  }

  for (const key of options.forceNullKeys ?? []) {
    if (key in nextPayload) nextPayload[key] = null
  }

  return nextPayload
}

export function wasCreatedInCurrentDataVersion(params: {
  currentVersion: number
  directPreviousPublishedVersion?: number | null
  fallbackPreviousVersion?: number | null
}): boolean {
  const directPreviousPublishedVersion = normalizePublishedRollbackVersion(params.directPreviousPublishedVersion)
  const fallbackPreviousVersion = normalizePublishedRollbackVersion(params.fallbackPreviousVersion)

  if (directPreviousPublishedVersion !== null) return false
  if (fallbackPreviousVersion === null) return true

  return fallbackPreviousVersion === params.currentVersion
}

export function getRollbackSourceVersion(changes: any): number | null {
  const entries = Array.isArray(changes) ? changes : []

  const toDataVersion = entries.find((entry) => Number.isFinite(entry?.toDataVersion))?.toDataVersion
  if (Number.isFinite(toDataVersion)) return Number(toDataVersion)

  const legacyToDataVersion = entries.find((entry) => Number.isFinite(entry?.to_data_version))?.to_data_version
  if (Number.isFinite(legacyToDataVersion)) return Number(legacyToDataVersion)

  const toVersion = entries.find((entry) => Number.isFinite(entry?.toVersion))?.toVersion
  if (Number.isFinite(toVersion)) return Number(toVersion)

  const legacyToVersion = entries.find((entry) => Number.isFinite(entry?.to_version))?.to_version
  if (Number.isFinite(legacyToVersion)) return Number(legacyToVersion)

  return null
}
