type ChangeLike = {
  entityType?: string | null
  changes?: unknown
  description?: string | null
  changeReason?: string | null
}

const DEPENDENT_ENTITY_TYPES = new Set(["screen", "diagnosis", "problem"])
const SYSTEM_FIELDS = new Set(["id", "uuid", "version", "dataVersion", "publishDate", "createdAt", "updatedAt", "deletedAt"])
const DATA_KEY_DERIVED_FIELDS = new Set([
  "keyId",
  "key",
  "label",
  "name",
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
  "value",
  "id",
])
const DATA_KEY_SYNC_REASON_PHRASES = [
  "published via data key reference sync",
  "includes data key reference sync",
  "data-key-linked fields",
]

function extractChangeField(entry: unknown): string | null {
  if (!entry || typeof entry !== "object") return null
  const record = entry as Record<string, unknown>
  const field = record.field ?? record.fieldPath
  return typeof field === "string" && field.trim().length ? field.trim() : null
}

function isProtectedFieldPath(field: string) {
  const segments = field.split(".").filter(Boolean)
  const leaf = segments[segments.length - 1] || field
  if (SYSTEM_FIELDS.has(leaf)) return true
  return DATA_KEY_DERIVED_FIELDS.has(leaf)
}

function hasDataKeySyncReason(change: ChangeLike) {
  const text = `${change.description || ""} ${change.changeReason || ""}`.toLowerCase()
  return DATA_KEY_SYNC_REASON_PHRASES.some((phrase) => text.includes(phrase))
}

function extractFieldsFromLegacyChangeObject(changes: Record<string, unknown>) {
  const fields: string[] = []

  const pushFields = (entries: unknown) => {
    if (!Array.isArray(entries)) return
    for (const entry of entries) {
      if (!entry || typeof entry !== "object") continue
      fields.push(...Object.keys(entry as Record<string, unknown>).filter(Boolean))
    }
  }

  pushFields(changes.oldValues)
  pushFields(changes.newValues)
  return fields
}

function hasDataKeySyncMetadata(changes: unknown) {
  if (!changes || typeof changes !== "object") return false
  const record = changes as Record<string, unknown>
  const metadata = record.metadata
  if (!metadata || typeof metadata !== "object") return false
  return (metadata as Record<string, unknown>).source === "data_key_reference_sync"
}

function extractChangedFields(changes: unknown) {
  if (Array.isArray(changes)) {
    return changes.map(extractChangeField).filter((field): field is string => !!field)
  }

  if (changes && typeof changes === "object") {
    return extractFieldsFromLegacyChangeObject(changes as Record<string, unknown>)
  }

  return []
}

export function isProtectedDependentRollbackChange(change: ChangeLike) {
  if (!DEPENDENT_ENTITY_TYPES.has(`${change.entityType || ""}`)) return false

  if (hasDataKeySyncReason(change)) return true
  if (hasDataKeySyncMetadata(change.changes)) return true

  const changedFields = extractChangedFields(change.changes)

  if (!changedFields.length) return false

  const userFields = changedFields.filter((field) => !SYSTEM_FIELDS.has(field.split(".").filter(Boolean).at(-1) || field))
  if (!userFields.length) return false

  const protectedFields = userFields.filter(isProtectedFieldPath)
  return protectedFields.length > 0 && protectedFields.length === userFields.length
}

export function getProtectedDependentRollbackMessage(entityType?: string | null) {
  const label = `${entityType || "entity"}`.replace("_", " ")
  return `This ${label} change came from a Data Key propagation. Roll back the Data Key instead to keep linked entities in sync.`
}
