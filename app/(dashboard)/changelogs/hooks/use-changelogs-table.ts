"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import axios from "axios"

import { useAlertModal } from "@/hooks/use-alert-modal"
import type { getChangeLogs } from "@/app/actions/change-logs"

export type UseChangelogsTableParams = {
  initialChangelogs: Awaited<ReturnType<typeof getChangeLogs>>["data"]
}

export type ChangeLogType = Awaited<ReturnType<typeof getChangeLogs>>["data"][0]

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
  rollbackSourceVersion?: number | null
}

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

const sortOptions = [
  { value: "publishedAt.desc", label: "Published (Newest)" },
  { value: "publishedAt.asc", label: "Published (Oldest)" },
  { value: "dataVersion.desc", label: "Data Version (High to Low)" },
  { value: "dataVersion.asc", label: "Data Version (Low to High)" },
  { value: "changeCount.desc", label: "Changes (High to Low)" },
  { value: "changeCount.asc", label: "Changes (Low to High)" },
]

function paginateData<T>(data: T[], page: number, limit: number): { data: T[]; pagination: Pagination } {
  const total = data.length
  const totalPages = Math.ceil(total / limit)
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit

  return {
    data: data.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  }
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

export function useChangelogsTable({ initialChangelogs }: UseChangelogsTableParams) {
  const [allChangelogs, setAllChangelogs] = useState<ChangeLogType[]>(initialChangelogs)
  const [loading, setLoading] = useState(false)

  const [searchValue, setSearchValue] = useState("")
  const [entityType, setEntityType] = useState("all")
  const [action, setAction] = useState("all")
  const [isActiveOnly, setIsActiveOnly] = useState(false)
  const [sort, setSort] = useState(sortOptions[0].value)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(25)

  const { alert } = useAlertModal()

  const loadChangelogs = useCallback(async () => {
    try {
      setLoading(true)

      const pageSize = 2000
      let offset = 0
      let total = 0
      const aggregated: ChangeLogType[] = []

      do {
        const res = await axios.post("/api/changelogs/get", {
          limit: pageSize,
          offset,
          sortBy: "dateOfChange",
          sortOrder: "desc",
        })

        const { errors, data, total: responseTotal } = res.data

        if (errors?.length) {
          alert({
            title: "Error",
            message: "Failed to load changelogs: " + errors.join(", "),
            variant: "error",
          })
          return
        }

        if (!Array.isArray(data) || data.length === 0) {
          break
        }

        aggregated.push(...data)
        total = Number.isFinite(responseTotal) ? Number(responseTotal) : aggregated.length
        offset = aggregated.length
      } while (offset < total)

      setAllChangelogs(aggregated)
    } catch (e: any) {
      alert({
        title: "Error",
        message: "Failed to load changelogs: " + e.message,
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }, [alert])

  const dataVersionSummaries = useMemo((): DataVersionSummary[] => {
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
    const latestVersion = versionNumbers.length ? Math.max(...versionNumbers) : null

    for (const [dataVersion, changeLogs] of Array.from(grouped.entries())) {
      if (!changeLogs.length) continue

      const sortedByDate = [...changeLogs].sort(
        (a, b) => new Date(b.dateOfChange).getTime() - new Date(a.dateOfChange).getTime()
      )

      const latestChange = sortedByDate[0]
      const publishEntry =
        changeLogs.find((entry) => entry.action === "publish" && entry.entityType === "release") ??
        changeLogs.find((entry) => entry.action === "publish" && entry.entityType !== "release") ??
        latestChange
      const rollbackEntry = changeLogs.find((entry) => entry.action === "rollback")
      const summaryChanges = changeLogs.filter((entry) => entry.entityType !== "release")
      const rollbackSourceVersion = rollbackEntry?.changes && Array.isArray(rollbackEntry.changes)
        ? (() => {
            const match = (rollbackEntry.changes as any[]).find(
              (c) => Number.isFinite((c as any)?.toDataVersion) || Number.isFinite((c as any)?.toVersion),
            ) as any
            return Number.isFinite(match?.toDataVersion)
              ? match.toDataVersion
              : Number.isFinite(match?.toVersion)
                ? match.toVersion
                : null
          })()
        : null

      const entityCounts = summaryChanges.reduce<Record<string, number>>((result, entry) => {
        result[entry.entityType] = (result[entry.entityType] || 0) + 1
        return result
      }, {})

      const actionCounts = summaryChanges.reduce<Record<string, number>>((result, entry) => {
        result[entry.action] = (result[entry.action] || 0) + 1
        return result
      }, {})

      const descriptions = Array.from(
        new Set<string>(
          summaryChanges
            .map((entry) => entry.description?.trim() || "")
            .filter((description) => description.length > 0)
        )
      ).slice(0, 5)

      summaries.push({
        dataVersion,
        publishedAt: latestChange?.dateOfChange ? new Date(latestChange.dateOfChange).toISOString() : null,
        publishedByName: publishEntry?.userName || latestChange?.userName || "Unknown user",
        publishedByEmail: publishEntry?.userEmail || latestChange?.userEmail || undefined,
        totalChanges: summaryChanges.length,
        hasActiveChanges: summaryChanges.some((entry) => entry.isActive),
        isLatestVersion: latestVersion !== null ? dataVersion === latestVersion : false,
        entityCounts,
        actionCounts,
        descriptions,
        changeLogIds: summaryChanges.map((entry) => entry.changeLogId),
        changes: summaryChanges,
        rollbackSourceVersion,
      })
    }

    return summaries.sort((a, b) => b.dataVersion - a.dataVersion)
  }, [allChangelogs])

  const filteredSummaries = useMemo((): DataVersionSummary[] => {
    let filtered = [...dataVersionSummaries]

    if (searchValue) {
      const query = searchValue.toLowerCase()
      filtered = filtered.filter((summary) => {
        const versionLabel = `v${summary.dataVersion}`.toLowerCase()
        if (versionLabel.includes(query)) return true
        if (summary.publishedByName?.toLowerCase().includes(query)) return true
        if (summary.publishedByEmail?.toLowerCase().includes(query)) return true
        if (summary.descriptions.some((desc) => desc.toLowerCase().includes(query))) return true

        return summary.changes.some((change) => {
          return [
            change.description || "",
            change.entityId || "",
            change.changeReason || "",
            change.userName || "",
            change.userEmail || "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
        })
      })
    }

    if (entityType !== "all") {
      filtered = filtered.filter((summary) => summary.changes.some((change) => change.entityType === entityType))
    }

    if (action !== "all") {
      filtered = filtered.filter((summary) => summary.changes.some((change) => change.action === action))
    }

    if (isActiveOnly) {
      filtered = filtered.filter((summary) => summary.isLatestVersion)
    }

    return sortDataVersions(filtered, sort)
  }, [dataVersionSummaries, searchValue, entityType, action, isActiveOnly, sort])

  const { data: dataVersions, pagination } = useMemo(() => {
    if (!filteredSummaries.length) {
      return { data: [] as DataVersionSummary[], pagination: undefined as Pagination | undefined }
    }

    const paginatedResult = paginateData(filteredSummaries, currentPage, itemsPerPage)
    return {
      data: paginatedResult.data,
      pagination: paginatedResult.pagination,
    }
  }, [filteredSummaries, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchValue, entityType, action, isActiveOnly, sort])

  useEffect(() => {
    loadChangelogs()
  }, [loadChangelogs])

  const clearFilters = useCallback(() => {
    setSearchValue("")
    setEntityType("all")
    setAction("all")
    setIsActiveOnly(false)
    setSort(sortOptions[0].value)
    setCurrentPage(1)
  }, [])

  return {
    dataVersions,
    totalDataVersions: filteredSummaries.length,
    loading,
    searchValue,
    entityType,
    action,
    isActiveOnly,
    sort,
    pagination,
    currentPage,
    itemsPerPage,
    sortOptions,
    setSearchValue,
    setEntityType,
    setAction,
    setIsActiveOnly,
    setSort,
    setCurrentPage,
    loadChangelogs,
    clearFilters,
  }
}

function sortDataVersions(dataVersions: DataVersionSummary[], sortValue: string) {
  const sorted = [...dataVersions]

  const compareDates = (a: string | null, b: string | null) => {
    const timeA = a ? new Date(a).getTime() : 0
    const timeB = b ? new Date(b).getTime() : 0
    return timeA - timeB
  }

  switch (sortValue) {
    case "publishedAt.asc":
      return sorted.sort((a, b) => compareDates(a.publishedAt, b.publishedAt))

    case "publishedAt.desc":
      return sorted.sort((a, b) => compareDates(b.publishedAt, a.publishedAt))

    case "dataVersion.asc":
      return sorted.sort((a, b) => a.dataVersion - b.dataVersion)

    case "dataVersion.desc":
      return sorted.sort((a, b) => b.dataVersion - a.dataVersion)

    case "changeCount.asc":
      return sorted.sort((a, b) => a.totalChanges - b.totalChanges)

    case "changeCount.desc":
      return sorted.sort((a, b) => b.totalChanges - a.totalChanges)

    default:
      return sorted.sort((a, b) => compareDates(b.publishedAt, a.publishedAt))
  }
}
