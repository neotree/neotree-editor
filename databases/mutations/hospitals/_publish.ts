import { and, eq, inArray, isNotNull, or, sql } from "drizzle-orm"

import { _saveChangeLogs, type SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import type { DbOrTransaction } from "@/databases/pg/db-client"
import { hospitals, hospitalsDrafts, hospitalsHistory, pendingDeletion } from "@/databases/pg/schema"
import { _saveHospitalsHistory } from "./_history"
import { v4 } from "uuid"
import { getPublishedEntityVersion } from "@/lib/changelog-rollback"
import { removeHexCharacters } from "@/databases/utils"
import { buildDeleteChangeSnapshots } from "@/lib/changelog-publish"

export async function _publishHospitals(opts?: {
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
      errors: ["Hospital publish must run inside a release transaction with a valid dataVersion"],
    }
  }

  try {
    const client = opts.client
    let updates: (typeof hospitalsDrafts.$inferSelect)[] = []
    let inserts: (typeof hospitalsDrafts.$inferSelect)[] = []

    const res = await client.query.hospitalsDrafts.findMany({
      where: !opts?.userId ? undefined : eq(hospitalsDrafts.createdByUserId, opts?.userId),
    })

    updates = res.filter((s) => s.hospitalId)
    inserts = res.filter((s) => !s.hospitalId)

    if (updates.length) {
      // we'll use data before to compare changes
      let dataBefore: (typeof hospitals.$inferSelect)[] = []
      const persistedUpdates: typeof hospitalsDrafts.$inferSelect[] = []
      if (updates.filter((c) => c.hospitalId).length) {
        dataBefore = await client.query.hospitals.findMany({
          where: inArray(
            hospitals.hospitalId,
            updates.filter((c) => c.hospitalId).map((c) => c.hospitalId!),
          ),
        })
      }

      for (const { hospitalId: _hospitalId, data: c } of updates) {
        const hospitalId = _hospitalId!
        const sourceDraft = updates.find((draft) => draft.hospitalId === hospitalId)

        const { hospitalId: __hospitalId, id, oldHospitalId, createdAt, updatedAt, deletedAt, ...payload } = c

        const nextData = {
          ...payload,
          publishDate: new Date(),
          version: sql`${hospitals.version} + 1`,
        }

        const [persisted] = await client.update(hospitals).set(nextData).where(eq(hospitals.hospitalId, hospitalId)).returning()
        if (persisted && sourceDraft) persistedUpdates.push({ ...sourceDraft, data: persisted })
      }

      const updateChangeLogs = await _saveHospitalsHistory({
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
      let dataBefore: (typeof hospitals.$inferSelect)[] = []
      const persistedInserts: typeof hospitalsDrafts.$inferSelect[] = []
      if (inserts.filter((c) => c.hospitalId).length) {
        dataBefore = await client.query.hospitals.findMany({
          where: inArray(
            hospitals.hospitalId,
            inserts.filter((c) => c.hospitalId).map((c) => c.hospitalId!),
          ),
        })
      }

      for (const { id, data } of inserts) {
        const hospitalId = data.hospitalId || v4()
        const payload = {
          ...data,
          hospitalId,
          version: getPublishedEntityVersion({ currentVersion: data.version, isCreate: true }),
        }

        inserts = inserts.map((d) => {
          if (d.id === id) d.data.hospitalId = hospitalId
          return d
        })

        const [persisted] = await client.insert(hospitals).values(payload).returning()
        const sourceDraft = inserts.find((draft) => draft.id === id)
        if (persisted && sourceDraft) persistedInserts.push({ ...sourceDraft, data: persisted })
      }

      const insertChangeLogs = await _saveHospitalsHistory({
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
      .delete(hospitalsDrafts)
      .where(!opts?.userId ? undefined : eq(hospitalsDrafts.createdByUserId, opts.userId))

    let deleted = await client.query.pendingDeletion.findMany({
      where: and(
        isNotNull(pendingDeletion.hospitalId),
        !opts?.userId ? undefined : eq(pendingDeletion.createdByUserId, opts.userId),
      ),
      columns: { hospitalId: true },
      with: {
        hospital: true,
      },
    })

    deleted = deleted.filter((c) => c.hospital)

    if (deleted.length) {
      const deletedAt = new Date()

      const deletedRows = await client
        .update(hospitals)
        .set({ deletedAt, version: sql`${hospitals.version} + 1` })
        .where(
          inArray(
            hospitals.hospitalId,
            deleted.map((c) => c.hospitalId!),
          ),
        )
        .returning()
      const deletedById = new Map(deletedRows.map((row) => [row.hospitalId, row]))

      const historyPayload = deleted.map((c) => ({
        version: deletedById.get(c.hospitalId!)?.version ?? getPublishedEntityVersion({ currentVersion: c.hospital!.version, isCreate: false }),
        hospitalId: c.hospitalId!,
        changes: {
          action: "delete_hospital",
          description: "Delete hospital",
          oldValues: [{ deletedAt: null }],
          newValues: [{ deletedAt }],
        },
      }))

      await client.insert(hospitalsHistory).values(historyPayload)

      if (opts?.publisherUserId) {
        for (let index = 0; index < deleted.length; index++) {
          const entry = deleted[index]
          const history = historyPayload[index]
          if (!entry?.hospitalId) continue

          const { previousSnapshot, fullSnapshot } = buildDeleteChangeSnapshots({
            previousEntity: entry.hospital ?? {},
            deletedFields: { deletedAt },
            sanitize: removeHexCharacters,
          })

          changeLogs.push({
            entityId: entry.hospitalId,
            entityType: "hospital",
            action: "delete",
            version: history.version,
            dataVersion: opts.dataVersion,
            changes: history.changes,
            fullSnapshot,
            previousSnapshot,
            baselineSnapshot: previousSnapshot,
            description: history.changes.description,
            userId: opts.publisherUserId,
            hospitalId: entry.hospitalId,
            isActive: true,
          })
        }
      }
    }

    await client
      .delete(pendingDeletion)
      .where(
        and(
          or(isNotNull(pendingDeletion.hospitalId), isNotNull(pendingDeletion.hospitalDraftId)),
          !opts?.userId ? undefined : eq(pendingDeletion.createdByUserId, opts.userId),
        ),
      )

    if (changeLogs.length) {
      const saveResult = await _saveChangeLogs({ data: changeLogs, client })
      if (!saveResult.success) throw new Error(saveResult.errors?.join(", ") || "Failed to save hospital changelogs")
    }

    results.success = true
  } catch (e: any) {
    results.success = false
    results.errors = [e.message]
    logger.error("_publishHospitals ERROR", e)
  }

  return results
}
