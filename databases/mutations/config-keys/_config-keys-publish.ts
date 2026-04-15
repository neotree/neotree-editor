import { and, eq, inArray, isNotNull, or, sql } from "drizzle-orm"

import { _saveChangeLogs, type SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import type { DbOrTransaction } from "@/databases/pg/db-client"
import { configKeys, configKeysDrafts, configKeysHistory, pendingDeletion } from "@/databases/pg/schema"
import { _saveConfigKeysHistory } from "./_config-keys-history"
import { v4 } from "uuid"
import { getPublishedEntityVersion } from "@/lib/changelog-rollback"
import { removeHexCharacters } from "@/databases/utils"
import { buildDeleteChangeSnapshots } from "@/lib/changelog-publish"

export async function _publishConfigKeys(opts?: {
  broadcastAction?: boolean
  userId?: string | null
  publisherUserId?: string | null
  dataVersion?: number
  client?: DbOrTransaction
}): Promise<{ success: boolean; errors?: string[] }> {
  const results: { success: boolean; errors?: string[] } = { success: false }
  const changeLogs: SaveChangeLogData[] = []

  if (!opts?.client || !Number.isFinite(opts?.dataVersion)) {
    return {
      success: false,
      errors: ["Config key publish must run inside a release transaction with a valid dataVersion"],
    }
  }

  try {
    const client = opts.client
    let updates: (typeof configKeysDrafts.$inferSelect)[] = []
    let inserts: (typeof configKeysDrafts.$inferSelect)[] = []

    const res = await client.query.configKeysDrafts.findMany({
      where: !opts?.userId ? undefined : eq(configKeysDrafts.createdByUserId, opts?.userId),
    })

    updates = res.filter((s) => s.configKeyId)
    inserts = res.filter((s) => !s.configKeyId)

    if (updates.length) {
      // we'll use data before to compare changes
      let dataBefore: (typeof configKeys.$inferSelect)[] = []
      const persistedUpdates: typeof configKeysDrafts.$inferSelect[] = []
      if (updates.filter((c) => c.configKeyId).length) {
        dataBefore = await client.query.configKeys.findMany({
          where: inArray(
            configKeys.configKeyId,
            updates.filter((c) => c.configKeyId).map((c) => c.configKeyId!),
          ),
        })
      }

      for (const { configKeyId: _configKeyId, data: c } of updates) {
        const configKeyId = _configKeyId!
        const sourceDraft = updates.find((draft) => draft.configKeyId === configKeyId)

        const { configKeyId: __configKeyId, id, oldConfigKeyId, createdAt, updatedAt, deletedAt, ...payload } = c

        const nextData = {
          ...payload,
          publishDate: new Date(),
          version: sql`${configKeys.version} + 1`,
        }

        const [persisted] = await client.update(configKeys).set(nextData).where(eq(configKeys.configKeyId, configKeyId)).returning()
        if (persisted && sourceDraft) persistedUpdates.push({ ...sourceDraft, data: persisted })
      }

      const updateChangeLogs = await _saveConfigKeysHistory({
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
      let dataBefore: (typeof configKeys.$inferSelect)[] = []
      const persistedInserts: typeof configKeysDrafts.$inferSelect[] = []
      if (inserts.filter((c) => c.configKeyId).length) {
        dataBefore = await client.query.configKeys.findMany({
          where: inArray(
            configKeys.configKeyId,
            inserts.filter((c) => c.configKeyId).map((c) => c.configKeyId!),
          ),
        })
      }

      for (const { id, data } of inserts) {
        const configKeyId = data.configKeyId || v4()
        const payload = {
          ...data,
          configKeyId,
          version: getPublishedEntityVersion({ currentVersion: data.version, isCreate: true }),
        }

        inserts = inserts.map((d) => {
          if (d.id === id) d.data.configKeyId = configKeyId
          return d
        })

        const [persisted] = await client.insert(configKeys).values(payload).returning()
        const sourceDraft = inserts.find((draft) => draft.id === id)
        if (persisted && sourceDraft) persistedInserts.push({ ...sourceDraft, data: persisted })
      }

      const insertChangeLogs = await _saveConfigKeysHistory({
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

    await client
      .delete(configKeysDrafts)
      .where(!opts?.userId ? undefined : eq(configKeysDrafts.createdByUserId, opts.userId))

    let deleted = await client.query.pendingDeletion.findMany({
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

      const deletedRows = await client
        .update(configKeys)
        .set({ deletedAt, version: sql`${configKeys.version} + 1` })
        .where(
          inArray(
            configKeys.configKeyId,
            deleted.map((c) => c.configKeyId!),
          ),
        )
        .returning()
      const deletedById = new Map(deletedRows.map((row) => [row.configKeyId, row]))

      const historyPayload = deleted.map((c) => ({
        version: deletedById.get(c.configKeyId!)?.version ?? getPublishedEntityVersion({ currentVersion: c.configKey!.version, isCreate: false }),
        configKeyId: c.configKeyId!,
        changes: {
          action: "delete_config_key",
          description: "Delete config key",
          oldValues: [{ deletedAt: null }],
          newValues: [{ deletedAt }],
        },
      }))

      await client.insert(configKeysHistory).values(historyPayload)

      if (opts?.publisherUserId) {
        for (let index = 0; index < deleted.length; index++) {
          const entry = deleted[index]
          const history = historyPayload[index]
          if (!entry?.configKeyId) continue

          const { previousSnapshot, fullSnapshot } = buildDeleteChangeSnapshots({
            previousEntity: entry.configKey ?? {},
            deletedFields: { deletedAt },
            sanitize: removeHexCharacters,
          })

          changeLogs.push({
            entityId: entry.configKeyId,
            entityType: "config_key",
            action: "delete",
            version: history.version,
            dataVersion: opts.dataVersion,
            changes: history.changes,
            fullSnapshot,
            previousSnapshot,
            baselineSnapshot: previousSnapshot,
            description: history.changes.description,
            userId: opts.publisherUserId,
            configKeyId: entry.configKeyId,
            isActive: true,
          })
        }
      }
    }

    await client
      .delete(pendingDeletion)
      .where(
        and(
          or(isNotNull(pendingDeletion.configKeyId), isNotNull(pendingDeletion.configKeyDraftId)),
          !opts?.userId ? undefined : eq(pendingDeletion.createdByUserId, opts.userId),
        ),
      )

    if (changeLogs.length) {
      const saveResult = await _saveChangeLogs({ data: changeLogs, client })
      if (!saveResult.success) throw new Error(saveResult.errors?.join(", ") || "Failed to save config key changelogs")
    }

    results.success = true
  } catch (e: any) {
    results.success = false
    results.errors = [e.message]
    logger.error("_publishConfigKeys ERROR", e)
  }

  return results
}
