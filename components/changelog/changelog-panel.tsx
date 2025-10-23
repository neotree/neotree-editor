"use client"

import { useEffect, useState, useCallback } from "react"
import { X, History, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChangeLogViewer } from "./changelog-viewer"
import { PendingChangesIndicator } from "./pending-changes-indicator"
import { usePendingChanges } from "@/hooks/use-pending-changes"
import { cn } from "@/lib/utils"
import type { ChangeLogType } from "@/databases/queries/changelogs/_get-change-logs"

interface ChangeLogPanelProps {
  entityId: string
  entityType: string
  entityName?: string
  isOpen: boolean
  onClose: () => void
  getEntityHistory: (entityId: string) => Promise<{ data: ChangeLogType[]; errors?: string[] }>
  className?: string
}

export function ChangeLogPanel({
  entityId,
  entityType,
  entityName,
  isOpen,
  onClose,
  getEntityHistory,
  className,
}: ChangeLogPanelProps) {
  const [history, setHistory] = useState<ChangeLogType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { pendingChanges, hasChanges } = usePendingChanges({
    entityId,
    entityType,
    autoTrack: false,
  })

  const loadHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getEntityHistory(entityId)
      if (result.errors?.length) {
        setError(result.errors.join(", "))
      } else {
        setHistory(result.data || [])
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [getEntityHistory, entityId])

  useEffect(() => {
    if (isOpen && entityId) {
      loadHistory()
    }
  }, [isOpen, loadHistory, entityId])

  if (!isOpen) return null

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full w-[500px] bg-background border-l shadow-lg z-50 flex flex-col",
        className,
      )}
    >
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Change History</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {entityName && <div className="text-sm text-muted-foreground">{entityName}</div>}

        {hasChanges && <PendingChangesIndicator entityId={entityId} entityType={entityType} showDetails={true} />}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-destructive">
            <p>Error loading history: {error}</p>
            <Button variant="outline" size="sm" onClick={loadHistory} className="mt-4 bg-transparent">
              Retry
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-full p-4">
            <ChangeLogViewer changes={history} showFilters={true} maxHeight="none" />
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
