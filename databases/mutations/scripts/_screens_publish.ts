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

export async function _publishScreens(opts?: {
  scriptsIds?: string[]
  screensIds?: string[]
  broadcastAction?: boolean
  userId?: string | null
  publisherUserId?: string | null
  dataVersion?: number
  client?: DbOrTransaction
}) {
  const { scriptsIds, screensIds } = { ...opts }

  // GENERATE ALIASES FOR ALL UPDATED SCREENS

  const results: { success: boolean; errors?: string[] } = { success: false }
  const errors: string[] = []
  const changeLogs: SaveChangeLogData[] = []

  try {
    const executor = opts?.client || db
    let updates: (typeof screensDrafts.$inferSelect)[] = []
    let inserts: (typeof screensDrafts.$inferSelect)[] = []

    if (scriptsIds?.length || screensIds?.length) {
      const res = await executor.query.screensDrafts.findMany({
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
      const _screensDrafts = await executor.query.screensDrafts.findMany({
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
      if (updates.filter((c) => c.screenId).length) {
        dataBefore = await executor.query.screens.findMany({
          where: inArray(
            screens.screenId,
            updates.filter((c) => c.screenId).map((c) => c.screenId!),
          ),
        })
      }

      for (const { screenId: _screenId, data: c } of updates) {
        const screenId = _screenId!
        const { screenId: __screenId, id, oldScreenId, createdAt, updatedAt, deletedAt, ...payload } = c

        const updates = {
          ...payload,
          publishDate: new Date(),
        }

        await executor.update(screens).set(updates).where(eq(screens.screenId, screenId)).returning()
      }

      const updateChangeLogs = await _saveScreensHistory({
        drafts: updates,
        previous: dataBefore,
        userId: opts?.publisherUserId,
        client: executor,
      })
      changeLogs.push(...updateChangeLogs.map(log => ({
        ...log,
        dataVersion: opts?.dataVersion
      })))
    }

    if (inserts.length) {
      // we'll use data before to compare changes
      let dataBefore: (typeof screens.$inferSelect)[] = []
      if (inserts.filter((c) => c.screenId).length) {
        dataBefore = await executor.query.screens.findMany({
          where: inArray(
            screens.screenId,
            inserts.filter((c) => c.screenId).map((c) => c.screenId!),
          ),
        })
      }

      for (const { id, scriptId: _scriptId, scriptDraftId, data } of inserts) {
        const screenId = data.screenId || v4()
        const scriptId = (data.scriptId || _scriptId || scriptDraftId)!
        const payload = { ...data, screenId, scriptId }

        inserts = inserts.map((d) => {
          if (d.id === id) d.data.screenId = screenId
          return d
        })

        await executor.insert(screens).values(payload)
      }

      const insertChangeLogs = await _saveScreensHistory({
        drafts: inserts,
        previous: dataBefore,
        userId: opts?.publisherUserId,
        client: executor,
      })
      changeLogs.push(...insertChangeLogs.map(log => ({
        ...log,
        dataVersion: opts?.dataVersion
      })))
    }

    await executor.delete(screensDrafts).where(!opts?.userId ? undefined : eq(screensDrafts.createdByUserId, opts.userId))

    let deleted = await executor.query.pendingDeletion.findMany({
      where: and(
        isNotNull(pendingDeletion.screenId),
        !opts?.userId ? undefined : eq(pendingDeletion.createdByUserId, opts.userId),
      ),
      columns: { screenId: true },
      with: {
        screen: true,
      },
    })

    deleted = deleted.filter((c) => c.screen)

    if (deleted.length) {
      const deletedAt = new Date()

      await executor
        .update(screens)
        .set({ deletedAt })
        .where(
          inArray(
            screens.screenId,
            deleted.map((c) => c.screenId!),
          ),
        )

      const historyPayload = deleted.map((c) => ({
        version: (c.screen!.version ?? 0) + 1,
        screenId: c.screenId!,
        scriptId: c.screen!.scriptId,
        changes: {
          action: "delete_screen",
          description: "Delete screen",
          oldValues: [{ deletedAt: null }],
          newValues: [{ deletedAt }],
        },
      }))

      await executor.insert(screensHistory).values(historyPayload)

      if (opts?.publisherUserId) {
        for (let index = 0; index < deleted.length; index++) {
          const entry = deleted[index]
          const history = historyPayload[index]
          if (!entry?.screenId) continue

          const snapshot = removeHexCharacters({
            ...(entry.screen ?? {}),
            deletedAt,
          })

          changeLogs.push({
            entityId: entry.screenId,
            entityType: "screen",
            action: "delete",
            version: history.version || ((entry.screen?.version ?? 0) + 1),
            dataVersion: opts.dataVersion,
            changes: history.changes,
            fullSnapshot: snapshot,
            description: history.changes.description,
            userId: opts.publisherUserId,
            scriptId: entry.screen?.scriptId || null,
            screenId: entry.screenId,
            isActive: false,
          })
        }
      }
    }

    await executor
      .delete(pendingDeletion)
      .where(
        and(
          or(isNotNull(pendingDeletion.screenId), isNotNull(pendingDeletion.screenDraftId)),
          !opts?.userId ? undefined : eq(pendingDeletion.createdByUserId, opts.userId),
        ),
      )

    const published = [
      // ...inserts.map(c => c.screenId! || c.screenDraftId),
      ...updates.map((c) => c.screenId!),
      ...deleted.map((c) => c.screenId!),
    ]

    const updatedScripts = Array.from(
      new Set((updates ?? []).map((ud) => ud.scriptId).filter((id): id is string => Boolean(id))),
    )
    if (updatedScripts.length) {
      const aliasesResult = await _generateScreenAliases(updatedScripts, { client: executor })
      if (aliasesResult.errors?.length) {
        throw new Error(aliasesResult.errors.join(", "))
      }
    }

    if (published.length) {
      await executor
        .update(screens)
        .set({ version: sql`${screens.version} + 1` })
        .where(inArray(screens.screenId, published))
    }

    if (changeLogs.length) {
      const saveResult = await _saveChangeLogs({ data: changeLogs, allowPartial: !opts?.client, client: executor })
      if (saveResult.errors?.length) {
        logger.error("_publishScreens changelog error", saveResult.errors.join(", "))
        throw new Error(saveResult.errors.join(", "))
      }
    }

    results.success = true
  } catch (e: any) {
    results.success = false
    results.errors = [e.message]
    logger.error("_publishScreens ERROR", e)
  } finally {
    return results
  }
}
