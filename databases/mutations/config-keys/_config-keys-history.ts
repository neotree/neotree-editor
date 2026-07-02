import type { SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import db from "@/databases/pg/drizzle"
import type { DbOrTransaction } from "@/databases/pg/db-client"
import logger from "@/lib/logger"
import { configKeysDrafts, configKeys, configKeysHistory } from "@/databases/pg/schema"

export async function _saveConfigKeysHistory({
  previous,
  drafts,
  userId,
  client,
}: {
  drafts: typeof configKeysDrafts.$inferSelect[]
  previous: typeof configKeys.$inferSelect[]
  userId?: string | null
  client?: DbOrTransaction
}): Promise<SaveChangeLogData[]> {
  const changeLogsData: SaveChangeLogData[] = []

  try {
    const executor = client || db
    const insertData: typeof configKeysHistory.$inferInsert[] = []

    for (const c of drafts) {
      const configKeyId = c?.data?.configKeyId
      if (!configKeyId) continue

      const prev = previous.find((prevC) => prevC.configKeyId === configKeyId)
      const isCreate = !prev
      // c.data is the row as persisted by publish, so its version is the entity's new version
      const persistedVersion = Number(c?.data?.version)
      const nextVersion =
        Number.isFinite(persistedVersion) && persistedVersion > 0
          ? persistedVersion
          : Number(prev?.version ?? 0) + 1

      const changeHistoryData: typeof configKeysHistory.$inferInsert = {
        version: nextVersion,
        configKeyId,
        changes: {},
      }

      if (isCreate) {
        changeHistoryData.changes = {
          action: "create_config_key",
          description: "Create config key",
          oldValues: [],
          newValues: [],
        }
      } else {
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
          action: "update_config_key",
          description: "Update config key",
          oldValues,
          newValues,
        }
      }

      insertData.push(changeHistoryData)

      if (userId) {
        const { ...rest } = c.data || {}
        const sanitizedSnapshot = JSON.parse(JSON.stringify(rest))
        const previousSnapshot = isCreate ? {} : JSON.parse(JSON.stringify(prev || {}))

        changeLogsData.push({
          entityId: configKeyId,
          entityType: "config_key",
          action: isCreate ? "create" : "update",
          changes: changeHistoryData.changes,
          fullSnapshot: sanitizedSnapshot,
          previousSnapshot,
          baselineSnapshot: previousSnapshot,
          userId,
          configKeyId,
        })
      }
    }

    if (insertData.length) {
      await executor.insert(configKeysHistory).values(insertData)
    }
  } catch (e: any) {
    logger.error("_saveConfigKeysHistory ERROR", e.message)
    throw e
  }

  return changeLogsData
}
