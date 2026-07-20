import { changeLogs } from "@/databases/pg/schema"
import db from "@/databases/pg/drizzle"
import { sql } from "drizzle-orm"
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

// All classification, ordering, and limiting happens in SQL so we never load every
// entity and changelog row into memory to render a bounded report.
const integrityRowsCte = sql`
  with entities as (
    select 'script'::text as entity_type, script_id as entity_id, version from nt_scripts
    union all
    select 'screen', screen_id, version from nt_screens
    union all
    select 'diagnosis', diagnosis_id, version from nt_diagnoses
    union all
    select 'problem', problem_id, version from nt_problems
    union all
    select 'config_key', config_key_id, version from nt_config_keys
    union all
    select 'drugs_library', item_id, version from nt_drugs_library
    union all
    select 'data_key', uuid, version from nt_data_keys
    union all
    select 'hospital', hospital_id, version from nt_hospitals
  ),
  latest as (
    select entity_type::text as entity_type, entity_id, max(version) as latest_version
    from nt_change_logs
    group by entity_type, entity_id
  ),
  joined as (
    select
      e.entity_type,
      e.entity_id,
      e.version as entity_version,
      l.latest_version,
      case when l.latest_version is null then e.version else e.version - l.latest_version end as version_gap,
      case
        when l.latest_version is null then 'missing_chain'
        when e.version - l.latest_version = 0 then 'healthy'
        when e.version - l.latest_version = 1 then 'auto_healable'
        when e.version - l.latest_version > 1 then 'rebaseline_required'
        else 'changelog_ahead'
      end as status
    from entities e
    left join latest l on l.entity_type = e.entity_type and l.entity_id = e.entity_id
    where e.version is not null
  )
`

export async function _getChangeLogIntegrityReport(params?: { limit?: number }): Promise<ChangeLogIntegrityReport> {
  try {
    const limit = Math.max(1, Math.min(Number(params?.limit) || 500, 5000))

    const [rows, summaryRows] = await Promise.all([
      db.execute<{
        entityType: EntityType
        entityId: string
        entityVersion: number
        latestChangeLogVersion: number | null
        versionGap: number
        status: DriftStatus
      }>(sql`
        ${integrityRowsCte}
        select
          entity_type as "entityType",
          entity_id as "entityId",
          entity_version::int as "entityVersion",
          latest_version::int as "latestChangeLogVersion",
          version_gap::int as "versionGap",
          status
        from joined
        order by
          case status
            when 'rebaseline_required' then 0
            when 'missing_chain' then 1
            when 'changelog_ahead' then 2
            when 'auto_healable' then 3
            else 4
          end,
          version_gap desc,
          entity_type asc
        limit ${limit}
      `),
      db.execute<{ status: DriftStatus; total: number }>(sql`
        ${integrityRowsCte}
        select status, count(*)::int as total
        from joined
        group by status
      `),
    ])

    const summary = { healthy: 0, autoHealable: 0, rebaselineRequired: 0, missingChain: 0, changeLogAhead: 0, total: 0 }
    for (const row of summaryRows) {
      const total = Number(row.total) || 0
      summary.total += total
      if (row.status === "healthy") summary.healthy = total
      if (row.status === "auto_healable") summary.autoHealable = total
      if (row.status === "rebaseline_required") summary.rebaselineRequired = total
      if (row.status === "missing_chain") summary.missingChain = total
      if (row.status === "changelog_ahead") summary.changeLogAhead = total
    }

    return {
      data: rows.map((row) => ({
        entityType: row.entityType,
        entityId: row.entityId,
        entityVersion: Number(row.entityVersion),
        latestChangeLogVersion: row.latestChangeLogVersion === null ? null : Number(row.latestChangeLogVersion),
        versionGap: Number(row.versionGap),
        status: row.status,
      })),
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
