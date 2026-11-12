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

/** Turns a data key's uniqueKey into a readable name (e.g. "Feeding — Feeding method [ab12cd34]"). */
export type DescribeDataKey = (uniqueKey: string) => string | undefined

type DiffOptions = { describeDataKey?: DescribeDataKey }

// Fields that hold a data key's uniqueKey. keyId is otherwise a technical field,
// but when it changes the item now points at another data key (a merge or a
// replacement relinked it), which is worth seeing.
const DATA_KEY_REFERENCE_FIELDS = new Set([
  "keyId",
  "refKeyId",
  "refIdDataKey",
  "minDateKeyId",
  "maxDateKeyId",
  "minTimeKeyId",
  "maxTimeKeyId",
])

const shortKey = (uniqueKey: string) => uniqueKey.slice(0, 8)

function formatDataKeyReference(value: unknown, options: DiffOptions) {
  const uniqueKey = typeof value === "string" ? value.trim() : ""
  if (!uniqueKey) return "Empty"
  const name = options.describeDataKey?.(uniqueKey)
  return name || `[${shortKey(uniqueKey)}]`
}

/** Every data key uniqueKey a snapshot value refers to, for looking up their names. */
export function collectDataKeyReferences(values: unknown[], field?: string) {
  const found = new Set<string>()
  const walk = (value: unknown, key?: string) => {
    if (Array.isArray(value)) {
      if (key === "options" && value.every((item) => typeof item === "string")) value.forEach((item) => found.add(item))
      else value.forEach((item) => walk(item))
      return
    }
    if (value && typeof value === "object") {
      Object.entries(value as Record<string, unknown>).forEach(([childKey, child]) => walk(child, childKey))
      return
    }
    if (key && DATA_KEY_REFERENCE_FIELDS.has(key) && typeof value === "string" && value.trim()) found.add(value.trim())
  }
  values.forEach((value) => walk(value, field))
  return Array.from(found)
}

const friendlyFieldLabels: Record<string, string> = {
  items: "Answer options",
  fields: "Fields",
  drugs: "Drugs",
  fluids: "Fluids",
  feeds: "Feeds",
  key: "Key",
  keyId: "Data key",
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
  confidentialLabelOnly: "Confidential (label only)",
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

function normalizeForStableStringify(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeForStableStringify)
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = normalizeForStableStringify((value as Record<string, unknown>)[key])
        return acc
      }, {})
  }
  return value
}

function stableStringify(value: unknown) {
  try {
    return JSON.stringify(normalizeForStableStringify(value))
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
  options = {},
}: {
  field: string
  fieldLabel: string
  itemLabel?: string
  before: Record<string, unknown>
  after: Record<string, unknown>
  rawBefore: unknown
  rawAfter: unknown
  path?: string[]
  options?: DiffOptions
}) {
  const rows: HumanDiffRow[] = []
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]))
    .filter((key) => !technicalKeys.has(key) || DATA_KEY_REFERENCE_FIELDS.has(key))
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
    if (DATA_KEY_REFERENCE_FIELDS.has(key)) {
      rows.push({
        id: `${field}:${itemLabel || "item"}:${nextPath.join(".")}`,
        fieldLabel,
        itemLabel,
        detailLabel: buildPathLabel(nextPath),
        before: formatDataKeyReference(previousValue, options),
        after: formatDataKeyReference(nextValue, options),
        rawField: field,
        rawBefore,
        rawAfter,
      })
      continue
    }

    if (Array.isArray(previousValue) || Array.isArray(nextValue)) {
      rows.push(
        ...buildArrayRows({
          field,
          before: Array.isArray(previousValue) ? previousValue : [],
          after: Array.isArray(nextValue) ? nextValue : [],
          rawBefore,
          rawAfter,
          path: nextPath,
          options,
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
          options,
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
  options = {},
}: {
  field: string
  before: unknown[]
  after: unknown[]
  rawBefore: unknown
  rawAfter: unknown
  path?: string[]
  options?: DiffOptions
}) {
  const fieldLabel = buildPathLabel(path.length ? path : [field])

  // A data key's option list: which options it gained or lost, by name.
  if ((path.at(-1) || field) === "options" && [...before, ...after].every((item) => typeof item === "string")) {
    return buildOptionListRows({ field, fieldLabel, before: before as string[], after: after as string[], rawBefore, rawAfter, options })
  }

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
          options,
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

function buildOptionListRows({
  field,
  fieldLabel,
  before,
  after,
  rawBefore,
  rawAfter,
  options,
}: {
  field: string
  fieldLabel: string
  before: string[]
  after: string[]
  rawBefore: unknown
  rawAfter: unknown
  options: DiffOptions
}) {
  const rows: HumanDiffRow[] = []
  const beforeSet = new Set(before)
  const afterSet = new Set(after)
  const row = (id: string, itemLabel: string, beforeText: string, afterText: string): HumanDiffRow => ({
    id: `${field}:options:${id}`,
    fieldLabel,
    itemLabel,
    before: beforeText,
    after: afterText,
    rawField: field,
    rawBefore,
    rawAfter,
  })

  before.filter((uniqueKey) => !afterSet.has(uniqueKey)).forEach((uniqueKey) => {
    rows.push(row(`removed:${uniqueKey}`, formatDataKeyReference(uniqueKey, options), "Offered", "Removed"))
  })
  after.filter((uniqueKey) => !beforeSet.has(uniqueKey)).forEach((uniqueKey) => {
    rows.push(row(`added:${uniqueKey}`, formatDataKeyReference(uniqueKey, options), "Not offered", "Added"))
  })

  const kept = (list: string[], other: Set<string>) => list.filter((uniqueKey) => other.has(uniqueKey)).join("|")
  if (!rows.length && kept(before, afterSet) !== kept(after, beforeSet)) {
    rows.push(row("order", "Order", "Previous order", "Reordered"))
  }

  return rows
}

export function buildHumanDiffRows({
  field,
  before,
  after,
  describeDataKey,
}: {
  field: string
  before: unknown
  after: unknown
  /** Names data keys in key references and option lists; without it they show as short ids. */
  describeDataKey?: DescribeDataKey
}) {
  const fieldLabel = getFriendlyDiffLabel(field)
  const options: DiffOptions = { describeDataKey }

  if (Array.isArray(before) || Array.isArray(after)) {
    return buildArrayRows({
      field,
      before: Array.isArray(before) ? before : [],
      after: Array.isArray(after) ? after : [],
      rawBefore: before,
      rawAfter: after,
      path: [field],
      options,
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
      options,
    })
  }

  if (DATA_KEY_REFERENCE_FIELDS.has(field) && !valuesEqual(before, after)) {
    return [{
      id: `${field}:value`,
      fieldLabel,
      before: formatDataKeyReference(before, options),
      after: formatDataKeyReference(after, options),
      rawField: field,
      rawBefore: before,
      rawAfter: after,
    }]
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
