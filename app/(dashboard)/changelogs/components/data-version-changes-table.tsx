"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { Eye } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { getChangeLogs } from "@/app/actions/change-logs"

type ChangeLogType = Awaited<ReturnType<typeof getChangeLogs>>["data"][0]

type Props = {
  changes: ChangeLogType[]
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

function toNumericVersion(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function getDataVersion(changelog: ChangeLogType): number | null {
  const dataVersion = toNumericVersion((changelog as any)?.dataVersion)
  const snapshotDataVersion = toNumericVersion((changelog?.fullSnapshot as any)?.dataVersion)
  return dataVersion ?? snapshotDataVersion ?? null
}

function formatChangeValue(value: unknown): string {
  if (value === null) return "null"
  if (value === undefined) return "—"
  if (typeof value === "string") return value.length ? value : '""'
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  try {
    return JSON.stringify(value, null, 2)
  } catch (error) {
    return String(value)
  }
}

export function DataVersionChangesTable({ changes }: Props) {
  const [selectedChange, setSelectedChange] = useState<ChangeLogType | null>(null)

  const sortedChanges = useMemo(() => {
    return [...changes].sort((a, b) => new Date(b.dateOfChange).getTime() - new Date(a.dateOfChange).getTime())
  }, [changes])

  const handleViewChange = (change: ChangeLogType) => {
    setSelectedChange(change)
  }

  const closeDialog = () => setSelectedChange(null)

  return (
    <>
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
            const fieldsChanged = Array.isArray(change.changes) ? change.changes.length : 0
            const entityLabel = entityTypeLabels[change.entityType as keyof typeof entityTypeLabels] || change.entityType
            const publishedAt = format(new Date(change.dateOfChange), "PPpp")
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
                    <span className="font-medium">{entityLabel}</span>
                    <span className="text-xs text-muted-foreground break-all">{change.entityId}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <Badge variant="outline" className="w-fit capitalize bg-muted text-muted-foreground">
                      {change.action}
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

      <Dialog open={!!selectedChange} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          {selectedChange && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {(() => {
                    const entityVersion = selectedChange.version
                    const changeDataVersion = getDataVersion(selectedChange)
                    if (changeDataVersion !== null) {
                      return `Data Version v${changeDataVersion} · Entity v${entityVersion}`
                    }
                    return `Entity Version v${entityVersion}`
                  })()}
                </DialogTitle>
                <DialogDescription>
                  {entityTypeLabels[selectedChange.entityType as keyof typeof entityTypeLabels] ||
                    selectedChange.entityType}
                  {" · "}
                  {selectedChange.action}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Entity</Label>
                    <p className="mt-1 break-all">
                      {entityTypeLabels[selectedChange.entityType as keyof typeof entityTypeLabels] ||
                        selectedChange.entityType}
                      {" · "}
                      {selectedChange.entityId}
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Changed By</Label>
                    <p className="mt-1">
                      {selectedChange.userName || "Unknown user"}
                      {selectedChange.userEmail ? ` • ${selectedChange.userEmail}` : ""}
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Changed On</Label>
                    <p className="mt-1">{format(new Date(selectedChange.dateOfChange), "PPpp")}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Action</Label>
                    <p className="mt-1 capitalize">{selectedChange.action}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <p className="mt-1">{selectedChange.isActive ? "Active" : "Superseded"}</p>
                  </div>

                  {selectedChange.parentVersion !== null && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Parent Version</Label>
                      <p className="mt-1">v{selectedChange.parentVersion}</p>
                    </div>
                  )}

                  {selectedChange.mergedFromVersion !== null && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Merged From</Label>
                      <p className="mt-1">v{selectedChange.mergedFromVersion}</p>
                    </div>
                  )}

                  {selectedChange.changeReason && (
                    <div className="sm:col-span-2">
                      <Label className="text-xs text-muted-foreground">Reason</Label>
                      <p className="mt-1">{selectedChange.changeReason}</p>
                    </div>
                  )}
                </div>

                <Separator />

                <Label className="text-xs text-muted-foreground">
                  Changed Fields ({Array.isArray(selectedChange.changes) ? selectedChange.changes.length : 0})
                </Label>

                <ScrollArea className="h-[360px] border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[220px]">Field</TableHead>
                        <TableHead>Previous Value</TableHead>
                        <TableHead>New Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(selectedChange.changes) && selectedChange.changes.length > 0 ? (
                        (selectedChange.changes as any[]).map((change: any, index: number) => (
                          <TableRow key={`${selectedChange.changeLogId}-${index}`}>
                            <TableCell className="align-top text-sm font-medium">
                              {change?.field || change?.fieldPath || "Unknown field"}
                            </TableCell>
                            <TableCell className="align-top">
                              <pre className="max-h-[200px] whitespace-pre-wrap break-words rounded-md bg-muted/60 p-3 text-xs">
                                {formatChangeValue(change?.previousValue)}
                              </pre>
                            </TableCell>
                            <TableCell className="align-top">
                              <pre className="max-h-[200px] whitespace-pre-wrap break-words rounded-md bg-muted/60 p-3 text-xs">
                                {formatChangeValue(change?.newValue)}
                              </pre>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                            No field-level changes recorded for this change.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
