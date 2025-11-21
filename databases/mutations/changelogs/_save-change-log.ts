import { and, eq, lt } from "drizzle-orm"
import * as uuid from "uuid"

import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import { changeLogs } from "@/databases/pg/schema"
import socket from "@/lib/socket"

export type SaveChangeLogData = {
  entityId: string
  entityType: (typeof changeLogs.$inferSelect)["entityType"]
  action: (typeof changeLogs.$inferSelect)["action"]
  version: number
  dataVersion?: number
  changes?: any
  fullSnapshot?: any
  description?: string
  changeReason?: string
  parentVersion?: number | null
  mergedFromVersion?: number | null
  isActive?: boolean
  userId: string
  scriptId?: string | null
  screenId?: string | null
  diagnosisId?: string | null
  configKeyId?: string | null
  drugsLibraryItemId?: string | null
  dataKeyId?: string | null
  aliasId?: string | null
}

export type SaveChangeLogResponse = {
  success: boolean
  errors?: string[]
  data?: typeof changeLogs.$inferSelect
}

export async function _saveChangeLog({
  data,
  broadcastAction,
  tx,
  allowLegacyGaps,
}: {
  data: SaveChangeLogData
  broadcastAction?: boolean
  tx?: typeof db
  allowLegacyGaps?: boolean
}): Promise<SaveChangeLogResponse> {
  const response: SaveChangeLogResponse = { success: false }

  try {
    const client = tx ?? db
    const changeLogId = uuid.v4()

    const latest = await client.query.changeLogs.findFirst({
      where: and(eq(changeLogs.entityId, data.entityId), eq(changeLogs.entityType, data.entityType)),
      orderBy: (changeLogs, { desc }) => [desc(changeLogs.version)],
      columns: {
        version: true,
      },
    })

    const expectedNextVersion = (latest?.version ?? 0) + 1
    if (data.version !== expectedNextVersion && !allowLegacyGaps) {
      throw new Error(
        `Version mismatch for ${data.entityType}:${data.entityId}. Expected v${expectedNextVersion}, got v${data.version}`
      )
    }

    const resolvedParentVersion = data.parentVersion ?? latest?.version ?? null
    if (latest && resolvedParentVersion !== latest.version && !allowLegacyGaps) {
      throw new Error(
        `Parent mismatch for ${data.entityType}:${data.entityId}. Expected parent v${latest.version} but got ${resolvedParentVersion}`
      )
    }

    const changeLogData: typeof changeLogs.$inferInsert = {
      changeLogId,
      entityId: data.entityId,
      entityType: data.entityType,
      action: data.action,
      version: data.version,
      dataVersion: data.dataVersion,
      changes: data.changes || [],
      fullSnapshot: data.fullSnapshot || {},
      description: data.description,
      changeReason: data.changeReason,
      parentVersion: resolvedParentVersion,
      mergedFromVersion: data.mergedFromVersion,
      isActive: data.isActive !== false,
      userId: data.userId,
      scriptId: data.scriptId,
      screenId: data.screenId,
      diagnosisId: data.diagnosisId,
      configKeyId: data.configKeyId,
      drugsLibraryItemId: data.drugsLibraryItemId,
      dataKeyId: data.dataKeyId,
      aliasId: data.aliasId,
      dateOfChange: new Date(),
    }

    const [inserted] = await client.insert(changeLogs).values(changeLogData).returning()

    if (inserted && inserted.entityId && Number.isFinite(inserted.version)) {
      await client
        .update(changeLogs)
        .set({
          isActive: false,
          supersededBy: inserted.version,
          supersededAt: inserted.dateOfChange ?? new Date(),
        })
        .where(
          and(
            eq(changeLogs.entityId, inserted.entityId),
            eq(changeLogs.entityType, inserted.entityType),
            lt(changeLogs.version, inserted.version),
            eq(changeLogs.isActive, true),
          ),
        )
    }

    response.success = true
    response.data = inserted

    if (broadcastAction) {
      socket.emit("data_changed", "save_change_log")
    }

    return response
  } catch (e: any) {
    response.success = false
    response.errors = [e.message]
    logger.error("_saveChangeLog ERROR", e.message)
    return response
  }
}

export async function _saveChangeLogs({
  data,
  broadcastAction,
  allowLegacyGaps,
}: {
  data: SaveChangeLogData[]
  broadcastAction?: boolean
  allowLegacyGaps?: boolean
}): Promise<{ success: boolean; errors?: string[]; saved: number }> {
  let saved = 0
  const errors: string[] = []

  try {
    await db.transaction(async (tx) => {
      for (const changeLogData of data) {
        const res = await _saveChangeLog({ data: changeLogData, tx, allowLegacyGaps })

        if (res.errors?.length) {
          errors.push(...res.errors)
          throw new Error(errors.join(", "))
        } else {
          saved++
        }
      }
    })

    if (broadcastAction) {
      socket.emit("data_changed", "save_change_logs")
    }

    return { success: true, saved }
  } catch (e: any) {
    logger.error("_saveChangeLogs ERROR", e.message)
    if (!errors.length) errors.push(e.message)
    return { success: false, errors, saved: 0 }
  }
}
