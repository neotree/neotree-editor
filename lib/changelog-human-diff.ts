export type HumanDiffRow = {
  id: string
  fieldLabel: string
  itemLabel?: string
  detailLabel?: string
  before: string
  after: string
  rawField: string
  rawBefore: unknown
  rawAfter: unknown
}

const friendlyFieldLabels: Record<string, string> = {
  items: "Answer options",
  fields: "Fields",
  drugs: "Drugs",
  fluids: "Fluids",
  feeds: "Feeds",
  key: "Key",
  keyId: "Key ID",
  label: "Display label",
  name: "Name",
  title: "Title",
  printTitle: "Printed title",
  sectionTitle: "Section title",
  previewTitle: "Preview title",
  positiveLabel: "Positive answer label",
  negativeLabel: "Negative answer label",
  refId: "Reference ID",
  refIdLabel: "Reference label",
  drug: "Drug, fluid, or feed name",
  position: "Display order",
  required: "Required",
  confidential: "Confidential",
  checked: "Checked",
  summary: "Summary",
  text1: "Text 1",
  text2: "Text 2",
  text3: "Text 3",
}

const technicalKeys = new Set([
  "id",
  "uuid",
  "itemId",
  "keyId",
  "refId",
  "screenId",
  "scriptId",
  "diagnosisId",
  "problemId",
  "configKeyId",
  "hospitalId",
  "dataKeyId",
  "dataType",
  "type",
  "key",
  "position",
  "createdAt",
  "updatedAt",
  "deletedAt",
  "publishDate",
])

const preferredDisplayKeys = [
  "label",
  "name",
  "title",
  "printTitle",
  "sectionTitle",
  "previewTitle",
  "positiveLabel",
  "negativeLabel",
  "drug",
  "refIdLabel",
  "summary",
  "text1",
  "text2",
  "text3",
  "required",
  "checked",
]

export function getFriendlyDiffLabel(field: string) {
  return friendlyFieldLabels[field] || field.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/_/g, " ")
}

export function parseDraftPreviewValue(value: string): unknown {
  if (value === "Empty") return null
  if (value === "New") return undefined

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export function formatTechnicalDiffValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "Empty"
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function formatHumanValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "Empty"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value === "number") return String(value)
  if (typeof value === "string") return value

  return "Changed"
}

function stableStringify(value: unknown) {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function valuesEqual(left: unknown, right: unknown) {
  return stableStringify(left) === stableStringify(right)
}

function getObjectDisplayName(value: unknown, fallback: string) {
  if (!value || typeof value !== "object") return fallback
  const record = value as Record<string, unknown>

  for (const key of ["label", "name", "title", "printTitle", "sectionTitle", "previewTitle", "drug", "key", "id"]) {
    const candidate = record[key]
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim()
  }

  return fallback
}

function getObjectIdentity(value: unknown, index: number) {
  if (!value || typeof value !== "object") return `index:${index}`
  const record = value as Record<string, unknown>

  for (const key of ["itemId", "id", "uuid", "key", "label", "name", "title"]) {
    const candidate = record[key]
    if (candidate !== null && candidate !== undefined && String(candidate).trim()) return `${key}:${String(candidate)}`
  }

  return `index:${index}`
}

function buildPathLabel(path: string[]) {
  return path.map(getFriendlyDiffLabel).join(" > ")
}

function buildObjectRows({
  field,
  fieldLabel,
  itemLabel,
  before,
  after,
  rawBefore,
  rawAfter,
  path = [],
}: {
  field: string
  fieldLabel: string
  itemLabel?: string
  before: Record<string, unknown>
  after: Record<string, unknown>
  rawBefore: unknown
  rawAfter: unknown
  path?: string[]
}) {
  const rows: HumanDiffRow[] = []
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]))
    .filter((key) => !technicalKeys.has(key))
    .sort((a, b) => {
      const aIndex = preferredDisplayKeys.indexOf(a)
      const bIndex = preferredDisplayKeys.indexOf(b)
      if (aIndex !== -1 || bIndex !== -1) return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
      return a.localeCompare(b)
    })

  for (const key of keys) {
    const previousValue = before[key]
    const nextValue = after[key]
    if (valuesEqual(previousValue, nextValue)) continue

    const nextPath = [...path, key]
    if (Array.isArray(previousValue) || Array.isArray(nextValue)) {
      rows.push(
        ...buildArrayRows({
          field,
          before: Array.isArray(previousValue) ? previousValue : [],
          after: Array.isArray(nextValue) ? nextValue : [],
          rawBefore,
          rawAfter,
          path: nextPath,
        }),
      )
      continue
    }

    if (previousValue && nextValue && typeof previousValue === "object" && typeof nextValue === "object") {
      rows.push(
        ...buildObjectRows({
          field,
          fieldLabel,
          itemLabel,
          before: previousValue as Record<string, unknown>,
          after: nextValue as Record<string, unknown>,
          rawBefore,
          rawAfter,
          path: nextPath,
        }),
      )
      continue
    }

    rows.push({
      id: `${field}:${itemLabel || "item"}:${nextPath.join(".")}`,
      fieldLabel,
      itemLabel,
      detailLabel: buildPathLabel(nextPath),
      before: formatHumanValue(previousValue),
      after: formatHumanValue(nextValue),
      rawField: field,
      rawBefore,
      rawAfter,
    })
  }

  return rows
}

function buildArrayRows({
  field,
  before,
  after,
  rawBefore,
  rawAfter,
  path = [],
}: {
  field: string
  before: unknown[]
  after: unknown[]
  rawBefore: unknown
  rawAfter: unknown
  path?: string[]
}) {
  const fieldLabel = buildPathLabel(path.length ? path : [field])
  const beforeMap = new Map(before.map((item, index) => [getObjectIdentity(item, index), item]))
  const afterMap = new Map(after.map((item, index) => [getObjectIdentity(item, index), item]))
  const ids = Array.from(new Set([...Array.from(beforeMap.keys()), ...Array.from(afterMap.keys())]))
  const rows: HumanDiffRow[] = []

  ids.forEach((id, index) => {
    const beforeItem = beforeMap.get(id)
    const afterItem = afterMap.get(id)
    if (valuesEqual(beforeItem, afterItem)) return

    const itemLabel = getObjectDisplayName(afterItem ?? beforeItem, `${fieldLabel} ${index + 1}`)

    if (beforeItem && afterItem && typeof beforeItem === "object" && typeof afterItem === "object") {
      rows.push(
        ...buildObjectRows({
          field,
          fieldLabel,
          itemLabel,
          before: beforeItem as Record<string, unknown>,
          after: afterItem as Record<string, unknown>,
          rawBefore,
          rawAfter,
        }),
      )
      return
    }

    rows.push({
      id: `${field}:${path.join(".")}:${id}`,
      fieldLabel,
      itemLabel,
      before: beforeItem === undefined ? "Not in current version" : formatHumanValue(beforeItem),
      after: afterItem === undefined ? "Removed from draft" : formatHumanValue(afterItem),
      rawField: field,
      rawBefore,
      rawAfter,
    })
  })

  return rows
}

export function buildHumanDiffRows({ field, before, after }: { field: string; before: unknown; after: unknown }) {
  const fieldLabel = getFriendlyDiffLabel(field)

  if (Array.isArray(before) || Array.isArray(after)) {
    return buildArrayRows({
      field,
      before: Array.isArray(before) ? before : [],
      after: Array.isArray(after) ? after : [],
      rawBefore: before,
      rawAfter: after,
      path: [field],
    })
  }

  if (before && after && typeof before === "object" && typeof after === "object") {
    return buildObjectRows({
      field,
      fieldLabel,
      before: before as Record<string, unknown>,
      after: after as Record<string, unknown>,
      rawBefore: before,
      rawAfter: after,
    })
  }

  if (valuesEqual(before, after)) return []

  return [
    {
      id: field,
      fieldLabel,
      before: formatHumanValue(before),
      after: formatHumanValue(after),
      rawField: field,
      rawBefore: before,
      rawAfter: after,
    },
  ] satisfies HumanDiffRow[]
}
