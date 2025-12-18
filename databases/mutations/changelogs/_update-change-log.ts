import { eq, and } from "drizzle-orm"
import * as uuid from "uuid"

import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import { changeLogs } from "@/databases/pg/schema"
import socket from "@/lib/socket"

export type UpdateChangeLogData = {
  changeLogId?: string
  entityId?: string
  version?: number
  isActive?: boolean
  supersededBy?: number | null
  supersededAt?: Date | null
  description?: string
  changeReason?: string
}

export type UpdateChangeLogResponse = {
  success: boolean
  errors?: string[]
  data?: typeof changeLogs.$inferSelect
}

export async function _updateChangeLog({
  data,
  broadcastAction,
}: {
  data: UpdateChangeLogData
  broadcastAction?: boolean
}): Promise<UpdateChangeLogResponse> {
  const response: UpdateChangeLogResponse = { success: false }

  try {
    if (!data.changeLogId && (!data.entityId || data.version === undefined)) {
      throw new Error("Either changeLogId or entityId+version is required")
    }

    const whereClause =
      data.changeLogId && uuid.validate(data.changeLogId)
        ? eq(changeLogs.changeLogId, data.changeLogId)
        : and(eq(changeLogs.entityId, data.entityId!), eq(changeLogs.version, data.version!))

    const updateData: Partial<typeof changeLogs.$inferInsert> = {}

    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.supersededBy !== undefined) updateData.supersededBy = data.supersededBy
    if (data.supersededAt !== undefined) updateData.supersededAt = data.supersededAt
    if (data.description !== undefined) updateData.description = data.description
    if (data.changeReason !== undefined) updateData.changeReason = data.changeReason

    const [updated] = await db.update(changeLogs).set(updateData).where(whereClause).returning()

    if (!updated) {
      throw new Error("Change log not found")
    }

    response.success = true
    response.data = updated

    if (broadcastAction) {
      socket.emit("data_changed", "update_change_log")
    }

    return response
  } catch (e: any) {
    response.success = false
    response.errors = [e.message]
    logger.error("_updateChangeLog ERROR", e.message)
    return response
  }
}

export async function _markVersionAsSuperseded({
  entityId,
  version,
  supersededBy,
  broadcastAction,
}: {
  entityId: string
  version: number
  supersededBy: number
  broadcastAction?: boolean
}): Promise<UpdateChangeLogResponse> {
  return _updateChangeLog({
    data: {
      entityId,
      version,
      isActive: false,
      supersededBy,
      supersededAt: new Date(),
    },
    broadcastAction,
  })
}
