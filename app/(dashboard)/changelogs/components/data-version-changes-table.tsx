"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Eye } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { ChangeLogType } from "@/databases/queries/changelogs/_get-change-logs"
import { getDataVersion, normalizeChanges, resolveEntityTitle } from "@/lib/changelog-utils"

type Props = {
  changes: ChangeLogType[]
  dataVersion: number
}

const entityTypeLabels: Record<string, string> = {
  script: "Script",
  screen: "Screen",
  diagnosis: "Diagnosis",
  config_key: "Config Key",
  drugs_library: "Drugs Library",
  data_key: "Data Key",
  alias: "Alias",
}

const actionBadgeClasses: Record<string, string> = {
  create: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  update: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  delete: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
  publish: "border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400",
  restore: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rollback: "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
  merge: "border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
}

const actionLabels: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  publish: "Published",
  restore: "Restored",
  rollback: "Rolled back",
  merge: "Merged",
}

const defaultActionBadgeClass = "border-muted bg-muted text-muted-foreground"

export function DataVersionChangesTable({ changes, dataVersion }: Props) {
  const router = useRouter()

  const sortedChanges = useMemo(() => {
    return [...changes].sort((a, b) => new Date(b.dateOfChange).getTime() - new Date(a.dateOfChange).getTime())
  }, [changes])

  const handleViewChange = (change: ChangeLogType) => {
    const targetVersion = getDataVersion(change) ?? dataVersion
    router.push(`/changelogs/v${targetVersion}/changes/${change.changeLogId}`)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Entity</TableHead>
          <TableHead className="w-[120px]">Action</TableHead>
          <TableHead className="w-[80px] text-center">Fields</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-[200px]">Changed By</TableHead>
          <TableHead className="w-[180px]">Changed At</TableHead>
          <TableHead className="text-right w-[120px]">Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedChanges.map((change) => {
          const normalizedChanges = normalizeChanges(change)
          const fieldsChanged = normalizedChanges.length
          const entityLabel = entityTypeLabels[change.entityType as keyof typeof entityTypeLabels] || change.entityType
          const publishedAt = format(new Date(change.dateOfChange), "PPpp")
          const entityTitle = resolveEntityTitle(change)
          const statusBadge = (
            <Badge
              variant="outline"
              className={cn("w-fit bg-muted text-muted-foreground", !change.isActive && "opacity-80")}
            >
              {change.isActive ? "Active" : "Superseded"}
            </Badge>
          )

          return (
            <TableRow key={change.changeLogId} className="transition-colors hover:bg-muted/50">
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{entityTitle}</span>
                  <span className="text-xs text-muted-foreground">
                    {entityLabel} • {change.entityId}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-2">
                  <Badge
                    variant="outline"
                    className={cn("w-fit", actionBadgeClasses[change.action] ?? defaultActionBadgeClass)}
                  >
                    {actionLabels[change.action] || change.action}
                  </Badge>
                  {statusBadge}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="w-fit bg-muted text-muted-foreground">
                  {fieldsChanged}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[320px]">
                <div className="text-sm text-muted-foreground line-clamp-3">
                  {change.description || "No description provided"}
                </div>
                {change.changeReason && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Reason:</span> {change.changeReason}
                  </div>
                )}
                
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{change.userName || "Unknown user"}</span>
                  {change.userEmail && <span className="text-xs text-muted-foreground">{change.userEmail}</span>}
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{publishedAt}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="ghost" className="text-primary" onClick={() => handleViewChange(change)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
