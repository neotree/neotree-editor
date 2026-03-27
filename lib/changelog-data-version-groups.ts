import type { ChangeLogType } from "@/databases/queries/changelogs/_get-change-logs"
import { normalizeChanges, resolveEntityTitle } from "@/lib/changelog-utils"

const SCRIPT_SCOPED_ENTITY_TYPES = new Set<ChangeLogType["entityType"]>(["script", "screen", "diagnosis", "problem"])

export type DataVersionGroupedChange = {
  changeLogId: string
  entityId: string
  entityType: ChangeLogType["entityType"]
  entityTitle: string
  action: ChangeLogType["action"]
  dateOfChange: ChangeLogType["dateOfChange"]
  fieldsChanged: number
  highlightedFields: string[]
  changeReason?: string | null
  description?: string | null
  scriptId?: string | null
}

export type DataVersionScriptGroup = {
  scriptId: string
  scriptTitle: string
  latestChangeAt: string | Date
  totalChanges: number
  entitiesAffected: number
  fieldsChanged: number
  screenChanges: number
  diagnosisChanges: number
  problemChanges: number
  scriptChanges: number
  changes: DataVersionGroupedChange[]
}

export type DataVersionGroupedView = {
  scriptGroups: DataVersionScriptGroup[]
  standaloneChanges: DataVersionGroupedChange[]
}

function toGroupedChange(change: ChangeLogType): DataVersionGroupedChange {
  const normalizedChanges = normalizeChanges(change)
  return {
    changeLogId: change.changeLogId,
    entityId: change.entityId,
    entityType: change.entityType,
    entityTitle: resolveEntityTitle(change),
    action: change.action,
    dateOfChange: change.dateOfChange,
    fieldsChanged: normalizedChanges.length,
    highlightedFields: normalizedChanges.slice(0, 3).map((entry) => entry.field),
    changeReason: change.changeReason,
    description: change.description,
    scriptId: change.scriptId,
  }
}

function compareByLatestChangeDesc(a: { latestChangeAt: string | Date }, b: { latestChangeAt: string | Date }) {
  return new Date(b.latestChangeAt).getTime() - new Date(a.latestChangeAt).getTime()
}

function compareChangeDesc(a: DataVersionGroupedChange, b: DataVersionGroupedChange) {
  return new Date(b.dateOfChange).getTime() - new Date(a.dateOfChange).getTime()
}

function buildFallbackScriptTitle(scriptId: string) {
  return `Script ${scriptId}`
}

function resolvePreferredScriptTitle(change: ChangeLogType, groupedChange: DataVersionGroupedChange) {
  const scriptTitle = change.scriptTitle?.trim()
  if (scriptTitle) return scriptTitle
  if (change.entityType === "script" && groupedChange.entityTitle.trim().length) return groupedChange.entityTitle.trim()
  return buildFallbackScriptTitle(change.scriptId!)
}

export function buildDataVersionGroupedView(changes: ChangeLogType[]): DataVersionGroupedView {
  const scriptGroups = new Map<string, DataVersionScriptGroup>()
  const standaloneChanges: DataVersionGroupedChange[] = []

  for (const change of changes) {
    const groupedChange = toGroupedChange(change)
    const isScriptScoped = !!change.scriptId && SCRIPT_SCOPED_ENTITY_TYPES.has(change.entityType)

    if (!isScriptScoped || !change.scriptId) {
      standaloneChanges.push(groupedChange)
      continue
    }

    const existing: DataVersionScriptGroup = scriptGroups.get(change.scriptId) || {
      scriptId: change.scriptId,
      scriptTitle: resolvePreferredScriptTitle(change, groupedChange),
      latestChangeAt: groupedChange.dateOfChange,
      totalChanges: 0,
      entitiesAffected: 0,
      fieldsChanged: 0,
      screenChanges: 0,
      diagnosisChanges: 0,
      problemChanges: 0,
      scriptChanges: 0,
      changes: [],
    }

    existing.totalChanges += 1
    existing.fieldsChanged += groupedChange.fieldsChanged
    const preferredScriptTitle = resolvePreferredScriptTitle(change, groupedChange)
    if (existing.scriptTitle === buildFallbackScriptTitle(change.scriptId) && preferredScriptTitle !== existing.scriptTitle) {
      existing.scriptTitle = preferredScriptTitle
    }
    existing.latestChangeAt =
      new Date(groupedChange.dateOfChange).getTime() > new Date(existing.latestChangeAt).getTime()
        ? groupedChange.dateOfChange
        : existing.latestChangeAt

    if (groupedChange.entityType === "screen") existing.screenChanges += 1
    if (groupedChange.entityType === "diagnosis") existing.diagnosisChanges += 1
    if (groupedChange.entityType === "problem") existing.problemChanges += 1
    if (groupedChange.entityType === "script") existing.scriptChanges += 1

    existing.changes.push(groupedChange)
    scriptGroups.set(change.scriptId, existing)
  }

  const grouped = Array.from(scriptGroups.values()).map((group) => {
    const uniqueEntities = new Set(group.changes.map((change) => `${change.entityType}:${change.entityId}`))
    return {
      ...group,
      entitiesAffected: uniqueEntities.size,
      changes: [...group.changes].sort(compareChangeDesc),
    }
  })

  return {
    scriptGroups: grouped.sort(compareByLatestChangeDesc),
    standaloneChanges: standaloneChanges.sort(compareChangeDesc),
  }
}
