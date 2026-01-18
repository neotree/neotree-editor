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

export type UseDiagnosesTableParams = {
  disabled?: boolean
  diagnoses: Awaited<ReturnType<IScriptsContext["getDiagnoses"]>>
  isScriptLocked?: boolean
  scriptLockedByUserId?: string | null
  loadDiagnoses: () => Promise<void>
}

const defaultSearchState = {
  value: "",
  filter: "all" as ScriptsSearchResultsFilter,
  searching: false,
  results: [] as ScriptsSearchResultsItem[],
  unfilteredResults: [] as ScriptsSearchResultsItem[],
}

export function useDiagnosesTable({
  disabled: disabledProp,
  isScriptLocked,
  scriptLockedByUserId,
  diagnoses: diagnosesParam,
  loadDiagnoses,
}: UseDiagnosesTableParams) {
  const [diagnoses, setDiagnoses] = useState(diagnosesParam)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<number[]>([])
  const [diagnosesIdsToCopy, setDiagnosesIdsToCopy] = useState<string[]>([])

  const [search, setSearch] = useState(defaultSearchState)
  const clearSearch = useCallback(() => setSearch(defaultSearchState), [])

  useEffect(() => {
    setDiagnoses(diagnosesParam)
  }, [diagnosesParam])

  const router = useRouter()
  const { viewOnly, authenticatedUser } = useAppContext()
  const { confirm } = useConfirmModal()
  const { alert } = useAlertModal()

  const { deleteDiagnoses, saveDiagnoses } = useScriptsContext()

  const onDelete = useCallback(
    async (diagnosesIds: string[]) => {
      confirm(
        async () => {
          const _diagnoses = { ...diagnoses }
          const diagnosesToDelete = diagnoses.data.filter((s) => s.diagnosisId && diagnosesIds.includes(s.diagnosisId))

          setDiagnoses((prev) => ({ ...prev, data: prev.data.filter((s) => !diagnosesIds.includes(s.diagnosisId)) }))
          setSelected([])

          setLoading(true)

          // const res = await deleteDiagnoses({ diagnosesIds, broadcastAction: true, });

          // TODO: Replace this with server action
          const response = await axios.delete(
            "/api/diagnoses?data=" + JSON.stringify({ diagnosesIds, broadcastAction: true }),
          )
          const res = response.data as Awaited<ReturnType<typeof deleteDiagnoses>>

          if (res.errors?.length) {
            alert({
              title: "Error",
              message: res.errors.join(", "),
              variant: "error",
              onClose: () => setDiagnoses(_diagnoses),
            })
          } else {
            await Promise.all(
              diagnosesToDelete.map(async (diagnosis) => {
                if (!diagnosis?.diagnosisId) return
                await recordPendingDeletionChange({
                  entityId: diagnosis.diagnosisId,
                  entityType: "diagnosis",
                  entityTitle: diagnosis.name || diagnosis.key || "Untitled Diagnosis",
                  snapshot: diagnosis,
                  userId: authenticatedUser?.userId,
                  userName: authenticatedUser?.displayName,
                  description: `Marked "${diagnosis.name || diagnosis.key || "Untitled Diagnosis"}" for deletion`,
                })
              }),
            )
            setSelected([])
            router.refresh()
            alert({
              title: "Success",
              message: "Diagnoses deleted successfully!",
              variant: "success",
            })
          }

          setLoading(false)
        },
        {
          danger: true,
          title: "Delete diagnoses",
          message: "Are you sure you want to delete diagnoses?",
          positiveLabel: "Yes, delete",
        },
      )
    },
    [deleteDiagnoses, confirm, alert, router, diagnoses, authenticatedUser?.userId, authenticatedUser?.displayName],
  )

  const onSort = useCallback(
    async (oldIndex: number, newIndex: number, sortedIndexes: { oldIndex: number; newIndex: number }[]) => {
      const payload: { diagnosisId: string; position: number }[] = []

      const sorted = arrayMoveImmutable([...diagnoses.data], oldIndex, newIndex).map((s, i) => {
        const newPosition = diagnoses.data[i].position
        if (newPosition !== s.position) payload.push({ diagnosisId: s.diagnosisId, position: newPosition })
        return {
          ...s,
          position: newPosition,
        }
      })

      setDiagnoses((prev) => ({ ...prev, data: sorted }))

      for (const change of payload) {
        const originalDiagnosis = diagnoses.data.find((d) => d.diagnosisId === change.diagnosisId)
        if (originalDiagnosis) {
          await pendingChangesAPI.addChange({
            entityType: "diagnosis",
            entityId: change.diagnosisId,
            entityTitle: originalDiagnosis.name || originalDiagnosis.key || "Untitled Diagnosis",
            action: "update",
            fieldPath: "position",
            fieldName: "position",
            oldValue: originalDiagnosis.position,
            newValue: change.position,
            userId: authenticatedUser?.userId,
            userName: authenticatedUser?.displayName,
          })
        }
      }

      // await saveDiagnoses({ data: payload, broadcastAction: true, });

      // TODO: Replace this with server action
      await axios.post("/api/diagnoses/save", { data: payload, broadcastAction: true })

      await loadDiagnoses()

      router.refresh()
    },
    [saveDiagnoses, loadDiagnoses, diagnoses, router, authenticatedUser?.userId, authenticatedUser?.displayName],
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
            diagnoses: diagnoses.data.map(d => ({
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
    [clearSearch, diagnoses.data],
  )

  const diagnosesArr = useMemo(() => {
    return diagnoses.data.filter((s) => {
      if (!search.value) return true

      const rslts = filterScriptsSearchResults({
        searchValue: search.value,
        filter: search.filter,
        results: search.results,
      })

      return rslts.find((r) => r.diagnoses.map((s) => s.diagnosisId).includes(s.diagnosisId))
    })
  }, [diagnoses.data, search])

  return {
    diagnoses,
    loading,
    selected,
    disabled,
    diagnosesIdsToCopy,
    isScriptLocked,
    scriptLockedByUserId,
    search,
    diagnosesArr,
    setSearch,
    clearSearch,
    onSearch,
    setDiagnosesIdsToCopy,
    onDelete,
    onSort,
    setDiagnoses,
    setLoading,
    setSelected,
  }
}
