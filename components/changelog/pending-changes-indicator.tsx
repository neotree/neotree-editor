"use client"

import { useAppContext } from "@/contexts/app"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileStack } from "lucide-react"
import { cn } from "@/lib/utils"

interface PendingChangesIndicatorProps {
  className?: string
  showDetails?: boolean
  onClick?: () => void
}

export function PendingChangesIndicator({
  className,
  showDetails = true,
  onClick,
}: PendingChangesIndicatorProps) {
  const { myDraftQueueCount } = useAppContext()
  const changeCount = myDraftQueueCount || 0

  if (changeCount < 1) return null

  if (!showDetails) {
    return (
      <Badge
        variant="secondary"
        className={cn("gap-1 cursor-pointer hover:bg-secondary/80 transition-colors", className)}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onClick?.()
        }}
      >
        <FileStack className="h-3 w-3" />
        {changeCount} my draft {changeCount === 1 ? "entry" : "entries"}
      </Badge>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("gap-2", className)}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick?.()
      }}
    >
      <FileStack className="h-4 w-4 text-orange-500" />
      <span>
        {changeCount} my draft {changeCount === 1 ? "entry" : "entries"}
      </span>
    </Button>
  )
}
