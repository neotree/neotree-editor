import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"

import { Title } from "@/components/title"
import { Content } from "@/components/content"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getChangeLogs } from "@/app/actions/change-logs"
import { DataVersionChangesTable } from "../components/data-version-changes-table"
import { DataVersionScriptGroups } from "../components/data-version-script-groups"
import { ChangelogWorkflowRail } from "../components/workflow-rail"
import type { ChangeLogType } from "@/databases/queries/changelogs/_get-change-logs"
import { buildDataVersionGroupedView } from "@/lib/changelog-data-version-groups"

function normalizeChangeCount(changes: ChangeLogType["changes"]): number {
  if (Array.isArray(changes)) {
    return changes.length
  }
  if (changes && typeof changes === "object" && "oldValues" in changes && "newValues" in changes) {
    const legacy = changes as { oldValues?: any[]; newValues?: any[] }
    return Math.max(legacy.oldValues?.length || 0, legacy.newValues?.length || 0)
  }
  return 0
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

type Params = {
  version: string
}

function parseDataVersionParam(param: string): number | null {
  const sanitized = param.startsWith("v") || param.startsWith("V") ? param.slice(1) : param
  const value = Number(sanitized)
  return Number.isFinite(value) && value > 0 ? value : null
}

function formatEntitySummary(entityCounts: Map<string, number>) {
  const items = Array.from(entityCounts.entries()).sort(([, countA], [, countB]) => countB - countA)
  if (!items.length) return "-"
  return items
    .map(([entityType, count]) => {
      const label = entityTypeLabels[entityType] || entityType
      return `${count} ${label}${count === 1 ? "" : "s"}`
    })
    .join(" | ")
}

export default async function DataVersionPage({ params }: { params: Params }) {
  const numericVersion = parseDataVersionParam(params.version)
  if (numericVersion === null) {
    notFound()
  }

  const { data, errors } = await getChangeLogs({
    dataVersions: [numericVersion],
    limit: 2000,
    sortBy: "dateOfChange",
    sortOrder: "desc",
  })

  if (errors?.length) {
    throw new Error(errors.join(", "))
  }

  const changes = data ?? []
  const visibleChanges = changes.filter((change) => change.entityType !== "release")

  if (!changes.length) {
    return (
      <>
        <Title>{`Published Version v${numericVersion}`}</Title>
        <Content>
          <Link href="/changelogs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to releases
          </Link>

          <Card className="mt-6">
            <CardContent className="p-8 text-center text-muted-foreground">
              No changelog entries were found for data version v{numericVersion}.
            </CardContent>
          </Card>
        </Content>
      </>
    )
  }

  const latestChange = changes.reduce((latest, change) => {
    if (!latest) return change
    return new Date(change.dateOfChange).getTime() > new Date(latest.dateOfChange).getTime() ? change : latest
  }, changes[0])

  const releasePublishEntry = changes.find((change) => change.action === "publish" && change.entityType === "release")
  const publishEntry = releasePublishEntry ?? changes.find((change) => change.action === "publish") ?? latestChange
  const publishedAt = format(new Date(publishEntry.dateOfChange), "PPpp")
  const publishedBy = publishEntry.userName || latestChange.userName || "Unknown user"
  const publishedEmail = publishEntry.userEmail || latestChange.userEmail || ""

  const entityCounts = new Map<string, number>()
  const actionCounts = new Map<string, number>()
  let totalFieldChanges = 0
  const uniqueEntities = new Set<string>()

  for (const change of visibleChanges) {
    entityCounts.set(change.entityType, (entityCounts.get(change.entityType) || 0) + 1)
    actionCounts.set(change.action, (actionCounts.get(change.action) || 0) + 1)
    uniqueEntities.add(`${change.entityType}:${change.entityId}`)
    totalFieldChanges += normalizeChangeCount(change.changes)
  }

  const entitySummary = formatEntitySummary(entityCounts)
  const groupedView = buildDataVersionGroupedView(visibleChanges)
  const topEntitySummary = entitySummary === "-" ? "no item changes" : entitySummary.toLowerCase()

  return (
    <>
      <Title>{`Published Version v${numericVersion}`}</Title>

      <Content className="space-y-6">
        <ChangelogWorkflowRail current="version" />

        <Link href="/changelogs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to releases
        </Link>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Published At</span>
                <span className="text-lg font-semibold">{publishedAt}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Published By</span>
                <span className="text-lg font-semibold">{publishedBy}</span>
                {publishedEmail && <span className="text-xs text-muted-foreground">{publishedEmail}</span>}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Summary</span>
                <span className="text-lg font-semibold">{entitySummary}</span>
              </div>
            </div>

            <div className="rounded-lg border border-l-4 border-l-primary bg-primary/[0.03] p-4">
              <div className="font-medium">Summary</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Published version v{numericVersion} changed {visibleChanges.length} {visibleChanges.length === 1 ? "item" : "items"} across{" "}
                {topEntitySummary}. Use the grouped sections below to review changes by script first, then open individual details only when
                needed.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Total Changes</div>
                <div className="text-2xl font-semibold mt-1">{visibleChanges.length}</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Entities Affected</div>
                <div className="text-2xl font-semibold mt-1">{uniqueEntities.size}</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Changed Details</div>
                <div className="text-2xl font-semibold mt-1">{totalFieldChanges}</div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-2">
              {Array.from(actionCounts.entries())
                .sort(([, countA], [, countB]) => countB - countA)
                .map(([action, count]) => (
                  <Badge key={action} variant="outline" className="capitalize bg-muted text-muted-foreground">
                    {count} {actionLabels[action] || action}
                  </Badge>
                ))}
            </div>

            <Separator />

            <DataVersionScriptGroups groupedView={groupedView} dataVersion={numericVersion} />

            <Separator />

            <details className="rounded-lg border border-border/70 bg-muted/20">
              <summary className="cursor-pointer list-none px-4 py-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold">Full Audit Log</div>
                    <div className="text-xs text-muted-foreground">
                      Technical chronological entries for audit-level inspection. Most users can review the grouped sections above instead.
                    </div>
                  </div>
                  <Badge variant="outline" className="w-fit bg-muted text-muted-foreground">
                    {visibleChanges.length} entries
                  </Badge>
                </div>
              </summary>
              <div className="border-t border-border/60 p-4">
                <DataVersionChangesTable changes={visibleChanges} dataVersion={numericVersion} />
              </div>
            </details>
          </CardContent>
        </Card>
      </Content>
    </>
  )
}
