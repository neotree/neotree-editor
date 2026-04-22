"use client"

import { useCallback, useState } from "react"
import axios from "axios"
import { RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Loader } from "@/components/loader"
import { useAlertModal } from "@/hooks/use-alert-modal"
import { useAppContext } from "@/contexts/app"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Props = {
  entityId: string
  entityType: string
  targetVersion?: number | null
  currentVersion: number
  dataVersion?: number | null
  disabled?: boolean
}

export function RollbackButton({ entityId, entityType, targetVersion, currentVersion, dataVersion, disabled }: Props) {
  const { alert } = useAlertModal()
  const { viewOnly } = useAppContext()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

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

    const rollingBackCreation = targetVersion === 0
    try {
      setLoading(true)
      const response = await axios.post("/api/changelogs/rollback", {
        entityId,
        entityType,
        toVersion: targetVersion,
        changeReason: `Rollback from v${currentVersion} to v${targetVersion}`,
      })

      if (response.data?.errors?.length) {
        throw new Error(response.data.errors.join(", "))
      }

      const nextDataVersion = response.data?.data?.dataVersion ?? (dataVersion ?? 0) + 1

      alert({
        title: "Rollback scheduled",
        message: rollingBackCreation
          ? `Entity rolled back to its pre-creation state. A new changelog entry was created (data v${nextDataVersion}).`
          : `Restored to v${targetVersion}. A new changelog entry was created (data v${nextDataVersion}).`,
        variant: "success",
        buttonLabel: "Refresh",
        onClose: () => window.location.reload(),
      })
      setOpen(false)
    } catch (e: any) {
      alert({
        title: "Rollback failed",
        message: e.message || "An unexpected error occurred while rolling back.",
        variant: "error",
        buttonLabel: "Close",
      })
    } finally {
      setLoading(false)
    }
  }, [alert, currentVersion, dataVersion, entityId, entityType, targetVersion, viewOnly])

  return (
    <div className="relative">
      {loading && <Loader overlay />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={viewOnly || disabled || loading} className="inline-flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Rollback to previous
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm rollback</DialogTitle>
            <DialogDescription>
              Rollback does not edit old history. It creates a new published version that restores this item to an earlier state.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-orange-900 dark:text-orange-200">
            {targetVersion === 0
              ? `This will roll this newly created item back to its pre-creation state and publish data version v${(dataVersion ?? 0) + 1}.`
              : `This will restore this item from entity version v${currentVersion} to v${targetVersion} and publish data version v${(dataVersion ?? 0) + 1}.`}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleRollback} disabled={loading}>
              Confirm rollback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
