"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { format } from "date-fns"
import { ChevronRight, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { DataVersionGroupedChange, DataVersionGroupedView, DataVersionScriptGroup } from "@/lib/changelog-data-version-groups"
import { getChangelogActionLabel, getChangelogEntityTypeLabel } from "@/lib/changelog-utils"

type Props = {
  groupedView: DataVersionGroupedView
  dataVersion: number
}

const entityTypeOrder: DataVersionGroupedChange["entityType"][] = ["script", "screen", "diagnosis", "problem"]

export function DataVersionScriptGroups({ groupedView, dataVersion }: Props) {
  const [query, setQuery] = useState("")
  const normalizedQuery = query.trim().toLowerCase()
  const filteredView = useMemo(() => {
    if (!normalizedQuery) return groupedView

    const changeMatches = (change: DataVersionGroupedChange) =>
      [
        change.entityTitle,
        change.entityId,
        change.entityType,
        change.action,
        change.changeReason,
        change.description,
        ...change.highlightedFields,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))

    return {
      scriptGroups: groupedView.scriptGroups
        .map((group) => {
          const changes = group.changes.filter(changeMatches)
          return {
            ...group,
            changes,
            totalChanges: changes.length,
            entitiesAffected: new Set(changes.map((change) => `${change.entityType}:${change.entityId}`)).size,
            fieldsChanged: changes.reduce((acc, change) => acc + change.fieldsChanged, 0),
            scriptChanges: changes.filter((change) => change.entityType === "script").length,
            screenChanges: changes.filter((change) => change.entityType === "screen").length,
            diagnosisChanges: changes.filter((change) => change.entityType === "diagnosis").length,
            problemChanges: changes.filter((change) => change.entityType === "problem").length,
            latestChangeAt: changes.reduce(
              (latest, change) => (new Date(change.dateOfChange).getTime() > new Date(latest).getTime() ? change.dateOfChange : latest),
              group.latestChangeAt,
            ),
          }
        })
        .filter(
          (group) =>
            group.scriptTitle.toLowerCase().includes(normalizedQuery) ||
            group.scriptId.toLowerCase().includes(normalizedQuery) ||
            group.changes.length > 0,
        ),
      standaloneChanges: groupedView.standaloneChanges.filter(changeMatches),
    }
  }, [groupedView, normalizedQuery])

  if (!groupedView.scriptGroups.length && !groupedView.standaloneChanges.length) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search within this version"
          className="pl-10"
        />
      </div>

      {filteredView.scriptGroups.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Scripts</h2>
          <div className="space-y-3">
            {filteredView.scriptGroups.map((group) => (
              <ScriptGroupCard key={group.scriptId} group={group} dataVersion={dataVersion} />
            ))}
          </div>
        </section>
      )}

      {filteredView.standaloneChanges.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Other changes</h2>
          <div className="rounded-lg border border-border/70 bg-background/70">
            <div className="divide-y divide-border/60">
              {filteredView.standaloneChanges.map((change) => (
                <ChangeRow key={change.changeLogId} change={change} dataVersion={dataVersion} />
              ))}
            </div>
          </div>
        </section>
      )}

      {!filteredView.scriptGroups.length && !filteredView.standaloneChanges.length && (
        <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
          No changes in this published version match your search.
        </div>
      )}
    </div>
  )
}

function ScriptGroupCard({ group, dataVersion }: { group: DataVersionScriptGroup; dataVersion: number }) {
  const groupedChanges = new Map<string, DataVersionGroupedChange[]>()

  for (const entityType of entityTypeOrder) {
    groupedChanges.set(entityType, [])
  }

  for (const change of group.changes) {
    const bucket = groupedChanges.get(change.entityType) || []
    bucket.push(change)
    groupedChanges.set(change.entityType, bucket)
  }

  return (
    <details className="rounded-lg border border-border/70 bg-background/80">
      <summary className="cursor-pointer list-none px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="font-medium">{group.scriptTitle}</div>
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            {group.totalChanges} change{group.totalChanges === 1 ? "" : "s"}
          </Badge>
          <div className="ml-auto text-xs text-muted-foreground">{format(new Date(group.latestChangeAt), "PP p")}</div>
        </div>
      </summary>
      <div className="border-t border-border/60 px-4 py-4">
        <div className="space-y-4">
          {entityTypeOrder.map((entityType) => {
            const changes = groupedChanges.get(entityType) || []
            if (!changes.length) return null

            return (
              <section key={entityType} className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {getChangelogEntityTypeLabel(entityType)}
                  {changes.length > 1 ? "s" : ""}
                </h3>
                <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/20">
                  {changes.map((change, index) => (
                    <div key={change.changeLogId} className={index === 0 ? "" : "border-t border-border/50"}>
                      <ChangeRow change={change} dataVersion={dataVersion} />
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </details>
  )
}

function ChangeRow({ change, dataVersion }: { change: DataVersionGroupedChange; dataVersion: number }) {
  const entityLabel = getChangelogEntityTypeLabel(change.entityType)
  const actionLabel = getChangelogActionLabel(change.action)

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2">
          <span className="truncate font-medium">{change.entityTitle}</span>
          <span className="text-xs text-muted-foreground">
            {entityLabel} &middot; {actionLabel}
            {change.fieldsChanged ? ` · ${change.fieldsChanged} field${change.fieldsChanged === 1 ? "" : "s"}` : ""}
          </span>
        </div>
        {change.highlightedFields.length > 0 && (
          <div className="mt-0.5 truncate text-xs text-muted-foreground">{change.highlightedFields.join(", ")}</div>
        )}
      </div>
      <div className="hidden whitespace-nowrap text-xs text-muted-foreground sm:block">
        {format(new Date(change.dateOfChange), "PP p")}
      </div>
      <Button asChild size="sm" variant="ghost" className="text-primary">
        <Link href={`/changelogs/v${dataVersion}/changes/${change.changeLogId}`}>
          View
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}
