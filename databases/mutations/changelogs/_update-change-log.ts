import { eq, and, sql } from "drizzle-orm"
import * as uuid from "uuid"

import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import { changeLogs } from "@/databases/pg/schema"
import socket from "@/lib/socket"

export type UpdateChangeLogData = {
  changeLogId?: string
  entityId?: string
  entityType?: (typeof changeLogs.$inferSelect)["entityType"]
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

function hashToInt32(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return hash
}

async function lockChangeLogChain(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], entityType: string, entityId: string) {
  await tx.execute(sql`select pg_advisory_xact_lock(${hashToInt32(entityType)}, ${hashToInt32(entityId)})`)
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
    if (data.changeLogId && !uuid.validate(data.changeLogId)) {
      throw new Error("Invalid changeLogId")
    }
    if (!data.changeLogId && !data.entityType) {
      throw new Error("entityType is required when updating by entityId+version")
    }
    if (data.entityId && !uuid.validate(data.entityId)) {
      throw new Error("Invalid entityId")
    }
    if (data.isActive === true) {
      throw new Error("Reactivating changelog entries is not supported")
    }

    const executor = async (tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) => {
      const existing = data.changeLogId && uuid.validate(data.changeLogId)
        ? await tx.query.changeLogs.findFirst({
            where: eq(changeLogs.changeLogId, data.changeLogId),
          })
        : await tx.query.changeLogs.findFirst({
            where: and(
              eq(changeLogs.entityType, data.entityType!),
              eq(changeLogs.entityId, data.entityId!),
              eq(changeLogs.version, data.version!),
            ),
          })

      if (!existing) {
        logger.error("_updateChangeLog not found", {
          changeLogId: data.changeLogId,
          entityType: data.entityType,
          entityId: data.entityId,
          version: data.version,
        })
        return null
      }

      await lockChangeLogChain(tx, existing.entityType, existing.entityId)

      const updateData: Partial<typeof changeLogs.$inferInsert> = {}

      if (data.isActive !== undefined) updateData.isActive = data.isActive
      if (data.supersededBy !== undefined) updateData.supersededBy = data.supersededBy
      if (data.supersededAt !== undefined) updateData.supersededAt = data.supersededAt
      if (data.description !== undefined) updateData.description = data.description
      if (data.changeReason !== undefined) updateData.changeReason = data.changeReason

      if (!Object.keys(updateData).length) {
        throw new Error("No changelog fields provided to update")
      }

      const whereClause = eq(changeLogs.changeLogId, existing.changeLogId)
      const [updated] = await tx.update(changeLogs).set(updateData).where(whereClause).returning()

      if (!updated) {
        logger.error("_updateChangeLog update returned no row", {
          changeLogId: existing.changeLogId,
          entityType: existing.entityType,
          entityId: existing.entityId,
          version: existing.version,
        })
        return null
      }

      return updated
    }

    const updated = await db.transaction(executor)

    if (!updated) {
      response.errors = ["Change log not found"]
      return response
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
  entityType,
  version,
  supersededBy,
  broadcastAction,
}: {
  entityId: string
  entityType: (typeof changeLogs.$inferSelect)["entityType"]
  version: number
  supersededBy: number
  broadcastAction?: boolean
}): Promise<UpdateChangeLogResponse> {
  return _updateChangeLog({
    data: {
      entityId,
      entityType,
      version,
      isActive: false,
      supersededBy,
      supersededAt: new Date(),
    },
    broadcastAction,
  })
}
