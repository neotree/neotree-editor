import { and, eq, inArray, isNotNull, or, sql } from "drizzle-orm"

import { _saveChangeLogs, type SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import { configKeys, configKeysDrafts, configKeysHistory, pendingDeletion } from "@/databases/pg/schema"
import { _saveConfigKeysHistory } from "./_config-keys-history"
import { v4 } from "uuid"

export async function _publishConfigKeys(opts?: {
  broadcastAction?: boolean
  userId?: string | null
  publisherUserId?: string | null
  dataVersion?: number
}) {
  const results: { success: boolean; errors?: string[] } = { success: false }
  const errors: string[] = []
  const changeLogs: SaveChangeLogData[] = []

  try {
    let updates: (typeof configKeysDrafts.$inferSelect)[] = []
    let inserts: (typeof configKeysDrafts.$inferSelect)[] = []

    const res = await db.query.configKeysDrafts.findMany({
      where: !opts?.userId ? undefined : eq(configKeysDrafts.createdByUserId, opts?.userId),
    })

    updates = res.filter((s) => s.configKeyId)
    inserts = res.filter((s) => !s.configKeyId)

    if (updates.length) {
      // we'll use data before to compare changes
      let dataBefore: (typeof configKeys.$inferSelect)[] = []
      if (updates.filter((c) => c.configKeyId).length) {
        dataBefore = await db.query.configKeys.findMany({
          where: inArray(
            configKeys.configKeyId,
            updates.filter((c) => c.configKeyId).map((c) => c.configKeyId!),
          ),
        })
      }

      for (const { configKeyId: _configKeyId, data: c } of updates) {
        const configKeyId = _configKeyId!

        const { configKeyId: __configKeyId, id, oldConfigKeyId, createdAt, updatedAt, deletedAt, ...payload } = c

        const updates = {
          ...payload,
          publishDate: new Date(),
        }

        await db.update(configKeys).set(updates).where(eq(configKeys.configKeyId, configKeyId)).returning()
      }

      const updateChangeLogs = await _saveConfigKeysHistory({
        drafts: updates,
        previous: dataBefore,
        userId: opts?.publisherUserId,
      })
      changeLogs.push(...updateChangeLogs.map(log => ({
        ...log,
        dataVersion: opts?.dataVersion
      })))
    }

    if (inserts.length) {
      // we'll use data before to compare changes
      let dataBefore: (typeof configKeys.$inferSelect)[] = []
      if (inserts.filter((c) => c.configKeyId).length) {
        dataBefore = await db.query.configKeys.findMany({
          where: inArray(
            configKeys.configKeyId,
            inserts.filter((c) => c.configKeyId).map((c) => c.configKeyId!),
          ),
        })
      }

      for (const { id, data } of inserts) {
        const configKeyId = data.configKeyId || v4()
        const payload = { ...data, configKeyId }

        inserts = inserts.map((d) => {
          if (d.id === id) d.data.configKeyId = configKeyId
          return d
        })

        await db.insert(configKeys).values(payload)
      }

      const insertChangeLogs = await _saveConfigKeysHistory({
        drafts: inserts,
        previous: dataBefore,
        userId: opts?.publisherUserId,
      })
      changeLogs.push(...insertChangeLogs.map(log => ({
        ...log,
        dataVersion: opts?.dataVersion
      })))
    }

    await db
      .delete(configKeysDrafts)
      .where(!opts?.userId ? undefined : eq(configKeysDrafts.createdByUserId, opts.userId))

    let deleted = await db.query.pendingDeletion.findMany({
      where: and(
        isNotNull(pendingDeletion.configKeyId),
        !opts?.userId ? undefined : eq(pendingDeletion.createdByUserId, opts.userId),
      ),
      columns: { configKeyId: true },
      with: {
        configKey: true,
      },
    })

    deleted = deleted.filter((c) => c.configKey)

    if (deleted.length) {
      const deletedAt = new Date()

      await db
        .update(configKeys)
        .set({ deletedAt })
        .where(
          inArray(
            configKeys.configKeyId,
            deleted.map((c) => c.configKeyId!),
          ),
        )

      const historyPayload = deleted.map((c) => ({
        version: c.configKey!.version,
        configKeyId: c.configKeyId!,
        changes: {
          action: "delete_config_key",
          description: "Delete config key",
          oldValues: [{ deletedAt: null }],
          newValues: [{ deletedAt }],
        },
      }))

      await db.insert(configKeysHistory).values(historyPayload)

      if (opts?.publisherUserId) {
        for (let index = 0; index < deleted.length; index++) {
          const entry = deleted[index]
          const history = historyPayload[index]
          if (!entry?.configKeyId) continue

          const snapshot = {
            ...(entry.configKey ?? {}),
            deletedAt,
          }

          changeLogs.push({
            entityId: entry.configKeyId,
            entityType: "config_key",
            action: "delete",
            version: history.version || 1,
            dataVersion: opts.dataVersion,
            changes: history.changes,
            fullSnapshot: JSON.parse(JSON.stringify(snapshot)),
            description: history.changes.description,
            userId: opts.publisherUserId,
            configKeyId: entry.configKeyId,
            isActive: false,
          })
        }
      }
    }

    await db
      .delete(pendingDeletion)
      .where(
        and(
          or(isNotNull(pendingDeletion.configKeyId), isNotNull(pendingDeletion.configKeyDraftId)),
          !opts?.userId ? undefined : eq(pendingDeletion.createdByUserId, opts.userId),
        ),
      )

    const published = [
      // ...inserts.map(c => c.configKeyId! || c.configKeyDraftId),
      ...updates.map((c) => c.configKeyId!),
      ...deleted.map((c) => c.configKeyId!),
    ]

    if (published.length) {
      await db
        .update(configKeys)
        .set({ version: sql`${configKeys.version} + 1` })
        .where(inArray(configKeys.configKeyId, published))
    }

    if (changeLogs.length) {
      await _saveChangeLogs({ data: changeLogs })
    }

    results.success = true
  } catch (e: any) {
    results.success = false
    results.errors = [e.message]
    logger.error("_publishConfigKeys ERROR", e)
  } finally {
    return results
  }
}