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

export function getRollbackParentVersion(previousChangeLogVersion: number): number {
  return previousChangeLogVersion
}

export function getRollbackTargetVersion(params: {
  action?: string | null
  parentVersion?: number | null
  mergedFromVersion?: number | null
}) {
  if (Number.isFinite(params.parentVersion)) return Number(params.parentVersion)
  if (Number.isFinite(params.mergedFromVersion)) return Number(params.mergedFromVersion)
  return null
}

export function getRollbackAppliedEntityVersion(rollbackChangeLogVersion: number): number {
  return rollbackChangeLogVersion
}

export function getPublishedEntityVersion(params: {
  currentVersion?: number | null
  isCreate?: boolean
}): number {
  const currentVersion = Number.isFinite(params.currentVersion) ? Number(params.currentVersion) : 1
  return currentVersion + 1
}

export function applySoftDeleteRollbackSideEffects(params: {
  entityType: string
  entityId: string
  snapshot: Record<string, any>
}) {
  const snapshot: Record<string, any> = { ...params.snapshot, deletedAt: new Date().toISOString() }

  if (params.entityType === "drugs_library") {
    const baseKey = typeof snapshot.key === "string" ? snapshot.key : ""
    snapshot.key = [baseKey, params.entityId].filter(Boolean).join("_")
  }

  if (params.entityType === "data_key") {
    const baseUniqueKey = typeof snapshot.uniqueKey === "string" ? snapshot.uniqueKey : ""
    const baseUuid = typeof snapshot.uuid === "string" ? snapshot.uuid : params.entityId
    snapshot.uniqueKey = [baseUniqueKey, baseUuid].filter(Boolean).join("_")
  }

  return snapshot
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

function normalizeSnapshotValueForHash(snapshot: any): any {
  if (snapshot instanceof Date) return snapshot.toISOString()

  if (Array.isArray(snapshot)) {
    return snapshot.map((value) => {
      if (value === undefined || typeof value === "function" || typeof value === "symbol") return null
      return normalizeSnapshotValueForHash(value)
    })
  }

  if (snapshot && typeof snapshot === "object") {
    return Object.keys(snapshot)
      .sort()
      .reduce<Record<string, any>>((acc, key) => {
        const value = snapshot[key]
        if (value === undefined || typeof value === "function" || typeof value === "symbol") return acc
        acc[key] = normalizeSnapshotValueForHash(value)
        return acc
      }, {})
  }

  if (typeof snapshot === "number" && !Number.isFinite(snapshot)) return null
  if (typeof snapshot === "bigint") return snapshot.toString()
  return snapshot
}

export function computeRollbackSnapshotHash(snapshot: any) {
  const normalizedSnapshot = normalizeSnapshotValueForHash(snapshot ?? {})
  return createHash("sha256").update(JSON.stringify(normalizedSnapshot)).digest("hex")
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
