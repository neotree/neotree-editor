import { and, eq, inArray, isNotNull, or, sql } from "drizzle-orm"

import { _saveChangeLogs, type SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import type { DbOrTransaction } from "@/databases/pg/db-client"
import { dataKeys, dataKeysDrafts, dataKeysHistory, pendingDeletion } from "@/databases/pg/schema"
import { _saveDataKeysHistory } from "./_history"
import { v4 } from "uuid"
import { getPublishedEntityVersion } from "@/lib/changelog-rollback"
import { removeHexCharacters } from "@/databases/utils"

export async function _publishDataKeys(opts?: {
  broadcastAction?: boolean
  userId?: string | null
  publisherUserId?: string | null
  dataVersion?: number
  allowConfidentialDowngrade?: boolean
  client?: DbOrTransaction
}) {
  const results: { success: boolean; errors?: string[] } = { success: false }
  const errors: string[] = []
  const changeLogs: SaveChangeLogData[] = []

  if (!opts?.client || !Number.isFinite(opts?.dataVersion)) {
    return {
      success: false,
      errors: ["Data key publish must run inside a release transaction with a valid dataVersion"],
    }
  }

  try {
    const executor = async (client: DbOrTransaction) => {
    let deleted = await client.query.pendingDeletion.findMany({
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

      const deletedRows = await client
        .update(dataKeys)
        .set({
          deletedAt,
          uniqueKey: sql`CONCAT(${dataKeys.uniqueKey}, '_', ${dataKeys.uuid})`, // make the unique key available for use
          version: sql`${dataKeys.version} + 1`,
        })
        .where(
          inArray(
            dataKeys.uuid,
            deleted.map((c) => c.dataKeyId!),
          ),
        )
        .returning()
      const deletedById = new Map(deletedRows.map((row) => [row.uuid, row]))

      const historyPayload = deleted.map((c) => {
        const nextVersion =
          deletedById.get(c.dataKeyId!)?.version ??
          getPublishedEntityVersion({ currentVersion: c.dataKey?.version, isCreate: false })
        return {
          version: nextVersion,
          dataKeyId: c.dataKeyId!,
          changes: {
            action: "delete_data_key",
            description: "Delete data key",
            oldValues: [{ deletedAt: null, uniqueKey: c.dataKey?.uniqueKey, }],
            newValues: [{ deletedAt, uniqueKey: [c.dataKey?.uniqueKey || '', c.dataKey?.uuid || ''].filter(s => s).join('_'), }],
          },
        }
      })

      await client.insert(dataKeysHistory).values(historyPayload)

      if (opts?.publisherUserId) {
        for (let index = 0; index < deleted.length; index++) {
          const entry = deleted[index]
          const history = historyPayload[index]
          if (!entry?.dataKeyId) continue

          const previousSnapshot = removeHexCharacters(entry.dataKey ?? {})
          const snapshot = removeHexCharacters({
            ...(entry.dataKey ?? {}),
            deletedAt,
            uniqueKey: [entry.dataKey?.uniqueKey || "", entry.dataKey?.uuid || ""].filter((s) => s).join("_"),
          })

          const nextVersion = history.version
          changeLogs.push({
            entityId: entry.dataKeyId,
            entityType: "data_key",
            action: "delete",
            version: nextVersion,
            dataVersion: opts.dataVersion,
            changes: history.changes,
            fullSnapshot: snapshot,
            previousSnapshot,
            baselineSnapshot: previousSnapshot,
            description: history.changes.description,
            userId: opts.publisherUserId,
            dataKeyId: entry.dataKeyId,
            isActive: true,
          })
        }
      }
    }

    await client
      .delete(pendingDeletion)
      .where(
        and(
          or(isNotNull(pendingDeletion.dataKeyId), isNotNull(pendingDeletion.dataKeyDraftId)),
          !opts?.userId ? undefined : eq(pendingDeletion.createdByUserId, opts.userId),
        ),
      )

    let updates: (typeof dataKeysDrafts.$inferSelect)[] = []
    let inserts: (typeof dataKeysDrafts.$inferSelect)[] = []

    const res = await client.query.dataKeysDrafts.findMany({
      where: !opts?.userId ? undefined : eq(dataKeysDrafts.createdByUserId, opts?.userId),
    })

    updates = res.filter((s) => s.dataKeyId)
    inserts = res.filter((s) => !s.dataKeyId)

    if (updates.length) {
      // we'll use data before to compare changes
      let dataBefore: (typeof dataKeys.$inferSelect)[] = []
      const successfulUpdates: typeof dataKeysDrafts.$inferSelect[] = []
      if (updates.filter((c) => c.dataKeyId).length) {
        dataBefore = await client.query.dataKeys.findMany({
          where: inArray(
            dataKeys.uuid,
            updates.filter((c) => c.dataKeyId).map((c) => c.dataKeyId!),
          ),
        })
      }

      for (const { dataKeyId: _dataKeyId, data: c } of updates) {
        const dataKeyId = _dataKeyId!
        const current = dataBefore.find((d) => d.uuid === dataKeyId)
        const sourceDraft = updates.find((draft) => draft.dataKeyId === dataKeyId)

        const { uuid: __uuid, id, createdAt, updatedAt, deletedAt, ...payload } = c

        if (!opts?.allowConfidentialDowngrade && current?.confidential === true && payload.confidential === false) {
          errors.push(
            `Cannot downgrade confidential data key "${current.name || dataKeyId}" during publish. ` +
              `Set allowConfidentialDowngrade=true for an explicit downgrade.`,
          )
          continue
        }

        const nextData = {
          ...payload,
          publishDate: new Date(),
          version: sql`${dataKeys.version} + 1`,
        }

        const [persisted] = await client.update(dataKeys).set(nextData).where(eq(dataKeys.uuid, dataKeyId)).returning()
        if (persisted && sourceDraft) successfulUpdates.push({ ...sourceDraft, data: persisted })
      }

      const updateChangeLogs = await _saveDataKeysHistory({
        drafts: successfulUpdates,
        previous: dataBefore,
        userId: opts?.publisherUserId,
        client,
      })
      changeLogs.push(...updateChangeLogs.map(log => ({
        ...log,
        dataVersion: opts?.dataVersion
      })))

      if (errors.length) {
        throw new Error(errors.join(", "))
      }

      updates = successfulUpdates
    }

    if (inserts.length) {
      // we'll use data before to compare changes
      let dataBefore: (typeof dataKeys.$inferSelect)[] = []
      const persistedInserts: typeof dataKeysDrafts.$inferSelect[] = []
      if (inserts.filter((c) => c.dataKeyId).length) {
        dataBefore = await client.query.dataKeys.findMany({
          where: inArray(
            dataKeys.uuid,
            inserts.filter((c) => c.dataKeyId).map((c) => c.dataKeyId!),
          ),
        })
      }

      for (const { id, data } of inserts) {
        const dataKeyUuid = data.uuid || v4()
        const { id: _id, ...payload } = {
          ...data,
          uuid: dataKeyUuid,
          version: getPublishedEntityVersion({ currentVersion: data.version, isCreate: true }),
        }
        inserts = inserts.map((d) => {
          if (d.id === id) d.data.uuid = dataKeyUuid
          return d
        })

        const [persisted] = await client.insert(dataKeys).values(payload).returning()
        const sourceDraft = inserts.find((draft) => draft.id === id)
        if (persisted && sourceDraft) persistedInserts.push({ ...sourceDraft, data: persisted })
      }

      const insertChangeLogs = await _saveDataKeysHistory({
        drafts: persistedInserts,
        previous: dataBefore,
        userId: opts?.publisherUserId,
        client,
      })
      changeLogs.push(...insertChangeLogs.map(log => ({
        ...log,
        dataVersion: opts?.dataVersion
      })))

      if (errors.length) {
        throw new Error(errors.join(", "))
      }

      inserts = persistedInserts
    }

    await client.delete(dataKeysDrafts).where(!opts?.userId ? undefined : eq(dataKeysDrafts.createdByUserId, opts.userId))

    if (changeLogs.length) {
      const saveResult = await _saveChangeLogs({ data: changeLogs, client })
      if (!saveResult.success) throw new Error(saveResult.errors?.join(", ") || "Failed to save data key changelogs")
    }

    if (errors.length) {
      throw new Error(errors.join(", "))
    }

    results.success = true
    }

    if (opts?.client) {
      await executor(opts.client)
    }
  } catch (e: any) {
    results.success = false
    results.errors = [e.message]
    logger.error("_publishDataKeys ERROR", e)
  }

  return results
}
