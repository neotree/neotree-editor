import { and, eq, inArray, isNotNull, or, sql } from "drizzle-orm"
import { v4 } from "uuid"

import { _saveChangeLogs, type SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import {
  scripts,
  screensDrafts,
  diagnosesDrafts,
  pendingDeletion,
  scriptsHistory,
  scriptsDrafts,
} from "@/databases/pg/schema"
import { removeHexCharacters } from "@/databases/utils"
import { _saveScriptsHistory } from "./_scripts_history"
import { _publishScreens } from "./_screens_publish"
import { _publishDiagnoses } from "./_diagnoses_publish"

export async function _publishScripts({
  userId,
  publisherUserId,
  dataVersion,
}: {
  userId?: string | null
  publisherUserId?: string | null
  dataVersion?: number
}) {
  const results: { success: boolean; errors?: string[] } = { success: false }
  const changeLogs: SaveChangeLogData[] = []

  try {
    const drafts = await db.query.scriptsDrafts.findMany({
      where: !userId ? undefined : eq(scriptsDrafts.createdByUserId, userId),
    })
    const inserts = drafts
      .filter((c) => !c.scriptId)
      .map((s) => ({
        ...s,
        scriptId: s.data.scriptId || v4(),
        data: { ...s.data, scriptId: s.data.scriptId || v4() },
      }))
    const updates = drafts.filter((c) => c.scriptId)

    const scriptsIdsAndScriptsDraftsIds = [...inserts.map((s) => s.scriptId!), ...updates.map((s) => s.scriptId!)]

    const errors: string[] = []
    const processedScripts: { scriptId: string; errors?: string[] }[] = []

    if (updates.length) {
      // we'll use data before to compare changes
      let dataBefore: (typeof scripts.$inferSelect)[] = []
      if (updates.filter((c) => c.scriptId).length) {
        dataBefore = await db.query.scripts.findMany({
          where: inArray(
            scripts.scriptId,
            updates.filter((c) => c.scriptId).map((c) => c.scriptId!),
          ),
        })
      }

      for (const { scriptId: _scriptId, data: c } of updates) {
        const scriptId = _scriptId!

        const { scriptId: __scriptId, id, oldScriptId, createdAt, updatedAt, deletedAt, ...payload } = c

        const updates = {
          ...payload,
          publishDate: new Date(),
        }
        await db.update(scripts).set(updates).where(eq(scripts.scriptId, scriptId))

        processedScripts.push({ scriptId })
      }

      const updateChangeLogs = await _saveScriptsHistory({
        drafts: updates,
        previous: dataBefore,
        userId: publisherUserId,
      })
      changeLogs.push(...updateChangeLogs.map(log => ({
        ...log,
        dataVersion: dataVersion
      })))
    }

    if (inserts.length) {
      let dataBefore: (typeof scripts.$inferSelect)[] = []
      if (inserts.filter((c) => c.scriptId).length) {
        dataBefore = await db.query.scripts.findMany({
          where: inArray(
            scripts.scriptId,
            inserts.filter((c) => c.scriptId).map((c) => c.scriptId!),
          ),
        })
      }

      const insertData = inserts.map((s) => ({
        ...s.data,
        scriptId: s.scriptDraftId,
      }))

      await db.insert(scripts).values(insertData)

      for (const { scriptId } of insertData) {
        processedScripts.push({ scriptId })

        await db
          .update(screensDrafts)
          .set({ scriptId })
          .where(or(eq(screensDrafts.scriptId, scriptId), eq(screensDrafts.scriptDraftId, scriptId)))

        await db
          .update(diagnosesDrafts)
          .set({ scriptId })
          .where(or(eq(diagnosesDrafts.scriptId, scriptId), eq(diagnosesDrafts.scriptDraftId, scriptId)))
      }
      const insertChangeLogs = await _saveScriptsHistory({
        drafts: inserts,
        previous: dataBefore,
        userId: publisherUserId,
      })
       changeLogs.push(...insertChangeLogs.map(log => ({
        ...log,
        dataVersion: dataVersion
      })))
    }

    if (processedScripts.length) {
      const publishScreens = await _publishScreens({
        userId,
        publisherUserId,
        scriptsIds: processedScripts.map((s) => s.scriptId),
        dataVersion,
      })
      if (publishScreens.errors) throw new Error(publishScreens.errors.join(", "))

      const publishDiagnoses = await _publishDiagnoses({
        userId,
        publisherUserId,
        scriptsIds: processedScripts.map((s) => s.scriptId),
        dataVersion,
      })
      if (publishDiagnoses.errors) throw new Error(publishDiagnoses.errors.join(", "))
    }

    let deleted = await db.query.pendingDeletion.findMany({
      where: and(
        isNotNull(pendingDeletion.scriptId),
        !userId ? undefined : eq(pendingDeletion.createdByUserId, userId),
      ),
      columns: { scriptId: true },
      with: {
        script: true,
      },
    })

    await db.delete(scriptsDrafts).where(!userId ? undefined : eq(scriptsDrafts.createdByUserId, userId))

    deleted = deleted.filter((c) => c.script)

    if (deleted.length) {
      const deletedAt = new Date()

      await db
        .update(scripts)
        .set({ deletedAt })
        .where(
          inArray(
            scripts.scriptId,
            deleted.map((c) => c.scriptId!),
          ),
        )

      const historyPayload = deleted.map((c) => ({
        version: c.script!.version,
        scriptId: c.scriptId!,
        changes: {
          action: "delete_config_key",
          description: "Delete config key",
          oldValues: [{ deletedAt: null }],
          newValues: [{ deletedAt }],
        },
      }))

      await db.insert(scriptsHistory).values(historyPayload)

      if (publisherUserId) {
        for (let index = 0; index < deleted.length; index++) {
          const entry = deleted[index]
          const history = historyPayload[index]
          if (!entry?.scriptId) continue

          const snapshot = removeHexCharacters({
            ...(entry.script ?? {}),
            deletedAt,
          })

          changeLogs.push({
            entityId: entry.scriptId,
            entityType: "script",
            action: "delete",
            version: history.version || 1,
            dataVersion,
            changes: history.changes,
            fullSnapshot: snapshot,
            previousSnapshot: snapshot,
            baselineSnapshot: snapshot,
            description: history.changes.description,
            userId: publisherUserId,
            scriptId: entry.scriptId,
            isActive: false,
          })
        }
      }
    }

    await db
      .delete(pendingDeletion)
      .where(
        and(
          or(isNotNull(pendingDeletion.scriptId), isNotNull(pendingDeletion.scriptDraftId)),
          !userId ? undefined : eq(pendingDeletion.createdByUserId, userId),
        ),
      )

    const published = [
      // ...inserts.map(c => c.scriptId! || c.scriptDraftId),
      ...updates.map((c) => c.scriptId!),
      ...deleted.map((c) => c.scriptId!),
    ]

    if (published.length) {
      await db
        .update(scripts)
        .set({ version: sql`${scripts.version} + 1` })
        .where(inArray(scripts.scriptId, published))
    }

    if (changeLogs.length) {
      const saveResult = await _saveChangeLogs({ data: changeLogs, allowPartial: true })
      if (saveResult.errors?.length) {
        logger.error("_publishScripts changelog warnings", saveResult.errors.join(", "))
      }
    }

    results.success = true
  } catch (e: any) {
    results.success = false
    results.errors = [e.message]
    logger.error("_publishScripts ERROR", e.message)
  } finally {
    return results
  }
}
