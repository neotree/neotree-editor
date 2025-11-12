"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { arrayMoveImmutable } from "array-move"

import { useConfirmModal } from "@/hooks/use-confirm-modal"
import { useAlertModal } from "@/hooks/use-alert-modal"
import { useScriptsContext, type IScriptsContext } from "@/contexts/scripts"
import { useAppContext } from "@/contexts/app"
import type { ScriptsSearchResultsItem, ScriptsSearchResultsFilter } from "@/lib/scripts-search"
import { pendingChangesAPI } from "@/lib/indexed-db"
import { recordPendingDeletionChange } from "@/lib/change-tracker"

export type UseScriptsTableParams = {
  scripts: Awaited<ReturnType<IScriptsContext["getScripts"]>>
}

const defaultSearchState = {
  value: "",
  filter: "all" as ScriptsSearchResultsFilter,
  searching: false,
  results: [] as ScriptsSearchResultsItem[],
  unfilteredResults: [] as ScriptsSearchResultsItem[],
}

export function useScriptsTable({ scripts: scriptsParam }: UseScriptsTableParams) {
  const [scripts, setScripts] = useState(scriptsParam)
  const [selected, setSelected] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [scriptsIdsToExport, setScriptsIdsToExport] = useState<string[]>([])

  const [search, setSearch] = useState(defaultSearchState)
  const clearSearch = useCallback(() => setSearch(defaultSearchState), [])

  useEffect(() => {
    setScripts(scriptsParam)
  }, [scriptsParam])

  const router = useRouter()
  const { viewOnly, authenticatedUser } = useAppContext()
  const { confirm } = useConfirmModal()
  const { alert } = useAlertModal()

  const { deleteScripts, saveScripts, copyScripts } = useScriptsContext()

  const onDelete = useCallback(
    async (scriptsIds: string[]) => {
      confirm(
        async () => {
          const _scripts = { ...scripts }
          const scriptsToDelete = scripts.data.filter((s) => s.scriptId && scriptsIds.includes(s.scriptId))

          setScripts((prev) => ({ ...prev, data: prev.data.filter((s) => !scriptsIds.includes(s.scriptId)) }))
          setSelected([])

          setLoading(true)

          // const res = await deleteScripts({ scriptsIds, broadcastAction: true, });

          // TODO: Replace this with server action
          const response = await axios.delete(
            "/api/scripts?data=" + JSON.stringify({ scriptsIds, broadcastAction: true }),
          )
          const res = response.data as Awaited<ReturnType<typeof deleteScripts>>

          if (res.errors?.length) {
            alert({
              title: "Error",
              message: res.errors.join(", "),
              variant: "error",
              onClose: () => setScripts(_scripts),
            })
          } else {
            await Promise.all(
              scriptsToDelete.map(async (script) => {
                if (!script?.scriptId) return
                await recordPendingDeletionChange({
                  entityId: script.scriptId,
                  entityType: "script",
                  entityTitle: script.title || script.printTitle || "Untitled Script",
                  snapshot: script,
                  userId: authenticatedUser?.userId,
                  userName: authenticatedUser?.displayName,
                  description: `Marked "${script.title || script.printTitle || "Untitled Script"}" for deletion`,
                })
              }),
            )
            setSelected([])
            router.refresh()
            alert({
              title: "Success",
              message: "Scripts deleted successfully!",
              variant: "success",
            })
          }

          setLoading(false)
        },
        {
          danger: true,
          title: "Delete scripts",
          message: "Are you sure you want to delete scripts?",
          positiveLabel: "Yes, delete",
        },
      )
    },
    [deleteScripts, confirm, alert, router, scripts, authenticatedUser?.userId, authenticatedUser?.displayName],
  )

  const onSort = useCallback(
    async (oldIndex: number, newIndex: number, sortedIndexes: { oldIndex: number; newIndex: number }[]) => {
      const payload: { scriptId: string; position: number }[] = []

      const sorted = arrayMoveImmutable([...scripts.data], oldIndex, newIndex).map((s, i) => {
        const newPosition = scripts.data[i].position
        if (newPosition !== s.position) payload.push({ scriptId: s.scriptId, position: newPosition })
        return {
          ...s,
          position: newPosition,
        }
      })

      setScripts((prev) => ({ ...prev, data: sorted }))

      for (const change of payload) {
        const script = scripts.data.find((s) => s.scriptId === change.scriptId)
        if (script) {
          await pendingChangesAPI.addChange({
            entityId: change.scriptId,
            entityType: "script",
            entityTitle: script.title || script.printTitle || "Untitled Script",
            action: "update",
            fieldPath: "position",
            fieldName: "position",
            oldValue: script.position,
            newValue: change.position,
            description: `Position changed from ${script.position} to ${change.position}`,
            userId: authenticatedUser?.userId,
            userName: authenticatedUser?.displayName,
          })
        }
      }

      // TODO: Replace this with server action
      await axios.post("/api/scripts/save", { data: payload, broadcastAction: true })

      router.refresh()
    },
    [saveScripts, scripts, router, authenticatedUser?.userId, authenticatedUser?.displayName],
  )

  const onDuplicate = useCallback(
    async (scriptsIds: string[]) => {
      scriptsIds = scriptsIds.filter((s) => s)
      const titles = scriptsIds.map((id) => scripts.data.filter((s) => s.scriptId === id)[0]?.title || "")

      confirm(
        async () => {
          try {
            if (!scriptsIds.length) throw new Error("No scripts selected")

            setLoading(true)

            // const res = await copyScripts({
            //     scriptsIds,
            //     broadcastAction: true,
            // });

            // TODO: Replace this with server action
            const response = await axios.post("/api/scripts/copy", {
              scriptsIds,
              broadcastAction: true,
            })
            const res = response.data as Awaited<ReturnType<typeof copyScripts>>

            if (res.errors?.length) throw new Error(res.errors.join(", "))

            router.refresh()

            alert({
              variant: "success",
              title: "Success",
              message: "Scripts duplicated successfully!",
            })
          } catch (e: any) {
            alert({
              variant: "error",
              title: "Error",
              message: "Failed to duplicate scripts: " + e.message,
            })
          } finally {
            setLoading(false)
          }
        },
        {
          title: "Duplicate script",
          message: `<p>Are you sure you want to duplicate: ${titles.map((s) => `<div><b>${s}</b></div>`).join("")}`,
          positiveLabel: "Yes, duplicate",
        },
      )
    },
    [confirm, copyScripts, alert, router, scripts],
  )

  const disabled = useMemo(() => viewOnly, [viewOnly])
  const scriptsToExport = useMemo(
    () => scripts.data.filter((t) => scriptsIdsToExport.includes(t.scriptId)),
    [scriptsIdsToExport, scripts],
  )

  const onSearch = useCallback(
    async (value: string) => {
      try {
        clearSearch()
        if (value) {
          setSearch((prev) => ({ ...prev, searching: true }))

          const { data: res } = await axios.get<{ data: ScriptsSearchResultsItem[] }>(
            `/api/scripts/search?searchValue=${value}`,
          )

          setSearch((prev) => ({
            value,
            filter: prev.filter,
            searching: false,
            results: res.data,
            unfilteredResults: res.data,
          }))
        }
      } catch (e: any) {
        clearSearch()
      }
    },
    [clearSearch],
  )

  const scriptsArr = useMemo(() => {
    return scripts.data.filter((s) => {
      if (!search.value) return true
      return search.results.map((s) => s.scriptId).includes(s.scriptId)
    })
  }, [scripts.data, search])

  return {
    scripts,
    selected,
    loading,
    scriptsIdsToExport,
    disabled,
    scriptsToExport,
    search,
    scriptsArr,
    setSearch,
    clearSearch,
    onSearch,
    setScripts,
    setSelected,
    setLoading,
    setScriptsIdsToExport,
    onDelete,
    onSort,
    onDuplicate,
  }
}
