"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import axios from "axios"

import { useAlertModal } from "@/hooks/use-alert-modal"
import type { getChangeLogs, getDataVersionSummaries } from "@/app/actions/change-logs"

export type UseChangelogsTableParams = {
  initialSummaries?: Awaited<ReturnType<typeof getDataVersionSummaries>>["data"]
  initialTotal?: number
  initialLatestDataVersion?: number | null
  initialSearchValue?: string
  initialEntityType?: string
  initialAction?: string
  initialSort?: string
  initialPage?: number
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
  { value: "dataVersion.desc", label: "Published Version (High to Low)" },
  { value: "dataVersion.asc", label: "Published Version (Low to High)" },
  { value: "changeCount.desc", label: "Changes (High to Low)" },
  { value: "changeCount.asc", label: "Changes (Low to High)" },
]

function sanitizeChoice(value: string | undefined, fallback: string) {
  return typeof value === "string" && value.trim().length ? value.trim() : fallback
}

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
  initialSearchValue = "",
  initialEntityType = "all",
  initialAction = "all",
  initialSort = sortOptions[0].value,
  initialPage = 1,
}: UseChangelogsTableParams) {
  const [dataVersions, setDataVersions] = useState<DataVersionSummary[]>(initialSummaries)
  const [totalDataVersions, setTotalDataVersions] = useState<number>(initialTotal)
  const [latestDataVersion, setLatestDataVersion] = useState<number | null>(initialLatestDataVersion)
  const [detailsByVersion, setDetailsByVersion] = useState<Record<number, ChangeLogType[]>>({})
  const [detailsLoadingByVersion, setDetailsLoadingByVersion] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(false)

  const [searchValue, setSearchValue] = useState(initialSearchValue)
  // Queries only fire against the debounced value so typing doesn't hit the API per keystroke
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(initialSearchValue)
  const [entityType, setEntityType] = useState(sanitizeChoice(initialEntityType, "all"))
  const [action, setAction] = useState(sanitizeChoice(initialAction, "all"))
  const [sort, setSort] = useState(
    sortOptions.some((option) => option.value === initialSort) ? initialSort : sortOptions[0].value,
  )

  const [currentPage, setCurrentPage] = useState(Math.max(1, Number(initialPage) || 1))
  const [itemsPerPage] = useState(25)

  const { alert } = useAlertModal()

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearchValue(searchValue), 300)
    return () => clearTimeout(handle)
  }, [searchValue])

  const loadSummaries = useCallback(async () => {
    try {
      setLoading(true)

      const parsedVersion = parseVersionSearch(debouncedSearchValue)
      const [sortKey, sortDir] = sort.split(".")

      const limit = itemsPerPage
      const offset = (currentPage - 1) * itemsPerPage

      const res = await axios.post("/api/changelogs/summaries", {
        limit,
        offset,
        searchTerm: parsedVersion ? undefined : debouncedSearchValue || undefined,
        dataVersions: parsedVersion ? [parsedVersion] : undefined,
        entityTypes: entityType !== "all" ? [entityType] : undefined,
        actions: action !== "all" ? [action] : undefined,
        sortBy: sortKey || "publishedAt",
        sortOrder: sortDir || "desc",
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
  }, [alert, action, currentPage, debouncedSearchValue, entityType, itemsPerPage, sort])

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

  const isFirstFilterRender = useRef(true)
  useEffect(() => {
    // Skip on mount so an initial page from the URL isn't immediately reset
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false
      return
    }
    setCurrentPage(1)
  }, [debouncedSearchValue, entityType, action, sort])

  useEffect(() => {
    loadSummaries()
  }, [loadSummaries])

  // Keep filters shareable/bookmarkable without triggering a navigation
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const setOrDelete = (key: string, value: string, defaultValue: string) => {
      if (value && value !== defaultValue) params.set(key, value)
      else params.delete(key)
    }

    setOrDelete("q", debouncedSearchValue.trim(), "")
    setOrDelete("entityType", entityType, "all")
    setOrDelete("action", action, "all")
    setOrDelete("sort", sort, sortOptions[0].value)
    setOrDelete("page", String(currentPage), "1")

    const query = params.toString()
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`)
  }, [action, currentPage, debouncedSearchValue, entityType, sort])

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
    sort,
    pagination,
    currentPage,
    itemsPerPage,
    sortOptions,
    setSearchValue,
    setEntityType,
    setAction,
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
