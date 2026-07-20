import { notFound } from "next/navigation"
import { format } from "date-fns"

import { Title } from "@/components/title"
import { Badge } from "@/components/ui/badge"
import { PageContainer } from "@/app/(dashboard)/(scripts)/components/page-container"
import { getChangeLogs } from "@/app/actions/change-logs"
import { DataVersionChangesTable } from "../components/data-version-changes-table"
import { DataVersionScriptGroups } from "../components/data-version-script-groups"
import type { ChangeLogType } from "@/databases/queries/changelogs/_get-change-logs"
import { buildDataVersionGroupedView } from "@/lib/changelog-data-version-groups"
import { getChangelogEntityTypeLabel } from "@/lib/changelog-utils"

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
  if (!items.length) return ""
  return items
    .map(([entityType, count]) => {
      const label = getChangelogEntityTypeLabel(entityType)
      return `${count} ${label}${count === 1 ? "" : "s"}`
    })
    .join(", ")
}

// Releases can exceed a single query page; keep fetching until the reported total is
// reached so counts and the audit log never silently truncate.
async function getAllChangeLogsForDataVersion(dataVersion: number) {
  const pageSize = 2000
  const maxPages = 25
  const aggregated: ChangeLogType[] = []

  for (let page = 0; page < maxPages; page++) {
    const { data, errors, total } = await getChangeLogs({
      dataVersions: [dataVersion],
      limit: pageSize,
      offset: aggregated.length,
      sortBy: "dateOfChange",
      sortOrder: "desc",
    })

    if (errors?.length) {
      throw new Error(errors.join(", "))
    }

    const batch = data ?? []
    aggregated.push(...batch)

    const reportedTotal = Number(total)
    if (!batch.length || !Number.isFinite(reportedTotal) || aggregated.length >= reportedTotal) {
      break
    }
  }

  return aggregated
}

export default async function DataVersionPage({ params }: { params: Params }) {
  const numericVersion = parseDataVersionParam(params.version)
  if (numericVersion === null) {
    notFound()
  }

  const changes = await getAllChangeLogsForDataVersion(numericVersion)
  const visibleChanges = changes.filter((change) => change.entityType !== "release")

  if (!changes.length) {
    return (
      <>
        <Title>{`Published Version v${numericVersion}`}</Title>
        <PageContainer title={`Published version v${numericVersion}`} backLink="/changelogs">
          <div className="px-4 pb-8 text-sm text-muted-foreground">
            No changelog entries were found for data version v{numericVersion}.
          </div>
        </PageContainer>
      </>
    )
  }

  const latestChange = changes.reduce((latest, change) => {
    if (!latest) return change
    return new Date(change.dateOfChange).getTime() > new Date(latest.dateOfChange).getTime() ? change : latest
  }, changes[0])

  const releasePublishEntry = changes.find((change) => change.action === "publish" && change.entityType === "release")
  const publishEntry = releasePublishEntry ?? changes.find((change) => change.action === "publish") ?? latestChange
  const publishedAt = format(new Date(publishEntry.dateOfChange), "PP p")
  const publishedBy = publishEntry.userName || latestChange.userName || "Unknown user"

  const entityCounts = new Map<string, number>()
  for (const change of visibleChanges) {
    entityCounts.set(change.entityType, (entityCounts.get(change.entityType) || 0) + 1)
  }

  const entitySummary = formatEntitySummary(entityCounts)
  const groupedView = buildDataVersionGroupedView(visibleChanges)

  return (
    <>
      <Title>{`Published Version v${numericVersion}`}</Title>

      <PageContainer title={`Published version v${numericVersion}`} backLink="/changelogs">
        <div className="flex flex-col gap-y-4 px-4 pb-4">
          <div className="text-sm text-muted-foreground">
            Published {publishedAt} by {publishedBy}
            {entitySummary ? <> &middot; {entitySummary}</> : null}
          </div>

          <DataVersionScriptGroups groupedView={groupedView} dataVersion={numericVersion} />

          <details className="rounded-lg border border-border/70 bg-muted/20">
            <summary className="cursor-pointer list-none px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold">Full audit log</div>
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  {visibleChanges.length} entries
                </Badge>
              </div>
            </summary>
            <div className="border-t border-border/60 p-4">
              <DataVersionChangesTable changes={visibleChanges} dataVersion={numericVersion} />
            </div>
          </details>
        </div>
      </PageContainer>
    </>
  )
}
