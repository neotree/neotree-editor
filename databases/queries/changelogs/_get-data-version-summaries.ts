import { and, desc, eq, sql, inArray, or, ilike, asc } from "drizzle-orm"
import * as uuid from "uuid"
import db from "@/databases/pg/drizzle"
import { changeLogs, users, scripts } from "@/databases/pg/schema"
import logger from "@/lib/logger"

export type DataVersionSummaryParams = {
  searchTerm?: string
  entityTypes?: (typeof changeLogs.$inferSelect)["entityType"][]
  actions?: (typeof changeLogs.$inferSelect)["action"][]
  limit?: number
  offset?: number
  applyFiltersToCounts?: boolean
  dataVersions?: number[]
  sortBy?: "publishedAt" | "dataVersion" | "changeCount"
  sortOrder?: "asc" | "desc"
  latestOnly?: boolean
}

export type DataVersionSummary = {
  dataVersion: number
  publishedAt: string | null
  publishedByName: string
  publishedByEmail?: string
  totalChanges: number
  hasActiveChanges: boolean
  isLatestVersion: boolean
  entityCounts: Record<string, number>
  actionCounts: Record<string, number>
  descriptions: string[]
  rollbackSourceVersion?: number | null
}

export type DataVersionSummaryResults = {
  data: DataVersionSummary[]
  total: number
  latestDataVersion?: number | null
  errors?: string[]
}

export async function _getDataVersionSummaries(params?: DataVersionSummaryParams): Promise<DataVersionSummaryResults> {
  try {
    const {
      searchTerm,
      entityTypes = [],
      actions = [],
      limit = 25,
      offset = 0,
      applyFiltersToCounts = false,
      dataVersions = [],
      sortBy = "publishedAt",
      sortOrder = "desc",
      latestOnly = false,
    } = {
      ...params,
    }

    const numericDataVersions = dataVersions.filter((value) => Number.isFinite(value)).map((value) => Number(value))

    const latestDataVersionRes = await db
      .select({ latestDataVersion: sql<number>`max(${changeLogs.dataVersion})` })
      .from(changeLogs)
      .where(sql`${changeLogs.dataVersion} IS NOT NULL`)
    const latestDataVersion = Number.isFinite(latestDataVersionRes?.[0]?.latestDataVersion)
      ? Number(latestDataVersionRes?.[0]?.latestDataVersion)
      : null

    if (latestOnly && !latestDataVersion) {
      return { data: [], total: 0, latestDataVersion: null }
    }

    const versionFilter =
      latestOnly && latestDataVersion
        ? [latestDataVersion]
        : numericDataVersions.length
          ? numericDataVersions
          : []

    // First, let's find the data versions that match our filters
    const normalizedSearch = typeof searchTerm === "string" ? searchTerm.trim() : ""
    const normalizedSearchLower = normalizedSearch.toLowerCase()
    const isUuidSearch = normalizedSearch ? uuid.validate(normalizedSearch) : false

    const entityTypeAliases: Record<string, string[]> = {
      script: ["script", "scripts"],
      screen: ["screen", "screens"],
      diagnosis: ["diagnosis", "diagnoses"],
      config_key: ["config key", "config keys", "config-key", "configkey", "configkeys"],
      drugs_library: ["drugs library", "drug library", "drugs-library", "drug-library", "drugs library item"],
      data_key: ["data key", "data keys", "data-key", "datakey", "datakeys"],
      alias: ["alias", "aliases"],
      hospital: ["hospital", "hospitals"],
      release: ["release", "releases"],
    }

    const matchedEntityTypes = Object.entries(entityTypeAliases)
      .filter(([, aliases]) => aliases.some((alias) => alias === normalizedSearchLower))
      .map(([key]) => key) as (typeof changeLogs.$inferSelect)["entityType"][]

    const searchConditions = normalizedSearch
      ? or(
          ilike(changeLogs.description, `%${normalizedSearch}%`),
          ilike(changeLogs.changeReason, `%${normalizedSearch}%`),
          sql`${changeLogs.changes}::text ILIKE ${"%" + normalizedSearch + "%"}`,
          sql`${changeLogs.entityId}::text ILIKE ${"%" + normalizedSearch + "%"}`,
          isUuidSearch ? eq(changeLogs.entityId, normalizedSearch) : undefined,
          sql`${changeLogs.entityType}::text ILIKE ${"%" + normalizedSearch + "%"}`,
          matchedEntityTypes.length ? inArray(changeLogs.entityType, matchedEntityTypes) : undefined,
          ilike(scripts.title, `%${normalizedSearch}%`),
          ilike(users.displayName, `%${normalizedSearch}%`),
          ilike(users.email, `%${normalizedSearch}%`),
        )
      : undefined

    const publishDateExpr = sql<Date>`max(case when ${changeLogs.action} = 'publish' then ${changeLogs.dateOfChange} end)`
    const latestChangeExpr = sql<Date>`max(${changeLogs.dateOfChange})`
    const effectivePublishDateExpr = sql<Date>`coalesce(${publishDateExpr}, ${latestChangeExpr})`
    const changeCountExpr = sql<number>`count(*)::int`

    const orderByClause = (() => {
      if (sortBy === "dataVersion") {
        return sortOrder === "asc" ? asc(changeLogs.dataVersion) : desc(changeLogs.dataVersion)
      }
      if (sortBy === "changeCount") {
        return sortOrder === "asc" ? asc(changeCountExpr) : desc(changeCountExpr)
      }
      return sortOrder === "asc" ? asc(effectivePublishDateExpr) : desc(effectivePublishDateExpr)
    })()

    const matchingVersionsQuery = db
      .select({
        dataVersion: changeLogs.dataVersion,
        latestPublishedAt: publishDateExpr,
        latestChangeAt: latestChangeExpr,
        changeCount: changeCountExpr,
      })
      .from(changeLogs)
      .leftJoin(scripts, eq(scripts.scriptId, changeLogs.scriptId))
      .leftJoin(users, eq(users.userId, changeLogs.userId))
      .where(
        and(
          searchConditions,
          entityTypes.length ? inArray(changeLogs.entityType, entityTypes) : undefined,
          actions.length ? inArray(changeLogs.action, actions) : undefined,
          versionFilter.length ? inArray(changeLogs.dataVersion, versionFilter) : undefined,
          sql`${changeLogs.dataVersion} IS NOT NULL`,
        ),
      )
      .groupBy(changeLogs.dataVersion)
      .orderBy(orderByClause)

    const totalQuery = db
      .select({
        total: sql<number>`count(distinct ${changeLogs.dataVersion})`,
      })
      .from(changeLogs)
      .leftJoin(scripts, eq(scripts.scriptId, changeLogs.scriptId))
      .leftJoin(users, eq(users.userId, changeLogs.userId))
      .where(
        and(
          searchConditions,
          entityTypes.length ? inArray(changeLogs.entityType, entityTypes) : undefined,
          actions.length ? inArray(changeLogs.action, actions) : undefined,
          versionFilter.length ? inArray(changeLogs.dataVersion, versionFilter) : undefined,
          sql`${changeLogs.dataVersion} IS NOT NULL`,
        ),
      )

    const [matchingVersions, totalRes] = await Promise.all([matchingVersionsQuery.limit(limit).offset(offset), totalQuery])
    const total = Number(totalRes?.[0]?.total ?? 0)
    const paginatedVersions = matchingVersions.map((v) => v.dataVersion as number)

    if (paginatedVersions.length === 0) {
      return { data: [], total, latestDataVersion }
    }

    // Now fetch all changelogs for these specific data versions to build summaries
    const logs = await db
      .select({
        changeLog: changeLogs,
        user: {
          name: users.displayName,
          email: users.email,
        },
      })
      .from(changeLogs)
      .leftJoin(scripts, eq(scripts.scriptId, changeLogs.scriptId))
      .leftJoin(users, eq(users.userId, changeLogs.userId))
      .where(
        and(
          inArray(changeLogs.dataVersion, paginatedVersions),
          applyFiltersToCounts ? searchConditions : undefined,
          applyFiltersToCounts && entityTypes.length ? inArray(changeLogs.entityType, entityTypes) : undefined,
          applyFiltersToCounts && actions.length ? inArray(changeLogs.action, actions) : undefined,
          applyFiltersToCounts && versionFilter.length ? inArray(changeLogs.dataVersion, versionFilter) : undefined,
        ),
      )
      .orderBy(desc(changeLogs.dateOfChange))

    const grouped = new Map<number, any[]>()
    for (const log of logs) {
      const dv = log.changeLog.dataVersion as number
      if (!grouped.has(dv)) grouped.set(dv, [])
      grouped.get(dv)!.push(log)
    }

    const entitiesForActiveCheck = new Map<string, { entityType: string; entityId: string }>()
    for (const log of logs) {
      const entityType = log.changeLog.entityType
      const entityId = log.changeLog.entityId
      if (!entityType || !entityId) continue
      const key = `${entityType}:${entityId}`
      if (!entitiesForActiveCheck.has(key)) {
        entitiesForActiveCheck.set(key, { entityType, entityId })
      }
    }

    const entityPairs = Array.from(entitiesForActiveCheck.values())
    const latestVersions = entityPairs.length
      ? await db
          .select({
            entityType: changeLogs.entityType,
            entityId: changeLogs.entityId,
            latestVersion: sql<number>`max(${changeLogs.version})`,
          })
          .from(changeLogs)
          .where(
            or(
              ...entityPairs.map((e) =>
                and(
                  eq(changeLogs.entityType, e.entityType as typeof changeLogs.$inferSelect.entityType),
                  eq(changeLogs.entityId, e.entityId)
                )
              )
            )
          )
          .groupBy(changeLogs.entityType, changeLogs.entityId)
      : []

    const latestVersionMap = new Map<string, number>()
    for (const row of latestVersions) {
      if (row.latestVersion === null || row.latestVersion === undefined) continue
      latestVersionMap.set(`${row.entityType}:${row.entityId}`, Number(row.latestVersion))
    }

    const summaries: DataVersionSummary[] = paginatedVersions.map((dv) => {
      const versionLogs = grouped.get(dv) || []
      const latestChange = versionLogs[0]
      
      const publishEntry =
        versionLogs.find((l) => l.changeLog.action === "publish" && l.changeLog.entityType === "release") ||
        versionLogs.find((l) => l.changeLog.action === "publish") ||
        latestChange

      const rollbackEntry = versionLogs.find((l) => l.changeLog.action === "rollback")
      
      const entityCounts: Record<string, number> = {}
      const actionCounts: Record<string, number> = {}
      const descriptionsSet = new Set<string>()

      versionLogs.forEach((l) => {
        const type = l.changeLog.entityType
        const act = l.changeLog.action
        entityCounts[type] = (entityCounts[type] || 0) + 1
        actionCounts[act] = (actionCounts[act] || 0) + 1
        if (l.changeLog.description) descriptionsSet.add(l.changeLog.description)
      })

      const hasActiveChanges = versionLogs.some((l) => {
        const key = `${l.changeLog.entityType}:${l.changeLog.entityId}`
        const latest = latestVersionMap.get(key)
        return latest !== undefined ? l.changeLog.version === latest : l.changeLog.isActive
      })

      const rollbackChanges = Array.isArray(rollbackEntry?.changeLog?.changes) ? rollbackEntry?.changeLog?.changes : []
      const rollbackToVersion =
        rollbackChanges.find((c: any) => Number.isFinite(c?.toVersion))?.toVersion ??
        rollbackChanges.find((c: any) => Number.isFinite(c?.to_version))?.to_version ??
        rollbackEntry?.changeLog?.changes?.[0]?.toVersion ??
        null

      return {
        dataVersion: dv,
        publishedAt:
          publishEntry?.changeLog?.dateOfChange?.toISOString() ||
          latestChange?.changeLog?.dateOfChange?.toISOString() ||
          null,
        publishedByName: publishEntry?.user?.name || "Unknown user",
        publishedByEmail: publishEntry?.user?.email || undefined,
        totalChanges: versionLogs.length,
        hasActiveChanges,
        isLatestVersion: latestDataVersion ? dv === latestDataVersion : false,
        entityCounts,
        actionCounts,
        descriptions: Array.from(descriptionsSet).slice(0, 5),
        rollbackSourceVersion: rollbackEntry ? rollbackToVersion : null,
      }
    })

    return {
      data: summaries,
      total,
      latestDataVersion,
    }
  } catch (e: any) {
    logger.error("_getDataVersionSummaries ERROR", e.message)
    return { data: [], total: 0, latestDataVersion: null, errors: [e.message] }
  }
}
