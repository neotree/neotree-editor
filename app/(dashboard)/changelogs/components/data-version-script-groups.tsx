import Link from "next/link"
import { format } from "date-fns"
import { ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { DataVersionGroupedChange, DataVersionGroupedView, DataVersionScriptGroup } from "@/lib/changelog-data-version-groups"

type Props = {
  groupedView: DataVersionGroupedView
  dataVersion: number
}

const entityTypeLabels: Record<string, string> = {
  script: "Script",
  screen: "Screen",
  diagnosis: "Diagnosis",
  problem: "Problem",
  config_key: "Config Key",
  drugs_library: "Drugs Library",
  data_key: "Data Key",
  alias: "Alias",
}

const actionLabels: Record<string, string> = {
  create: "Create",
  update: "Update",
  delete: "Delete",
  publish: "Publish",
  restore: "Restore",
  rollback: "Rollback",
  merge: "Merge",
}

const entityTypeOrder: DataVersionGroupedChange["entityType"][] = ["script", "screen", "diagnosis", "problem"]

export function DataVersionScriptGroups({ groupedView, dataVersion }: Props) {
  if (!groupedView.scriptGroups.length && !groupedView.standaloneChanges.length) {
    return null
  }

  return (
    <div className="space-y-4">
      {groupedView.scriptGroups.length > 0 && (
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Affected Scripts</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Script-scoped changes are grouped here so screen, diagnosis, and problem updates stay traceable together.
            </p>
          </div>
          <div className="space-y-3">
            {groupedView.scriptGroups.map((group) => (
              <ScriptGroupCard key={group.scriptId} group={group} dataVersion={dataVersion} />
            ))}
          </div>
        </section>
      )}

      {groupedView.standaloneChanges.length > 0 && (
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Standalone Changes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Changes that are not naturally scoped to a script remain listed separately.
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/70">
            <div className="divide-y divide-border/60">
              {groupedView.standaloneChanges.map((change) => (
                <ChangeRow key={change.changeLogId} change={change} dataVersion={dataVersion} compact />
              ))}
            </div>
          </div>
        </section>
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
      <summary className="cursor-pointer list-none px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div>
              <div className="text-base font-semibold">{group.scriptTitle}</div>
              <div className="text-xs text-muted-foreground">{group.scriptId}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-muted text-muted-foreground">
                {group.totalChanges} changes
              </Badge>
              <Badge variant="outline" className="bg-muted text-muted-foreground">
                {group.entitiesAffected} entities
              </Badge>
              <Badge variant="outline" className="bg-muted text-muted-foreground">
                {group.fieldsChanged} fields updated
              </Badge>
              {group.screenChanges > 0 && (
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  {group.screenChanges} screens
                </Badge>
              )}
              {group.diagnosisChanges > 0 && (
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  {group.diagnosisChanges} diagnoses
                </Badge>
              )}
              {group.problemChanges > 0 && (
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  {group.problemChanges} problems
                </Badge>
              )}
              {group.scriptChanges > 0 && (
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  {group.scriptChanges} script entries
                </Badge>
              )}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Latest change {format(new Date(group.latestChangeAt), "PPpp")}</div>
        </div>
      </summary>
      <div className="border-t border-border/60 px-4 py-4">
        <div className="space-y-4">
          {entityTypeOrder.map((entityType) => {
            const changes = groupedChanges.get(entityType) || []
            if (!changes.length) return null

            return (
              <section key={entityType} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    {entityTypeLabels[entityType] || entityType}
                    {changes.length > 1 ? "s" : ""}
                  </h3>
                  <Badge variant="outline" className="bg-muted text-muted-foreground">
                    {changes.length}
                  </Badge>
                </div>
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

function ChangeRow({ change, dataVersion, compact = false }: { change: DataVersionGroupedChange; dataVersion: number; compact?: boolean }) {
  const entityLabel = entityTypeLabels[change.entityType] || change.entityType
  const actionLabel = actionLabels[change.action] || change.action

  return (
    <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{change.entityTitle}</span>
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            {entityLabel}
          </Badge>
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            {actionLabel}
          </Badge>
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            {change.fieldsChanged} fields
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">{change.entityId}</div>
        {change.highlightedFields.length > 0 && (
          <div className="text-xs text-muted-foreground">Key fields: {change.highlightedFields.join(", ")}</div>
        )}
        {!compact && change.changeReason && <div className="text-xs text-muted-foreground">Reason: {change.changeReason}</div>}
        {!compact && change.description && <div className="text-xs text-muted-foreground line-clamp-2">{change.description}</div>}
      </div>
      <div className="flex items-center gap-3 md:flex-col md:items-end">
        <div className="text-xs text-muted-foreground">{format(new Date(change.dateOfChange), "PPpp")}</div>
        <Button asChild size="sm" variant="ghost" className="text-primary">
          <Link href={`/changelogs/v${dataVersion}/changes/${change.changeLogId}`}>
            View
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
