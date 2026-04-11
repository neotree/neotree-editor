import { getRollbackSourceVersion } from "@/lib/changelog-rollback"

type SummaryLogUser = {
  name?: string | null
  email?: string | null
}

type SummaryChangeLog = {
  action: string
  entityType: string
  entityId: string
  version: number
  isActive: boolean
  dateOfChange?: Date | null
  description?: string | null
  changes?: any
}

type SummaryLogEntry = {
  changeLog: SummaryChangeLog
  user?: SummaryLogUser | null
}

export function buildDataVersionSummary(params: {
  dataVersion: number
  versionLogs: SummaryLogEntry[]
  latestDataVersion?: number | null
  latestVersionMap?: Map<string, number>
}) {
  const { dataVersion, versionLogs, latestDataVersion, latestVersionMap = new Map<string, number>() } = params
  const latestChange = versionLogs[0]
  const publishEntry =
    versionLogs.find((entry) => entry.changeLog.action === "publish" && entry.changeLog.entityType === "release") ||
    versionLogs.find((entry) => entry.changeLog.action === "publish") ||
    latestChange
  const rollbackEntry = versionLogs.find((entry) => entry.changeLog.action === "rollback")

  const entityCounts: Record<string, number> = {}
  const actionCounts: Record<string, number> = {}
  const descriptionsSet = new Set<string>()

  for (const entry of versionLogs) {
    const { entityType, action, description } = entry.changeLog
    entityCounts[entityType] = (entityCounts[entityType] || 0) + 1
    actionCounts[action] = (actionCounts[action] || 0) + 1
    if (description) descriptionsSet.add(description)
  }

  const hasActiveChanges = versionLogs.some((entry) => {
    const key = `${entry.changeLog.entityType}:${entry.changeLog.entityId}`
    const latestVersion = latestVersionMap.get(key)
    return latestVersion !== undefined ? entry.changeLog.version === latestVersion : entry.changeLog.isActive
  })

  return {
    dataVersion,
    publishedAt:
      publishEntry?.changeLog?.dateOfChange?.toISOString() ||
      latestChange?.changeLog?.dateOfChange?.toISOString() ||
      null,
    publishedByName: publishEntry?.user?.name || "Unknown user",
    publishedByEmail: publishEntry?.user?.email || undefined,
    totalChanges: versionLogs.length,
    hasActiveChanges,
    isLatestVersion: latestDataVersion ? dataVersion === latestDataVersion : false,
    entityCounts,
    actionCounts,
    descriptions: Array.from(descriptionsSet).slice(0, 5),
    rollbackSourceVersion: rollbackEntry ? getRollbackSourceVersion(rollbackEntry.changeLog.changes) : null,
  }
}
