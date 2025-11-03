import type { SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import db from "@/databases/pg/drizzle"
import logger from "@/lib/logger"
import { drugsLibraryDrafts, drugsLibrary, drugsLibraryHistory } from "@/databases/pg/schema"

export async function _saveDrugsLibraryItemsHistory({
  previous,
  drafts,
  userId,
}: {
  drafts: typeof drugsLibraryDrafts.$inferSelect[]
  previous: typeof drugsLibrary.$inferSelect[]
  userId?: string | null
}): Promise<SaveChangeLogData[]> {
  const changeLogsData: SaveChangeLogData[] = []

  try {
    const insertData: typeof drugsLibraryHistory.$inferInsert[] = []

    for (const c of drafts) {
      const itemId = c?.data?.itemId
      if (!itemId) continue

      const changeHistoryData: typeof drugsLibraryHistory.$inferInsert = {
        version: c?.data?.version || 1,
        itemId,
        changes: {},
      }

      const isCreate = (c?.data?.version || 1) === 1

      if (isCreate) {
        changeHistoryData.changes = {
          action: "create_drugs_library_item",
          description: "Create drugs library item",
          oldValues: [],
          newValues: [],
        }
      } else {
        const prev = previous.find((prevC) => prevC.itemId === itemId)

        const oldValues: any[] = []
        const newValues: any[] = []

        Object.keys({ ...c?.data })
          .filter((key) => !["version", "draft"].includes(key))
          .forEach((_key) => {
            const key = _key as keyof typeof c.data
            const newValue = c.data[key]
            const oldValue = ({ ...prev })[key as keyof typeof prev]
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
              oldValues.push({ [key]: oldValue })
              newValues.push({ [key]: newValue })
            }
          })

        changeHistoryData.changes = {
          action: "update_drugs_library_item",
          description: "Update drugs library item",
          oldValues,
          newValues,
        }
      }

      insertData.push(changeHistoryData)

      if (userId) {
        const { draft, ...rest } = c.data || {}
        const sanitizedSnapshot = JSON.parse(JSON.stringify(rest))

        changeLogsData.push({
          entityId: itemId,
          entityType: "drugs_library",
          action: isCreate ? "create" : "update",
          version: changeHistoryData.version || 1,
          changes: changeHistoryData.changes,
          fullSnapshot: sanitizedSnapshot,
          description: changeHistoryData.changes?.description,
          userId,
          drugsLibraryItemId: itemId,
        })
      }
    }

    if (insertData.length) {
      await db.insert(drugsLibraryHistory).values(insertData)
    }
  } catch (e: any) {
    logger.error(e.message)
  }

  return changeLogsData
}
