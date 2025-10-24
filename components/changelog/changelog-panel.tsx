"use client"

import { useState } from "react"
import { X, History, Clock, FileText, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
// Using built-in date formatting instead of date-fns
import { cn } from "@/lib/utils"
import { usePendingChanges } from "@/hooks/use-pending-changes"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { PendingChange } from "@/lib/indexed-db"

interface GlobalChangeLogPanelProps {
  isOpen: boolean
  onClose: () => void
  allChangesByEntity?: Record<string, PendingChange[]>
  className?: string
}

const actionColors = {
  create: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  update: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  delete: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  modify: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
}

export function GlobalChangeLogPanel({
  isOpen,
  onClose,
  allChangesByEntity = {},
  className,
}: GlobalChangeLogPanelProps) {
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set())
  const { clearAllChanges } = usePendingChanges({ autoTrack: false })

  const toggleEntity = (entityId: string) => {
    setExpandedEntities((prev) => {
      const next = new Set(prev)
      if (next.has(entityId)) {
        next.delete(entityId)
      } else {
        next.add(entityId)
      }
      return next
    })
  }

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear all pending changes? This cannot be undone.")) {
      await clearAllChanges()
      onClose()
    }
  }

  if (!isOpen) return null

  const entities = Object.entries(allChangesByEntity)
  const totalChanges = entities.reduce((sum, [, changes]) => sum + changes.length, 0)

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full w-[600px] bg-background border-l shadow-lg z-50 flex flex-col",
        className,
      )}
    >
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Pending Changes</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {totalChanges} {totalChanges === 1 ? "change" : "changes"} across {entities.length}{" "}
            {entities.length === 1 ? "entity" : "entities"}
          </div>
          {totalChanges > 0 && (
            <Button variant="destructive" size="sm" onClick={handleClearAll}>
              <Trash2 className="h-3 w-3 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        {entities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <FileText className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No pending changes</p>
            <p className="text-sm">All changes have been saved</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entities.map(([entityId, changes]) => {
              const isExpanded = expandedEntities.has(entityId)
              const firstChange = changes[0]
              const entityType = firstChange?.entityType || "Unknown"
              const entityName = firstChange?.entityType || entityId

              return (
                <Collapsible
                  key={entityId}
                  open={isExpanded}
                  onOpenChange={() => toggleEntity(entityId)}
                >
                  <div className="border rounded-lg overflow-hidden">
                    {/* Entity Header */}
                    <div className="bg-muted/30 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>

                          <div className="flex-1">
                            <div className="font-medium text-sm">{entityName}</div>
                            <div className="text-xs text-muted-foreground">
                              {entityType} • {changes.length}{" "}
                              {changes.length === 1 ? "change" : "changes"}
                            </div>
                          </div>
                        </div>

                        <Badge variant="secondary" className="ml-2">
                          {changes.length}
                        </Badge>
                      </div>
                    </div>

                    {/* Changes List */}
                    <CollapsibleContent>
                      <div className="p-4 space-y-2">
                        {changes.map((change, index) => {
                          const actionColor =
                            actionColors[change.action as keyof typeof actionColors] ||
                            "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"

                          return (
                            <div
                              key={change.id || index}
                              className="p-3 rounded-md border bg-card space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className={cn("text-xs", actionColor)}
                                    >
                                      {change.action}
                                    </Badge>
                                    <span className="font-medium text-sm">
                                      {change.fieldName}
                                    </span>
                                  </div>

                                  {change.description && (
                                    <div className="text-xs text-muted-foreground">
                                      {change.description}
                                    </div>
                                  )}

                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {new Date(change.timestamp).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </div>
                                </div>
                              </div>

                              {/* Show old/new values if available */}
                              {(change.oldValue !== undefined || change.newValue !== undefined) && (
                                <div className="pt-2 space-y-2 border-t">
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    {change.oldValue !== undefined && (
                                      <div>
                                        <div className="text-muted-foreground mb-1">Previous</div>
                                        <div className="p-2 rounded bg-red-500/10 font-mono break-all">
                                          {typeof change.oldValue === "object"
                                            ? JSON.stringify(change.oldValue, null, 2)
                                            : String(change.oldValue)}
                                        </div>
                                      </div>
                                    )}
                                    {change.newValue !== undefined && (
                                      <div>
                                        <div className="text-muted-foreground mb-1">New</div>
                                        <div className="p-2 rounded bg-green-500/10 font-mono break-all">
                                          {typeof change.newValue === "object"
                                            ? JSON.stringify(change.newValue, null, 2)
                                            : String(change.newValue)}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}