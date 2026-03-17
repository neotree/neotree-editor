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
import { dataKeysDrafts, diagnosesDrafts, screensDrafts } from "@/databases/pg/schema"

const RELEASE_CHANGELOG_ENTITY_ID = "00000000-0000-0000-0000-000000000000"

async function getScopedIntegrityData(userId?: string | null): Promise<{
  dataKeysRes: Awaited<ReturnType<typeof dataKeysQueries._getDataKeys>>
  screensRes: Awaited<ReturnType<typeof scriptsQueries._getScreens>>
  diagnosesRes: Awaited<ReturnType<typeof scriptsQueries._getDiagnoses>>
}> {
  if (!userId) {
    const { dataKeysRes, screensRes, diagnosesRes } = await getScopedIntegrityData(userId)

    return { dataKeysRes, screensRes, diagnosesRes }
  }

  const [publishedDataKeysRes, publishedScreensRes, publishedDiagnosesRes, userDataKeyDrafts, userScreenDrafts, userDiagnosisDrafts] = await Promise.all([
    dataKeysQueries._getDataKeys({ returnDraftsIfExist: false }),
    scriptsQueries._getScreens({ returnDraftsIfExist: false }),
    scriptsQueries._getDiagnoses({ returnDraftsIfExist: false }),
    db.query.dataKeysDrafts.findMany({ where: eq(dataKeysDrafts.createdByUserId, userId) }),
    db.query.screensDrafts.findMany({ where: eq(screensDrafts.createdByUserId, userId) }),
    db.query.diagnosesDrafts.findMany({ where: eq(diagnosesDrafts.createdByUserId, userId) }),
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
  userScreenDrafts.forEach((draft) => {
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
  userDiagnosisDrafts.forEach((draft) => {
    const data = {
      ...draft.data,
      isDraft: true,
      isDeleted: false,
      draftCreatedByUserId: draft.createdByUserId,
    }
    diagnosesMap.set(draft.diagnosisId || draft.diagnosisDraftId, data as typeof publishedDiagnosesRes.data[number])
    diagnosesMap.set(draft.diagnosisDraftId, data as typeof publishedDiagnosesRes.data[number])
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

    return {
      configKeys: configKeys.data.allDrafts,
      hospitals: hospitals.data.allDrafts,
      drugsLibrary: drugsLibraryItems.data.allDrafts,
      screens: screens.data.allDrafts,
      scripts: scripts.data.allDrafts,
      diagnoses: diagnoses.data.allDrafts,
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
    }
  }
}

export async function publishData({
  scope,
}: {
  scope: number
}) {
  const results: { success: boolean; errors?: string[] } = { success: true }
  try {
    const session = await isAllowed([
      "create_config_keys",
      "update_config_keys",
      "create_scripts",
      "update_scripts",
      "create_diagnoses",
      "update_diagnoses",
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

    const { dataKeysRes, screensRes, diagnosesRes } = await getScopedIntegrityData(userId)

    const integrityErrors = [
      ...(dataKeysRes.errors || []),
      ...(screensRes.errors || []),
      ...(diagnosesRes.errors || []),
    ]

    if (integrityErrors.length) {
      results.success = false
      results.errors = integrityErrors
      return results
    }

    const repairs = repairDataKeyIntegrityReferences({
      dataKeys: dataKeysRes.data,
      screens: screensRes.data,
      diagnoses: diagnosesRes.data,
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

    const postRepairReport = scanDataKeyIntegrity({
      dataKeys: dataKeysRes.data,
      screens: repairs.screens.length ? screensRes.data.map((screen) => repairs.screens.find((item) => item.screenId === screen.screenId) || screen) : screensRes.data,
      diagnoses: repairs.diagnoses.length ? diagnosesRes.data.map((diagnosis) => repairs.diagnoses.find((item) => item.diagnosisId === diagnosis.diagnosisId) || diagnosis) : diagnosesRes.data,
      onlyIssues: true,
    })
    const publishIntegrityErrors = buildDataKeyIntegrityPublishErrors(postRepairReport)
    if (publishIntegrityErrors.length) {
      results.success = false
      results.errors = publishIntegrityErrors
      return results
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
    const session = await isAllowed(["delete_config_keys", "delete_scripts", "delete_diagnoses", "delete_screens"])

    let userId = session?.user?.userId

    if (scope === 1) userId = undefined

    await configKeysMutations._deleteAllConfigKeysDrafts({ userId })
    await hospitalsMutations._deleteAllHospitalsDrafts({ userId })
    await drugsLibraryMutations._deleteAllDrugsLibraryItemsDrafts({ userId })
    await dataKeysMutations._deleteAllDataKeysDrafts({ userId })
    await scriptsMutations._deleteAllScriptsDrafts({ userId })
    await scriptsMutations._deleteAllScreensDrafts({ userId })
    await scriptsMutations._deleteAllDiagnosesDrafts({ userId })
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
