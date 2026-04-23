import { changeLogs, configKeys, dataKeys, diagnoses, drugsLibrary, hospitals, problems, screens, scripts } from "@/databases/pg/schema"
import db from "@/databases/pg/drizzle"
import { desc, sql } from "drizzle-orm"
import logger from "@/lib/logger"

type EntityType = (typeof changeLogs.$inferSelect)["entityType"]

type DriftStatus = "healthy" | "auto_healable" | "rebaseline_required" | "missing_chain" | "changelog_ahead"

export type ChangeLogIntegrityRow = {
  entityType: EntityType
  entityId: string
  entityVersion: number
  latestChangeLogVersion: number | null
  versionGap: number
  status: DriftStatus
}

export type ChangeLogIntegrityReport = {
  data: ChangeLogIntegrityRow[]
  summary: {
    healthy: number
    autoHealable: number
    rebaselineRequired: number
    missingChain: number
    changeLogAhead: number
    total: number
  }
  errors?: string[]
}

const VERSIONED_ENTITY_SOURCES = [
  { entityType: "script", table: scripts, idColumn: scripts.scriptId, versionColumn: scripts.version },
  { entityType: "screen", table: screens, idColumn: screens.screenId, versionColumn: screens.version },
  { entityType: "diagnosis", table: diagnoses, idColumn: diagnoses.diagnosisId, versionColumn: diagnoses.version },
  { entityType: "problem", table: problems, idColumn: problems.problemId, versionColumn: problems.version },
  { entityType: "config_key", table: configKeys, idColumn: configKeys.configKeyId, versionColumn: configKeys.version },
  { entityType: "drugs_library", table: drugsLibrary, idColumn: drugsLibrary.itemId, versionColumn: drugsLibrary.version },
  { entityType: "data_key", table: dataKeys, idColumn: dataKeys.uuid, versionColumn: dataKeys.version },
  { entityType: "hospital", table: hospitals, idColumn: hospitals.hospitalId, versionColumn: hospitals.version },
] as const

function toFiniteNumber(value: unknown): number | null {
  const numericValue = typeof value === "number" ? value : Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

function classifyStatus(entityVersion: number, latestChangeLogVersion: number | null): DriftStatus {
  if (latestChangeLogVersion === null) return "missing_chain"

  const versionGap = entityVersion - latestChangeLogVersion
  if (versionGap === 0) return "healthy"
  if (versionGap === 1) return "auto_healable"
  if (versionGap > 1) return "rebaseline_required"
  return "changelog_ahead"
}

export async function _getChangeLogIntegrityReport(params?: { limit?: number }): Promise<ChangeLogIntegrityReport> {
  try {
    const limit = Math.max(1, Math.min(Number(params?.limit) || 500, 5000))
    const latestChangeLogRows = await db
      .select({
        entityType: changeLogs.entityType,
        entityId: changeLogs.entityId,
        latestChangeLogVersion: sql<number>`max(${changeLogs.version})`.as("latestChangeLogVersion"),
      })
      .from(changeLogs)
      .groupBy(changeLogs.entityType, changeLogs.entityId)

    const latestChangeLogMap = new Map<string, number>()
    for (const row of latestChangeLogRows) {
      const version = toFiniteNumber(row.latestChangeLogVersion)
      if (version === null) continue
      latestChangeLogMap.set(`${row.entityType}:${row.entityId}`, version)
    }

    const rows: ChangeLogIntegrityRow[] = []

    for (const source of VERSIONED_ENTITY_SOURCES) {
      const entities = await db
        .select({
          entityId: source.idColumn,
          entityVersion: source.versionColumn,
        })
        .from(source.table)

      for (const entity of entities) {
        const entityVersion = toFiniteNumber(entity.entityVersion)
        if (entityVersion === null) continue

        const latestChangeLogVersion = latestChangeLogMap.get(`${source.entityType}:${entity.entityId}`) ?? null
        const versionGap = latestChangeLogVersion === null ? entityVersion : entityVersion - latestChangeLogVersion
        rows.push({
          entityType: source.entityType,
          entityId: entity.entityId,
          entityVersion,
          latestChangeLogVersion,
          versionGap,
          status: classifyStatus(entityVersion, latestChangeLogVersion),
        })
      }
    }

    const sortedRows = [...rows].sort((a, b) => {
      const severityOrder: Record<DriftStatus, number> = {
        rebaseline_required: 0,
        missing_chain: 1,
        changelog_ahead: 2,
        auto_healable: 3,
        healthy: 4,
      }

      if (severityOrder[a.status] !== severityOrder[b.status]) {
        return severityOrder[a.status] - severityOrder[b.status]
      }

      if (b.versionGap !== a.versionGap) return b.versionGap - a.versionGap
      return a.entityType.localeCompare(b.entityType)
    })

    const summary = sortedRows.reduce(
      (acc, row) => {
        acc.total += 1
        if (row.status === "healthy") acc.healthy += 1
        if (row.status === "auto_healable") acc.autoHealable += 1
        if (row.status === "rebaseline_required") acc.rebaselineRequired += 1
        if (row.status === "missing_chain") acc.missingChain += 1
        if (row.status === "changelog_ahead") acc.changeLogAhead += 1
        return acc
      },
      { healthy: 0, autoHealable: 0, rebaselineRequired: 0, missingChain: 0, changeLogAhead: 0, total: 0 },
    )

    return {
      data: sortedRows.slice(0, limit),
      summary,
    }
  } catch (e: any) {
    logger.error("_getChangeLogIntegrityReport ERROR", e.message)
    return {
      data: [],
      summary: { healthy: 0, autoHealable: 0, rebaselineRequired: 0, missingChain: 0, changeLogAhead: 0, total: 0 },
      errors: [e.message],
    }
  }
}
