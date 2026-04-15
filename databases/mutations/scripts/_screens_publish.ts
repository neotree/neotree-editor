import { and, eq, inArray, isNotNull, or, sql } from "drizzle-orm"

import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import type { DbOrTransaction } from "@/databases/pg/db-client"
import { pendingDeletion, screens, screensDrafts, screensHistory } from "@/databases/pg/schema"
import { _saveChangeLogs, type SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import { _saveScreensHistory } from "./_screens_history"
import { v4 } from "uuid"
import { _generateScreenAliases } from "../aliases/_aliases_save"
import { removeHexCharacters } from "@/databases/utils"
import { getPublishedEntityVersion } from "@/lib/changelog-rollback"
import { buildDeleteChangeSnapshots } from "@/lib/changelog-publish"

export async function _publishScreens(opts?: {
  scriptsIds?: string[]
  screensIds?: string[]
  broadcastAction?: boolean
  userId?: string | null
  publisherUserId?: string | null
  dataVersion?: number
  client?: DbOrTransaction
}): Promise<{ success: boolean; errors?: string[] }> {
  const { scriptsIds, screensIds } = { ...opts }

  // GENERATE ALIASES FOR ALL UPDATED SCREENS

  const results: { success: boolean; errors?: string[] } = { success: false }
  const changeLogs: SaveChangeLogData[] = []

  if (!opts?.client || !Number.isFinite(opts?.dataVersion)) {
    return {
      success: false,
      errors: ["Screen publish must run inside a release transaction with a valid dataVersion"],
    }
  }

  try {
    const client = opts.client
    let updates: (typeof screensDrafts.$inferSelect)[] = []
    let inserts: (typeof screensDrafts.$inferSelect)[] = []

    if (scriptsIds?.length || screensIds?.length) {
      const res = await client.query.screensDrafts.findMany({
        where: and(
          or(
            !scriptsIds?.length ? undefined : inArray(screensDrafts.scriptId, scriptsIds),
            !scriptsIds?.length ? undefined : inArray(screensDrafts.scriptDraftId, scriptsIds),
            !screensIds?.length ? undefined : inArray(screensDrafts.screenId, screensIds),
            !screensIds?.length ? undefined : inArray(screensDrafts.screenDraftId, screensIds),
          ),
          !opts?.userId ? undefined : eq(screensDrafts.createdByUserId, opts.userId),
        ),
      })

      updates = res.filter((s) => s.screenId)
      inserts = res.filter((s) => !s.screenId)
    } else {
      const _screensDrafts = await client.query.screensDrafts.findMany({
        where: and(
          isNotNull(screensDrafts.scriptId),
          !opts?.userId ? undefined : eq(screensDrafts.createdByUserId, opts.userId),
        ),
      })
      updates = _screensDrafts.filter((s) => s.screenId)
      inserts = _screensDrafts.filter((s) => !s.screenId)
    }

    if (updates.length) {
      // we'll use data before to compare changes
      let dataBefore: (typeof screens.$inferSelect)[] = []
      const persistedUpdates: typeof screensDrafts.$inferSelect[] = []
      if (updates.filter((c) => c.screenId).length) {
        dataBefore = await client.query.screens.findMany({
          where: inArray(
            screens.screenId,
            updates.filter((c) => c.screenId).map((c) => c.screenId!),
          ),
        })
      }

      for (const { screenId: _screenId, data: c } of updates) {
        const screenId = _screenId!
        const sourceDraft = updates.find((draft) => draft.screenId === screenId)
        const { screenId: __screenId, id, oldScreenId, createdAt, updatedAt, deletedAt, ...payload } = c

        const nextData = {
          ...payload,
          publishDate: new Date(),
          version: sql`${screens.version} + 1`,
        }

        const [persisted] = await client.update(screens).set(nextData).where(eq(screens.screenId, screenId)).returning()
        if (persisted && sourceDraft) persistedUpdates.push({ ...sourceDraft, data: persisted })
      }

      const updateChangeLogs = await _saveScreensHistory({
        drafts: persistedUpdates,
        previous: dataBefore,
        userId: opts?.publisherUserId,
        client,
      })
      changeLogs.push(...updateChangeLogs.map(log => ({
        ...log,
        dataVersion: opts?.dataVersion
      })))
    }

    if (inserts.length) {
      // we'll use data before to compare changes
      let dataBefore: (typeof screens.$inferSelect)[] = []
      const persistedInserts: typeof screensDrafts.$inferSelect[] = []
      if (inserts.filter((c) => c.screenId).length) {
        dataBefore = await client.query.screens.findMany({
          where: inArray(
            screens.screenId,
            inserts.filter((c) => c.screenId).map((c) => c.screenId!),
          ),
        })
      }

      for (const { id, scriptId: _scriptId, scriptDraftId, data } of inserts) {
        const screenId = data.screenId || v4()
        const scriptId = (data.scriptId || _scriptId || scriptDraftId)!
        const payload = {
          ...data,
          screenId,
          scriptId,
          version: getPublishedEntityVersion({ currentVersion: data.version, isCreate: true }),
        }

        inserts = inserts.map((d) => {
          if (d.id === id) d.data.screenId = screenId
          return d
        })

        const [persisted] = await client.insert(screens).values(payload).returning()
        const sourceDraft = inserts.find((draft) => draft.id === id)
        if (persisted && sourceDraft) persistedInserts.push({ ...sourceDraft, data: persisted })
      }

      const insertChangeLogs = await _saveScreensHistory({
        drafts: persistedInserts,
        previous: dataBefore,
        userId: opts?.publisherUserId,
        client,
      })
      changeLogs.push(...insertChangeLogs.map(log => ({
        ...log,
        dataVersion: opts?.dataVersion
      })))
    }

    const processedDraftIds = [...updates, ...inserts].map((entry) => entry.id)
    if (processedDraftIds.length) {
      await client.delete(screensDrafts).where(inArray(screensDrafts.id, processedDraftIds))
    }

    let deleted = await client.query.pendingDeletion.findMany({
      where: and(
        isNotNull(pendingDeletion.screenId),
        scriptsIds?.length ? inArray(pendingDeletion.screenScriptId, scriptsIds) : undefined,
        screensIds?.length ? inArray(pendingDeletion.screenId, screensIds) : undefined,
        !opts?.userId ? undefined : eq(pendingDeletion.createdByUserId, opts.userId),
      ),
      columns: { id: true, screenId: true },
      with: {
        screen: true,
      },
    })

    deleted = deleted.filter((c) => c.screen)

    if (deleted.length) {
      const deletedAt = new Date()

      const deletedRows = await client
        .update(screens)
        .set({ deletedAt, version: sql`${screens.version} + 1` })
        .where(
          inArray(
            screens.screenId,
            deleted.map((c) => c.screenId!),
          ),
        )
        .returning()
      const deletedById = new Map(deletedRows.map((row) => [row.screenId, row]))

      const historyPayload = deleted.map((c) => ({
        version: deletedById.get(c.screenId!)?.version ?? getPublishedEntityVersion({ currentVersion: c.screen!.version, isCreate: false }),
        screenId: c.screenId!,
        scriptId: c.screen!.scriptId,
        changes: {
          action: "delete_screen",
          description: "Delete screen",
          oldValues: [{ deletedAt: null }],
          newValues: [{ deletedAt }],
        },
      }))

      await client.insert(screensHistory).values(historyPayload)

      if (opts?.publisherUserId) {
        for (let index = 0; index < deleted.length; index++) {
          const entry = deleted[index]
          const history = historyPayload[index]
          if (!entry?.screenId) continue

          const { previousSnapshot, fullSnapshot } = buildDeleteChangeSnapshots({
            previousEntity: entry.screen ?? {},
            deletedFields: { deletedAt },
            sanitize: removeHexCharacters,
          })

          changeLogs.push({
            entityId: entry.screenId,
            entityType: "screen",
            action: "delete",
            version: history.version,
            dataVersion: opts.dataVersion,
            changes: history.changes,
            fullSnapshot,
            previousSnapshot,
            baselineSnapshot: previousSnapshot,
            description: history.changes.description,
            userId: opts.publisherUserId,
            scriptId: entry.screen?.scriptId || null,
            screenId: entry.screenId,
            isActive: true,
          })
        }
      }
    }

    if (deleted.length) {
      await client.delete(pendingDeletion).where(inArray(pendingDeletion.id, deleted.map((entry) => entry.id)))
    }

    const updatedScripts = Array.from(
      new Set((updates ?? []).map((ud) => ud.scriptId).filter((id): id is string => Boolean(id))),
    )
    if (updatedScripts.length) {
      await _generateScreenAliases(updatedScripts, client)
    }

    if (changeLogs.length) {
      const saveResult = await _saveChangeLogs({ data: changeLogs, client })
      if (!saveResult.success) throw new Error(saveResult.errors?.join(", ") || "Failed to save screen changelogs")
    }

    results.success = true
  } catch (e: any) {
    results.success = false
    results.errors = [e.message]
    logger.error("_publishScreens ERROR", e)
  }

  return results
}
