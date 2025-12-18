import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, Eye } from "lucide-react"

import { Title } from "@/components/title"
import { Content } from "@/components/content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getChangeLog } from "@/app/actions/change-logs"
import type { ChangeLogType } from "@/databases/queries/changelogs/_get-change-logs"
import { formatChangeValue, getDataVersion, normalizeChanges, resolveEntityTitle } from "@/lib/changelog-utils"
import { getChangeLifecycleStatus, type ChangeLifecycleState } from "@/lib/changelog-status"
import { cn } from "@/lib/utils"
import {
  buildFieldChangeInsights,
  buildHighlightEntries,
  groupFieldChangeInsights,
  CHANGE_GROUP_METADATA,
  type ChangeGroupSummary,
  type FieldChangeInsight,
  type HighlightEntry,
} from "./diff-insights"

type Params = {
  version: string
  changeId: string
}

function parseDataVersionParam(param: string): number | null {
  const sanitized = param.startsWith("v") || param.startsWith("V") ? param.slice(1) : param
  const value = Number(sanitized)
  return Number.isFinite(value) && value > 0 ? value : null
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

const actionBadgeClasses: Record<string, string> = {
  create: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  update: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  delete: "bg-red-500/10 text-red-700 dark:text-red-400",
  publish: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  restore: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  rollback: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  merge: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
}

const lifecycleBadgeClasses: Record<ChangeLifecycleState, string> = {
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  inactive: "bg-red-500/10 text-red-700 dark:text-red-400",
  superseded: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
}

export default async function ChangeDetailsPage({ params }: { params: Params }) {
  const numericVersion = parseDataVersionParam(params.version)
  if (numericVersion === null) {
    notFound()
  }

  const { data, errors } = await getChangeLog({ changeLogId: params.changeId })
  if (errors?.length) {
    throw new Error(errors.join(", "))
  }

  if (!data) {
    notFound()
  }

  const change = data as ChangeLogType
  const entityLabel = entityTypeLabels[change.entityType as keyof typeof entityTypeLabels] || change.entityType
  const entityTitle = resolveEntityTitle(change)
  const changedOn = format(new Date(change.dateOfChange), "PPpp")
  const dataVersion = getDataVersion(change) ?? numericVersion
  const normalizedChanges = normalizeChanges(change)
  const lifecycle = getChangeLifecycleStatus(change)
  const fieldInsights = buildFieldChangeInsights(normalizedChanges, { entityType: change.entityType })
  const highlightEntries = buildHighlightEntries(fieldInsights)
  const groupedSummaries = groupFieldChangeInsights(fieldInsights)
  const hasAnyDiffs = fieldInsights.some((entry) => entry.stats.total > 0)

  return (
    <>
      <Title>Change Details</Title>
      <Content className="space-y-6">
        <Link
          href={`/changelogs/v${numericVersion}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to data version v{numericVersion}
        </Link>

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-4 w-4" />
              {entityTitle}
            </CardTitle>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="bg-muted text-muted-foreground">
                {entityLabel}
              </Badge>
              <Badge variant="outline" className="bg-muted text-muted-foreground">
                Entity v{change.version}
              </Badge>
              {dataVersion && (
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  Data v{dataVersion}
                </Badge>
              )}
              <Badge
                className={actionBadgeClasses[change.action] ?? "bg-muted text-muted-foreground"}
              >
                {change.action}
              </Badge>
              <Badge className={lifecycleBadgeClasses[lifecycle.state]}>
                {lifecycle.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs uppercase text-muted-foreground tracking-wide">Changed By</div>
                <div className="mt-1 text-sm font-medium">
                  {change.userName || "Unknown user"}
                  {change.userEmail ? ` • ${change.userEmail}` : ""}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground tracking-wide">Changed On</div>
                <div className="mt-1 text-sm font-medium">{changedOn}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground tracking-wide">Entity ID</div>
                <div className="mt-1 text-sm font-medium break-all">{change.entityId}</div>
              </div>
              {change.parentVersion !== null && (
                <div>
                  <div className="text-xs uppercase text-muted-foreground tracking-wide">Parent Version</div>
                  <div className="mt-1 text-sm font-medium">v{change.parentVersion}</div>
                </div>
              )}
              {change.mergedFromVersion !== null && (
                <div>
                  <div className="text-xs uppercase text-muted-foreground tracking-wide">Merged From</div>
                  <div className="mt-1 text-sm font-medium">v{change.mergedFromVersion}</div>
                </div>
              )}
              {change.changeReason && (
                <div className="md:col-span-2">
                  <div className="text-xs uppercase text-muted-foreground tracking-wide">Reason</div>
                  <div className="mt-1 text-sm">{change.changeReason}</div>
                </div>
              )}
              {change.description && (
                <div className="md:col-span-2">
                  <div className="text-xs uppercase text-muted-foreground tracking-wide">Description</div>
                  <div className="mt-1 text-sm">{change.description}</div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-6">
              <div>
                <div className="text-xs uppercase text-muted-foreground tracking-wide">Summary of Changes</div>
                <ChangeSummaryCard
                  highlightEntries={highlightEntries}
                  groupedSummaries={groupedSummaries}
                  hasChanges={hasAnyDiffs}
                />
              </div>

              <div>
                <div className="text-xs uppercase text-muted-foreground tracking-wide">
                  Detailed Changes ({normalizedChanges.length})
                </div>
                {normalizedChanges.length === 0 ? (
                  <div className="mt-3 text-sm text-muted-foreground italic">
                    No field-level changes recorded for this entry.
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    {fieldInsights.map((insight, index) => (
                      <FieldDiffDetails
                        key={`${change.changeLogId}-${insight.field}-${index}`}
                        insight={insight}
                        defaultOpen={index === 0}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Content>
    </>
  )
}

function ChangeSummaryCard({
  highlightEntries,
  groupedSummaries,
  hasChanges,
}: {
  highlightEntries: HighlightEntry[]
  groupedSummaries: ChangeGroupSummary[]
  hasChanges: boolean
}) {
  return (
    <div className="mt-3 rounded-lg border border-border/60 bg-muted/30">
      <div className="border-b border-border/60 px-4 py-3">
        {hasChanges ? (
          <div className="space-y-2 text-sm">
            {highlightEntries.length ? (
              highlightEntries.map((entry, entryIndex) => (
                <div
                  key={`${entry.field}-${entryIndex}`}
                  className="space-y-1 rounded-md border border-border/60 bg-background/80 p-3"
                >
                  <div className="text-xs font-semibold uppercase text-muted-foreground">{entry.fieldLabel}</div>
                  <ul className="list-disc space-y-1 pl-5">
                    {entry.statements.map((statement, idx) => (
                      <li key={`${entry.field}-${idx}`} className="text-sm">
                        {statement}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">Changes detected, see detailed view below.</div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No structural differences were detected for this change log entry.
          </div>
        )}
      </div>
      <div className="px-4 py-3">
        <div className="text-xs font-semibold uppercase text-muted-foreground">Breakdown by Category</div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {groupedSummaries.map((group) => (
            <div
              key={group.key}
              className="rounded-lg border border-dashed border-border/70 bg-background/70 p-3 text-sm"
            >
              <div className="font-medium">{group.label}</div>
              <div className="text-xs text-muted-foreground">{group.description}</div>
              {group.stats.total === 0 ? (
                <div className="mt-2 text-sm text-muted-foreground">No changes.</div>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <StatBadge label="Added" value={group.stats.added} tone="added" />
                  <StatBadge label="Modified" value={group.stats.updated} tone="updated" />
                  <StatBadge label="Removed" value={group.stats.removed} tone="removed" />
                  {group.stats.moved > 0 && <StatBadge label="Moved" value={group.stats.moved} tone="moved" />}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FieldDiffDetails({ insight, defaultOpen }: { insight: FieldChangeInsight; defaultOpen?: boolean }) {
  const hasOperations = insight.operations.length > 0
  const groupLabel = CHANGE_GROUP_METADATA[insight.groupKey].label

  if (!hasOperations) {
    return (
      <div className="rounded-lg border border-dashed border-border/70 bg-muted/30">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
          <div>
            <div className="text-sm font-semibold">{insight.fieldLabel}</div>
            <div className="text-xs uppercase text-muted-foreground">{groupLabel}</div>
          </div>
          <div className="text-xs font-medium text-muted-foreground">No structured differences</div>
        </div>
        <div className="px-4 py-4 text-sm text-muted-foreground">
          Raw values are shown below for reference.
          <RawValueComparison previous={insight.previousValue} next={insight.newValue} />
        </div>
      </div>
    )
  }

  return (
    <details className="rounded-lg border border-border/70 bg-background/60" open={defaultOpen}>
      <summary className="cursor-pointer list-none px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold">{insight.fieldLabel}</div>
            <div className="text-xs uppercase text-muted-foreground">{groupLabel}</div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <StatBadge label="Added" value={insight.stats.added} tone="added" />
            <StatBadge label="Modified" value={insight.stats.updated} tone="updated" />
            <StatBadge label="Removed" value={insight.stats.removed} tone="removed" />
            {insight.stats.moved > 0 && <StatBadge label="Moved" value={insight.stats.moved} tone="moved" />}
          </div>
        </div>
      </summary>
      <div className="border-t border-border/60 p-4 space-y-4">
        {insight.operations.map((operation) => (
          <DiffOperationRow key={operation.id} operation={operation} />
        ))}
        <div className="rounded-lg border border-dashed border-border/70">
          <details>
            <summary className="cursor-pointer px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
              View raw JSON values
            </summary>
            <div className="grid gap-3 border-t border-border/60 p-3 md:grid-cols-2">
              <ValueBlock label="Previous" tone="danger" value={insight.previousValue} />
              <ValueBlock label="New" tone="success" value={insight.newValue} />
            </div>
          </details>
        </div>
      </div>
    </details>
  )
}

function DiffOperationRow({ operation }: { operation: FieldChangeInsight["operations"][number] }) {
  const toneClass = {
    added: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
    removed: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
    updated: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    moved: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
  }[operation.kind]

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase">
        <div className="font-semibold">{operation.path}</div>
        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide", toneClass)}>
          {operation.kind === "added" && "Added"}
          {operation.kind === "removed" && "Removed"}
          {operation.kind === "updated" && "Modified"}
          {operation.kind === "moved" && "Reordered"}
        </span>
      </div>
      {operation.label && (
        <div className="mt-1 text-sm font-medium text-foreground">{operation.label}</div>
      )}
      {operation.kind === "moved" && typeof operation.targetIndex === "number" && (
        <div className="mt-1 text-xs text-muted-foreground">Moved to position {operation.targetIndex + 1}</div>
      )}
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {operation.kind !== "added" && (
          <ValueBlock label="Previous" tone="danger" value={operation.previousValue} />
        )}
        {operation.kind !== "removed" && (
          <ValueBlock label="New" tone="success" value={operation.newValue} />
        )}
      </div>
      {operation.textDiff && (
        <pre className="mt-3 max-h-64 overflow-auto rounded-md border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-800 dark:text-amber-200">
          {operation.textDiff}
        </pre>
      )}
    </div>
  )
}

function RawValueComparison({ previous, next }: { previous: unknown; next: unknown }) {
  return (
    <div className="mt-3 grid gap-3 md:grid-cols-2">
      <ValueBlock label="Previous" tone="danger" value={previous} />
      <ValueBlock label="New" tone="success" value={next} />
    </div>
  )
}

function ValueBlock({ label, tone, value }: { label: string; tone: "danger" | "success" | "neutral"; value: unknown }) {
  const toneClasses =
    tone === "danger"
      ? "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200"
      : tone === "success"
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
        : "border-border bg-muted text-muted-foreground"

  return (
    <div>
      <div className="text-xs font-semibold uppercase text-muted-foreground">{label}</div>
      <pre
        className={cn(
          "mt-1 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md border p-3 text-xs",
          toneClasses,
        )}
      >
        {formatChangeValue(value)}
      </pre>
    </div>
  )
}

function StatBadge({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "added" | "updated" | "removed" | "moved"
}) {
  if (!value) return null
  const toneClasses = {
    added: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    updated: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    removed: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    moved: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  }[tone]

  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", toneClasses)}>
      {label}: {value}
    </span>
  )
}
