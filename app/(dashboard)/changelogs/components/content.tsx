"use client"

import { useCallback, useState, useEffect } from "react"
import axios from "axios"
import { format } from "date-fns"
import { History, RotateCcw, Search, Filter, ChevronDown, ChevronRight, Eye, Download, AlertCircle } from "lucide-react"

import type { getChangeLogs, searchChangeLogs, getEntityHistory } from "@/app/actions/change-logs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAlertModal } from "@/hooks/use-alert-modal"
import { DateTimePicker } from "@/components/datetime-picker"
import { Loader } from "@/components/loader"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type Props = {
  _getChangeLogs: typeof getChangeLogs
  _searchChangeLogs: typeof searchChangeLogs
  _getEntityHistory: typeof getEntityHistory
}

type ChangeLogType = Awaited<ReturnType<typeof getChangeLogs>>["data"][0]

const actionColors = {
  create: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  update: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  delete: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  publish: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  restore: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  rollback: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  merge: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
}

const entityTypeLabels = {
  script: "Script",
  screen: "Screen",
  diagnosis: "Diagnosis",
  config_key: "Config Key",
  drugs_library: "Drugs Library",
  data_key: "Data Key",
  alias: "Alias",
}

export function ChangelogManagementContent({ _getChangeLogs, _searchChangeLogs, _getEntityHistory }: Props) {
  const [loading, setLoading] = useState(false)
  const [changelogs, setChangelogs] = useState<ChangeLogType[]>([])
  const [selectedChangelog, setSelectedChangelog] = useState<ChangeLogType | null>(null)
  const [entityHistory, setEntityHistory] = useState<ChangeLogType[]>([])
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [showRollbackDialog, setShowRollbackDialog] = useState(false)
  const [rollbackTarget, setRollbackTarget] = useState<{ entityId: string; version: number } | null>(null)
  const [rollbackReason, setRollbackReason] = useState("")

  const [searchTerm, setSearchTerm] = useState("")
  const [entityType, setEntityType] = useState("all")
  const [action, setAction] = useState("all")
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [isActiveOnly, setIsActiveOnly] = useState(false)

  const { alert } = useAlertModal()

  const loadChangelogs = useCallback(async () => {
    try {
      setLoading(true)

      const params: any = {
        limit: 100,
        sortBy: "dateOfChange",
        sortOrder: "desc",
      }

      const res = await axios.post("/api/changelogs/get", params)
      const { errors, data } = res.data as Awaited<ReturnType<typeof _getChangeLogs>>

      if (errors?.length) throw new Error(errors.join(", "))

      setChangelogs(data)
    } catch (e: any) {
      alert({
        title: "Error",
        message: "Failed to load changelogs: " + e.message,
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }, [alert])

  const searchChangelogsHandler = useCallback(async () => {
    try {
      setLoading(true)

      const params: any = {
        searchTerm: searchTerm || undefined,
        entityTypes: entityType !== "all" ? [entityType] : undefined,
        actions: action !== "all" ? [action] : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        isActiveOnly: isActiveOnly,
        limit: 100,
      }

      const res = await axios.post("/api/changelogs/search", params)
      const { errors, data } = res.data as Awaited<ReturnType<typeof _searchChangeLogs>>

      if (errors?.length) throw new Error(errors.join(", "))

      setChangelogs(data)
    } catch (e: any) {
      alert({
        title: "Error",
        message: "Failed to search changelogs: " + e.message,
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }, [alert, searchTerm, entityType, action, startDate, endDate, isActiveOnly])

  const loadEntityHistory = useCallback(
    async (entityId: string, entityType: string) => {
      try {
        setLoading(true)

        const res = await axios.post("/api/changelogs/entity-history", {
          entityId,
          entityType,
          includeInactive: true,
          limit: 50,
        })

        const { errors, data } = res.data as Awaited<ReturnType<typeof _getEntityHistory>>

        if (errors?.length) throw new Error(errors.join(", "))

        setEntityHistory(data)
      } catch (e: any) {
        alert({
          title: "Error",
          message: "Failed to load entity history: " + e.message,
          variant: "error",
        })
      } finally {
        setLoading(false)
      }
    },
    [alert],
  )

  const handleRollback = useCallback(async () => {
    if (!rollbackTarget) return

    try {
      setLoading(true)

      const res = await axios.post("/api/changelogs/rollback", {
        entityId: rollbackTarget.entityId,
        toVersion: rollbackTarget.version,
        changeReason: rollbackReason || `Rolled back to version ${rollbackTarget.version}`,
      })

      const { errors, success } = res.data

      if (errors?.length) throw new Error(errors.join(", "))

      if (success) {
        alert({
          title: "Success",
          message: `Successfully rolled back to version ${rollbackTarget.version}`,
          variant: "success",
        })

        setShowRollbackDialog(false)
        setRollbackTarget(null)
        setRollbackReason("")

        // Reload changelogs
        loadChangelogs()
      }
    } catch (e: any) {
      alert({
        title: "Error",
        message: "Failed to rollback: " + e.message,
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }, [rollbackTarget, rollbackReason, alert, loadChangelogs])

  const toggleExpanded = useCallback((id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const viewDetails = useCallback((changelog: ChangeLogType) => {
    setSelectedChangelog(changelog)
  }, [])

  useEffect(() => {
    if (selectedChangelog) {
      loadEntityHistory(selectedChangelog.entityId, selectedChangelog.entityType)
    }
  }, [selectedChangelog, loadEntityHistory])

  const initiateRollback = useCallback((entityId: string, version: number) => {
    setRollbackTarget({ entityId, version })
    setShowRollbackDialog(true)
  }, [])

  const exportChangelog = useCallback((changelog: ChangeLogType) => {
    const dataStr = JSON.stringify(changelog, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `changelog-${changelog.changeLogId}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [])

  const clearFilters = useCallback(() => {
    setSearchTerm("")
    setEntityType("all")
    setAction("all")
    setStartDate(null)
    setEndDate(null)
    setIsActiveOnly(false)
    loadChangelogs()
  }, [loadChangelogs])

  useEffect(() => {
    loadChangelogs()
  }, [loadChangelogs])

  return (
    <>
      {loading && <Loader overlay />}

      <div className="p-6 space-y-6">
        {/* Filters Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>Filter and search through changelog history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Search</Label>
                <Input
                  placeholder="Search changelogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <Label>Entity Type</Label>
                <Select value={entityType} onValueChange={setEntityType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.entries(entityTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Action</Label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                      <SelectItem value="publish">Publish</SelectItem>
                      <SelectItem value="restore">Restore</SelectItem>
                      <SelectItem value="rollback">Rollback</SelectItem>
                      <SelectItem value="merge">Merge</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Start Date</Label>
                <DateTimePicker
                  type="date"
                  value={startDate}
                  max={new Date()}
                  onChange={(value) => setStartDate(value.date!)}
                />
              </div>

              <div>
                <Label>End Date</Label>
                <DateTimePicker
                  type="date"
                  disabled={!startDate}
                  min={startDate || undefined}
                  max={new Date()}
                  value={endDate}
                  onChange={(value) => setEndDate(value.date!)}
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActiveOnly}
                    onChange={(e) => setIsActiveOnly(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Active versions only</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={searchChangelogsHandler} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" onClick={clearFilters} disabled={loading}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Changelogs List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Changelog History
            </CardTitle>
            <CardDescription>
              {changelogs.length} changelog{changelogs.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {changelogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No changelogs found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {changelogs.map((changelog) => {
                    const isExpanded = expandedItems.has(changelog.changeLogId)
                    return (
                      <Card
                        key={changelog.changeLogId}
                        className={cn("transition-colors", !changelog.isActive && "opacity-60")}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className={actionColors[changelog.action]}>
                                  {changelog.action}
                                </Badge>
                                <Badge variant="outline">
                                  {entityTypeLabels[changelog.entityType as keyof typeof entityTypeLabels]}
                                </Badge>
                                <Badge variant="outline">v{changelog.version}</Badge>
                                {!changelog.isActive && (
                                  <Badge variant="outline" className="bg-gray-500/10">
                                    Superseded
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {changelog.description || "No description"}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{changelog.userName || "Unknown user"}</span>
                                <span>•</span>
                                <span>{format(new Date(changelog.dateOfChange), "PPp")}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => viewDetails(changelog)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => initiateRollback(changelog.entityId, changelog.version)}
                                disabled={!changelog.isActive}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => exportChangelog(changelog)}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => toggleExpanded(changelog.changeLogId)}>
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        {isExpanded && (
                          <CardContent className="pt-0">
                            <Separator className="mb-4" />
                            <div className="space-y-4">
                              {changelog.changeReason && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Reason</Label>
                                  <p className="text-sm mt-1">{changelog.changeReason}</p>
                                </div>
                              )}

                              {changelog.changes && changelog.changes.length > 0 && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">
                                    Changes ({changelog.changes.length})
                                  </Label>
                                  <div className="mt-2 space-y-2">
                                    {changelog.changes.map((change: any, idx: number) => (
                                      <div key={idx} className="p-3 bg-muted/50 rounded-lg text-sm">
                                        <div className="font-medium mb-1">{change.field || change.fieldPath}</div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                          <div>
                                            <span className="text-muted-foreground">Previous:</span>
                                            <pre className="mt-1 p-2 bg-background rounded overflow-auto">
                                              {JSON.stringify(change.previousValue, null, 2)}
                                            </pre>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground">New:</span>
                                            <pre className="mt-1 p-2 bg-background rounded overflow-auto">
                                              {JSON.stringify(change.newValue, null, 2)}
                                            </pre>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {changelog.parentVersion !== null && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Parent Version</Label>
                                  <p className="text-sm mt-1">v{changelog.parentVersion}</p>
                                </div>
                              )}

                              {changelog.mergedFromVersion !== null && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Merged From Version</Label>
                                  <p className="text-sm mt-1">v{changelog.mergedFromVersion}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Rollback Dialog */}
      <Dialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Confirm Rollback
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to rollback to version {rollbackTarget?.version}? This will create a new version
              with the previous state.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Reason for rollback (optional)</Label>
              <Input
                placeholder="Enter reason..."
                value={rollbackReason}
                onChange={(e) => setRollbackReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRollbackDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRollback} disabled={loading}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Rollback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Entity History Dialog */}
      <Dialog open={!!selectedChangelog} onOpenChange={() => setSelectedChangelog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Entity History
            </DialogTitle>
            <DialogDescription>Complete version history for this entity</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-2">
              {entityHistory.map((version) => (
                <Card
                  key={version.changeLogId}
                  className={cn(version.changeLogId === selectedChangelog?.changeLogId && "border-primary")}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={actionColors[version.action]}>
                          {version.action}
                        </Badge>
                        <Badge variant="outline">v{version.version}</Badge>
                        {!version.isActive && (
                          <Badge variant="outline" className="bg-gray-500/10">
                            Superseded
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => initiateRollback(version.entityId, version.version)}
                        disabled={!version.isActive}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Rollback
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">{version.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {version.userName} • {format(new Date(version.dateOfChange), "PPp")}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
