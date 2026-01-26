"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import axios from "axios"

import { useAlertModal } from "@/hooks/use-alert-modal"
import type { getChangeLogs, getDataVersionSummaries } from "@/app/actions/change-logs"

export type UseChangelogsTableParams = {
  initialSummaries?: Awaited<ReturnType<typeof getDataVersionSummaries>>["data"]
  initialTotal?: number
  initialLatestDataVersion?: number | null
}

export type ChangeLogType = Awaited<ReturnType<typeof getChangeLogs>>["data"][0]

export type DataVersionSummary = Awaited<ReturnType<typeof getDataVersionSummaries>>["data"][0]

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

function parseVersionSearch(value: string): number | null {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return null
  const match = /^v?\d+$/.exec(trimmed)
  if (!match) return null
  const parsed = Number(trimmed.replace(/^v/, ""))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export function useChangelogsTable({
  initialSummaries = [],
  initialTotal = 0,
  initialLatestDataVersion = null,
}: UseChangelogsTableParams) {
  const [dataVersions, setDataVersions] = useState<DataVersionSummary[]>(initialSummaries)
  const [totalDataVersions, setTotalDataVersions] = useState<number>(initialTotal)
  const [latestDataVersion, setLatestDataVersion] = useState<number | null>(initialLatestDataVersion)
  const [detailsByVersion, setDetailsByVersion] = useState<Record<number, ChangeLogType[]>>({})
  const [detailsLoadingByVersion, setDetailsLoadingByVersion] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(false)

  const [searchValue, setSearchValue] = useState("")
  const [entityType, setEntityType] = useState("all")
  const [action, setAction] = useState("all")
  const [isActiveOnly, setIsActiveOnly] = useState(false)
  const [applyFiltersToCounts, setApplyFiltersToCounts] = useState(false)
  const [sort, setSort] = useState(sortOptions[0].value)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(25)

  const { alert } = useAlertModal()

  const loadSummaries = useCallback(async () => {
    try {
      setLoading(true)

      const parsedVersion = parseVersionSearch(searchValue)
      const [sortKey, sortDir] = sort.split(".")

      const limit = isActiveOnly ? 1 : itemsPerPage
      const offset = isActiveOnly ? 0 : (currentPage - 1) * itemsPerPage

      const res = await axios.post("/api/changelogs/summaries", {
        limit,
        offset,
        searchTerm: parsedVersion ? undefined : searchValue || undefined,
        dataVersions: parsedVersion ? [parsedVersion] : undefined,
        entityTypes: entityType !== "all" ? [entityType] : undefined,
        actions: action !== "all" ? [action] : undefined,
        applyFiltersToCounts,
        sortBy: sortKey || "publishedAt",
        sortOrder: sortDir || "desc",
        latestOnly: isActiveOnly,
      })

      const { errors, data, total, latestDataVersion: latest } = res.data

      if (errors?.length) {
        alert({
          title: "Error",
          message: "Failed to load changelog summaries: " + errors.join(", "),
          variant: "error",
        })
        return
      }

      setDataVersions(Array.isArray(data) ? data : [])
      setTotalDataVersions(Number.isFinite(total) ? Number(total) : 0)
      setLatestDataVersion(Number.isFinite(latest) ? Number(latest) : null)
    } catch (e: any) {
      alert({
        title: "Error",
        message: "Failed to load changelog summaries: " + e.message,
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }, [alert, action, applyFiltersToCounts, currentPage, entityType, isActiveOnly, itemsPerPage, searchValue, sort])

  const pagination = useMemo(() => {
    if (!totalDataVersions) return undefined
    const totalPages = Math.max(1, Math.ceil(totalDataVersions / itemsPerPage))
    return {
      page: currentPage,
      limit: itemsPerPage,
      total: totalDataVersions,
      totalPages,
    }
  }, [currentPage, itemsPerPage, totalDataVersions])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchValue, entityType, action, isActiveOnly, sort, applyFiltersToCounts])

  useEffect(() => {
    loadSummaries()
  }, [loadSummaries])

  useEffect(() => {
    if (!pagination) return
    if (currentPage > pagination.totalPages) {
      setCurrentPage(1)
    }
  }, [currentPage, pagination])

  const loadVersionDetails = useCallback(
    async (dataVersion: number) => {
      if (detailsByVersion[dataVersion] || detailsLoadingByVersion[dataVersion]) return

      try {
        setDetailsLoadingByVersion((prev) => ({ ...prev, [dataVersion]: true }))

        const pageSize = 2000
        let offset = 0
        let total = 0
        const aggregated: ChangeLogType[] = []

        do {
          const res = await axios.post("/api/changelogs/get", {
            limit: pageSize,
            offset,
            dataVersions: [dataVersion],
            sortBy: "dateOfChange",
            sortOrder: "desc",
          })

          const { errors, data, total: responseTotal } = res.data

          if (errors?.length) {
            alert({
              title: "Error",
              message: "Failed to load changelog details: " + errors.join(", "),
              variant: "error",
            })
            return
          }

          if (!Array.isArray(data) || data.length === 0) {
            break
          }

          aggregated.push(...data.filter((entry: ChangeLogType) => entry.entityType !== "release"))
          total = Number.isFinite(responseTotal) ? Number(responseTotal) : aggregated.length
          offset = aggregated.length
        } while (offset < total)

        setDetailsByVersion((prev) => ({ ...prev, [dataVersion]: aggregated }))
      } catch (e: any) {
        alert({
          title: "Error",
          message: "Failed to load changelog details: " + e.message,
          variant: "error",
        })
      } finally {
        setDetailsLoadingByVersion((prev) => ({ ...prev, [dataVersion]: false }))
      }
    },
    [alert, detailsByVersion, detailsLoadingByVersion],
  )

  const clearFilters = useCallback(() => {
    setSearchValue("")
    setEntityType("all")
    setAction("all")
    setIsActiveOnly(false)
    setApplyFiltersToCounts(false)
    setSort(sortOptions[0].value)
    setCurrentPage(1)
  }, [])

  return {
    dataVersions,
    totalDataVersions,
    loading,
    searchValue,
    entityType,
    action,
    isActiveOnly,
    applyFiltersToCounts,
    sort,
    pagination,
    currentPage,
    itemsPerPage,
    sortOptions,
    setSearchValue,
    setEntityType,
    setAction,
    setIsActiveOnly,
    setApplyFiltersToCounts,
    setSort,
    setCurrentPage,
    loadChangelogs: loadSummaries,
    clearFilters,
    latestDataVersion,
    detailsByVersion,
    detailsLoadingByVersion,
    loadVersionDetails,
  }
}
