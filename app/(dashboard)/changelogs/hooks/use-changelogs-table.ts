"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

import { useConfirmModal } from "@/hooks/use-confirm-modal"
import { useAlertModal } from "@/hooks/use-alert-modal"
import type { getChangeLogs } from "@/app/actions/change-logs"

export type UseChangelogsTableParams = {
  initialChangelogs: Awaited<ReturnType<typeof getChangeLogs>>["data"]
}

export type ChangeLogType = Awaited<ReturnType<typeof getChangeLogs>>["data"][0]

const defaultFilters = {
  searchTerm: "",
  entityType: "all",
  action: "all",
  startDate: null as Date | null,
  endDate: null as Date | null,
  isActiveOnly: false,
}

export function useChangelogsTable({ initialChangelogs }: UseChangelogsTableParams) {
  const [changelogs, setChangelogs] = useState<ChangeLogType[]>(initialChangelogs)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<number[]>([])
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [selectedChangelog, setSelectedChangelog] = useState<ChangeLogType | null>(null)
  const [entityHistory, setEntityHistory] = useState<ChangeLogType[]>([])

  const [filters, setFilters] = useState(defaultFilters)

  const router = useRouter()
  const { confirm } = useConfirmModal()
  const { alert } = useAlertModal()

  const loadChangelogs = useCallback(async () => {
    try {
      setLoading(true)

      const params: any = {
        limit: 100,
        sortBy: "dateOfChange",
        sortOrder: "desc",
      }

      const res = await axios.post("/api/changelogs/get", params)
      const { errors, data } = res.data

      if (errors?.length) throw new Error(errors.join(", "))

      setChangelogs(data)
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

  const onSearch = useCallback(async () => {
    try {
      setLoading(true)

      const params: any = {
        searchTerm: filters.searchTerm || undefined,
        entityTypes: filters.entityType !== "all" ? [filters.entityType] : undefined,
        actions: filters.action !== "all" ? [filters.action] : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        isActiveOnly: filters.isActiveOnly,
        limit: 100,
      }

      const res = await axios.post("/api/changelogs/search", params)
      const { errors, data } = res.data

      if (errors?.length) throw new Error(errors.join(", "))

      setChangelogs(data)
    } catch (e: any) {
      alert({
        title: "Error",
        message: "Failed to search changelogs: " + e.message,
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }, [alert, filters])

  const loadEntityHistory = useCallback(
    async (entityId: string, entityType: string) => {
      try {
        setLoading(true)

        const res = await axios.post("/api/changelogs/entity-history", {
          entityId,
          entityType,
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
    [alert],
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
        },
      )
    },
    [confirm, alert, router, loadChangelogs],
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

  const viewDetails = useCallback((changelog: ChangeLogType) => {
    setSelectedChangelog(changelog)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters)
    loadChangelogs()
  }, [loadChangelogs])

  useEffect(() => {
    if (selectedChangelog) {
      loadEntityHistory(selectedChangelog.entityId, selectedChangelog.entityType)
    }
  }, [selectedChangelog, loadEntityHistory])

  const disabled = useMemo(() => false, [])

  return {
    changelogs,
    loading,
    selected,
    disabled,
    expandedItems,
    selectedChangelog,
    entityHistory,
    filters,
    setChangelogs,
    setLoading,
    setSelected,
    setExpandedItems,
    setSelectedChangelog,
    setEntityHistory,
    setFilters,
    loadChangelogs,
    onSearch,
    loadEntityHistory,
    onRollback,
    onExport,
    toggleExpanded,
    viewDetails,
    clearFilters,
  }
}
