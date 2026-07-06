import type { SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import db from "@/databases/pg/drizzle"
import type { DbOrTransaction } from "@/databases/pg/db-client"
import logger from "@/lib/logger"
import { dataKeysDrafts, dataKeys, dataKeysHistory } from "@/databases/pg/schema"

export async function _saveDataKeysHistory({
  previous,
  drafts,
  userId,
  client,
}: {
  drafts: typeof dataKeysDrafts.$inferSelect[]
  previous: typeof dataKeys.$inferSelect[]
  userId?: string | null
  client?: DbOrTransaction
}): Promise<SaveChangeLogData[]> {
  const changeLogsData: SaveChangeLogData[] = []
  const executor = client || db
  const insertData: typeof dataKeysHistory.$inferInsert[] = []

  try {
    for (const c of drafts) {
      const resolvedDataKeyId = c.dataKeyId || c?.data?.uuid
      if (!resolvedDataKeyId) {
        logger.error("_saveDataKeysHistory ERROR", "Missing data key id for draft history entry")
        continue
      }

      const prev = previous.find((prevC) => prevC.uuid === resolvedDataKeyId)
      const isCreate = !prev
      const changeDescription = isCreate ? "Create data key" : "Update data key"

      const changePayload: { action: string; description: string; oldValues: any[]; newValues: any[] } = {
        action: isCreate ? "create_data_key" : "update_data_key",
        description: changeDescription,
        oldValues: [],
        newValues: [],
      }

      // c.data is the row as persisted by publish, so its version is the entity's new version
      const persistedVersion = Number(c?.data?.version)
      const nextVersion =
        Number.isFinite(persistedVersion) && persistedVersion > 0
          ? persistedVersion
          : Number(prev?.version ?? 0) + 1

      const changeHistoryData: typeof dataKeysHistory.$inferInsert = {
        version: nextVersion,
        dataKeyId: resolvedDataKeyId,
        changes: changePayload,
      }

      if (!isCreate) {
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
        const sanitizedSnapshot = JSON.parse(JSON.stringify({
          ...(c.data || {}),
          uuid: resolvedDataKeyId,
        }))
        const previousSnapshot = isCreate ? {} : JSON.parse(JSON.stringify(prev || {}))

        changeLogsData.push({
          entityId: resolvedDataKeyId,
          entityType: "data_key",
          action: isCreate ? "create" : "update",
          changes: changePayload,
          fullSnapshot: sanitizedSnapshot,
          previousSnapshot,
          baselineSnapshot: previousSnapshot,
          description: changeDescription,
          userId,
          dataKeyId: resolvedDataKeyId,
        })
      }
    }

    if (insertData.length) {
      await executor.insert(dataKeysHistory).values(insertData)
    }
  } catch (e: any) {
    logger.error("_saveDataKeysHistory ERROR", e.message)
    throw e
  }

  return changeLogsData
}
