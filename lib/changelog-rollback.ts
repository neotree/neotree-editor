import { createHash } from "crypto"

export const DEFAULT_RELEASE_ROLLBACK_CREATED_ENTITY_POLICY = "soft_delete" as const
export const RELEASE_ROLLBACK_MAX_RECENT_DEPTH = 5 as const
export const SCRIPT_CHILD_ENTITY_TYPES = ["screen", "diagnosis", "problem"] as const

// Rows written before this date may carry hashes produced by the legacy writer, which
// hashed raw JSON.stringify(snapshot) (insertion-order keys, no normalization). Those can
// never match the canonical hash — jsonb also re-orders keys — so they are auto-repaired
// instead of blocking rollbacks. The default is the day after the last known legacy row
// (2026-05-21); environments whose legacy writer ran longer can override it without a
// deploy via CHANGELOG_HASH_STRICT_AT. Rows after the cutoff are enforced strictly.
const DEFAULT_SNAPSHOT_HASH_STRICT_ENFORCEMENT_AT = "2026-05-22T00:00:00.000Z"

function resolveStrictEnforcementDate(): Date {
  const raw = process.env.CHANGELOG_HASH_STRICT_AT
  if (raw) {
    const parsed = new Date(raw)
    if (!Number.isNaN(parsed.valueOf())) return parsed
  }
  return new Date(DEFAULT_SNAPSHOT_HASH_STRICT_ENFORCEMENT_AT)
}

export const SNAPSHOT_HASH_STRICT_ENFORCEMENT_AT = resolveStrictEnforcementDate()

// --- Rollback target age policy ---
// Rollbacks are an operational undo, not a time machine: targets older than this window
// can no longer be restored. Child entities (screens, diagnoses, problems) change rarely
// and mostly move with their script, so they alone may restore an older version, capped
// at a shallow depth.
export const ROLLBACK_MAX_TARGET_AGE_DAYS = 31 as const
export const STALE_CHILD_ROLLBACK_MAX_DEPTH = 5 as const

// Absolute floor: releases published before this date are never restorable ("clean slate"
// baseline). Overridable per environment via CHANGELOG_ROLLBACK_FLOOR_AT.
const DEFAULT_ROLLBACK_CLEAN_SLATE_FLOOR = "2026-07-01T00:00:00.000Z"

function resolveCleanSlateFloor(): Date {
  const raw = process.env.CHANGELOG_ROLLBACK_FLOOR_AT
  if (raw) {
    const parsed = new Date(raw)
    if (!Number.isNaN(parsed.valueOf())) return parsed
  }
  return new Date(DEFAULT_ROLLBACK_CLEAN_SLATE_FLOOR)
}

export const ROLLBACK_CLEAN_SLATE_FLOOR_AT = resolveCleanSlateFloor()

function toValidDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.valueOf()) ? null : date
}

export function isRollbackTargetOlderThanMaxAge(params: {
  targetDate?: Date | string | null
  now?: Date
  maxAgeDays?: number
}): boolean {
  const target = toValidDate(params.targetDate)
  // A target without a usable date cannot be verified against the window — treat as too old
  if (!target) return true
  const now = params.now ?? new Date()
  const maxAgeDays = Number.isFinite(params.maxAgeDays) ? Number(params.maxAgeDays) : ROLLBACK_MAX_TARGET_AGE_DAYS
  return now.valueOf() - target.valueOf() > maxAgeDays * 24 * 60 * 60 * 1000
}

export type RollbackPolicyResult = { allowed: true } | { allowed: false; reason: string }

export function evaluateEntityRollbackTargetPolicy(params: {
  entityType: string
  currentVersion?: number | null
  targetVersion?: number | null
  targetDate?: Date | string | null
  now?: Date
}): RollbackPolicyResult {
  if (!isRollbackTargetOlderThanMaxAge({ targetDate: params.targetDate, now: params.now })) {
    return { allowed: true }
  }

  const isChildEntity = (SCRIPT_CHILD_ENTITY_TYPES as readonly string[]).includes(params.entityType)
  if (isChildEntity) {
    const currentVersion = Number(params.currentVersion)
    const targetVersion = Number(params.targetVersion)
    const depth = currentVersion - targetVersion
    if (Number.isFinite(depth) && depth >= 1 && depth <= STALE_CHILD_ROLLBACK_MAX_DEPTH) {
      return { allowed: true }
    }
    return {
      allowed: false,
      reason:
        `This version is older than ${ROLLBACK_MAX_TARGET_AGE_DAYS} days. ` +
        `A ${params.entityType.replace("_", " ")} can only be restored up to ${STALE_CHILD_ROLLBACK_MAX_DEPTH} versions back once it is that old.`,
    }
  }

  return {
    allowed: false,
    reason:
      `Rollback targets older than ${ROLLBACK_MAX_TARGET_AGE_DAYS} days can no longer be restored for this item. ` +
      `Make the change manually in the editor instead.`,
  }
}

export function evaluateReleaseRollbackTargetPolicy(params: {
  targetDataVersion: number
  targetPublishedAt?: Date | string | null
  now?: Date
}): RollbackPolicyResult {
  const publishedAt = toValidDate(params.targetPublishedAt)
  if (!publishedAt) {
    return {
      allowed: false,
      reason: `Release v${params.targetDataVersion} has no publish date recorded, so it cannot be restored.`,
    }
  }

  if (publishedAt < ROLLBACK_CLEAN_SLATE_FLOOR_AT) {
    return {
      allowed: false,
      reason:
        `Release v${params.targetDataVersion} was published before ${ROLLBACK_CLEAN_SLATE_FLOOR_AT.toISOString().slice(0, 10)} ` +
        `and cannot be restored. Rollback starts from a clean slate after that date.`,
    }
  }

  if (isRollbackTargetOlderThanMaxAge({ targetDate: publishedAt, now: params.now })) {
    return {
      allowed: false,
      reason: `Rollback is limited to releases published within the last ${ROLLBACK_MAX_TARGET_AGE_DAYS} days.`,
    }
  }

  return { allowed: true }
}

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
  const currentVersion = Number.isFinite(params.currentVersion) ? Number(params.currentVersion) : null

  if (params.isCreate) {
    // A brand-new entity keeps the version its draft was staged at (1 for fresh drafts);
    // bumping here would desync the entity row from the changelog chain's create entry.
    return currentVersion && currentVersion > 0 ? currentVersion : 1
  }

  return (currentVersion ?? 1) + 1
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

export function shouldAutoRepairLegacySnapshotHash(change: {
  dateOfChange?: Date | string | null
  snapshotHash?: string | null
}) {
  if (!change.snapshotHash) return true

  if (!change.dateOfChange) return true

  const changedAt =
    change.dateOfChange instanceof Date ? change.dateOfChange : new Date(change.dateOfChange)

  if (Number.isNaN(changedAt.valueOf())) return true

  return changedAt < SNAPSHOT_HASH_STRICT_ENFORCEMENT_AT
}

export function coerceRollbackSnapshotValues(
  payload: Record<string, any>,
  options: {
    numericKeys?: string[]
    timestampKeys?: string[]
    forceNullKeys?: string[]
  } = {},
) {
  // Only keys explicitly listed by the caller are coerced. Pattern-matching key names
  // here previously nulled out text fields that merely looked temporal.
  const nextPayload = { ...payload }

  for (const key of options.numericKeys ?? []) {
    if (!(key in nextPayload)) continue
    const value = nextPayload[key]
    if (value === null || value === undefined || value === "") {
      nextPayload[key] = null
      continue
    }
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

// The release (data) version whose state a rollback restored. Only data-version fields
// qualify: entity rollback rows carry `toVersion`, which is the item's own version and
// must never be presented to users as a release number.
export function getRollbackSourceVersion(changes: any): number | null {
  const entries = Array.isArray(changes) ? changes : []

  const toDataVersion = entries.find((entry) => Number.isFinite(entry?.toDataVersion))?.toDataVersion
  if (Number.isFinite(toDataVersion)) return Number(toDataVersion)

  const legacyToDataVersion = entries.find((entry) => Number.isFinite(entry?.to_data_version))?.to_data_version
  if (Number.isFinite(legacyToDataVersion)) return Number(legacyToDataVersion)

  const rollbackSourceDataVersion = entries.find((entry) => Number.isFinite(entry?.rollbackSourceDataVersion))
    ?.rollbackSourceDataVersion
  if (Number.isFinite(rollbackSourceDataVersion)) return Number(rollbackSourceDataVersion)

  return null
}

export type EntityRollbackSummary = {
  entityType: string
  entityId: string | null
  targetVersion: number | null
}

// Identifies a release that was published by rolling back a single entity (and its
// dependents), from the release publish entry's recorded changes. `targetVersion` is the
// item's own version — distinct from any release number.
export function getEntityRollbackSummary(changes: any): EntityRollbackSummary | null {
  const entries = Array.isArray(changes) ? changes : []
  const entry = entries.find((candidate) => typeof candidate?.rolledBackEntityType === "string" && candidate.rolledBackEntityType)
  if (!entry) return null

  return {
    entityType: entry.rolledBackEntityType,
    entityId: typeof entry.rolledBackEntityId === "string" ? entry.rolledBackEntityId : null,
    targetVersion: Number.isFinite(entry.rollbackTargetVersion) ? Number(entry.rollbackTargetVersion) : null,
  }
}
