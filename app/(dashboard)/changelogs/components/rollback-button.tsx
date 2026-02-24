"use client"

import { useCallback, useState } from "react"
import axios from "axios"
import { RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Loader } from "@/components/loader"
import { useAlertModal } from "@/hooks/use-alert-modal"
import { useAppContext } from "@/contexts/app"

type Props = {
  entityId: string
  targetVersion?: number | null
  currentVersion: number
  dataVersion?: number | null
  disabled?: boolean
}

export function RollbackButton({ entityId, targetVersion, currentVersion, dataVersion, disabled }: Props) {
  const { alert } = useAlertModal()
  const { viewOnly } = useAppContext()
  const [loading, setLoading] = useState(false)

  const handleRollback = useCallback(async () => {
    if (viewOnly) return

    if (!targetVersion || targetVersion < 1) {
      alert({
        title: "No previous version",
        message: "There is no previous published version to restore.",
        variant: "error",
        buttonLabel: "Close",
      })
      return
    }

    const expectedNextDataVersion = (dataVersion ?? 0) + 1
    const confirmed = window.confirm(
      `Restore this entity from v${currentVersion} back to v${targetVersion}? This will create a new changelog entry and publish data version v${expectedNextDataVersion}.`,
    )
    if (!confirmed) return

    try {
      setLoading(true)
      const response = await axios.post("/api/changelogs/rollback", {
        entityId,
        toVersion: targetVersion,
        changeReason: `Rollback from v${currentVersion} to v${targetVersion}`,
      })

      if (response.data?.errors?.length) {
        throw new Error(response.data.errors.join(", "))
      }

      const nextDataVersion = response.data?.data?.dataVersion ?? (dataVersion ?? 0) + 1

      alert({
        title: "Rollback scheduled",
        message: `Restored to v${targetVersion}. A new changelog entry was created (data v${nextDataVersion}).`,
        variant: "success",
        buttonLabel: "Refresh",
        onClose: () => window.location.reload(),
      })
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
  }, [alert, currentVersion, dataVersion, entityId, targetVersion, viewOnly])

  return (
    <div className="relative">
      {loading && <Loader overlay />}
      <Button
        size="sm"
        variant="outline"
        onClick={handleRollback}
        disabled={viewOnly || disabled || loading}
        className="inline-flex items-center gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        Rollback to previous
      </Button>
    </div>
  )
}
