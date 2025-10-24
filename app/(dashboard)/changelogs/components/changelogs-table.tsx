"use client"

import { format } from "date-fns"
import { History, AlertCircle, ChevronDown, ChevronRight, RotateCcw } from "lucide-react"

import { Loader } from "@/components/loader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"
import { ChangelogsTableRowActions } from "./changelogs-table-row-actions"
import { ChangelogsTableHeader } from "./changelogs-table-header"
import { type UseChangelogsTableParams, useChangelogsTable } from "../hooks/use-changelogs-table"

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

export function ChangelogsTable(props: Props) {
  const {
    changelogs,
    loading,
    expandedItems,
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
    toggleExpanded,
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Changelog History
            </CardTitle>
            <CardDescription>
              {pagination ? pagination.total : changelogs.length} changelog
              {(pagination ? pagination.total : changelogs.length) !== 1 ? "s" : ""} found
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
                              <ChangelogsTableRowActions
                                changelog={changelog}
                                onView={() => viewDetails(changelog)}
                                onRollback={() => onRollback(changelog.entityId, changelog.version)}
                                onExport={() => onExport(changelog)}
                              />
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

        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col gap-2">
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
                      currentPage === pagination.totalPages && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className="text-sm text-muted-foreground text-center">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} entries
            </div>
          </div>
        )}
      </div>

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
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}