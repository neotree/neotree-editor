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

      const isCreate = (c?.data?.version || 1) === 1
      const changeDescription = isCreate ? "Create drugs library item" : "Update drugs library item"

      const changePayload: { action: string; description: string; oldValues: any[]; newValues: any[] } = {
        action: isCreate ? "create_drugs_library_item" : "update_drugs_library_item",
        description: changeDescription,
        oldValues: [],
        newValues: [],
      }

      const versionValue = c?.data?.version || 1

      const changeHistoryData: typeof drugsLibraryHistory.$inferInsert = {
        version: versionValue,
        itemId,
        changes: changePayload,
      }

      if (!isCreate) {
        const prev = previous.find((prevC) => prevC.itemId === itemId)

        Object.keys({ ...c?.data })
          .filter((key) => !["version", "draft"].includes(key))
          .forEach((_key) => {
            const key = _key as keyof typeof c.data
            const newValue = c.data[key]
            const oldValue = ({ ...prev })[key as keyof typeof prev]
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
              changePayload.oldValues.push({ [key]: oldValue })
              changePayload.newValues.push({ [key]: newValue })
            }
          })
      }

      insertData.push(changeHistoryData)

      if (userId) {
        const sanitizedSnapshot = JSON.parse(JSON.stringify(c.data || {}))

        changeLogsData.push({
          entityId: itemId,
          entityType: "drugs_library",
          action: isCreate ? "create" : "update",
          version: versionValue,
          changes: changePayload,
          fullSnapshot: sanitizedSnapshot,
          description: changeDescription,
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
