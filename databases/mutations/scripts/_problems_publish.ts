import { and, eq, inArray, isNotNull, or, sql } from "drizzle-orm"

import { _saveChangeLogs, type SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import type { DbOrTransaction } from "@/databases/pg/db-client"
import { problems, problemsDrafts, problemsHistory, pendingDeletion } from "@/databases/pg/schema"
import { _saveProblemsHistory } from "./_problems_history"
import { v4 } from "uuid"
import { removeHexCharacters } from "@/databases/utils"

export async function _publishProblems(opts?: {
  scriptsIds?: string[]
  problemsIds?: string[]
  broadcastAction?: boolean
  userId?: string | null
  publisherUserId?: string | null
  dataVersion?: number
  client?: DbOrTransaction
}) {
  const { scriptsIds, problemsIds } = { ...opts }

  const results: { success: boolean; errors?: string[] } = { success: false }
  const errors: string[] = []
  const changeLogs: SaveChangeLogData[] = []

  try {
    const client = opts?.client ?? db
    let updates: (typeof problemsDrafts.$inferSelect)[] = []
    let inserts: (typeof problemsDrafts.$inferSelect)[] = []

    if (scriptsIds?.length || problemsIds?.length) {
      const res = await client.query.problemsDrafts.findMany({
        where: and(
          or(
            !scriptsIds?.length ? undefined : inArray(problemsDrafts.scriptId, scriptsIds),
            !scriptsIds?.length ? undefined : inArray(problemsDrafts.scriptDraftId, scriptsIds),
            !problemsIds?.length ? undefined : inArray(problemsDrafts.problemId, problemsIds),
            !problemsIds?.length ? undefined : inArray(problemsDrafts.problemDraftId, problemsIds),
          ),
          !opts?.userId ? undefined : eq(problemsDrafts.createdByUserId, opts.userId),
        ),
      })

      updates = res.filter((s) => s.problemId)
      inserts = res.filter((s) => !s.problemId)
    } else {
      const _problemsDrafts = await client.query.problemsDrafts.findMany({
        where: and(
          isNotNull(problemsDrafts.scriptId),
          !opts?.userId ? undefined : eq(problemsDrafts.createdByUserId, opts.userId),
        ),
      })
      updates = _problemsDrafts.filter((s) => s.problemId)
      inserts = _problemsDrafts.filter((s) => !s.problemId)
    }

    if (updates.length) {
      // we'll use data before to compare changes
      let dataBefore: (typeof problems.$inferSelect)[] = []
      if (updates.filter((c) => c.problemId).length) {
        dataBefore = await client.query.problems.findMany({
          where: inArray(
            problems.problemId,
            updates.filter((c) => c.problemId).map((c) => c.problemId!),
          ),
        })
      }

      for (const { problemId: _problemId, data: c } of updates) {
        const problemId = _problemId!

        const { problemId: __problemId, id, createdAt, updatedAt, deletedAt, ...payload } = c

        const updates = {
          ...payload,
          publishDate: new Date(),
        }

        await client.update(problems).set(updates).where(eq(problems.problemId, problemId)).returning()
      }

      const updateChangeLogs = await _saveProblemsHistory({
        drafts: updates,
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
      let dataBefore: (typeof problems.$inferSelect)[] = []
      if (inserts.filter((c) => c.problemId).length) {
        dataBefore = await client.query.problems.findMany({
          where: inArray(
            problems.problemId,
            inserts.filter((c) => c.problemId).map((c) => c.problemId!),
          ),
        })
      }

      for (const { id, scriptId: _scriptId, scriptDraftId, data } of inserts) {
        const problemId = data.problemId || v4()
        const scriptId = (data.scriptId || _scriptId || scriptDraftId)!
        const payload = { ...data, problemId, scriptId }

        inserts = inserts.map((d) => {
          if (d.id === id) d.data.problemId = problemId
          return d
        })

        await client.insert(problems).values(payload)
      }

      const insertChangeLogs = await _saveProblemsHistory({
        drafts: inserts,
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
      await client.delete(problemsDrafts).where(inArray(problemsDrafts.id, processedDraftIds))
    }

    let deleted = await client.query.pendingDeletion.findMany({
      where: and(
        isNotNull(pendingDeletion.problemId),
        scriptsIds?.length ? inArray(pendingDeletion.problemScriptId, scriptsIds) : undefined,
        problemsIds?.length ? inArray(pendingDeletion.problemId, problemsIds) : undefined,
        !opts?.userId ? undefined : eq(pendingDeletion.createdByUserId, opts.userId),
      ),
      columns: { id: true, problemId: true },
      with: {
        problem: true,
      },
    })

    deleted = deleted.filter((c) => c.problem)

    if (deleted.length) {
      const deletedAt = new Date()

      await client
        .update(problems)
        .set({ deletedAt })
        .where(
          inArray(
            problems.problemId,
            deleted.map((c) => c.problemId!),
          ),
        )

      const historyPayload = deleted.map((c) => ({
        version: c.problem!.version,
        problemId: c.problemId!,
        scriptId: c.problem!.scriptId,
        changes: {
          action: "delete_problem",
          description: "Delete problem",
          oldValues: [{ deletedAt: null }],
          newValues: [{ deletedAt }],
        },
      }))

      await client.insert(problemsHistory).values(historyPayload)

      if (opts?.publisherUserId) {
        for (let index = 0; index < deleted.length; index++) {
          const entry = deleted[index]
          const history = historyPayload[index]
          if (!entry?.problemId) continue

          const snapshot = removeHexCharacters({
            ...(entry.problem ?? {}),
            deletedAt,
          })

          changeLogs.push({
            entityId: entry.problemId,
            entityType: "problem",
            action: "delete",
            version: history.version || 1,
            dataVersion: opts.dataVersion,
            changes: history.changes,
            fullSnapshot: snapshot,
            description: history.changes.description,
            userId: opts.publisherUserId,
            scriptId: entry.problem?.scriptId || null,
            problemId: entry.problemId,
            isActive: true,
          })
        }
      }
    }

    if (deleted.length) {
      await client.delete(pendingDeletion).where(inArray(pendingDeletion.id, deleted.map((entry) => entry.id)))
    }

    const published = [
      // ...inserts.map(c => c.problemId! || c.problemDraftId),
      ...updates.map((c) => c.problemId!),
      ...deleted.map((c) => c.problemId!),
    ]

    if (published.length) {
      await client
        .update(problems)
        .set({ version: sql`${problems.version} + 1` })
        .where(inArray(problems.problemId, published))
    }

    if (changeLogs.length) {
      const saveResult = await _saveChangeLogs({ data: changeLogs, client })
      if (!saveResult.success) throw new Error(saveResult.errors?.join(", ") || "Failed to save problem changelogs")
    }

    results.success = true
  } catch (e: any) {
    results.success = false
    results.errors = [e.message]
    logger.error("_publishProblems ERROR", e)
  } finally {
    return results
  }
}
