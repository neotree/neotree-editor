"use server"

import * as mutations from "@/databases/mutations/changelogs"
import * as queries from "@/databases/queries/changelogs"
import { type ChangeLogType } from "@/databases/queries/changelogs/_get-change-logs"
import db from "@/databases/pg/drizzle"
import {
  changeLogs,
  users,
  scripts,
  screens,
  diagnoses,
  configKeys,
  drugsLibrary,
  dataKeys,
  aliases,
} from "@/databases/pg/schema"
import { and, eq, lt, desc, inArray, asc, sql } from "drizzle-orm"
import * as uuid from "uuid"
import logger from "@/lib/logger"
import crypto from "crypto"
import { isAllowed } from "./is-allowed"
import { _getEditorInfo } from "@/databases/queries/editor-info"
import socket from "@/lib/socket"

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
  changeLogIds: string[]
  changes: ChangeLogType[]
}

type PaginationResult = {
  page: number
  limit: number
  total: number
  totalPages: number
}

function toNumericVersion(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function getDataVersionFromChangeLog(changelog: ChangeLogType): number | null {
  const fromRoot = toNumericVersion((changelog as any)?.dataVersion)
  const fromSnapshot = toNumericVersion((changelog?.fullSnapshot as any)?.dataVersion)
  return fromRoot ?? fromSnapshot ?? null
}

function buildDataVersionSummaries(allChangelogs: ChangeLogType[], activeDataVersion: number | null): DataVersionSummary[] {
  const grouped = new Map<number, ChangeLogType[]>()

  for (const changeLog of allChangelogs) {
    const dataVersion = getDataVersionFromChangeLog(changeLog)
    if (dataVersion === null) continue

    if (!grouped.has(dataVersion)) {
      grouped.set(dataVersion, [])
    }
    grouped.get(dataVersion)!.push(changeLog)
  }

  const summaries: DataVersionSummary[] = []
  const versionNumbers = Array.from(grouped.keys())
  const latestVersion = activeDataVersion ?? (versionNumbers.length ? Math.max(...versionNumbers) : null)

  for (const [dataVersion, changeLogs] of Array.from(grouped.entries())) {
    if (!changeLogs.length) continue

    const sortedByDate = [...changeLogs].sort(
      (a, b) => new Date(b.dateOfChange).getTime() - new Date(a.dateOfChange).getTime()
    )

    const latestChange = sortedByDate[0]
    const publishEntry = changeLogs.find((entry) => entry.action === "publish") ?? latestChange

    const entityCounts = changeLogs.reduce<Record<string, number>>((result, entry) => {
      result[entry.entityType] = (result[entry.entityType] || 0) + 1
      return result
    }, {})

    const actionCounts = changeLogs.reduce<Record<string, number>>((result, entry) => {
      result[entry.action] = (result[entry.action] || 0) + 1
      return result
    }, {})

    const descriptions = Array.from(
      new Set<string>(
        changeLogs
          .map((entry) => entry.description?.trim() || "")
          .filter((description) => description.length > 0)
      )
    ).slice(0, 5)

    summaries.push({
      dataVersion,
      publishedAt: latestChange?.dateOfChange ? new Date(latestChange.dateOfChange).toISOString() : null,
      publishedByName: publishEntry?.userName || latestChange?.userName || "Unknown user",
      publishedByEmail: publishEntry?.userEmail || latestChange?.userEmail || undefined,
      totalChanges: changeLogs.length,
      hasActiveChanges: changeLogs.some((entry) => entry.isActive),
      isLatestVersion: latestVersion !== null ? dataVersion === latestVersion : false,
      entityCounts,
      actionCounts,
      descriptions,
      changeLogIds: changeLogs.map((entry) => entry.changeLogId),
      changes: changeLogs,
    })
  }

  return summaries.sort((a, b) => b.dataVersion - a.dataVersion)
}

function hashSnapshot(snapshot: unknown) {
  try {
    return crypto.createHash("sha256").update(JSON.stringify(snapshot ?? {})).digest("hex")
  } catch {
    return ""
  }
}

// QUERIES
export const getChangeLogs: typeof queries._getChangeLogs = async (...args) => {
  try {
    await isAllowed()
    return await queries._getChangeLogs(...args)
  } catch (e: any) {
    logger.error("getChangeLogs ERROR", e.message)
    return { errors: [e.message], data: [] }
  }
}

export type GetChangeLogSummariesParams = {
  searchValue?: string
  entityType?: string
  action?: string
  isActiveOnly?: boolean
  sort?: string
  page?: number
  limit?: number
}

export const getChangeLogSummaries = async (params?: GetChangeLogSummariesParams) => {
  try {
    await isAllowed()
    const {
      searchValue = "",
      entityType = "all",
      action = "all",
      isActiveOnly = false,
      sort = "publishedAt.desc",
      page = 1,
      limit = 25,
    } = { ...params }

    const normalizedPage = Math.max(1, Number(page) || 1)
    const normalizedLimit = Math.min(500, Math.max(5, Number(limit) || 25))
    const offset = (normalizedPage - 1) * normalizedLimit
    const search = searchValue?.trim().toLowerCase()
    const pattern = search ? `%${search}%` : null

    const filters = [
      sql`${changeLogs.dataVersion} is not null`,
      entityType !== "all" ? eq(changeLogs.entityType, entityType as ChangeLogType["entityType"]) : undefined,
      action !== "all" ? eq(changeLogs.action, action as ChangeLogType["action"]) : undefined,
      isActiveOnly ? eq(changeLogs.isActive, true) : undefined,
      pattern
        ? sql`(
            lower(${changeLogs.description}) like ${pattern}
            or lower(${changeLogs.changeReason}) like ${pattern}
            or lower(${changeLogs.entityId}::text) like ${pattern}
            or lower(${users.displayName}) like ${pattern}
            or lower(${users.email}) like ${pattern}
          )`
        : undefined,
    ].filter(Boolean)

    const totalRes = await db
      .select({
        count: sql<number>`count(distinct ${changeLogs.dataVersion})::int`,
      })
      .from(changeLogs)
      .leftJoin(users, eq(users.userId, changeLogs.userId))
      .where(filters.length ? and(...filters) : undefined)

    const totalDataVersions = totalRes[0]?.count ?? 0

    const orderByClause =
      sort === "publishedAt.asc"
        ? asc(sql`max(${changeLogs.dateOfChange})`)
        : sort === "publishedAt.desc"
          ? desc(sql`max(${changeLogs.dateOfChange})`)
          : sort === "dataVersion.asc"
            ? asc(changeLogs.dataVersion)
            : sort === "dataVersion.desc"
              ? desc(changeLogs.dataVersion)
              : sort === "changeCount.asc"
                ? asc(sql`count(*)`)
                : desc(sql`count(*)`)

    const versionRows = await db
      .select({
        dataVersion: changeLogs.dataVersion,
      })
      .from(changeLogs)
      .leftJoin(users, eq(users.userId, changeLogs.userId))
      .where(filters.length ? and(...filters) : undefined)
      .groupBy(changeLogs.dataVersion)
      .orderBy(orderByClause)
      .limit(normalizedLimit)
      .offset(offset)

    const versionIds = versionRows
      .map((row) => (row.dataVersion === null || row.dataVersion === undefined ? null : Number(row.dataVersion)))
      .filter((value) => Number.isFinite(value)) as number[]

    if (!versionIds.length) {
      return {
        data: [] as DataVersionSummary[],
        pagination: {
          page: normalizedPage,
          limit: normalizedLimit,
          total: totalDataVersions,
          totalPages: Math.ceil(totalDataVersions / normalizedLimit),
        } as PaginationResult,
        activeDataVersion: null,
      }
    }

    const [changeLogsRes, editorInfo] = await Promise.all([
      queries._getChangeLogs({
        dataVersions: versionIds,
        limit: 20000,
        sortBy: "dateOfChange",
        sortOrder: "desc",
      }),
      _getEditorInfo(),
    ])

    if (changeLogsRes.errors?.length) {
      throw new Error(changeLogsRes.errors.join(", "))
    }

    const activeDataVersion = editorInfo.data?.dataVersion ?? null
    const summaries = buildDataVersionSummaries(changeLogsRes.data, activeDataVersion)

    // preserve requested order from versionIds
    const summaryMap = new Map(summaries.map((s) => [s.dataVersion, s]))
    const orderedSummaries = versionIds
      .map((id) => summaryMap.get(id))
      .filter(Boolean) as DataVersionSummary[]

    return {
      data: orderedSummaries,
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        total: totalDataVersions,
        totalPages: Math.ceil(totalDataVersions / normalizedLimit),
      } as PaginationResult,
      activeDataVersion,
    }
  } catch (e: any) {
    logger.error("getChangeLogSummaries ERROR", e.message)
    return {
      data: [] as DataVersionSummary[],
      pagination: { page: 1, limit: 0, total: 0, totalPages: 0 } as PaginationResult,
      activeDataVersion: null,
      errors: [e.message],
    }
  }
}


export const getChangeLog: typeof queries._getChangeLog = async (...args) => {
  try {
    await isAllowed()
    return await queries._getChangeLog(...args)
  } catch (e: any) {
    logger.error("getChangeLog ERROR", e.message)
    return { errors: [e.message] }
  }
}

export const getEntityHistory: typeof queries._getEntityHistory = async (...args) => {
  try {
    await isAllowed()
    return await queries._getEntityHistory(...args)
  } catch (e: any) {
    logger.error("getEntityHistory ERROR", e.message)
    return { errors: [e.message], data: [] }
  }
}

export const getActiveVersion: typeof queries._getActiveVersion = async (...args) => {
  try {
    await isAllowed()
    return await queries._getActiveVersion(...args)
  } catch (e: any) {
    logger.error("getActiveVersion ERROR", e.message)
    return { errors: [e.message] }
  }
}

export const getVersionChain: typeof queries._getVersionChain = async (...args) => {
  try {
    await isAllowed()
    return await queries._getVersionChain(...args)
  } catch (e: any) {
    logger.error("getVersionChain ERROR", e.message)
    return { errors: [e.message], data: [] }
  }
}

export const getChangeLogStats: typeof queries._getChangeLogStats = async (...args) => {
  try {
    await isAllowed()
    return await queries._getChangeLogStats(...args)
  } catch (e: any) {
    logger.error("getChangeLogStats ERROR", e.message)
    return {
      errors: [e.message],
      data: { totalChanges: 0, byAction: {}, byUser: {}, byEntityType: {} },
    }
  }
}

export const countChangeLogs: typeof queries._countChangeLogs = async (...args) => {
  try {
    await isAllowed()
    return await queries._countChangeLogs(...args)
  } catch (e: any) {
    logger.error("countChangeLogs ERROR", e.message)
    return { errors: [e.message], count: 0 }
  }
}

export const countChangeLogsByEntity: typeof queries._countChangeLogsByEntity = async (...args) => {
  try {
    await isAllowed()
    return await queries._countChangeLogsByEntity(...args)
  } catch (e: any) {
    logger.error("countChangeLogsByEntity ERROR", e.message)
    return { errors: [e.message], data: [] }
  }
}

export const countChangeLogsByAction: typeof queries._countChangeLogsByAction = async (...args) => {
  try {
    await isAllowed()
    return await queries._countChangeLogsByAction(...args)
  } catch (e: any) {
    logger.error("countChangeLogsByAction ERROR", e.message)
    return { errors: [e.message], data: [] }
  }
}

export const countChangeLogsByUser: typeof queries._countChangeLogsByUser = async (...args) => {
  try {
    await isAllowed()
    return await queries._countChangeLogsByUser(...args)
  } catch (e: any) {
    logger.error("countChangeLogsByUser ERROR", e.message)
    return { errors: [e.message], data: [] }
  }
}

export const countEntityVersions: typeof queries._countEntityVersions = async (...args) => {
  try {
    await isAllowed()
    return await queries._countEntityVersions(...args)
  } catch (e: any) {
    logger.error("countEntityVersions ERROR", e.message)
    return { errors: [e.message], totalVersions: 0, activeVersions: 0 }
  }
}

export const searchChangeLogs: typeof queries.SearchChangeLogs._searchChangeLogs = async (...args) => {
  try {
    await isAllowed()
    return await queries.SearchChangeLogs._searchChangeLogs(...args)
  } catch (e: any) {
    logger.error("searchChangeLogs ERROR", e.message)
    return { errors: [e.message], data: [], total: 0 }
  }
}

export const searchChangesByField: typeof queries.SearchChangeLogs._searchChangesByField = async (...args) => {
  try {
    await isAllowed()
    return await queries.SearchChangeLogs._searchChangesByField(...args)
  } catch (e: any) {
    logger.error("searchChangesByField ERROR", e.message)
    return { errors: [e.message], data: [] }
  }
}

export const searchChangeLogsByUser: typeof queries.SearchChangeLogs._searchChangeLogsByUser = async (...args) => {
  try {
    await isAllowed()
    return await queries.SearchChangeLogs._searchChangeLogsByUser(...args)
  } catch (e: any) {
    logger.error("searchChangeLogsByUser ERROR", e.message)
    return { errors: [e.message], data: [] }
  }
}

export const searchChangeLogsByDateRange: typeof queries.SearchChangeLogs._searchChangeLogsByDateRange = async (
  ...args
) => {
  try {
    await isAllowed()
    return await queries.SearchChangeLogs._searchChangeLogsByDateRange(...args)
  } catch (e: any) {
    logger.error("searchChangeLogsByDateRange ERROR", e.message)
    return { errors: [e.message], data: [] }
  }
}

export const findRelatedChanges: typeof queries.SearchChangeLogs._findRelatedChanges = async (...args) => {
  try {
    await isAllowed()
    return await queries.SearchChangeLogs._findRelatedChanges(...args)
  } catch (e: any) {
    logger.error("findRelatedChanges ERROR", e.message)
    return {
      errors: [e.message],
      data: { current: {} as any, children: [], mergedVersions: [], supersededVersions: [] },
    }
  }
}

// MUTATIONS
export const saveChangeLog: typeof mutations._saveChangeLog = async (params) => {
  try {
    const session = await isAllowed()
    const resolvedDataVersion = await resolveDataVersionIfNeeded(params.data?.dataVersion)
    return await mutations._saveChangeLog({
      ...params,
      data: {
        ...params.data,
        dataVersion: resolvedDataVersion,
        userId: session.user?.userId!,
      },
      allowLegacyGaps: process.env.ALLOW_LEGACY_VERSION_GAPS === "true",
    })
  } catch (e: any) {
    logger.error("saveChangeLog ERROR", e.message)
    return { errors: [e.message], success: false }
  }
}

export const saveChangeLogs: typeof mutations._saveChangeLogs = async (params) => {
  try {
    const session = await isAllowed()
    const needsFallbackDataVersion = params.data.some(
      (entry) => entry.dataVersion === undefined || entry.dataVersion === null,
    )
    const fallbackDataVersion = needsFallbackDataVersion ? await resolveDataVersionIfNeeded() : undefined
    return await mutations._saveChangeLogs({
      ...params,
      data: params.data.map((d) => ({
        ...d,
        dataVersion: d.dataVersion ?? fallbackDataVersion,
        userId: session.user?.userId!,
      })),
      allowLegacyGaps: process.env.ALLOW_LEGACY_VERSION_GAPS === "true",
    })
  } catch (e: any) {
    logger.error("saveChangeLogs ERROR", e.message)
    return { errors: [e.message], success: false, saved: 0 }
  }
}

export const updateChangeLog: typeof mutations._updateChangeLog = async (params) => {
  try {
    await isAllowed()
    return await mutations._updateChangeLog(params)
  } catch (e: any) {
    logger.error("updateChangeLog ERROR", e.message)
    return { errors: [e.message], success: false }
  }
}

export const markVersionAsSuperseded: typeof mutations._markVersionAsSuperseded = async (params) => {
  try {
    await isAllowed()
    return await mutations._markVersionAsSuperseded(params)
  } catch (e: any) {
    logger.error("markVersionAsSuperseded ERROR", e.message)
    return { errors: [e.message], success: false }
  }
}

export const rollbackChangeLog: typeof mutations._rollbackChangeLog = async (params) => {
  try {
    const session = await isAllowed()
    return await mutations._rollbackChangeLog({
      ...params,
      userId: session.user?.userId!,
    })
  } catch (e: any) {
    logger.error("rollbackChangeLog ERROR", e.message)
    return { errors: [e.message], success: false }
  }
}

export type RollbackDataVersionParams = {
  dataVersion: number
  changeReason?: string
  broadcastAction?: boolean
  dryRun?: boolean
  auditNote?: string
}

export const rollbackDataVersion = async ({
  dataVersion,
  changeReason,
  broadcastAction,
  dryRun,
  auditNote,
}: RollbackDataVersionParams) => {
  try {
    const session = await isAllowed()
    const userRole = session.user?.role
    if (userRole !== "super_user") throw new Error("Only super users can revert data versions")

    if (!Number.isFinite(dataVersion) || dataVersion <= 0) {
      throw new Error("Invalid data version")
    }

    const rollbackPlan = await buildRollbackPlan({ dataVersion })

    const summary = {
      dataVersion,
      totalChanges: rollbackPlan.totalChanges,
      entitiesPlanned: rollbackPlan.plan.length,
      missingPrerequisites: rollbackPlan.missingPrerequisites,
      blocked: rollbackPlan.blocked,
    }

    if (dryRun) {
      return {
        success: !summary.blocked,
        rolledBack: 0,
        errors: summary.blocked ? ["Preflight blocked"] : undefined,
        summary,
        plan: rollbackPlan.plan,
      }
    }

    if (summary.blocked) {
      return {
        success: false,
        rolledBack: 0,
        errors: [
          "Rollback blocked. Missing previous versions for:",
          ...summary.missingPrerequisites,
        ],
        summary,
        plan: rollbackPlan.plan,
      }
    }

    logger.log("rollbackDataVersion attempt", {
      dataVersion,
      userId: session.user?.userId,
      planSize: rollbackPlan.plan.length,
      auditNote,
      dryRun,
    })

    const { results, plan: appliedPlan } = await applyVersionPlanTransactional({
      plan: rollbackPlan.plan,
      mode: "rollback",
      actorUserId: session.user?.userId!,
      changeReason,
      targetDataVersion: dataVersion,
      broadcastAction,
      auditNote,
    })

    return {
      success: true,
      rolledBack: results.filter((r) => !r.error).length,
      summary,
      results,
      plan: appliedPlan,
    }
  } catch (e: any) {
    logger.error("rollbackDataVersion ERROR", e.message)
    return { success: false, rolledBack: 0, errors: [e.message] }
  }
}

export type RestoreDataVersionParams = {
  targetDataVersion: number
  changeReason?: string
  broadcastAction?: boolean
  dryRun?: boolean
  auditNote?: string
}

// Revert the current active entities back to the state they had in a specific data version.
export const restoreDataVersion = async ({
  targetDataVersion,
  changeReason,
  broadcastAction,
  dryRun,
  auditNote,
}: RestoreDataVersionParams) => {
  try {
    const session = await isAllowed()
    const userRole = session.user?.role
    if (userRole !== "super_user") throw new Error("Only super users can revert data versions")

    if (!Number.isFinite(targetDataVersion) || targetDataVersion <= 0) {
      throw new Error("Invalid data version")
    }

    const restorePlan = await buildRestorePlan({ targetDataVersion })

    const summary = {
      dataVersion: targetDataVersion,
      totalChanges: restorePlan.totalChanges,
      entitiesPlanned: restorePlan.plan.length,
      missingPrerequisites: restorePlan.missingPrerequisites,
      alreadyAligned: restorePlan.alreadyAligned,
      blocked: restorePlan.blocked,
    }

    if (dryRun) {
      return {
        success: !summary.blocked,
        rolledBack: 0,
        errors: summary.blocked ? ["Preflight blocked"] : undefined,
        summary,
        plan: restorePlan.plan,
      }
    }

    if (summary.blocked) {
      return {
        success: false,
        rolledBack: 0,
        errors: [
          "Restore blocked. Missing active or target versions for:",
          ...summary.missingPrerequisites,
        ],
        summary,
        plan: restorePlan.plan,
      }
    }

    logger.log("restoreDataVersion attempt", {
      targetDataVersion,
      userId: session.user?.userId,
      planSize: restorePlan.plan.length,
      auditNote,
      dryRun,
    })

    const { results, plan: appliedPlan } = await applyVersionPlanTransactional({
      plan: restorePlan.plan,
      mode: "restore",
      actorUserId: session.user?.userId!,
      changeReason,
      targetDataVersion,
      broadcastAction,
      auditNote,
    })

    return {
      success: true,
      rolledBack: results.filter((r) => !r.error).length,
      summary,
      results,
      plan: appliedPlan,
    }
  } catch (e: any) {
    logger.error("restoreDataVersion ERROR", e.message)
    return { success: false, rolledBack: 0, errors: [e.message] }
  }
}

async function resolveDataVersionIfNeeded(current?: number | null): Promise<number | undefined> {
  if (current !== undefined && current !== null) {
    return current
  }

  try {
    const editorInfo = await _getEditorInfo()
    if (typeof editorInfo.data?.dataVersion === "number") {
      return editorInfo.data.dataVersion
    }
  } catch (error: any) {
    logger.error("resolveDataVersionIfNeeded ERROR", error?.message)
  }

  return undefined
}

const CHANGELOG_PAGE_SIZE = 5000

type VersionPlanEntry = {
  entityId: string
  entityType: ChangeLogType["entityType"]
  currentVersion: number
  targetVersion: number
  targetDataVersion?: number | null
  appliedVersion: number
  appliedDataVersion?: number | null
  targetSnapshotHash?: string
  appliedSnapshotHash?: string
}

type VersionActionResult = {
  entityId: string
  entityType: string
  targetVersion: number
  appliedVersion?: number
  error?: string
}

async function fetchDataVersionChanges(dataVersion: number, opts?: { isActiveOnly?: boolean }) {
  const changes: ChangeLogType[] = []
  let offset = 0

  while (true) {
    const { data, errors } = await queries._getChangeLogs({
      dataVersions: [dataVersion],
      isActiveOnly: opts?.isActiveOnly,
      sortBy: "version",
      sortOrder: "desc",
      limit: CHANGELOG_PAGE_SIZE,
      offset,
    })

    if (errors?.length) throw new Error(errors.join(", "))
    if (!data?.length) break

    changes.push(...data)
    if (data.length < CHANGELOG_PAGE_SIZE) break
    offset += CHANGELOG_PAGE_SIZE
  }

  return changes
}

function groupLatestByEntity(changes: ChangeLogType[]) {
  const map = new Map<string, ChangeLogType>()
  for (const change of changes) {
    if (!change.entityId || change.version === undefined || change.version === null) continue
    const key = `${change.entityType}:${change.entityId}`
    const existing = map.get(key)
    if (!existing || change.version > (existing.version ?? 0)) {
      map.set(key, change)
    }
  }
  return Array.from(map.values())
}

async function findPreviousVersion(entityId: string, entityType: ChangeLogType["entityType"], currentVersion: number) {
  return db.query.changeLogs.findFirst({
    where: and(eq(changeLogs.entityId, entityId), eq(changeLogs.entityType, entityType), lt(changeLogs.version, currentVersion)),
    orderBy: (changeLogs, { desc }) => [desc(changeLogs.version)],
    columns: {
      version: true,
      dataVersion: true,
    },
  })
}

async function findLatestVersion(entityId: string, entityType: ChangeLogType["entityType"]) {
  return db.query.changeLogs.findFirst({
    where: and(eq(changeLogs.entityId, entityId), eq(changeLogs.entityType, entityType)),
    orderBy: (changeLogs, { desc }) => [desc(changeLogs.version)],
    columns: {
      version: true,
    },
  })
}

async function buildRollbackPlan(params: { dataVersion: number }) {
  const changes = await fetchDataVersionChanges(params.dataVersion, { isActiveOnly: true })
  if (!changes.length) {
    throw new Error("No changes found for this data version")
  }

  const latestPerEntity = groupLatestByEntity(changes)
  const plan: VersionPlanEntry[] = []
  const missingPrerequisites: string[] = []

  for (const change of latestPerEntity) {
    const prev = await findPreviousVersion(change.entityId!, change.entityType, change.version!)
    if (!prev) {
      missingPrerequisites.push(`${change.entityType}:${change.entityId}`)
      continue
    }

    plan.push({
      entityId: change.entityId!,
      entityType: change.entityType,
      currentVersion: change.version!,
      targetVersion: prev.version!,
      targetDataVersion: prev.dataVersion,
      appliedVersion: change.version! + 1,
      appliedDataVersion: prev.dataVersion ?? params.dataVersion ?? null,
    })
  }

  return {
    plan,
    missingPrerequisites,
    blocked: !!missingPrerequisites.length,
    totalChanges: changes.length,
  }
}

async function buildRestorePlan(params: { targetDataVersion: number }) {
  const changes = await fetchDataVersionChanges(params.targetDataVersion)
  if (!changes.length) {
    throw new Error("No changes found for this data version")
  }

  const latestPerEntity = groupLatestByEntity(changes)
  const plan: VersionPlanEntry[] = []
  const missingPrerequisites: string[] = []
  const alreadyAligned: string[] = []

  for (const change of latestPerEntity) {
    const current = await findLatestVersion(change.entityId!, change.entityType)
    if (!current) {
      missingPrerequisites.push(`${change.entityType}:${change.entityId}`)
      continue
    }

    if (current.version === change.version) {
      alreadyAligned.push(`${change.entityType}:${change.entityId}`)
      continue
    }

    plan.push({
      entityId: change.entityId!,
      entityType: change.entityType,
      currentVersion: current.version!,
      targetVersion: change.version!,
      targetDataVersion: params.targetDataVersion,
      appliedVersion: current.version! + 1,
      appliedDataVersion: params.targetDataVersion,
    })
  }

  return {
    plan,
    missingPrerequisites,
    alreadyAligned,
    blocked: !!missingPrerequisites.length,
    totalChanges: changes.length,
  }
}

type ApplyVersionPlanParams = {
  plan: VersionPlanEntry[]
  mode: "rollback" | "restore"
  actorUserId: string
  changeReason?: string
  targetDataVersion: number
  broadcastAction?: boolean
  auditNote?: string
}

async function applyVersionPlanTransactional({
  plan,
  mode,
  actorUserId,
  changeReason,
  targetDataVersion,
  broadcastAction,
  auditNote,
}: ApplyVersionPlanParams): Promise<{ results: VersionActionResult[]; plan: VersionPlanEntry[] }> {
  if (!plan.length) return { results: [], plan }

  const updatedPlan = plan.map((item) => ({ ...item }))
  const results: VersionActionResult[] = []

  const lockHash = crypto.createHash("sha256").update(`${mode}:${targetDataVersion}`).digest()
  const pgLockKey = Math.abs(lockHash.readInt32BE(0))

  await db.transaction(async (tx) => {
  // Prevent concurrent rollback/restore on the same data version
  const lockRes = await tx.execute(sql`select pg_try_advisory_xact_lock(${pgLockKey}) as acquired`)
  const acquired = (lockRes[0] as any)?.acquired === true || (lockRes[0] as any)?.acquired === "t"
  if (!acquired) {
    throw new Error("Another rollback/restore job is in progress for this data version. Try again later.")
  }

    for (const item of updatedPlan) {
      const target = await tx.query.changeLogs.findFirst({
        where: and(eq(changeLogs.entityId, item.entityId), eq(changeLogs.entityType, item.entityType), eq(changeLogs.version, item.targetVersion)),
      })

      if (!target) {
        throw new Error(`Target version v${item.targetVersion} not found for ${item.entityType}:${item.entityId}`)
      }

      const current = await tx.query.changeLogs.findFirst({
        where: and(eq(changeLogs.entityId, item.entityId), eq(changeLogs.entityType, item.entityType), eq(changeLogs.isActive, true)),
        orderBy: (changeLogs, { desc }) => [desc(changeLogs.version)],
      })

      if (!current) {
        throw new Error(`No active version found for ${item.entityType}:${item.entityId}`)
      }

      const newVersion = current.version + 1
      if (item.appliedVersion !== undefined && item.appliedVersion !== newVersion) {
        throw new Error(
          `Plan stale for ${item.entityType}:${item.entityId}. Expected to apply v${item.appliedVersion} but latest would be v${newVersion}`
        )
      }

      const appliedDataVersion = item.targetDataVersion ?? targetDataVersion ?? null
      const dateOfChange = new Date()

      const [inserted] = await tx
        .insert(changeLogs)
        .values({
          changeLogId: uuid.v4(),
          entityId: item.entityId,
          entityType: item.entityType,
          action: mode === "restore" ? "restore" : "rollback",
          version: newVersion,
          dataVersion: appliedDataVersion,
          changes: [
            {
              field: "__rollback__",
              previousValue: current.version,
              newValue: item.targetVersion,
              dataType: "number",
            },
          ],
          fullSnapshot: target.fullSnapshot,
          description: `${mode === "restore" ? "Restore" : "Rollback"} to version ${item.targetVersion}`,
          changeReason: changeReason || undefined,
          parentVersion: current.version,
          isActive: true,
          userId: actorUserId,
          scriptId: target.scriptId,
          screenId: target.screenId,
          diagnosisId: target.diagnosisId,
          configKeyId: target.configKeyId,
          drugsLibraryItemId: target.drugsLibraryItemId,
          dataKeyId: target.dataKeyId,
          aliasId: target.aliasId,
          dateOfChange,
        })
        .returning()

      if (!inserted) {
        throw new Error(`Failed to write ${mode} entry for ${item.entityType}:${item.entityId}`)
      }

      await tx
        .update(changeLogs)
        .set({
          isActive: false,
          supersededBy: newVersion,
          supersededAt: dateOfChange,
        })
        .where(
          and(eq(changeLogs.entityId, item.entityId), eq(changeLogs.entityType, item.entityType), eq(changeLogs.version, current.version))
        )

      item.appliedVersion = newVersion
      item.appliedDataVersion = appliedDataVersion
      item.targetSnapshotHash = hashSnapshot(target.fullSnapshot)
      item.appliedSnapshotHash = hashSnapshot(inserted.fullSnapshot)
      results.push({
        entityId: item.entityId,
        entityType: item.entityType,
        targetVersion: item.targetVersion,
        appliedVersion: newVersion,
      })
    }

    const verification = await verifyPlanApplied(updatedPlan, { client: tx })
    if (verification.mismatches.length) {
      throw new Error(`Verification failed: ${verification.mismatches.join(", ")}`)
    }
  })

  logger.log("applyVersionPlanTransactional success", {
    mode,
    targetDataVersion,
    actorUserId,
    applied: results.length,
    auditNote,
  })

  if (broadcastAction) {
    socket.emit("data_changed", `${mode}_data_version`)
  }

  return { results, plan: updatedPlan }
}

async function verifyPlanApplied(plan: VersionPlanEntry[], opts?: { client?: typeof db }) {
  const mismatches: string[] = []
  if (!plan.length) return { mismatches }

  const client = opts?.client ?? db
  const entityIds = Array.from(new Set(plan.map((p) => p.entityId)))
  const entityTypes = Array.from(new Set(plan.map((p) => p.entityType)))

  const latestRows = await client
    .select({
      entityId: changeLogs.entityId,
      entityType: changeLogs.entityType,
      version: changeLogs.version,
      dataVersion: changeLogs.dataVersion,
      parentVersion: changeLogs.parentVersion,
      action: changeLogs.action,
      fullSnapshot: changeLogs.fullSnapshot,
    })
    .from(changeLogs)
    .where(and(inArray(changeLogs.entityId, entityIds), inArray(changeLogs.entityType, entityTypes)))
    .orderBy(desc(changeLogs.version))

  const latestMap = new Map<string, typeof latestRows[number]>()
  for (const row of latestRows) {
    const key = `${row.entityType}:${row.entityId}`
    if (!latestMap.has(key)) {
      latestMap.set(key, row)
    }
  }

  for (const item of plan) {
    const key = `${item.entityType}:${item.entityId}`
    const latest = latestMap.get(key)
    if (!latest) {
      mismatches.push(`${key} missing latest version`)
      continue
    }

    if (latest.version !== item.appliedVersion) {
      mismatches.push(`${key} expected v${item.appliedVersion} but latest is v${latest.version}`)
      continue
    }

    if (item.appliedDataVersion !== undefined && item.appliedDataVersion !== null && latest.dataVersion !== item.appliedDataVersion) {
      mismatches.push(`${key} expected dataVersion ${item.appliedDataVersion} but latest has ${latest.dataVersion ?? "none"}`)
      continue
    }

    if (latest.parentVersion !== item.currentVersion) {
      mismatches.push(`${key} expected parent v${item.currentVersion} but latest has v${latest.parentVersion ?? "none"}`)
      continue
    }

    const expectedHash = item.appliedSnapshotHash || item.targetSnapshotHash
    if (expectedHash) {
      const latestHash = hashSnapshot(latest.fullSnapshot)
      if (latestHash !== expectedHash) {
        mismatches.push(`${key} snapshot hash mismatch`)
      }
    }

    const domainHash = await resolveDomainChecksum(client, item.entityType, item.entityId)
    if (domainHash && expectedHash && domainHash !== expectedHash) {
      mismatches.push(`${key} domain checksum mismatch`)
    }
  }

  return { mismatches }
}

const domainChecksumResolvers: Record<
  string,
  (client: typeof db, entityId: string) => Promise<string | null>
> = {
  script: async (client, entityId) => {
    const row = await client.query.scripts.findFirst({ where: eq(scripts.scriptId, entityId) })
    return row ? hashSnapshot(row) : null
  },
  screen: async (client, entityId) => {
    const row = await client.query.screens.findFirst({ where: eq(screens.screenId, entityId) })
    return row ? hashSnapshot(row) : null
  },
  diagnosis: async (client, entityId) => {
    const row = await client.query.diagnoses.findFirst({ where: eq(diagnoses.diagnosisId, entityId) })
    return row ? hashSnapshot(row) : null
  },
  config_key: async (client, entityId) => {
    const row = await client.query.configKeys.findFirst({ where: eq(configKeys.configKeyId, entityId) })
    return row ? hashSnapshot(row) : null
  },
  drugs_library: async (client, entityId) => {
    const row = await client.query.drugsLibrary.findFirst({ where: eq(drugsLibrary.itemId, entityId) })
    return row ? hashSnapshot(row) : null
  },
  data_key: async (client, entityId) => {
    const row = await client.query.dataKeys.findFirst({ where: eq(dataKeys.uuid, entityId) })
    return row ? hashSnapshot(row) : null
  },
  alias: async (client, entityId) => {
    const row = await client.query.aliases.findFirst({ where: eq(aliases.alias, entityId) })
    return row ? hashSnapshot(row) : null
  },
}

async function resolveDomainChecksum(client: typeof db, entityType: string, entityId: string) {
  const resolver = domainChecksumResolvers[entityType]
  if (!resolver) return null
  try {
    return await resolver(client, entityId)
  } catch (error: any) {
    logger.error("resolveDomainChecksum failed", { entityType, entityId, error: error?.message })
    return null
  }
}
