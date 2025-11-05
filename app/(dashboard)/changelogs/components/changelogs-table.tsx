"use client"

import { useState } from "react"
import { format } from "date-fns"
import { History, AlertCircle, RotateCcw, Search } from "lucide-react"

import { Loader } from "@/components/loader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardHeader } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ChangelogsTableRowActions } from "./changelogs-table-row-actions"
import { ChangelogsTableHeader } from "./changelogs-table-header"
import { type UseChangelogsTableParams, type ChangeLogType, useChangelogsTable } from "../hooks/use-changelogs-table"

type Props = UseChangelogsTableParams

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

function toNumericVersion(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function getVersionInfo(changelog: ChangeLogType): { entityVersion: number; dataVersion: number | null } {
  const dataVersion = toNumericVersion((changelog as any)?.dataVersion)
  const snapshotDataVersion = toNumericVersion(changelog?.fullSnapshot?.dataVersion)
  const entityVersion = changelog.version

  return {
    entityVersion,
    dataVersion: dataVersion ?? snapshotDataVersion ?? null,
  }
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

export function ChangelogsTable(props: Props) {
  const [versionPreview, setVersionPreview] = useState<ChangeLogType | null>(null)

  const {
    changelogs,
    loading,
    selectedChangelog,
    entityHistory,
    searchValue,
    entityType,
    action,
    isActiveOnly,
    sort,
    sortOptions,
    pagination,
    currentPage,
    itemsPerPage,
    viewDetails,
    onRollback,
    onExport,
    setSelectedChangelog,
    setSearchValue,
    setEntityType,
    setAction,
    setIsActiveOnly,
    setSort,
    setCurrentPage,
    clearFilters,
  } = useChangelogsTable(props)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const renderPageNumbers = () => {
    if (!pagination) return null

    const { page, totalPages } = pagination
    const pages: (number | "ellipsis")[] = []

    pages.push(1)

    if (totalPages <= 7) {
      for (let i = 2; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (page > 3) {
        pages.push("ellipsis")
      }

      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i)
      }

      if (page < totalPages - 2) {
        pages.push("ellipsis")
      }

      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages.map((pageNum, idx) => {
      if (pageNum === "ellipsis") {
        return (
          <PaginationItem key={`ellipsis-${idx}`}>
            <PaginationEllipsis />
          </PaginationItem>
        )
      }

      return (
        <PaginationItem key={pageNum}>
          <PaginationLink
            onClick={() => handlePageChange(pageNum)}
            isActive={pageNum === page}
            className="cursor-pointer"
          >
            {pageNum}
          </PaginationLink>
        </PaginationItem>
      )
    })
  }

  return (
    <>
      {loading && <Loader overlay />}

      <div className="flex flex-col gap-y-4">
        <ChangelogsTableHeader
          searchValue={searchValue}
          entityType={entityType}
          action={action}
          isActiveOnly={isActiveOnly}
          sort={sort}
          sortOptions={sortOptions}
          setSearchValue={setSearchValue}
          setEntityType={setEntityType}
          setAction={setAction}
          setIsActiveOnly={setIsActiveOnly}
          setSort={setSort}
          clearFilters={clearFilters}
          loading={loading}
        />

        <div className="px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search changelogs..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Separator />

        <div className="px-4">
          <div className="text-sm text-muted-foreground mb-4">
            {pagination ? pagination.total : changelogs.length} changelog
            {(pagination ? pagination.total : changelogs.length) !== 1 ? "s" : ""} found
          </div>

          {changelogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No changelogs found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Version</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center w-[120px]">Fields</TableHead>
                  <TableHead>Changed By</TableHead>
                  <TableHead>Changed At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right w-[80px]">Options</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changelogs.map((changelog) => {
                  const { entityVersion, dataVersion } = getVersionInfo(changelog)
                  const fieldsChanged = Array.isArray(changelog.changes) ? changelog.changes.length : 0

                  return (
                    <TableRow key={changelog.changeLogId} className={cn(!changelog.isActive && "opacity-60")}>
                      <TableCell>
                        <Button
                          variant="link"
                          className="px-0 font-medium"
                          onClick={() => setVersionPreview(changelog)}
                        >
                          {dataVersion !== null ? (
                            <div className="flex flex-col items-start">
                              <span className="text-sm">Data v{dataVersion}</span>
                              <span className="text-xs text-muted-foreground">Entity v{entityVersion}</span>
                            </div>
                          ) : (
                            <span>Entity v{entityVersion}</span>
                          )}
                        </Button>
                        <div className="text-xs text-muted-foreground">
                          {changelog.parentVersion !== null ? `Parent: v${changelog.parentVersion}` : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {entityTypeLabels[changelog.entityType as keyof typeof entityTypeLabels] ||
                              changelog.entityType}
                          </span>
                          <span className="text-xs text-muted-foreground break-all">{changelog.entityId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={actionColors[changelog.action]}>
                          {changelog.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[260px]">
                        <div className="text-sm text-muted-foreground line-clamp-3">
                          {changelog.description || "No description provided"}
                        </div>
                        {changelog.changeReason && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">Reason:</span> {changelog.changeReason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="w-fit">
                          {fieldsChanged}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{changelog.userName || "Unknown user"}</span>
                          {changelog.userEmail && (
                            <span className="text-xs text-muted-foreground">{changelog.userEmail}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(changelog.dateOfChange), "PPp")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "w-fit",
                            changelog.isActive
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20",
                          )}
                        >
                          {changelog.isActive ? "Active" : "Superseded"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <ChangelogsTableRowActions
                          changelog={changelog}
                          onView={() => viewDetails(changelog)}
                          onRollback={() => onRollback(changelog.entityId, changelog.version)}
                          onExport={() => onExport(changelog)}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col gap-2 px-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={cn("cursor-pointer", currentPage === 1 && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>

                {renderPageNumbers()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
                    className={cn(
                      "cursor-pointer",
                      currentPage === pagination.totalPages && "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className="text-sm text-muted-foreground text-center">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, pagination.total)}{" "}
              of {pagination.total} entries
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!versionPreview} onOpenChange={(open) => !open && setVersionPreview(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {versionPreview &&
                (() => {
                  const { entityVersion, dataVersion } = getVersionInfo(versionPreview)
                  return dataVersion !== null
                    ? `Data Version v${dataVersion} (Entity v${entityVersion})`
                    : `Entity Version v${entityVersion}`
                })()}
            </DialogTitle>
            <DialogDescription>
              {versionPreview
                ? `${
                    entityTypeLabels[versionPreview.entityType as keyof typeof entityTypeLabels] ||
                    versionPreview.entityType
                  } • ${versionPreview.action}`
                : "Field level changes for the selected version"}
            </DialogDescription>
          </DialogHeader>

          {versionPreview && (
            <div className="space-y-4">
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">Entity</Label>
                  <p className="mt-1 break-all">
                    {entityTypeLabels[versionPreview.entityType as keyof typeof entityTypeLabels] ||
                      versionPreview.entityType}
                    {" · "}
                    {versionPreview.entityId}
                  </p>
                </div>
                {(() => {
                  const { entityVersion, dataVersion } = getVersionInfo(versionPreview)
                  return dataVersion !== null ? (
                    <>
                      <div>
                        <Label className="text-xs text-muted-foreground">Data Version</Label>
                        <p className="mt-1 font-medium">v{dataVersion}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Entity Version</Label>
                        <p className="mt-1">v{entityVersion}</p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <Label className="text-xs text-muted-foreground">Entity Version</Label>
                      <p className="mt-1">v{entityVersion}</p>
                    </div>
                  )
                })()}
                <div>
                  <Label className="text-xs text-muted-foreground">Changed By</Label>
                  <p className="mt-1">
                    {versionPreview.userName || "Unknown user"}
                    {versionPreview.userEmail ? ` • ${versionPreview.userEmail}` : ""}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Changed On</Label>
                  <p className="mt-1">{format(new Date(versionPreview.dateOfChange), "PPpp")}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <p className="mt-1">{versionPreview.isActive ? "Active" : "Superseded"}</p>
                </div>
                {versionPreview.parentVersion !== null && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Parent Version</Label>
                    <p className="mt-1">v{versionPreview.parentVersion}</p>
                  </div>
                )}
                {versionPreview.mergedFromVersion !== null && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Merged From</Label>
                    <p className="mt-1">v{versionPreview.mergedFromVersion}</p>
                  </div>
                )}
                {versionPreview.changeReason && (
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Reason</Label>
                    <p className="mt-1">{versionPreview.changeReason}</p>
                  </div>
                )}
              </div>

              <Separator />

              <Label className="text-xs text-muted-foreground">
                Changed Fields ({Array.isArray(versionPreview.changes) ? versionPreview.changes.length : 0})
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
                    {Array.isArray(versionPreview.changes) && versionPreview.changes.length > 0 ? (
                      versionPreview.changes.map((change: any, index: number) => (
                        <TableRow key={`${versionPreview.changeLogId}-${index}`}>
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
                          No field-level changes recorded for this version.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
              {entityHistory.map((version) => {
                const { entityVersion, dataVersion } = getVersionInfo(version)
                return (
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
                          {dataVersion !== null ? (
                            <>
                              <Badge variant="outline">Data v{dataVersion}</Badge>
                              <Badge variant="outline" className="bg-muted">
                                Entity v{entityVersion}
                              </Badge>
                            </>
                          ) : (
                            <Badge variant="outline">Entity v{entityVersion}</Badge>
                          )}
                          {!version.isActive && (
                            <Badge variant="outline" className="bg-gray-500/10">
                              Superseded
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRollback(version.entityId, version.version)}
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
                )
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
