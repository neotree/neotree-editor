import { and, eq, inArray, isNotNull, or, sql } from "drizzle-orm"

import { _saveChangeLogs, type SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import { dataKeys, dataKeysDrafts, dataKeysHistory, pendingDeletion } from "@/databases/pg/schema"
import { _saveDataKeysHistory } from "./_history"
import { v4 } from "uuid"

export async function _publishDataKeys(opts?: {
  broadcastAction?: boolean
  userId?: string | null
  publisherUserId?: string | null
  dataVersion?: number
}) {
  const results: { success: boolean; errors?: string[] } = { success: false }
  const errors: string[] = []
  const changeLogs: SaveChangeLogData[] = []

  try {
    let deleted = await db.query.pendingDeletion.findMany({
      where: and(
        isNotNull(pendingDeletion.dataKeyId),
        !opts?.userId ? undefined : eq(pendingDeletion.createdByUserId, opts.userId),
      ),
      columns: { dataKeyId: true },
      with: {
        dataKey: true,
      },
    })

    deleted = deleted.filter((c) => c.dataKey)

    if (deleted.length) {
      const deletedAt = new Date()

      await db
        .update(dataKeys)
        .set({
          deletedAt,
        })
        .where(
          inArray(
            dataKeys.uuid,
            deleted.map((c) => c.dataKeyId!),
          ),
        )

      const historyPayload = deleted.map((c) => ({
        version: c.dataKey!.version,
        dataKeyId: c.dataKeyId!,
        changes: {
          action: "delete_data_key",
          description: "Delete data key",
          oldValues: [{ deletedAt: null }],
          newValues: [{ deletedAt }],
        },
      }))

      await db.insert(dataKeysHistory).values(historyPayload)

      if (opts?.publisherUserId) {
        for (let index = 0; index < deleted.length; index++) {
          const entry = deleted[index]
          const history = historyPayload[index]
          if (!entry?.dataKeyId) continue

          const snapshot = {
            ...(entry.dataKey ?? {}),
            deletedAt,
          }

          changeLogs.push({
            entityId: entry.dataKeyId,
            entityType: "data_key",
            action: "delete",
            version: history.version || 1,
            dataVersion: opts.dataVersion,
            changes: history.changes,
            fullSnapshot: JSON.parse(JSON.stringify(snapshot)),
            description: history.changes.description,
            userId: opts.publisherUserId,
            dataKeyId: entry.dataKeyId,
            isActive: false,
          })
        }
      }
    }

    await db
      .delete(pendingDeletion)
      .where(
        and(
          or(isNotNull(pendingDeletion.dataKeyId), isNotNull(pendingDeletion.dataKeyDraftId)),
          !opts?.userId ? undefined : eq(pendingDeletion.createdByUserId, opts.userId),
        ),
      )

    let updates: (typeof dataKeysDrafts.$inferSelect)[] = []
    let inserts: (typeof dataKeysDrafts.$inferSelect)[] = []

    const res = await db.query.dataKeysDrafts.findMany({
      where: !opts?.userId ? undefined : eq(dataKeysDrafts.createdByUserId, opts?.userId),
    })

    updates = res.filter((s) => s.dataKeyId)
    inserts = res.filter((s) => !s.dataKeyId)

    if (updates.length) {
      // we'll use data before to compare changes
      let dataBefore: (typeof dataKeys.$inferSelect)[] = []
      if (updates.filter((c) => c.dataKeyId).length) {
        dataBefore = await db.query.dataKeys.findMany({
          where: inArray(
            dataKeys.uuid,
            updates.filter((c) => c.dataKeyId).map((c) => c.dataKeyId!),
          ),
        })
      }

      for (const { dataKeyId: _dataKeyId, data: c } of updates) {
        const dataKeyId = _dataKeyId!

        const { uuid: __uuid, id, createdAt, updatedAt, deletedAt, ...payload } = c

        const updates = {
          ...payload,
          publishDate: new Date(),
        }

        await db.update(dataKeys).set(updates).where(eq(dataKeys.uuid, dataKeyId)).returning()
      }

      const updateChangeLogs = await _saveDataKeysHistory({
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
      let dataBefore: (typeof dataKeys.$inferSelect)[] = []
      if (inserts.filter((c) => c.dataKeyId).length) {
        dataBefore = await db.query.dataKeys.findMany({
          where: inArray(
            dataKeys.uuid,
            inserts.filter((c) => c.dataKeyId).map((c) => c.dataKeyId!),
          ),
        })
      }

      for (const { id, data } of inserts) {
        const dataKeyUuid = data.uuid || v4()
        const { id: _id, ...payload } = { ...data, uuid: dataKeyUuid }
        inserts = inserts.map((d) => {
          if (d.id === id) d.data.uuid = dataKeyUuid
          return d
        })

        await db.insert(dataKeys).values(payload)
      }

      const insertChangeLogs = await _saveDataKeysHistory({
        drafts: inserts,
        previous: dataBefore,
        userId: opts?.publisherUserId,
      })
      changeLogs.push(...insertChangeLogs.map(log => ({
        ...log,
        dataVersion: opts?.dataVersion
      })))
    }

    await db.delete(dataKeysDrafts).where(!opts?.userId ? undefined : eq(dataKeysDrafts.createdByUserId, opts.userId))

    const published = [
      ...updates.map((c) => c.dataKeyId!),
      ...deleted.map((c) => c.dataKeyId!),
    ]

    if (published.length) {
      await db
        .update(dataKeys)
        .set({ version: sql`${dataKeys.version} + 1` })
        .where(inArray(dataKeys.uuid, published))
    }

    if (changeLogs.length) {
      await _saveChangeLogs({ data: changeLogs })
    }

    results.success = true
  } catch (e: any) {
    results.success = false
    results.errors = [e.message]
    logger.error("_publishDataKeys ERROR", e)
  } finally {
    return results
  }
}