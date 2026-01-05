import { and, desc, eq, lt, sql } from "drizzle-orm"
import { createHash } from "crypto"
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
import { _saveChangeLog, type SaveChangeLogData } from "./_save-change-log"

export type RollbackDataVersionParams = {
  dataVersion?: number
  userId: string
  changeReason?: string
}

export type RollbackDataVersionResponse = {
  success: boolean
  errors?: string[]
  restoredVersion?: number
}

type VersionedEntityBinding = {
  table: any
  pk: any
  pkKey: string
  versionKey?: string
  publishDateKey?: string
  numericKeys?: string[]
  timestampKeys?: string[]
  forceNullKeys?: string[]
}

const ENTITY_BINDINGS: Record<(typeof changeLogs.$inferSelect)["entityType"], VersionedEntityBinding> = {
  script: {
    table: scripts,
    pk: scripts.scriptId,
    pkKey: "scriptId",
    versionKey: "version",
    publishDateKey: "publishDate",
    numericKeys: ["position"],
    timestampKeys: ["publishDate", "createdAt", "updatedAt", "deletedAt"],
  },
  screen: {
    table: screens,
    pk: screens.screenId,
    pkKey: "screenId",
    versionKey: "version",
    publishDateKey: "publishDate",
    numericKeys: ["position", "timerValue", "multiplier", "minValue", "maxValue"],
    timestampKeys: ["publishDate", "createdAt", "updatedAt", "deletedAt"],
  },
  diagnosis: {
    table: diagnoses,
    pk: diagnoses.diagnosisId,
    pkKey: "diagnosisId",
    versionKey: "version",
    publishDateKey: "publishDate",
    numericKeys: ["position", "severityOrder"],
    timestampKeys: ["publishDate", "createdAt", "updatedAt", "deletedAt"],
  },
  config_key: {
    table: configKeys,
    pk: configKeys.configKeyId,
    pkKey: "configKeyId",
    versionKey: "version",
    publishDateKey: "publishDate",
    numericKeys: ["position"],
    timestampKeys: ["publishDate", "createdAt", "updatedAt", "deletedAt"],
  },
  drugs_library: {
    table: drugsLibrary,
    pk: drugsLibrary.itemId,
    pkKey: "itemId",
    versionKey: "version",
    publishDateKey: "publishDate",
    numericKeys: [
      "minGestation",
      "maxGestation",
      "minWeight",
      "maxWeight",
      "minAge",
      "maxAge",
      "hourlyFeed",
      "hourlyFeedDivider",
      "dosage",
      "dosageMultiplier",
    ],
    timestampKeys: ["publishDate", "createdAt", "updatedAt", "deletedAt"],
  },
  data_key: {
    table: dataKeys,
    pk: dataKeys.uuid,
    pkKey: "uuid",
    versionKey: "version",
    publishDateKey: "publishDate",
    timestampKeys: ["publishDate", "createdAt", "updatedAt", "deletedAt"],
  },
  alias: {
    table: aliases,
    pk: aliases.uuid,
    pkKey: "uuid",
    publishDateKey: "publishDate",
    timestampKeys: ["publishDate", "createdAt", "updatedAt", "deletedAt"],
  },
}

function hashSnapshot(snapshot: any) {
  return createHash("sha256").update(JSON.stringify(snapshot ?? {})).digest("hex")
}

async function ensureSnapshotHash(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  change: typeof changeLogs.$inferSelect,
) {
  if (change.snapshotHash) return change.snapshotHash
  const computed = hashSnapshot(change.fullSnapshot)
  if ((change as any).id) {
    await tx.update(changeLogs).set({ snapshotHash: computed }).where(eq(changeLogs.id, (change as any).id))
  }
  return computed
}

function normalizeSnapshot(snapshot: any) {
  if (snapshot && typeof snapshot === "string") {
    try {
      return JSON.parse(snapshot)
    } catch {
      return {}
    }
  }
  return snapshot ?? {}
}

async function lockEntityRow({
  tx,
  binding,
  entityId,
}: {
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
  binding: VersionedEntityBinding
  entityId: string
}) {
  await tx
    .select({ lock: sql<number>`1` })
    .from(binding.table)
    .where(eq(binding.pk, entityId))
    .for("update")
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

function coerceTemporalValues(payload: Record<string, any>) {
  const temporalPattern = /(_at|_on|_date|_time|Date$|Time$)/i
  const dateLikeKeys = Object.keys(payload).filter((key) => temporalPattern.test(key))
  for (const key of dateLikeKeys) {
    const value = payload[key]
    if (value instanceof Date) continue
    if (value && (typeof value === "string" || typeof value === "number")) {
      const coerced = new Date(value)
      if (!isNaN(coerced.valueOf())) {
        payload[key] = coerced
        continue
      }
    }
    
    payload[key] = null
  }
}

function coerceNumericValues(payload: Record<string, any>, numericKeys: string[]) {
  for (const key of numericKeys) {
    if (!(key in payload)) continue
    const value = payload[key]
    const num = typeof value === "number" ? value : Number(value)
    payload[key] = Number.isFinite(num) ? num : null
  }
}

function coerceTimestampKeys(payload: Record<string, any>, timestampKeys: string[]) {
  for (const key of timestampKeys) {
    if (!(key in payload)) continue
    const value = payload[key]
    if (value instanceof Date) continue
    if (value && (typeof value === "string" || typeof value === "number")) {
      const coerced = new Date(value)
      if (!isNaN(coerced.valueOf())) {
        payload[key] = coerced
        continue
      }
    }
    payload[key] = null
  }
}

function setForceNullKeys(payload: Record<string, any>, forceNullKeys: string[]) {
  for (const key of forceNullKeys) {
    if (key in payload) payload[key] = null
  }
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
  coerceTemporalValues(basePayload)
  if (binding.numericKeys?.length) {
    coerceNumericValues(basePayload, binding.numericKeys)
  }
  if (binding.timestampKeys?.length) {
    coerceTimestampKeys(basePayload, binding.timestampKeys)
  }
  if (binding.forceNullKeys?.length) {
    setForceNullKeys(basePayload, binding.forceNullKeys)
  }

  basePayload[binding.pkKey] = entityId
  if (binding.versionKey) basePayload[binding.versionKey] = newVersion
  if (binding.publishDateKey) basePayload[binding.publishDateKey] = now
  if ("updatedAt" in binding.table) basePayload.updatedAt = now
  if ("createdAt" in binding.table && (basePayload.createdAt === null || basePayload.createdAt === undefined)) {
    basePayload.createdAt = now
  }

  const [updated] = await tx.update(binding.table).set(basePayload).where(eq(binding.pk, entityId)).returning()
  if (updated) return updated

  const insertPayload = { ...basePayload }
  delete insertPayload.id

  const [inserted] = await tx.insert(binding.table).values(insertPayload).returning()
  return inserted
}

async function findPreviousChangeLog(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  current: typeof changeLogs.$inferSelect,
  currentDataVersion: number,
) {
  // Try previous dataVersion first
  const target = await tx.query.changeLogs.findFirst({
    where: and(
      eq(changeLogs.entityId, current.entityId),
      eq(changeLogs.entityType, current.entityType),
      lt(changeLogs.dataVersion, currentDataVersion),
    ),
    orderBy: (changeLogs, { desc }) => [desc(changeLogs.dataVersion), desc(changeLogs.version)],
  })
  if (target) return target

  // Fallback: any older version regardless of dataVersion
  const versionTarget = await tx.query.changeLogs.findFirst({
    where: and(
      eq(changeLogs.entityId, current.entityId),
      eq(changeLogs.entityType, current.entityType),
      lt(changeLogs.version, current.version),
    ),
    orderBy: (changeLogs, { desc }) => [desc(changeLogs.version)],
  })
  return versionTarget ?? current
}

export async function _rollbackDataVersion({
  dataVersion: requestedDataVersion,
  userId,
  changeReason,
}: RollbackDataVersionParams): Promise<RollbackDataVersionResponse> {
  const response: RollbackDataVersionResponse = { success: false }
  let restoredVersion: number | undefined

  try {
    if (!uuid.validate(userId)) throw new Error("Invalid userId")

    await db.transaction(async (tx) => {
      const lockedEditorInfo = await tx.execute<{ id: number; dataVersion: number }>(
        sql`select id, data_version as "dataVersion" from nt_editor_info limit 1 for update`,
      )
      const editor = lockedEditorInfo?.[0]

      const currentDataVersion = requestedDataVersion ?? editor?.dataVersion
      if (!currentDataVersion || currentDataVersion < 2) {
        throw new Error("No data version to rollback or already at initial version")
      }

      if (!editor || editor.dataVersion !== currentDataVersion) {
        throw new Error("Data version drift detected; reload and try again")
      }

      const previousDataVersion = currentDataVersion - 1
      if (previousDataVersion < 1) {
        throw new Error("No previous data version available to restore")
      }

      const targetDataVersion = currentDataVersion + 1
      restoredVersion = targetDataVersion

      await tx.execute(
        sql`select id from nt_change_logs where data_version = ${currentDataVersion} and is_active = true for update`,
      )

      const currentChanges = await tx.query.changeLogs.findMany({
        where: and(eq(changeLogs.dataVersion, currentDataVersion), eq(changeLogs.isActive, true)),
        orderBy: (changeLogs, { asc }) => [asc(changeLogs.entityType), asc(changeLogs.entityId)],
      })

      if (!currentChanges.length) {
        throw new Error(`No active changes found for data version v${currentDataVersion}`)
      }

      // Preflight: ensure each entity has a valid snapshot from the previous published data version (or current if new)
      for (const current of currentChanges) {
        const target = await tx.query.changeLogs.findFirst({
          where: and(
            eq(changeLogs.entityId, current.entityId),
            eq(changeLogs.entityType, current.entityType),
            lt(changeLogs.dataVersion, currentDataVersion),
          ),
          orderBy: (changeLogs, { desc }) => [desc(changeLogs.dataVersion), desc(changeLogs.version)],
        })

        const effectiveTarget = target ?? current

        if (!effectiveTarget.fullSnapshot) throw new Error(`Previous snapshot missing for ${current.entityId}`)
        if (effectiveTarget.entityType !== current.entityType) {
          throw new Error(`Entity type mismatch for ${current.entityId}`)
        }

        // Snapshot integrity (best-effort): if hashes exist, verify; otherwise compute and trust
        const computedTargetHash = hashSnapshot(effectiveTarget.fullSnapshot)
        const storedTargetHash = await ensureSnapshotHash(tx, effectiveTarget)
        if (storedTargetHash !== computedTargetHash) {
          throw new Error(`Snapshot hash mismatch for ${current.entityId} v${effectiveTarget.version}`)
        }
        const storedCurrentHash = await ensureSnapshotHash(tx, current)
        const computedCurrentHash = hashSnapshot(current.fullSnapshot)
        if (storedCurrentHash !== computedCurrentHash) {
          throw new Error(`Snapshot hash mismatch for current ${current.entityId} v${current.version}`)
        }
      }

      // Build grouped restore plan per script (parent + children)
      const scriptChanges = currentChanges.filter((c) => c.entityType === "script")
      const nonScriptChanges = currentChanges.filter((c) => c.entityType !== "script")

      for (const scriptChange of scriptChanges) {
        const binding = ENTITY_BINDINGS[scriptChange.entityType]
        await lockEntityRow({ tx, binding, entityId: scriptChange.entityId })

        const effectiveScriptTarget = await findPreviousChangeLog(tx, scriptChange, currentDataVersion)
    if (!effectiveScriptTarget.fullSnapshot) throw new Error(`Missing previous script snapshot ${scriptChange.entityId}`)

        const plan: { current: typeof changeLogs.$inferSelect; target: typeof changeLogs.$inferSelect; binding: VersionedEntityBinding }[] = []
        plan.push({ current: scriptChange, target: effectiveScriptTarget, binding })

        const childTypes: (typeof changeLogs.$inferSelect)["entityType"][] = ["screen", "diagnosis"]
        for (const childType of childTypes) {
          const children = currentChanges.filter(
            (c) => c.entityType === childType && c.scriptId === scriptChange.scriptId,
          )
          for (const child of children) {
            const childBinding = ENTITY_BINDINGS[childType]
            await lockEntityRow({ tx, binding: childBinding, entityId: child.entityId })
            const targetChild = await tx.query.changeLogs.findFirst({
              where: and(
                eq(changeLogs.entityId, child.entityId),
                eq(changeLogs.entityType, child.entityType),
                lt(changeLogs.dataVersion, currentDataVersion),
              ),
              orderBy: (changeLogs, { desc }) => [desc(changeLogs.dataVersion), desc(changeLogs.version)],
            })
            const fallbackChildTarget = await findPreviousChangeLog(tx, child, currentDataVersion)
            const effectiveChildTarget = targetChild ?? fallbackChildTarget
            if (!effectiveChildTarget || !effectiveChildTarget.fullSnapshot) {
              throw new Error(`Missing previous snapshot for child entity ${child.entityId}`)
            }
            plan.push({ current: child, target: effectiveChildTarget, binding: childBinding })
          }
        }

        // Apply plan atomically
        for (const { current, target, binding } of plan) {
          const effectiveTarget = target ?? current
          const description = `Rollback release v${currentDataVersion} -> v${targetDataVersion} (state of v${previousDataVersion})`
          const targetSnapshot = normalizeSnapshot(effectiveTarget.fullSnapshot)
          const currentSnapshot = normalizeSnapshot(current.fullSnapshot)
          const rollbackChangeLog: SaveChangeLogData = {
            entityId: current.entityId,
            entityType: current.entityType,
            action: "rollback",
            changes: [
              {
                action: "rollback",
                description,
                fromVersion: current.version,
                toVersion: effectiveTarget.version ?? current.version,
                fromDataVersion: currentDataVersion,
                toDataVersion: previousDataVersion,
              },
            ],
            fullSnapshot: targetSnapshot,
            previousSnapshot: currentSnapshot,
            description,
            changeReason: changeReason || description,
            parentVersion: current.version,
            dataVersion: targetDataVersion,
            isActive: true,
            userId,
            scriptId: current.scriptId,
            screenId: current.screenId,
            diagnosisId: current.diagnosisId,
            configKeyId: current.configKeyId,
            drugsLibraryItemId: current.drugsLibraryItemId,
            dataKeyId: current.dataKeyId,
            aliasId: current.aliasId,
          }

          const saved = await _saveChangeLog({ data: rollbackChangeLog, client: tx })
          if (!saved.success || !saved.data) {
            throw new Error(saved.errors?.join(", ") || `Failed to rollback ${current.entityId}`)
          }

          const applied = await applySnapshot({
            tx,
            binding,
            entityId: current.entityId,
            snapshot: targetSnapshot,
            // Restore entity version to the target snapshot's version if available; otherwise use the rollback changelog version
            newVersion: effectiveTarget.version ?? saved.data.version,
          })

          if (!applied) throw new Error(`Failed to apply snapshot for ${current.entityId}`)
        }
      }

      // Non-script entities (singletons)
      for (const current of nonScriptChanges) {
        const binding = ENTITY_BINDINGS[current.entityType]
        if (!binding) throw new Error(`Unsupported entity type ${current.entityType}`)
        await lockEntityRow({ tx, binding, entityId: current.entityId })

        const target = await tx.query.changeLogs.findFirst({
          where: and(
            eq(changeLogs.entityId, current.entityId),
            eq(changeLogs.entityType, current.entityType),
            lt(changeLogs.dataVersion, currentDataVersion),
          ),
          orderBy: (changeLogs, { desc }) => [desc(changeLogs.dataVersion), desc(changeLogs.version)],
        })
        const fallbackTarget = await findPreviousChangeLog(tx, current, currentDataVersion)
        const effectiveTarget = target ?? fallbackTarget
        if (!effectiveTarget || !effectiveTarget.fullSnapshot) throw new Error(`Previous snapshot missing for ${current.entityId}`)

        const description = `Rollback release v${currentDataVersion} -> v${targetDataVersion} (state of v${previousDataVersion})`
        const targetSnapshot = normalizeSnapshot(effectiveTarget.fullSnapshot)
        const currentSnapshot = normalizeSnapshot(current.fullSnapshot)
        const rollbackChangeLog: SaveChangeLogData = {
          entityId: current.entityId,
          entityType: current.entityType,
          action: "rollback",
          changes: [
            {
              action: "rollback",
              description,
              fromVersion: current.version,
              toVersion: effectiveTarget.version ?? current.version,
              fromDataVersion: currentDataVersion,
              toDataVersion: previousDataVersion,
            },
            ],
            fullSnapshot: targetSnapshot,
          previousSnapshot: currentSnapshot,
            description,
            changeReason: changeReason || description,
            parentVersion: current.version,
            dataVersion: targetDataVersion,
            isActive: true,
          userId,
          scriptId: current.scriptId,
          screenId: current.screenId,
          diagnosisId: current.diagnosisId,
          configKeyId: current.configKeyId,
          drugsLibraryItemId: current.drugsLibraryItemId,
          dataKeyId: current.dataKeyId,
          aliasId: current.aliasId,
        }

        const saved = await _saveChangeLog({ data: rollbackChangeLog, client: tx })
        if (!saved.success || !saved.data) {
          throw new Error(saved.errors?.join(", ") || `Failed to rollback ${current.entityId}`)
        }

        const applied = await applySnapshot({
          tx,
          binding,
          entityId: current.entityId,
          snapshot: targetSnapshot,
          newVersion: effectiveTarget.version ?? saved.data.version,
        })

        if (!applied) throw new Error(`Failed to apply snapshot for ${current.entityId}`)
      }

      if (editor) {
        await tx
          .update(editorInfo)
          .set({ dataVersion: targetDataVersion, lastPublishDate: new Date() })
          .where(eq(editorInfo.id, editor.id))
      }
    })

    response.success = true
    response.restoredVersion = restoredVersion
    return response
  } catch (e: any) {
    logger.error("_rollbackDataVersion ERROR", e.message)
    response.errors = [e.message]
    return response
  }
}
