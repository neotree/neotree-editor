"use client"

import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { useConfirmModal } from "@/hooks/use-confirm-modal"
import { useAlertModal } from "@/hooks/use-alert-modal"
import { adoptOwnerlessDrafts, countOwnerlessDrafts } from "@/app/actions/ops"

/**
 * Drafts without an owner cannot be published or discarded through "my changes only". Admins see how
 * many there are and can take them over, then review and publish or discard them as their own.
 */
export function OwnerlessDrafts() {
  const { confirm } = useConfirmModal()
  const { alert } = useAlertModal()
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    const res = await countOwnerlessDrafts()
    if (!res.errors?.length) setTotal(res.total)
  }, [])

  useEffect(() => { load() }, [load])

  if (!total) return null

  return (
    <Button
      size="sm"
      variant="link"
      className="h-auto p-0 text-xs text-amber-700"
      disabled={loading}
      onClick={() => confirm(async () => {
        try {
          setLoading(true)
          const res = await adoptOwnerlessDrafts()
          if (!res.success) throw new Error(res.errors?.join(", ") || "Failed to take over the drafts")
          alert({
            variant: "success",
            title: "Drafts taken over",
            message: `${res.adopted} draft${res.adopted === 1 ? " is" : "s are"} now yours. Review them, then publish or discard them with your changes.`,
            onClose: () => window.location.reload(),
          })
        } catch (e: any) {
          alert({ variant: "error", title: "Error", message: e.message })
        } finally {
          setLoading(false)
        }
      }, {
        title: "Take over drafts with no owner?",
        message: `${total} draft${total === 1 ? " has" : "s have"} no owner (made through an API key, a maintenance script, or an import from another editor), so nobody can publish or discard ${total === 1 ? "it" : "them"}. Taking them over makes them part of your changes.`,
      })}
    >
      {total} draft{total === 1 ? "" : "s"} without an owner
    </Button>
  )
}
