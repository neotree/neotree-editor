"use server"

import { revalidatePath as _revalidatePath } from "next/cache"
import { eq, inArray } from "drizzle-orm"

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
  repairDataKeyIntegrityReferences,
  scanDataKeyIntegrity,
} from "@/lib/data-key-integrity"
import { getIntegrityBaselineLookup, getIntegrityPolicyState, hasIntegrityBaseline, isIntegrityBaselineCompatible } from "@/lib/integrity-policy"
import db from "@/databases/pg/drizzle"
import { dataKeys, dataKeysDrafts, diagnosesDrafts, pendingDeletion, problemsDrafts, screensDrafts, scriptsDrafts } from "@/databases/pg/schema"

const RELEASE_CHANGELOG_ENTITY_ID = "00000000-0000-0000-0000-000000000000"

function mergeIntegrityEntityUpdates<T extends Record<string, any>>(
  current: T[],
  updates: T[],
  getId: (item: T) => string | undefined,
) {
  if (!updates.length) return current

  const updatesMap = new Map(
    updates
      .map((item) => [getId(item), item] as const)
      .filter(([id]) => !!id)
  )

  return current.map((item) => {
    const id = getId(item)
    return (id && updatesMap.get(id)) || item
  })
}

async function persistPublishIntegrityRepairs({
  repairs,
  publisherUserId,
}: {
  repairs: {
    screens: Awaited<ReturnType<typeof scriptsQueries._getScreens>>["data"]
    diagnoses: Awaited<ReturnType<typeof scriptsQueries._getDiagnoses>>["data"]
    problems: Awaited<ReturnType<typeof scriptsQueries._getProblems>>["data"]
  }
  publisherUserId?: string | null
}) {
  const userId = publisherUserId || undefined
  const [repairedScreens, repairedDiagnoses, repairedProblems] = await Promise.all([
    repairs.screens.length
      ? scriptsMutations._saveScreens({
          data: repairs.screens,
          userId,
        })
      : Promise.resolve({ success: true, data: [], warnings: undefined, errors: undefined }),
    repairs.diagnoses.length
      ? scriptsMutations._saveDiagnoses({
          data: repairs.diagnoses,
          userId,
        })
      : Promise.resolve({ success: true, data: [], errors: undefined }),
    repairs.problems.length
      ? scriptsMutations._saveProblems({
          data: repairs.problems,
          userId,
        })
      : Promise.resolve({ success: true, data: [], errors: undefined }),
  ])

  const errors = [
    ...(repairedScreens.errors || []),
    ...(repairedDiagnoses.errors || []),
    ...(repairedProblems.errors || []),
  ]

  return {
    errors: errors.length ? errors : undefined,
    warnings: repairedScreens.warnings || [],
  }
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
}> {
  const [userDataKeyDrafts, userScriptDrafts, userScreenDrafts, userDiagnosisDrafts, userProblemDrafts, userPendingDeletion] = await Promise.all([
    db.query.dataKeysDrafts.findMany({ where: userId ? eq(dataKeysDrafts.createdByUserId, userId) : undefined }),
    db.query.scriptsDrafts.findMany({ where: userId ? eq(scriptsDrafts.createdByUserId, userId) : undefined }),
    db.query.screensDrafts.findMany({ where: userId ? eq(screensDrafts.createdByUserId, userId) : undefined }),
    db.query.diagnosesDrafts.findMany({ where: userId ? eq(diagnosesDrafts.createdByUserId, userId) : undefined }),
    db.query.problemsDrafts.findMany({ where: userId ? eq(problemsDrafts.createdByUserId, userId) : undefined }),
    db.query.pendingDeletion.findMany({
      where: userId ? eq(pendingDeletion.createdByUserId, userId) : undefined,
      columns: {
        scriptId: true,
        screenScriptId: true,
        diagnosisScriptId: true,
        problemScriptId: true,
        dataKeyId: true,
      },
    }),
  ])

  const hasScriptFamilyChanges =
    userScriptDrafts.length > 0 ||
    userScreenDrafts.length > 0 ||
    userDiagnosisDrafts.length > 0 ||
    userProblemDrafts.length > 0 ||
    userPendingDeletion.some((entry) => !!entry.scriptId || !!entry.screenScriptId || !!entry.diagnosisScriptId || !!entry.problemScriptId)
  const hasExistingDataKeyLibraryChanges =
    userDataKeyDrafts.some((draft) => !!draft.dataKeyId) ||
    userPendingDeletion.some((entry) => !!entry.dataKeyId)
  const deletedDataKeyIds = new Set(
    userPendingDeletion
      .map((entry) => entry.dataKeyId)
      .filter((id): id is string => !!id)
  )

  const shouldRunIntegrityChecks =
    policy.enforcementMode !== "off" &&
    (
      (policy.triggerSources.scriptEdits && hasScriptFamilyChanges) ||
      (policy.triggerSources.dataKeyLibraryEdits && hasExistingDataKeyLibraryChanges) ||
      (policy.triggerSources.deletions && deletedDataKeyIds.size > 0)
    )
  const shouldIncludeDataKeyImpact =
    (policy.triggerSources.dataKeyLibraryEdits && hasExistingDataKeyLibraryChanges) ||
    (policy.triggerSources.deletions && deletedDataKeyIds.size > 0)

  if (!shouldRunIntegrityChecks) {
    return {
      dataKeysRes: { data: [], errors: undefined },
      screensRes: { data: [], errors: undefined },
      diagnosesRes: { data: [], errors: undefined },
      problemsRes: { data: [], errors: undefined },
      shouldRunIntegrityChecks,
    }
  }
  const deletedDataKeys = !shouldIncludeDataKeyImpact || !deletedDataKeyIds.size
    ? []
    : await db.query.dataKeys.findMany({
        where: inArray(dataKeys.uuid, Array.from(deletedDataKeyIds)),
      })
  const dataKeysForImpact = !shouldIncludeDataKeyImpact
    ? []
    : [
        ...(policy.triggerSources.dataKeyLibraryEdits
          ? userDataKeyDrafts
              .filter((draft) => !!draft.dataKeyId)
              .map((draft) => ({
                ...draft.data,
                uuid: draft.dataKeyId || draft.data.uuid,
                uniqueKey: draft.data.uniqueKey,
              }))
          : []),
        ...deletedDataKeys,
      ].filter((item) => !!item.uniqueKey) as dataKeysQueries.DataKey[]
  const dataKeyImpact = !shouldIncludeDataKeyImpact || !dataKeysForImpact.length
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
      shouldRunIntegrityChecks,
    }
  }

  const affectedScriptIds = Array.from(new Set([
    ...userScriptDrafts.map((draft) => draft.scriptId || draft.scriptDraftId).filter((id): id is string => !!id),
    ...userScreenDrafts.map((draft) => draft.scriptId || draft.scriptDraftId).filter((id): id is string => !!id),
    ...userDiagnosisDrafts.map((draft) => draft.scriptId || draft.scriptDraftId).filter((id): id is string => !!id),
    ...userProblemDrafts.map((draft) => draft.scriptId || draft.scriptDraftId).filter((id): id is string => !!id),
    ...userPendingDeletion.flatMap((entry) => [entry.scriptId, entry.screenScriptId, entry.diagnosisScriptId, entry.problemScriptId]).filter((id): id is string => !!id),
    ...dataKeyImpactScriptIds,
  ]))

  const shouldLimitToAffectedScripts = policy.scanScope === "affected_scripts_only" && !!userId
  const hasAffectedScripts = !!affectedScriptIds?.length
  if (shouldLimitToAffectedScripts && !hasAffectedScripts) {
    return {
      dataKeysRes: { data: [], errors: undefined },
      screensRes: { data: [], errors: undefined },
      diagnosesRes: { data: [], errors: undefined },
      problemsRes: { data: [], errors: undefined },
      shouldRunIntegrityChecks: false,
    }
  }

  const affectedScriptsSet = new Set(affectedScriptIds || [])
  const scopedUserScreenDrafts = shouldLimitToAffectedScripts
    ? userScreenDrafts.filter((draft) => {
        const scriptId = draft.scriptId || draft.scriptDraftId
        return !!scriptId && affectedScriptsSet.has(scriptId)
      })
    : userScreenDrafts
  const scopedUserDiagnosisDrafts = shouldLimitToAffectedScripts
    ? userDiagnosisDrafts.filter((draft) => {
        const scriptId = draft.scriptId || draft.scriptDraftId
        return !!scriptId && affectedScriptsSet.has(scriptId)
      })
    : userDiagnosisDrafts
  const scopedUserProblemDrafts = shouldLimitToAffectedScripts
    ? userProblemDrafts.filter((draft) => {
        const scriptId = draft.scriptId || draft.scriptDraftId
        return !!scriptId && affectedScriptsSet.has(scriptId)
      })
    : userProblemDrafts

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

  const dataKeysMap = new Map<string, typeof publishedDataKeysRes.data[number]>()
  publishedDataKeysRes.data.forEach((item) => {
    dataKeysMap.set(item.uuid, item)
    dataKeysMap.set(item.uniqueKey, item)
  })
  userDataKeyDrafts.forEach((draft) => {
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
    screensMap.set(draft.screenId || draft.screenDraftId, data as typeof publishedScreensRes.data[number])
    screensMap.set(draft.screenDraftId, data as typeof publishedScreensRes.data[number])
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
    diagnosesMap.set(draft.diagnosisId || draft.diagnosisDraftId, data as typeof publishedDiagnosesRes.data[number])
    diagnosesMap.set(draft.diagnosisDraftId, data as typeof publishedDiagnosesRes.data[number])
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
    problemsMap.set(draft.problemId || draft.problemDraftId, data as typeof publishedProblemsRes.data[number])
    problemsMap.set(draft.problemDraftId, data as typeof publishedProblemsRes.data[number])
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

    const {
      dataKeysRes,
      screensRes,
      diagnosesRes,
      problemsRes,
      shouldRunIntegrityChecks,
    } = await getScopedIntegrityData({
      userId,
      policy: integrityPolicyState.policy,
    })

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
    const repairs = !shouldRunIntegrityChecks
      ? { screens: [], diagnoses: [], problems: [] }
      : repairDataKeyIntegrityReferences({
          dataKeys: dataKeysRes.data,
          screens: screensRes.data,
          diagnoses: diagnosesRes.data,
          problems: problemsRes.data,
          context: integrityContext || undefined,
        })

    const repairedScreensForIntegrity = shouldRunIntegrityChecks
      ? mergeIntegrityEntityUpdates(screensRes.data, repairs.screens, (item) => item.screenId)
      : screensRes.data
    const repairedDiagnosesForIntegrity = shouldRunIntegrityChecks
      ? mergeIntegrityEntityUpdates(diagnosesRes.data, repairs.diagnoses, (item) => item.diagnosisId)
      : diagnosesRes.data
    const repairedProblemsForIntegrity = shouldRunIntegrityChecks
      ? mergeIntegrityEntityUpdates(problemsRes.data, repairs.problems, (item) => item.problemId)
      : problemsRes.data

    if (shouldRunIntegrityChecks) {
      const integrityReport = scanDataKeyIntegrity({
        dataKeys: dataKeysRes.data,
        screens: repairedScreensForIntegrity,
        diagnoses: repairedDiagnosesForIntegrity,
        problems: repairedProblemsForIntegrity,
        onlyIssues: true,
        context: integrityContext || undefined,
        policy: integrityPolicyState.policy,
      })
      const blockingEntries = getBlockingIntegrityEntries(integrityReport.entries, integrityPolicyState.policy)
      const blockingBaselineLookup = getIntegrityBaselineLookup(integrityPolicyState.baseline)
      const hasCapturedBaseline = hasIntegrityBaseline(integrityPolicyState.baseline)
      const hasCompatibleBaseline = isIntegrityBaselineCompatible(integrityPolicyState.baseline)
      const policyModeMessage = `Integrity enforcement mode: ${integrityPolicyState.policy.enforcementMode.replaceAll("_", " ")}.`

      let enforcedBlockingEntries = blockingEntries
      let policyWarnings: string[] = []

      if (integrityPolicyState.policy.enforcementMode === "warn_only") {
        enforcedBlockingEntries = []
        if (blockingEntries.length) {
          policyWarnings.push(
            `Integrity policy is set to warn only. ${blockingEntries.length} blocking issue${blockingEntries.length === 1 ? "" : "s"} were detected but did not block publish.`
          )
        }
      } else if (integrityPolicyState.policy.enforcementMode === "block_new_issues_only") {
        if (!hasCapturedBaseline) {
          enforcedBlockingEntries = []
          policyWarnings.push(
            "Integrity policy is set to block new issues only, but no baseline has been captured yet. Validation is running in warn-only mode until a baseline is captured."
          )
          if (blockingEntries.length) {
            policyWarnings.push(
              `${blockingEntries.length} existing blocking issue${blockingEntries.length === 1 ? "" : "s"} were detected and allowed because there is no captured baseline yet.`
            )
          }
        } else if (!hasCompatibleBaseline) {
          enforcedBlockingEntries = []
          policyWarnings.push(
            "Integrity policy is set to block new issues only, but the captured baseline is outdated for the current rule set. Validation is running in warn-only mode until a new baseline is captured."
          )
          if (blockingEntries.length) {
            policyWarnings.push(
              `${blockingEntries.length} blocking issue${blockingEntries.length === 1 ? "" : "s"} were detected and allowed because the captured baseline is not compatible with the current rule set.`
            )
          }
        } else {
          enforcedBlockingEntries = blockingEntries.filter(
            (entry) => !blockingBaselineLookup.has(getDataKeyIntegrityEntryFingerprint(entry))
          )
          if (blockingEntries.length && !enforcedBlockingEntries.length) {
            policyWarnings.push(
              "Existing baseline integrity issues were detected in scope, but no newly introduced blocking issues were found."
            )
          }
        }
      }

      if (policyWarnings.length) {
        results.warnings = [...(results.warnings || []), policyModeMessage, ...policyWarnings]
      }

      if (enforcedBlockingEntries.length) {
        const enforcedReport = buildDataKeyIntegrityReportFromEntries(
          enforcedBlockingEntries,
          integrityPolicyState.policy
        )
        const publishIntegrityDetails = buildDataKeyIntegrityPublishDetails(
          enforcedReport,
          integrityPolicyState.policy
        )
        const publishIntegrityErrors = buildDataKeyIntegrityPublishErrors(
          enforcedReport,
          integrityPolicyState.policy
        )

        if (
          integrityPolicyState.policy.enforcementMode === "block_new_issues_only" &&
          publishIntegrityDetails
        ) {
          publishIntegrityDetails.summary = [
            policyModeMessage,
            "Blocking policy: block new issues only. Existing baseline issues are not blocking this publish.",
            ...publishIntegrityDetails.summary,
          ]
        } else if (publishIntegrityDetails) {
          publishIntegrityDetails.summary = [policyModeMessage, ...publishIntegrityDetails.summary]
        }

        results.success = false
        results.errors = publishIntegrityErrors
        results.blockingDetails = publishIntegrityDetails
        return results
      }
    }

    if (repairs.screens.length || repairs.diagnoses.length || repairs.problems.length) {
      const persistedRepairs = await persistPublishIntegrityRepairs({
        repairs,
        publisherUserId,
      })
      if (persistedRepairs.errors?.length) {
        results.success = false
        results.errors = persistedRepairs.errors
        return results
      }
      if (persistedRepairs.warnings?.length) {
        results.warnings = [...(results.warnings || []), ...persistedRepairs.warnings]
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

    socket.emit("data_changed", "discard_drafts")
  } catch (e: any) {
    results.success = false
    results.errors = [e.message]
    logger.error("publishData ERROR", e.message)
  } finally {
    return results
  }
}
