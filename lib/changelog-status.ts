import type { ChangeLogType } from "@/databases/queries/changelogs/_get-change-logs"

export type ChangeLifecycleState = "active" | "inactive" | "superseded"

export type ChangeLifecycleStatus = {
  label: string
  state: ChangeLifecycleState
  reason?: string
}

export function getChangeLifecycleStatus(change: ChangeLogType): ChangeLifecycleStatus {
  const snapshot = (change.fullSnapshot || {}) as Record<string, any>

  const deletedAtValue =
    snapshot?.deletedAt ??
    snapshot?.deleted_at ??
    snapshot?.data?.deletedAt ??
    snapshot?.data?.deleted_at ??
    null

  const wasExplicitlyDeleted =
    change.action === "delete" ||
    Boolean(deletedAtValue) ||
    snapshot?.isDeleted === true ||
    snapshot?.status === "inactive"

  if (wasExplicitlyDeleted) {
    return {
      label: "Inactive",
      state: "inactive",
      reason: "deleted",
    }
  }

  if (change.isActive) {
    return {
      label: "Active",
      state: "active",
    }
  }

  return {
    label: "Superseded",
    state: "superseded",
    reason: "newer-version",
  }
}
