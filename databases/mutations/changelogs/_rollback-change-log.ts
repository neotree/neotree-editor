import { eq, and } from "drizzle-orm"
import * as uuid from "uuid"

import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import { changeLogs } from "@/databases/pg/schema"
import socket from "@/lib/socket"

export type RollbackChangeLogParams = {
  entityId: string
  toVersion: number
  userId: string
  changeReason?: string
  dataVersion?: number
  broadcastAction?: boolean
}

export type RollbackChangeLogResponse = {
  success: boolean
  errors?: string[]
  newVersion?: number
  data?: typeof changeLogs.$inferSelect
  dataVersion?: number | null
}

export async function _rollbackChangeLog({
  entityId,
  toVersion,
  userId,
  changeReason,
  dataVersion,
  broadcastAction,
}: RollbackChangeLogParams): Promise<RollbackChangeLogResponse> {
  const response: RollbackChangeLogResponse = { success: false }

  try {
    if (!entityId || !uuid.validate(entityId)) {
      throw new Error("Invalid entityId")
    }

    const result = await db.transaction(async (tx) => {
      const targetVersion = await tx.query.changeLogs.findFirst({
        where: and(eq(changeLogs.entityId, entityId), eq(changeLogs.version, toVersion)),
      })

      if (!targetVersion) {
        throw new Error(`Version ${toVersion} not found for entity ${entityId}`)
      }

      const currentVersion = await tx.query.changeLogs.findFirst({
        where: and(eq(changeLogs.entityId, entityId), eq(changeLogs.isActive, true)),
        orderBy: (changeLogs, { desc }) => [desc(changeLogs.version)],
      })

      if (!currentVersion) {
        throw new Error("No active version found")
      }

      const newVersion = currentVersion.version + 1
      const changeLogId = uuid.v4()
      const dateOfChange = new Date()
      const appliedDataVersion = dataVersion ?? targetVersion.dataVersion ?? undefined

      const [inserted] = await tx
        .insert(changeLogs)
        .values({
          entityId,
          entityType: targetVersion.entityType,
          action: "rollback",
          version: newVersion,
          dataVersion: appliedDataVersion,
          // the schema expects field-level change objects; provide a minimal, typed entry for rollbacks
          changes: [
            {
              field: "__rollback__",
              previousValue: currentVersion.version,
              newValue: toVersion,
              dataType: "number",
            },
          ],
          fullSnapshot: targetVersion.fullSnapshot,
          description: `Rollback to version ${toVersion}`,
          changeReason: changeReason || `Rolled back from version ${currentVersion.version} to version ${toVersion}`,
          parentVersion: currentVersion.version,
          isActive: true,
          userId,
          scriptId: targetVersion.scriptId,
          screenId: targetVersion.screenId,
          diagnosisId: targetVersion.diagnosisId,
          configKeyId: targetVersion.configKeyId,
          drugsLibraryItemId: targetVersion.drugsLibraryItemId,
          dataKeyId: targetVersion.dataKeyId,
          aliasId: targetVersion.aliasId,
          dateOfChange,
        })
        .returning()

      if (!inserted) {
        throw new Error("Failed to create rollback changelog")
      }

      await tx
        .update(changeLogs)
        .set({
          isActive: false,
          supersededBy: newVersion,
          supersededAt: dateOfChange,
        })
        .where(and(eq(changeLogs.entityId, entityId), eq(changeLogs.entityType, targetVersion.entityType), eq(changeLogs.version, currentVersion.version)))

      return { inserted, newVersion, appliedDataVersion }
    })

    response.success = true
    response.newVersion = result.newVersion
    response.data = result.inserted
    response.dataVersion = result.appliedDataVersion ?? null

    if (broadcastAction) {
      socket.emit("data_changed", "rollback_change_log")
    }

    return response
  } catch (e: any) {
    response.success = false
    response.errors = [e.message]
    logger.error("_rollbackChangeLog ERROR", e.message)
    return response
  }
}
