import { create as createDiffPatcher, type Delta, type ArrayDelta } from "jsondiffpatch"

import type { NormalizedChange } from "@/lib/changelog-utils"

const OBJECT_ID_KEYS = [
  "fieldId",
  "field_id",
  "fieldID",
  "itemId",
  "item_id",
  "itemID",
  "optionId",
  "option_id",
  "dataKeyId",
  "id",
  "key",
  "value",
  "code",
  "slug",
]

const LABEL_KEYS = ["label", "name", "title", "display", "question", "text", "description", "value", "code"]

const ARRAY_NOUN_HINTS: Record<string, string> = {
  item: "item",
  items: "item",
  option: "option",
  options: "option",
  field: "field",
  fields: "field",
  screen: "screen",
  screens: "screen",
  diagnosis: "diagnosis",
  diagnoses: "diagnosis",
  script: "script",
  scripts: "script",
}

export const CHANGE_GROUP_METADATA = {
  fields: {
    label: "Field Changes",
    description: "Fields, inputs, and their options.",
  },
  screens: {
    label: "Screen Changes",
    description: "Screen level configuration or layout updates.",
  },
  diagnoses: {
    label: "Diagnosis Changes",
    description: "Diagnosis metadata and options.",
  },
  scripts: {
    label: "Script Changes",
    description: "Script logic or metadata.",
  },
  configuration: {
    label: "Configuration",
    description: "Global configuration, aliases, or data keys.",
  },
  other: {
    label: "Other Changes",
    description: "Everything else captured in the log.",
  },
} satisfies Record<string, { label: string; description: string }>

const diffPatcher = createDiffPatcher({
  arrays: {
    detectMove: false,
    includeValueOnMove: false,
  },
  objectHash: (item) => computeObjectHash(item),
})

export type DiffOperationKind = "added" | "removed" | "updated" | "moved"

export type DiffOperation = {
  id: string
  kind: DiffOperationKind
  pathSegments: string[]
  path: string
  label?: string
  previousValue?: unknown
  newValue?: unknown
  textDiff?: string
  targetIndex?: number
}

export type DiffStats = {
  added: number
  removed: number
  updated: number
  moved: number
  total: number
}

export type ChangeGroupKey = keyof typeof CHANGE_GROUP_METADATA

export type FieldChangeInsight = {
  field: string
  fieldLabel: string
  groupKey: ChangeGroupKey
  operations: DiffOperation[]
  stats: DiffStats
  hasDifferences: boolean
  previousValue: unknown
  newValue: unknown
}

export type ChangeGroupSummary = {
  key: ChangeGroupKey
  label: string
  description: string
  stats: DiffStats
  changes: FieldChangeInsight[]
}

export type HighlightEntry = {
  field: string
  fieldLabel: string
  statements: string[]
}

export function buildFieldChangeInsights(
  changes: NormalizedChange[],
  options?: { entityType?: string },
): FieldChangeInsight[] {
  return changes.map((change) => {
    const previous = change.previousValue
    const next = change.newValue
    const delta = diffPatcher.diff(previous as any, next as any)
    const operations = extractOperations(delta, previous, next)
    const stats = summarizeOperations(operations)

    return {
      field: change.field,
      fieldLabel: formatFieldLabel(change.field),
      groupKey: resolveGroupKey(change.field, options?.entityType),
      operations,
      stats,
      hasDifferences: Boolean(delta) && operations.length > 0,
      previousValue: previous,
      newValue: next,
    }
  })
}

export function groupFieldChangeInsights(insights: FieldChangeInsight[]): ChangeGroupSummary[] {
  const order = Object.keys(CHANGE_GROUP_METADATA) as ChangeGroupKey[]
  const grouped = new Map<ChangeGroupKey, FieldChangeInsight[]>()
  for (const key of order) {
    grouped.set(key, [])
  }

  for (const insight of insights) {
    grouped.get(insight.groupKey)?.push(insight)
  }

  return order.map((key) => {
    const changes = grouped.get(key) ?? []
    return {
      key,
      label: CHANGE_GROUP_METADATA[key].label,
      description: CHANGE_GROUP_METADATA[key].description,
      stats: summarizeOperations(changes.flatMap((entry) => entry.operations)),
      changes,
    }
  })
}

export function buildHighlightEntries(insights: FieldChangeInsight[], limit = 5): HighlightEntry[] {
  const entries: HighlightEntry[] = []
  for (const insight of insights) {
    if (!insight.operations.length) continue
    const statements = buildFieldStatements(insight)
    if (!statements.length) continue
    entries.push({
      field: insight.field,
      fieldLabel: insight.fieldLabel,
      statements,
    })
    if (entries.length >= limit) break
  }
  return entries
}

function buildFieldStatements(insight: FieldChangeInsight): string[] {
  const statements: string[] = []
  const added = insight.operations.filter((op) => op.kind === "added")
  const removed = insight.operations.filter((op) => op.kind === "removed")
  const updated = insight.operations.filter((op) => op.kind === "updated")
  const moved = insight.operations.filter((op) => op.kind === "moved")

  if (added.length) {
    const noun = deriveNoun(added)
    const labelList = formatList(added.map((op) => op.label || op.path))
    statements.push(
      `Added ${formatCountWithNoun(added.length, noun)}${labelList ? `: ${labelList}` : ""}`,
    )
  }

  if (removed.length) {
    const noun = deriveNoun(removed)
    const labelList = formatList(removed.map((op) => op.label || op.path))
    statements.push(
      `Removed ${formatCountWithNoun(removed.length, noun)}${labelList ? `: ${labelList}` : ""}`,
    )
  }

  if (updated.length) {
    const noun = deriveNoun(updated)
    const labelList = formatList(updated.map((op) => op.path))
    statements.push(`Updated ${formatCountWithNoun(updated.length, noun)}${labelList ? `: ${labelList}` : ""}`)
  }

  if (moved.length) {
    const noun = deriveNoun(moved)
    const labelList = formatList(moved.map((op) => op.label || op.path))
    statements.push(`Reordered ${formatCountWithNoun(moved.length, noun)}${labelList ? `: ${labelList}` : ""}`)
  }

  return statements.slice(0, 3)
}

function resolveGroupKey(field: string, entityType?: string): ChangeGroupKey {
  const normalizedField = field.toLowerCase()
  if (normalizedField.startsWith("field") || normalizedField.includes("fields.")) return "fields"
  if (normalizedField.startsWith("screen") || normalizedField.includes("screens.")) return "screens"
  if (normalizedField.startsWith("diagnosis") || normalizedField.includes("diagnoses.")) return "diagnoses"
  if (normalizedField.startsWith("script") || normalizedField.includes("scripts.")) return "scripts"
  if (normalizedField.includes("config") || normalizedField.includes("settings")) return "configuration"

  if (entityType) {
    const normalizedType = entityType.toLowerCase()
    if (normalizedType.includes("screen")) return "screens"
    if (normalizedType.includes("diagnosis")) return "diagnoses"
    if (normalizedType.includes("script")) return "scripts"
  }

  return "other"
}

function summarizeOperations(operations: DiffOperation[]): DiffStats {
  const stats: DiffStats = { added: 0, removed: 0, updated: 0, moved: 0, total: 0 }
  for (const op of operations) {
    if (op.kind === "added") stats.added += 1
    else if (op.kind === "removed") stats.removed += 1
    else if (op.kind === "updated") stats.updated += 1
    else if (op.kind === "moved") stats.moved += 1
    stats.total += 1
  }
  return stats
}

function extractOperations(delta: Delta, previous: unknown, next: unknown): DiffOperation[] {
  if (!delta) return []
  const operations: DiffOperation[] = []
  walkDelta(delta, [], previous, next, operations)
  return operations
}

function walkDelta(
  delta: Delta,
  pathSegments: string[],
  previous: unknown,
  next: unknown,
  operations: DiffOperation[],
): void {
  if (!delta) return

  if (Array.isArray(delta)) {
    const op = createOperationFromDelta(delta, pathSegments, previous, next)
    if (op) operations.push(op)
    return
  }

  if (typeof delta === "object" && (delta as ArrayDelta)._t === "a") {
    const arrayDelta = delta as ArrayDelta
    const previousArray = Array.isArray(previous) ? previous : []
    const nextArray = Array.isArray(next) ? next : []

    for (const key of Object.keys(arrayDelta)) {
      if (key === "_t") continue
      const childDelta = arrayDelta[key]
      if (key.startsWith("_")) {
        const index = Number(key.slice(1))
        if (Number.isNaN(index)) continue
        const prevItem = previousArray[index]
        const childPath = [...pathSegments, formatArraySegment(childDelta, prevItem, index)]
        walkDelta(childDelta, childPath, prevItem, undefined, operations)
      } else {
        const index = Number(key)
        if (Number.isNaN(index)) continue
        const prevItem = previousArray[index]
        const nextItem = nextArray[index]
        const childPath = [...pathSegments, formatArraySegment(childDelta, nextItem ?? prevItem, index)]
        walkDelta(childDelta, childPath, prevItem, nextItem, operations)
      }
    }
    return
  }

  if (typeof delta === "object" && delta !== null) {
    for (const [key, childDelta] of Object.entries(delta)) {
      const prevValue = isRecord(previous) ? previous[key] : undefined
      const nextValue = isRecord(next) ? next[key] : undefined
      walkDelta(childDelta, [...pathSegments, key], prevValue, nextValue, operations)
    }
  }
}

function createOperationFromDelta(
  rawDelta: number[] | unknown[],
  pathSegments: string[],
  previous: unknown,
  next: unknown,
): DiffOperation | null {
  const tag = rawDelta[2]
  const path = formatPath(pathSegments)

  if (rawDelta.length === 1) {
    return {
      id: `${path}-added-${operationsCounter++}`,
      kind: "added",
      pathSegments,
      path,
      label: derivePrimaryLabel(next ?? rawDelta[0]),
      previousValue: previous,
      newValue: next ?? rawDelta[0],
    }
  }

  if (rawDelta.length === 2) {
    return {
      id: `${path}-updated-${operationsCounter++}`,
      kind: "updated",
      pathSegments,
      path,
      label: derivePrimaryLabel(next ?? rawDelta[1]),
      previousValue: previous ?? rawDelta[0],
      newValue: next ?? rawDelta[1],
    }
  }

  if (tag === 0) {
    return {
      id: `${path}-removed-${operationsCounter++}`,
      kind: "removed",
      pathSegments,
      path,
      label: derivePrimaryLabel(previous ?? rawDelta[0]),
      previousValue: previous ?? rawDelta[0],
      newValue: undefined,
    }
  }

  if (tag === 2) {
    return {
      id: `${path}-text-${operationsCounter++}`,
      kind: "updated",
      pathSegments,
      path,
      label: derivePrimaryLabel(next),
      previousValue: previous,
      newValue: next,
      textDiff: typeof rawDelta[0] === "string" ? rawDelta[0] : undefined,
    }
  }

  if (tag === 3) {
    return {
      id: `${path}-moved-${operationsCounter++}`,
      kind: "moved",
      pathSegments,
      path,
      label: derivePrimaryLabel(previous),
      previousValue: previous,
      newValue: next,
      targetIndex: typeof rawDelta[1] === "number" ? rawDelta[1] : undefined,
    }
  }

  return null
}

let operationsCounter = 0

function formatFieldLabel(field: string): string {
  if (!field) return "Unnamed field"
  return field
    .replace(/\[(\d+)\]/g, "#$1")
    .split(".")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" › ")
}

function formatArraySegment(delta: Delta, item: unknown, index: number): string {
  const label = derivePrimaryLabel(item) || deriveLabelFromDelta(delta) || `#${index}`
  return `[${label}]`
}

function derivePrimaryLabel(value: unknown): string | undefined {
  if (!value || typeof value !== "object") {
    if (typeof value === "string") return value
    if (typeof value === "number" || typeof value === "boolean") return String(value)
    return undefined
  }

  for (const key of LABEL_KEYS) {
    const candidate = (value as Record<string, unknown>)[key]
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim()
  }

  for (const key of OBJECT_ID_KEYS) {
    const candidate = (value as Record<string, unknown>)[key]
    if (typeof candidate === "string" && candidate.trim()) return `${key}:${candidate}`
    if (typeof candidate === "number" || typeof candidate === "boolean") return `${key}:${candidate}`
  }

  return undefined
}

function deriveLabelFromDelta(delta: Delta): string | undefined {
  if (!Array.isArray(delta)) return undefined
  if (delta.length === 1) {
    return derivePrimaryLabel(delta[0])
  }
  if (delta.length >= 2) {
    return derivePrimaryLabel(delta[1])
  }
  return undefined
}

function formatPath(segments: string[]): string {
  if (!segments.length) return "Value"
  return segments.join(" › ")
}

function computeObjectHash(item: unknown): string | undefined {
  if (!item || typeof item !== "object") return undefined
  for (const key of OBJECT_ID_KEYS) {
    const value = (item as Record<string, unknown>)[key]
    if (value === null || value === undefined) continue
    if (typeof value === "string" && value.trim()) {
      return `${key}:${value.trim()}`
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return `${key}:${value}`
    }
  }
  return undefined
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null
}

function deriveNoun(operations: DiffOperation[]): string {
  for (const operation of operations) {
    for (const segment of operation.pathSegments) {
      const normalized = segment.replace(/[\[\]]/g, "").toLowerCase()
      if (ARRAY_NOUN_HINTS[normalized]) {
        return ARRAY_NOUN_HINTS[normalized]
      }
      const simplified = normalized.replace(/[#\d]/g, "")
      if (ARRAY_NOUN_HINTS[simplified]) {
        return ARRAY_NOUN_HINTS[simplified]
      }
    }
  }
  return "entry"
}

function formatCountWithNoun(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`
}

function formatList(values: string[], limit = 3): string {
  const filtered = values.filter(Boolean)
  if (!filtered.length) return ""
  if (filtered.length <= limit) return filtered.join(", ")
  const visible = filtered.slice(0, limit).join(", ")
  return `${visible} (+${filtered.length - limit} more)`
}
