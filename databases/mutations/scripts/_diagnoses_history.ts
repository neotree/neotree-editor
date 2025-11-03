import type { SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import db from "@/databases/pg/drizzle"
import logger from "@/lib/logger"
import { diagnosesDrafts, diagnoses, diagnosesHistory } from "@/databases/pg/schema"
import { removeHexCharacters } from "../../utils"

export async function _saveDiagnosesHistory({
  previous,
  drafts,
  userId,
}: {
  drafts: typeof diagnosesDrafts.$inferSelect[]
  previous: typeof diagnoses.$inferSelect[]
  userId?: string | null
}): Promise<SaveChangeLogData[]> {
  const changeLogsData: SaveChangeLogData[] = []

  try {
    const insertData: typeof diagnosesHistory.$inferInsert[] = []

    for (const c of drafts) {
      const diagnosisId = c?.data?.diagnosisId
      if (!diagnosisId) continue

      const changeHistoryData: typeof diagnosesHistory.$inferInsert = {
        version: c?.data?.version || 1,
        diagnosisId,
        scriptId: c?.data?.scriptId || null,
        changes: {},
      }

      const isCreate = (c?.data?.version || 1) === 1

      if (isCreate) {
        changeHistoryData.changes = {
          action: "create_diagnosis",
          description: "Create diagnosis",
          oldValues: [],
          newValues: [],
        }
      } else {
        const prev = previous.find((prevC) => prevC.diagnosisId === diagnosisId)

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
          action: "update_diagnosis",
          description: "Update diagnosis",
          oldValues,
          newValues,
        }
      }

      insertData.push(changeHistoryData)

      if (userId) {
        const { draft, ...rest } = c.data || {}
        const sanitizedSnapshot = removeHexCharacters(rest)

        changeLogsData.push({
          entityId: diagnosisId,
          entityType: "diagnosis",
          action: isCreate ? "create" : "update",
          version: changeHistoryData.version || 1,
          changes: changeHistoryData.changes,
          fullSnapshot: sanitizedSnapshot,
          description: changeHistoryData.changes?.description,
          userId,
          scriptId: c?.data?.scriptId || null,
          diagnosisId,
        })
      }
    }

    if (insertData.length) {
      await db.insert(diagnosesHistory).values(insertData)
    }
  } catch (e: any) {
    logger.error(e.message)
  }

  return changeLogsData
}
