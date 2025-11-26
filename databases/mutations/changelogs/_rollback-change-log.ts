import { eq, and } from "drizzle-orm"
import * as uuid from "uuid"

import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import { changeLogs } from "@/databases/pg/schema"
import { _saveChangeLog, type SaveChangeLogData } from "./_save-change-log"
import socket from "@/lib/socket"

export type RollbackChangeLogParams = {
  entityId: string
  toVersion: number
  userId: string
  changeReason?: string
  broadcastAction?: boolean
}

export type RollbackChangeLogResponse = {
  success: boolean
  errors?: string[]
  newVersion?: number
  data?: typeof changeLogs.$inferSelect
}

export async function _rollbackChangeLog({
  entityId,
  toVersion,
  userId,
  changeReason,
  broadcastAction,
}: RollbackChangeLogParams): Promise<RollbackChangeLogResponse> {
  const response: RollbackChangeLogResponse = { success: false }

  try {
    if (!entityId || !uuid.validate(entityId)) {
      throw new Error("Invalid entityId")
    }

    const txResult = await db.transaction(async (tx) => {
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

      // Mark current version as superseded before creating the rollback entry
      await tx
        .update(changeLogs)
        .set({
          isActive: false,
          supersededBy: currentVersion.version + 1,
          supersededAt: new Date(),
        })
        .where(and(eq(changeLogs.entityId, entityId), eq(changeLogs.version, currentVersion.version)))

      const newChangeLogData: SaveChangeLogData = {
        entityId,
        entityType: targetVersion.entityType,
        action: "rollback",
        changes: [
          {
            action: "rollback",
            description: `Rolled back to version ${toVersion}`,
            fromVersion: currentVersion.version,
            toVersion: toVersion,
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
      }

      const saveResult = await _saveChangeLog({
        data: newChangeLogData,
        broadcastAction: false,
        client: tx,
      })

      if (!saveResult.success || saveResult.errors?.length) {
        throw new Error(saveResult.errors?.join(", ") || "Failed to save rollback change log")
      }

      return saveResult.data
    })

    response.success = true
    response.newVersion = txResult?.version
    response.data = txResult

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
