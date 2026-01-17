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

interface PendingChangesGroup {
  title: string
  changes: PendingChange[]
}

interface GlobalChangeLogPanelProps {
  isOpen: boolean
  onClose: () => void
  allChangesByEntity?: Record<string, PendingChangesGroup>
  className?: string
}

const actionColors = {
  create: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  update: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  delete: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  modify: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
}

const MAX_LIST_ITEMS = 3
const MAX_OBJECT_FIELDS = 4

function formatPrimitive(value: unknown): string {
  if (value === null || value === undefined) return "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "—"
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length > 120 ? `${trimmed.slice(0, 117)}...` : trimmed
  }
  return String(value)
}

function extractLabel(value: Record<string, unknown>): string | null {
  const labelKeys = ["title", "name", "label", "key", "id", "type"]
  for (const key of labelKeys) {
    const entry = value[key]
    if (typeof entry === "string" && entry.trim().length) return entry.trim()
    if (typeof entry === "number" && Number.isFinite(entry)) return String(entry)
  }
  return null
}

function summarizeArray(values: unknown[]): string {
  if (!values.length) return "Empty list"
  const primitiveValues = values.filter((val) => val === null || ["string", "number", "boolean"].includes(typeof val))
  if (primitiveValues.length === values.length) {
    const preview = primitiveValues.slice(0, MAX_LIST_ITEMS).map(formatPrimitive)
    const remainder = values.length - preview.length
    return remainder > 0 ? `${preview.join(", ")} + ${remainder} more` : preview.join(", ")
  }

  const labeled = values
    .filter((val): val is Record<string, unknown> => !!val && typeof val === "object")
    .map((val) => extractLabel(val))
    .filter((val): val is string => !!val)

  if (labeled.length) {
    const preview = labeled.slice(0, MAX_LIST_ITEMS)
    const remainder = labeled.length - preview.length
    return remainder > 0 ? `${preview.join(", ")} + ${remainder} more` : preview.join(", ")
  }

  return `${values.length} items`
}

function summarizeObject(value: Record<string, unknown>): string {
  const preferredKeys = ["title", "name", "label", "key", "id", "type", "value", "summary", "position"]
  const entries = preferredKeys
    .filter((key) => key in value)
    .map((key) => `${key}: ${formatPrimitive(value[key])}`)
    .filter((entry) => !entry.endsWith(": —"))

  if (entries.length) {
    const preview = entries.slice(0, MAX_OBJECT_FIELDS)
    const remainder = entries.length - preview.length
    return remainder > 0 ? `${preview.join("; ")} + ${remainder} more` : preview.join("; ")
  }

  const keys = Object.keys(value)
  if (!keys.length) return "No details"
  const preview = keys.slice(0, MAX_OBJECT_FIELDS)
  const remainder = keys.length - preview.length
  return remainder > 0 ? `${preview.join(", ")} + ${remainder} more fields` : `${preview.join(", ")} fields`
}

function renderReadableValue(value: unknown) {
  if (Array.isArray(value)) return summarizeArray(value)
  if (value && typeof value === "object") return summarizeObject(value as Record<string, unknown>)
  return formatPrimitive(value)
}

export function GlobalChangeLogPanel({
  isOpen,
  onClose,
  allChangesByEntity = {},
  className,
}: GlobalChangeLogPanelProps) {
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set())
  
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

  if (!isOpen) return null

  const entities = Object.entries(allChangesByEntity)
  const totalChanges = entities.reduce((sum, [, group]) => sum + group.changes.length, 0)

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
            {entities.map(([entityKey, group]) => {
              const { changes, title } = group
              const isExpanded = expandedEntities.has(entityKey)
              const firstChange = changes[0]
              const entityType = firstChange?.entityType || "Unknown"
              const entityName = title || firstChange?.entityTitle

              return (
                <Collapsible
                  key={entityKey}
                  open={isExpanded}
                  onOpenChange={() => toggleEntity(entityKey)}
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
                                        <div className="p-2 rounded bg-red-500/10 text-foreground break-words">
                                          {renderReadableValue(change.oldValue)}
                                        </div>
                                      </div>
                                    )}
                                    {change.newValue !== undefined && (
                                      <div>
                                        <div className="text-muted-foreground mb-1">New</div>
                                        <div className="p-2 rounded bg-green-500/10 text-foreground break-words">
                                          {renderReadableValue(change.newValue)}
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
