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

      const isCreate = (c?.data?.version || 1) === 1
      const changeDescription = isCreate ? "Create diagnosis" : "Update diagnosis"

      const changePayload: { action: string; description: string; oldValues: any[]; newValues: any[] } = {
        action: isCreate ? "create_diagnosis" : "update_diagnosis",
        description: changeDescription,
        oldValues: [],
        newValues: [],
      }

      const versionValue = c?.data?.version || 1

      const changeHistoryData: typeof diagnosesHistory.$inferInsert = {
        version: versionValue,
        diagnosisId,
        scriptId: c?.data?.scriptId ?? "",
        changes: changePayload,
      }

      if (!isCreate) {
        const prev = previous.find((prevC) => prevC.diagnosisId === diagnosisId)

        Object.keys({ ...c?.data })
          .filter((key) => !["version", "draft"].includes(key))
          .forEach((_key) => {
            const key = _key as keyof typeof c.data
            const newValue = removeHexCharacters(c.data[key])
            const oldValue = ({ ...prev })[key as keyof typeof prev]
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
              changePayload.oldValues.push({ [key]: oldValue })
              changePayload.newValues.push({ [key]: newValue })
            }
          })
      }

      insertData.push(changeHistoryData)

      if (userId) {
        const sanitizedSnapshot = removeHexCharacters(c.data || {})

        changeLogsData.push({
          entityId: diagnosisId,
          entityType: "diagnosis",
          action: isCreate ? "create" : "update",
          version: versionValue,
          changes: changePayload,
          fullSnapshot: sanitizedSnapshot,
          description: changeDescription,
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
