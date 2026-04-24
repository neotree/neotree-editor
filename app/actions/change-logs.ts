"use server"

import * as mutations from "@/databases/mutations/changelogs"
import * as queries from "@/databases/queries/changelogs"
import { isUnauthenticatedError } from "@/lib/auth-errors"
import logger from "@/lib/logger"
import { isAllowed } from "./is-allowed"
import { isAuthenticated } from "./is-authenticated"

async function ensureSuperUser() {
  const session = await isAuthenticated()
  if (!session.yes || session.user?.role !== "super_user") {
    throw new Error("Forbidden: superuser required")
  }
  return session
}

function logUnexpectedActionError(label: string, error: any) {
  if (!isUnauthenticatedError(error)) {
    logger.error(label, error?.message || error)
  }
}

// QUERIES
export const getChangeLogs: typeof queries._getChangeLogs = async (...args) => {
  try {
    await isAllowed()
    return await queries._getChangeLogs(...args)
  } catch (e: any) {
    logUnexpectedActionError("getChangeLogs ERROR", e)
    return { errors: [e.message], data: [] }
  }
}

export const getChangeLog: typeof queries._getChangeLog = async (...args) => {
  try {
    await isAllowed()
    return await queries._getChangeLog(...args)
  } catch (e: any) {
    logUnexpectedActionError("getChangeLog ERROR", e)
    return { errors: [e.message] }
  }
}

export const getEntityHistory: typeof queries._getEntityHistory = async (...args) => {
  try {
    await isAllowed()
    return await queries._getEntityHistory(...args)
  } catch (e: any) {
    logUnexpectedActionError("getEntityHistory ERROR", e)
    return { errors: [e.message], data: [] }
  }
}

export const getActiveVersion: typeof queries._getActiveVersion = async (...args) => {
  try {
    await isAllowed()
    return await queries._getActiveVersion(...args)
  } catch (e: any) {
    logUnexpectedActionError("getActiveVersion ERROR", e)
    return { errors: [e.message] }
  }
}

export const getVersionChain: typeof queries._getVersionChain = async (...args) => {
  try {
    await isAllowed()
    return await queries._getVersionChain(...args)
  } catch (e: any) {
    logUnexpectedActionError("getVersionChain ERROR", e)
    return { errors: [e.message], data: [] }
  }
}

export const getChangeLogStats: typeof queries._getChangeLogStats = async (...args) => {
  try {
    await isAllowed()
    return await queries._getChangeLogStats(...args)
  } catch (e: any) {
    logUnexpectedActionError("getChangeLogStats ERROR", e)
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
    logUnexpectedActionError("countChangeLogs ERROR", e)
    return { errors: [e.message], count: 0 }
  }
}

export const countChangeLogsByEntity: typeof queries._countChangeLogsByEntity = async (...args) => {
  try {
    await isAllowed()
    return await queries._countChangeLogsByEntity(...args)
  } catch (e: any) {
    logUnexpectedActionError("countChangeLogsByEntity ERROR", e)
    return { errors: [e.message], data: [] }
  }
}

export const countChangeLogsByAction: typeof queries._countChangeLogsByAction = async (...args) => {
  try {
    await isAllowed()
    return await queries._countChangeLogsByAction(...args)
  } catch (e: any) {
    logUnexpectedActionError("countChangeLogsByAction ERROR", e)
    return { errors: [e.message], data: [] }
  }
}

export const countChangeLogsByUser: typeof queries._countChangeLogsByUser = async (...args) => {
  try {
    await isAllowed()
    return await queries._countChangeLogsByUser(...args)
  } catch (e: any) {
    logUnexpectedActionError("countChangeLogsByUser ERROR", e)
    return { errors: [e.message], data: [] }
  }
}

export const countEntityVersions: typeof queries._countEntityVersions = async (...args) => {
  try {
    await isAllowed()
    return await queries._countEntityVersions(...args)
  } catch (e: any) {
    logUnexpectedActionError("countEntityVersions ERROR", e)
    return { errors: [e.message], totalVersions: 0, activeVersions: 0 }
  }
}

export const getDataVersionSummaries: typeof queries._getDataVersionSummaries = async (...args) => {
  try {
    await isAllowed()
    return await queries._getDataVersionSummaries(...args)
  } catch (e: any) {
    logUnexpectedActionError("getDataVersionSummaries ERROR", e)
    return { errors: [e.message], data: [], total: 0 }
  }
}

export const searchChangeLogs: typeof queries.SearchChangeLogs._searchChangeLogs = async (...args) => {
  try {
    await isAllowed()
    return await queries.SearchChangeLogs._searchChangeLogs(...args)
  } catch (e: any) {
    logUnexpectedActionError("searchChangeLogs ERROR", e)
    return { errors: [e.message], data: [], total: 0 }
  }
}

export const searchChangesByField: typeof queries.SearchChangeLogs._searchChangesByField = async (...args) => {
  try {
    await isAllowed()
    return await queries.SearchChangeLogs._searchChangesByField(...args)
  } catch (e: any) {
    logUnexpectedActionError("searchChangesByField ERROR", e)
    return { errors: [e.message], data: [] }
  }
}

export const searchChangeLogsByUser: typeof queries.SearchChangeLogs._searchChangeLogsByUser = async (...args) => {
  try {
    await isAllowed()
    return await queries.SearchChangeLogs._searchChangeLogsByUser(...args)
  } catch (e: any) {
    logUnexpectedActionError("searchChangeLogsByUser ERROR", e)
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
    logUnexpectedActionError("searchChangeLogsByDateRange ERROR", e)
    return { errors: [e.message], data: [] }
  }
}

export const findRelatedChanges: typeof queries.SearchChangeLogs._findRelatedChanges = async (...args) => {
  try {
    await isAllowed()
    return await queries.SearchChangeLogs._findRelatedChanges(...args)
  } catch (e: any) {
    logUnexpectedActionError("findRelatedChanges ERROR", e)
    return {
      errors: [e.message],
      data: { current: {} as any, children: [], mergedVersions: [], supersededVersions: [] },
    }
  }
}

export const getChangeLogIntegrityReport: typeof queries._getChangeLogIntegrityReport = async (...args) => {
  try {
    await ensureSuperUser()
    return await queries._getChangeLogIntegrityReport(...args)
  } catch (e: any) {
    logUnexpectedActionError("getChangeLogIntegrityReport ERROR", e)
    return {
      errors: [e.message],
      data: [],
      summary: { healthy: 0, autoHealable: 0, rebaselineRequired: 0, missingChain: 0, changeLogAhead: 0, total: 0 },
    }
  }
}

// MUTATIONS
export const saveChangeLog: typeof mutations._saveChangeLog = async (params) => {
  try {
    const session = await ensureSuperUser()
    return await mutations._saveChangeLog({
      ...params,
      data: {
        ...params.data,
        userId: session.user?.userId!,
      },
    })
  } catch (e: any) {
    logUnexpectedActionError("saveChangeLog ERROR", e)
    return { errors: [e.message], success: false }
  }
}

export const saveChangeLogs: typeof mutations._saveChangeLogs = async (params) => {
  try {
    const session = await ensureSuperUser()
    return await mutations._saveChangeLogs({
      ...params,
      data: params.data.map((d) => ({
        ...d,
        userId: session.user?.userId!,
      })),
    })
  } catch (e: any) {
    logUnexpectedActionError("saveChangeLogs ERROR", e)
    return { errors: [e.message], success: false, saved: 0 }
  }
}

export const updateChangeLog: typeof mutations._updateChangeLog = async (params) => {
  try {
    await ensureSuperUser()
    return await mutations._updateChangeLog(params)
  } catch (e: any) {
    logUnexpectedActionError("updateChangeLog ERROR", e)
    return { errors: [e.message], success: false }
  }
}

export const markVersionAsSuperseded: typeof mutations._markVersionAsSuperseded = async (params) => {
  try {
    await ensureSuperUser()
    return await mutations._markVersionAsSuperseded(params)
  } catch (e: any) {
    logUnexpectedActionError("markVersionAsSuperseded ERROR", e)
    return { errors: [e.message], success: false }
  }
}

export const rollbackChangeLog: typeof mutations._rollbackChangeLog = async (params) => {
  try {
    const session = await ensureSuperUser()
    return await mutations._rollbackChangeLog({
      ...params,
      userId: session.user?.userId!,
    })
  } catch (e: any) {
    logUnexpectedActionError("rollbackChangeLog ERROR", e)
    return { errors: [e.message], success: false }
  }
}

export const rollbackDataVersion: typeof mutations._rollbackDataVersion = async (params) => {
  try {
    const session = await ensureSuperUser()
    return await mutations._rollbackDataVersion({
      ...params,
      userId: session.user?.userId!,
    })
  } catch (e: any) {
    logUnexpectedActionError("rollbackDataVersion ERROR", e)
    return { errors: [e.message], success: false }
  }
}
