import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"

import { Title } from "@/components/title"
import { Content } from "@/components/content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getChangeLog } from "@/app/actions/change-logs"
import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user"
import type { ChangeLogType } from "@/databases/queries/changelogs/_get-change-logs"
import { formatChangeValue, getDataVersion, isHistoryRepairChange, normalizeChanges, resolveEntityTitle } from "@/lib/changelog-utils"
import { buildHumanDiffRows, type HumanDiffRow } from "@/lib/changelog-human-diff"
import { getChangeLifecycleStatus, type ChangeLifecycleState } from "@/lib/changelog-status"
import { getRollbackButtonTargetVersion } from "@/lib/changelog-publish"
import { getProtectedDependentRollbackMessage, isProtectedDependentRollbackChange } from "@/lib/changelog-rollback-guards"
import { cn } from "@/lib/utils"
import {
  buildFieldChangeInsights,
  buildHighlightEntries,
  groupFieldChangeInsights,
  type ChangeGroupSummary,
  type FieldChangeInsight,
  type HighlightEntry,
} from "./diff-insights"
import { RollbackButton } from "../../../components/rollback-button"

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
  problem: "Problem",
  config_key: "Config Key",
  drugs_library: "Drugs Library",
  data_key: "Data Key",
  alias: "Alias",
}

const actionBadgeClasses: Record<string, string> = {
  create: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  update: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  delete: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
  publish: "border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-400",
  restore: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  rollback: "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  merge: "border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
}

const lifecycleBadgeClasses: Record<ChangeLifecycleState, string> = {
  active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  inactive: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
  superseded: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
}

const systemFieldNames = new Set([
  "id",
  "uuid",
  "version",
  "dataVersion",
  "publishDate",
  "createdAt",
  "updatedAt",
  "deletedAt",
])

function getEntityEditorHref(change: ChangeLogType) {
  if (change.entityType === "script") return `/script/${change.entityId}`
  if (change.entityType === "screen" && change.scriptId) return `/script/${change.scriptId}/screen/${change.entityId}`
  if (change.entityType === "diagnosis" && change.scriptId) return `/script/${change.scriptId}/diagnosis/${change.entityId}`
  if (change.entityType === "problem" && change.scriptId) return `/script/${change.scriptId}/problem/${change.entityId}`
  if (change.entityType === "config_key") return "/configuration"
  if (change.entityType === "drugs_library") return `/drugs-fluids-and-feeds?itemId=${encodeURIComponent(change.entityId)}`
  if (change.entityType === "data_key") return `/data-keys/edit/${encodeURIComponent(change.entityId)}`
  return null
}

export default async function ChangeDetailsPage({ params }: { params: Params }) {
  const numericVersion = parseDataVersionParam(params.version)
  if (numericVersion === null) {
    notFound()
  }

  const { data, errors } = await getChangeLog({ changeLogId: params.changeId })
  const currentUser = await getAuthenticatedUser()
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
  const isHistoryRepair = isHistoryRepairChange(change)
  const lifecycle = getChangeLifecycleStatus(change)
  const fieldInsights = buildFieldChangeInsights(normalizedChanges, { entityType: change.entityType })
  const userFacingInsights = fieldInsights.filter((entry) => !systemFieldNames.has(entry.field))
  const systemInsights = fieldInsights.filter((entry) => systemFieldNames.has(entry.field))
  const visibleInsights = userFacingInsights.length ? userFacingInsights : fieldInsights
  const highlightEntries = buildHighlightEntries(visibleInsights)
  const groupedSummaries = groupFieldChangeInsights(visibleInsights).filter((group) => group.stats.total > 0)
  const hasAnyDiffs = visibleInsights.some((entry) => entry.stats.total > 0)
  const rollbackTargetVersion = getRollbackButtonTargetVersion({
    action: change.action,
    parentVersion: change.parentVersion,
    mergedFromVersion: change.mergedFromVersion,
  })
  const isProtectedDependentRollback = isProtectedDependentRollbackChange(change)
  const canRollback =
    currentUser?.role === "super_user" &&
    change.isActive &&
    (rollbackTargetVersion ?? null) !== null &&
    !isProtectedDependentRollback
  const editorHref = getEntityEditorHref(change)

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
            <CardTitle className="text-2xl">{entityTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {isHistoryRepair
                ? `${entityTitle} had its changelog history repaired before published version v${dataVersion} was written.`
                : `${entityTitle} was ${
                    change.action === "update"
                      ? "updated"
                      : change.action === "create"
                        ? "created"
                        : change.action === "delete"
                          ? "deleted"
                          : change.action
                  }. ${visibleInsights.length} ${visibleInsights.length === 1 ? "detail" : "details"} changed in published version v${dataVersion}.`}
            </p>
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
              <Badge variant="outline" className={actionBadgeClasses[change.action] ?? "bg-muted text-muted-foreground"}>
                {change.action}
              </Badge>
              <Badge variant="outline" className={lifecycleBadgeClasses[lifecycle.state]}>
                {lifecycle.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap justify-end gap-2">
              {editorHref && (
                <Link
                  href={editorHref}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  Open this item
                </Link>
              )}
              <Link
                href={`/changelogs/v${numericVersion}`}
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                Back to published version
              </Link>
              {canRollback && (
                <RollbackButton
                  entityId={change.entityId}
                  entityType={change.entityType}
                  targetVersion={rollbackTargetVersion}
                  currentVersion={change.version}
                  dataVersion={dataVersion ?? null}
                  disabled={!change.isActive}
                />
              )}
            </div>
            {isProtectedDependentRollback && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
                {getProtectedDependentRollbackMessage(change.entityType)}
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs uppercase text-muted-foreground tracking-wide">Changed By</div>
                <div className="mt-1 text-sm font-medium">
                  {change.userName || "Unknown user"}
                  {change.userEmail ? ` | ${change.userEmail}` : ""}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground tracking-wide">Changed On</div>
                <div className="mt-1 text-sm font-medium">{changedOn}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground tracking-wide">Technical ID</div>
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
                <div className="text-xs uppercase text-muted-foreground tracking-wide">What Changed</div>
                <ChangeSummaryCard highlightEntries={highlightEntries} groupedSummaries={groupedSummaries} hasChanges={hasAnyDiffs} />
              </div>

              <div>
                <div className="text-xs uppercase text-muted-foreground tracking-wide">Changes to Review ({visibleInsights.length})</div>
                {visibleInsights.length === 0 ? (
                  <div className="mt-3 text-sm text-muted-foreground italic">
                    {isHistoryRepair
                      ? "This entry records a background history repair. No exact field-by-field diff was recoverable."
                      : "No field-level changes recorded for this entry."}
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    {visibleInsights.map((insight, index) => (
                      <FieldDiffDetails
                        key={`${change.changeLogId}-${insight.field}-${index}`}
                        insight={insight}
                        defaultOpen={index === 0}
                      />
                    ))}
                  </div>
                )}
                {systemInsights.length > 0 && userFacingInsights.length > 0 && (
                  <details className="mt-4 rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-3">
                    <summary className="cursor-pointer text-xs font-semibold uppercase text-muted-foreground">
                      Show system metadata changes
                    </summary>
                    <div className="mt-3 space-y-3">
                      {systemInsights.map((insight) => (
                        <RawValueComparison
                          key={`${change.changeLogId}-${insight.field}-system`}
                          label={insight.fieldLabel}
                          previous={insight.previousValue}
                          next={insight.newValue}
                        />
                      ))}
                    </div>
                  </details>
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
                <div key={`${entry.field}-${entryIndex}`} className="space-y-1 rounded-md border border-border/60 bg-background/80 p-3">
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
          <div className="text-sm text-muted-foreground">No structural differences were detected for this change log entry.</div>
        )}
      </div>
      <div className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {groupedSummaries.map((group) => (
            <StatBadge key={group.key} label={group.label} value={group.stats.total} tone="updated" />
          ))}
        </div>
      </div>
    </div>
  )
}

function FieldDiffDetails({ insight, defaultOpen }: { insight: FieldChangeInsight; defaultOpen?: boolean }) {
  const hasOperations = insight.operations.length > 0
  const readableRows = buildHumanDiffRows({
    field: insight.field,
    before: insight.previousValue,
    after: insight.newValue,
  })

  if (!hasOperations && !readableRows.length) {
    return (
      <div className="rounded-lg border border-dashed border-border/70 bg-muted/30">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
          <div>
            <div className="text-sm font-semibold">{insight.fieldLabel}</div>
          </div>
          <div className="text-xs font-medium text-muted-foreground">No structured differences</div>
        </div>
        <div className="px-4 py-4 text-sm text-muted-foreground">
          Technical values are shown below for reference.
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
        {readableRows.length ? (
          readableRows.map((row) => <HumanDiffRowCard key={row.id} row={row} />)
        ) : (
          <div className="rounded-lg border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
            No readable field-level differences were detected. Use technical details below for audit review.
          </div>
        )}
        <div className="rounded-lg border border-dashed border-border/70">
          <details>
            <summary className="cursor-pointer px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
              View technical JSON values
            </summary>
            <div className="grid gap-3 border-t border-border/60 p-3 md:grid-cols-2">
              <ValueBlock label="Before this change" tone="danger" value={insight.previousValue} />
              <ValueBlock label="After this change" tone="success" value={insight.newValue} />
            </div>
          </details>
        </div>
      </div>
    </details>
  )
}

function HumanDiffRowCard({ row }: { row: HumanDiffRow }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20">
      <div className="border-b border-border/60 px-4 py-3">
        <div className="font-medium">{row.itemLabel || row.fieldLabel}</div>
        {row.itemLabel && <div className="mt-1 text-sm text-muted-foreground">{row.fieldLabel}</div>}
        {row.detailLabel && <div className="mt-2 text-sm font-medium">{row.detailLabel}</div>}
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-2">
        <div className="rounded-lg border border-rose-500/15 bg-rose-500/[0.04] p-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Before this change</div>
          <div className="mt-2 whitespace-pre-wrap break-words text-sm">{row.before}</div>
        </div>
        <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.05] p-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">After this change</div>
          <div className="mt-2 whitespace-pre-wrap break-words text-sm">{row.after}</div>
        </div>
      </div>
    </div>
  )
}

function RawValueComparison({ label, previous, next }: { label?: string; previous: unknown; next: unknown }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/80 p-3">
      {label && <div className="mb-3 text-sm font-semibold">{label}</div>}
      <div className="grid gap-3 md:grid-cols-2">
        <ValueBlock label="Before this change" tone="danger" value={previous} />
        <ValueBlock label="After this change" tone="success" value={next} />
      </div>
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
      <pre className={cn("mt-1 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md border p-3 text-xs", toneClasses)}>
        {formatChangeValue(value)}
      </pre>
    </div>
  )
}

function StatBadge({ label, value, tone }: { label: string; value: number; tone: "added" | "updated" | "removed" | "moved" }) {
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
