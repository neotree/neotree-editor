"use client"

import { Eye, RotateCcw, Download, MoreVertical } from "lucide-react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChangeLogType } from "../hooks/use-changelogs-table"


type Props = {
  changelog: ChangeLogType
  onView: () => void
  onRollback: () => void
  onExport: () => void
}

export function ChangelogsTableRowActions({ changelog, onView, onRollback, onExport }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="p-0 h-auto w-auto transition-colors rounded-full hover:text-primary hover:bg-transparent"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem onClick={onView}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onRollback} disabled={!changelog.isActive}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Rollback
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
