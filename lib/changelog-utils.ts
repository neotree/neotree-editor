import type { ChangeLogType } from "@/databases/queries/changelogs/_get-change-logs"

export type NormalizedChange = {
  field: string
  previousValue: unknown
  newValue: unknown
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

function normalizeComparableValue(value: unknown): unknown {
  if (value === null || value === undefined) return null
  if (typeof value === "string" && value.trim() === "") return null
  return value
}

function areEquivalentValues(a: unknown, b: unknown): boolean {
  const normalizedA = normalizeComparableValue(a)
  const normalizedB = normalizeComparableValue(b)
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

        if (!areEquivalentValues(previousValue, newValue)) {
          normalized.push({
            field,
            previousValue,
            newValue,
          })
        }
      } else {
        if (!areEquivalentValues(undefined, item)) {
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
      if (!areEquivalentValues(previousValue, newValue)) {
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
        if (!areEquivalentValues(undefined, value)) {
          normalized.push({
            field,
            previousValue: undefined,
            newValue: value,
          })
        }
      }
    }
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
