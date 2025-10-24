"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

import { useConfirmModal } from "@/hooks/use-confirm-modal"
import { useAlertModal } from "@/hooks/use-alert-modal"
import type { getChangeLogs } from "@/app/actions/change-logs"

export type UseChangelogsTableParams = {
  initialChangelogs: Awaited<ReturnType<typeof getChangeLogs>>["data"]
}

export type ChangeLogType = Awaited<ReturnType<typeof getChangeLogs>>["data"][0]

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

const sortOptions = [
  { value: "dateOfChange.desc", label: "Date (Newest)" },
  { value: "dateOfChange.asc", label: "Date (Oldest)" },
  { value: "version.desc", label: "Version (High to Low)" },
  { value: "version.asc", label: "Version (Low to High)" },
]

function paginateData<T>(
  data: T[],
  page: number,
  limit: number
): { data: T[]; pagination: Pagination } {
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

export function useChangelogsTable({ initialChangelogs }: UseChangelogsTableParams) {
  const [allChangelogs, setAllChangelogs] = useState<ChangeLogType[]>(initialChangelogs)
  const [loading, setLoading] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [selectedChangelog, setSelectedChangelog] = useState<ChangeLogType | null>(null)
  const [entityHistory, setEntityHistory] = useState<ChangeLogType[]>([])

  const [searchValue, setSearchValue] = useState("")
  const [entityType, setEntityType] = useState("all")
  const [action, setAction] = useState("all")
  const [isActiveOnly, setIsActiveOnly] = useState(false)
  const [sort, setSort] = useState(sortOptions[0].value)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)

  const router = useRouter()
  const { confirm } = useConfirmModal()
  const { alert } = useAlertModal()

  const loadChangelogs = useCallback(async () => {
    try {
      setLoading(true)

      const params: any = {
        limit: 1000, // Load all for client-side filtering
        sortBy: "dateOfChange",
        sortOrder: "desc",
      }

      const res = await axios.post("/api/changelogs/get", params)
      const { errors, data } = res.data

      if (errors?.length) {
        alert({
          title: "Error",
          message: "Failed to load changelogs: " + errors.join(", "),
          variant: "error",
        })
        return
      }

      setAllChangelogs(data)
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

  // Apply filters and search
  const filteredChangelogs = useMemo(() => {
    let filtered = [...allChangelogs]

    // Apply search
    if (searchValue) {
      const searchLower = searchValue.toLowerCase()
      filtered = filtered.filter((changelog) => {
        const searchableFields = [
          changelog.description || "",
          changelog.userName || "",
          changelog.entityId || "",
          changelog.changeReason || "",
        ].map((field) => field.toLowerCase())

        return searchableFields.some((field) => field.includes(searchLower))
      })
    }

    // Apply entity type filter
    if (entityType !== "all") {
      filtered = filtered.filter((changelog) => changelog.entityType === entityType)
    }

    // Apply action filter
    if (action !== "all") {
      filtered = filtered.filter((changelog) => changelog.action === action)
    }

    // Apply active only filter
    if (isActiveOnly) {
      filtered = filtered.filter((changelog) => changelog.isActive)
    }

    // Apply sorting
    const sortedData = sortChangelogs(filtered, sort)

    return sortedData
  }, [allChangelogs, searchValue, entityType, action, isActiveOnly, sort])

  // Paginate filtered data
  const { changelogs, pagination } = useMemo(() => {
    if (!filteredChangelogs.length) {
      return { changelogs: [], pagination: undefined }
    }

    const paginatedResult = paginateData(filteredChangelogs, currentPage, itemsPerPage)

    return {
      changelogs: paginatedResult.data,
      pagination: paginatedResult.pagination,
    }
  }, [filteredChangelogs, currentPage, itemsPerPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchValue, entityType, action, isActiveOnly, sort])

  const loadEntityHistory = useCallback(
    async (entityId: string, entityTypeParam: string) => {
      try {
        setLoading(true)

        const res = await axios.post("/api/changelogs/entity-history", {
          entityId,
          entityType: entityTypeParam,
          includeInactive: true,
          limit: 50,
        })

        const { errors, data } = res.data

        if (errors?.length) throw new Error(errors.join(", "))

        setEntityHistory(data)
      } catch (e: any) {
        alert({
          title: "Error",
          message: "Failed to load entity history: " + e.message,
          variant: "error",
        })
      } finally {
        setLoading(false)
      }
    },
    [alert]
  )

  const onRollback = useCallback(
    async (entityId: string, version: number, reason?: string) => {
      confirm(
        async () => {
          try {
            setLoading(true)

            const res = await axios.post("/api/changelogs/rollback", {
              entityId,
              toVersion: version,
              changeReason: reason || `Rolled back to version ${version}`,
            })

            const { errors, success } = res.data

            if (errors?.length) throw new Error(errors.join(", "))

            if (success) {
              alert({
                title: "Success",
                message: `Successfully rolled back to version ${version}`,
                variant: "success",
              })

              router.refresh()
              await loadChangelogs()
            }
          } catch (e: any) {
            alert({
              title: "Error",
              message: "Failed to rollback: " + e.message,
              variant: "error",
            })
          } finally {
            setLoading(false)
          }
        },
        {
          danger: true,
          title: "Rollback to version " + version,
          message: `Are you sure you want to rollback to version ${version}? This will create a new version with the previous state.`,
          positiveLabel: "Yes, rollback",
        }
      )
    },
    [confirm, alert, router, loadChangelogs]
  )

  const onExport = useCallback((changelog: ChangeLogType) => {
    const dataStr = JSON.stringify(changelog, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `changelog-${changelog.changeLogId}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [])

  const toggleExpanded = useCallback((id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const viewDetails = useCallback(
    (changelog: ChangeLogType) => {
      setSelectedChangelog(changelog)
      loadEntityHistory(changelog.entityId, changelog.entityType)
    },
    [loadEntityHistory]
  )

  const clearFilters = useCallback(() => {
    setSearchValue("")
    setEntityType("all")
    setAction("all")
    setIsActiveOnly(false)
    setSort(sortOptions[0].value)
    setCurrentPage(1)
  }, [])

  return {
    changelogs,
    loading,
    expandedItems,
    selectedChangelog,
    entityHistory,
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
    setExpandedItems,
    setSelectedChangelog,
    setEntityHistory,
    loadChangelogs,
    loadEntityHistory,
    onRollback,
    onExport,
    toggleExpanded,
    viewDetails,
    clearFilters,
  }
}

function sortChangelogs(changelogs: ChangeLogType[], sortValue: string) {
  let sorted = [...changelogs]

  const sortFn = ({
    key1,
    key2,
    sortDirection,
  }: {
    sortDirection: "asc" | "desc"
    key1: string | number
    key2: string | number
  }) => {
    let returnVal = 0

    if (sortDirection === "asc") {
      if (key1 < key2) returnVal = -1
      if (key1 > key2) returnVal = 1
    } else {
      if (key1 > key2) returnVal = -1
      if (key1 < key2) returnVal = 1
    }

    return returnVal
  }

  switch (sortValue) {
    case "dateOfChange.asc":
      sorted = changelogs.sort((c1, c2) =>
        sortFn({
          sortDirection: "asc",
          key1: new Date(c1.dateOfChange).getTime(),
          key2: new Date(c2.dateOfChange).getTime(),
        })
      )
      break

    case "dateOfChange.desc":
      sorted = changelogs.sort((c1, c2) =>
        sortFn({
          sortDirection: "desc",
          key1: new Date(c1.dateOfChange).getTime(),
          key2: new Date(c2.dateOfChange).getTime(),
        })
      )
      break

    case "version.asc":
      sorted = changelogs.sort((c1, c2) =>
        sortFn({
          sortDirection: "asc",
          key1: c1.version,
          key2: c2.version,
        })
      )
      break

    case "version.desc":
      sorted = changelogs.sort((c1, c2) =>
        sortFn({
          sortDirection: "desc",
          key1: c1.version,
          key2: c2.version,
        })
      )
      break

    default:
      sorted = changelogs.sort((c1, c2) =>
        sortFn({
          sortDirection: "desc",
          key1: new Date(c1.dateOfChange).getTime(),
          key2: new Date(c2.dateOfChange).getTime(),
        })
      )
  }

  return sorted
}