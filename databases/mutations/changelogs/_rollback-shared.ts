import { eq, getTableColumns, sql } from "drizzle-orm"

import db from "@/databases/pg/drizzle"
import logger from "@/lib/logger"
import {
  aliases,
  changeLogs,
  configKeys,
  dataKeys,
  diagnoses,
  drugsLibrary,
  hospitals,
  problems,
  screens,
  scripts,
} from "@/databases/pg/schema"
import {
  coerceRollbackSnapshotValues,
  computeRollbackSnapshotHash,
  shouldAutoRepairLegacySnapshotHash,
} from "@/lib/changelog-rollback"

export type VersionedEntityBinding = {
  table: any
  pk: any
  pkKey: string
  versionKey?: string
  publishDateKey?: string
  numericKeys?: string[]
  timestampKeys?: string[]
  forceNullKeys?: string[]
}

export const CHANGELOG_ENTITY_BINDINGS: Partial<
  Record<(typeof changeLogs.$inferSelect)["entityType"], VersionedEntityBinding>
> = {
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
  problem: {
    table: problems,
    pk: problems.problemId,
    pkKey: "problemId",
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
  hospital: {
    table: hospitals,
    pk: hospitals.hospitalId,
    pkKey: "hospitalId",
    versionKey: "version",
    publishDateKey: "publishDate",
    timestampKeys: ["publishDate", "createdAt", "updatedAt", "deletedAt"],
  },
}

export function normalizeSnapshot(snapshot: any) {
  if (snapshot && typeof snapshot === "string") {
    try {
      return JSON.parse(snapshot)
    } catch {
      return {}
    }
  }
  return snapshot ?? {}
}

function hashToInt32(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return hash
}

export async function lockChangeLogChain(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  entityType: string,
  entityId: string,
) {
  await tx.execute(sql`select pg_advisory_xact_lock(${hashToInt32(entityType)}, ${hashToInt32(entityId)})`)
}

export async function ensureSnapshotHash(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  change: typeof changeLogs.$inferSelect,
) {
  if (change.snapshotHash) return change.snapshotHash
  const computed = computeRollbackSnapshotHash(change.fullSnapshot)
  if ((change as any).id) {
    await tx.update(changeLogs).set({ snapshotHash: computed }).where(eq(changeLogs.id, (change as any).id))
  }
  return computed
}

export async function assertSnapshotIntegrity(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  change: typeof changeLogs.$inferSelect,
  label: string,
) {
  const storedHash = await ensureSnapshotHash(tx, change)
  const computedHash = computeRollbackSnapshotHash(change.fullSnapshot)
  if (storedHash === computedHash) return

  if (shouldAutoRepairLegacySnapshotHash(change) && (change as any).id) {
    await tx.update(changeLogs).set({ snapshotHash: computedHash }).where(eq(changeLogs.id, (change as any).id))
    logger.log("rollback auto-repaired legacy snapshot hash", {
      changeLogId: (change as any).id,
      entityType: change.entityType,
      entityId: change.entityId,
      version: change.version,
      dataVersion: change.dataVersion,
      label,
      storedHash,
      computedHash,
    })
    return
  }

  throw new Error(`Snapshot hash mismatch for ${label} v${change.version}`)
}

export async function lockEntityRow({
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

function getWritableRollbackColumns(binding: VersionedEntityBinding) {
  const columns = getTableColumns(binding.table) as Record<string, any>
  const managedKeys = new Set(
    [binding.pkKey, binding.versionKey, binding.publishDateKey, "id", "updatedAt"].filter(Boolean) as string[],
  )

  return Object.entries(columns)
    .filter(([, column]) => column && typeof column === "object" && "name" in column)
    .filter(([key]) => !managedKeys.has(key))
}

function cloneRollbackDefaultValue(value: any) {
  if (value === null || value === undefined) return value
  if (value instanceof Date) return new Date(value)
  if (typeof value !== "object") return value
  return structuredClone(value)
}

function isRollbackLiteralDefaultValue(value: any) {
  if (value === null || value === undefined) return value !== undefined
  if (value instanceof Date) return true
  if (Array.isArray(value)) return true

  switch (typeof value) {
    case "string":
    case "number":
    case "boolean":
    case "bigint":
      return true
    case "object": {
      const prototype = Object.getPrototypeOf(value)
      return prototype === Object.prototype || prototype === null
    }
    default:
      return false
  }
}

function getRollbackColumnDefaultValue(column: any) {
  const rawDefault =
    typeof column.defaultFn === "function" ? column.defaultFn() : column.hasDefault ? column.default : undefined

  if (!isRollbackLiteralDefaultValue(rawDefault)) return undefined

  const defaultValue = cloneRollbackDefaultValue(rawDefault)
  if (column.dataType === "json" && typeof defaultValue === "string") {
    try {
      return JSON.parse(defaultValue)
    } catch {
      return defaultValue
    }
  }

  return defaultValue
}

function getRollbackManagedFieldFallback(params: {
  binding: VersionedEntityBinding
  key: string
  now: Date
}) {
  if (params.key === "createdAt") return params.now
  if (params.key === "updatedAt") return params.now
  if (params.binding.publishDateKey && params.key === params.binding.publishDateKey) return params.now
  return undefined
}

export function buildRollbackSnapshotPayload({
  binding,
  entityId,
  snapshot,
  newVersion,
  now = new Date(),
}: {
  binding: VersionedEntityBinding
  entityId: string
  snapshot: any
  newVersion: number
  now?: Date
}) {
  const normalizedSnapshot = snapshot ?? {}
  const basePayload = pickColumns(normalizedSnapshot, binding.table)
  const missingRequiredKeys: string[] = []

  for (const [key, column] of getWritableRollbackColumns(binding)) {
    if (Object.prototype.hasOwnProperty.call(basePayload, key)) continue

    const managedFallback = getRollbackManagedFieldFallback({ binding, key, now })
    if (managedFallback !== undefined) {
      basePayload[key] = managedFallback
      continue
    }

    const defaultValue = getRollbackColumnDefaultValue(column)
    if (defaultValue !== undefined) {
      basePayload[key] = defaultValue
      continue
    }

    if ((column as any).notNull) {
      missingRequiredKeys.push(key)
      continue
    }

    basePayload[key] = null
  }

  if (missingRequiredKeys.length) {
    throw new Error(`Rollback snapshot is missing required fields: ${missingRequiredKeys.join(", ")}`)
  }

  const coercedPayload = coerceRollbackSnapshotValues(basePayload, {
    numericKeys: binding.numericKeys,
    timestampKeys: binding.timestampKeys,
    forceNullKeys: binding.forceNullKeys,
  })

  coercedPayload[binding.pkKey] = entityId
  if (binding.versionKey) coercedPayload[binding.versionKey] = newVersion
  if (binding.publishDateKey) coercedPayload[binding.publishDateKey] = now
  if ("updatedAt" in binding.table) coercedPayload.updatedAt = now
  if ("createdAt" in binding.table && (coercedPayload.createdAt === null || coercedPayload.createdAt === undefined)) {
    coercedPayload.createdAt = now
  }

  return coercedPayload
}

export async function applyRollbackSnapshot({
  tx,
  binding,
  entityId,
  snapshot,
  newVersion,
  now = new Date(),
}: {
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
  binding: VersionedEntityBinding
  entityId: string
  snapshot: any
  newVersion: number
  now?: Date
}) {
  const basePayload = buildRollbackSnapshotPayload({
    binding,
    entityId,
    snapshot,
    newVersion,
    now,
  })

  const [updated] = await tx.update(binding.table).set(basePayload).where(eq(binding.pk, entityId)).returning()
  if (updated) return updated

  const insertPayload = { ...basePayload }
  delete insertPayload.id

  const [inserted] = await tx.insert(binding.table).values(insertPayload).returning()
  return inserted
}

function snapshotDate(value: any) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.valueOf()) ? null : date
}

export async function ensureActiveChangeApplied({
  tx,
  binding,
  activeChange,
}: {
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
  binding: VersionedEntityBinding
  activeChange: typeof changeLogs.$inferSelect
}) {
  if (!binding.versionKey) return null

  const columns = getTableColumns(binding.table) as Record<string, any>
  const versionColumn = columns[binding.versionKey]
  if (!versionColumn) return null

  const [row] = await tx
    .select({ version: versionColumn })
    .from(binding.table)
    .where(eq(binding.pk, activeChange.entityId))
    .limit(1)

  if (Number(row?.version) === Number(activeChange.version)) return null

  await assertSnapshotIntegrity(tx, activeChange, activeChange.entityId)

  return await applyRollbackSnapshot({
    tx,
    binding,
    entityId: activeChange.entityId,
    snapshot: normalizeSnapshot(activeChange.fullSnapshot),
    newVersion: activeChange.version,
    now:
      snapshotDate((activeChange.fullSnapshot as any)?.publishDate) ??
      snapshotDate((activeChange.fullSnapshot as any)?.updatedAt) ??
      new Date(),
  })
}
