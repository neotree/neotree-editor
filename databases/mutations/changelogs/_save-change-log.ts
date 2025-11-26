import { and, eq, lt, sql } from "drizzle-orm"
import * as uuid from "uuid"

import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import { changeLogs } from "@/databases/pg/schema"
import socket from "@/lib/socket"

export type SaveChangeLogData = {
  entityId: string
  entityType: (typeof changeLogs.$inferSelect)["entityType"]
  action: (typeof changeLogs.$inferSelect)["action"]
  version?: number
  dataVersion?: number | null
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

const ENTITY_TYPE_TO_FK: Record<SaveChangeLogData["entityType"], keyof SaveChangeLogData> = {
  script: "scriptId",
  screen: "screenId",
  diagnosis: "diagnosisId",
  config_key: "configKeyId",
  drugs_library: "drugsLibraryItemId",
  data_key: "dataKeyId",
  alias: "aliasId",
}

type DbClient = typeof db
type TransactionClient = Parameters<Parameters<typeof db.transaction>[0]>[0]
type DbOrTransaction = DbClient | TransactionClient

function validateEntityAlignment(data: SaveChangeLogData) {
  if (!uuid.validate(data.entityId)) throw new Error("Invalid entityId")
  if (!uuid.validate(data.userId)) throw new Error("Invalid userId")

  const expectedFkKey = ENTITY_TYPE_TO_FK[data.entityType]
  const expectedFkValue = data[expectedFkKey]

  if (!expectedFkValue || typeof expectedFkValue !== "string" || !uuid.validate(expectedFkValue)) {
    throw new Error(`Missing or invalid ${expectedFkKey} for entityType ${data.entityType}`)
  }

  // Ensure the entity id we record matches the concrete FK id to avoid mismatched audit trails
  if (expectedFkValue !== data.entityId) {
    throw new Error(`entityId must match ${expectedFkKey} for entityType ${data.entityType}`)
  }

  // Prevent multiple entity foreign keys being set at once
  const populatedFks = Object.entries(ENTITY_TYPE_TO_FK)
    .map(([type, key]) => ({ type, key, value: (data as any)[key] }))
    .filter((entry) => entry.value !== undefined && entry.value !== null)

  const nonEmptyFks = populatedFks.filter((entry) => entry.value)
  const hasUnexpectedFk = nonEmptyFks.some((entry) => entry.type !== data.entityType)
  if (hasUnexpectedFk) {
    throw new Error(`Only the ${expectedFkKey} FK should be provided for entityType ${data.entityType}`)
  }

  if (data.action === "publish") {
    const numericDataVersion = Number(data.dataVersion)
    if (!Number.isFinite(numericDataVersion) || numericDataVersion <= 0) {
      throw new Error("dataVersion is required and must be a positive number for publish actions")
    }
  }
}

async function getNextVersion(client: DbOrTransaction, entityId: string, entityType: SaveChangeLogData["entityType"]) {
  const result = await client
    .select({ maxVersion: sql<number>`coalesce(max(${changeLogs.version}), 0)` })
    .from(changeLogs)
    .where(and(eq(changeLogs.entityId, entityId), eq(changeLogs.entityType, entityType)))

  return (result[0]?.maxVersion ?? 0) + 1
}

export async function _saveChangeLog({
  data,
  broadcastAction,
  client,
}: {
  data: SaveChangeLogData
  broadcastAction?: boolean
  client?: DbOrTransaction
}): Promise<SaveChangeLogResponse> {
  const response: SaveChangeLogResponse = { success: false }

  try {
    validateEntityAlignment(data)

    const executor = async (tx: DbOrTransaction) => {
      const changeLogId = uuid.v4()
      const computedVersion = await getNextVersion(tx, data.entityId, data.entityType)
      const dataVersion = Number.isFinite(data.dataVersion) ? Number(data.dataVersion) : null

      const changeLogData: typeof changeLogs.$inferInsert = {
        changeLogId,
        entityId: data.entityId,
        entityType: data.entityType,
        action: data.action,
        version: computedVersion,
        dataVersion,
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

      const [inserted] = await tx.insert(changeLogs).values(changeLogData).returning()

      if (inserted && inserted.entityId && Number.isFinite(inserted.version)) {
        await tx
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

      return inserted
    }

    const insertResult = client ? await executor(client) : await db.transaction(executor)

    response.success = true
    response.data = insertResult

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
