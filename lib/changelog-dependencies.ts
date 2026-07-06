import type { changeLogs } from "@/databases/pg/schema"

type ChangeLogRow = typeof changeLogs.$inferSelect

export type ChangelogDependencyReference = {
  entityId: string
  entityType: ChangeLogRow["entityType"]
  matchedPath: string
  matchedValue: string
}

const DATA_KEY_IDENTIFIER_FIELDS = ["uuid", "uniqueKey", "dataKeyId"] as const

const DATA_KEY_REFERENCE_FIELDS = new Set([
  "dataKeyId",
  "keyId",
  "refIdDataKey",
  "refKeyId",
  "minDateKeyId",
  "maxDateKeyId",
  "minTimeKeyId",
  "maxTimeKeyId",
  "uniqueKey",
])

const DATA_KEY_DERIVED_FIELDS = new Set([
  "keyId",
  "key",
  "label",
  "name",
  "value",
  "id",
  "confidential",
  "optional",
  "dataType",
  "refId",
  "refIdDataKey",
  "refKey",
  "refKeyId",
  "minDateKey",
  "minDateKeyId",
  "maxDateKey",
  "maxDateKeyId",
  "minTimeKey",
  "minTimeKeyId",
  "maxTimeKey",
  "maxTimeKeyId",
])

const ARRAY_ID_FIELDS = [
  "fieldId",
  "itemId",
  "symptomId",
  "screenId",
  "diagnosisId",
  "problemId",
  "configKeyId",
  "uuid",
  "id",
]

function normalizeCandidate(value: unknown) {
  if (typeof value !== "string") return null
  const normalized = value.trim()
  return normalized.length ? normalized : null
}

export function buildDataKeyReferenceCandidates(...snapshots: unknown[]) {
  const candidates = new Set<string>()

  for (const snapshot of snapshots) {
    if (!snapshot || typeof snapshot !== "object") continue
    const record = snapshot as Record<string, unknown>
    for (const field of DATA_KEY_IDENTIFIER_FIELDS) {
      const candidate = normalizeCandidate(record[field])
      if (candidate) candidates.add(candidate)
    }
  }

  return candidates
}

export function findDataKeyReferencePaths(value: unknown, candidates: Set<string>, basePath = "") {
  const matches: { path: string; value: string }[] = []
  if (!candidates.size || value === null || value === undefined) return matches

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      matches.push(...findDataKeyReferencePaths(item, candidates, `${basePath}[${index}]`))
    })
    return matches
  }

  if (typeof value !== "object") return matches

  for (const [key, childValue] of Object.entries(value as Record<string, unknown>)) {
    const path = basePath ? `${basePath}.${key}` : key
    const normalizedValue = normalizeCandidate(childValue)
    if (DATA_KEY_REFERENCE_FIELDS.has(key) && normalizedValue && candidates.has(normalizedValue)) {
      matches.push({ path, value: normalizedValue })
      continue
    }

    if (childValue && typeof childValue === "object") {
      matches.push(...findDataKeyReferencePaths(childValue, candidates, path))
    }
  }

  return matches
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

function objectReferencesDataKey(value: unknown, candidates: Set<string>) {
  if (!isPlainRecord(value)) return false
  return Object.entries(value).some(([key, childValue]) => {
    const normalizedValue = normalizeCandidate(childValue)
    return DATA_KEY_REFERENCE_FIELDS.has(key) && !!normalizedValue && candidates.has(normalizedValue)
  })
}

function getArrayItemKey(value: unknown) {
  if (!isPlainRecord(value)) return null
  for (const field of ARRAY_ID_FIELDS) {
    const normalized = normalizeCandidate(value[field])
    if (normalized) return `${field}:${normalized}`
  }
  return null
}

function mergeArrayByStableKey(
  currentValue: unknown[],
  targetValue: unknown[] | undefined,
  candidates: Set<string>,
  targetDataKey: Record<string, unknown> | undefined,
) {
  const targetByKey = new Map<string, unknown>()
  for (const targetItem of targetValue ?? []) {
    const key = getArrayItemKey(targetItem)
    if (key) targetByKey.set(key, targetItem)
  }

  return currentValue.map((currentItem, index) => {
    const key = getArrayItemKey(currentItem)
    const targetItem = (key ? targetByKey.get(key) : undefined) ?? targetValue?.[index]
    return mergeDataKeyDependentValue(currentItem, targetItem, candidates, targetDataKey)
  })
}

function applyTargetDataKeyFallback(record: Record<string, unknown>, targetDataKey: Record<string, unknown> | undefined) {
  if (!targetDataKey) return record

  const uniqueKey = normalizeCandidate(targetDataKey.uniqueKey)
  const name = normalizeCandidate(targetDataKey.name)
  const label = normalizeCandidate(targetDataKey.label) ?? name
  const metadata = isPlainRecord(targetDataKey.metadata) ? targetDataKey.metadata : {}

  const next = { ...record }
  for (const idField of ["keyId", "refIdDataKey", "refKeyId", "minDateKeyId", "maxDateKeyId", "minTimeKeyId", "maxTimeKeyId"]) {
    if (uniqueKey && Object.prototype.hasOwnProperty.call(next, idField)) next[idField] = uniqueKey
  }
  for (const nameField of ["key", "refId", "refKey", "minDateKey", "maxDateKey", "minTimeKey", "maxTimeKey", "value"]) {
    if (name && Object.prototype.hasOwnProperty.call(next, nameField)) next[nameField] = name
  }
  if (label && Object.prototype.hasOwnProperty.call(next, "label")) next.label = label
  if (label && Object.prototype.hasOwnProperty.call(next, "name")) next.name = label
  if (name && Object.prototype.hasOwnProperty.call(next, "id")) next.id = name
  if (Object.prototype.hasOwnProperty.call(next, "confidential") && typeof targetDataKey.confidential === "boolean") {
    next.confidential = targetDataKey.confidential
  }
  if (Object.prototype.hasOwnProperty.call(next, "dataType") && typeof targetDataKey.dataType === "string") {
    next.dataType = targetDataKey.dataType
  }
  if (Object.prototype.hasOwnProperty.call(next, "optional") && typeof metadata.optional === "boolean") {
    next.optional = metadata.optional
  }

  return next
}

function mergeDataKeyDependentValue(
  currentValue: unknown,
  targetValue: unknown,
  candidates: Set<string>,
  targetDataKey: Record<string, unknown> | undefined,
): unknown {
  if (Array.isArray(currentValue)) {
    return mergeArrayByStableKey(
      currentValue,
      Array.isArray(targetValue) ? targetValue : undefined,
      candidates,
      targetDataKey,
    )
  }

  if (!isPlainRecord(currentValue)) return currentValue

  const targetRecord = isPlainRecord(targetValue) ? targetValue : undefined
  const merged: Record<string, unknown> = { ...currentValue }

  for (const [key, childValue] of Object.entries(currentValue)) {
    const targetChildValue = targetRecord?.[key]
    if (Array.isArray(childValue) || isPlainRecord(childValue)) {
      merged[key] = mergeDataKeyDependentValue(childValue, targetChildValue, candidates, targetDataKey)
    }
  }

  if (objectReferencesDataKey(currentValue, candidates) || objectReferencesDataKey(targetRecord, candidates)) {
    for (const key of Array.from(DATA_KEY_DERIVED_FIELDS)) {
      if (targetRecord && Object.prototype.hasOwnProperty.call(targetRecord, key)) {
        merged[key] = targetRecord[key]
      }
    }
    if (!targetRecord) return applyTargetDataKeyFallback(merged, targetDataKey)
  }

  return merged
}

export function buildDataKeyDependentRollbackSnapshot({
  currentSnapshot,
  targetSnapshot,
  dataKeyCurrentSnapshot,
  dataKeyTargetSnapshot,
}: {
  currentSnapshot: unknown
  targetSnapshot: unknown
  dataKeyCurrentSnapshot: unknown
  dataKeyTargetSnapshot: unknown
}) {
  const candidates = buildDataKeyReferenceCandidates(dataKeyCurrentSnapshot, dataKeyTargetSnapshot)
  return mergeDataKeyDependentValue(
    currentSnapshot,
    targetSnapshot,
    candidates,
    isPlainRecord(dataKeyTargetSnapshot) ? dataKeyTargetSnapshot : undefined,
  )
}

export function buildDataKeyRollbackDependencies({
  dataKeyEntityId,
  currentSnapshot,
  targetSnapshot,
  activeChanges,
}: {
  dataKeyEntityId: string
  currentSnapshot: unknown
  targetSnapshot: unknown
  activeChanges: ChangeLogRow[]
}) {
  const candidates = buildDataKeyReferenceCandidates(currentSnapshot, targetSnapshot)
  const dependencies = new Map<string, ChangelogDependencyReference>()

  for (const change of activeChanges) {
    if (change.entityType === "data_key" && change.entityId === dataKeyEntityId) continue
    const matches = findDataKeyReferencePaths(change.fullSnapshot, candidates)
    const firstMatch = matches[0]
    if (!firstMatch) continue

    dependencies.set(`${change.entityType}:${change.entityId}`, {
      entityId: change.entityId,
      entityType: change.entityType,
      matchedPath: firstMatch.path,
      matchedValue: firstMatch.value,
    })
  }

  return Array.from(dependencies.values())
}
