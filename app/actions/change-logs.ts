"use server"

import * as mutations from "@/databases/mutations/changelogs"
import * as queries from "@/databases/queries/changelogs"
import logger from "@/lib/logger"
import { isAllowed } from "./is-allowed"

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
    return await mutations._saveChangeLog({
      ...params,
      data: {
        ...params.data,
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
    return await mutations._saveChangeLogs({
      ...params,
      data: params.data.map((d) => ({
        ...d,
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
