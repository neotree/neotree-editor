"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ChevronDown, ChevronRight, Clock, ExternalLink, FileClock, Laptop, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { usePendingChanges } from "@/hooks/use-pending-changes"
import type { PendingChange } from "@/lib/indexed-db"

const actionBadgeClasses: Record<string, string> = {
  create: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  update: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  delete: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
}

function summarizeValue(value: unknown): string {
  if (value === null || value === undefined) return "-"
  if (typeof value === "string") return value.trim() || "-"
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? "" : "s"}`
  if (typeof value === "object") return `${Object.keys(value as Record<string, unknown>).length} field(s)`
  return String(value)
}

function getActionMixLabel(changes: PendingChange[]) {
  const counts = changes.reduce<Record<string, number>>((acc, change) => {
    acc[change.action] = (acc[change.action] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([action, count]) => `${count} ${action}`)
    .join(" | ")
}

function buildEntitySearchHref(change: PendingChange) {
  return `/changelogs?q=${encodeURIComponent(change.entityId)}`
}

export function PendingChangesWorkspace({
  userId,
  compact = false,
}: {
  userId?: string
  compact?: boolean
}) {
  const { allChangesByEntity, hasChanges } = usePendingChanges({
    userId,
    autoTrack: false,
  })
  const [searchValue, setSearchValue] = useState("")
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())

  const entityEntries = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    return Object.entries(allChangesByEntity)
      .filter(([, group]) => {
        if (!query) return true
        return (
          group.title.toLowerCase().includes(query) ||
          group.changes.some((change) =>
            [change.entityId, change.entityType, change.fieldName, change.description]
              .filter(Boolean)
              .some((value) => String(value).toLowerCase().includes(query)),
          )
        )
      })
      .sort(([, groupA], [, groupB]) => {
        const latestA = Math.max(...groupA.changes.map((change) => change.timestamp))
        const latestB = Math.max(...groupB.changes.map((change) => change.timestamp))
        return latestB - latestA
      })
  }, [allChangesByEntity, searchValue])

  const summary = useMemo(() => {
    const groups = Object.values(allChangesByEntity)
    const changes = groups.flatMap((group) => group.changes)
    const fields = new Set(changes.map((change) => change.fieldName))
    const latestTimestamp = changes.length ? Math.max(...changes.map((change) => change.timestamp)) : null

    return {
      entities: groups.length,
      changes: changes.length,
      fields: fields.size,
      latestTimestamp,
    }
  }, [allChangesByEntity])

  const toggleExpanded = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-orange-500/20 bg-orange-500/5">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Laptop className="h-5 w-5" />
            Local Pending Changes
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            This view shows unsaved or draft edits stored in this browser for your current account. It is not the published changelog.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-background/80 p-4">
            <div className="text-sm text-muted-foreground">Entities</div>
            <div className="mt-1 text-2xl font-semibold">{summary.entities}</div>
          </div>
          <div className="rounded-lg border bg-background/80 p-4">
            <div className="text-sm text-muted-foreground">Local Changes</div>
            <div className="mt-1 text-2xl font-semibold">{summary.changes}</div>
          </div>
          <div className="rounded-lg border bg-background/80 p-4">
            <div className="text-sm text-muted-foreground">Fields Touched</div>
            <div className="mt-1 text-2xl font-semibold">{summary.fields}</div>
          </div>
          <div className="rounded-lg border bg-background/80 p-4">
            <div className="text-sm text-muted-foreground">Latest Activity</div>
            <div className="mt-1 text-sm font-semibold">
              {summary.latestTimestamp
                ? formatDistanceToNow(new Date(summary.latestTimestamp), { addSuffix: true })
                : "No local changes"}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search local pending entities or fields..."
            className="pl-10"
          />
        </div>
        <Button asChild variant="outline">
          <Link href="/changelogs">
            Published Releases
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {!hasChanges ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <FileClock className="h-10 w-10 text-muted-foreground" />
            <div className="text-lg font-semibold">No local pending changes</div>
            <p className="max-w-xl text-sm text-muted-foreground">
              Your current browser has no unpublished local edits for this account.
            </p>
          </CardContent>
        </Card>
      ) : (
        entityEntries.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <div className="text-lg font-semibold">No matching local pending changes</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Adjust the search term to find a different pending entity or field.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {entityEntries.map(([entityKey, group]) => {
              const isExpanded = compact ? false : expandedKeys.has(entityKey)
              const latestChange = [...group.changes].sort((a, b) => b.timestamp - a.timestamp)[0]

              return (
                <Card key={entityKey}>
                  <CardContent className="p-0">
                    <div className="flex items-start justify-between gap-4 p-4">
                      <button
                        type="button"
                        className="flex-1 space-y-2 text-left"
                        onClick={() => toggleExpanded(entityKey)}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {!compact &&
                            (isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
                          <span className="text-base font-semibold">{group.title}</span>
                          <Badge variant="outline" className="bg-muted text-muted-foreground">
                            {latestChange.entityType}
                          </Badge>
                          <Badge variant="outline" className="bg-muted text-muted-foreground">
                            {group.changes.length} change{group.changes.length === 1 ? "" : "s"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{getActionMixLabel(group.changes)}</div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>{latestChange.entityId}</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(latestChange.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      </button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={buildEntitySearchHref(latestChange)}>Search live history</Link>
                      </Button>
                    </div>

                    {(compact || isExpanded) && (
                      <div className="border-t border-border/60 px-4 py-4">
                        <ScrollArea className={cn(compact ? "max-h-[280px]" : "max-h-[420px]")}>
                          <div className="space-y-3 pr-2">
                            {group.changes
                              .slice()
                              .sort((a, b) => b.timestamp - a.timestamp)
                              .map((change, index) => (
                                <div key={`${entityKey}-${change.id ?? index}`} className="rounded-lg border bg-muted/20 p-3">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Badge
                                        variant="outline"
                                        className={cn(actionBadgeClasses[change.action] ?? "bg-muted text-muted-foreground")}
                                      >
                                        {change.action}
                                      </Badge>
                                      <span className="font-medium">{change.fieldName}</span>
                                      <span className="text-xs text-muted-foreground">{change.fieldPath}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(new Date(change.timestamp), { addSuffix: true })}
                                    </span>
                                  </div>

                                  {change.description && (
                                    <p className="mt-2 text-sm text-muted-foreground">{change.description}</p>
                                  )}

                                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                                    <div>
                                      <div className="text-xs font-semibold uppercase text-muted-foreground">Previous</div>
                                      <div className="mt-1 rounded-md border border-red-500/20 bg-red-500/5 p-2 text-sm">
                                        {summarizeValue(change.oldValue)}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs font-semibold uppercase text-muted-foreground">New</div>
                                      <div className="mt-1 rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2 text-sm">
                                        {summarizeValue(change.newValue)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
