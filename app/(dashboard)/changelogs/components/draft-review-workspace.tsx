"use client"

import Link from "next/link"
import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import {
  AlertTriangle,
  ArrowRight,
  Download,
  ExternalLink,
  Eye,
  FileStack,
  Filter,
  FolderTree,
  Search,
  Sparkles,
  Users,
} from "lucide-react"

import type {
  PendingDraftQueueEntry,
  PendingDraftQueueGroupBy,
  PendingDraftQueueMeta,
  PendingDraftQueueSort,
  PendingDraftQueueSummary,
  PendingDraftQueueTab,
} from "@/app/actions/ops"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const entityLabels: Record<PendingDraftQueueEntry["entityType"], string> = {
  script: "Script",
  screen: "Screen",
  diagnosis: "Diagnosis",
  problem: "Problem",
  config_key: "Config Key",
  hospital: "Hospital",
  drugs_library: "Drugs Library",
  data_key: "Data Key",
  alias: "Alias",
}

const actionBadgeClasses: Record<PendingDraftQueueEntry["action"], string> = {
  create: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  update: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  delete: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
}

type Props = {
  entries: PendingDraftQueueEntry[]
  summary: PendingDraftQueueSummary
  meta: PendingDraftQueueMeta
}

function formatEntityMix(entityCounts: PendingDraftQueueSummary["entityCounts"]) {
  const items = Object.entries(entityCounts).sort(([, a], [, b]) => b - a)
  if (!items.length) return "No pending entities"
  return items
    .slice(0, 5)
    .map(([entityType, count]) => `${count} ${entityLabels[entityType as PendingDraftQueueEntry["entityType"]] || entityType}`)
    .join(" | ")
}

function buildCsv(entries: PendingDraftQueueEntry[]) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
  const header = [
    "title",
    "action",
    "entity_type",
    "entity_id",
    "group",
    "creator",
    "status",
    "changed_fields",
    "conflicts",
    "age_days",
  ]
  const rows = entries.map((entry) =>
    [
      entry.title,
      entry.action,
      entry.entityType,
      entry.entityId,
      entry.reviewGroupLabel,
      entry.createdByName,
      entry.statusLabel,
      entry.changedFields.join("; "),
      entry.conflictLabels.join("; "),
      String(entry.ageInDays),
    ].map((value) => escape(value)).join(","),
  )

  return [header.join(","), ...rows].join("\n")
}

function getGroupValue(entry: PendingDraftQueueEntry, groupBy: PendingDraftQueueGroupBy) {
  if (groupBy === "creator") return { id: `creator:${entry.createdByUserId || entry.createdByName}`, label: entry.createdByName }
  if (groupBy === "entity") return { id: `entity:${entry.entityType}`, label: entityLabels[entry.entityType] }
  return { id: entry.reviewGroupId, label: entry.reviewGroupLabel }
}

export function DraftReviewWorkspace({ entries, summary, meta }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(meta.filters.query)
  const deferredSearchValue = useDeferredValue(searchValue)

  useEffect(() => {
    setSearchValue(meta.filters.query)
  }, [meta.filters.query])

  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all" || (key === "scope" && value === "mine") || (key === "groupBy" && value === "parent") || (key === "sort" && value === "recent")) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    if (!updates.page) params.delete("page")

    startTransition(() => {
      router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname)
    })
  }

  useEffect(() => {
    const current = searchParams?.get("q") || ""
    if (deferredSearchValue === current) return
    const handle = window.setTimeout(() => {
      updateQuery({ q: deferredSearchValue || null, page: "1" })
    }, 250)
    return () => window.clearTimeout(handle)
  }, [deferredSearchValue])

  const groupedEntries = useMemo(() => {
    const groups = new Map<
      string,
      {
        id: string
        label: string
        entries: PendingDraftQueueEntry[]
      }
    >()

    entries.forEach((entry) => {
      const group = getGroupValue(entry, meta.filters.groupBy)
      const existing = groups.get(group.id) || { ...group, entries: [] }
      existing.entries.push(entry)
      groups.set(group.id, existing)
    })

    return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [entries, meta.filters.groupBy])

  const openVisibleEditors = () => {
    const hrefs = Array.from(new Set(entries.map((entry) => entry.href).filter(Boolean))).slice(0, 10)
    hrefs.forEach((href) => window.open(href as string, "_blank", "noopener,noreferrer"))
  }

  const exportVisibleEntries = () => {
    const blob = new Blob([buildCsv(entries)], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "draft-queue.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-500/15 bg-blue-500/5">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileStack className="h-5 w-5" />
            {summary.scopeLabel}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            This queue is built from server draft tables and pending deletions. It reflects what the backend can publish, not local browser-only edits.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-6">
            <div className="rounded-lg border bg-background/80 p-4">
              <div className="text-sm text-muted-foreground">Queue Entries</div>
              <div className="mt-1 text-2xl font-semibold">{summary.totalEntries}</div>
            </div>
            <div className="rounded-lg border bg-background/80 p-4">
              <div className="text-sm text-muted-foreground">Draft Rows</div>
              <div className="mt-1 text-2xl font-semibold">{summary.totalDrafts}</div>
            </div>
            <div className="rounded-lg border bg-background/80 p-4">
              <div className="text-sm text-muted-foreground">Deletes Queued</div>
              <div className="mt-1 text-2xl font-semibold">{summary.totalDeletes}</div>
            </div>
            <div className="rounded-lg border bg-background/80 p-4">
              <div className="text-sm text-muted-foreground">New Drafts</div>
              <div className="mt-1 text-2xl font-semibold">{summary.totalCreates}</div>
            </div>
            <div className="rounded-lg border bg-background/80 p-4">
              <div className="text-sm text-muted-foreground">Updates</div>
              <div className="mt-1 text-2xl font-semibold">{summary.totalUpdates}</div>
            </div>
            <div className="rounded-lg border bg-background/80 p-4">
              <div className="text-sm text-muted-foreground">Risks</div>
              <div className="mt-1 text-2xl font-semibold">{summary.conflictEntries + summary.staleEntries}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{summary.uniqueEntities} unique entities affected</span>
            </div>
            <span>|</span>
            <span>{formatEntityMix(summary.entityCounts)}</span>
            {!!summary.staleEntries && (
              <>
                <span>|</span>
                <span>{summary.staleEntries} stale drafts</span>
              </>
            )}
            {!!summary.conflictEntries && (
              <>
                <span>|</span>
                <span>{summary.conflictEntries} conflict warnings</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="sticky top-20 z-[1] border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <Tabs value={meta.filters.tab} onValueChange={(value) => updateQuery({ tab: value, page: "1" })}>
              <TabsList className="grid w-full grid-cols-5 xl:w-auto">
                {(["all", "creates", "updates", "deletes", "mine"] as PendingDraftQueueTab[]).map((tab) => (
                  <TabsTrigger key={tab} value={tab} className="capitalize">
                    {tab === "mine" ? "Mine" : tab}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {meta.tabCounts[tab]}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={openVisibleEditors} disabled={!entries.some((entry) => entry.href)}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Open visible editors
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={exportVisibleEntries} disabled={!entries.length}>
                <Download className="mr-2 h-4 w-4" />
                Export current view
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4" />
            Filters
            {isPending && <span className="text-xs text-muted-foreground">Updating…</span>}
          </div>
          <div className="grid gap-3 xl:grid-cols-6">
            <div className="relative xl:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search titles, entity ids, scripts, or creators..."
                className="pl-10"
              />
            </div>
            <Select value={meta.filters.scope} onValueChange={(value) => updateQuery({ scope: value, page: "1" })}>
              <SelectTrigger>
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mine">My queue</SelectItem>
                <SelectItem value="all">Team queue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={meta.filters.entityType} onValueChange={(value) => updateQuery({ entityType: value, page: "1" })}>
              <SelectTrigger>
                <SelectValue placeholder="Entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entity types</SelectItem>
                {meta.entityTypes.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label} ({option.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={meta.filters.creator} onValueChange={(value) => updateQuery({ creator: value, page: "1" })}>
              <SelectTrigger>
                <SelectValue placeholder="Creator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All creators</SelectItem>
                {meta.creators.map((creator) => (
                  <SelectItem key={creator.value} value={creator.value}>
                    {creator.label} ({creator.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={meta.filters.sort} onValueChange={(value) => updateQuery({ sort: value, page: "1" })}>
              <SelectTrigger>
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {[
                  ["recent", "Newest first"],
                  ["oldest", "Oldest first"],
                  ["creator", "Creator"],
                  ["entity", "Entity type"],
                  ["title", "Title"],
                  ["action", "Action"],
                ].map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={meta.filters.groupBy} onValueChange={(value) => updateQuery({ groupBy: value, page: "1" })}>
              <SelectTrigger>
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Group by parent</SelectItem>
                <SelectItem value="creator">Group by creator</SelectItem>
                <SelectItem value="entity">Group by entity type</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-lg font-semibold">
              {meta.pagination.totalEntries === 0 && !meta.filters.query && meta.filters.entityType === "all" && meta.filters.creator === "all"
                ? "There are no draft queue entries right now"
                : "No draft entries match the current filters"}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {meta.pagination.totalEntries === 0 && !meta.filters.query && meta.filters.entityType === "all" && meta.filters.creator === "all"
                ? "When drafts or pending deletions exist, they will appear here with review context and publish impact."
                : "Try a different search term, switch tabs, or clear one of the filters above."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {groupedEntries.map((group) => {
            const groupCreates = group.entries.filter((entry) => entry.action === "create").length
            const groupUpdates = group.entries.filter((entry) => entry.action === "update").length
            const groupDeletes = group.entries.filter((entry) => entry.action === "delete").length
            const groupConflicts = group.entries.filter((entry) => entry.conflictLabels.length > 0).length

            return (
              <Card key={group.id} className="overflow-hidden">
                <CardHeader className="border-b bg-muted/20">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FolderTree className="h-5 w-5" />
                        {group.label}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {group.entries.length} queue {group.entries.length === 1 ? "entry" : "entries"} on this page
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!!groupCreates && <Badge variant="outline">{groupCreates} creates</Badge>}
                      {!!groupUpdates && <Badge variant="outline">{groupUpdates} updates</Badge>}
                      {!!groupDeletes && <Badge variant="outline">{groupDeletes} deletes</Badge>}
                      {!!groupConflicts && (
                        <Badge variant="outline" className="border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400">
                          {groupConflicts} warnings
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-5">
                  {group.entries.map((entry) => (
                    <div key={entry.id} className="rounded-xl border p-4">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={actionBadgeClasses[entry.action]}>
                              {entry.action}
                            </Badge>
                            <Badge variant="outline" className="bg-muted text-muted-foreground">
                              {entityLabels[entry.entityType]}
                            </Badge>
                            <Badge variant="outline" className="bg-muted text-muted-foreground">
                              {entry.statusLabel}
                            </Badge>
                            {entry.isUnpublished && (
                              <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                                New entity
                              </Badge>
                            )}
                            {!entry.isUnpublished && entry.source === "draft" && (
                              <Badge variant="outline" className="border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400">
                                Published entity with draft
                              </Badge>
                            )}
                            {entry.action === "delete" && (
                              <Badge variant="outline" className="border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400">
                                Delete at next publish
                              </Badge>
                            )}
                            {entry.isStale && (
                              <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                                <Sparkles className="mr-1 h-3 w-3" />
                                Stale
                              </Badge>
                            )}
                          </div>

                          <div>
                            <div className="text-lg font-semibold">{entry.title}</div>
                            <div className="mt-1 text-sm text-muted-foreground">{entry.description}</div>
                          </div>

                          <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-3">
                            <div>
                              <span className="font-medium text-foreground">Entity ID:</span> {entry.entityId}
                            </div>
                            <div>
                              <span className="font-medium text-foreground">Creator:</span> {entry.createdByName}
                              {entry.createdByEmail ? ` | ${entry.createdByEmail}` : ""}
                            </div>
                            {entry.parentTitle && (
                              <div>
                                <span className="font-medium text-foreground">Parent:</span> {entry.parentTitle}
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-foreground">Activity:</span>{" "}
                              {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                            </div>
                            {entry.changedFieldCount > 0 && (
                              <div>
                                <span className="font-medium text-foreground">Changed fields:</span> {entry.changedFieldCount}
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-foreground">Review group:</span> {entry.reviewGroupLabel}
                            </div>
                          </div>

                          {(entry.conflictLabels.length > 0 || entry.infoLabels.length > 0) && (
                            <div className="space-y-2">
                              {entry.conflictLabels.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {entry.conflictLabels.map((label) => (
                                    <Badge
                                      key={label}
                                      variant="outline"
                                      className="border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400"
                                    >
                                      <AlertTriangle className="mr-1 h-3 w-3" />
                                      {label}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {entry.infoLabels.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {entry.infoLabels.map((label) => (
                                    <Badge key={label} variant="outline" className="bg-muted text-muted-foreground">
                                      {label}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {entry.changedFields.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {entry.changedFields.map((field) => (
                                <Badge key={field} variant="outline" className="bg-background">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 xl:justify-end">
                          {entry.diffPreview.length > 0 && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button type="button" variant="outline" size="sm">
                                  <Eye className="mr-2 h-4 w-4" />
                                  Review diff
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>{entry.title}</DialogTitle>
                                  <DialogDescription>
                                    {entry.changedFieldCount
                                      ? `${entry.changedFieldCount} changed ${entry.changedFieldCount === 1 ? "field" : "fields"} in this draft.`
                                      : "Preview of the draft payload."}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-3">
                                  {entry.diffPreview.map((preview) => (
                                    <div key={preview.field} className="rounded-lg border p-3">
                                      <div className="font-medium">{preview.field}</div>
                                      <div className="mt-2 grid gap-3 md:grid-cols-2">
                                        <div className="rounded-md bg-muted/40 p-3">
                                          <div className="text-xs uppercase tracking-wide text-muted-foreground">Before</div>
                                          <div className="mt-1 text-sm">{preview.before}</div>
                                        </div>
                                        <div className="rounded-md bg-blue-500/5 p-3">
                                          <div className="text-xs uppercase tracking-wide text-muted-foreground">After</div>
                                          <div className="mt-1 text-sm">{preview.after}</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          {entry.href && (
                            <Button asChild variant="outline" size="sm">
                              <Link href={entry.href}>
                                Open editor
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          {entry.parentHref && (
                            <Button asChild variant="ghost" size="sm">
                              <Link href={entry.parentHref}>Open parent</Link>
                            </Button>
                          )}
                          {entry.searchHref && (
                            <Button asChild variant="ghost" size="sm">
                              <Link href={entry.searchHref}>
                                Search history
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={!meta.pagination.hasPreviousPage}
                  className={!meta.pagination.hasPreviousPage ? "pointer-events-none opacity-50" : ""}
                  onClick={(event) => {
                    event.preventDefault()
                    if (meta.pagination.hasPreviousPage) updateQuery({ page: String(meta.pagination.page - 1) })
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-3 text-sm text-muted-foreground">
                  Page {meta.pagination.page} of {meta.pagination.totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={!meta.pagination.hasNextPage}
                  className={!meta.pagination.hasNextPage ? "pointer-events-none opacity-50" : ""}
                  onClick={(event) => {
                    event.preventDefault()
                    if (meta.pagination.hasNextPage) updateQuery({ page: String(meta.pagination.page + 1) })
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
