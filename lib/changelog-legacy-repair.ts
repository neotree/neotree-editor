import { computeRollbackSnapshotHash, shouldAutoRepairLegacySnapshotHash } from "@/lib/changelog-rollback"

export type LegacySnapshotHashStatus = "healthy" | "missing" | "stale" | "strict_mismatch"

export type LegacyChangeLogAnalysis = {
  hashStatus: LegacySnapshotHashStatus
  computedHash: string
  canAutoRepairHash: boolean
  fullSnapshotMissingManagedFields: string[]
  previousSnapshotMissingManagedFields: string[]
}

function getMissingManagedFields(snapshot: unknown, managedKeys: string[]) {
  if (!managedKeys.length) return []
  const source = snapshot && typeof snapshot === "object" ? (snapshot as Record<string, unknown>) : {}

  return managedKeys.filter((key) => {
    if (!Object.prototype.hasOwnProperty.call(source, key)) return true
    return source[key] === null || source[key] === undefined
  })
}

export function analyzeLegacyChangeLog(params: {
  change: {
    snapshotHash?: string | null
    fullSnapshot: unknown
    previousSnapshot?: unknown
    dateOfChange?: Date | string | null
  }
  managedSnapshotKeys?: string[]
}) {
  const managedSnapshotKeys = params.managedSnapshotKeys ?? []
  const computedHash = computeRollbackSnapshotHash(params.change.fullSnapshot)
  const eligibleForLegacyRepair = shouldAutoRepairLegacySnapshotHash(params.change)
  const hashStatus: LegacySnapshotHashStatus =
    !params.change.snapshotHash
      ? "missing"
      : params.change.snapshotHash === computedHash
        ? "healthy"
        : eligibleForLegacyRepair
          ? "stale"
          : "strict_mismatch"

  const canAutoRepairHash = hashStatus === "missing" || hashStatus === "stale"

  return {
    hashStatus,
    computedHash,
    canAutoRepairHash,
    fullSnapshotMissingManagedFields: getMissingManagedFields(params.change.fullSnapshot, managedSnapshotKeys),
    previousSnapshotMissingManagedFields: getMissingManagedFields(params.change.previousSnapshot, managedSnapshotKeys),
  } satisfies LegacyChangeLogAnalysis
}
