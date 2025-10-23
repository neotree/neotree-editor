import { eq, and } from "drizzle-orm"
import * as uuid from "uuid"

import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import { changeLogs } from "@/databases/pg/schema"
import { _saveChangeLog, type SaveChangeLogData } from "./_save-change-log"
import { _updateChangeLog } from "./_update-change-log"

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

    // Get the version to rollback to
    const targetVersion = await db.query.changeLogs.findFirst({
      where: and(eq(changeLogs.entityId, entityId), eq(changeLogs.version, toVersion)),
    })

    if (!targetVersion) {
      throw new Error(`Version ${toVersion} not found for entity ${entityId}`)
    }

    // Get current active version
    const currentVersion = await db.query.changeLogs.findFirst({
      where: and(eq(changeLogs.entityId, entityId), eq(changeLogs.isActive, true)),
      orderBy: (changeLogs, { desc }) => [desc(changeLogs.version)],
    })

    if (!currentVersion) {
      throw new Error("No active version found")
    }

    const newVersion = currentVersion.version + 1

    // Mark current version as superseded
    await _updateChangeLog({
      data: {
        entityId,
        version: currentVersion.version,
        isActive: false,
        supersededBy: newVersion,
        supersededAt: new Date(),
      },
    })

    // Create new version with rollback data
    const newChangeLogData: SaveChangeLogData = {
      entityId,
      entityType: targetVersion.entityType,
      action: "rollback",
      version: newVersion,
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
      broadcastAction,
    })

    if (saveResult.errors?.length) {
      throw new Error(saveResult.errors.join(", "))
    }

    response.success = true
    response.newVersion = newVersion
    response.data = saveResult.data

    return response
  } catch (e: any) {
    response.success = false
    response.errors = [e.message]
    logger.error("_rollbackChangeLog ERROR", e.message)
    return response
  }
}
