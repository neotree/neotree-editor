"use client"

import Link from "next/link"
import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { AlertTriangle, ArrowLeft, ArrowRight, Download, ExternalLink, Eye, MoreVertical, Search } from "lucide-react"

import type {
  PendingDraftQueueEntry,
  PendingDraftQueueGroupBy,
  PendingDraftQueueMeta,
  PendingDraftQueueSummary,
  PendingDraftQueueTab,
} from "@/app/actions/ops"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { TablePagination } from "@/components/table-pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

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

const actionPanelClasses: Record<PendingDraftQueueEntry["action"], string> = {
  create: "border-l-emerald-500 bg-emerald-500/[0.03]",
  update: "border-l-blue-500 bg-blue-500/[0.03]",
  delete: "border-l-red-500 bg-red-500/[0.03]",
}

const entityBadgeClasses: Record<PendingDraftQueueEntry["entityType"], string> = {
  script: "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
  screen: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  diagnosis: "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  problem: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  config_key: "border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  hospital: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  drugs_library: "border-teal-500/20 bg-teal-500/10 text-teal-700 dark:text-teal-300",
  data_key: "border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  alias: "border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
}

const friendlyFieldLabels: Record<string, string> = {
  key: "Key",
  keyId: "Key ID",
  label: "Display label",
  name: "Name",
  title: "Title",
  printTitle: "Printed title",
  sectionTitle: "Section title",
  previewTitle: "Preview title",
  positiveLabel: "Positive answer label",
  negativeLabel: "Negative answer label",
  refId: "Reference ID",
  refIdLabel: "Reference label",
  drug: "Drug, fluid, or feed name",
  position: "Display order",
}

type Props = {
  entries: PendingDraftQueueEntry[]
  summary: PendingDraftQueueSummary
  meta: PendingDraftQueueMeta
}

type DraftEntryGroup = {
  id: string
  label: string
  entries: PendingDraftQueueEntry[]
}

function buildCsv(entries: PendingDraftQueueEntry[]) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
  const header = ["title", "action", "entity_type", "entity_id", "group", "creator", "status", "changed_fields", "conflicts", "age_days"]
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
    ]
      .map((value) => escape(value))
      .join(","),
  )

  return [header.join(","), ...rows].join("\n")
}

function getGroupValue(entry: PendingDraftQueueEntry, groupBy: PendingDraftQueueGroupBy) {
  if (groupBy === "creator")
    return {
      id: `creator:${entry.createdByUserId || entry.createdByName}`,
      label: entry.createdByName,
    }
  if (groupBy === "entity")
    return {
      id: `entity:${entry.entityType}`,
      label: entityLabels[entry.entityType],
    }
  return { id: entry.reviewGroupId, label: entry.reviewGroupLabel }
}

function summarizeGroup(entries: PendingDraftQueueEntry[]) {
  const entityCounts = entries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.entityType] = (acc[entry.entityType] || 0) + 1
    return acc
  }, {})
  return {
    creates: entries.filter((entry) => entry.action === "create").length,
    updates: entries.filter((entry) => entry.action === "update").length,
    deletes: entries.filter((entry) => entry.action === "delete").length,
    warnings: entries.filter((entry) => entry.isStale || entry.conflictLabels.length > 0).length,
    changedFields: entries.reduce((acc, entry) => acc + entry.changedFieldCount, 0),
    latestAt: entries.reduce(
      (latest, entry) => (new Date(entry.createdAt).getTime() > new Date(latest).getTime() ? entry.createdAt : latest),
      entries[0]?.createdAt,
    ),
    entityCounts,
  }
}

function isScriptScopedGroup(groupId: string) {
  return groupId.startsWith("parent:") || groupId.startsWith("script:")
}

function getFriendlyFieldLabel(field: string) {
  return friendlyFieldLabels[field] || field.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/_/g, " ")
}

function getDraftDiffHref(entry: PendingDraftQueueEntry) {
  return `/changelogs/pending/${encodeURIComponent(entry.id)}`
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
      if (
        !value ||
        value === "all" ||
        (key === "scope" && value === "mine") ||
        (key === "groupBy" && value === "parent") ||
        (key === "sort" && value === "recent")
      ) {
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

  const scriptScopedGroups = useMemo(() => groupedEntries.filter((group) => isScriptScopedGroup(group.id)), [groupedEntries])
  const standaloneGroups = useMemo(() => groupedEntries.filter((group) => !isScriptScopedGroup(group.id)), [groupedEntries])
  const shouldSplitScriptGroups = meta.filters.groupBy === "parent"

  const exportVisibleEntries = () => {
    const blob = new Blob([buildCsv(entries)], {
      type: "text/csv;charset=utf-8;",
    })
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
    <div className="space-y-4 pb-20">
      {!!(summary.conflictEntries + summary.staleEntries || summary.totalDeletes) && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
          <span className="font-semibold">Review needed before publishing.</span>{" "}
          {summary.totalDeletes ? `${summary.totalDeletes} queued delete ${summary.totalDeletes === 1 ? "change" : "changes"}. ` : ""}
          {summary.staleEntries ? `${summary.staleEntries} stale ${summary.staleEntries === 1 ? "draft" : "drafts"}. ` : ""}
          {summary.conflictEntries
            ? `${summary.conflictEntries} conflict ${summary.conflictEntries === 1 ? "warning" : "warnings"}.`
            : ""}
        </div>
      )}

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center gap-x-4">
            <Link href="/changelogs" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="text-2xl">Pending draft changes</span>
            <span className="ml-auto text-sm text-muted-foreground">
              {summary.totalEntries} pending &middot; {summary.scopeLabel}
            </span>
          </div>

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <Tabs value={meta.filters.tab} onValueChange={(value) => updateQuery({ tab: value, page: "1" })}>
              <TabsList className="grid w-full grid-cols-5 xl:w-auto">
                {(["all", "creates", "updates", "deletes", "mine"] as PendingDraftQueueTab[]).map((tab) => (
                  <TabsTrigger key={tab} value={tab} className="capitalize">
                    {tab === "mine" ? "Mine" : tab}
                    <span className="ml-2 text-xs text-muted-foreground">{meta.tabCounts[tab]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap items-center gap-2">
              {isPending && <span className="text-xs text-muted-foreground">Updating...</span>}
              <Button type="button" variant="outline" size="sm" onClick={exportVisibleEntries} disabled={!entries.length}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
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
              {meta.pagination.totalEntries === 0 &&
              !meta.filters.query &&
              meta.filters.entityType === "all" &&
              meta.filters.creator === "all"
                ? "There are no draft queue entries right now"
                : "No draft entries match the current filters"}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {meta.pagination.totalEntries === 0 &&
              !meta.filters.query &&
              meta.filters.entityType === "all" &&
              meta.filters.creator === "all"
                ? "When drafts or pending deletions exist, they will appear here with review context and publish impact."
                : "Try a different search term, switch tabs, or clear one of the filters above."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {shouldSplitScriptGroups ? (
            <>
              {scriptScopedGroups.length > 0 && (
                <DraftGroupSection
                  title="Affected Scripts"
                  description="Script-scoped drafts are grouped so screen, diagnosis, and problem updates stay traceable together."
                  groups={scriptScopedGroups}
                />
              )}
              {standaloneGroups.length > 0 && (
                <DraftGroupSection
                  title="Standalone Changes"
                  description="Drafts that are not naturally scoped to a script remain listed separately."
                  groups={standaloneGroups}
                />
              )}
            </>
          ) : (
            <DraftGroupSection
              title="Pending Draft Entries"
              description={`${meta.pagination.totalEntries} queue ${meta.pagination.totalEntries === 1 ? "entry" : "entries"} found.`}
              groups={groupedEntries}
            />
          )}

          <TablePagination
            page={meta.pagination.page}
            totalPages={meta.pagination.totalPages}
            total={meta.pagination.totalEntries}
            pageSize={meta.pagination.pageSize}
            itemNoun="pending changes"
            onPageChange={(page) => updateQuery({ page: String(page) })}
          />
        </div>
      )}
    </div>
  )
}

function DraftGroupSection({ title, description, groups }: { title: string; description: string; groups: DraftEntryGroup[] }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-3">
        {groups.map((group) => (
          <DraftGroupCard key={group.id} group={group} />
        ))}
      </div>
    </section>
  )
}

function DraftGroupCard({ group }: { group: DraftEntryGroup }) {
  const summary = summarizeGroup(group.entries)
  const entityBadges = Object.entries(summary.entityCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)

  return (
    <details className="rounded-lg border border-border/70 bg-background/80" open>
      <summary className="cursor-pointer list-none px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div>
              <div className="text-base font-semibold">{group.label}</div>
              <div className="text-xs text-muted-foreground">
                {group.entries.length} draft {group.entries.length === 1 ? "entry" : "entries"}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-muted text-muted-foreground">
                {summary.changedFields} changed fields
              </Badge>
              {!!summary.creates && (
                <Badge variant="outline" className={actionBadgeClasses.create}>
                  {summary.creates} creates
                </Badge>
              )}
              {!!summary.updates && (
                <Badge variant="outline" className={actionBadgeClasses.update}>
                  {summary.updates} updates
                </Badge>
              )}
              {!!summary.deletes && (
                <Badge variant="outline" className={actionBadgeClasses.delete}>
                  {summary.deletes} deletes
                </Badge>
              )}
              {entityBadges.map(([entityType, count]) => (
                <Badge
                  key={entityType}
                  variant="outline"
                  className={entityBadgeClasses[entityType as PendingDraftQueueEntry["entityType"]]}
                >
                  {count} {entityLabels[entityType as PendingDraftQueueEntry["entityType"]]}
                </Badge>
              ))}
              {!!summary.warnings && (
                <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  Needs review
                </Badge>
              )}
              {!summary.warnings && !summary.deletes && (
                <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  Ready to publish
                </Badge>
              )}
            </div>
          </div>
          {summary.latestAt && (
            <div className="text-sm text-muted-foreground">
              Latest change {formatDistanceToNow(new Date(summary.latestAt), { addSuffix: true })}
            </div>
          )}
        </div>
      </summary>
      <div className="border-t border-border/60">
        <div className="divide-y divide-border/60">
          {group.entries.map((entry) => (
            <DraftEntryRow key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </details>
  )
}

function DraftEntryRow({ entry }: { entry: PendingDraftQueueEntry }) {
  return (
    <div className={cn("border-l-4 px-4 py-4", actionPanelClasses[entry.action])}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{entry.title}</span>
            <Badge variant="outline" className={entityBadgeClasses[entry.entityType]}>
              {entityLabels[entry.entityType]}
            </Badge>
            <Badge variant="outline" className={actionBadgeClasses[entry.action]}>
              {entry.action}
            </Badge>
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              {entry.statusLabel}
            </Badge>
          </div>
          <div className="line-clamp-2 text-sm text-muted-foreground">{entry.description}</div>
          <div className="text-xs text-muted-foreground">
            {entry.entityId}
            {entry.parentTitle ? ` | ${entry.parentTitle}` : ""}
          </div>
          <div className="flex flex-wrap gap-2">
            {entry.changedFields.slice(0, 6).map((field) => (
              <Badge key={field} variant="outline" className="bg-background text-xs">
                {getFriendlyFieldLabel(field)}
              </Badge>
            ))}
            {entry.changedFields.length > 6 && (
              <Badge variant="outline" className="bg-background text-xs">
                +{entry.changedFields.length - 6}
              </Badge>
            )}
            {entry.isUnpublished && (
              <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                New entity
              </Badge>
            )}
            {entry.isStale && (
              <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                Older draft - review before publishing
              </Badge>
            )}
            {entry.conflictLabels.map((label) => (
              <Badge key={label} variant="outline" className="border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400">
                <AlertTriangle className="mr-1 h-3 w-3" />
                {label}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 lg:items-end">
          <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}</div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <DraftEntryActions entry={entry} />
          </div>
        </div>
      </div>
    </div>
  )
}

function DraftEntryActions({ entry }: { entry: PendingDraftQueueEntry }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open draft actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild disabled={!entry.diffPreview.length && entry.action !== "delete"}>
          <Link href={getDraftDiffHref(entry)}>
            <Eye className="mr-2 h-4 w-4" />
            Review diff
          </Link>
        </DropdownMenuItem>
        {entry.href && (
          <DropdownMenuItem asChild>
            <Link href={entry.href}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Open editor
            </Link>
          </DropdownMenuItem>
        )}
        {entry.parentHref && (
          <DropdownMenuItem asChild>
            <Link href={entry.parentHref}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Open parent
            </Link>
          </DropdownMenuItem>
        )}
        {entry.searchHref && (
          <DropdownMenuItem asChild>
            <Link href={entry.searchHref}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View history
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
