import type { SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import db from "@/databases/pg/drizzle"
import logger from "@/lib/logger"
import { configKeysDrafts, configKeys, configKeysHistory } from "@/databases/pg/schema"

export async function _saveConfigKeysHistory({
  previous,
  drafts,
  userId,
}: {
  drafts: typeof configKeysDrafts.$inferSelect[]
  previous: typeof configKeys.$inferSelect[]
  userId?: string | null
}): Promise<SaveChangeLogData[]> {
  const changeLogsData: SaveChangeLogData[] = []

  try {
    const insertData: typeof configKeysHistory.$inferInsert[] = []

    for (const c of drafts) {
      const configKeyId = c?.data?.configKeyId
      if (!configKeyId) continue

      const changeHistoryData: typeof configKeysHistory.$inferInsert = {
        version: c?.data?.version || 1,
        configKeyId,
        changes: {},
      }

      const isCreate = (c?.data?.version || 1) === 1

      if (isCreate) {
        changeHistoryData.changes = {
          action: "create_config_key",
          description: "Create config key",
          oldValues: [],
          newValues: [],
        }
      } else {
        const prev = previous.find((prevC) => prevC.configKeyId === configKeyId)

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
        const { draft, ...rest } = c.data || {}
        const sanitizedSnapshot = JSON.parse(JSON.stringify(rest))

        changeLogsData.push({
          entityId: configKeyId,
          entityType: "config_key",
          action: isCreate ? "create" : "update",
          version: changeHistoryData.version || 1,
          changes: changeHistoryData.changes,
          fullSnapshot: sanitizedSnapshot,
          description: changeHistoryData.changes?.description,
          userId,
          configKeyId,
        })
      }
    }

    if (insertData.length) {
      await db.insert(configKeysHistory).values(insertData)
    }
  } catch (e: any) {
    logger.error(e.message)
  }

  return changeLogsData
}
