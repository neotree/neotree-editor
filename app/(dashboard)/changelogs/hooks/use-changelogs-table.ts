"use client"

import { useState, useCallback, useEffect } from "react"
import axios from "axios"

import { useAlertModal } from "@/hooks/use-alert-modal"
import type { DataVersionSummary, getChangeLogSummaries } from "@/app/actions/change-logs"

export type UseChangelogsTableParams = {
  initialSummaries: DataVersionSummary[]
  initialPagination: Awaited<ReturnType<typeof getChangeLogSummaries>>["pagination"]
  activeDataVersion?: number | null
}

type Pagination = NonNullable<UseChangelogsTableParams["initialPagination"]>

const sortOptions = [
  { value: "publishedAt.desc", label: "Published (Newest)" },
  { value: "publishedAt.asc", label: "Published (Oldest)" },
  { value: "dataVersion.desc", label: "Data Version (High to Low)" },
  { value: "dataVersion.asc", label: "Data Version (Low to High)" },
  { value: "changeCount.desc", label: "Changes (High to Low)" },
  { value: "changeCount.asc", label: "Changes (Low to High)" },
]

export function useChangelogsTable({
  initialSummaries,
  initialPagination,
  activeDataVersion: initialActiveDataVersion,
}: UseChangelogsTableParams) {
  const [dataVersions, setDataVersions] = useState<DataVersionSummary[]>(initialSummaries)
  const [pagination, setPagination] = useState<Pagination | undefined>(initialPagination)
  const [loading, setLoading] = useState(false)
  const [activeDataVersion, setActiveDataVersion] = useState<number | null>(initialActiveDataVersion ?? null)

  const [searchValue, setSearchValue] = useState("")
  const [entityType, setEntityType] = useState("all")
  const [action, setAction] = useState("all")
  const [isActiveOnly, setIsActiveOnly] = useState(false)
  const [sort, setSort] = useState(sortOptions[0].value)

  const [currentPage, setCurrentPage] = useState(initialPagination?.page ?? 1)
  const [itemsPerPage] = useState(25)

  const { alert } = useAlertModal()

  const loadChangelogs = useCallback(async (pageOverride?: number) => {
    try {
      setLoading(true)
      const nextPage = pageOverride ?? currentPage

      const res = await axios.post("/api/changelogs/summary", {
        page: nextPage,
        limit: itemsPerPage,
        searchValue,
        entityType,
        action,
        isActiveOnly,
        sort,
      })

      const { errors, data, pagination: serverPagination, activeDataVersion: serverActiveVersion } = res.data

      if (errors?.length) {
        alert({
          title: "Error",
          message: "Failed to load changelogs: " + errors.join(", "),
          variant: "error",
        })
        return
      }

      setDataVersions(data)
      setPagination(serverPagination)
      setCurrentPage(nextPage)
      if (serverActiveVersion !== undefined) {
        setActiveDataVersion(serverActiveVersion ?? null)
      }
    } catch (e: any) {
      alert({
        title: "Error",
        message: "Failed to load changelogs: " + e.message,
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }, [alert, currentPage, itemsPerPage, searchValue, entityType, action, isActiveOnly, sort])

  useEffect(() => {
    setCurrentPage(1)
    loadChangelogs(1)
  }, [searchValue, entityType, action, isActiveOnly, sort, loadChangelogs])

  const clearFilters = useCallback(() => {
    setSearchValue("")
    setEntityType("all")
    setAction("all")
    setIsActiveOnly(false)
    setSort(sortOptions[0].value)
    setCurrentPage(1)
    loadChangelogs(1)
  }, [loadChangelogs])

  return {
    dataVersions,
    totalDataVersions: pagination?.total ?? dataVersions.length,
    loading,
    activeDataVersion,
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
