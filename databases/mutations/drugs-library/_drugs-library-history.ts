import type { SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import db from "@/databases/pg/drizzle"
import type { DbOrTransaction } from "@/databases/pg/db-client"
import logger from "@/lib/logger"
import { drugsLibraryDrafts, drugsLibrary, drugsLibraryHistory } from "@/databases/pg/schema"

export async function _saveDrugsLibraryItemsHistory({
  previous,
  drafts,
  userId,
  client,
}: {
  drafts: typeof drugsLibraryDrafts.$inferSelect[]
  previous: typeof drugsLibrary.$inferSelect[]
  userId?: string | null
  client?: DbOrTransaction
}): Promise<SaveChangeLogData[]> {
  const changeLogsData: SaveChangeLogData[] = []

  try {
    const executor = client || db
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
      const nextVersion = isCreate ? 1 : versionValue + 1

      const changeHistoryData: typeof drugsLibraryHistory.$inferInsert = {
        version: nextVersion,
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
        const previousSnapshot = isCreate
          ? {}
          : JSON.parse(JSON.stringify(previous.find((prevC) => prevC.itemId === itemId) || {}))

        changeLogsData.push({
          entityId: itemId,
          entityType: "drugs_library",
          action: isCreate ? "create" : "update",
          version: nextVersion,
          changes: changePayload,
          fullSnapshot: sanitizedSnapshot,
          previousSnapshot,
          baselineSnapshot: previousSnapshot,
          description: changeDescription,
          userId,
          drugsLibraryItemId: itemId,
        })
      }
    }

    if (insertData.length) {
      await executor.insert(drugsLibraryHistory).values(insertData)
    }
  } catch (e: any) {
    logger.error(e.message)
  }

  return changeLogsData
}
