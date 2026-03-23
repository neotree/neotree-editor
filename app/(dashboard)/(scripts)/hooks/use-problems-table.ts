"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { arrayMoveImmutable } from "array-move"

import { useConfirmModal } from "@/hooks/use-confirm-modal"
import { useAlertModal } from "@/hooks/use-alert-modal"
import { useScriptsContext, type IScriptsContext } from "@/contexts/scripts"
import { useAppContext } from "@/contexts/app"
import {
  type ScriptsSearchResultsItem,
  type ScriptsSearchResultsFilter,
  filterScriptsSearchResults,
  parseScriptsSearchResults,
} from "@/lib/scripts-search"
import { pendingChangesAPI } from "@/lib/indexed-db"
import { recordPendingDeletionChange } from "@/lib/change-tracker"

export type UseProblemsTableParams = {
  disabled?: boolean
  problems: Awaited<ReturnType<IScriptsContext["getProblems"]>>
  isScriptLocked?: boolean
  scriptLockedByUserId?: string | null
  loadProblems: () => Promise<void>
}

const defaultSearchState = {
  value: "",
  filter: "all" as ScriptsSearchResultsFilter,
  searching: false,
  results: [] as ScriptsSearchResultsItem[],
  unfilteredResults: [] as ScriptsSearchResultsItem[],
}

export function useProblemsTable({
  disabled: disabledProp,
  isScriptLocked,
  scriptLockedByUserId,
  problems: problemsParam,
  loadProblems,
}: UseProblemsTableParams) {
  const [problems, setProblems] = useState(problemsParam)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<number[]>([])
  const [problemsIdsToCopy, setProblemsIdsToCopy] = useState<string[]>([])

  const [search, setSearch] = useState(defaultSearchState)
  const clearSearch = useCallback(() => setSearch(defaultSearchState), [])

  useEffect(() => {
    setProblems(problemsParam)
  }, [problemsParam])

  const router = useRouter()
  const { viewOnly, authenticatedUser } = useAppContext()
  const { confirm } = useConfirmModal()
  const { alert } = useAlertModal()

  const { deleteProblems, saveProblems } = useScriptsContext()

  const onDelete = useCallback(
    async (problemsIds: string[]) => {
      confirm(
        async () => {
          const _problems = { ...problems }
          const problemsToDelete = problems.data.filter((s) => s.problemId && problemsIds.includes(s.problemId))

          setProblems((prev) => ({ ...prev, data: prev.data.filter((s) => !problemsIds.includes(s.problemId)) }))
          setSelected([])

          setLoading(true)

          // const res = await deleteProblems({ problemsIds, broadcastAction: true, });

          // TODO: Replace this with server action
          const response = await axios.delete(
            "/api/problems?data=" + JSON.stringify({ problemsIds, broadcastAction: true }),
          )
          const res = response.data as Awaited<ReturnType<typeof deleteProblems>>

          if (res.errors?.length) {
            alert({
              title: "Error",
              message: res.errors.join(", "),
              variant: "error",
              onClose: () => setProblems(_problems),
            })
          } else {
            await Promise.all(
              problemsToDelete.map(async (problem) => {
                if (!problem?.problemId) return
                await recordPendingDeletionChange({
                  entityId: problem.problemId,
                  entityType: "problem",
                  entityTitle: problem.name || problem.key || "Untitled Problem",
                  snapshot: problem,
                  userId: authenticatedUser?.userId,
                  userName: authenticatedUser?.displayName,
                  description: `Marked "${problem.name || problem.key || "Untitled Problem"}" for deletion`,
                })
              }),
            )
            setSelected([])
            router.refresh()
            alert({
              title: "Success",
              message: "Problems deleted successfully!",
              variant: "success",
            })
          }

          setLoading(false)
        },
        {
          danger: true,
          title: "Delete problems",
          message: "Are you sure you want to delete problems?",
          positiveLabel: "Yes, delete",
        },
      )
    },
    [deleteProblems, confirm, alert, router, problems, authenticatedUser?.userId, authenticatedUser?.displayName],
  )

  const onSort = useCallback(
    async (oldIndex: number, newIndex: number, sortedIndexes: { oldIndex: number; newIndex: number }[]) => {
      const payload: { problemId: string; position: number }[] = []

      const sorted = arrayMoveImmutable([...problems.data], oldIndex, newIndex).map((s, i) => {
        const newPosition = problems.data[i].position
        if (newPosition !== s.position) payload.push({ problemId: s.problemId, position: newPosition })
        return {
          ...s,
          position: newPosition,
        }
      })

      setProblems((prev) => ({ ...prev, data: sorted }))

      for (const change of payload) {
        const originalProblem = problems.data.find((d) => d.problemId === change.problemId)
        if (originalProblem) {
          await pendingChangesAPI.addChange({
            entityType: "problem",
            entityId: change.problemId,
            entityTitle: originalProblem.name || originalProblem.key || "Untitled Problem",
            action: "update",
            fieldPath: "position",
            fieldName: "position",
            oldValue: originalProblem.position,
            newValue: change.position,
            userId: authenticatedUser?.userId,
            userName: authenticatedUser?.displayName,
          })
        }
      }

      // await saveProblems({ data: payload, broadcastAction: true, });

      // TODO: Replace this with server action
      await axios.post("/api/problems/save", { data: payload, broadcastAction: true })

      await loadProblems()

      router.refresh()
    },
    [saveProblems, loadProblems, problems, router, authenticatedUser?.userId, authenticatedUser?.displayName],
  )

  const disabled = useMemo(() => disabledProp || viewOnly, [disabledProp, viewOnly])

  const onSearch = useCallback(
    async (value: string) => {
      try {
        clearSearch()
        if (value) {
          setSearch((prev) => ({ ...prev, searching: true }))

          const results = parseScriptsSearchResults({
            searchValue: value,
            screens: [],
            scripts: [],
            diagnoses: [],
            problems: problems.data.map(d => ({
              ...d,
              scriptTitle: '',
              scriptPosition: 0,
            })),
          })

          setSearch((prev) => ({
            value,
            filter: prev.filter,
            searching: false,
            results,
            unfilteredResults: results,
          }))
        }
      } catch (e: any) {
        clearSearch()
      }
    },
    [clearSearch, problems.data],
  )

  const problemsArr = useMemo(() => {
    return problems.data.filter((s) => {
      if (!search.value) return true

      const rslts = filterScriptsSearchResults({
        searchValue: search.value,
        filter: search.filter,
        results: search.results,
      })

      return rslts.find((r) => r.problems.map((s) => s.problemId).includes(s.problemId))
    })
  }, [problems.data, search])

  return {
    problems,
    loading,
    selected,
    disabled,
    problemsIdsToCopy,
    isScriptLocked,
    scriptLockedByUserId,
    search,
    problemsArr,
    setSearch,
    clearSearch,
    onSearch,
    setProblemsIdsToCopy,
    onDelete,
    onSort,
    setProblems,
    setLoading,
    setSelected,
  }
}
