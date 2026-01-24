"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { MoreVertical, Search } from "lucide-react"

import { Loader } from "@/components/loader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { ChangelogsTableHeader } from "./changelogs-table-header"
import {
  type ChangeLogType,
  type DataVersionSummary,
  type UseChangelogsTableParams,
  useChangelogsTable,
} from "../hooks/use-changelogs-table"
import { resolveEntityTitle } from "@/lib/changelog-utils"
import axios from "axios"
import { useAlertModal } from "@/hooks/use-alert-modal"

type Props = UseChangelogsTableParams & { isSuperUser: boolean }

const entityTypeLabels: Record<string, string> = {
  script: "Script",
  screen: "Screen",
  diagnosis: "Diagnosis",
  config_key: "Config Key",
  drugs_library: "Drugs Library",
  data_key: "Data Key",
  alias: "Alias",
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

const actionBadgeClasses: Record<string, string> = {
  create: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  update: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  delete: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
  publish: "border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400",
  restore: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rollback: "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
  merge: "border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
}

const defaultActionBadgeClass = "border-muted bg-muted text-muted-foreground"

function formatEntitySummary(entry: DataVersionSummary) {
  const items = Object.entries(entry.entityCounts).sort(([, countA], [, countB]) => countB - countA)

  if (!items.length) return "—"

  return items
    .map(([entityType, count]) => {
      const label = entityTypeLabels[entityType] || entityType
      return `${count} ${label}${count === 1 ? "" : "s"}`
    })
    .join(" • ")
}

function renderActionBadges(entry: DataVersionSummary) {
  const items = Object.entries(entry.actionCounts)
    .filter(([, count]) => count > 0)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 4)

  if (!items.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(([action, count]) => (
        <Badge
          key={action}
          variant="outline"
          className={cn(
            "capitalize",
            actionBadgeClasses[action] ?? defaultActionBadgeClass,
          )}
        >
          {count} {actionLabels[action] || action}
        </Badge>
      ))}
    </div>
  )
}

function buildDetailsHref(dataVersion: number) {
  return `/changelogs/v${dataVersion}`
}

export function ChangelogsTable(props: Props) {
  const {
    dataVersions,
    totalDataVersions,
    loading,
    searchValue,
    entityType,
    action,
    isActiveOnly,
    applyFiltersToCounts,
    sort,
    pagination,
    currentPage,
    itemsPerPage,
    sortOptions,
    setSearchValue,
    setEntityType,
    setAction,
    setIsActiveOnly,
    setApplyFiltersToCounts,
    setSort,
    setCurrentPage,
    loadChangelogs,
    clearFilters,
    detailsByVersion,
    detailsLoadingByVersion,
    loadVersionDetails,
  } = useChangelogsTable(props)

  const { isSuperUser } = props

  const router = useRouter()
  const { alert } = useAlertModal()
  const [rollbacking, setRollbacking] = useState<number | null>(null)
  const [pendingRollbackEntry, setPendingRollbackEntry] = useState<DataVersionSummary | null>(null)
  const [showEntityDetails, setShowEntityDetails] = useState(false)
  const [softDeleteCreated, setSoftDeleteCreated] = useState(false)

  useEffect(() => {
    if (pendingRollbackEntry) {
      loadVersionDetails(pendingRollbackEntry.dataVersion)
    }
  }, [loadVersionDetails, pendingRollbackEntry])

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
          <PaginationLink onClick={() => handlePageChange(pageNum)} isActive={pageNum === page} className="cursor-pointer">
            {pageNum}
          </PaginationLink>
        </PaginationItem>
      )
    })
  }

  const handleNavigate = (version: number) => {
    router.push(buildDetailsHref(version))
  }

  const handleRollbackDataVersion = async (dataVersion: number) => {
    if (dataVersion < 2) return

    try {
      setRollbacking(dataVersion)
      const res = await axios.post("/api/changelogs/rollback-data-version", {
        dataVersion,
        changeReason: `Rollback release v${dataVersion} to v${dataVersion - 1}`,
        createdEntityPolicy: softDeleteCreated ? "soft_delete" : "keep",
      })

      if (res.data?.errors?.length) {
        throw new Error(res.data.errors.join(", "))
      }

      alert({
        title: "Rollback queued",
        message: `Release v${dataVersion} will be rolled back to the state of v${dataVersion - 1}. New release v${dataVersion + 1} will be created. Refreshing...`,
        variant: "success",
        onClose: () => window.location.reload(),
      })
    } catch (e: any) {
      alert({
        title: "Rollback failed",
        message: e.message || "An unexpected error occurred.",
        variant: "error",
      })
    } finally {
      setRollbacking(null)
      setPendingRollbackEntry(null)
      setSoftDeleteCreated(false)
    }
  }

  const renderEntityImpactList = (entry: DataVersionSummary) => {
    const items = Object.entries(entry.entityCounts)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)

    if (!items.length) return <p className="text-sm text-muted-foreground">No entities recorded.</p>

    return (
      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
        {items.map(([entityType, count]) => (
          <li key={entityType}>
            {count} {entityTypeLabels[entityType] || entityType}
          </li>
        ))}
      </ul>
    )
  }

  const renderEntityDetails = (entry: DataVersionSummary, details?: ChangeLogType[]) => {
    if (!details || details.length === 0) {
      return <p className="text-sm text-muted-foreground">No entity details available.</p>
    }

    const groups = details.reduce<Record<string, { label: string; items: string[] }>>((acc, change) => {
      const key = change.entityType
      const label = entityTypeLabels[key] || key
      const title = resolveEntityTitle(change) || change.entityId
      if (!acc[key]) acc[key] = { label, items: [] }
      acc[key].items.push(`${title} (${change.entityId})`)
      return acc
    }, {})

    const groupEntries = Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
    if (!groupEntries.length) return null

    return (
      <div className="space-y-3">
        {groupEntries.map(([key, group]) => (
          <div key={key}>
            <p className="text-sm font-semibold text-foreground">{group.label}</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {group.items.map((item, idx) => (
                <li key={`${key}-${idx}`}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {(loading || rollbacking !== null) && <Loader overlay />}

      <div className="flex flex-col gap-y-4">
        <ChangelogsTableHeader
          entityType={entityType}
          action={action}
          isActiveOnly={isActiveOnly}
          applyFiltersToCounts={applyFiltersToCounts}
          sort={sort}
          sortOptions={sortOptions}
          setEntityType={setEntityType}
          setAction={setAction}
          setIsActiveOnly={setIsActiveOnly}
          setApplyFiltersToCounts={setApplyFiltersToCounts}
          setSort={setSort}
          clearFilters={clearFilters}
          loading={loading}
          onRefresh={loadChangelogs}
        />

        <div className="px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search releases, publishers or entity ids..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Separator />

        <div className="px-4">
          <div className="text-sm text-muted-foreground mb-4">
            {totalDataVersions} data version{totalDataVersions === 1 ? "" : "s"} found
          </div>

          {dataVersions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No published versions match your filters.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Data Version</TableHead>
                  <TableHead className="w-[160px]">Change Summary</TableHead>
                  <TableHead>Entities Affected</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[200px]">Published By</TableHead>
                  <TableHead className="w-[170px]">Published At</TableHead>
                  <TableHead className="text-right w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataVersions.map((entry) => {
                  const publishedAt = entry.publishedAt ? format(new Date(entry.publishedAt), "PPpp") : "Unknown"
                  const descriptions = entry.descriptions.slice(0, 2)
                  const hasMoreDescriptions = entry.descriptions.length > descriptions.length
                  const versionLabel = `v${entry.dataVersion}`

                  return (
                    <TableRow
                      key={entry.dataVersion}
                      className="cursor-pointer transition-colors hover:bg-muted/60"
                      onClick={() => handleNavigate(entry.dataVersion)}
                    >
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-base font-semibold">{versionLabel}</span>
                          <Badge variant="outline" className="w-fit bg-muted text-muted-foreground">
                            {entry.totalChanges} change{entry.totalChanges === 1 ? "" : "s"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          {renderActionBadges(entry)}
                          {entry.rollbackSourceVersion ? (
                            <Badge
                              variant="outline"
                              className="w-fit border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400"
                              title={`This release restores the state from data version v${entry.rollbackSourceVersion}.`}
                            >
                              State of v{entry.rollbackSourceVersion}
                            </Badge>
                          ) : entry.isLatestVersion ? (
                            <Badge
                              variant="outline"
                              className="w-fit border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              title="This release is the latest published version."
                            >
                              Active version
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="w-fit border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                              title="A newer release has replaced this version."
                            >
                              Superseded
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">{formatEntitySummary(entry)}</div>
                      </TableCell>
                      <TableCell className="max-w-[260px]">
                        {descriptions.length > 0 ? (
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {descriptions.map((description, index) => (
                              <p key={index} className="line-clamp-2">
                                {description}
                              </p>
                            ))}
                            {hasMoreDescriptions && <p className="text-xs italic">+ more changes</p>}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No description provided</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{entry.publishedByName || "Unknown user"}</span>
                          {entry.publishedByEmail && (
                            <span className="text-xs text-muted-foreground">{entry.publishedByEmail}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{publishedAt}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
                            <Button variant="outline" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                            <DropdownMenuItem
                              onClick={() => handleNavigate(entry.dataVersion)}
                              className="cursor-pointer"
                            >
                              View details
                            </DropdownMenuItem>
                            {isSuperUser && entry.isLatestVersion && entry.dataVersion > 1 && (
                              <DropdownMenuItem
                                disabled={rollbacking === entry.dataVersion}
                                onClick={() => setPendingRollbackEntry(entry)}
                                className="cursor-pointer text-orange-600 focus:text-orange-700"
                              >
                                {rollbacking === entry.dataVersion
                                  ? "Rolling back..."
                                  : `Rollback to v${entry.dataVersion - 1}`}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                      currentPage === pagination.totalPages && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className="text-sm text-muted-foreground text-center">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} releases
            </div>
          </div>
        )}
      </div>

      <AlertDialog
        open={pendingRollbackEntry !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingRollbackEntry(null)
            setShowEntityDetails(false)
            setSoftDeleteCreated(false)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Danger: rollback release</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                {pendingRollbackEntry && (
                  <>
                    <p>
                      You are about to publish a rollback for release v{pendingRollbackEntry.dataVersion}, restoring the state
                      of the previous release. This will publish a new release v{pendingRollbackEntry.dataVersion + 1}.
                    </p>
                    {rollbacking !== null && (
                      <p className="text-sm text-muted-foreground">Rollback in progress. Please wait...</p>
                    )}
                    <div>
                      <p className="font-medium text-foreground mb-1">Entities affected:</p>
                      {renderEntityImpactList(pendingRollbackEntry)}
                      <div className="mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-0 text-primary"
                          onClick={() => setShowEntityDetails((prev) => !prev)}
                        >
                          {showEntityDetails ? "Hide entity list" : "View entity list"}
                        </Button>
                      </div>
                      {showEntityDetails && (
                        <div className="mt-2 max-h-56 overflow-y-auto pr-2">
                          {detailsLoadingByVersion[pendingRollbackEntry.dataVersion] ? (
                            <p className="text-sm text-muted-foreground">Loading entity details...</p>
                          ) : (
                            renderEntityDetails(
                              pendingRollbackEntry,
                              detailsByVersion[pendingRollbackEntry.dataVersion],
                            )
                          )}
                        </div>
                      )}
                    </div>
                    <div className="pt-1">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={softDeleteCreated}
                          onChange={(event) => setSoftDeleteCreated(event.target.checked)}
                          className="rounded"
                          disabled={rollbacking !== null}
                        />
                        <span>Soft delete items created in this release</span>
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Newly created entities with no prior snapshot will be marked deleted instead of kept.
                      </p>
                    </div>
                  </>
                )}
                <p className="font-semibold text-foreground">
                  Do not proceed unless you are absolutely sure what you are doing.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingRollbackEntry(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={rollbacking !== null}
              onClick={() => {
                if (pendingRollbackEntry !== null) {
                  handleRollbackDataVersion(pendingRollbackEntry.dataVersion)
                }
              }}
            >
              Proceed with rollback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
