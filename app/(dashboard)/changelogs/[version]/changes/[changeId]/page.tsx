import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, Eye } from "lucide-react"

import { Title } from "@/components/title"
import { Content } from "@/components/content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getChangeLog } from "@/app/actions/change-logs"
import type { ChangeLogType } from "@/databases/queries/changelogs/_get-change-logs"
import { formatChangeValue, getDataVersion, normalizeChanges, resolveEntityTitle } from "@/lib/changelog-utils"
import { getChangeLifecycleStatus, type ChangeLifecycleState } from "@/lib/changelog-status"

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

            <div>
              <div className="text-xs uppercase text-muted-foreground tracking-wide">
                Changed Fields ({normalizedChanges.length})
              </div>
              {normalizedChanges.length === 0 ? (
                <div className="mt-3 text-sm text-muted-foreground italic">
                  No field-level changes recorded for this entry.
                </div>
              ) : (
                <Table className="mt-3">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[220px]">Field</TableHead>
                      <TableHead>Previous Value</TableHead>
                      <TableHead>New Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {normalizedChanges.map((fieldChange, index) => (
                      <TableRow key={`${change.changeLogId}-${index}`} className="align-top">
                        <TableCell className="align-top text-sm font-medium">{fieldChange.field}</TableCell>
                        <TableCell className="align-top">
                          <pre className="whitespace-pre-wrap break-words rounded-md border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
                            {formatChangeValue(fieldChange.previousValue)}
                          </pre>
                        </TableCell>
                        <TableCell className="align-top">
                          <pre className="whitespace-pre-wrap break-words rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                            {formatChangeValue(fieldChange.newValue)}
                          </pre>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </Content>
    </>
  )
}
