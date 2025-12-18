"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { ChevronDown, ChevronRight, User, Clock, FileText, GitBranch, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { ChangeLogType } from "@/databases/queries/changelogs/_get-change-logs"

interface ChangeLogViewerProps {
  changes: ChangeLogType[]
  className?: string
  showFilters?: boolean
  maxHeight?: string
}

const actionColors = {
  create: "bg-green-500/10 text-green-700 dark:text-green-400",
  update: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  delete: "bg-red-500/10 text-red-700 dark:text-red-400",
  publish: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  restore: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  rollback: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  merge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
}

// Helper function to extract dataVersion
function toNumericVersion(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function getDataVersion(changelog: ChangeLogType): number | null {
  const dataVersion = toNumericVersion((changelog as any)?.dataVersion)
  const snapshotDataVersion = toNumericVersion(changelog?.fullSnapshot?.dataVersion)
  return dataVersion ?? snapshotDataVersion ?? null
}

export function ChangeLogViewer({ changes, className, showFilters = true, maxHeight = "600px" }: ChangeLogViewerProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [filterAction, setFilterAction] = useState<string>("all")
  const [filterUser, setFilterUser] = useState<string>("all")

  const filteredChanges = useMemo(() => {
    return changes.filter((change) => {
      if (filterAction !== "all" && change.action !== filterAction) return false
      if (filterUser !== "all" && change.userId !== filterUser) return false
      return true
    })
  }, [changes, filterAction, filterUser])

  const uniqueActions = useMemo(() => {
    return Array.from(new Set(changes.map((c) => c.action)))
  }, [changes])

  const uniqueUsers = useMemo(() => {
    return Array.from(new Set(changes.map((c) => ({ id: c.userId, name: c.userName || "Unknown" }))))
  }, [changes])

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const renderChangeDetails = (change: ChangeLogType) => {
    const changes = (change.changes as any) || {}
    const oldValues = changes.oldValues || []
    const newValues = changes.newValues || []

    if (!oldValues.length && !newValues.length) {
      return <div className="text-sm text-muted-foreground italic">No detailed changes recorded</div>
    }

    return (
      <div className="space-y-2">
        {oldValues.map((oldVal: any, index: number) => {
          const newVal = newValues[index]
          const fieldName = Object.keys(oldVal)[0]
          const oldValue = oldVal[fieldName]
          const newValue = newVal?.[fieldName]

          return (
            <div key={index} className="p-3 rounded-md bg-muted/30 space-y-2">
              <div className="font-medium text-sm">{fieldName}</div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-muted-foreground mb-1">Previous</div>
                  <div className="p-2 rounded bg-red-500/10 font-mono break-all">
                    {JSON.stringify(oldValue, null, 2)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">New</div>
                  <div className="p-2 rounded bg-green-500/10 font-mono break-all">
                    {JSON.stringify(newValue, null, 2)}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {showFilters && (
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Action:</span>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">All</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">User:</span>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">All</option>
              {uniqueUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1" />
          <div className="text-sm text-muted-foreground">
            {filteredChanges.length} {filteredChanges.length === 1 ? "change" : "changes"}
          </div>
        </div>
      )}

      <ScrollArea style={{ maxHeight }}>
        <div className="space-y-3">
          {filteredChanges.map((change) => {
            const isExpanded = expandedItems.has(change.changeLogId)
            const actionColor =
              actionColors[change.action as keyof typeof actionColors] || "bg-gray-500/10 text-gray-700"
            const dataVersion = getDataVersion(change)

            return (
              <Collapsible
                key={change.changeLogId}
                open={isExpanded}
                onOpenChange={() => toggleExpanded(change.changeLogId)}
              >
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={cn("text-xs", actionColor)}>{change.action}</Badge>
                          {dataVersion !== null ? (
                            <>
                              <Badge variant="outline" className="text-xs">
                                Data v{dataVersion}
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-muted">
                                Entity v{change.version}
                              </Badge>
                            </>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Entity v{change.version}
                            </Badge>
                          )}
                          {change.entityName && (
                            <span className="text-sm text-muted-foreground">• {change.entityName}</span>
                          )}
                        </div>

                        {change.description && <div className="text-sm">{change.description}</div>}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {change.userName || "Unknown User"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(change.dateOfChange), "MMM d, yyyy h:mm a")}
                          </div>
                          {dataVersion !== null && (
                            <div className="flex items-center gap-1">
                              <Database className="h-3 w-3" />
                              Data v{dataVersion}
                            </div>
                          )}
                          {change.parentVersion && (
                            <div className="flex items-center gap-1">
                              <GitBranch className="h-3 w-3" />
                              Parent: v{change.parentVersion}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <CollapsibleContent>
                    <Separator className="my-3" />
                    {renderChangeDetails(change)}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )
          })}

          {filteredChanges.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No changes to display</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
