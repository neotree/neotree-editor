import type { IntegrityPolicy } from "./integrity-policy"
import { isLegacyAutoSyncDraft, type IntegrityDraftOrigin } from "./integrity-draft-origin"

type ScriptDraftLike = {
  scriptId?: string | null
  scriptDraftId?: string | null
  draftOrigin?: IntegrityDraftOrigin
  updatedAt?: Date | null
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
  updatedAt?: Date | null
}

type PendingDeletionLike = {
  scriptId?: string | null
  screenScriptId?: string | null
  diagnosisScriptId?: string | null
  problemScriptId?: string | null
  dataKeyId?: string | null
  draftOrigin?: IntegrityDraftOrigin
}

export function evaluateIntegrityScanScope({
  policy,
  userScriptDrafts,
  userScreenDrafts,
  userDiagnosisDrafts,
  userProblemDrafts,
  userPendingDeletion,
  hasExistingDataKeyLibraryChanges,
  hasImportOriginDataKeyChanges,
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
  hasImportOriginDataKeyChanges: boolean
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
    (policy.triggerSources.imports && hasImportOriginDataKeyChanges) ||
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

  const importManagedOrigins = new Set<IntegrityDraftOrigin>(["import", "data_key_sync"])
  const importAllowanceCandidatesByScript = {} as Record<string, {
    hasImportDraft: boolean
    hasDataKeySyncDraft: boolean
    hasManualDraft: boolean
    hasPendingDeletion: boolean
    latestImportManagedUpdatedAt: string | null
  }>

  const ensureImportAllowanceCandidate = (scriptId: string) => {
    if (!importAllowanceCandidatesByScript[scriptId]) {
      importAllowanceCandidatesByScript[scriptId] = {
        hasImportDraft: false,
        hasDataKeySyncDraft: false,
        hasManualDraft: false,
        hasPendingDeletion: false,
        latestImportManagedUpdatedAt: null,
      }
    }
    return importAllowanceCandidatesByScript[scriptId]
  }

  const markDraftImportAllowance = (scriptId: string | null | undefined, draftOrigin: IntegrityDraftOrigin | undefined, updatedAt?: Date | null) => {
    if (!scriptId) return
    const candidate = ensureImportAllowanceCandidate(scriptId)
    if (draftOrigin === "import") candidate.hasImportDraft = true
    if (draftOrigin === "data_key_sync") candidate.hasDataKeySyncDraft = true

    if (!draftOrigin || !importManagedOrigins.has(draftOrigin)) {
      candidate.hasManualDraft = true
      return
    }

    const updatedAtIso = updatedAt ? new Date(updatedAt).toISOString() : null
    if (updatedAtIso && (!candidate.latestImportManagedUpdatedAt || updatedAtIso > candidate.latestImportManagedUpdatedAt)) {
      candidate.latestImportManagedUpdatedAt = updatedAtIso
    }
  }

  userScriptDrafts.forEach((draft) => markDraftImportAllowance(draft.scriptId || draft.scriptDraftId, draft.draftOrigin, draft.updatedAt))
  userScreenDrafts.forEach((draft) => markDraftImportAllowance(draft.scriptId || draft.scriptDraftId, draft.draftOrigin, draft.updatedAt))
  userDiagnosisDrafts.forEach((draft) => markDraftImportAllowance(draft.scriptId || draft.scriptDraftId, draft.draftOrigin, draft.updatedAt))
  userProblemDrafts.forEach((draft) => markDraftImportAllowance(draft.scriptId || draft.scriptDraftId, draft.draftOrigin, draft.updatedAt))

  userPendingDeletion.forEach((entry) => {
    [entry.scriptId, entry.screenScriptId, entry.diagnosisScriptId, entry.problemScriptId]
      .filter((id): id is string => !!id)
      .forEach((scriptId) => {
        const candidate = ensureImportAllowanceCandidate(scriptId)
        candidate.hasPendingDeletion = true
        if (!entry.draftOrigin || !importManagedOrigins.has(entry.draftOrigin)) {
          candidate.hasManualDraft = true
          return
        }

        if (entry.draftOrigin === "import") candidate.hasImportDraft = true
        if (entry.draftOrigin === "data_key_sync") candidate.hasDataKeySyncDraft = true
      })
  })

  const isImportGovernedScript = (scriptId: string | null | undefined) => {
    if (!scriptId) return false
    const candidate = importAllowanceCandidatesByScript[scriptId]
    if (!candidate) return false
    if (candidate.hasManualDraft) return false
    return candidate.hasImportDraft || candidate.hasDataKeySyncDraft
  }

  const nonImportScriptDrafts = effectiveUserScriptDrafts.filter((draft) => draft.draftOrigin !== "import")
  const nonImportScreenDrafts = filteredUserScreenDrafts.filter((draft) => draft.draftOrigin !== "import")
  const nonImportDiagnosisDrafts = filteredUserDiagnosisDrafts.filter((draft) => draft.draftOrigin !== "import")
  const nonImportProblemDrafts = filteredUserProblemDrafts.filter((draft) => draft.draftOrigin !== "import")
  const hasNonImportPendingScriptChanges = userPendingDeletion.some((entry) => (
    entry.draftOrigin === "import"
      ? false
      :
    [entry.scriptId, entry.screenScriptId, entry.diagnosisScriptId, entry.problemScriptId]
      .filter((id): id is string => !!id)
      .some((scriptId) => !isImportGovernedScript(scriptId))
  ))

  const hasScriptFamilyChanges =
    nonImportScriptDrafts.length > 0 ||
    nonImportScreenDrafts.length > 0 ||
    nonImportDiagnosisDrafts.length > 0 ||
    nonImportProblemDrafts.length > 0 ||
    hasNonImportPendingScriptChanges

  const shouldRunIntegrityChecks =
    policy.enforcementMode !== "off" &&
    (
      (policy.triggerSources.scriptEdits && hasScriptFamilyChanges) ||
      (policy.triggerSources.imports && (hasImportChanges || hasImportOriginDataKeyChanges)) ||
      (policy.triggerSources.dataKeyLibraryEdits && hasExistingDataKeyLibraryChanges) ||
      (policy.triggerSources.deletions && deletedDataKeyIdsSize > 0)
    )

  const affectedScriptIds = Array.from(new Set([
    ...effectiveUserScriptDrafts.map((draft) => draft.scriptId || draft.scriptDraftId).filter((id): id is string => !!id),
    ...filteredUserScreenDrafts.map((draft) => draft.scriptId || draft.scriptDraftId).filter((id): id is string => !!id),
    ...filteredUserDiagnosisDrafts.map((draft) => draft.scriptId || draft.scriptDraftId).filter((id): id is string => !!id),
    ...filteredUserProblemDrafts.map((draft) => draft.scriptId || draft.scriptDraftId).filter((id): id is string => !!id),
    ...userPendingDeletion
      .filter((entry) => !shouldIgnoreImportDrafts || entry.draftOrigin !== "import")
      .flatMap((entry) => [entry.scriptId, entry.screenScriptId, entry.diagnosisScriptId, entry.problemScriptId])
      .filter((id): id is string => !!id),
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
    nonImportScriptDrafts,
    nonImportScreenDrafts,
    nonImportDiagnosisDrafts,
    nonImportProblemDrafts,
    hasImportChanges,
    importAllowanceCandidatesByScript,
    hasScriptFamilyChanges,
    shouldRunIntegrityChecks,
    affectedScriptIds,
  }
}
