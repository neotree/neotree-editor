import type { SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import db from "@/databases/pg/drizzle"
import { scriptsDrafts, scripts, scriptsHistory } from "@/databases/pg/schema"
import logger from "@/lib/logger"
import { removeHexCharacters } from "../../utils"

export async function _saveScriptsHistory({
  previous,
  drafts,
  userId,
}: {
  drafts: typeof scriptsDrafts.$inferSelect[]
  previous: typeof scripts.$inferSelect[]
  userId?: string | null
}): Promise<SaveChangeLogData[]> {
  const changeLogsData: SaveChangeLogData[] = []

  try {
    const insertData: typeof scriptsHistory.$inferInsert[] = []

    for (const c of drafts) {
      const scriptId = c?.data?.scriptId
      if (!scriptId) continue

      const changeHistoryData: typeof scriptsHistory.$inferInsert = {
        version: c?.data?.version || 1,
        scriptId,
        changes: {},
      }

      const isCreate = (c?.data?.version || 1) === 1

      if (isCreate) {
        changeHistoryData.changes = {
          action: "create_script",
          description: "Create script",
          oldValues: [],
          newValues: [],
        }
      } else {
        const prev = previous.find((prevC) => prevC.scriptId === scriptId)

        const oldValues: any[] = []
        const newValues: any[] = []

        Object.keys({ ...c?.data })
          .filter((key) => !["version", "draft"].includes(key))
          .forEach((_key) => {
            const key = _key as keyof typeof c.data
            const newValue = removeHexCharacters(c.data[key])
            const oldValue = ({ ...prev })[key as keyof typeof prev]
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
              oldValues.push({ [key]: oldValue })
              newValues.push({ [key]: newValue })
            }
          })

        changeHistoryData.changes = {
          action: "update_script",
          description: "Update script",
          oldValues,
          newValues,
        }
      }

      insertData.push(changeHistoryData)

      if (userId) {
        const {  ...rest } = c.data || {}
        const sanitizedSnapshot = removeHexCharacters(rest)

        changeLogsData.push({
          entityId: scriptId,
          entityType: "script",
          action: isCreate ? "create" : "update",
          version: changeHistoryData.version || 1,
          changes: changeHistoryData.changes,
          fullSnapshot: sanitizedSnapshot,
          userId,
          scriptId,
        })
      }
    }

    if (insertData.length) {
      await db.insert(scriptsHistory).values(insertData)
    }
  } catch (e: any) {
    logger.error(e.message)
  }

  return changeLogsData
}
