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
}: {
  data: SaveChangeLogData
  broadcastAction?: boolean
}): Promise<SaveChangeLogResponse> {
  const response: SaveChangeLogResponse = { success: false }

  try {
    const changeLogId = uuid.v4()

    const changeLogData: typeof changeLogs.$inferInsert = {
      changeLogId,
      entityId: data.entityId,
      entityType: data.entityType,
      action: data.action,
      version: data.version,
      changes: data.changes || [],
      fullSnapshot: data.fullSnapshot || {},
      description: data.description,
      changeReason: data.changeReason,
      parentVersion: data.parentVersion,
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

    const [inserted] = await db.insert(changeLogs).values(changeLogData).returning()

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
}: {
  data: SaveChangeLogData[]
  broadcastAction?: boolean
}): Promise<{ success: boolean; errors?: string[]; saved: number }> {
  let saved = 0
  const errors: string[] = []

  try {
    for (const changeLogData of data) {
      const res = await _saveChangeLog({ data: changeLogData })

      if (res.errors?.length) {
        errors.push(...res.errors)
      } else {
        saved++
      }
    }

    if (broadcastAction && !errors.length) {
      socket.emit("data_changed", "save_change_logs")
    }

    return {
      success: !errors.length,
      errors: errors.length ? errors : undefined,
      saved,
    }
  } catch (e: any) {
    logger.error("_saveChangeLogs ERROR", e.message)
    return { success: false, errors: [e.message], saved }
  }
}
