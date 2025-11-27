import { and, desc, eq } from "drizzle-orm"
import * as uuid from "uuid"

import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import {
  aliases,
  changeLogs,
  configKeys,
  dataKeys,
  diagnoses,
  drugsLibrary,
  editorInfo,
  screens,
  scripts,
} from "@/databases/pg/schema"
import socket from "@/lib/socket"
import { _saveChangeLog, type SaveChangeLogData } from "./_save-change-log"

export type RollbackChangeLogParams = {
  entityId: string
  toVersion?: number
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

type VersionedEntityBinding = {
  table: any
  pk: any
  pkKey: string
  versionKey?: string
  publishDateKey?: string
}

const ENTITY_BINDINGS: Record<(typeof changeLogs.$inferSelect)["entityType"], VersionedEntityBinding> = {
  script: { table: scripts, pk: scripts.scriptId, pkKey: "scriptId", versionKey: "version", publishDateKey: "publishDate" },
  screen: { table: screens, pk: screens.screenId, pkKey: "screenId", versionKey: "version", publishDateKey: "publishDate" },
  diagnosis: {
    table: diagnoses,
    pk: diagnoses.diagnosisId,
    pkKey: "diagnosisId",
    versionKey: "version",
    publishDateKey: "publishDate",
  },
  config_key: {
    table: configKeys,
    pk: configKeys.configKeyId,
    pkKey: "configKeyId",
    versionKey: "version",
    publishDateKey: "publishDate",
  },
  drugs_library: {
    table: drugsLibrary,
    pk: drugsLibrary.itemId,
    pkKey: "itemId",
    versionKey: "version",
    publishDateKey: "publishDate",
  },
  data_key: {
    table: dataKeys,
    pk: dataKeys.uuid,
    pkKey: "uuid",
    versionKey: "version",
    publishDateKey: "publishDate",
  },
  alias: {
    table: aliases,
    pk: aliases.uuid,
    pkKey: "uuid",
    publishDateKey: "publishDate",
  },
}

function pickColumns(snapshot: any, table: any) {
  const allowed = Object.keys(table).filter((key) => {
    const col = (table as any)[key]
    return col && typeof col === "object" && "name" in col
  })

  return allowed.reduce<Record<string, any>>((acc, key) => {
    if (snapshot[key] !== undefined) acc[key] = snapshot[key]
    return acc
  }, {})
}

async function applySnapshot({
  tx,
  binding,
  entityId,
  snapshot,
  newVersion,
}: {
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
  binding: VersionedEntityBinding
  entityId: string
  snapshot: any
  newVersion: number
}) {
  const now = new Date()
  const basePayload = pickColumns(snapshot ?? {}, binding.table)

  // Always enforce identifiers and version progression
  basePayload[binding.pkKey] = entityId
  if (binding.versionKey) basePayload[binding.versionKey] = newVersion
  if (binding.publishDateKey) basePayload[binding.publishDateKey] = now
  if ("updatedAt" in binding.table) basePayload.updatedAt = now

  const [updated] = await tx.update(binding.table).set(basePayload).where(eq(binding.pk, entityId)).returning()

  if (updated) return updated

  const insertPayload = { ...basePayload }
  delete insertPayload.id // avoid serial/id collisions when re-creating

  const [inserted] = await tx.insert(binding.table).values(insertPayload).returning()
  return inserted
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

    const result = await db.transaction(async (tx) => {
      const current = await tx.query.changeLogs.findFirst({
        where: and(eq(changeLogs.entityId, entityId), eq(changeLogs.isActive, true)),
        orderBy: (changeLogs, { desc }) => [desc(changeLogs.version)],
      })

      if (!current) throw new Error("No active version found for entity")

      const expectedPreviousVersion = current.parentVersion ?? current.version - 1
      if (!expectedPreviousVersion || expectedPreviousVersion < 1) {
        throw new Error("No previous version available to restore")
      }

      if (toVersion !== undefined && toVersion !== expectedPreviousVersion) {
        throw new Error(`Can only restore to immediate previous version (${expectedPreviousVersion})`)
      }

      const target = await tx.query.changeLogs.findFirst({
        where: and(eq(changeLogs.entityId, entityId), eq(changeLogs.version, expectedPreviousVersion)),
      })

      if (!target) {
        throw new Error(`Previous version ${expectedPreviousVersion} not found for entity`)
      }
      if (target.entityType !== current.entityType) {
        throw new Error("Entity type mismatch between current and previous versions")
      }
      if (!target.fullSnapshot) {
        throw new Error(`Previous version ${expectedPreviousVersion} is missing a full snapshot`)
      }

      const binding = ENTITY_BINDINGS[current.entityType]
      if (!binding) throw new Error(`Unsupported entity type ${current.entityType}`)

      const editor = await tx.query.editorInfo.findFirst()
      const nextDataVersion = (editor?.dataVersion ?? current.dataVersion ?? 0) + 1
      const description = `Rollback to version ${target.version}`

      const newChangeLogData: SaveChangeLogData = {
        entityId,
        entityType: current.entityType,
        action: "rollback",
        changes: [
          {
            action: "rollback",
            description,
            fromVersion: current.version,
            toVersion: target.version,
          },
        ],
        fullSnapshot: target.fullSnapshot,
        description,
        changeReason: changeReason || description,
        parentVersion: current.version,
        dataVersion: nextDataVersion,
        isActive: true,
        userId,
        scriptId: target.scriptId,
        screenId: target.screenId,
        diagnosisId: target.diagnosisId,
        configKeyId: target.configKeyId,
        drugsLibraryItemId: target.drugsLibraryItemId,
        dataKeyId: target.dataKeyId,
        aliasId: target.aliasId,
      }

      const saveResult = await _saveChangeLog({
        data: newChangeLogData,
        broadcastAction: false,
        client: tx,
      })

      if (!saveResult.success || !saveResult.data) {
        throw new Error(saveResult.errors?.join(", ") || "Failed to save rollback changelog")
      }

      const applied = await applySnapshot({
        tx,
        binding,
        entityId,
        snapshot: target.fullSnapshot,
        newVersion: saveResult.data.version,
      })

      if (!applied) {
        throw new Error("Failed to apply snapshot to entity")
      }

      if (editor) {
        await tx
          .update(editorInfo)
          .set({ dataVersion: nextDataVersion, lastPublishDate: new Date() })
          .where(eq(editorInfo.id, editor.id))
      }

      return saveResult.data
    })

    response.success = true
    response.newVersion = result?.version
    response.data = result

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
