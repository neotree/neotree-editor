import type { SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import db from "@/databases/pg/drizzle"
import logger from "@/lib/logger"
import { hospitalsDrafts, hospitals, hospitalsHistory } from "@/databases/pg/schema"

export async function _saveHospitalsHistory({
  previous,
  drafts,
  userId,
}: {
  drafts: typeof hospitalsDrafts.$inferSelect[]
  previous: typeof hospitals.$inferSelect[]
  userId?: string | null
}): Promise<SaveChangeLogData[]> {
  const changeLogsData: SaveChangeLogData[] = []

  try {
    const insertData: typeof hospitalsHistory.$inferInsert[] = []

    for (const c of drafts) {
      const hospitalId = c?.data?.hospitalId
      if (!hospitalId) continue

      const changeHistoryData: typeof hospitalsHistory.$inferInsert = {
        version: c?.data?.version || 1,
        hospitalId,
        changes: {},
      }

      const isCreate = (c?.data?.version || 1) === 1

      if (isCreate) {
        changeHistoryData.changes = {
          action: "create_hospital",
          description: "Create hospital",
          oldValues: [],
          newValues: [],
        }
      } else {
        const prev = previous.find((prevC) => prevC.hospitalId === hospitalId)

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
          action: "update_hospital",
          description: "Update hospital",
          oldValues,
          newValues,
        }
      }

      insertData.push(changeHistoryData)

      if (userId) {
        const { ...rest } = c.data || {}
        const sanitizedSnapshot = JSON.parse(JSON.stringify(rest))

        changeLogsData.push({
          entityId: hospitalId,
          entityType: "hospital",
          action: isCreate ? "create" : "update",
          version: changeHistoryData.version || 1,
          changes: changeHistoryData.changes,
          fullSnapshot: sanitizedSnapshot,
          userId,
          hospitalId,
        })
      }
    }

    if (insertData.length) {
      await db.insert(hospitalsHistory).values(insertData)
    }
  } catch (e: any) {
    logger.error(e.message)
  }

  return changeLogsData
}
