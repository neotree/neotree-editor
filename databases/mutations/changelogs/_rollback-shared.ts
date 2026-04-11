import { eq, sql } from "drizzle-orm"

import db from "@/databases/pg/drizzle"
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
  if (storedHash !== computedHash) {
    throw new Error(`Snapshot hash mismatch for ${label} v${change.version}`)
  }
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

export async function applyRollbackSnapshot({
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
  const basePayload = coerceRollbackSnapshotValues(pickColumns(snapshot ?? {}, binding.table), {
    numericKeys: binding.numericKeys,
    timestampKeys: binding.timestampKeys,
    forceNullKeys: binding.forceNullKeys,
  })

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
