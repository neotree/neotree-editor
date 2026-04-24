import type { SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log"
import db from "@/databases/pg/drizzle"
import type { DbOrTransaction } from "@/databases/pg/db-client"
import logger from "@/lib/logger"
import { diagnosesDrafts, diagnoses, diagnosesHistory } from "@/databases/pg/schema"
import { removeHexCharacters } from "../../utils"
import { getDataKeySyncChangeReason } from "@/lib/changelog-data-key-sync"
import { getPublishedEntityVersion } from "@/lib/changelog-rollback"

export async function _saveDiagnosesHistory({
  previous,
  drafts,
  userId,
  client,
}: {
  drafts: typeof diagnosesDrafts.$inferSelect[]
  previous: typeof diagnoses.$inferSelect[]
  userId?: string | null
  client?: DbOrTransaction
}): Promise<SaveChangeLogData[]> {
  const changeLogsData: SaveChangeLogData[] = []

  try {
    const executor = client ?? db
    const insertData: typeof diagnosesHistory.$inferInsert[] = []

    for (const c of drafts) {
      const diagnosisId = c?.data?.diagnosisId
      if (!diagnosisId) continue

      const prev = previous.find((prevC) => prevC.diagnosisId === diagnosisId)
      const isCreate = !prev
      const changeDescription = isCreate ? "Create diagnosis" : "Update diagnosis"

      const changePayload: { action: string; description: string; oldValues: any[]; newValues: any[] } = {
        action: isCreate ? "create_diagnosis" : "update_diagnosis",
        description: changeDescription,
        oldValues: [],
        newValues: [],
      }

      const versionValue = Number.isFinite(c?.data?.version) ? Number(c.data.version) : 1

      const changeHistoryData: typeof diagnosesHistory.$inferInsert = {
        version: versionValue,
        diagnosisId,
        scriptId: c?.data?.scriptId ?? "",
        changes: changePayload,
      }

      if (!isCreate) {
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
        const syncChangeReason = getDataKeySyncChangeReason(
          removeHexCharacters(previous.find((prevC) => prevC.diagnosisId === diagnosisId) || {}),
          removeHexCharacters(c.data || {}),
        )
        if (syncChangeReason) {
          ;(changePayload as any).metadata = {
            source: "data_key_reference_sync",
            mode: syncChangeReason === "Published via data key reference sync" ? "pure" : "mixed",
          }
        }
      }

      insertData.push(changeHistoryData)

      if (userId) {
        const sanitizedSnapshot = removeHexCharacters(c.data || {})
        const previousSnapshot = isCreate
          ? {}
          : removeHexCharacters(previous.find((prevC) => prevC.diagnosisId === diagnosisId) || {})
        const changeReason = isCreate ? undefined : getDataKeySyncChangeReason(previousSnapshot, sanitizedSnapshot)

        changeLogsData.push({
          entityId: diagnosisId,
          entityType: "diagnosis",
          action: isCreate ? "create" : "update",
          version: versionValue,
          changes: changePayload,
          fullSnapshot: sanitizedSnapshot,
          previousSnapshot,
          baselineSnapshot: previousSnapshot,
          description: changeDescription,
          changeReason,
          userId,
          scriptId: c?.data?.scriptId || null,
          diagnosisId,
        })
      }
    }

    if (insertData.length) {
      await executor.insert(diagnosesHistory).values(insertData)
    }
  } catch (e: any) {
    logger.error(e.message)
    throw e
  }

  return changeLogsData
}
