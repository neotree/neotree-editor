import { and, eq, inArray, isNotNull, or, sql } from "drizzle-orm"

import { _saveChangeLogs, type SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import type { DbOrTransaction } from "@/databases/pg/db-client"
import { drugsLibrary, drugsLibraryDrafts, drugsLibraryHistory, pendingDeletion } from "@/databases/pg/schema"
import { _saveDrugsLibraryItemsHistory } from "./_drugs-library-history"
import { v4 } from "uuid"
import { removeHexCharacters } from "@/databases/utils"
import { getPublishedEntityVersion } from "@/lib/changelog-rollback"
import { buildDeleteChangeSnapshots } from "@/lib/changelog-publish"

export async function _publishDrugsLibraryItems(opts?: {
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
      errors: ["Drugs library publish must run inside a release transaction with a valid dataVersion"],
    }
  }

  try {
    const client = opts.client
    let deleted = await client.query.pendingDeletion.findMany({
      where: and(
        isNotNull(pendingDeletion.drugsLibraryItemId),
        !opts?.userId ? undefined : eq(pendingDeletion.createdByUserId, opts.userId),
      ),
      columns: { drugsLibraryItemId: true },
      with: {
        drugsLibraryItem: true,
      },
    })

    deleted = deleted.filter((c) => c.drugsLibraryItem)

    if (deleted.length) {
      const deletedAt = new Date()

      const deletedRows = await client
        .update(drugsLibrary)
        .set({
          deletedAt,
          key: sql`CONCAT(${drugsLibrary.key}, '_', ${drugsLibrary.itemId})`, // make the unique key available for use
          version: sql`${drugsLibrary.version} + 1`,
        })
        .where(
          inArray(
            drugsLibrary.itemId,
            deleted.map((c) => c.drugsLibraryItemId!),
          ),
        )
        .returning()
      const deletedById = new Map(deletedRows.map((row) => [row.itemId, row]))

      const historyPayload = deleted.map((c) => ({
        version:
          deletedById.get(c.drugsLibraryItemId!)?.version ??
          getPublishedEntityVersion({ currentVersion: c.drugsLibraryItem!.version, isCreate: false }),
        itemId: c.drugsLibraryItemId!,
        changes: {
          action: "delete_drugs_library_item",
          description: "Delete drugs library item",
          oldValues: [{ deletedAt: null, key: c.drugsLibraryItem!.key }],
          newValues: [{ deletedAt, key: `${c.drugsLibraryItem!.key}_${c.drugsLibraryItemId}` }],
        },
      }))

      await client.insert(drugsLibraryHistory).values(historyPayload)

      if (opts?.publisherUserId) {
        for (let index = 0; index < deleted.length; index++) {
          const entry = deleted[index]
          const history = historyPayload[index]
          if (!entry?.drugsLibraryItemId) continue

          const { previousSnapshot, fullSnapshot } = buildDeleteChangeSnapshots({
            previousEntity: entry.drugsLibraryItem ?? {},
            deletedFields: {
              deletedAt,
              key: `${entry.drugsLibraryItem?.key ?? ""}_${entry.drugsLibraryItemId}`,
            },
            sanitize: removeHexCharacters,
          })

          changeLogs.push({
            entityId: entry.drugsLibraryItemId,
            entityType: "drugs_library",
            action: "delete",
            version: history.version,
            dataVersion: opts.dataVersion,
            changes: history.changes,
            fullSnapshot,
            previousSnapshot,
            baselineSnapshot: previousSnapshot,
            description: history.changes.description,
            userId: opts.publisherUserId,
            drugsLibraryItemId: entry.drugsLibraryItemId,
            isActive: true,
          })
        }
      }
    }

    await client
      .delete(pendingDeletion)
      .where(
        and(
          or(isNotNull(pendingDeletion.drugsLibraryItemId), isNotNull(pendingDeletion.drugsLibraryItemDraftId)),
          !opts?.userId ? undefined : eq(pendingDeletion.createdByUserId, opts.userId),
        ),
      )

    let updates: (typeof drugsLibraryDrafts.$inferSelect)[] = []
    let inserts: (typeof drugsLibraryDrafts.$inferSelect)[] = []

    const res = await client.query.drugsLibraryDrafts.findMany({
      where: !opts?.userId ? undefined : eq(drugsLibraryDrafts.createdByUserId, opts?.userId),
    })

    updates = res.filter((s) => s.itemId)
    inserts = res.filter((s) => !s.itemId)

    if (updates.length) {
      let dataBefore: (typeof drugsLibrary.$inferSelect)[] = []
      const persistedUpdates: typeof drugsLibraryDrafts.$inferSelect[] = []
      if (updates.filter((c) => c.itemId).length) {
        dataBefore = await client.query.drugsLibrary.findMany({
          where: inArray(
            drugsLibrary.itemId,
            updates.filter((c) => c.itemId).map((c) => c.itemId!),
          ),
        })
      }

      for (const { itemId: _itemId, data: c } of updates) {
        const itemId = _itemId!
        const sourceDraft = updates.find((draft) => draft.itemId === itemId)

        const { itemId: __itemId, id, createdAt, updatedAt, deletedAt, ...payload } = c

        const nextData = {
          ...payload,
          publishDate: new Date(),
          version: sql`${drugsLibrary.version} + 1`,
        }

        const [persisted] = await client.update(drugsLibrary).set(nextData).where(eq(drugsLibrary.itemId, itemId)).returning()
        if (persisted && sourceDraft) persistedUpdates.push({ ...sourceDraft, data: persisted })
      }

      const updateChangeLogs = await _saveDrugsLibraryItemsHistory({
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
      let dataBefore: (typeof drugsLibrary.$inferSelect)[] = []
      const persistedInserts: typeof drugsLibraryDrafts.$inferSelect[] = []
      if (inserts.filter((c) => c.itemId).length) {
        dataBefore = await client.query.drugsLibrary.findMany({
          where: inArray(
            drugsLibrary.itemId,
            inserts.filter((c) => c.itemId).map((c) => c.itemId!),
          ),
        })
      }

      for (const { id, data } of inserts) {
        const itemId = data.itemId || v4()
        const { id: _id, ...payload } = {
          ...data,
          itemId,
          version: getPublishedEntityVersion({ currentVersion: data.version, isCreate: true }),
        };

        inserts = inserts.map((d) => {
          if (d.id === id) d.data.itemId = itemId
          return d
        })

        const [persisted] = await client.insert(drugsLibrary).values(payload).returning()
        const sourceDraft = inserts.find((draft) => draft.id === id)
        if (persisted && sourceDraft) persistedInserts.push({ ...sourceDraft, data: persisted })
      }

      const insertChangeLogs = await _saveDrugsLibraryItemsHistory({
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
      .delete(drugsLibraryDrafts)
      .where(!opts?.userId ? undefined : eq(drugsLibraryDrafts.createdByUserId, opts.userId))

    if (changeLogs.length) {
      const saveResult = await _saveChangeLogs({ data: changeLogs, client })
      if (!saveResult.success) throw new Error(saveResult.errors?.join(", ") || "Failed to save drugs library changelogs")
    }

    results.success = true
  } catch (e: any) {
    results.success = false
    results.errors = [e.message]
    logger.error("_publishDrugsLibraryItems ERROR", e.message)
  }

  return results
}
