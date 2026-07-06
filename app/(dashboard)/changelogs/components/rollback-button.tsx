"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { History, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Loader } from "@/components/loader"
import { useAlertModal } from "@/hooks/use-alert-modal"
import { useAppContext } from "@/contexts/app"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Props = {
  entityId: string
  entityType: string
  targetVersion?: number | null
  currentVersion?: number | null
  disabled?: boolean
  // "previous" rolls the active entry back to its parent version;
  // "restore" restores the entity to a specific historical version.
  mode?: "previous" | "restore"
}

export function RollbackButton({ entityId, entityType, targetVersion, currentVersion, disabled, mode = "previous" }: Props) {
  const { alert } = useAlertModal()
  const { viewOnly } = useAppContext()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const isRestore = mode === "restore"
  const rollingBackCreation = targetVersion === 0

  const handleRollback = useCallback(async () => {
    if (viewOnly) return

    if (targetVersion === null || targetVersion === undefined || targetVersion < 0) {
      alert({
        title: "No previous version",
        message: "There is no previous published version to restore.",
        variant: "error",
        buttonLabel: "Close",
      })
      return
    }

    try {
      setLoading(true)
      const response = await axios.post("/api/changelogs/rollback", {
        entityId,
        entityType,
        toVersion: targetVersion,
        changeReason: isRestore
          ? `Restore to v${targetVersion}`
          : `Rollback from v${currentVersion ?? "current"} to v${targetVersion}`,
      })

      if (response.data?.errors?.length) {
        throw new Error(response.data.errors.join(", "))
      }

      // The server computes the actual next data version; never predict it client-side.
      const nextDataVersion = response.data?.data?.dataVersion
      const releaseSuffix = Number.isFinite(nextDataVersion)
        ? ` A new changelog entry was published as data version v${nextDataVersion}.`
        : " A new changelog entry was published."
      const warnings: string[] = response.data?.warnings || []
      const baseMessage = rollingBackCreation
        ? `Entity rolled back to its pre-creation state.${releaseSuffix}`
        : `Restored this item to its version v${targetVersion}.${releaseSuffix}`

      alert({
        title: isRestore ? "Restore complete" : "Rollback complete",
        message: [baseMessage, ...warnings].join("\n\n"),
        variant: "success",
        buttonLabel: "Refresh",
        onClose: () => router.refresh(),
      })
      setOpen(false)
    } catch (e: any) {
      const serverErrors: string[] = e?.response?.data?.errors || []
      alert({
        title: isRestore ? "Restore failed" : "Rollback failed",
        message: serverErrors.length ? serverErrors.join(", ") : e.message || "An unexpected error occurred while rolling back.",
        variant: "error",
        buttonLabel: "Close",
      })
    } finally {
      setLoading(false)
    }
  }, [alert, currentVersion, entityId, entityType, isRestore, rollingBackCreation, router, targetVersion, viewOnly])

  const confirmationText = rollingBackCreation
    ? "This will roll this newly created item back to its pre-creation state and publish a new data version."
    : isRestore
      ? `This will restore this item to version v${targetVersion} and publish a new data version.`
      : `This will restore this item from entity version v${currentVersion ?? "current"} to v${targetVersion} and publish a new data version.`

  return (
    <div className="relative">
      {loading && <Loader overlay />}
      <AlertDialog
        open={open}
        onOpenChange={(nextOpen) => {
          // Keep the dialog up while the rollback request is in flight
          if (loading) return
          setOpen(nextOpen)
        }}
      >
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={viewOnly || disabled || loading} className="inline-flex items-center gap-2">
            {isRestore ? <History className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
            {isRestore ? `Restore this version (v${targetVersion})` : "Rollback to previous"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isRestore ? "Confirm restore" : "Confirm rollback"}</AlertDialogTitle>
            <AlertDialogDescription>
              Rollback does not edit old history. It creates a new published version that restores this item to an earlier state.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-orange-900 dark:text-orange-200">
            {confirmationText}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleRollback} disabled={loading}>
              {loading ? "Working..." : isRestore ? "Confirm restore" : "Confirm rollback"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
