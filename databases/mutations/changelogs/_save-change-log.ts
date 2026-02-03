import { and, desc, eq, lt } from "drizzle-orm"
import { createHash } from "crypto"
import * as uuid from "uuid"

import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user"
import {
  aliases,
  changeLogs,
  configKeys,
  dataKeys,
  diagnoses,
  drugsLibrary,
  hospitals,
  screens,
  scripts,
} from "@/databases/pg/schema"
import socket from "@/lib/socket"
import { sql } from "drizzle-orm"

export type SaveChangeLogData = {
  entityId: string
  entityType: (typeof changeLogs.$inferSelect)["entityType"]
  action: (typeof changeLogs.$inferSelect)["action"]
  version?: number
  dataVersion?: number | null
  changes?: any
  fullSnapshot?: any
  previousSnapshot?: any
  snapshotHash?: string | null
  description?: string
  changeReason?: string
  parentVersion?: number | null
  mergedFromVersion?: number | null
  baselineSnapshot?: any
  isActive?: boolean
  userId: string
  scriptId?: string | null
  screenId?: string | null
  diagnosisId?: string | null
  configKeyId?: string | null
  drugsLibraryItemId?: string | null
  dataKeyId?: string | null
  aliasId?: string | null
  hospitalId?: string | null
}

export type SaveChangeLogResponse = {
  success: boolean
  errors?: string[]
  data?: typeof changeLogs.$inferSelect
}

const ENTITY_TYPE_TO_FK: Partial<Record<SaveChangeLogData["entityType"], keyof SaveChangeLogData>> = {
  script: "scriptId",
  screen: "screenId",
  diagnosis: "diagnosisId",
  config_key: "configKeyId",
  drugs_library: "drugsLibraryItemId",
  data_key: "dataKeyId",
  alias: "aliasId",
  hospital: "hospitalId",
}

// Allow certain contextual foreign keys alongside the primary FK (e.g., a screen changelog can also include its scriptId)
const ENTITY_TYPE_ALLOWED_CONTEXT_FKS: Partial<Record<SaveChangeLogData["entityType"], (keyof SaveChangeLogData)[]>> = {
  screen: ["scriptId"],
  diagnosis: ["scriptId"],
}

type EntityVersionConfig = {
  table: any
  idColumn: any
  versionColumn: any
  entityLabel: string
}

type EntityFetchConfig = {
  table: any
  idColumn: any
  entityLabel: string
}

type EntityType = SaveChangeLogData["entityType"]
const VERSIONLESS_ENTITY_TYPES: EntityType[] = ["alias", "release", "app_update_policy", "apk_release"]
const NO_FK_ENTITY_TYPES: EntityType[] = ["release", "app_update_policy", "apk_release"]
const VERSIONED_ENTITY_TYPES = [
  "script",
  "screen",
  "diagnosis",
  "config_key",
  "drugs_library",
  "data_key",
  "hospital",
] as const
type VersionedEntityType = (typeof VERSIONED_ENTITY_TYPES)[number]

const ENTITY_VERSION_CONFIG: Record<VersionedEntityType, EntityVersionConfig> = {
  script: { table: scripts, idColumn: scripts.scriptId, versionColumn: scripts.version, entityLabel: "script" },
  screen: { table: screens, idColumn: screens.screenId, versionColumn: screens.version, entityLabel: "screen" },
  diagnosis: {
    table: diagnoses,
    idColumn: diagnoses.diagnosisId,
    versionColumn: diagnoses.version,
    entityLabel: "diagnosis",
  },
  config_key: {
    table: configKeys,
    idColumn: configKeys.configKeyId,
    versionColumn: configKeys.version,
    entityLabel: "config key",
  },
  drugs_library: {
    table: drugsLibrary,
    idColumn: drugsLibrary.itemId,
    versionColumn: drugsLibrary.version,
    entityLabel: "drugs library item",
  },
  data_key: { table: dataKeys, idColumn: dataKeys.uuid, versionColumn: dataKeys.version, entityLabel: "data key" },
  hospital: {
    table: hospitals,
    idColumn: hospitals.hospitalId,
    versionColumn: hospitals.version,
    entityLabel: "hospital",
  },
}

const ENTITY_FETCH_CONFIG: Partial<Record<EntityType, EntityFetchConfig>> = {
  script: { table: scripts, idColumn: scripts.scriptId, entityLabel: "script" },
  screen: { table: screens, idColumn: screens.screenId, entityLabel: "screen" },
  diagnosis: { table: diagnoses, idColumn: diagnoses.diagnosisId, entityLabel: "diagnosis" },
  config_key: { table: configKeys, idColumn: configKeys.configKeyId, entityLabel: "config key" },
  drugs_library: { table: drugsLibrary, idColumn: drugsLibrary.itemId, entityLabel: "drugs library item" },
  data_key: { table: dataKeys, idColumn: dataKeys.uuid, entityLabel: "data key" },
  alias: { table: aliases, idColumn: aliases.uuid, entityLabel: "alias" },
  hospital: { table: hospitals, idColumn: hospitals.hospitalId, entityLabel: "hospital" },
}


type DbClient = typeof db
type TransactionClient = Parameters<Parameters<typeof db.transaction>[0]>[0]
type DbOrTransaction = DbClient | TransactionClient

function hashToInt32(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return hash
}

async function lockChangeLogChain(client: DbOrTransaction, entityType: string, entityId: string) {
  const key1 = hashToInt32(entityType)
  const key2 = hashToInt32(entityId)
  await client.execute(sql`select pg_advisory_xact_lock(${key1}, ${key2})`)
}

function computeSnapshotHash(snapshot: any) {
  return createHash("sha256").update(JSON.stringify(snapshot ?? {})).digest("hex")
}

async function resolveUserId(data: SaveChangeLogData) {
  const rawUserId = typeof data.userId === "string" ? data.userId.trim() : ""
  const hasValidUserId = rawUserId && uuid.validate(rawUserId)

  if (!rawUserId || !hasValidUserId) {
    try {
      const authUser = await getAuthenticatedUser()
      const authUserId = authUser?.userId
      if (authUserId && uuid.validate(authUserId)) {
        logger.error("saveChangeLog warning: invalid or missing userId; using authenticated userId", {
          providedUserId: data.userId,
          authenticatedUserId: authUserId,
        })
        return { ...data, userId: authUserId }
      }
    } catch (e: any) {
      logger.error("saveChangeLog warning: failed to resolve authenticated userId", e?.message || e)
    }
  }

  if (!hasValidUserId) {
    logger.error("saveChangeLog warning: invalid userId", {
      providedUserId: data.userId,
      entityType: data.entityType,
      entityId: data.entityId,
    })
  }

  return { ...data, userId: rawUserId || data.userId }
}

function validateEntityAlignment(data: SaveChangeLogData) {
  if (!uuid.validate(data.entityId)) throw new Error("Invalid entityId")
  if (!uuid.validate(data.userId)) throw new Error("Invalid userId")

  if (NO_FK_ENTITY_TYPES.includes(data.entityType)) {
    const populatedFks = Object.values(ENTITY_TYPE_TO_FK)
      .map((key) => (data as any)[key])
      .filter((value) => value !== undefined && value !== null)
    if (populatedFks.length) {
      throw new Error(`No foreign keys should be provided for entityType ${data.entityType}`)
    }
    return
  }

  const expectedFkKey = ENTITY_TYPE_TO_FK[data.entityType]
  if (!expectedFkKey) {
    throw new Error(`Unknown entityType ${data.entityType}`)
  }
  const expectedFkValue = data[expectedFkKey]

  if (!expectedFkValue || typeof expectedFkValue !== "string" || !uuid.validate(expectedFkValue)) {
    throw new Error(`Missing or invalid ${expectedFkKey} for entityType ${data.entityType}`)
  }

  // Ensure the entity id we record matches the concrete FK id to avoid mismatched audit trails
  if (expectedFkValue !== data.entityId) {
    throw new Error(`entityId must match ${expectedFkKey} for entityType ${data.entityType}`)
  }

  // Validate allowed contextual FKs if provided
  const allowedContextFks = ENTITY_TYPE_ALLOWED_CONTEXT_FKS[data.entityType] || []
  for (const key of allowedContextFks) {
    const value = (data as any)[key]
    if (value !== undefined && value !== null) {
      if (typeof value !== "string" || !uuid.validate(value)) {
        throw new Error(`Invalid ${String(key)} for entityType ${data.entityType}`)
      }
    }
  }

  // Prevent multiple entity foreign keys being set at once
  const populatedFks = Object.entries(ENTITY_TYPE_TO_FK)
    .map(([type, key]) => ({ type, key, value: (data as any)[key] }))
    .filter((entry) => entry.value !== undefined && entry.value !== null)

  const nonEmptyFks = populatedFks.filter((entry) => entry.value)
  const hasUnexpectedFk = nonEmptyFks.some(
    (entry) => entry.type !== data.entityType && !allowedContextFks.includes(entry.key as keyof SaveChangeLogData),
  )
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

function isVersionlessEntityType(entityType: EntityType): entityType is typeof VERSIONLESS_ENTITY_TYPES[number] {
  return VERSIONLESS_ENTITY_TYPES.includes(entityType)
}

async function getEntityVersion(client: DbOrTransaction, data: SaveChangeLogData & { entityType: VersionedEntityType }) {
  const config = ENTITY_VERSION_CONFIG[data.entityType]
  if (!config) throw new Error(`Unknown entityType ${data.entityType}`)

  const rows = await client
    .select({ version: config.versionColumn })
    .from(config.table)
    .where(eq(config.idColumn, data.entityId))
    .limit(1)

  const version = rows?.[0]?.version
  if (!Number.isFinite(version)) {
    throw new Error(`Missing ${config.entityLabel} or version for entityId ${data.entityId}`)
  }

  return Number(version)
}

async function getLatestChangeLogVersion(client: DbOrTransaction, entityId: string, entityType: SaveChangeLogData["entityType"]) {
  const rows = await client
    .select({ version: changeLogs.version })
    .from(changeLogs)
    .where(and(eq(changeLogs.entityId, entityId), eq(changeLogs.entityType, entityType)))
    .orderBy(desc(changeLogs.version))
    .limit(1)

  return rows?.[0]?.version as number | undefined
}

async function getEntitySnapshot(client: DbOrTransaction, data: SaveChangeLogData) {
  const config = ENTITY_FETCH_CONFIG[data.entityType]
  if (!config) throw new Error(`Unknown entityType ${data.entityType}`)

  const rows = await client
    .select()
    .from(config.table)
    .where(eq(config.idColumn, data.entityId))
    .limit(1)

  if (!rows?.[0]) throw new Error(`Entity not found for snapshot (${config.entityLabel} ${data.entityId})`)
  return rows[0]
}

async function ensureBaselineChangeLog({
  client,
  data,
  computedVersion,
  dataVersion,
  baselineSnapshot,
}: {
  client: DbOrTransaction
  data: SaveChangeLogData
  computedVersion: number
  dataVersion: number | null
  baselineSnapshot?: any
}): Promise<number | undefined> {
  // Only create baseline when no prior changelog exists for this entity
  const latestVersion = await getLatestChangeLogVersion(client, data.entityId, data.entityType)
  if (Number.isFinite(latestVersion)) return

  let snapshotForBaseline = baselineSnapshot ?? data.previousSnapshot

  if (snapshotForBaseline === undefined) {
    try {
      snapshotForBaseline = await getEntitySnapshot(client, data)
      logger.error("saveChangeLog baselineSnapshot missing; captured current entity state as baseline", {
        entityId: data.entityId,
        entityType: data.entityType,
      })
    } catch (e: any) {
      throw new Error(
        "baselineSnapshot is required for the first changelog of an entity to capture the pre-change state",
      )
    }
  }

  const baselineVersion = Math.max(0, computedVersion - 1)
  const snapshotHash = computeSnapshotHash(snapshotForBaseline)

  const baseline: typeof changeLogs.$inferInsert = {
    changeLogId: uuid.v4(),
    entityId: data.entityId,
    entityType: data.entityType,
    action: "create",
    version: baselineVersion,
    dataVersion,
    changes: [],
    fullSnapshot: snapshotForBaseline,
    previousSnapshot: snapshotForBaseline,
    snapshotHash,
    description: "Baseline snapshot",
    changeReason: "Baseline snapshot",
    parentVersion: null,
    mergedFromVersion: null,
    isActive: false,
    userId: data.userId,
    scriptId: data.scriptId,
    screenId: data.screenId,
    diagnosisId: data.diagnosisId,
    configKeyId: data.configKeyId,
    hospitalId: data.hospitalId,
    drugsLibraryItemId: data.drugsLibraryItemId,
    dataKeyId: data.dataKeyId,
    aliasId: data.aliasId,
    dateOfChange: new Date(),
  }

  await client.insert(changeLogs).values(baseline)

  return baselineVersion
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
    const resolvedData = await resolveUserId(data)
    validateEntityAlignment(resolvedData)

    const executor = async (tx: DbOrTransaction) => {
      await lockChangeLogChain(tx, resolvedData.entityType, resolvedData.entityId)

      const changeLogId = uuid.v4()
      const isVersionless = isVersionlessEntityType(resolvedData.entityType)
      let computedVersion: number
      const providedVersion = Number.isFinite(resolvedData.version) ? Number(resolvedData.version) : null
      const dataVersion = Number.isFinite(resolvedData.dataVersion) ? Number(resolvedData.dataVersion) : null
      let latestChangeLogVersion: number | undefined
      let baselineVersionCreated: number | undefined
      if (isVersionless) {
        const latestVersion = await getLatestChangeLogVersion(tx, resolvedData.entityId, resolvedData.entityType)
        latestChangeLogVersion = latestVersion
        computedVersion = (latestVersion ?? 0) + 1

        baselineVersionCreated = await ensureBaselineChangeLog({
          client: tx,
          data: resolvedData,
          computedVersion,
          dataVersion,
          baselineSnapshot: resolvedData.baselineSnapshot,
        })

        if (providedVersion !== null && providedVersion !== computedVersion) {
          if (providedVersion < computedVersion) {
            // logger.error("saveChangeLog versionless stale providedVersion, auto-upgrading", {
            //   entityType: data.entityType,
            //   entityId: data.entityId,
            //   providedVersion,
            //   latestChangeLogVersion: latestVersion,
            //   computedVersion,
            // })
          } else {
            logger.error("saveChangeLog versionless mismatch", {
              entityType: resolvedData.entityType,
              entityId: resolvedData.entityId,
              providedVersion,
              latestChangeLogVersion: latestVersion,
              computedVersion,
            })
            throw new Error(
              `Provided version (${resolvedData.version}) does not match expected changelog version (${computedVersion}) for versionless entity ${resolvedData.entityType}`,
            )
          }
        }
      } else {
        const entityType = resolvedData.entityType as VersionedEntityType
        const entityVersion = await getEntityVersion(tx, { ...resolvedData, entityType })
        const config = ENTITY_VERSION_CONFIG[entityType]
        const latestVersion = await getLatestChangeLogVersion(tx, resolvedData.entityId, resolvedData.entityType)
        latestChangeLogVersion = latestVersion

        // Prefer the entity's version, but if legacy data has higher changelog versions already,
        // continue the changelog sequence to avoid blocking writes.
        if (Number.isFinite(latestVersion)) {
          const nextSequential = Number(latestVersion) + 1
          computedVersion = entityVersion <= Number(latestVersion) ? nextSequential : entityVersion
        } else {
          computedVersion = entityVersion
        }

        baselineVersionCreated = await ensureBaselineChangeLog({
          client: tx,
          data: resolvedData,
          computedVersion,
          dataVersion,
          baselineSnapshot: resolvedData.baselineSnapshot,
        })

        if (providedVersion !== null && providedVersion !== computedVersion) {
          if (providedVersion < computedVersion) {
            // logger.error("saveChangeLog stale providedVersion, auto-upgrading", {
            //   entityType: data.entityType,
            //   entityId: data.entityId,
            //   providedVersion,
            //   entityVersion,
            //   latestChangeLogVersion: latestVersion,
            //   computedVersion,
            // })
          } else {
            logger.error("saveChangeLog version mismatch", {
              entityType: resolvedData.entityType,
              entityId: resolvedData.entityId,
              providedVersion,
              entityVersion,
              latestChangeLogVersion: latestVersion,
              computedVersion,
            })
            throw new Error(
              `Provided version (${resolvedData.version}) does not match ${config.entityLabel} version (${computedVersion})`,
            )
          }
        }
      }

      const snapshotHash = resolvedData.snapshotHash || computeSnapshotHash(resolvedData.fullSnapshot)
      if (!snapshotHash) throw new Error("snapshotHash is required")

      const previousSnapshot = resolvedData.previousSnapshot ?? resolvedData.baselineSnapshot ?? {}

      const changeLogData: typeof changeLogs.$inferInsert = {
        changeLogId,
        entityId: resolvedData.entityId,
        entityType: resolvedData.entityType,
        action: resolvedData.action,
        version: computedVersion,
        dataVersion,
        changes: resolvedData.changes || [],
        fullSnapshot: resolvedData.fullSnapshot || {},
        previousSnapshot,
        snapshotHash,
        description: resolvedData.description,
        changeReason: resolvedData.changeReason,
        parentVersion:
          resolvedData.parentVersion ??
          (latestChangeLogVersion === undefined ? baselineVersionCreated : latestChangeLogVersion),
        mergedFromVersion: resolvedData.mergedFromVersion,
        isActive: resolvedData.isActive !== false,
        userId: resolvedData.userId,
        scriptId: resolvedData.scriptId,
        screenId: resolvedData.screenId,
        diagnosisId: resolvedData.diagnosisId,
        configKeyId: resolvedData.configKeyId,
        hospitalId: resolvedData.hospitalId,
        drugsLibraryItemId: resolvedData.drugsLibraryItemId,
        dataKeyId: resolvedData.dataKeyId,
        aliasId: resolvedData.aliasId,
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
  allowPartial,
}: {
  data: SaveChangeLogData[]
  broadcastAction?: boolean
  allowPartial?: boolean
}): Promise<{ success: boolean; errors?: string[]; saved: number }> {
  let saved = 0
  const errors: string[] = []

  try {
    if (allowPartial && data.some((entry) => entry.action === "rollback")) {
      throw new Error("allowPartial is not permitted for rollback changelog writes")
    }

    if (allowPartial) {
      for (const changeLogData of data) {
        const res = await _saveChangeLog({ data: changeLogData })
        if (res.errors?.length) {
          errors.push(...res.errors)
          continue
        }
        saved++
      }
    } else {
      await db.transaction(async (tx) => {
        for (const changeLogData of data) {
          const res = await _saveChangeLog({ data: changeLogData, client: tx })

          if (res.errors?.length) {
            errors.push(...res.errors)
            throw new Error(errors.join(", "))
          }

          saved++
        }
      })
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
    saved = 0
    return { success: false, errors: [e.message], saved }
  }
}
