import { and, eq, inArray, isNotNull, or, sql } from "drizzle-orm"

import { _saveChangeLogs, type SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import type { DbOrTransaction } from "@/databases/pg/db-client"
import { problems, problemsDrafts, problemsHistory, pendingDeletion } from "@/databases/pg/schema"
import { _saveProblemsHistory } from "./_problems_history"
import { v4 } from "uuid"
import { removeHexCharacters } from "@/databases/utils"
import { getPublishedEntityVersion } from "@/lib/changelog-rollback"
import { buildDeleteChangeSnapshots } from "@/lib/changelog-publish"

export async function _publishProblems(opts?: {
  scriptsIds?: string[]
  problemsIds?: string[]
  broadcastAction?: boolean
  userId?: string | null
  publisherUserId?: string | null
  dataVersion?: number
  client?: DbOrTransaction
}): Promise<{ success: boolean; errors?: string[] }> {
  const { scriptsIds, problemsIds } = { ...opts }

  const results: { success: boolean; errors?: string[] } = { success: false }
  const changeLogs: SaveChangeLogData[] = []

  if (!opts?.client || !Number.isFinite(opts?.dataVersion)) {
    return {
      success: false,
      errors: ["Problem publish must run inside a release transaction with a valid dataVersion"],
    }
  }

  try {
    const client = opts.client
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
      const persistedUpdates: typeof problemsDrafts.$inferSelect[] = []
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
        const sourceDraft = updates.find((draft) => draft.problemId === problemId)

        const { problemId: __problemId, id, createdAt, updatedAt, deletedAt, ...payload } = c

        const nextData = {
          ...payload,
          publishDate: new Date(),
          version: sql`${problems.version} + 1`,
        }

        const [persisted] = await client.update(problems).set(nextData).where(eq(problems.problemId, problemId)).returning()
        if (persisted && sourceDraft) persistedUpdates.push({ ...sourceDraft, data: persisted })
      }

      const updateChangeLogs = await _saveProblemsHistory({
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
      let dataBefore: (typeof problems.$inferSelect)[] = []
      const persistedInserts: typeof problemsDrafts.$inferSelect[] = []
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
        const payload = {
          ...data,
          problemId,
          scriptId,
          version: getPublishedEntityVersion({ currentVersion: data.version, isCreate: true }),
        }

        inserts = inserts.map((d) => {
          if (d.id === id) d.data.problemId = problemId
          return d
        })

        const [persisted] = await client.insert(problems).values(payload).returning()
        const sourceDraft = inserts.find((draft) => draft.id === id)
        if (persisted && sourceDraft) persistedInserts.push({ ...sourceDraft, data: persisted })
      }

      const insertChangeLogs = await _saveProblemsHistory({
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

      const deletedRows = await client
        .update(problems)
        .set({ deletedAt, version: sql`${problems.version} + 1` })
        .where(
          inArray(
            problems.problemId,
            deleted.map((c) => c.problemId!),
          ),
        )
        .returning()
      const deletedById = new Map(deletedRows.map((row) => [row.problemId, row]))

      const historyPayload = deleted.map((c) => ({
        version: deletedById.get(c.problemId!)?.version ?? getPublishedEntityVersion({ currentVersion: c.problem!.version, isCreate: false }),
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

          const { previousSnapshot, fullSnapshot } = buildDeleteChangeSnapshots({
            previousEntity: entry.problem ?? {},
            deletedFields: { deletedAt },
            sanitize: removeHexCharacters,
          })

          changeLogs.push({
            entityId: entry.problemId,
            entityType: "problem",
            action: "delete",
            version: history.version,
            dataVersion: opts.dataVersion,
            changes: history.changes,
            fullSnapshot,
            previousSnapshot,
            baselineSnapshot: previousSnapshot,
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

    if (changeLogs.length) {
      const saveResult = await _saveChangeLogs({ data: changeLogs, client })
      if (!saveResult.success) throw new Error(saveResult.errors?.join(", ") || "Failed to save problem changelogs")
    }

    results.success = true
  } catch (e: any) {
    results.success = false
    results.errors = [e.message]
    logger.error("_publishProblems ERROR", e)
  }

  return results
}
