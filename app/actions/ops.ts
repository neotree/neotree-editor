"use server"

import { revalidatePath as _revalidatePath } from "next/cache"

import socket from "@/lib/socket"
import logger from "@/lib/logger"
import { isAllowed } from "./is-allowed"
import { getAuthenticatedUser } from "./get-authenticated-user"
import { _clearPendingDeletion, _processPendingDeletion } from "@/databases/mutations/ops"
import * as opsQueries from "@/databases/queries/ops"
import * as scriptsQueries from "@/databases/queries/scripts"
import * as scriptsMutations from "@/databases/mutations/scripts"
import * as configKeysMutations from "@/databases/mutations/config-keys"
import * as configKeysQueries from "@/databases/queries/config-keys"
import * as hospitalsMutations from "@/databases/mutations/hospitals"
import * as hospitalsQueries from "@/databases/queries/hospitals"
import * as drugsLibraryMutations from "@/databases/mutations/drugs-library"
import * as drugsLibraryQueries from "@/databases/queries/drugs-library"
import * as dataKeysMutations from "@/databases/mutations/data-keys"
import * as dataKeysQueries from "@/databases/queries/data-keys"
import { _getEditorInfo, type GetEditorInfoResults } from "@/databases/queries/editor-info"
import { _saveChangeLog } from "@/databases/mutations/changelogs/_save-change-log"
import { buildReleasePublishChangeLog } from "@/databases/mutations/changelogs"
import db from "@/databases/pg/drizzle"
import {
  configKeysDrafts,
  dataKeysDrafts,
  diagnosesDrafts,
  drugsLibraryDrafts,
  editorInfo,
  hospitalsDrafts,
  pendingDeletion,
  problemsDrafts,
  screensDrafts,
  scriptsDrafts,
} from "@/databases/pg/schema"
import { eq, sql } from "drizzle-orm"

export type PendingDraftQueueScope = "all" | "mine"
export type PendingDraftQueueTab = "all" | "creates" | "updates" | "deletes" | "mine"
export type PendingDraftQueueSort = "recent" | "oldest" | "creator" | "entity" | "title" | "action"
export type PendingDraftQueueGroupBy = "parent" | "creator" | "entity"
export type PendingDraftQueueEntityType =
  | "script"
  | "screen"
  | "diagnosis"
  | "problem"
  | "config_key"
  | "hospital"
  | "drugs_library"
  | "data_key"
  | "alias"
export type PendingDraftQueueAction = "create" | "update" | "delete"

export type PendingDraftQueueDiffPreview = {
  field: string
  before: string
  after: string
}

export type PendingDraftQueueEntry = {
  id: string
  entityType: PendingDraftQueueEntityType
  action: PendingDraftQueueAction
  title: string
  description: string
  entityId: string
  draftId?: string | null
  publishedEntityId?: string | null
  parentEntityId?: string | null
  parentTitle?: string | null
  href?: string | null
  searchHref?: string | null
  createdAt: string
  createdByUserId?: string | null
  createdByName: string
  createdByEmail?: string | null
  isUnpublished: boolean
  source: "draft" | "pending_deletion"
  statusLabel: string
  changedFields: string[]
  changedFieldCount: number
  diffPreview: PendingDraftQueueDiffPreview[]
  reviewGroupId: string
  reviewGroupLabel: string
  conflictLabels: string[]
  infoLabels: string[]
  isStale: boolean
  ageInDays: number
  parentHref?: string | null
}

export type PendingDraftQueueSummary = {
  totalEntries: number
  totalDrafts: number
  totalDeletes: number
  totalCreates: number
  totalUpdates: number
  uniqueEntities: number
  entityCounts: Record<string, number>
  scope: PendingDraftQueueScope
  scopeLabel: string
  staleEntries: number
  conflictEntries: number
}

export type PendingDraftQueueFilters = {
  scope: PendingDraftQueueScope
  tab: PendingDraftQueueTab
  query: string
  entityType: "all" | PendingDraftQueueEntityType
  creator: string
  sort: PendingDraftQueueSort
  groupBy: PendingDraftQueueGroupBy
  page: number
  pageSize: number
}

export type PendingDraftQueueMeta = {
  filters: PendingDraftQueueFilters
  pagination: {
    page: number
    pageSize: number
    totalEntries: number
    totalPages: number
    returnedEntries: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
  tabCounts: Record<PendingDraftQueueTab, number>
  creators: Array<{ value: string; label: string; count: number }>
  entityTypes: Array<{ value: PendingDraftQueueEntityType; label: string; count: number }>
}

function toIsoString(value: Date | string | null | undefined) {
  if (!value) return new Date(0).toISOString()
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

const PENDING_DRAFT_STALE_DAYS = 14
const PENDING_DRAFT_PAGE_SIZE = 20
const entityTypeLabels: Record<PendingDraftQueueEntityType, string> = {
  script: "Script",
  screen: "Screen",
  diagnosis: "Diagnosis",
  problem: "Problem",
  config_key: "Config Key",
  hospital: "Hospital",
  drugs_library: "Drugs Library",
  data_key: "Data Key",
  alias: "Alias",
}
const actionLabelByTab: Record<Exclude<PendingDraftQueueTab, "all" | "mine">, PendingDraftQueueAction> = {
  creates: "create",
  updates: "update",
  deletes: "delete",
}
const ignoredDiffKeys = new Set([
  "id",
  "version",
  "publishDate",
  "createdAt",
  "updatedAt",
  "deletedAt",
  "oldScreenId",
  "oldScriptId",
  "oldDiagnosisId",
  "oldProblemId",
  "scriptId",
  "screenId",
  "diagnosisId",
  "problemId",
  "configKeyId",
  "hospitalId",
  "itemId",
  "dataKeyId",
  "uuid",
])

function getCreatedByLabel(createdBy?: { displayName?: string | null; email?: string | null } | null) {
  return createdBy?.displayName || createdBy?.email || "Unknown user"
}

function buildChangelogSearchHref(entityId?: string | null) {
  return entityId ? `/changelogs?q=${encodeURIComponent(entityId)}` : null
}

function summarizeDraftAction(hasPublishedEntity: boolean, noun: string) {
  return hasPublishedEntity ? `Draft update to published ${noun}` : `New ${noun} draft`
}

function toPlainRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {}
}

function previewValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "Empty"
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return JSON.stringify(value, null, 2)
}

function valuesEqual(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function buildDiffPreview({
  action,
  draftData,
  publishedData,
}: {
  action: PendingDraftQueueAction
  draftData?: unknown
  publishedData?: unknown
}) {
  if (action === "delete") {
    return { changedFields: [], diffPreview: [] as PendingDraftQueueDiffPreview[] }
  }

  const draft = toPlainRecord(draftData)
  const published = toPlainRecord(publishedData)
  const keys = Array.from(new Set([...Object.keys(draft), ...Object.keys(published)]))
    .filter((key) => !ignoredDiffKeys.has(key))
    .sort((a, b) => a.localeCompare(b))

  const changedFields: string[] = []
  const diffPreview: PendingDraftQueueDiffPreview[] = []

  for (const key of keys) {
    const before = published[key]
    const after = draft[key]

    if (action === "create") {
      const isMeaningful = after !== null && after !== undefined && after !== "" && JSON.stringify(after) !== "[]"
      if (!isMeaningful) continue
      changedFields.push(key)
      diffPreview.push({ field: key, before: "New", after: previewValue(after) })
      continue
    }

    if (valuesEqual(before, after)) continue
    changedFields.push(key)
    diffPreview.push({ field: key, before: previewValue(before), after: previewValue(after) })
  }

  return {
    changedFields,
    diffPreview,
  }
}

function normalizePendingDraftQueueFilters(
  params:
    | {
        scope?: PendingDraftQueueScope
        tab?: PendingDraftQueueTab
        query?: string
        entityType?: "all" | PendingDraftQueueEntityType
        creator?: string
        sort?: PendingDraftQueueSort
        groupBy?: PendingDraftQueueGroupBy
        page?: number
        pageSize?: number
      }
    | undefined,
  canViewAll: boolean,
) {
  const requestedScope = params?.scope === "all" && canViewAll ? "all" : "mine"
  const tab: PendingDraftQueueTab =
    params?.tab && ["all", "creates", "updates", "deletes", "mine"].includes(params.tab) ? params.tab : "all"

  return {
    scope: tab === "mine" ? "mine" : requestedScope,
    tab,
    query: typeof params?.query === "string" ? params.query.trim() : "",
    entityType:
      params?.entityType && ["all", ...Object.keys(entityTypeLabels)].includes(params.entityType)
        ? (params.entityType as "all" | PendingDraftQueueEntityType)
        : "all",
    creator: typeof params?.creator === "string" ? params.creator : "all",
    sort: params?.sort && ["recent", "oldest", "creator", "entity", "title", "action"].includes(params.sort) ? params.sort : "recent",
    groupBy: params?.groupBy && ["parent", "creator", "entity"].includes(params.groupBy) ? params.groupBy : "parent",
    page: Math.max(1, Number(params?.page) || 1),
    pageSize: Math.min(100, Math.max(10, Number(params?.pageSize) || PENDING_DRAFT_PAGE_SIZE)),
  } satisfies PendingDraftQueueFilters
}

function shouldIncludeDraftRows({ filters, entityType }: { filters: PendingDraftQueueFilters; entityType: PendingDraftQueueEntityType }) {
  if (filters.tab === "deletes") return false
  if (filters.entityType !== "all") return filters.entityType === entityType
  return entityType !== "alias"
}

function shouldIncludePendingDeletionRows({
  filters,
  entityType,
}: {
  filters: PendingDraftQueueFilters
  entityType: PendingDraftQueueEntityType
}) {
  if (filters.tab === "creates" || filters.tab === "updates") return false
  if (filters.entityType !== "all") return filters.entityType === entityType
  return true
}

export async function getPendingDraftQueue(params?: {
  entryId?: string
  scope?: PendingDraftQueueScope
  tab?: PendingDraftQueueTab
  query?: string
  entityType?: "all" | PendingDraftQueueEntityType
  creator?: string
  sort?: PendingDraftQueueSort
  groupBy?: PendingDraftQueueGroupBy
  page?: number
  pageSize?: number
}): Promise<{
  success: boolean
  data: PendingDraftQueueEntry[]
  summary: PendingDraftQueueSummary
  meta: PendingDraftQueueMeta
  errors?: string[]
}> {
  try {
    const session = await isAllowed()
    const currentUserId = session.user?.userId || null
    const canViewAll = ["admin", "super_user"].includes(session.user?.role || "")
    const filters = normalizePendingDraftQueueFilters(params, canViewAll)
    const createdByFilter = filters.scope === "mine" && currentUserId ? currentUserId : null
    const includeScripts = shouldIncludeDraftRows({ filters, entityType: "script" })
    const includeScreens = shouldIncludeDraftRows({ filters, entityType: "screen" })
    const includeDiagnoses = shouldIncludeDraftRows({ filters, entityType: "diagnosis" })
    const includeProblems = shouldIncludeDraftRows({ filters, entityType: "problem" })
    const includeConfigKeys = shouldIncludeDraftRows({ filters, entityType: "config_key" })
    const includeHospitals = shouldIncludeDraftRows({ filters, entityType: "hospital" })
    const includeDrugsLibrary = shouldIncludeDraftRows({ filters, entityType: "drugs_library" })
    const includeDataKeys = shouldIncludeDraftRows({ filters, entityType: "data_key" })
    const includePendingDeletes =
      shouldIncludePendingDeletionRows({ filters, entityType: "script" }) ||
      shouldIncludePendingDeletionRows({ filters, entityType: "screen" }) ||
      shouldIncludePendingDeletionRows({ filters, entityType: "diagnosis" }) ||
      shouldIncludePendingDeletionRows({ filters, entityType: "problem" }) ||
      shouldIncludePendingDeletionRows({ filters, entityType: "config_key" }) ||
      shouldIncludePendingDeletionRows({ filters, entityType: "hospital" }) ||
      shouldIncludePendingDeletionRows({ filters, entityType: "drugs_library" }) ||
      shouldIncludePendingDeletionRows({ filters, entityType: "data_key" }) ||
      shouldIncludePendingDeletionRows({ filters, entityType: "alias" })

    const whereByUser = <TColumn>(column: TColumn) => (createdByFilter ? eq(column as any, createdByFilter) : undefined)

    const [
      scriptDraftRows,
      screenDraftRows,
      diagnosisDraftRows,
      problemDraftRows,
      configKeyDraftRows,
      hospitalDraftRows,
      drugsLibraryDraftRows,
      dataKeyDraftRows,
      pendingDeletionRows,
    ] = await Promise.all([
      includeScripts
        ? db.query.scriptsDrafts.findMany({
            where: whereByUser(scriptsDrafts.createdByUserId),
            with: { createdBy: true, script: true },
          })
        : Promise.resolve([]),
      includeScreens
        ? db.query.screensDrafts.findMany({
            where: whereByUser(screensDrafts.createdByUserId),
            with: { createdBy: true, screen: true, script: true, scriptDraft: true },
          })
        : Promise.resolve([]),
      includeDiagnoses
        ? db.query.diagnosesDrafts.findMany({
            where: whereByUser(diagnosesDrafts.createdByUserId),
            with: { createdBy: true, diagnosis: true, script: true, scriptDraft: true },
          })
        : Promise.resolve([]),
      includeProblems
        ? db.query.problemsDrafts.findMany({
            where: whereByUser(problemsDrafts.createdByUserId),
            with: { createdBy: true, problem: true, script: true, scriptDraft: true },
          })
        : Promise.resolve([]),
      includeConfigKeys
        ? db.query.configKeysDrafts.findMany({
            where: whereByUser(configKeysDrafts.createdByUserId),
            with: { createdBy: true, configKey: true },
          })
        : Promise.resolve([]),
      includeHospitals
        ? db.query.hospitalsDrafts.findMany({
            where: whereByUser(hospitalsDrafts.createdByUserId),
            with: { createdBy: true, hospital: true },
          })
        : Promise.resolve([]),
      includeDrugsLibrary
        ? db.query.drugsLibraryDrafts.findMany({
            where: whereByUser(drugsLibraryDrafts.createdByUserId),
            with: { createdBy: true, item: true },
          })
        : Promise.resolve([]),
      includeDataKeys
        ? db.query.dataKeysDrafts.findMany({
            where: whereByUser(dataKeysDrafts.createdByUserId),
            with: { createdBy: true, dataKey: true },
          })
        : Promise.resolve([]),
      includePendingDeletes
        ? db.query.pendingDeletion.findMany({
            where: whereByUser(pendingDeletion.createdByUserId),
            with: {
              createdBy: true,
              script: true,
              screen: true,
              screenScript: true,
              diagnosis: true,
              diagnosisScript: true,
              problem: true,
              problemScript: true,
              configKey: true,
              hospital: true,
              drugsLibraryItem: true,
              dataKey: true,
              alias: true,
            },
          })
        : Promise.resolve([]),
    ])

    const entries: PendingDraftQueueEntry[] = [
      ...scriptDraftRows.map((draft): PendingDraftQueueEntry => {
        const entityId = draft.scriptId || draft.scriptDraftId
        const diff = buildDiffPreview({
          action: draft.scriptId ? "update" : "create",
          draftData: draft.data,
          publishedData: draft.script,
        })
        return {
          id: `draft:script:${draft.scriptDraftId}`,
          entityType: "script",
          action: draft.scriptId ? "update" : "create",
          title: draft.data.title || draft.data.printTitle || "Untitled Script",
          description: summarizeDraftAction(!!draft.scriptId, "script"),
          entityId,
          draftId: draft.scriptDraftId,
          publishedEntityId: draft.scriptId,
          href: entityId ? `/script/${entityId}` : null,
          searchHref: buildChangelogSearchHref(draft.scriptId),
          createdAt: toIsoString(draft.updatedAt ?? draft.createdAt),
          createdByUserId: draft.createdByUserId,
          createdByName: getCreatedByLabel(draft.createdBy),
          createdByEmail: draft.createdBy?.email || null,
          isUnpublished: !draft.scriptId,
          source: "draft",
          statusLabel: draft.scriptId ? "Draft update" : "New draft",
          changedFields: diff.changedFields,
          changedFieldCount: diff.changedFields.length,
          diffPreview: diff.diffPreview,
          reviewGroupId: `script:${entityId}`,
          reviewGroupLabel: draft.data.title || draft.data.printTitle || "Script",
          conflictLabels: [],
          infoLabels: [],
          isStale: false,
          ageInDays: 0,
          parentHref: null,
        }
      }),
      ...screenDraftRows.map((draft): PendingDraftQueueEntry => {
        const parentEntityId = draft.scriptId || draft.scriptDraftId
        const entityId = draft.screenId || draft.screenDraftId
        const parentTitle = draft.script?.title || draft.scriptDraft?.data?.title || draft.scriptDraft?.data?.printTitle || null
        const diff = buildDiffPreview({
          action: draft.screenId ? "update" : "create",
          draftData: draft.data,
          publishedData: draft.screen,
        })
        return {
          id: `draft:screen:${draft.screenDraftId}`,
          entityType: "screen",
          action: draft.screenId ? "update" : "create",
          title: draft.data.title || draft.data.sectionTitle || draft.data.previewTitle || "Untitled Screen",
          description: summarizeDraftAction(!!draft.screenId, "screen"),
          entityId,
          draftId: draft.screenDraftId,
          publishedEntityId: draft.screenId,
          parentEntityId,
          parentTitle,
          href: parentEntityId && entityId ? `/script/${parentEntityId}/screen/${entityId}` : null,
          searchHref: buildChangelogSearchHref(draft.screenId),
          createdAt: toIsoString(draft.updatedAt ?? draft.createdAt),
          createdByUserId: draft.createdByUserId,
          createdByName: getCreatedByLabel(draft.createdBy),
          createdByEmail: draft.createdBy?.email || null,
          isUnpublished: !draft.screenId,
          source: "draft",
          statusLabel: draft.screenId ? "Draft update" : "New draft",
          changedFields: diff.changedFields,
          changedFieldCount: diff.changedFields.length,
          diffPreview: diff.diffPreview,
          reviewGroupId: parentEntityId ? `parent:${parentEntityId}` : `screen:${entityId}`,
          reviewGroupLabel: parentTitle || "Ungrouped Screen Changes",
          conflictLabels: [],
          infoLabels: [],
          isStale: false,
          ageInDays: 0,
          parentHref: parentEntityId ? `/script/${parentEntityId}` : null,
        }
      }),
      ...diagnosisDraftRows.map((draft): PendingDraftQueueEntry => {
        const parentEntityId = draft.scriptId || draft.scriptDraftId
        const entityId = draft.diagnosisId || draft.diagnosisDraftId
        const parentTitle = draft.script?.title || draft.scriptDraft?.data?.title || draft.scriptDraft?.data?.printTitle || null
        const diff = buildDiffPreview({
          action: draft.diagnosisId ? "update" : "create",
          draftData: draft.data,
          publishedData: draft.diagnosis,
        })
        return {
          id: `draft:diagnosis:${draft.diagnosisDraftId}`,
          entityType: "diagnosis",
          action: draft.diagnosisId ? "update" : "create",
          title: draft.data.name || draft.data.key || "Untitled Diagnosis",
          description: summarizeDraftAction(!!draft.diagnosisId, "diagnosis"),
          entityId,
          draftId: draft.diagnosisDraftId,
          publishedEntityId: draft.diagnosisId,
          parentEntityId,
          parentTitle,
          href: parentEntityId && entityId ? `/script/${parentEntityId}/diagnosis/${entityId}` : null,
          searchHref: buildChangelogSearchHref(draft.diagnosisId),
          createdAt: toIsoString(draft.updatedAt ?? draft.createdAt),
          createdByUserId: draft.createdByUserId,
          createdByName: getCreatedByLabel(draft.createdBy),
          createdByEmail: draft.createdBy?.email || null,
          isUnpublished: !draft.diagnosisId,
          source: "draft",
          statusLabel: draft.diagnosisId ? "Draft update" : "New draft",
          changedFields: diff.changedFields,
          changedFieldCount: diff.changedFields.length,
          diffPreview: diff.diffPreview,
          reviewGroupId: parentEntityId ? `parent:${parentEntityId}` : `diagnosis:${entityId}`,
          reviewGroupLabel: parentTitle || "Ungrouped Diagnosis Changes",
          conflictLabels: [],
          infoLabels: [],
          isStale: false,
          ageInDays: 0,
          parentHref: parentEntityId ? `/script/${parentEntityId}` : null,
        }
      }),
      ...problemDraftRows.map((draft): PendingDraftQueueEntry => {
        const parentEntityId = draft.scriptId || draft.scriptDraftId
        const entityId = draft.problemId || draft.problemDraftId
        const parentTitle = draft.script?.title || draft.scriptDraft?.data?.title || draft.scriptDraft?.data?.printTitle || null
        const diff = buildDiffPreview({
          action: draft.problemId ? "update" : "create",
          draftData: draft.data,
          publishedData: draft.problem,
        })
        return {
          id: `draft:problem:${draft.problemDraftId}`,
          entityType: "problem",
          action: draft.problemId ? "update" : "create",
          title: draft.data.name || draft.data.key || "Untitled Problem",
          description: summarizeDraftAction(!!draft.problemId, "problem"),
          entityId,
          draftId: draft.problemDraftId,
          publishedEntityId: draft.problemId,
          parentEntityId,
          parentTitle,
          href: parentEntityId && entityId ? `/script/${parentEntityId}/problem/${entityId}` : null,
          searchHref: buildChangelogSearchHref(draft.problemId),
          createdAt: toIsoString(draft.updatedAt ?? draft.createdAt),
          createdByUserId: draft.createdByUserId,
          createdByName: getCreatedByLabel(draft.createdBy),
          createdByEmail: draft.createdBy?.email || null,
          isUnpublished: !draft.problemId,
          source: "draft",
          statusLabel: draft.problemId ? "Draft update" : "New draft",
          changedFields: diff.changedFields,
          changedFieldCount: diff.changedFields.length,
          diffPreview: diff.diffPreview,
          reviewGroupId: parentEntityId ? `parent:${parentEntityId}` : `problem:${entityId}`,
          reviewGroupLabel: parentTitle || "Ungrouped Problem Changes",
          conflictLabels: [],
          infoLabels: [],
          isStale: false,
          ageInDays: 0,
          parentHref: parentEntityId ? `/script/${parentEntityId}` : null,
        }
      }),
      ...configKeyDraftRows.map((draft): PendingDraftQueueEntry => {
        const entityId = draft.configKeyId || draft.configKeyDraftId
        const diff = buildDiffPreview({
          action: draft.configKeyId ? "update" : "create",
          draftData: draft.data,
          publishedData: draft.configKey,
        })
        return {
          id: `draft:config_key:${draft.configKeyDraftId}`,
          entityType: "config_key",
          action: draft.configKeyId ? "update" : "create",
          title: draft.data.label || draft.data.key || "Untitled Config Key",
          description: summarizeDraftAction(!!draft.configKeyId, "configuration key"),
          entityId,
          draftId: draft.configKeyDraftId,
          publishedEntityId: draft.configKeyId,
          href: "/configuration",
          searchHref: buildChangelogSearchHref(draft.configKeyId),
          createdAt: toIsoString(draft.updatedAt ?? draft.createdAt),
          createdByUserId: draft.createdByUserId,
          createdByName: getCreatedByLabel(draft.createdBy),
          createdByEmail: draft.createdBy?.email || null,
          isUnpublished: !draft.configKeyId,
          source: "draft",
          statusLabel: draft.configKeyId ? "Draft update" : "New draft",
          changedFields: diff.changedFields,
          changedFieldCount: diff.changedFields.length,
          diffPreview: diff.diffPreview,
          reviewGroupId: "entity:config_key",
          reviewGroupLabel: "Configuration Keys",
          conflictLabels: [],
          infoLabels: [],
          isStale: false,
          ageInDays: 0,
          parentHref: null,
        }
      }),
      ...hospitalDraftRows.map((draft): PendingDraftQueueEntry => {
        const entityId = draft.hospitalId || draft.hospitalDraftId
        const diff = buildDiffPreview({
          action: draft.hospitalId ? "update" : "create",
          draftData: draft.data,
          publishedData: draft.hospital,
        })
        return {
          id: `draft:hospital:${draft.hospitalDraftId}`,
          entityType: "hospital",
          action: draft.hospitalId ? "update" : "create",
          title: draft.data.name || "Untitled Hospital",
          description: summarizeDraftAction(!!draft.hospitalId, "hospital"),
          entityId,
          draftId: draft.hospitalDraftId,
          publishedEntityId: draft.hospitalId,
          href: `/hospitals?hospitalId=${encodeURIComponent(entityId)}`,
          searchHref: buildChangelogSearchHref(draft.hospitalId),
          createdAt: toIsoString(draft.updatedAt ?? draft.createdAt),
          createdByUserId: draft.createdByUserId,
          createdByName: getCreatedByLabel(draft.createdBy),
          createdByEmail: draft.createdBy?.email || null,
          isUnpublished: !draft.hospitalId,
          source: "draft",
          statusLabel: draft.hospitalId ? "Draft update" : "New draft",
          changedFields: diff.changedFields,
          changedFieldCount: diff.changedFields.length,
          diffPreview: diff.diffPreview,
          reviewGroupId: "entity:hospital",
          reviewGroupLabel: "Hospitals",
          conflictLabels: [],
          infoLabels: [],
          isStale: false,
          ageInDays: 0,
          parentHref: null,
        }
      }),
      ...drugsLibraryDraftRows.map((draft): PendingDraftQueueEntry => {
        const entityId = draft.itemId || draft.itemDraftId
        const diff = buildDiffPreview({
          action: draft.itemId ? "update" : "create",
          draftData: draft.data,
          publishedData: draft.item,
        })
        return {
          id: `draft:drugs_library:${draft.itemDraftId}`,
          entityType: "drugs_library",
          action: draft.itemId ? "update" : "create",
          title: draft.data.drug || draft.data.key || "Untitled Drug",
          description: summarizeDraftAction(!!draft.itemId, "drugs library item"),
          entityId,
          draftId: draft.itemDraftId,
          publishedEntityId: draft.itemId,
          href: `/drugs-fluids-and-feeds?itemId=${encodeURIComponent(entityId)}`,
          searchHref: buildChangelogSearchHref(draft.itemId),
          createdAt: toIsoString(draft.updatedAt ?? draft.createdAt),
          createdByUserId: draft.createdByUserId,
          createdByName: getCreatedByLabel(draft.createdBy),
          createdByEmail: draft.createdBy?.email || null,
          isUnpublished: !draft.itemId,
          source: "draft",
          statusLabel: draft.itemId ? "Draft update" : "New draft",
          changedFields: diff.changedFields,
          changedFieldCount: diff.changedFields.length,
          diffPreview: diff.diffPreview,
          reviewGroupId: "entity:drugs_library",
          reviewGroupLabel: "Drugs, Fluids, and Feeds",
          conflictLabels: [],
          infoLabels: [],
          isStale: false,
          ageInDays: 0,
          parentHref: null,
        }
      }),
      ...dataKeyDraftRows.map((draft): PendingDraftQueueEntry => {
        const entityId = draft.dataKeyId || draft.uuid
        const hrefId = draft.data?.uuid || draft.uuid
        const diff = buildDiffPreview({
          action: draft.dataKeyId ? "update" : "create",
          draftData: draft.data,
          publishedData: draft.dataKey,
        })
        return {
          id: `draft:data_key:${draft.uuid}`,
          entityType: "data_key",
          action: draft.dataKeyId ? "update" : "create",
          title: draft.data.label || draft.data.name || "Untitled Data Key",
          description: summarizeDraftAction(!!draft.dataKeyId, "data key"),
          entityId,
          draftId: draft.uuid,
          publishedEntityId: draft.dataKeyId,
          href: `/data-keys/edit/${encodeURIComponent(hrefId)}`,
          searchHref: buildChangelogSearchHref(draft.dataKeyId),
          createdAt: toIsoString(draft.updatedAt ?? draft.createdAt),
          createdByUserId: draft.createdByUserId,
          createdByName: getCreatedByLabel(draft.createdBy),
          createdByEmail: draft.createdBy?.email || null,
          isUnpublished: !draft.dataKeyId,
          source: "draft",
          statusLabel: draft.dataKeyId ? "Draft update" : "New draft",
          changedFields: diff.changedFields,
          changedFieldCount: diff.changedFields.length,
          diffPreview: diff.diffPreview,
          reviewGroupId: "entity:data_key",
          reviewGroupLabel: "Data Keys",
          conflictLabels: [],
          infoLabels: [],
          isStale: false,
          ageInDays: 0,
          parentHref: null,
        }
      }),
      ...pendingDeletionRows
        .filter(
          (row) =>
            (shouldIncludePendingDeletionRows({ filters, entityType: "script" }) && row.scriptId) ||
            (shouldIncludePendingDeletionRows({ filters, entityType: "screen" }) && row.screenId) ||
            (shouldIncludePendingDeletionRows({ filters, entityType: "diagnosis" }) && row.diagnosisId) ||
            (shouldIncludePendingDeletionRows({ filters, entityType: "problem" }) && row.problemId) ||
            (shouldIncludePendingDeletionRows({ filters, entityType: "config_key" }) && row.configKeyId) ||
            (shouldIncludePendingDeletionRows({ filters, entityType: "hospital" }) && row.hospitalId) ||
            (shouldIncludePendingDeletionRows({ filters, entityType: "drugs_library" }) && row.drugsLibraryItemId) ||
            (shouldIncludePendingDeletionRows({ filters, entityType: "data_key" }) && row.dataKeyId) ||
            (shouldIncludePendingDeletionRows({ filters, entityType: "alias" }) && row.aliasId),
        )
        .map((row): PendingDraftQueueEntry => {
          if (row.scriptId) {
            return {
              id: `delete:script:${row.scriptId}:${row.id}`,
              entityType: "script" as const,
              action: "delete" as const,
              title: row.script?.title || row.script?.printTitle || "Untitled Script",
              description: "Queued for deletion at next publish",
              entityId: row.scriptId,
              publishedEntityId: row.scriptId,
              href: `/script/${row.scriptId}`,
              searchHref: buildChangelogSearchHref(row.scriptId),
              createdAt: toIsoString(row.createdAt),
              createdByUserId: row.createdByUserId,
              createdByName: getCreatedByLabel(row.createdBy),
              createdByEmail: row.createdBy?.email || null,
              isUnpublished: false,
              source: "pending_deletion" as const,
              statusLabel: "Delete queued",
              changedFields: [],
              changedFieldCount: 0,
              diffPreview: [],
              reviewGroupId: `script:${row.scriptId}`,
              reviewGroupLabel: row.script?.title || row.script?.printTitle || "Script",
              conflictLabels: [],
              infoLabels: [],
              isStale: false,
              ageInDays: 0,
              parentHref: null,
            }
          }

          if (row.screenId) {
            return {
              id: `delete:screen:${row.screenId}:${row.id}`,
              entityType: "screen" as const,
              action: "delete" as const,
              title: row.screen?.title || row.screen?.sectionTitle || "Untitled Screen",
              description: "Queued for deletion at next publish",
              entityId: row.screenId,
              publishedEntityId: row.screenId,
              parentEntityId: row.screenScriptId,
              parentTitle: row.screenScript?.title || row.screenScript?.printTitle || null,
              href: row.screenScriptId ? `/script/${row.screenScriptId}/screen/${row.screenId}` : null,
              searchHref: buildChangelogSearchHref(row.screenId),
              createdAt: toIsoString(row.createdAt),
              createdByUserId: row.createdByUserId,
              createdByName: getCreatedByLabel(row.createdBy),
              createdByEmail: row.createdBy?.email || null,
              isUnpublished: false,
              source: "pending_deletion" as const,
              statusLabel: "Delete queued",
              changedFields: [],
              changedFieldCount: 0,
              diffPreview: [],
              reviewGroupId: row.screenScriptId ? `parent:${row.screenScriptId}` : `screen:${row.screenId}`,
              reviewGroupLabel: row.screenScript?.title || row.screenScript?.printTitle || "Ungrouped Screen Changes",
              conflictLabels: [],
              infoLabels: [],
              isStale: false,
              ageInDays: 0,
              parentHref: row.screenScriptId ? `/script/${row.screenScriptId}` : null,
            }
          }

          if (row.diagnosisId) {
            return {
              id: `delete:diagnosis:${row.diagnosisId}:${row.id}`,
              entityType: "diagnosis" as const,
              action: "delete" as const,
              title: row.diagnosis?.name || row.diagnosis?.key || "Untitled Diagnosis",
              description: "Queued for deletion at next publish",
              entityId: row.diagnosisId,
              publishedEntityId: row.diagnosisId,
              parentEntityId: row.diagnosisScriptId,
              parentTitle: row.diagnosisScript?.title || row.diagnosisScript?.printTitle || null,
              href: row.diagnosisScriptId ? `/script/${row.diagnosisScriptId}/diagnosis/${row.diagnosisId}` : null,
              searchHref: buildChangelogSearchHref(row.diagnosisId),
              createdAt: toIsoString(row.createdAt),
              createdByUserId: row.createdByUserId,
              createdByName: getCreatedByLabel(row.createdBy),
              createdByEmail: row.createdBy?.email || null,
              isUnpublished: false,
              source: "pending_deletion" as const,
              statusLabel: "Delete queued",
              changedFields: [],
              changedFieldCount: 0,
              diffPreview: [],
              reviewGroupId: row.diagnosisScriptId ? `parent:${row.diagnosisScriptId}` : `diagnosis:${row.diagnosisId}`,
              reviewGroupLabel: row.diagnosisScript?.title || row.diagnosisScript?.printTitle || "Ungrouped Diagnosis Changes",
              conflictLabels: [],
              infoLabels: [],
              isStale: false,
              ageInDays: 0,
              parentHref: row.diagnosisScriptId ? `/script/${row.diagnosisScriptId}` : null,
            }
          }

          if (row.problemId) {
            return {
              id: `delete:problem:${row.problemId}:${row.id}`,
              entityType: "problem" as const,
              action: "delete" as const,
              title: row.problem?.name || row.problem?.key || "Untitled Problem",
              description: "Queued for deletion at next publish",
              entityId: row.problemId,
              publishedEntityId: row.problemId,
              parentEntityId: row.problemScriptId,
              parentTitle: row.problemScript?.title || row.problemScript?.printTitle || null,
              href: row.problemScriptId ? `/script/${row.problemScriptId}/problem/${row.problemId}` : null,
              searchHref: buildChangelogSearchHref(row.problemId),
              createdAt: toIsoString(row.createdAt),
              createdByUserId: row.createdByUserId,
              createdByName: getCreatedByLabel(row.createdBy),
              createdByEmail: row.createdBy?.email || null,
              isUnpublished: false,
              source: "pending_deletion" as const,
              statusLabel: "Delete queued",
              changedFields: [],
              changedFieldCount: 0,
              diffPreview: [],
              reviewGroupId: row.problemScriptId ? `parent:${row.problemScriptId}` : `problem:${row.problemId}`,
              reviewGroupLabel: row.problemScript?.title || row.problemScript?.printTitle || "Ungrouped Problem Changes",
              conflictLabels: [],
              infoLabels: [],
              isStale: false,
              ageInDays: 0,
              parentHref: row.problemScriptId ? `/script/${row.problemScriptId}` : null,
            }
          }

          if (row.configKeyId) {
            return {
              id: `delete:config_key:${row.configKeyId}:${row.id}`,
              entityType: "config_key" as const,
              action: "delete" as const,
              title: row.configKey?.label || row.configKey?.key || "Untitled Config Key",
              description: "Queued for deletion at next publish",
              entityId: row.configKeyId,
              publishedEntityId: row.configKeyId,
              href: "/configuration",
              searchHref: buildChangelogSearchHref(row.configKeyId),
              createdAt: toIsoString(row.createdAt),
              createdByUserId: row.createdByUserId,
              createdByName: getCreatedByLabel(row.createdBy),
              createdByEmail: row.createdBy?.email || null,
              isUnpublished: false,
              source: "pending_deletion" as const,
              statusLabel: "Delete queued",
              changedFields: [],
              changedFieldCount: 0,
              diffPreview: [],
              reviewGroupId: "entity:config_key",
              reviewGroupLabel: "Configuration Keys",
              conflictLabels: [],
              infoLabels: [],
              isStale: false,
              ageInDays: 0,
              parentHref: null,
            }
          }

          if (row.hospitalId) {
            return {
              id: `delete:hospital:${row.hospitalId}:${row.id}`,
              entityType: "hospital" as const,
              action: "delete" as const,
              title: row.hospital?.name || "Untitled Hospital",
              description: "Queued for deletion at next publish",
              entityId: row.hospitalId,
              publishedEntityId: row.hospitalId,
              href: `/hospitals?hospitalId=${encodeURIComponent(row.hospitalId)}`,
              searchHref: buildChangelogSearchHref(row.hospitalId),
              createdAt: toIsoString(row.createdAt),
              createdByUserId: row.createdByUserId,
              createdByName: getCreatedByLabel(row.createdBy),
              createdByEmail: row.createdBy?.email || null,
              isUnpublished: false,
              source: "pending_deletion" as const,
              statusLabel: "Delete queued",
              changedFields: [],
              changedFieldCount: 0,
              diffPreview: [],
              reviewGroupId: "entity:hospital",
              reviewGroupLabel: "Hospitals",
              conflictLabels: [],
              infoLabels: [],
              isStale: false,
              ageInDays: 0,
              parentHref: null,
            }
          }

          if (row.drugsLibraryItemId) {
            return {
              id: `delete:drugs_library:${row.drugsLibraryItemId}:${row.id}`,
              entityType: "drugs_library" as const,
              action: "delete" as const,
              title: row.drugsLibraryItem?.drug || row.drugsLibraryItem?.key || "Untitled Drug",
              description: "Queued for deletion at next publish",
              entityId: row.drugsLibraryItemId,
              publishedEntityId: row.drugsLibraryItemId,
              href: `/drugs-fluids-and-feeds?itemId=${encodeURIComponent(row.drugsLibraryItemId)}`,
              searchHref: buildChangelogSearchHref(row.drugsLibraryItemId),
              createdAt: toIsoString(row.createdAt),
              createdByUserId: row.createdByUserId,
              createdByName: getCreatedByLabel(row.createdBy),
              createdByEmail: row.createdBy?.email || null,
              isUnpublished: false,
              source: "pending_deletion" as const,
              statusLabel: "Delete queued",
              changedFields: [],
              changedFieldCount: 0,
              diffPreview: [],
              reviewGroupId: "entity:drugs_library",
              reviewGroupLabel: "Drugs, Fluids, and Feeds",
              conflictLabels: [],
              infoLabels: [],
              isStale: false,
              ageInDays: 0,
              parentHref: null,
            }
          }

          if (row.dataKeyId) {
            return {
              id: `delete:data_key:${row.dataKeyId}:${row.id}`,
              entityType: "data_key" as const,
              action: "delete" as const,
              title: row.dataKey?.label || row.dataKey?.name || "Untitled Data Key",
              description: "Queued for deletion at next publish",
              entityId: row.dataKeyId,
              publishedEntityId: row.dataKeyId,
              href: `/data-keys/edit/${encodeURIComponent(row.dataKeyId)}`,
              searchHref: buildChangelogSearchHref(row.dataKeyId),
              createdAt: toIsoString(row.createdAt),
              createdByUserId: row.createdByUserId,
              createdByName: getCreatedByLabel(row.createdBy),
              createdByEmail: row.createdBy?.email || null,
              isUnpublished: false,
              source: "pending_deletion" as const,
              statusLabel: "Delete queued",
              changedFields: [],
              changedFieldCount: 0,
              diffPreview: [],
              reviewGroupId: "entity:data_key",
              reviewGroupLabel: "Data Keys",
              conflictLabels: [],
              infoLabels: [],
              isStale: false,
              ageInDays: 0,
              parentHref: null,
            }
          }

          return {
            id: `delete:alias:${row.aliasId}:${row.id}`,
            entityType: "alias" as const,
            action: "delete" as const,
            title: row.alias?.alias || row.alias?.name || "Alias",
            description: "Queued for deletion at next publish",
            entityId: row.aliasId || `alias-${row.id}`,
            publishedEntityId: row.aliasId,
            href: null,
            searchHref: buildChangelogSearchHref(row.aliasId),
            createdAt: toIsoString(row.createdAt),
            createdByUserId: row.createdByUserId,
            createdByName: getCreatedByLabel(row.createdBy),
            createdByEmail: row.createdBy?.email || null,
            isUnpublished: false,
            source: "pending_deletion" as const,
            statusLabel: "Delete queued",
            changedFields: [],
            changedFieldCount: 0,
            diffPreview: [],
            reviewGroupId: "entity:alias",
            reviewGroupLabel: "Aliases",
            conflictLabels: [],
            infoLabels: [],
            isStale: false,
            ageInDays: 0,
            parentHref: null,
          }
        }),
    ]

    const entityActionMap = new Map<string, Set<PendingDraftQueueAction>>()
    const parentDraftMap = new Set(
      entries.filter((entry) => entry.entityType === "script" && entry.source === "draft").map((entry) => entry.entityId),
    )
    const parentDeleteMap = new Set(
      entries
        .filter((entry) => entry.entityType === "script" && entry.action === "delete")
        .map((entry) => entry.publishedEntityId || entry.entityId),
    )

    for (const entry of entries) {
      const key = `${entry.entityType}:${entry.publishedEntityId || entry.entityId}`
      const actions = entityActionMap.get(key) || new Set<PendingDraftQueueAction>()
      actions.add(entry.action)
      entityActionMap.set(key, actions)
    }

    const enrichedEntries = entries.map((entry) => {
      const ageInDays = Math.floor((Date.now() - new Date(entry.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      const conflictLabels = [...entry.conflictLabels]
      const infoLabels = [...entry.infoLabels]
      const actionSet = entityActionMap.get(`${entry.entityType}:${entry.publishedEntityId || entry.entityId}`)

      if (actionSet?.has("delete") && (actionSet.has("update") || actionSet.has("create")) && entry.entityType !== "alias") {
        conflictLabels.push("Has both a draft and a delete queued")
      }

      if (entry.parentEntityId && parentDraftMap.has(entry.parentEntityId)) {
        infoLabels.push("Parent script also has a draft")
      }

      if (entry.parentEntityId && parentDeleteMap.has(entry.parentEntityId)) {
        conflictLabels.push("Parent script is queued for deletion")
      }

      if (ageInDays >= PENDING_DRAFT_STALE_DAYS) {
        infoLabels.push(`Stale for ${ageInDays} days`)
      }

      return {
        ...entry,
        ageInDays,
        isStale: ageInDays >= PENDING_DRAFT_STALE_DAYS,
        conflictLabels,
        infoLabels,
      }
    })

    const scopedEntries = params?.entryId ? enrichedEntries.filter((entry) => entry.id === params.entryId) : enrichedEntries

    const creatorCounts = scopedEntries.reduce<Record<string, { label: string; count: number }>>((acc, entry) => {
      const key = entry.createdByUserId || entry.createdByName
      if (!acc[key]) acc[key] = { label: entry.createdByName, count: 0 }
      acc[key].count += 1
      return acc
    }, {})

    const entityCounts = scopedEntries.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.entityType] = (acc[entry.entityType] || 0) + 1
      return acc
    }, {})
    const creatorOptions = Object.entries(creatorCounts)
      .map(([value, data]) => ({ value, label: data.label, count: data.count }))
      .sort((a, b) => a.label.localeCompare(b.label))
    const entityOptions = Object.entries(entityCounts)
      .map(([value, count]) => ({
        value: value as PendingDraftQueueEntityType,
        label: entityTypeLabels[value as PendingDraftQueueEntityType],
        count,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))

    let filteredEntries = scopedEntries.filter((entry) => {
      if (filters.tab !== "all" && filters.tab !== "mine" && entry.action !== actionLabelByTab[filters.tab]) return false
      if (filters.entityType !== "all" && entry.entityType !== filters.entityType) return false
      if (filters.creator !== "all" && (entry.createdByUserId || entry.createdByName) !== filters.creator) return false
      if (!filters.query) return true

      const query = filters.query.toLowerCase()
      return [
        entry.title,
        entry.description,
        entry.entityId,
        entry.parentTitle,
        entry.createdByName,
        entry.reviewGroupLabel,
        entityTypeLabels[entry.entityType],
        ...entry.changedFields,
        ...entry.conflictLabels,
      ]
        .filter(Boolean)
        .some((value) => `${value}`.toLowerCase().includes(query))
    })

    filteredEntries = filteredEntries.sort((left, right) => {
      if (filters.sort === "oldest") return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      if (filters.sort === "creator")
        return left.createdByName.localeCompare(right.createdByName) || right.createdAt.localeCompare(left.createdAt)
      if (filters.sort === "entity")
        return (
          entityTypeLabels[left.entityType].localeCompare(entityTypeLabels[right.entityType]) ||
          right.createdAt.localeCompare(left.createdAt)
        )
      if (filters.sort === "title") return left.title.localeCompare(right.title) || right.createdAt.localeCompare(left.createdAt)
      if (filters.sort === "action") return left.action.localeCompare(right.action) || right.createdAt.localeCompare(left.createdAt)
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    })

    const totalEntries = filteredEntries.length
    const totalPages = Math.max(1, Math.ceil(totalEntries / filters.pageSize))
    const page = Math.min(filters.page, totalPages)
    const startIndex = (page - 1) * filters.pageSize
    const pagedEntries = filteredEntries.slice(startIndex, startIndex + filters.pageSize)

    const uniqueEntities = new Set(scopedEntries.map((entry) => `${entry.entityType}:${entry.entityId}`)).size
    const totalDeletes = scopedEntries.filter((entry) => entry.action === "delete").length
    const totalCreates = scopedEntries.filter((entry) => entry.action === "create").length
    const totalUpdates = scopedEntries.filter((entry) => entry.action === "update").length
    const staleEntries = scopedEntries.filter((entry) => entry.isStale).length
    const conflictEntries = scopedEntries.filter((entry) => entry.conflictLabels.length > 0).length
    const tabCounts = {
      all: scopedEntries.length,
      creates: totalCreates,
      updates: totalUpdates,
      deletes: totalDeletes,
      mine: currentUserId ? scopedEntries.filter((entry) => entry.createdByUserId === currentUserId).length : 0,
    } satisfies Record<PendingDraftQueueTab, number>

    return {
      success: true,
      data: pagedEntries,
      summary: {
        totalEntries: totalEntries,
        totalDrafts: scopedEntries.filter((entry) => entry.source === "draft").length,
        totalDeletes,
        totalCreates,
        totalUpdates,
        uniqueEntities,
        entityCounts,
        scope: filters.scope,
        scopeLabel: filters.scope === "all" ? "Team publish queue" : "Your draft queue",
        staleEntries,
        conflictEntries,
      },
      meta: {
        filters: { ...filters, page },
        pagination: {
          page,
          pageSize: filters.pageSize,
          totalEntries,
          totalPages,
          returnedEntries: pagedEntries.length,
          hasPreviousPage: page > 1,
          hasNextPage: page < totalPages,
        },
        tabCounts,
        creators: creatorOptions,
        entityTypes: entityOptions,
      },
    }
  } catch (e: any) {
    logger.error("getPendingDraftQueue ERROR", e.message)
    return {
      success: false,
      data: [],
      summary: {
        totalEntries: 0,
        totalDrafts: 0,
        totalDeletes: 0,
        totalCreates: 0,
        totalUpdates: 0,
        uniqueEntities: 0,
        entityCounts: {},
        scope: "mine",
        scopeLabel: "Draft queue",
        staleEntries: 0,
        conflictEntries: 0,
      },
      meta: {
        filters: {
          scope: "mine",
          tab: "all",
          query: "",
          entityType: "all",
          creator: "all",
          sort: "recent",
          groupBy: "parent",
          page: 1,
          pageSize: PENDING_DRAFT_PAGE_SIZE,
        },
        pagination: {
          page: 1,
          pageSize: PENDING_DRAFT_PAGE_SIZE,
          totalEntries: 0,
          totalPages: 1,
          returnedEntries: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
        tabCounts: {
          all: 0,
          creates: 0,
          updates: 0,
          deletes: 0,
          mine: 0,
        },
        creators: [],
        entityTypes: [],
      },
      errors: [e.message],
    }
  }
}

export async function getEditorDetails(): Promise<{
  errors?: string[]
  shouldPublishData: boolean
  pendingDeletion: number
  myPendingDeletion: number
  drafts: typeof opsQueries.defaultCountDraftsData
  myDrafts: typeof opsQueries.defaultCountDraftsData
  myDraftQueueCount: number
  info: GetEditorInfoResults["data"]
}> {
  const errors: string[] = []
  let shouldPublishData = false
  try {
    const authenticatedUser = await getAuthenticatedUser()
    const editorInfo = await _getEditorInfo()
    editorInfo.errors?.forEach((e) => errors.push(e))

    const pendingDeletion = await opsQueries._countPendingDeletion()
    pendingDeletion.errors?.forEach((e) => errors.push(e))
    const currentUserId = authenticatedUser?.userId || null

    const { errors: draftsErrors, ...drafts } = await opsQueries._countDrafts()
    draftsErrors?.forEach((e) => errors.push(e))
    const { errors: myDraftsErrors, ...myDrafts } = currentUserId
      ? await opsQueries._countDrafts(currentUserId)
      : { ...opsQueries.defaultCountDraftsData, errors: undefined }
    myDraftsErrors?.forEach((e) => errors.push(e))
    const myPendingDeletion = currentUserId ? await opsQueries._countPendingDeletion(currentUserId) : { total: 0, errors: undefined }
    myPendingDeletion.errors?.forEach((e) => errors.push(e))

    const mode = "development"

    shouldPublishData = mode === "development" && (!!drafts.total || !!pendingDeletion.total)

    return {
      pendingDeletion: pendingDeletion.total,
      myPendingDeletion: myPendingDeletion.total,
      drafts,
      myDrafts,
      myDraftQueueCount: myDrafts.total + myPendingDeletion.total,
      errors: errors.length ? errors : undefined,
      shouldPublishData,
      info: editorInfo.data,
    }
  } catch (e: any) {
    logger.error("getEditorDetails ERROR", e.message)
    return {
      errors: [e.message, ...errors],
      pendingDeletion: 0,
      myPendingDeletion: 0,
      drafts: opsQueries.defaultCountDraftsData,
      myDrafts: opsQueries.defaultCountDraftsData,
      myDraftQueueCount: 0,
      shouldPublishData,
      info: null,
    }
  }
}

export const revalidatePath = async (path: Parameters<typeof _revalidatePath>[0], type?: Parameters<typeof _revalidatePath>[1]) =>
  _revalidatePath(path, type)

export const countAllDrafts = async () => {
  try {
    const configKeys = await configKeysQueries._countConfigKeys()
    const hospitals = await hospitalsQueries._countHospitals()
    const drugsLibraryItems = await drugsLibraryQueries._countDrugsLibraryItems()
    const dataKeys = await dataKeysQueries._countDataKeys()
    const screens = await scriptsQueries._countScreens()
    const scripts = await scriptsQueries._countScripts()
    const diagnoses = await scriptsQueries._countDiagnoses()
    const problems = await scriptsQueries._countProblems()

    return {
      configKeys: configKeys.data.allDrafts,
      hospitals: hospitals.data.allDrafts,
      drugsLibrary: drugsLibraryItems.data.allDrafts,
      screens: screens.data.allDrafts,
      scripts: scripts.data.allDrafts,
      diagnoses: diagnoses.data.allDrafts,
      problems: problems.data.allDrafts,
      dataKeys: dataKeys.data.allDrafts,
    }
  } catch (e: any) {
    logger.error("countAllDrafts ERROR", e.message)
    return {
      screens: 0,
      scripts: 0,
      configKeys: 0,
      hospitals: 0,
      diagnoses: 0,
      problems: 0,
    }
  }
}

export async function publishData({ scope }: { scope: number }) {
  const results: { success: boolean; errors?: string[] } = { success: true }
  try {
    const session = await isAllowed([
      "create_config_keys",
      "update_config_keys",
      "create_scripts",
      "update_scripts",
      "create_diagnoses",
      "update_diagnoses",
      "create_problems",
      "update_problems",
      "create_screens",
      "update_screens",
    ])

    const publisherUserId = session?.user?.userId || null

    let userId = publisherUserId

    if (scope === 1) userId = null

    await db.transaction(async (tx) => {
      const lockedEditor = await tx.execute<{ id: number; dataVersion: number }>(
        sql`select id, data_version as "dataVersion" from nt_editor_info limit 1 for update`,
      )
      const editor = lockedEditor?.[0]
      if (!editor?.id || !Number.isFinite(editor.dataVersion)) {
        throw new Error("Failed to lock editor info")
      }

      const nextDataVersion = Number(editor.dataVersion) + 1

      const publishConfigKeys = await configKeysMutations._publishConfigKeys({
        userId,
        publisherUserId,
        dataVersion: nextDataVersion,
        client: tx,
      })
      if (publishConfigKeys.errors?.length) throw new Error(publishConfigKeys.errors.join(", "))

      const publishHospitals = await hospitalsMutations._publishHospitals({
        userId,
        publisherUserId,
        dataVersion: nextDataVersion,
        client: tx,
      })
      if (publishHospitals.errors?.length) throw new Error(publishHospitals.errors.join(", "))

      const publishDrugsLibraryItems = await drugsLibraryMutations._publishDrugsLibraryItems({
        userId,
        publisherUserId,
        dataVersion: nextDataVersion,
        client: tx,
      })
      if (publishDrugsLibraryItems.errors?.length) throw new Error(publishDrugsLibraryItems.errors.join(", "))

      const publishDataKeys = await dataKeysMutations._publishDataKeys({
        userId,
        publisherUserId,
        dataVersion: nextDataVersion,
        client: tx,
      })
      if (publishDataKeys.errors?.length) throw new Error(publishDataKeys.errors.join(", "))

      const publishScripts = await scriptsMutations._publishScripts({
        userId,
        publisherUserId,
        dataVersion: nextDataVersion,
        client: tx,
      })
      if (publishScripts.errors?.length) throw new Error(publishScripts.errors.join(", "))

      const publishScreens = await scriptsMutations._publishScreens({
        userId,
        publisherUserId,
        dataVersion: nextDataVersion,
        client: tx,
      })
      if (publishScreens.errors?.length) throw new Error(publishScreens.errors.join(", "))

      const publishDiagnoses = await scriptsMutations._publishDiagnoses({
        userId,
        publisherUserId,
        dataVersion: nextDataVersion,
        client: tx,
      })
      if (publishDiagnoses.errors?.length) throw new Error(publishDiagnoses.errors.join(", "))

      const publishProblems = await scriptsMutations._publishProblems({
        userId,
        publisherUserId,
        dataVersion: nextDataVersion,
        client: tx,
      })
      if (publishProblems.errors?.length) throw new Error(publishProblems.errors.join(", "))

      const processPendingDeletion = await _processPendingDeletion({
        userId,
        publisherUserId: publisherUserId || undefined,
        client: tx,
      })
      if (processPendingDeletion.errors?.length) throw new Error(processPendingDeletion.errors.join(", "))

      await tx.update(editorInfo).set({ dataVersion: nextDataVersion, lastPublishDate: new Date() }).where(eq(editorInfo.id, editor.id))

      if (publisherUserId) {
        const releaseLog = await _saveChangeLog({
          data: buildReleasePublishChangeLog({
            dataVersion: nextDataVersion,
            userId: publisherUserId,
          }),
          client: tx,
        })

        if (!releaseLog.success) {
          throw new Error(releaseLog.errors?.join(", ") || "Failed to save release changelog")
        }
      }
    })

    socket.emit("data_changed", "publish_data")
  } catch (e: any) {
    results.success = false
    results.errors = [e.message]
    logger.error("publishData ERROR", e.message)
  } finally {
    return results
  }
}

export async function discardDrafts({ scope }: { scope: number }) {
  const results: { success: boolean; errors?: string[] } = { success: true }
  try {
    const session = await isAllowed(["delete_config_keys", "delete_scripts", "delete_diagnoses", "delete_diagnoses", "delete_screens"])

    let userId = session?.user?.userId

    if (scope === 1) userId = undefined

    await configKeysMutations._deleteAllConfigKeysDrafts({ userId })
    await hospitalsMutations._deleteAllHospitalsDrafts({ userId })
    await drugsLibraryMutations._deleteAllDrugsLibraryItemsDrafts({ userId })
    await dataKeysMutations._deleteAllDataKeysDrafts({ userId })
    await scriptsMutations._deleteAllScriptsDrafts({ userId })
    await scriptsMutations._deleteAllScreensDrafts({ userId })
    await scriptsMutations._deleteAllDiagnosesDrafts({ userId })
    await scriptsMutations._deleteAllProblemsDrafts({ userId })
    await _clearPendingDeletion({ userId })

    socket.emit("data_changed", "discard_drafts")
  } catch (e: any) {
    results.success = false
    results.errors = [e.message]
    logger.error("publishData ERROR", e.message)
  } finally {
    return results
  }
}
