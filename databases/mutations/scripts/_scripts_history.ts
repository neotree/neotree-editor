import type { SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import db from "@/databases/pg/drizzle"
import type { DbOrTransaction } from "@/databases/pg/db-client"
import { scriptsDrafts, scripts, scriptsHistory } from "@/databases/pg/schema"
import logger from "@/lib/logger"
import { removeHexCharacters } from "../../utils"
import { getDataKeySyncChangeReason } from "@/lib/changelog-data-key-sync"

export async function _saveScriptsHistory({
  previous,
  drafts,
  userId,
  client,
}: {
  drafts: typeof scriptsDrafts.$inferSelect[]
  previous: typeof scripts.$inferSelect[]
  userId?: string | null
  client?: DbOrTransaction
}): Promise<SaveChangeLogData[]> {
  const changeLogsData: SaveChangeLogData[] = []

  try {
    const executor = client || db
    const insertData: typeof scriptsHistory.$inferInsert[] = []

    for (const c of drafts) {
      const scriptId = c?.data?.scriptId
      if (!scriptId) continue

      const prev = previous.find((prevC) => prevC.scriptId === scriptId)
      const isCreate = !prev
      // c.data is the row as persisted by publish, so its version is the entity's new version
      const persistedVersion = Number(c?.data?.version)
      const nextVersion =
        Number.isFinite(persistedVersion) && persistedVersion > 0
          ? persistedVersion
          : Number(prev?.version ?? 0) + 1

      const changeHistoryData: typeof scriptsHistory.$inferInsert = {
        version: nextVersion,
        scriptId,
        changes: {},
      }

      if (isCreate) {
        changeHistoryData.changes = {
          action: "create_script",
          description: "Create script",
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
        const previousSnapshot = isCreate ? {} : removeHexCharacters(prev || {})
        const changeReason = isCreate ? undefined : getDataKeySyncChangeReason(previousSnapshot, sanitizedSnapshot)

        changeLogsData.push({
          entityId: scriptId,
          entityType: "script",
          action: isCreate ? "create" : "update",
          changes: changeHistoryData.changes,
          fullSnapshot: sanitizedSnapshot,
          previousSnapshot,
          baselineSnapshot: previousSnapshot,
          changeReason,
          userId,
          scriptId,
        })
      }
    }

    if (insertData.length) {
      await executor.insert(scriptsHistory).values(insertData)
    }
  } catch (e: any) {
    logger.error("_saveScriptsHistory ERROR", e.message)
    throw e
  }

  return changeLogsData
}
