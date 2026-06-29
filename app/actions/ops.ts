"use server"

import { revalidatePath as _revalidatePath } from "next/cache"
import { and, eq, inArray, ne } from "drizzle-orm"

import socket from "@/lib/socket"
import logger from "@/lib/logger"
import { isAllowed } from "./is-allowed"
import { _clearPendingDeletion, _processPendingDeletion } from "@/databases/mutations/ops"
import * as opsQueries from "@/databases/queries/ops"
import * as scriptsQueries from "@/databases/queries/scripts"
import * as scriptsMutations from "@/databases/mutations/scripts"
import * as configKeysMutations from "@/databases/mutations/config-keys"
import * as configKeysQueries from "@/databases/queries/config-keys"
import * as hospitalsMutations from "@/databases/mutations/hospitals"
import * as hospitalsQueries from "@/databases/queries/hospitals"
import * as drugsLibraryMutations from "@/databases/mutations/drugs-library"
import * as drugsLibraryQueries from "@/databases/queries/drugs-library"
import * as dataKeysMutations from "@/databases/mutations/data-keys"
import * as dataKeysQueries from "@/databases/queries/data-keys"
import { _saveEditorInfo } from "@/databases/mutations/editor-info"
import { _getEditorInfo, type GetEditorInfoResults } from "@/databases/queries/editor-info"
import { _saveChangeLog } from "@/databases/mutations/changelogs/_save-change-log"
import {
  buildDataKeyIntegrityContext,
  buildDataKeyIntegrityPublishDetails,
  buildDataKeyIntegrityPublishErrors,
  buildDataKeyIntegrityReportFromEntries,
  getBlockingIntegrityEntries,
  getDataKeyIntegrityEntryFingerprint,
  scanDataKeyIntegrity,
} from "@/lib/data-key-integrity"
import { evaluateIntegrityPolicyBlockingEntries, getIntegrityPolicyState } from "@/lib/integrity-policy"
import { evaluateIntegrityScanScope } from "@/lib/integrity-scan-scope"
import { getAcceptedImportFingerprintLookup, getAcceptedImportScriptAllowanceLookup } from "./integrity-imports"
import db from "@/databases/pg/drizzle"
import {
  configKeysDrafts,
  dataKeys,
  dataKeysDrafts,
  diagnosesDrafts,
  drugsLibraryDrafts,
  hospitalsDrafts,
  pendingDeletion,
  problemsDrafts,
  screensDrafts,
  scriptsDrafts,
} from "@/databases/pg/schema"

const RELEASE_CHANGELOG_ENTITY_ID = "00000000-0000-0000-0000-000000000000"

function buildPreviewEntityMap<T extends Record<string, any>>(
  items: T[] | undefined,
  getId: (item: T) => string | undefined,
) : Map<string, Record<string, any>> {
  return new Map<string, Record<string, any>>(
    (items || [])
      .map((item) => [getId(item), item as Record<string, any>] as const)
      .filter(([id]) => !!id)
      .map(([id, item]) => [id as string, item] as const)
  )
}

async function resolveIntegrityScriptTitles(
  entries: Array<{ scriptId?: string; scriptTitle?: string }>
) {
  const idsToResolve = Array.from(
    new Set(
      entries
        .filter((entry) => {
          const scriptId = `${entry.scriptId || ""}`.trim()
          const scriptTitle = `${entry.scriptTitle || ""}`.trim()
          return !!scriptId && (!scriptTitle || scriptTitle === scriptId)
        })
        .map((entry) => `${entry.scriptId || ""}`.trim())
    )
  )

  if (!idsToResolve.length) return new Map<string, string>()

  const scriptsRes = await scriptsQueries._getScripts({
    scriptsIds: idsToResolve,
    returnDraftsIfExist: true,
  })

  if (scriptsRes.errors?.length) {
    throw new Error(scriptsRes.errors.join(", "))
  }

  return new Map(
    scriptsRes.data
      .map((script) => {
        const title = `${script.title || ""}`.trim()
        return title ? ([script.scriptId, title] as const) : null
      })
      .filter((item): item is readonly [string, string] => !!item)
  )
}

function assertCanPublishDrafts(user?: { role?: string | null } | null) {
  const role = `${user?.role || ""}`.trim()
  const allowed = role === "admin" || role === "super_user"

  if (!allowed) logger.error("assertCanPublishDrafts ERROR", JSON.stringify({ role }))
  if (!allowed) throw new Error("Forbidden: only admin or super_user can publish drafts")
}

async function getScopedIntegrityData({
  userId,
  policy,
}: {
  userId?: string | null
  policy: ReturnType<typeof getIntegrityPolicyState>["policy"]
}): Promise<{
  dataKeysRes: Awaited<ReturnType<typeof dataKeysQueries._getDataKeys>>
  screensRes: Awaited<ReturnType<typeof scriptsQueries._getScreens>>
  diagnosesRes: Awaited<ReturnType<typeof scriptsQueries._getDiagnoses>>
  problemsRes: Awaited<ReturnType<typeof scriptsQueries._getProblems>>
  shouldRunIntegrityChecks: boolean
  hasImportChanges: boolean
  triggerSummary: string[]
  importAllowanceCandidatesByScript: Record<string, {
    hasImportDraft: boolean
    hasDataKeySyncDraft: boolean
    hasManualDraft: boolean
    hasPendingDeletion: boolean
    latestImportManagedUpdatedAt: string | null
  }>
}> {
  const [userDataKeyDrafts, userScriptDrafts, userPendingDeletion] = await Promise.all([
    db.query.dataKeysDrafts.findMany({ where: userId ? eq(dataKeysDrafts.createdByUserId, userId) : undefined }),
    db.query.scriptsDrafts.findMany({ where: userId ? eq(scriptsDrafts.createdByUserId, userId) : undefined }),
    db.query.pendingDeletion.findMany({
      where: userId ? eq(pendingDeletion.createdByUserId, userId) : undefined,
      columns: {
        scriptId: true,
        screenScriptId: true,
        diagnosisScriptId: true,
        problemScriptId: true,
        dataKeyId: true,
        draftOrigin: true,
      },
    }),
  ])

  const libraryOriginDataKeyDrafts = userDataKeyDrafts.filter((draft) => !!draft.dataKeyId && draft.draftOrigin !== "import")
  const importOriginDataKeyDrafts = userDataKeyDrafts.filter((draft) => !!draft.dataKeyId && draft.draftOrigin === "import")

  const hasExistingDataKeyLibraryChanges =
    libraryOriginDataKeyDrafts.length > 0 ||
    userPendingDeletion.some((entry) => !!entry.dataKeyId)
  const hasImportOriginDataKeyChanges = importOriginDataKeyDrafts.length > 0
  const deletedDataKeyIds = new Set(
    userPendingDeletion
      .map((entry) => entry.dataKeyId)
      .filter((id): id is string => !!id)
  )

  const shouldIgnoreDataKeySyncDrafts = !policy.triggerSources.dataKeyLibraryEdits
  const shouldClassifyLegacyDataKeySyncDrafts = shouldIgnoreDataKeySyncDrafts && hasExistingDataKeyLibraryChanges
  const shouldIgnoreImportDrafts = !policy.triggerSources.imports
  const filteredOrigins = [
    ...(shouldIgnoreImportDrafts ? ["import"] : []),
    ...(shouldIgnoreDataKeySyncDrafts && !shouldClassifyLegacyDataKeySyncDrafts ? ["data_key_sync"] : []),
  ]

  const buildDraftWhereClause = <T extends {
    createdByUserId: any
    draftOrigin: any
  }>(table: T) => {
    const clauses = [
      ...(userId ? [eq(table.createdByUserId, userId)] : []),
      ...filteredOrigins.map((origin) => ne(table.draftOrigin, origin as "import" | "data_key_sync")),
    ]

    if (!clauses.length) return undefined
    if (clauses.length === 1) return clauses[0]
    return and(...clauses)
  }

  const [userScreenDrafts, userDiagnosisDrafts, userProblemDrafts] = await Promise.all([
    db.query.screensDrafts.findMany({
      where: buildDraftWhereClause(screensDrafts),
    }),
    db.query.diagnosesDrafts.findMany({
      where: buildDraftWhereClause(diagnosesDrafts),
    }),
    db.query.problemsDrafts.findMany({
      where: buildDraftWhereClause(problemsDrafts),
    }),
  ])

  const shouldIncludeDataKeyImpact =
    (policy.triggerSources.dataKeyLibraryEdits && hasExistingDataKeyLibraryChanges) ||
    (policy.triggerSources.imports && hasImportOriginDataKeyChanges) ||
    (policy.triggerSources.deletions && deletedDataKeyIds.size > 0)

  const shouldComputeDataKeyImpact =
    shouldIncludeDataKeyImpact ||
    shouldClassifyLegacyDataKeySyncDrafts

  const deletedDataKeys = !shouldComputeDataKeyImpact || !deletedDataKeyIds.size
    ? []
    : await db.query.dataKeys.findMany({
        where: inArray(dataKeys.uuid, Array.from(deletedDataKeyIds)),
      })
  const dataKeysForImpact = !shouldComputeDataKeyImpact
    ? []
    : [
        ...(((policy.triggerSources.dataKeyLibraryEdits && libraryOriginDataKeyDrafts.length) ||
            (policy.triggerSources.imports && importOriginDataKeyDrafts.length) ||
            shouldClassifyLegacyDataKeySyncDrafts)
          ? userDataKeyDrafts
              .filter((draft) => {
                if (!draft.dataKeyId) return false
                if (draft.draftOrigin === "import") return policy.triggerSources.imports
                return policy.triggerSources.dataKeyLibraryEdits || shouldClassifyLegacyDataKeySyncDrafts
              })
              .map((draft) => ({
                ...draft.data,
                uuid: draft.dataKeyId || draft.data.uuid,
                uniqueKey: draft.data.uniqueKey,
              }))
          : []),
        ...deletedDataKeys,
      ].filter((item) => !!item.uniqueKey) as dataKeysQueries.DataKey[]
  const dataKeyImpact = !shouldComputeDataKeyImpact || !dataKeysForImpact.length
    ? null
    : await dataKeysMutations._updateDataKeysRefs({
        dataKeys: dataKeysForImpact,
        dryRun: true,
      })
  const dataKeyImpactScriptIds = dataKeyImpact?.affected?.scripts
    ?.map((script) => script.scriptId)
    .filter((id): id is string => !!id) || []

  if (dataKeyImpact?.errors?.length) {
    return {
      dataKeysRes: { data: [], errors: dataKeyImpact.errors },
      screensRes: { data: [], errors: undefined },
      diagnosesRes: { data: [], errors: undefined },
      problemsRes: { data: [], errors: undefined },
      shouldRunIntegrityChecks: true,
      hasImportChanges: false,
      triggerSummary: [],
      importAllowanceCandidatesByScript: {},
    }
  }

  const screenPreviewMap = buildPreviewEntityMap(dataKeyImpact?.preview?.screens, (item) => item.screenId)
  const diagnosisPreviewMap = buildPreviewEntityMap(dataKeyImpact?.preview?.diagnoses, (item) => item.diagnosisId)
  const problemPreviewMap = buildPreviewEntityMap(dataKeyImpact?.preview?.problems, (item) => item.problemId)
  const affectedScreenIds = new Set((dataKeyImpact?.affected?.screens || []).map((item) => item.id).filter(Boolean))
  const affectedDiagnosisIds = new Set((dataKeyImpact?.affected?.diagnoses || []).map((item) => item.id).filter(Boolean))
  const affectedProblemIds = new Set((dataKeyImpact?.affected?.problems || []).map((item) => item.id).filter(Boolean))

  const [publishedLegacyScreensRes, publishedLegacyDiagnosesRes, publishedLegacyProblemsRes] =
    shouldClassifyLegacyDataKeySyncDrafts && dataKeyImpactScriptIds.length
      ? await Promise.all([
          scriptsQueries._getScreens({
            returnDraftsIfExist: false,
            scriptsIds: dataKeyImpactScriptIds,
          }),
          scriptsQueries._getDiagnoses({
            returnDraftsIfExist: false,
            scriptsIds: dataKeyImpactScriptIds,
          }),
          scriptsQueries._getProblems({
            returnDraftsIfExist: false,
            scriptsIds: dataKeyImpactScriptIds,
          }),
        ])
      : [
          { data: [], errors: undefined },
          { data: [], errors: undefined },
          { data: [], errors: undefined },
        ]

  const legacyPublishedErrors = [
    ...(publishedLegacyScreensRes.errors || []),
    ...(publishedLegacyDiagnosesRes.errors || []),
    ...(publishedLegacyProblemsRes.errors || []),
  ]
  if (legacyPublishedErrors.length) {
    return {
      dataKeysRes: { data: [], errors: legacyPublishedErrors },
      screensRes: { data: [], errors: undefined },
      diagnosesRes: { data: [], errors: undefined },
      problemsRes: { data: [], errors: undefined },
      shouldRunIntegrityChecks: true,
      hasImportChanges: false,
      triggerSummary: [],
      importAllowanceCandidatesByScript: {},
    }
  }

  const publishedScreenMap = buildPreviewEntityMap(publishedLegacyScreensRes.data, (item) => item.screenId)
  const publishedDiagnosisMap = buildPreviewEntityMap(publishedLegacyDiagnosesRes.data, (item) => item.diagnosisId)
  const publishedProblemMap = buildPreviewEntityMap(publishedLegacyProblemsRes.data, (item) => item.problemId)

  const {
    effectiveUserScreenDrafts,
    effectiveUserDiagnosisDrafts,
    effectiveUserProblemDrafts,
    effectiveUserScriptDrafts,
    nonImportScriptDrafts,
    nonImportScreenDrafts,
    nonImportDiagnosisDrafts,
    nonImportProblemDrafts,
    hasImportChanges,
    hasScriptFamilyChanges,
    importAllowanceCandidatesByScript,
    shouldRunIntegrityChecks,
    shouldIncludeDataKeyImpact: evaluatedShouldIncludeDataKeyImpact,
    affectedScriptIds,
  } = evaluateIntegrityScanScope({
    policy,
    userScriptDrafts,
    userScreenDrafts,
    userDiagnosisDrafts,
    userProblemDrafts,
    userPendingDeletion,
    hasExistingDataKeyLibraryChanges,
    hasImportOriginDataKeyChanges,
    deletedDataKeyIdsSize: deletedDataKeyIds.size,
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
  })

  if (!shouldRunIntegrityChecks) {
    return {
      dataKeysRes: { data: [], errors: undefined },
      screensRes: { data: [], errors: undefined },
      diagnosesRes: { data: [], errors: undefined },
      problemsRes: { data: [], errors: undefined },
      shouldRunIntegrityChecks,
      hasImportChanges,
      triggerSummary: [],
      importAllowanceCandidatesByScript,
    }
  }

  const forceAffectedScopeForImports = !!userId && policy.triggerSources.imports && hasImportChanges
  const requestedAffectedScope = !!userId && (
    policy.scanScope === "affected_scripts_only" ||
    forceAffectedScopeForImports
  )
  const hasAffectedScripts = !!affectedScriptIds?.length
  let shouldLimitToAffectedScripts = requestedAffectedScope
  if (requestedAffectedScope && !hasAffectedScripts) {
    if (evaluatedShouldIncludeDataKeyImpact) {
      logger.error("getScopedIntegrityData WARN", JSON.stringify({
        message: "No affected scripts were detected for datakey-driven integrity scope; widening to full scope conservatively.",
        hasExistingDataKeyLibraryChanges,
        deletedDataKeyIds: deletedDataKeyIds.size,
        dataKeyImpactScripts: dataKeyImpactScriptIds.length,
      }))
      shouldLimitToAffectedScripts = false
    } else {
    return {
      dataKeysRes: { data: [], errors: undefined },
      screensRes: { data: [], errors: undefined },
      diagnosesRes: { data: [], errors: undefined },
      problemsRes: { data: [], errors: undefined },
      shouldRunIntegrityChecks: false,
      hasImportChanges,
      triggerSummary: [],
      importAllowanceCandidatesByScript,
    }
    }
  }

  const affectedScriptsSet = new Set(affectedScriptIds || [])
  const scopedUserScreenDrafts = shouldLimitToAffectedScripts
    ? effectiveUserScreenDrafts.filter((draft) => {
        const scriptId = draft.scriptId || draft.scriptDraftId
        return !!scriptId && affectedScriptsSet.has(scriptId)
      })
    : effectiveUserScreenDrafts
  const scopedUserDiagnosisDrafts = shouldLimitToAffectedScripts
    ? effectiveUserDiagnosisDrafts.filter((draft) => {
        const scriptId = draft.scriptId || draft.scriptDraftId
        return !!scriptId && affectedScriptsSet.has(scriptId)
      })
    : effectiveUserDiagnosisDrafts
  const scopedUserProblemDrafts = shouldLimitToAffectedScripts
    ? effectiveUserProblemDrafts.filter((draft) => {
        const scriptId = draft.scriptId || draft.scriptDraftId
        return !!scriptId && affectedScriptsSet.has(scriptId)
      })
    : effectiveUserProblemDrafts

  const [publishedDataKeysRes, publishedScreensRes, publishedDiagnosesRes, publishedProblemsRes] = await Promise.all([
    dataKeysQueries._getDataKeys({ returnDraftsIfExist: false }),
    shouldLimitToAffectedScripts
      ? (hasAffectedScripts
        ? scriptsQueries._getScreens({
            returnDraftsIfExist: false,
            scriptsIds: affectedScriptIds,
          })
        : Promise.resolve({ data: [], errors: undefined }))
      : scriptsQueries._getScreens({ returnDraftsIfExist: false }),
    shouldLimitToAffectedScripts
      ? (hasAffectedScripts
        ? scriptsQueries._getDiagnoses({
            returnDraftsIfExist: false,
            scriptsIds: affectedScriptIds,
          })
        : Promise.resolve({ data: [], errors: undefined }))
      : scriptsQueries._getDiagnoses({ returnDraftsIfExist: false }),
    shouldLimitToAffectedScripts
      ? (hasAffectedScripts
        ? scriptsQueries._getProblems({
            returnDraftsIfExist: false,
            scriptsIds: affectedScriptIds,
          })
        : Promise.resolve({ data: [], errors: undefined }))
      : scriptsQueries._getProblems({ returnDraftsIfExist: false }),
  ])

  const effectiveUserDataKeyDrafts = userDataKeyDrafts.filter((draft) => {
    if (draft.draftOrigin === "import" && !policy.triggerSources.imports) return false
    return true
  })
  const publishedDataKeysById = new Map(
    publishedDataKeysRes.data
      .filter((item) => !!item.uuid)
      .map((item) => [item.uuid, item] as const),
  )
  const formatDraftDataKeyLabel = (draft: typeof userDataKeyDrafts[number]) => {
    const published = draft.dataKeyId ? publishedDataKeysById.get(draft.dataKeyId) : undefined

    return (
      draft.data?.name ||
      draft.data?.label ||
      published?.name ||
      published?.label ||
      draft.uniqueKey ||
      draft.uuid
    )
  }
  const triggerSummary: string[] = []
  const effectiveLibraryOriginDataKeyDrafts = effectiveUserDataKeyDrafts.filter(
    (draft) => !!draft.dataKeyId && draft.draftOrigin !== "import",
  )

  if (policy.triggerSources.dataKeyLibraryEdits && hasExistingDataKeyLibraryChanges) {
    const examples = effectiveLibraryOriginDataKeyDrafts
      .slice(0, 3)
      .map((draft) => `"${formatDraftDataKeyLabel(draft)}"`)
    const dataKeyDraftCount = effectiveLibraryOriginDataKeyDrafts.length
    const dataKeyDeletionCount = deletedDataKeyIds.size
    const fragments = [
      dataKeyDraftCount ? `${dataKeyDraftCount} data key draft${dataKeyDraftCount === 1 ? "" : "s"}` : null,
      dataKeyDeletionCount ? `${dataKeyDeletionCount} deleted data key${dataKeyDeletionCount === 1 ? "" : "s"}` : null,
    ].filter(Boolean)

    if (fragments.length) {
      triggerSummary.push(
        `Integrity scan triggered by data key library edits: ${fragments.join(" and ")} in your workspace${examples.length ? `, including ${examples.join(", ")}` : ""}.`,
      )
    }
  }

  if (!policy.triggerSources.imports && importOriginDataKeyDrafts.length) {
    triggerSummary.push(
      `${importOriginDataKeyDrafts.length} import-origin data key draft${importOriginDataKeyDrafts.length === 1 ? "" : "s"} are present but ignored because Imports is off.`,
    )
  }

  if (policy.triggerSources.imports && (hasImportChanges || hasImportOriginDataKeyChanges)) {
    const importedScriptDraftCount =
      userScriptDrafts.filter((draft) => draft.draftOrigin === "import").length +
      userScreenDrafts.filter((draft) => draft.draftOrigin === "import").length +
      userDiagnosisDrafts.filter((draft) => draft.draftOrigin === "import").length +
      userProblemDrafts.filter((draft) => draft.draftOrigin === "import").length
    const importedPendingScriptDeletionCount = userPendingDeletion.filter((entry) => (
      entry.draftOrigin === "import" &&
      (!!entry.scriptId || !!entry.screenScriptId || !!entry.diagnosisScriptId || !!entry.problemScriptId)
    )).length
    const importedDataKeyDraftCount = importOriginDataKeyDrafts.length
    const fragments = [
      importedScriptDraftCount ? `${importedScriptDraftCount} imported script draft${importedScriptDraftCount === 1 ? "" : "s"}` : null,
      importedPendingScriptDeletionCount ? `${importedPendingScriptDeletionCount} imported pending script deletion${importedPendingScriptDeletionCount === 1 ? "" : "s"}` : null,
      importedDataKeyDraftCount ? `${importedDataKeyDraftCount} imported data key draft${importedDataKeyDraftCount === 1 ? "" : "s"}` : null,
    ].filter(Boolean)

    if (fragments.length) {
      triggerSummary.push(`Integrity scan triggered by imports: ${fragments.join(" and ")} in your workspace.`)
    }
  }

  if (policy.triggerSources.scriptEdits && hasScriptFamilyChanges) {
    const isImportGovernedScript = (scriptId: string | null | undefined) => {
      if (!scriptId) return false
      const candidate = importAllowanceCandidatesByScript[scriptId]
      if (!candidate) return false
      if (candidate.hasManualDraft) return false
      return candidate.hasImportDraft || candidate.hasDataKeySyncDraft
    }
    const scriptFamilyDraftCount =
      nonImportScriptDrafts.length +
      nonImportScreenDrafts.length +
      nonImportDiagnosisDrafts.length +
      nonImportProblemDrafts.length
    const scriptDeletionCount = userPendingDeletion.filter((entry) => (
      entry.draftOrigin === "import"
        ? false
        :
      [entry.scriptId, entry.screenScriptId, entry.diagnosisScriptId, entry.problemScriptId]
        .filter((id): id is string => !!id)
        .some((scriptId) => !isImportGovernedScript(scriptId))
    )).length
    const fragments = [
      scriptFamilyDraftCount ? `${scriptFamilyDraftCount} script-related draft${scriptFamilyDraftCount === 1 ? "" : "s"}` : null,
      scriptDeletionCount ? `${scriptDeletionCount} pending script deletion${scriptDeletionCount === 1 ? "" : "s"}` : null,
    ].filter(Boolean)

    if (fragments.length) {
      triggerSummary.push(`Integrity scan triggered by script edits: ${fragments.join(" and ")} in your workspace.`)
    }
  }

  const dataKeysMap = new Map<string, typeof publishedDataKeysRes.data[number]>()
  publishedDataKeysRes.data.forEach((item) => {
    dataKeysMap.set(item.uuid, item)
    dataKeysMap.set(item.uniqueKey, item)
  })
  effectiveUserDataKeyDrafts.forEach((draft) => {
    const data = {
      ...draft.data,
      isDraft: true,
      isDeleted: false,
      draftCreatedByUserId: draft.createdByUserId,
    }
    if (draft.dataKeyId) dataKeysMap.set(draft.dataKeyId, data as typeof publishedDataKeysRes.data[number])
    dataKeysMap.set(draft.uuid, data as typeof publishedDataKeysRes.data[number])
    dataKeysMap.set(draft.uniqueKey, data as typeof publishedDataKeysRes.data[number])
  })

  const screensMap = new Map<string, typeof publishedScreensRes.data[number]>()
  publishedScreensRes.data.forEach((item) => {
    screensMap.set(item.screenId, item)
  })
  scopedUserScreenDrafts.forEach((draft) => {
    const data = {
      ...draft.data,
      isDraft: true,
      isDeleted: false,
      draftCreatedByUserId: draft.createdByUserId,
    }
    const primaryId = draft.screenId || draft.screenDraftId
    if (primaryId) screensMap.set(primaryId, data as typeof publishedScreensRes.data[number])
    if (draft.screenDraftId) screensMap.set(draft.screenDraftId, data as typeof publishedScreensRes.data[number])
  })

  const diagnosesMap = new Map<string, typeof publishedDiagnosesRes.data[number]>()
  publishedDiagnosesRes.data.forEach((item) => {
    diagnosesMap.set(item.diagnosisId, item)
  })
  scopedUserDiagnosisDrafts.forEach((draft) => {
    const data = {
      ...draft.data,
      isDraft: true,
      isDeleted: false,
      draftCreatedByUserId: draft.createdByUserId,
    }
    const primaryId = draft.diagnosisId || draft.diagnosisDraftId
    if (primaryId) diagnosesMap.set(primaryId, data as typeof publishedDiagnosesRes.data[number])
    if (draft.diagnosisDraftId) diagnosesMap.set(draft.diagnosisDraftId, data as typeof publishedDiagnosesRes.data[number])
  })

  const problemsMap = new Map<string, typeof publishedProblemsRes.data[number]>()
  publishedProblemsRes.data.forEach((item) => {
    problemsMap.set(item.problemId, item)
  })
  scopedUserProblemDrafts.forEach((draft) => {
    const data = {
      ...draft.data,
      isDraft: true,
      isDeleted: false,
      draftCreatedByUserId: draft.createdByUserId,
    }
    const primaryId = draft.problemId || draft.problemDraftId
    if (primaryId) problemsMap.set(primaryId, data as typeof publishedProblemsRes.data[number])
    if (draft.problemDraftId) problemsMap.set(draft.problemDraftId, data as typeof publishedProblemsRes.data[number])
  })

  return {
    dataKeysRes: {
      data: Array.from(new Map(Array.from(dataKeysMap.values()).map((item) => [item.uniqueKey || item.uuid, item])).values())
        .filter((item) => !deletedDataKeyIds.has(item.uuid)),
      errors: publishedDataKeysRes.errors,
    },
    screensRes: {
      data: Array.from(new Map(Array.from(screensMap.values()).map((item) => [item.screenId, item])).values()),
      errors: publishedScreensRes.errors,
    },
    diagnosesRes: {
      data: Array.from(new Map(Array.from(diagnosesMap.values()).map((item) => [item.diagnosisId, item])).values()),
      errors: publishedDiagnosesRes.errors,
    },
    problemsRes: {
      data: Array.from(new Map(Array.from(problemsMap.values()).map((item) => [item.problemId, item])).values()),
      errors: publishedProblemsRes.errors,
    },
    shouldRunIntegrityChecks,
    hasImportChanges,
    triggerSummary,
    importAllowanceCandidatesByScript,
  }
}

export async function getEditorDetails(): Promise<{
  errors?: string[]
  shouldPublishData: boolean
  pendingDeletion: number
  drafts: typeof opsQueries.defaultCountDraftsData
  info: GetEditorInfoResults["data"]
}> {
  const errors: string[] = []
  let shouldPublishData = false
  try {
    const editorInfo = await _getEditorInfo()
    editorInfo.errors?.forEach((e) => errors.push(e))

    const pendingDeletion = await opsQueries._countPendingDeletion()
    pendingDeletion.errors?.forEach((e) => errors.push(e))

    const { errors: draftsErrors, ...drafts } = await opsQueries._countDrafts()
    draftsErrors?.forEach((e) => errors.push(e))

    const mode = "development"

    shouldPublishData = mode === "development" && (!!drafts.total || !!pendingDeletion.total)

    return {
      pendingDeletion: pendingDeletion.total,
      drafts,
      errors: errors.length ? errors : undefined,
      shouldPublishData,
      info: editorInfo.data,
    }
  } catch (e: any) {
    logger.error("getEditorDetails ERROR", e.message)
    return {
      errors: [e.message, ...errors],
      pendingDeletion: 0,
      drafts: opsQueries.defaultCountDraftsData,
      shouldPublishData,
      info: null,
    }
  }
}

export const revalidatePath = async (
  path: Parameters<typeof _revalidatePath>[0],
  type?: Parameters<typeof _revalidatePath>[1],
) => _revalidatePath(path, type)

export const countAllDrafts = async () => {
  try {
    const configKeys = await configKeysQueries._countConfigKeys()
    const hospitals = await hospitalsQueries._countHospitals()
    const drugsLibraryItems = await drugsLibraryQueries._countDrugsLibraryItems()
    const dataKeys = await dataKeysQueries._countDataKeys()
    const screens = await scriptsQueries._countScreens()
    const scripts = await scriptsQueries._countScripts()
    const diagnoses = await scriptsQueries._countDiagnoses()
    const problems = await scriptsQueries._countProblems()

    return {
      configKeys: configKeys.data.allDrafts,
      hospitals: hospitals.data.allDrafts,
      drugsLibrary: drugsLibraryItems.data.allDrafts,
      screens: screens.data.allDrafts,
      scripts: scripts.data.allDrafts,
      diagnoses: diagnoses.data.allDrafts,
      problems: problems.data.allDrafts,
      dataKeys: dataKeys.data.allDrafts,
    }
  } catch (e: any) {
    logger.error("countAllDrafts ERROR", e.message)
    return {
      screens: 0,
      scripts: 0,
      configKeys: 0,
      hospitals: 0,
      diagnoses: 0,
      problems: 0,
    }
  }
}

export async function publishData({
  scope,
}: {
  scope: number
}) {
  const results: {
    success: boolean;
    errors?: string[];
    warnings?: string[];
    blockingDetails?: ReturnType<typeof buildDataKeyIntegrityPublishDetails>;
  } = { success: true }
  try {
    const session = await isAllowed([
      "create_config_keys",
      "update_config_keys",
      "create_scripts",
      "update_scripts",
      "create_diagnoses",
      "update_diagnoses",
      "create_problems",
      "update_problems",
      "create_screens",
      "update_screens",
    ])
    assertCanPublishDrafts(session.user)

    const publisherUserId = session?.user?.userId || null

    let userId = publisherUserId

    if (scope === 1) userId = null

    const editorInfoResult = await _getEditorInfo()
    const currentDataVersion = editorInfoResult.data?.dataVersion || 1
    const integrityPolicyState = getIntegrityPolicyState(editorInfoResult.data)

    // The next version will be currentDataVersion + 1
    const nextDataVersion = currentDataVersion + 1

    const integrityChecksEnabled = integrityPolicyState.policy.enforcementMode !== "off"
    const {
      dataKeysRes,
      screensRes,
      diagnosesRes,
      problemsRes,
      shouldRunIntegrityChecks,
      hasImportChanges,
      triggerSummary,
      importAllowanceCandidatesByScript,
    } = integrityChecksEnabled
      ? await getScopedIntegrityData({
          userId,
          policy: integrityPolicyState.policy,
        })
      : {
          dataKeysRes: { data: [], errors: undefined },
          screensRes: { data: [], errors: undefined },
          diagnosesRes: { data: [], errors: undefined },
          problemsRes: { data: [], errors: undefined },
          shouldRunIntegrityChecks: false,
          hasImportChanges: false,
          triggerSummary: [],
          importAllowanceCandidatesByScript: {},
        }

    const integrityErrors = [
      ...(dataKeysRes.errors || []),
      ...(screensRes.errors || []),
      ...(diagnosesRes.errors || []),
      ...(problemsRes.errors || []),
    ]

    if (integrityErrors.length) {
      results.success = false
      results.errors = integrityErrors
      return results
    }

    const integrityContext = shouldRunIntegrityChecks ? buildDataKeyIntegrityContext(dataKeysRes.data) : null

    if (shouldRunIntegrityChecks) {
      const integrityReport = scanDataKeyIntegrity({
        dataKeys: dataKeysRes.data,
        screens: screensRes.data,
        diagnoses: diagnosesRes.data,
        problems: problemsRes.data,
        onlyIssues: true,
        context: integrityContext || undefined,
        policy: integrityPolicyState.policy,
      })
      const blockingEntries = getBlockingIntegrityEntries(integrityReport.entries)
      const blockingScriptIds = Array.from(new Set(blockingEntries.map((entry) => entry.scriptId).filter((id): id is string => !!id)))
      const acceptedImportFingerprints =
        integrityPolicyState.policy.enforcementMode === "block_new_issues_only" && integrityPolicyState.policy.triggerSources.imports
          ? await getAcceptedImportFingerprintLookup(
              blockingScriptIds,
            )
          : new Set<string>()
      const acceptedImportScriptIds =
        integrityPolicyState.policy.enforcementMode === "block_new_issues_only" &&
        integrityPolicyState.policy.triggerSources.imports &&
        hasImportChanges
          ? await getAcceptedImportScriptAllowanceLookup(blockingScriptIds)
          : new Map<string, string>()
      const acceptedImportScriptAllowance = new Set(
        Array.from(acceptedImportScriptIds.entries())
          .filter(([scriptId, acceptedAt]) => {
            const candidate = importAllowanceCandidatesByScript[scriptId]
            if (!candidate) return false
            if (candidate.hasManualDraft || candidate.hasPendingDeletion) return false
            if (!candidate.hasImportDraft && !candidate.hasDataKeySyncDraft) return false
            if (!candidate.latestImportManagedUpdatedAt) return false
            return candidate.latestImportManagedUpdatedAt <= acceptedAt
          })
          .map(([scriptId]) => scriptId),
      )
      const effectiveBaseline = acceptedImportFingerprints.size
        ? {
            ...integrityPolicyState.baseline,
            fingerprints: Array.from(new Set([
              ...integrityPolicyState.baseline.fingerprints,
              ...Array.from(acceptedImportFingerprints),
            ])),
          }
        : integrityPolicyState.baseline
      const policyEvaluation = evaluateIntegrityPolicyBlockingEntries({
        policy: integrityPolicyState.policy,
        baseline: effectiveBaseline,
        blockingEntries,
        getFingerprint: getDataKeyIntegrityEntryFingerprint,
      })
      const importAllowanceFilteredEntries = acceptedImportScriptAllowance.size
        ? policyEvaluation.enforcedBlockingEntries.filter((entry) => !acceptedImportScriptAllowance.has(entry.scriptId))
        : policyEvaluation.enforcedBlockingEntries
      const acceptedImportScriptAllowanceCount =
        policyEvaluation.enforcedBlockingEntries.length - importAllowanceFilteredEntries.length
      const enforcedBlockingEntries = importAllowanceFilteredEntries
      const policyWarnings = policyEvaluation.warnings

      if (policyWarnings.length) {
        results.warnings = [...(results.warnings || []), policyEvaluation.policyModeMessage, ...policyWarnings]
      } else if (acceptedImportScriptAllowanceCount > 0) {
        results.warnings = [
          ...(results.warnings || []),
          `Accepted import review allowance suppressed ${acceptedImportScriptAllowanceCount} blocking issue${acceptedImportScriptAllowanceCount === 1 ? "" : "s"} in imported scripts for this publish.`,
        ]
      }

      if (enforcedBlockingEntries.length) {
        const scriptTitlesById = await resolveIntegrityScriptTitles(enforcedBlockingEntries)
        const enrichedBlockingEntries = enforcedBlockingEntries.map((entry) => ({
          ...entry,
          scriptTitle: scriptTitlesById.get(entry.scriptId) || entry.scriptTitle,
        }))
        const enforcedReport = buildDataKeyIntegrityReportFromEntries(
          enrichedBlockingEntries,
        )
        const publishIntegrityDetails = buildDataKeyIntegrityPublishDetails(
          enforcedReport
        )
        const publishIntegrityErrors = buildDataKeyIntegrityPublishErrors(
          enforcedReport
        )

        if (
          integrityPolicyState.policy.enforcementMode === "block_new_issues_only" &&
          publishIntegrityDetails
        ) {
          // When publish is blocked only by newly introduced issues, send the
          // user straight into the script registry with the same focused view.
          publishIntegrityDetails.scripts = publishIntegrityDetails.scripts.map((script) => ({
            ...script,
            registryHref: `${script.registryHref}?focus=newly_introduced`,
            issues: script.issues.map((issue) => ({
              ...issue,
              registryHref: `${issue.registryHref}?focus=newly_introduced`,
            })),
          }))
          publishIntegrityDetails.summary = [
            policyEvaluation.policyModeMessage,
            ...triggerSummary,
            "Blocking policy: block new issues only. Existing baseline issues are not blocking this publish.",
            ...publishIntegrityDetails.summary,
          ]
        } else if (publishIntegrityDetails) {
          publishIntegrityDetails.summary = [policyEvaluation.policyModeMessage, ...triggerSummary, ...publishIntegrityDetails.summary]
        }

        results.success = false
        results.errors = publishIntegrityErrors
        results.blockingDetails = publishIntegrityDetails
        return results
      }
    }

    const failPublish = (errors?: string[]) => {
      results.success = false
      results.errors = errors?.length ? errors : ["Publish failed"]
      return results
    }

    const publishTransactionResult = await db.transaction(async (tx) => {
      const publishConfigKeys = await configKeysMutations._publishConfigKeys({
        userId,
        publisherUserId,
        dataVersion: nextDataVersion,
        client: tx,
      })
      if (publishConfigKeys.errors?.length) throw new Error(publishConfigKeys.errors.join(", "))

      const publishHospitals = await hospitalsMutations._publishHospitals({
        userId,
        publisherUserId,
        dataVersion: nextDataVersion,
        client: tx,
      })
      if (publishHospitals.errors?.length) throw new Error(publishHospitals.errors.join(", "))

      const publishDrugsLibraryItems = await drugsLibraryMutations._publishDrugsLibraryItems({
        userId,
        publisherUserId,
        dataVersion: nextDataVersion,
        client: tx,
      })
      if (publishDrugsLibraryItems.errors?.length) throw new Error(publishDrugsLibraryItems.errors.join(", "))

      const publishDataKeys = await dataKeysMutations._publishDataKeys({
        userId,
        publisherUserId,
        dataVersion: nextDataVersion,
        allowConfidentialDowngrade: true,
        client: tx,
      })
      if (publishDataKeys.errors?.length) throw new Error(publishDataKeys.errors.join(", "))

      const publishScripts = await scriptsMutations._publishScripts({
        userId,
        publisherUserId,
        dataVersion: nextDataVersion,
        client: tx,
      })
      if (publishScripts.errors?.length) throw new Error(publishScripts.errors.join(", "))

      const publishScreens = await scriptsMutations._publishScreens({
        userId,
        publisherUserId,
        dataVersion: nextDataVersion,
        client: tx,
      })
      if (publishScreens.errors?.length) throw new Error(publishScreens.errors.join(", "))

      const publishDiagnoses = await scriptsMutations._publishDiagnoses({
        userId,
        publisherUserId,
        dataVersion: nextDataVersion,
        client: tx,
      })
      if (publishDiagnoses.errors?.length) throw new Error(publishDiagnoses.errors.join(", "))

      const publishProblems = await scriptsMutations._publishProblems({
        userId,
        publisherUserId,
        dataVersion: nextDataVersion,
        client: tx,
      })
      if (publishProblems.errors?.length) throw new Error(publishProblems.errors.join(", "))

      const processPendingDeletion = await _processPendingDeletion({
        userId,
        publisherUserId: publisherUserId || undefined,
        client: tx,
      })
      if (processPendingDeletion.errors?.length) throw new Error(processPendingDeletion.errors.join(", "))

      const editorInfoSave = await _saveEditorInfo({
        increaseVersion: results.success,
        broadcastAction: false,
        data: { lastPublishDate: new Date() },
        client: tx,
      })
      if (editorInfoSave.errors?.length) throw new Error(editorInfoSave.errors.join(", "))

      return { editorInfoSave }
    }).catch((error: any) => ({
      errors: [error?.message || "Publish failed"],
    }))

    if ("errors" in publishTransactionResult && publishTransactionResult.errors?.length) {
      return failPublish(publishTransactionResult.errors)
    }

    const editorInfoSave = ("editorInfoSave" in publishTransactionResult)
      ? publishTransactionResult.editorInfoSave
      : { data: null, success: false, errors: ["Publish failed"] }

    if (results.success && editorInfoSave.success && editorInfoSave.data?.dataVersion && publisherUserId) {
      const releaseDataVersion = editorInfoSave.data.dataVersion
      const now = new Date()
      const releaseLog = await _saveChangeLog({
        data: {
          entityId: RELEASE_CHANGELOG_ENTITY_ID,
          entityType: "release",
          action: "publish",
          dataVersion: releaseDataVersion,
          changes: [
            {
              action: "publish",
              description: `Release v${releaseDataVersion} published`,
              fromDataVersion: releaseDataVersion - 1,
              toDataVersion: releaseDataVersion,
            },
          ],
          fullSnapshot: {
            dataVersion: releaseDataVersion,
            publishedAt: now.toISOString(),
            publishedBy: publisherUserId,
          },
          previousSnapshot: {},
          baselineSnapshot: {
            dataVersion: releaseDataVersion,
            publishedAt: now.toISOString(),
            publishedBy: publisherUserId,
          },
          description: `Release v${releaseDataVersion} published`,
          changeReason: `Release v${releaseDataVersion} published`,
          isActive: false,
          userId: publisherUserId,
        },
      })

      if (!releaseLog.success) {
        logger.error("publishData release changelog warning", releaseLog.errors?.join(", ") || "Unknown error")
      }
    }

    socket.emit("data_changed", "publish_data")
  } catch (e: any) {
    results.success = false
    results.errors = [e.message]
    logger.error("publishData ERROR", e.message)
  } finally {
    return results
  }
}

export async function discardDrafts({
  scope,
}: {
  scope: number
}) {
  const results: { success: boolean; errors?: string[] } = { success: true }
  try {
    const session = await isAllowed(["delete_config_keys", "delete_scripts", "delete_diagnoses", "delete_diagnoses", "delete_screens"])

    let userId = session?.user?.userId

    if (scope === 1) userId = undefined

    await configKeysMutations._deleteAllConfigKeysDrafts({ userId })
    await hospitalsMutations._deleteAllHospitalsDrafts({ userId })
    await drugsLibraryMutations._deleteAllDrugsLibraryItemsDrafts({ userId })
    await dataKeysMutations._deleteAllDataKeysDrafts({ userId })
    await scriptsMutations._deleteAllScriptsDrafts({ userId })
    await scriptsMutations._deleteAllScreensDrafts({ userId })
    await scriptsMutations._deleteAllDiagnosesDrafts({ userId })
    await scriptsMutations._deleteAllProblemsDrafts({ userId })
    await _clearPendingDeletion({ userId })

    const [
      remainingConfigKeyDrafts,
      remainingHospitalDrafts,
      remainingDrugsDrafts,
      remainingDataKeyDrafts,
      remainingScriptDrafts,
      remainingScreenDrafts,
      remainingDiagnosisDrafts,
      remainingProblemDrafts,
      remainingPendingDeletion,
    ] = await Promise.all([
      db.query.configKeysDrafts.findMany({ where: userId ? eq(configKeysDrafts.createdByUserId, userId) : undefined, columns: { id: true } }),
      db.query.hospitalsDrafts.findMany({ where: userId ? eq(hospitalsDrafts.createdByUserId, userId) : undefined, columns: { id: true } }),
      db.query.drugsLibraryDrafts.findMany({ where: userId ? eq(drugsLibraryDrafts.createdByUserId, userId) : undefined, columns: { id: true } }),
      db.query.dataKeysDrafts.findMany({ where: userId ? eq(dataKeysDrafts.createdByUserId, userId) : undefined, columns: { uuid: true } }),
      db.query.scriptsDrafts.findMany({ where: userId ? eq(scriptsDrafts.createdByUserId, userId) : undefined, columns: { scriptDraftId: true } }),
      db.query.screensDrafts.findMany({ where: userId ? eq(screensDrafts.createdByUserId, userId) : undefined, columns: { screenDraftId: true } }),
      db.query.diagnosesDrafts.findMany({ where: userId ? eq(diagnosesDrafts.createdByUserId, userId) : undefined, columns: { diagnosisDraftId: true } }),
      db.query.problemsDrafts.findMany({ where: userId ? eq(problemsDrafts.createdByUserId, userId) : undefined, columns: { problemDraftId: true } }),
      db.query.pendingDeletion.findMany({ where: userId ? eq(pendingDeletion.createdByUserId, userId) : undefined, columns: { id: true } }),
    ])

    const leftovers = [
      remainingConfigKeyDrafts.length ? `${remainingConfigKeyDrafts.length} config key draft${remainingConfigKeyDrafts.length === 1 ? "" : "s"}` : null,
      remainingHospitalDrafts.length ? `${remainingHospitalDrafts.length} hospital draft${remainingHospitalDrafts.length === 1 ? "" : "s"}` : null,
      remainingDrugsDrafts.length ? `${remainingDrugsDrafts.length} drug/fluid/feed draft${remainingDrugsDrafts.length === 1 ? "" : "s"}` : null,
      remainingDataKeyDrafts.length ? `${remainingDataKeyDrafts.length} data key draft${remainingDataKeyDrafts.length === 1 ? "" : "s"}` : null,
      remainingScriptDrafts.length ? `${remainingScriptDrafts.length} script draft${remainingScriptDrafts.length === 1 ? "" : "s"}` : null,
      remainingScreenDrafts.length ? `${remainingScreenDrafts.length} screen draft${remainingScreenDrafts.length === 1 ? "" : "s"}` : null,
      remainingDiagnosisDrafts.length ? `${remainingDiagnosisDrafts.length} diagnosis draft${remainingDiagnosisDrafts.length === 1 ? "" : "s"}` : null,
      remainingProblemDrafts.length ? `${remainingProblemDrafts.length} problem draft${remainingProblemDrafts.length === 1 ? "" : "s"}` : null,
      remainingPendingDeletion.length ? `${remainingPendingDeletion.length} pending deletion${remainingPendingDeletion.length === 1 ? "" : "s"}` : null,
    ].filter(Boolean)

    if (leftovers.length) {
      results.success = false
      results.errors = [
        `Discard completed, but draft state still remains in the workspace: ${leftovers.join(", ")}.`,
      ]
      return results
    }

    socket.emit("data_changed", "discard_drafts")
  } catch (e: any) {
    results.success = false
    results.errors = [e.message]
    logger.error("publishData ERROR", e.message)
  } finally {
    return results
  }
}
