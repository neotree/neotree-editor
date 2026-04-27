import { and, eq, inArray, isNotNull, or, sql } from "drizzle-orm"
import { v4 } from "uuid"

import { _saveChangeLogs, type SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import type { DbOrTransaction } from "@/databases/pg/db-client"
import {
  scripts,
  screensDrafts,
  diagnosesDrafts,
  problemsDrafts,
  pendingDeletion,
  scriptsHistory,
  scriptsDrafts,
} from "@/databases/pg/schema"
import { removeHexCharacters } from "@/databases/utils"
import { _saveScriptsHistory } from "./_scripts_history"

export async function _publishScripts({
  userId,
  publisherUserId,
  dataVersion,
  client,
}: {
  userId?: string | null
  publisherUserId?: string | null
  dataVersion?: number
  client?: DbOrTransaction
}) {
  const results: { success: boolean; errors?: string[] } = { success: false }
  const changeLogs: SaveChangeLogData[] = []

  try {
    const executor = client || db
    const drafts = await executor.query.scriptsDrafts.findMany({
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

    const errors: string[] = []

    if (updates.length) {
      // we'll use data before to compare changes
      let dataBefore: (typeof scripts.$inferSelect)[] = []
      if (updates.filter((c) => c.scriptId).length) {
        dataBefore = await executor.query.scripts.findMany({
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
        await executor.update(scripts).set(updates).where(eq(scripts.scriptId, scriptId))

      }

      const updateChangeLogs = await _saveScriptsHistory({
        drafts: updates,
        previous: dataBefore,
        userId: publisherUserId,
        client: executor,
      })
      changeLogs.push(...updateChangeLogs.map(log => ({
        ...log,
        dataVersion: dataVersion
      })))
    }

    if (inserts.length) {
      let dataBefore: (typeof scripts.$inferSelect)[] = []
      if (inserts.filter((c) => c.scriptId).length) {
        dataBefore = await executor.query.scripts.findMany({
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

      await executor.insert(scripts).values(insertData)

      for (const { scriptId } of insertData) {
        await executor
          .update(screensDrafts)
          .set({ scriptId })
          .where(or(eq(screensDrafts.scriptId, scriptId), eq(screensDrafts.scriptDraftId, scriptId)))

        await executor
          .update(diagnosesDrafts)
          .set({ scriptId })
          .where(or(eq(diagnosesDrafts.scriptId, scriptId), eq(diagnosesDrafts.scriptDraftId, scriptId)))

        await executor
          .update(problemsDrafts)
          .set({ scriptId })
          .where(or(eq(problemsDrafts.scriptId, scriptId), eq(problemsDrafts.scriptDraftId, scriptId)))
      }
      const insertChangeLogs = await _saveScriptsHistory({
        drafts: inserts,
        previous: dataBefore,
        userId: publisherUserId,
        client: executor,
      })
       changeLogs.push(...insertChangeLogs.map(log => ({
        ...log,
        dataVersion: dataVersion
      })))
    }

    let deleted = await executor.query.pendingDeletion.findMany({
      where: and(
        isNotNull(pendingDeletion.scriptId),
        !userId ? undefined : eq(pendingDeletion.createdByUserId, userId),
      ),
      columns: { scriptId: true },
      with: {
        script: true,
      },
    })

    await executor.delete(scriptsDrafts).where(!userId ? undefined : eq(scriptsDrafts.createdByUserId, userId))

    deleted = deleted.filter((c) => c.script)

    if (deleted.length) {
      const deletedAt = new Date()

      await executor
        .update(scripts)
        .set({ deletedAt })
        .where(
          inArray(
            scripts.scriptId,
            deleted.map((c) => c.scriptId!),
          ),
        )

      const historyPayload = deleted.map((c) => ({
        version: (c.script!.version ?? 0) + 1,
        scriptId: c.scriptId!,
        changes: {
          action: "delete_script",
          description: "Delete script",
          oldValues: [{ deletedAt: null }],
          newValues: [{ deletedAt }],
        },
      }))

      await executor.insert(scriptsHistory).values(historyPayload)

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
            version: history.version || ((entry.script?.version ?? 0) + 1),
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

    await executor
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
      await executor
        .update(scripts)
        .set({ version: sql`${scripts.version} + 1` })
        .where(inArray(scripts.scriptId, published))
    }

    if (changeLogs.length) {
      const saveResult = await _saveChangeLogs({ data: changeLogs, allowPartial: !client, client: executor })
      if (saveResult.errors?.length) {
        logger.error("_publishScripts changelog error", saveResult.errors.join(", "))
        throw new Error(saveResult.errors.join(", "))
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
