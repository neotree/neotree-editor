import type { SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import db from "@/databases/pg/drizzle"
import logger from "@/lib/logger"
import { dataKeysDrafts, dataKeys, dataKeysHistory } from "@/databases/pg/schema"

export async function _saveDataKeysHistory({
  previous,
  drafts,
  userId,
}: {
  drafts: typeof dataKeysDrafts.$inferSelect[]
  previous: typeof dataKeys.$inferSelect[]
  userId?: string | null
}): Promise<SaveChangeLogData[]> {
  const changeLogsData: SaveChangeLogData[] = []

  try {
    const insertData: typeof dataKeysHistory.$inferInsert[] = []

    for (const c of drafts) {
      const dataKeyId = c?.data?.uuid
      if (!dataKeyId) continue

      const changeHistoryData: typeof dataKeysHistory.$inferInsert = {
        version: c?.data?.version || 1,
        dataKeyId,
        changes: {},
      }

      const isCreate = (c?.data?.version || 1) === 1

      if (isCreate) {
        changeHistoryData.changes = {
          action: "create_data_key",
          description: "Create data key",
          oldValues: [],
          newValues: [],
        }
      } else {
        const prev = previous.find((prevC) => prevC.uuid === dataKeyId)

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
          action: "update_data_key",
          description: "Update data key",
          oldValues,
          newValues,
        }
      }

      insertData.push(changeHistoryData)

      if (userId) {
        const { draft, ...rest } = c.data || {}
        const sanitizedSnapshot = JSON.parse(JSON.stringify(rest))

        changeLogsData.push({
          entityId: dataKeyId,
          entityType: "data_key",
          action: isCreate ? "create" : "update",
          version: changeHistoryData.version || 1,
          changes: changeHistoryData.changes,
          fullSnapshot: sanitizedSnapshot,
          description: changeHistoryData.changes?.description,
          userId,
          dataKeyId,
        })
      }
    }

    if (insertData.length) {
      await db.insert(dataKeysHistory).values(insertData)
    }
  } catch (e: any) {
    logger.error(e.message)
  }

  return changeLogsData
}
