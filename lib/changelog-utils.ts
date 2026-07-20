import type { ChangeLogType } from "@/databases/queries/changelogs/_get-change-logs"

export type NormalizedChange = {
  field: string
  previousValue: unknown
  newValue: unknown
}

// Single source of truth for changelog display labels. Every changelog surface must use
// these maps — per-component copies drifted and dropped entity types (problem, hospital).
export const CHANGELOG_ENTITY_TYPE_LABELS: Record<string, string> = {
  script: "Script",
  screen: "Screen",
  diagnosis: "Diagnosis",
  problem: "Problem",
  config_key: "Config Key",
  drugs_library: "Drugs Library",
  data_key: "Data Key",
  alias: "Alias",
  hospital: "Hospital",
  release: "Release",
}

export function getChangelogEntityTypeLabel(entityType: string): string {
  return CHANGELOG_ENTITY_TYPE_LABELS[entityType] || entityType
}

export const CHANGELOG_ACTION_LABELS: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  publish: "Published",
  restore: "Restored",
  rollback: "Rolled back",
  merge: "Merged",
}

export function getChangelogActionLabel(action: string): string {
  return CHANGELOG_ACTION_LABELS[action] || action
}

export const CHANGELOG_ACTION_BADGE_CLASSES: Record<string, string> = {
  create: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  update: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  delete: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
  publish: "border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-400",
  restore: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  rollback: "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  merge: "border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
}

export const CHANGELOG_DEFAULT_ACTION_BADGE_CLASS = "border-muted bg-muted text-muted-foreground"

export function getChangelogActionBadgeClass(action: string): string {
  return CHANGELOG_ACTION_BADGE_CLASSES[action] || CHANGELOG_DEFAULT_ACTION_BADGE_CLASS
}

// Where in the editor an entity can be opened for editing.
export function getChangelogEntityEditorHref(change: {
  entityType: string
  entityId: string
  scriptId?: string | null
}): string | null {
  if (change.entityType === "script") return `/script/${change.entityId}`
  if (change.entityType === "screen" && change.scriptId) return `/script/${change.scriptId}/screen/${change.entityId}`
  if (change.entityType === "diagnosis" && change.scriptId) return `/script/${change.scriptId}/diagnosis/${change.entityId}`
  if (change.entityType === "problem" && change.scriptId) return `/script/${change.scriptId}/problem/${change.entityId}`
  if (change.entityType === "config_key") return "/configuration"
  if (change.entityType === "drugs_library") return `/drugs-fluids-and-feeds?itemId=${encodeURIComponent(change.entityId)}`
  if (change.entityType === "data_key") return `/data-keys/edit/${encodeURIComponent(change.entityId)}`
  if (change.entityType === "hospital") return `/hospitals?hospitalId=${encodeURIComponent(change.entityId)}`
  return null
}

export function isHistoryRepairChange(change: Pick<ChangeLogType, "description" | "changeReason">) {
  const description = `${change.description || ""} ${change.changeReason || ""}`.toLowerCase()
  return (
    description.includes("history repaired") ||
    description.includes("recovered missing changelog snapshot") ||
    description.includes("auto-rebaselined changelog history") ||
    description.includes("auto-reconciled a single missing changelog version")
  )
}

export function toNumericVersion(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export function getDataVersion(change: ChangeLogType): number | null {
  const dataVersion = toNumericVersion((change as any)?.dataVersion)
  const snapshotDataVersion = toNumericVersion((change?.fullSnapshot as any)?.dataVersion)
  return dataVersion ?? snapshotDataVersion ?? null
}

export function formatChangeValue(value: unknown): string {
  if (value === null || value === undefined) return "Not set"
  if (typeof value === "string") return value.trim().length ? value : "Not set"
  if (typeof value === "number" || typeof value === "boolean") return String(value)

  try {
    return JSON.stringify(value, null, 2)
  } catch (error) {
    return String(value)
  }
}

function isEmptyEquivalentField(field: string): boolean {
  const key = field.split(".").pop() || field
  return ["timerValue", "multiplier", "minValue", "maxValue"].includes(key)
}

function normalizeComparableValue(value: unknown, field: string): unknown {
  if (value === null || value === undefined) return null
  if (typeof value === "string" && value.trim() === "") return null
  if (isEmptyEquivalentField(field) && typeof value === "number" && value === 0) return null
  return value
}

function areEquivalentValues(a: unknown, b: unknown, field: string): boolean {
  const normalizedA = normalizeComparableValue(a, field)
  const normalizedB = normalizeComparableValue(b, field)
  if (normalizedA === null && normalizedB === null) return true
  if (typeof normalizedA !== "object" || typeof normalizedB !== "object") return normalizedA === normalizedB
  try {
    return JSON.stringify(normalizedA) === JSON.stringify(normalizedB)
  } catch {
    return false
  }
}

export function normalizeChanges(change: ChangeLogType): NormalizedChange[] {
  const normalized: NormalizedChange[] = []
  const raw = change.changes

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>
        const field = (record.field as string) || (record.fieldPath as string) || "Unknown field"
        const previousValue =
          "previousValue" in record
            ? record.previousValue
            : "oldValue" in record
              ? (record as any).oldValue
              : undefined
        const newValue =
          "newValue" in record
            ? record.newValue
            : "value" in record
              ? (record as any).value
              : (record as any).updatedValue

        if (!areEquivalentValues(previousValue, newValue, field)) {
          normalized.push({
            field,
            previousValue,
            newValue,
          })
        }
      } else {
        if (!areEquivalentValues(undefined, item, "Unknown field")) {
          normalized.push({
            field: "Unknown field",
            previousValue: undefined,
            newValue: item,
          })
        }
      }
    }
  } else if (raw && typeof raw === "object" && "oldValues" in raw && "newValues" in raw) {
    const { oldValues = [], newValues = [] } = raw as { oldValues?: any[]; newValues?: any[] }
    const max = Math.max(oldValues.length, newValues.length)

    for (let index = 0; index < max; index++) {
      const oldEntry = oldValues[index] || {}
      const newEntry = newValues[index] || {}
      const field = Object.keys({ ...oldEntry, ...newEntry })[0] || `field_${index + 1}`
      const previousValue = oldEntry[field]
      const newValue = newEntry[field]
      if (!areEquivalentValues(previousValue, newValue, field)) {
        normalized.push({
          field,
          previousValue,
          newValue,
        })
      }
    }
  }

  if (!normalized.length && change.action === "create") {
    const snapshot = change.fullSnapshot
    if (snapshot && typeof snapshot === "object") {
      for (const [field, value] of Object.entries(snapshot as Record<string, unknown>)) {
        if (!areEquivalentValues(undefined, value, field)) {
          normalized.push({
            field,
            previousValue: undefined,
            newValue: value,
          })
        }
      }
    }
  }

  if (!normalized.length && isHistoryRepairChange(change)) {
    normalized.push({
      field: "historyRepair",
      previousValue: "Changelog history was incomplete before this publish.",
      newValue: change.changeReason || change.description || "History was repaired from the latest trusted snapshot.",
    })
  }

  return normalized
}

export function resolveEntityTitle(change: ChangeLogType): string {
  const fromChange = (change as any)?.entityTitle || (change as any)?.entityName
  if (typeof fromChange === "string" && fromChange.trim().length) {
    return fromChange.trim()
  }

  const snapshot = (change.fullSnapshot || {}) as Record<string, unknown>
  const candidates = [
    snapshot?.title,
    snapshot?.name,
    snapshot?.label,
    snapshot?.printTitle,
    snapshot?.sectionTitle,
    snapshot?.collectionLabel,
    snapshot?.key,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length) {
      return candidate.trim()
    }
  }

  return `${change.entityType} ${change.entityId}`
}
