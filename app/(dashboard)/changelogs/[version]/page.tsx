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

const entityTypeLabels: Record<string, string> = {
  script: "Script",
  screen: "Screen",
  diagnosis: "Diagnosis",
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
  if (!items.length) return "—"
  return items
    .map(([entityType, count]) => {
      const label = entityTypeLabels[entityType] || entityType
      return `${count} ${label}${count === 1 ? "" : "s"}`
    })
    .join(" • ")
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

  if (!changes.length) {
    return (
      <>
        <Title>{`Data Version v${numericVersion}`}</Title>
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

  const publishEntry = changes.find((change) => change.action === "publish") ?? latestChange
  const publishedAt = format(new Date(latestChange.dateOfChange), "PPpp")
  const publishedBy = publishEntry.userName || latestChange.userName || "Unknown user"
  const publishedEmail = publishEntry.userEmail || latestChange.userEmail || ""

  const entityCounts = new Map<string, number>()
  const actionCounts = new Map<string, number>()
  let totalFieldChanges = 0
  const uniqueEntities = new Set<string>()

  for (const change of changes) {
    entityCounts.set(change.entityType, (entityCounts.get(change.entityType) || 0) + 1)
    actionCounts.set(change.action, (actionCounts.get(change.action) || 0) + 1)
    uniqueEntities.add(`${change.entityType}:${change.entityId}`)
    if (Array.isArray(change.changes)) {
      totalFieldChanges += change.changes.length
    }
  }

  const entitySummary = formatEntitySummary(entityCounts)

  return (
    <>
      <Title>{`Data Version v${numericVersion}`}</Title>

      <Content className="space-y-6">
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

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Total Changes</div>
                <div className="text-2xl font-semibold mt-1">{changes.length}</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Entities Affected</div>
                <div className="text-2xl font-semibold mt-1">{uniqueEntities.size}</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Fields Updated</div>
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

            <DataVersionChangesTable changes={changes} />
          </CardContent>
        </Card>
      </Content>
    </>
  )
}
