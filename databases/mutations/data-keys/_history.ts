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

      const isCreate = (c?.data?.version || 1) === 1
      const changeDescription = isCreate ? "Create data key" : "Update data key"

      const changePayload: { action: string; description: string; oldValues: any[]; newValues: any[] } = {
        action: isCreate ? "create_data_key" : "update_data_key",
        description: changeDescription,
        oldValues: [],
        newValues: [],
      }

      const versionValue = c?.data?.version || 1

      const changeHistoryData: typeof dataKeysHistory.$inferInsert = {
        version: versionValue,
        dataKeyId,
        changes: changePayload,
      }

      if (!isCreate) {
        const prev = previous.find((prevC) => prevC.uuid === dataKeyId)

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
          : JSON.parse(JSON.stringify(previous.find((prevC) => prevC.uuid === dataKeyId) || {}))

        changeLogsData.push({
          entityId: dataKeyId,
          entityType: "data_key",
          action: isCreate ? "create" : "update",
          version: versionValue,
          changes: changePayload,
          fullSnapshot: sanitizedSnapshot,
          previousSnapshot,
          baselineSnapshot: previousSnapshot,
          description: changeDescription,
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
