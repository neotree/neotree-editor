import type { SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import db from "@/databases/pg/drizzle"
import logger from "@/lib/logger"
import { screensDrafts, screens, screensHistory } from "@/databases/pg/schema"
import { removeHexCharacters } from "../../utils"

export async function _saveScreensHistory({
  previous,
  drafts,
  userId,
}: {
  drafts: typeof screensDrafts.$inferSelect[]
  previous: typeof screens.$inferSelect[]
  userId?: string | null
}): Promise<SaveChangeLogData[]> {
  const changeLogsData: SaveChangeLogData[] = []

  try {
    const insertData: typeof screensHistory.$inferInsert[] = []

    for (const c of drafts) {
      const screenId = c?.data?.screenId
      if (!screenId) continue

      const changeHistoryData: typeof screensHistory.$inferInsert = {
        version: c?.data?.version || 1,
        screenId,
        scriptId: c?.data?.scriptId || null,
        changes: {},
      }

      const isCreate = (c?.data?.version || 1) === 1

      if (isCreate) {
        changeHistoryData.changes = {
          action: "create_screen",
          description: "Create screen",
          oldValues: [],
          newValues: [],
        }
      } else {
        const prev = previous.find((prevC) => prevC.screenId === screenId)

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
          action: "update_screen",
          description: "Update screen",
          oldValues,
          newValues,
        }
      }

      insertData.push(changeHistoryData)

      if (userId) {
        const { draft, ...rest } = c.data || {}
        const sanitizedSnapshot = removeHexCharacters(rest)

        changeLogsData.push({
          entityId: screenId,
          entityType: "screen",
          action: isCreate ? "create" : "update",
          version: changeHistoryData.version || 1,
          changes: changeHistoryData.changes,
          fullSnapshot: sanitizedSnapshot,
          description: changeHistoryData.changes?.description,
          userId,
          scriptId: c?.data?.scriptId || null,
          screenId,
        })
      }
    }

    if (insertData.length) {
      await db.insert(screensHistory).values(insertData)
    }
  } catch (e: any) {
    logger.error(e.message)
  }

  return changeLogsData
}
