"use server"

import * as mutations from "@/databases/mutations/changelogs"
import * as queries from "@/databases/queries/changelogs"
import db from "@/databases/pg/drizzle"
import { changeLogs } from "@/databases/pg/schema"
import { and, eq, lt, desc } from "drizzle-orm"
import logger from "@/lib/logger"
import { isAllowed } from "./is-allowed"
import { _getEditorInfo } from "@/databases/queries/editor-info"

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
}

export const rollbackDataVersion = async ({
  dataVersion,
  changeReason,
  broadcastAction,
}: RollbackDataVersionParams) => {
  try {
    const session = await isAllowed()
    const userRole = session.user?.role
    if (userRole !== "super_user") throw new Error("Only super users can revert data versions")

    if (!Number.isFinite(dataVersion) || dataVersion <= 0) {
      throw new Error("Invalid data version")
    }

    const { data: changes } = await queries._getChangeLogs({
      dataVersions: [dataVersion],
      isActiveOnly: true,
      sortBy: "version",
      sortOrder: "desc",
      limit: 5000,
    })

    if (!changes?.length) {
      return { success: false, rolledBack: 0, errors: ["No changes found for this data version"] }
    }

    const errors: string[] = []
    let rolledBack = 0

    for (const change of changes) {
      if (!change.entityId || change.version === undefined || change.version === null) continue

      const previousVersion = await db.query.changeLogs.findFirst({
        where: and(
          eq(changeLogs.entityId, change.entityId),
          eq(changeLogs.entityType, change.entityType),
          lt(changeLogs.version, change.version),
        ),
        orderBy: (changeLogs, { desc }) => [desc(changeLogs.version)],
      })

      if (!previousVersion) {
        errors.push(`No prior version found for entity ${change.entityId}`)
        continue
      }

      const res = await mutations._rollbackChangeLog({
        entityId: change.entityId,
        toVersion: previousVersion.version,
        dataVersion: previousVersion.dataVersion ?? dataVersion,
        userId: session.user?.userId!,
        changeReason,
        broadcastAction,
      })

      if (!res.success) {
        errors.push(...(res.errors || [`Failed to rollback entity ${change.entityId}`]))
      } else {
        rolledBack++
      }
    }

    return {
      success: !errors.length,
      rolledBack,
      errors: errors.length ? errors : undefined,
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
}

// Revert the current active entities back to the state they had in a specific data version.
export const restoreDataVersion = async ({
  targetDataVersion,
  changeReason,
  broadcastAction,
}: RestoreDataVersionParams) => {
  try {
    const session = await isAllowed()
    const userRole = session.user?.role
    if (userRole !== "super_user") throw new Error("Only super users can revert data versions")

    if (!Number.isFinite(targetDataVersion) || targetDataVersion <= 0) {
      throw new Error("Invalid data version")
    }

    const { data: targetChanges } = await queries._getChangeLogs({
      dataVersions: [targetDataVersion],
      sortBy: "version",
      sortOrder: "desc",
      limit: 5000,
    })

    if (!targetChanges?.length) {
      return { success: false, rolledBack: 0, errors: ["No changes found for this data version"] }
    }

    const errors: string[] = []
    let rolledBack = 0

    for (const change of targetChanges) {
      if (!change.entityId || change.version === undefined || change.version === null) continue

      // Find the current active version for this entity
      const currentActive = await db.query.changeLogs.findFirst({
        where: and(eq(changeLogs.entityId, change.entityId), eq(changeLogs.entityType, change.entityType), eq(changeLogs.isActive, true)),
        orderBy: (changeLogs, { desc }) => [desc(changeLogs.version)],
      })

      if (!currentActive) {
        errors.push(`No active version found for entity ${change.entityId}`)
        continue
      }

      if (currentActive.version === change.version) {
        // Already at the desired version
        continue
      }

      const res = await mutations._rollbackChangeLog({
        entityId: change.entityId,
        toVersion: change.version,
        dataVersion: targetDataVersion,
        userId: session.user?.userId!,
        changeReason,
        broadcastAction,
      })

      if (!res.success) {
        errors.push(...(res.errors || [`Failed to revert entity ${change.entityId} to data version v${targetDataVersion}`]))
      } else {
        rolledBack++
      }
    }

    return {
      success: !errors.length,
      rolledBack,
      errors: errors.length ? errors : undefined,
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
