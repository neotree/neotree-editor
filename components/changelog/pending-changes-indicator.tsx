"use client"

import { usePendingChanges } from "@/hooks/use-pending-changes"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"

interface PendingChangesIndicatorProps {
  entityId?: string
  entityType?: string
  className?: string
  showDetails?: boolean
}

export function PendingChangesIndicator({
  entityId,
  entityType,
  className,
  showDetails = true,
}: PendingChangesIndicatorProps) {
  const { pendingChanges, changeCount, hasChanges, getChangesSummary } = usePendingChanges({
    entityId,
    entityType,
    autoTrack: false,
  })

  if (!hasChanges) return null

  const summary = getChangesSummary()

  if (!showDetails) {
    return (
      <Badge variant="secondary" className={cn("gap-1", className)}>
        <Clock className="h-3 w-3" />
        {changeCount} unsaved {changeCount === 1 ? "change" : "changes"}
      </Badge>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
          <AlertCircle className="h-4 w-4 text-orange-500" />
          <span>
            {changeCount} pending {changeCount === 1 ? "change" : "changes"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm">Pending Changes</h4>
            <p className="text-xs text-muted-foreground mt-1">
              These changes will be saved when you click Save or Publish
            </p>
          </div>

          <Separator />

          {summary && (
            <div className="space-y-2">
              <div className="text-xs font-medium">Summary</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Total changes:</span>
                  <span className="ml-2 font-medium">{summary.total}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Fields modified:</span>
                  <span className="ml-2 font-medium">{summary.fields.size}</span>
                </div>
              </div>
            </div>
          )}

          <Separator />

          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {pendingChanges.map((change, index) => (
                <div key={change.id || index} className="p-2 rounded-md bg-muted/50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{change.fieldName}</span>
                    <Badge variant="outline" className="text-xs">
                      {change.action}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground">{format(new Date(change.timestamp), "MMM d, h:mm a")}</div>
                  {change.description && <div className="text-muted-foreground italic">{change.description}</div>}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}
