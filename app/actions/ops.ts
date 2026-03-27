"use server"

import { revalidatePath as _revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

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
import { buildDataKeyIntegrityPublishErrors, repairDataKeyIntegrityReferences, scanDataKeyIntegrity } from "@/lib/data-key-integrity"
import db from "@/databases/pg/drizzle"
import { dataKeysDrafts, diagnosesDrafts, pendingDeletion, problemsDrafts, screensDrafts, scriptsDrafts } from "@/databases/pg/schema"

const RELEASE_CHANGELOG_ENTITY_ID = "00000000-0000-0000-0000-000000000000"

async function getScopedIntegrityData(userId?: string | null): Promise<{
  dataKeysRes: Awaited<ReturnType<typeof dataKeysQueries._getDataKeys>>
  screensRes: Awaited<ReturnType<typeof scriptsQueries._getScreens>>
  diagnosesRes: Awaited<ReturnType<typeof scriptsQueries._getDiagnoses>>
  problemsRes: Awaited<ReturnType<typeof scriptsQueries._getProblems>>
  shouldRunIntegrityChecks: boolean
  shouldBlockPublishOnIntegrity: boolean
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

  const hasDataKeyDrafts = userDataKeyDrafts.length > 0
  const hasDataKeyDeletions = userPendingDeletion.some((entry) => !!entry.dataKeyId)
  const hasDataKeyLibraryChanges = hasDataKeyDrafts || hasDataKeyDeletions
  const hasScriptFamilyChanges =
    userScriptDrafts.length > 0 ||
    userScreenDrafts.length > 0 ||
    userDiagnosisDrafts.length > 0 ||
    userProblemDrafts.length > 0 ||
    userPendingDeletion.some((entry) => !!entry.scriptId || !!entry.screenScriptId || !!entry.diagnosisScriptId || !!entry.problemScriptId)

  const shouldRunIntegrityChecks = hasScriptFamilyChanges
  const shouldBlockPublishOnIntegrity = !hasDataKeyLibraryChanges

  if (!shouldRunIntegrityChecks) {
    return {
      dataKeysRes: { data: [], errors: undefined },
      screensRes: { data: [], errors: undefined },
      diagnosesRes: { data: [], errors: undefined },
      problemsRes: { data: [], errors: undefined },
      shouldRunIntegrityChecks,
      shouldBlockPublishOnIntegrity,
    }
  }

  const affectedScriptIds = Array.from(new Set([
    ...userScriptDrafts.map((draft) => draft.scriptId || draft.scriptDraftId).filter((id): id is string => !!id),
    ...userScreenDrafts.map((draft) => draft.scriptId || draft.scriptDraftId).filter((id): id is string => !!id),
    ...userDiagnosisDrafts.map((draft) => draft.scriptId || draft.scriptDraftId).filter((id): id is string => !!id),
    ...userProblemDrafts.map((draft) => draft.scriptId || draft.scriptDraftId).filter((id): id is string => !!id),
    ...userPendingDeletion.flatMap((entry) => [entry.scriptId, entry.screenScriptId, entry.diagnosisScriptId, entry.problemScriptId]).filter((id): id is string => !!id),
  ]))

  const shouldLimitToAffectedScripts = !!userId
  const hasAffectedScripts = !!affectedScriptIds?.length
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
      data: Array.from(new Map(Array.from(dataKeysMap.values()).map((item) => [item.uniqueKey || item.uuid, item])).values()),
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
    shouldBlockPublishOnIntegrity,
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
  const results: { success: boolean; errors?: string[]; warnings?: string[] } = { success: true }
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

    const publisherUserId = session?.user?.userId || null

    let userId = publisherUserId

    if (scope === 1) userId = null

    const editorInfoResult = await _getEditorInfo()
    const currentDataVersion = editorInfoResult.data?.dataVersion || 1

    // The next version will be currentDataVersion + 1
    const nextDataVersion = currentDataVersion + 1

    const {
      dataKeysRes,
      screensRes,
      diagnosesRes,
      problemsRes,
      shouldRunIntegrityChecks,
      shouldBlockPublishOnIntegrity,
    } = await getScopedIntegrityData(userId)

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

    const repairs = !shouldRunIntegrityChecks
      ? { screens: [], diagnoses: [], problems: [] }
      : repairDataKeyIntegrityReferences({
          dataKeys: dataKeysRes.data,
          screens: screensRes.data,
          diagnoses: diagnosesRes.data,
          problems: problemsRes.data,
        })

    if (repairs.screens.length) {
      const repairedScreens = await scriptsMutations._saveScreens({
        data: repairs.screens,
        userId: publisherUserId || undefined,
      })
      if (repairedScreens.errors?.length) {
        results.success = false
        results.errors = repairedScreens.errors
        return results
      }
      if (repairedScreens.warnings?.length) {
        results.warnings = [...(results.warnings || []), ...repairedScreens.warnings]
      }
    }

    if (repairs.diagnoses.length) {
      const repairedDiagnoses = await scriptsMutations._saveDiagnoses({
        data: repairs.diagnoses,
        userId: publisherUserId || undefined,
      })
      if (repairedDiagnoses.errors?.length) {
        results.success = false
        results.errors = repairedDiagnoses.errors
        return results
      }
    }

    if (repairs.problems.length) {
      const repairedProblems = await scriptsMutations._saveProblems({
        data: repairs.problems,
        userId: publisherUserId || undefined,
      })
      if (repairedProblems.errors?.length) {
        results.success = false
        results.errors = repairedProblems.errors
        return results
      }
    }

    const postRepairReport = !shouldRunIntegrityChecks
      ? null
      : scanDataKeyIntegrity({
          dataKeys: dataKeysRes.data,
          screens: repairs.screens.length ? screensRes.data.map((screen) => repairs.screens.find((item) => item.screenId === screen.screenId) || screen) : screensRes.data,
          diagnoses: repairs.diagnoses.length ? diagnosesRes.data.map((diagnosis) => repairs.diagnoses.find((item) => item.diagnosisId === diagnosis.diagnosisId) || diagnosis) : diagnosesRes.data,
          problems: repairs.problems.length ? problemsRes.data.map((problem) => repairs.problems.find((item) => item.problemId === problem.problemId) || problem) : problemsRes.data,
          onlyIssues: true,
        })
    const publishIntegrityErrors = postRepairReport ? buildDataKeyIntegrityPublishErrors(postRepairReport) : []
    if (publishIntegrityErrors.length) {
      if (shouldBlockPublishOnIntegrity) {
        results.success = false
        results.errors = publishIntegrityErrors
        return results
      }

      results.warnings = [...(results.warnings || []), ...publishIntegrityErrors]
    }

    const publishConfigKeys = await configKeysMutations._publishConfigKeys({
      userId,
      publisherUserId,
      dataVersion: nextDataVersion,
    })

    const publishHospitals = await hospitalsMutations._publishHospitals({
      userId,
      publisherUserId,
      dataVersion: nextDataVersion,
    })

    const publishDrugsLibraryItems = await drugsLibraryMutations._publishDrugsLibraryItems({
      userId,
      publisherUserId,
      dataVersion: nextDataVersion,
    })
    const publishDataKeys = await dataKeysMutations._publishDataKeys({
      userId,
      publisherUserId,
      dataVersion: nextDataVersion,
    })
    const publishScripts = await scriptsMutations._publishScripts({
      userId,
      publisherUserId,
      dataVersion: nextDataVersion,
    })
    const publishScreens = await scriptsMutations._publishScreens({
      userId,
      publisherUserId,
      dataVersion: nextDataVersion,
    })
    const publishDiagnoses = await scriptsMutations._publishDiagnoses({
      userId,
      publisherUserId,
      dataVersion: nextDataVersion,
    })
    const publishProblems = await scriptsMutations._publishProblems({
      userId,
      publisherUserId,
      dataVersion: nextDataVersion,
    })
    const processPendingDeletion = await _processPendingDeletion({
      userId,
      publisherUserId: publisherUserId || undefined,
    })

    if (publishDataKeys.errors) {
      results.success = false
      results.errors = [...(results.errors || []), ...publishDataKeys.errors]
    }

    if (publishConfigKeys.errors) {
      results.success = false
      results.errors = [...(results.errors || []), ...publishConfigKeys.errors]
    }

    if (publishHospitals.errors) {
      results.success = false
      results.errors = [...(results.errors || []), ...publishHospitals.errors]
    }

    if (publishDrugsLibraryItems.errors) {
      results.success = false
      results.errors = [...(results.errors || []), ...publishDrugsLibraryItems.errors]
    }

    if (publishScripts.errors) {
      results.success = false
      results.errors = [...(results.errors || []), ...publishScripts.errors]
    }

    if (publishScreens.errors) {
      results.success = false
      results.errors = [...(results.errors || []), ...publishScreens.errors]
    }

    if (publishDiagnoses.errors) {
      results.success = false
      results.errors = [...(results.errors || []), ...publishDiagnoses.errors]
    }

    if (publishProblems.errors) {
      results.success = false
      results.errors = [...(results.errors || []), ...publishProblems.errors]
    }

    if (processPendingDeletion.errors) {
      results.success = false
      results.errors = [...(results.errors || []), ...processPendingDeletion.errors]
    }

    const editorInfoSave = await _saveEditorInfo({
      increaseVersion: results.success,
      broadcastAction: true,
      data: { lastPublishDate: new Date() },
    })

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
