import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"

import { Title } from "@/components/title"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageContainer } from "@/app/(dashboard)/(scripts)/components/page-container"
import { getChangeLog } from "@/app/actions/change-logs"
import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user"
import type { ChangeLogType } from "@/databases/queries/changelogs/_get-change-logs"
import {
  formatChangeValue,
  getChangelogActionLabel,
  getChangelogEntityEditorHref,
  getChangelogEntityTypeLabel,
  getDataVersion,
  isHistoryRepairChange,
  normalizeChanges,
  resolveEntityTitle,
} from "@/lib/changelog-utils"
import { buildHumanDiffRows, type HumanDiffRow } from "@/lib/changelog-human-diff"
import { getChangeLifecycleStatus, type ChangeLifecycleState } from "@/lib/changelog-status"
import { getRollbackButtonTargetVersion } from "@/lib/changelog-publish"
import { isRollbackTargetOlderThanMaxAge, SCRIPT_CHILD_ENTITY_TYPES } from "@/lib/changelog-rollback"
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

function isMeaningfulRestoreSnapshot(snapshot: unknown): boolean {
  return !!snapshot && typeof snapshot === "object" && !Array.isArray(snapshot) && Object.keys(snapshot).length > 0
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
  const entityLabel = getChangelogEntityTypeLabel(change.entityType)
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
    parentVersion: change.parentVersion,
    mergedFromVersion: change.mergedFromVersion,
  })
  const isProtectedDependentRollback = isProtectedDependentRollbackChange(change)
  const isSuperUser = currentUser?.role === "super_user"
  const canRollback =
    isSuperUser &&
    change.isActive &&
    (rollbackTargetVersion ?? null) !== null &&
    !isProtectedDependentRollback
  // A historical (superseded) entry can be restored directly: the backend accepts an
  // explicit toVersion and validates it against the current active version. Targets older
  // than the rollback age window are hidden for parent entities; child entities keep the
  // button because the server allows them a shallow-depth restore at any age.
  const isChildEntity = (SCRIPT_CHILD_ENTITY_TYPES as readonly string[]).includes(change.entityType)
  const targetTooOld = isRollbackTargetOlderThanMaxAge({ targetDate: change.dateOfChange })
  const canRestoreThisVersion =
    isSuperUser &&
    !change.isActive &&
    change.entityType !== "release" &&
    change.version > 0 &&
    !isProtectedDependentRollback &&
    (!targetTooOld || isChildEntity) &&
    isMeaningfulRestoreSnapshot(change.fullSnapshot)
  const editorHref = getChangelogEntityEditorHref(change)

  return (
    <>
      <Title>Change Details</Title>
      <PageContainer title="Change details" backLink={`/changelogs/v${numericVersion}`}>
        <div className="flex flex-col gap-y-4 px-4 pb-4">
          <div className="flex flex-wrap items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-xl font-medium">{entityTitle}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {isHistoryRepair
                  ? `${entityLabel} · history repaired before v${dataVersion} was published.`
                  : `${entityLabel} · ${getChangelogActionLabel(change.action).toLowerCase()} in v${dataVersion} · ${
                      visibleInsights.length
                    } ${visibleInsights.length === 1 ? "detail" : "details"} changed`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={lifecycleBadgeClasses[lifecycle.state]}>
                {lifecycle.label}
              </Badge>
              <Badge variant="outline" className="bg-muted text-muted-foreground">
                v{change.version}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {editorHref && (
              <Link
                href={editorHref}
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                Open this item
              </Link>
            )}
            {canRollback && (
              <RollbackButton
                entityId={change.entityId}
                entityType={change.entityType}
                targetVersion={rollbackTargetVersion}
                currentVersion={change.version}
              />
            )}
            {canRestoreThisVersion && (
              <RollbackButton entityId={change.entityId} entityType={change.entityType} targetVersion={change.version} mode="restore" />
            )}
          </div>

          {isProtectedDependentRollback && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
              {getProtectedDependentRollbackMessage(change.entityType)}
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Changed by {change.userName || "Unknown user"}
            {change.userEmail ? ` (${change.userEmail})` : ""} on {changedOn}
            {change.changeReason ? (
              <>
                <br />
                Reason: {change.changeReason}
              </>
            ) : null}
            {change.description && change.description !== change.changeReason ? (
              <>
                <br />
                {change.description}
              </>
            ) : null}
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
        </div>
      </PageContainer>
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
