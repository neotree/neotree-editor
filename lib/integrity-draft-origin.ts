export type IntegrityDraftOrigin = "data_key_sync" | "editor" | "import" | "other" | null | undefined

function normalizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeValue)
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, normalizeValue(child)])
    )
  }

  return value
}

export function getStableIntegrityDraftValue(value: unknown) {
  return JSON.stringify(normalizeValue(value))
}

export function isAutoSyncDraftOrigin(origin: IntegrityDraftOrigin) {
  switch (origin) {
    case "data_key_sync":
      return true
    case "editor":
    case "import":
    case "other":
    case null:
    case undefined:
      return false
    default:
      return false
  }
}

export function isLegacyAutoSyncDraft<T extends { data: Record<string, any>; draftOrigin?: IntegrityDraftOrigin }>(
  draft: T,
  previewEntity?: Record<string, any>,
  options?: {
    publishedEntity?: Record<string, any>
    isAffectedByCurrentDataKeyChange?: boolean
  },
) {
  if (isAutoSyncDraftOrigin(draft.draftOrigin)) return true
  if (draft.draftOrigin === "editor") {
    if (previewEntity) {
      return getStableIntegrityDraftValue(draft.data) === getStableIntegrityDraftValue(previewEntity)
    }

    if (options?.isAffectedByCurrentDataKeyChange && options.publishedEntity) {
      return getStableIntegrityDraftValue(draft.data) === getStableIntegrityDraftValue(options.publishedEntity)
    }
  }
  return false
}
