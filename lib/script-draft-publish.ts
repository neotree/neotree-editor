export type PublishableScriptDraft = {
  scriptDraftId: string
  scriptId?: string | null
  data?: {
    scriptId?: string | null
  } | null
}

export function resolvePublishedScriptId(draft: PublishableScriptDraft) {
  return draft.scriptId || draft.data?.scriptId || draft.scriptDraftId
}

export function buildPublishedChildScriptReference(draft: PublishableScriptDraft) {
  return {
    scriptId: resolvePublishedScriptId(draft),
    scriptDraftId: null,
  }
}
