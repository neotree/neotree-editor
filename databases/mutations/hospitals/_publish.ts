import { and, eq, inArray, isNotNull, or, sql } from "drizzle-orm"

import { _saveChangeLogs, type SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import { hospitals, hospitalsDrafts, hospitalsHistory, pendingDeletion } from "@/databases/pg/schema"
import { _saveHospitalsHistory } from "./_history"
import { v4 } from "uuid"

export async function _publishHospitals(opts?: {
  broadcastAction?: boolean
  userId?: string | null
  publisherUserId?: string | null
  dataVersion?: number
}) {
  const results: { success: boolean; errors?: string[] } = { success: false }
  const errors: string[] = []
  const changeLogs: SaveChangeLogData[] = []

  try {
    let updates: (typeof hospitalsDrafts.$inferSelect)[] = []
    let inserts: (typeof hospitalsDrafts.$inferSelect)[] = []

    const res = await db.query.hospitalsDrafts.findMany({
      where: !opts?.userId ? undefined : eq(hospitalsDrafts.createdByUserId, opts?.userId),
    })

    updates = res.filter((s) => s.hospitalId)
    inserts = res.filter((s) => !s.hospitalId)

    if (updates.length) {
      // we'll use data before to compare changes
      let dataBefore: (typeof hospitals.$inferSelect)[] = []
      if (updates.filter((c) => c.hospitalId).length) {
        dataBefore = await db.query.hospitals.findMany({
          where: inArray(
            hospitals.hospitalId,
            updates.filter((c) => c.hospitalId).map((c) => c.hospitalId!),
          ),
        })
      }

      for (const { hospitalId: _hospitalId, data: c } of updates) {
        const hospitalId = _hospitalId!

        const { hospitalId: __hospitalId, id, oldHospitalId, createdAt, updatedAt, deletedAt, ...payload } = c

        const updates = {
          ...payload,
          publishDate: new Date(),
        }

        await db.update(hospitals).set(updates).where(eq(hospitals.hospitalId, hospitalId)).returning()
      }

      const updateChangeLogs = await _saveHospitalsHistory({
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
      let dataBefore: (typeof hospitals.$inferSelect)[] = []
      if (inserts.filter((c) => c.hospitalId).length) {
        dataBefore = await db.query.hospitals.findMany({
          where: inArray(
            hospitals.hospitalId,
            inserts.filter((c) => c.hospitalId).map((c) => c.hospitalId!),
          ),
        })
      }

      for (const { id, data } of inserts) {
        const hospitalId = data.hospitalId || v4()
        const payload = { ...data, hospitalId }

        inserts = inserts.map((d) => {
          if (d.id === id) d.data.hospitalId = hospitalId
          return d
        })

        await db.insert(hospitals).values(payload)
      }

      const insertChangeLogs = await _saveHospitalsHistory({
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
      .delete(hospitalsDrafts)
      .where(!opts?.userId ? undefined : eq(hospitalsDrafts.createdByUserId, opts.userId))

    let deleted = await db.query.pendingDeletion.findMany({
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

      await db
        .update(hospitals)
        .set({ deletedAt })
        .where(
          inArray(
            hospitals.hospitalId,
            deleted.map((c) => c.hospitalId!),
          ),
        )

      const historyPayload = deleted.map((c) => ({
        version: c.hospital!.version,
        hospitalId: c.hospitalId!,
        changes: {
          action: "delete_hospital",
          description: "Delete hospital",
          oldValues: [{ deletedAt: null }],
          newValues: [{ deletedAt }],
        },
      }))

      await db.insert(hospitalsHistory).values(historyPayload)

      if (opts?.publisherUserId) {
        for (let index = 0; index < deleted.length; index++) {
          const entry = deleted[index]
          const history = historyPayload[index]
          if (!entry?.hospitalId) continue

          const snapshot = {
            ...(entry.hospital ?? {}),
            deletedAt,
          }

          changeLogs.push({
            entityId: entry.hospitalId,
            entityType: "hospital",
            action: "delete",
            version: history.version || 1,
            dataVersion: opts.dataVersion,
            changes: history.changes,
            fullSnapshot: JSON.parse(JSON.stringify(snapshot)),
            description: history.changes.description,
            userId: opts.publisherUserId,
            hospitalId: entry.hospitalId,
            isActive: false,
          })
        }
      }
    }

    await db
      .delete(pendingDeletion)
      .where(
        and(
          or(isNotNull(pendingDeletion.hospitalId), isNotNull(pendingDeletion.hospitalDraftId)),
          !opts?.userId ? undefined : eq(pendingDeletion.createdByUserId, opts.userId),
        ),
      )

    const published = [
      // ...inserts.map(c => c.hospitalId! || c.hospitalDraftId),
      ...updates.map((c) => c.hospitalId!),
      ...deleted.map((c) => c.hospitalId!),
    ]

    if (published.length) {
      await db
        .update(hospitals)
        .set({ version: sql`${hospitals.version} + 1` })
        .where(inArray(hospitals.hospitalId, published))
    }

    if (changeLogs.length) {
      await _saveChangeLogs({ data: changeLogs })
    }

    results.success = true
  } catch (e: any) {
    results.success = false
    results.errors = [e.message]
    logger.error("_publishHospitals ERROR", e)
  } finally {
    return results
  }
}