import type { IntegrityPolicy } from "./integrity-policy"
import { isLegacyAutoSyncDraft, type IntegrityDraftOrigin } from "./integrity-draft-origin"

type ScriptDraftLike = {
  scriptId?: string | null
  scriptDraftId?: string | null
  draftOrigin?: IntegrityDraftOrigin
  data?: Record<string, any>
}

type EntityDraftLike = ScriptDraftLike & {
  draftOrigin?: IntegrityDraftOrigin
  data: Record<string, any>
  createdByUserId?: string | null
  screenId?: string | null
  screenDraftId?: string | null
  diagnosisId?: string | null
  diagnosisDraftId?: string | null
  problemId?: string | null
  problemDraftId?: string | null
}

type PendingDeletionLike = {
  scriptId?: string | null
  screenScriptId?: string | null
  diagnosisScriptId?: string | null
  problemScriptId?: string | null
  dataKeyId?: string | null
}

export function evaluateIntegrityScanScope({
  policy,
  userScriptDrafts,
  userScreenDrafts,
  userDiagnosisDrafts,
  userProblemDrafts,
  userPendingDeletion,
  hasExistingDataKeyLibraryChanges,
  deletedDataKeyIdsSize,
  screenPreviewMap,
  diagnosisPreviewMap,
  problemPreviewMap,
  publishedScreenMap,
  publishedDiagnosisMap,
  publishedProblemMap,
  affectedScreenIds,
  affectedDiagnosisIds,
  affectedProblemIds,
  dataKeyImpactScriptIds,
}: {
  policy: IntegrityPolicy
  userScriptDrafts: ScriptDraftLike[]
  userScreenDrafts: EntityDraftLike[]
  userDiagnosisDrafts: EntityDraftLike[]
  userProblemDrafts: EntityDraftLike[]
  userPendingDeletion: PendingDeletionLike[]
  hasExistingDataKeyLibraryChanges: boolean
  deletedDataKeyIdsSize: number
  screenPreviewMap: Map<string, Record<string, any>>
  diagnosisPreviewMap: Map<string, Record<string, any>>
  problemPreviewMap: Map<string, Record<string, any>>
  publishedScreenMap?: Map<string, Record<string, any>>
  publishedDiagnosisMap?: Map<string, Record<string, any>>
  publishedProblemMap?: Map<string, Record<string, any>>
  affectedScreenIds?: Set<string>
  affectedDiagnosisIds?: Set<string>
  affectedProblemIds?: Set<string>
  dataKeyImpactScriptIds: string[]
}) {
  const shouldIncludeDataKeyImpact =
    (policy.triggerSources.dataKeyLibraryEdits && hasExistingDataKeyLibraryChanges) ||
    (policy.triggerSources.deletions && deletedDataKeyIdsSize > 0)

  const shouldIgnoreDataKeySyncDrafts = !policy.triggerSources.dataKeyLibraryEdits
  const shouldClassifyLegacyDataKeySyncDrafts = shouldIgnoreDataKeySyncDrafts && hasExistingDataKeyLibraryChanges
  const shouldIgnoreImportDrafts = !policy.triggerSources.imports

  const effectiveUserScriptDrafts = shouldIgnoreImportDrafts
    ? userScriptDrafts.filter((draft) => draft.draftOrigin !== "import")
    : userScriptDrafts

  const effectiveUserScreenDrafts = shouldIgnoreDataKeySyncDrafts
    ? userScreenDrafts.filter((draft) => !isLegacyAutoSyncDraft(
        draft,
        screenPreviewMap.get(draft.screenId || draft.screenDraftId || ""),
        {
          publishedEntity: publishedScreenMap?.get(draft.screenId || draft.screenDraftId || ""),
          isAffectedByCurrentDataKeyChange: !!affectedScreenIds?.has(draft.screenId || draft.screenDraftId || ""),
        },
      ))
    : userScreenDrafts
  const effectiveUserDiagnosisDrafts = shouldIgnoreDataKeySyncDrafts
    ? userDiagnosisDrafts.filter((draft) => !isLegacyAutoSyncDraft(
        draft,
        diagnosisPreviewMap.get(draft.diagnosisId || draft.diagnosisDraftId || ""),
        {
          publishedEntity: publishedDiagnosisMap?.get(draft.diagnosisId || draft.diagnosisDraftId || ""),
          isAffectedByCurrentDataKeyChange: !!affectedDiagnosisIds?.has(draft.diagnosisId || draft.diagnosisDraftId || ""),
        },
      ))
    : userDiagnosisDrafts
  const effectiveUserProblemDrafts = shouldIgnoreDataKeySyncDrafts
    ? userProblemDrafts.filter((draft) => !isLegacyAutoSyncDraft(
        draft,
        problemPreviewMap.get(draft.problemId || draft.problemDraftId || ""),
        {
          publishedEntity: publishedProblemMap?.get(draft.problemId || draft.problemDraftId || ""),
          isAffectedByCurrentDataKeyChange: !!affectedProblemIds?.has(draft.problemId || draft.problemDraftId || ""),
        },
      ))
    : userProblemDrafts
  const filteredUserScreenDrafts = shouldIgnoreImportDrafts
    ? effectiveUserScreenDrafts.filter((draft) => draft.draftOrigin !== "import")
    : effectiveUserScreenDrafts
  const filteredUserDiagnosisDrafts = shouldIgnoreImportDrafts
    ? effectiveUserDiagnosisDrafts.filter((draft) => draft.draftOrigin !== "import")
    : effectiveUserDiagnosisDrafts
  const filteredUserProblemDrafts = shouldIgnoreImportDrafts
    ? effectiveUserProblemDrafts.filter((draft) => draft.draftOrigin !== "import")
    : effectiveUserProblemDrafts

  const hasImportChanges =
    !shouldIgnoreImportDrafts && (
      userScriptDrafts.some((draft) => draft.draftOrigin === "import") ||
      userScreenDrafts.some((draft) => draft.draftOrigin === "import") ||
      userDiagnosisDrafts.some((draft) => draft.draftOrigin === "import") ||
      userProblemDrafts.some((draft) => draft.draftOrigin === "import")
    )

  const hasScriptFamilyChanges =
    effectiveUserScriptDrafts.length > 0 ||
    filteredUserScreenDrafts.length > 0 ||
    filteredUserDiagnosisDrafts.length > 0 ||
    filteredUserProblemDrafts.length > 0 ||
    userPendingDeletion.some((entry) => !!entry.scriptId || !!entry.screenScriptId || !!entry.diagnosisScriptId || !!entry.problemScriptId)

  const shouldRunIntegrityChecks =
    policy.enforcementMode !== "off" &&
    (
      (policy.triggerSources.scriptEdits && hasScriptFamilyChanges) ||
      (policy.triggerSources.imports && hasImportChanges) ||
      (policy.triggerSources.dataKeyLibraryEdits && hasExistingDataKeyLibraryChanges) ||
      (policy.triggerSources.deletions && deletedDataKeyIdsSize > 0)
    )

  const affectedScriptIds = Array.from(new Set([
    ...effectiveUserScriptDrafts.map((draft) => draft.scriptId || draft.scriptDraftId).filter((id): id is string => !!id),
    ...filteredUserScreenDrafts.map((draft) => draft.scriptId || draft.scriptDraftId).filter((id): id is string => !!id),
    ...filteredUserDiagnosisDrafts.map((draft) => draft.scriptId || draft.scriptDraftId).filter((id): id is string => !!id),
    ...filteredUserProblemDrafts.map((draft) => draft.scriptId || draft.scriptDraftId).filter((id): id is string => !!id),
    ...userPendingDeletion.flatMap((entry) => [entry.scriptId, entry.screenScriptId, entry.diagnosisScriptId, entry.problemScriptId]).filter((id): id is string => !!id),
    ...(shouldIncludeDataKeyImpact ? dataKeyImpactScriptIds : []),
  ]))

  return {
    shouldIncludeDataKeyImpact,
    shouldIgnoreDataKeySyncDrafts,
    shouldClassifyLegacyDataKeySyncDrafts,
    effectiveUserScriptDrafts,
    effectiveUserScreenDrafts: filteredUserScreenDrafts,
    effectiveUserDiagnosisDrafts: filteredUserDiagnosisDrafts,
    effectiveUserProblemDrafts: filteredUserProblemDrafts,
    hasImportChanges,
    hasScriptFamilyChanges,
    shouldRunIntegrityChecks,
    affectedScriptIds,
  }
}
