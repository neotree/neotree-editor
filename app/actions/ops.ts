"use server"

import { revalidatePath as _revalidatePath } from "next/cache"

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
import { _getEditorInfo, type GetEditorInfoResults } from "@/databases/queries/editor-info"
import { _saveChangeLog } from "@/databases/mutations/changelogs/_save-change-log"
import { buildReleasePublishChangeLog } from "@/databases/mutations/changelogs"
import db from "@/databases/pg/drizzle"
import { editorInfo } from "@/databases/pg/schema"
import { eq, sql } from "drizzle-orm"

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
  const results: { success: boolean; errors?: string[] } = { success: true }
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

    await db.transaction(async (tx) => {
      const lockedEditor = await tx.execute<{ id: number; dataVersion: number }>(
        sql`select id, data_version as "dataVersion" from nt_editor_info limit 1 for update`,
      )
      const editor = lockedEditor?.[0]
      if (!editor?.id || !Number.isFinite(editor.dataVersion)) {
        throw new Error("Failed to lock editor info")
      }

      const nextDataVersion = Number(editor.dataVersion) + 1

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

      await tx
        .update(editorInfo)
        .set({ dataVersion: nextDataVersion, lastPublishDate: new Date() })
        .where(eq(editorInfo.id, editor.id))

      if (publisherUserId) {
        const releaseLog = await _saveChangeLog({
          data: buildReleasePublishChangeLog({
            dataVersion: nextDataVersion,
            userId: publisherUserId,
          }),
          client: tx,
        })

        if (!releaseLog.success) {
          throw new Error(releaseLog.errors?.join(", ") || "Failed to save release changelog")
        }
      }
    })

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
