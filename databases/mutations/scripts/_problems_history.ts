import type { SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import db from "@/databases/pg/drizzle"
import logger from "@/lib/logger"
import { problemsDrafts, problems, problemsHistory } from "@/databases/pg/schema"
import { removeHexCharacters } from "../../utils"

export async function _saveProblemsHistory({
  previous,
  drafts,
  userId,
}: {
  drafts: typeof problemsDrafts.$inferSelect[]
  previous: typeof problems.$inferSelect[]
  userId?: string | null
}): Promise<SaveChangeLogData[]> {
  const changeLogsData: SaveChangeLogData[] = []

  try {
    const insertData: typeof problemsHistory.$inferInsert[] = []

    for (const c of drafts) {
      const problemId = c?.data?.problemId
      if (!problemId) continue

      const isCreate = (c?.data?.version || 1) === 1
      const changeDescription = isCreate ? "Create problem" : "Update problem"

      const changePayload: { action: string; description: string; oldValues: any[]; newValues: any[] } = {
        action: isCreate ? "create_problem" : "update_problem",
        description: changeDescription,
        oldValues: [],
        newValues: [],
      }

      const versionValue = c?.data?.version || 1

      const changeHistoryData: typeof problemsHistory.$inferInsert = {
        version: versionValue,
        problemId,
        scriptId: c?.data?.scriptId ?? "",
        changes: changePayload,
      }

      if (!isCreate) {
        const prev = previous.find((prevC) => prevC.problemId === problemId)

        Object.keys({ ...c?.data })
          .filter((key) => !["version", "draft"].includes(key))
          .forEach((_key) => {
            const key = _key as keyof typeof c.data
            const newValue = removeHexCharacters(c.data[key])
            const oldValue = ({ ...prev })[key as keyof typeof prev]
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
              changePayload.oldValues.push({ [key]: oldValue })
              changePayload.newValues.push({ [key]: newValue })
            }
          })
      }

      insertData.push(changeHistoryData)

      if (userId) {
        const sanitizedSnapshot = removeHexCharacters(c.data || {})
        const previousSnapshot = isCreate
          ? {}
          : removeHexCharacters(previous.find((prevC) => prevC.problemId === problemId) || {})

        changeLogsData.push({
          entityId: problemId,
          entityType: "problem",
          action: isCreate ? "create" : "update",
          version: versionValue,
          changes: changePayload,
          fullSnapshot: sanitizedSnapshot,
          previousSnapshot,
          baselineSnapshot: previousSnapshot,
          description: changeDescription,
          userId,
          scriptId: c?.data?.scriptId || null,
          problemId,
        })
      }
    }

    if (insertData.length) {
      await db.insert(problemsHistory).values(insertData)
    }
  } catch (e: any) {
    logger.error(e.message)
  }

  return changeLogsData
}
