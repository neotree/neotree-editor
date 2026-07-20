import { and, eq, inArray, isNotNull, or, sql } from "drizzle-orm"

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
import { getPublishedEntityVersion } from "@/lib/changelog-rollback"
import { buildDeleteChangeSnapshots } from "@/lib/changelog-publish"
import { buildPublishedChildScriptReference, resolvePublishedScriptId } from "@/lib/script-draft-publish"

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
}): Promise<{ success: boolean; errors?: string[] }> {
  const results: { success: boolean; errors?: string[] } = { success: false }
  const changeLogs: SaveChangeLogData[] = []

  if (!client || !Number.isFinite(dataVersion)) {
    return {
      success: false,
      errors: ["Script publish must run inside a release transaction with a valid dataVersion"],
    }
  }

  try {
    const executor = client
    const drafts = await executor.query.scriptsDrafts.findMany({
      where: !userId ? undefined : eq(scriptsDrafts.createdByUserId, userId),
    })
    const inserts = drafts
      .filter((c) => !c.scriptId)
      .map((draft) => {
        const resolvedScriptId = resolvePublishedScriptId(draft)
        return {
          ...draft,
          scriptId: resolvedScriptId,
          data: { ...draft.data, scriptId: resolvedScriptId },
        }
      })
    const updates = drafts.filter((c) => c.scriptId)

    const errors: string[] = []

    if (updates.length) {
      // we'll use data before to compare changes
      let dataBefore: (typeof scripts.$inferSelect)[] = []
      const persistedUpdates: typeof scriptsDrafts.$inferSelect[] = []
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
        const sourceDraft = updates.find((draft) => draft.scriptId === scriptId)

        const { scriptId: __scriptId, id, oldScriptId, createdAt, updatedAt, deletedAt, ...payload } = c

        const nextData = {
          ...payload,
          publishDate: new Date(),
          version: sql`${scripts.version} + 1`,
        }
        const [persisted] = await executor.update(scripts).set(nextData).where(eq(scripts.scriptId, scriptId)).returning()
        if (persisted && sourceDraft) {
          persistedUpdates.push({
            ...sourceDraft,
            data: persisted as typeof scriptsDrafts.$inferSelect["data"],
          })
        }

      }

      const updateChangeLogs = await _saveScriptsHistory({
        drafts: persistedUpdates,
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
      const persistedInserts: typeof scriptsDrafts.$inferSelect[] = []
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
        scriptId: s.data.scriptId,
        version: getPublishedEntityVersion({ currentVersion: s.data.version, isCreate: true }),
      }))

      const insertedRows = await executor.insert(scripts).values(insertData).returning()
      for (const insertedRow of insertedRows) {
        const sourceDraft = inserts.find((draft) => draft.data.scriptId === insertedRow.scriptId)
        if (sourceDraft) {
          persistedInserts.push({
            ...sourceDraft,
            data: insertedRow as typeof scriptsDrafts.$inferSelect["data"],
          })
        }
      }

      const insertChangeLogs = await _saveScriptsHistory({
        drafts: persistedInserts,
        previous: dataBefore,
        userId: publisherUserId,
        client: executor,
      })
       changeLogs.push(...insertChangeLogs.map(log => ({
        ...log,
        dataVersion: dataVersion
      })))
    }

    // Child drafts retain a cascading foreign key to the script draft. Move
    // them onto the published script before deleting the parent draft so they
    // remain available to the child publishers that run next.
    for (const draft of drafts) {
      const childScriptReference = buildPublishedChildScriptReference(draft)

      await executor
        .update(screensDrafts)
        .set(childScriptReference)
        .where(eq(screensDrafts.scriptDraftId, draft.scriptDraftId))

      await executor
        .update(diagnosesDrafts)
        .set(childScriptReference)
        .where(eq(diagnosesDrafts.scriptDraftId, draft.scriptDraftId))

      await executor
        .update(problemsDrafts)
        .set(childScriptReference)
        .where(eq(problemsDrafts.scriptDraftId, draft.scriptDraftId))

      // Child deletion requests use the same cascading parent-draft foreign
      // key. Keep them alive so the child publishers can apply them next.
      await executor
        .update(pendingDeletion)
        .set({ scriptDraftId: null })
        .where(eq(pendingDeletion.scriptDraftId, draft.scriptDraftId))
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

      const deletedRows = await executor
        .update(scripts)
        .set({ deletedAt, version: sql`${scripts.version} + 1` })
        .where(
          inArray(
            scripts.scriptId,
            deleted.map((c) => c.scriptId!),
          ),
        )
        .returning()
      const deletedById = new Map(deletedRows.map((row) => [row.scriptId, row]))

      const historyPayload = deleted.map((c) => ({
        version:
          deletedById.get(c.scriptId!)?.version ?? getPublishedEntityVersion({ currentVersion: c.script!.version, isCreate: false }),
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

          const { previousSnapshot, fullSnapshot } = buildDeleteChangeSnapshots({
            previousEntity: entry.script ?? {},
            deletedFields: { deletedAt },
            sanitize: removeHexCharacters,
          })

          changeLogs.push({
            entityId: entry.scriptId,
            entityType: "script",
            action: "delete",
            version: history.version,
            dataVersion,
            changes: history.changes,
            fullSnapshot,
            previousSnapshot,
            baselineSnapshot: previousSnapshot,
            description: history.changes.description,
            userId: publisherUserId,
            scriptId: entry.scriptId,
            isActive: true,
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

    if (changeLogs.length) {
      const saveResult = await _saveChangeLogs({ data: changeLogs, client: executor })
      if (!saveResult.success) throw new Error(saveResult.errors?.join(", ") || "Failed to save script changelogs")
    }

    results.success = true
  } catch (e: any) {
    results.success = false
    results.errors = [e.message]
    logger.error("_publishScripts ERROR", e.message)
  }

  return results
}
