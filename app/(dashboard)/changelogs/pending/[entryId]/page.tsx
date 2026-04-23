import Link from "next/link"
import { notFound } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ArrowLeft } from "lucide-react"

import { getPendingDraftQueue, type PendingDraftQueueEntry } from "@/app/actions/ops"
import { Content } from "@/components/content"
import { Title } from "@/components/title"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { buildHumanDiffRows, formatTechnicalDiffValue, parseDraftPreviewValue } from "@/lib/changelog-human-diff"
import { ChangelogWorkflowRail } from "../../components/workflow-rail"

export const dynamic = "force-dynamic"

type Params = {
  entryId: string
}

const entityLabels: Record<PendingDraftQueueEntry["entityType"], string> = {
  script: "Script",
  screen: "Screen",
  diagnosis: "Diagnosis",
  problem: "Problem",
  config_key: "Config Key",
  hospital: "Hospital",
  drugs_library: "Drugs Library",
  data_key: "Data Key",
  alias: "Alias",
}

const actionBadgeClasses: Record<PendingDraftQueueEntry["action"], string> = {
  create: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  update: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  delete: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
}

const entityBadgeClasses: Record<PendingDraftQueueEntry["entityType"], string> = {
  script: "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
  screen: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  diagnosis: "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  problem: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  config_key: "border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  hospital: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  drugs_library: "border-teal-500/20 bg-teal-500/10 text-teal-700 dark:text-teal-300",
  data_key: "border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  alias: "border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
}

function humanizeDraftDiff(entry: PendingDraftQueueEntry) {
  return entry.diffPreview.flatMap((preview) => {
    return buildHumanDiffRows({
      field: preview.field,
      before: parseDraftPreviewValue(preview.before),
      after: parseDraftPreviewValue(preview.after),
    })
  })
}

export default async function PendingDraftDiffPage({ params }: { params: Params }) {
  const entryId = decodeURIComponent(params.entryId)
  const pendingDraftQueue = await getPendingDraftQueue({
    entryId,
    scope: "all",
    pageSize: 10,
  })

  if (pendingDraftQueue.errors?.length) {
    throw new Error(pendingDraftQueue.errors.join(", "))
  }

  const entry = pendingDraftQueue.data[0]
  if (!entry) {
    notFound()
  }

  const readableDiffs = humanizeDraftDiff(entry)
  const changedSummary =
    entry.action === "delete"
      ? "This item is queued for deletion."
      : `${readableDiffs.length} readable ${readableDiffs.length === 1 ? "change" : "changes"} will be published.`

  return (
    <>
      <Title>Draft Diff</Title>
      <Content className="space-y-6">
        <ChangelogWorkflowRail current="drafts" />

        <Link href="/changelogs/pending" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to pending drafts
        </Link>

        <Card>
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl">{entry.title}</CardTitle>
            <p className="text-sm text-muted-foreground">Review only the details that will change when this draft is published.</p>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className={entityBadgeClasses[entry.entityType]}>
                {entityLabels[entry.entityType]}
              </Badge>
              <Badge variant="outline" className={actionBadgeClasses[entry.action]}>
                {entry.action === "create" ? "Create" : entry.action === "update" ? "Update" : "Delete"}
              </Badge>
              <Badge variant="outline" className="bg-muted text-muted-foreground">
                {entry.statusLabel}
              </Badge>
              {entry.parentTitle && (
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  {entry.parentTitle}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap justify-end gap-2">
              {entry.href && (
                <Button asChild variant="outline">
                  <Link href={entry.href}>Open editor</Link>
                </Button>
              )}
              {entry.parentHref && (
                <Button asChild variant="outline">
                  <Link href={entry.parentHref}>Open parent</Link>
                </Button>
              )}
              {entry.searchHref && (
                <Button asChild variant="outline">
                  <Link href={entry.searchHref}>View history</Link>
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Saved By</div>
                <div className="mt-1 text-sm font-medium">
                  {entry.createdByName}
                  {entry.createdByEmail ? ` | ${entry.createdByEmail}` : ""}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Saved</div>
                <div className="mt-1 text-sm font-medium">{formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Draft Action</div>
                <div className="mt-1 text-sm font-medium">{entry.description}</div>
              </div>
              {entry.parentTitle && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Grouped Under</div>
                  <div className="mt-1 text-sm font-medium">{entry.parentTitle}</div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-6">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">What Changed</div>
                <div className="mt-3 rounded-lg border border-border/60 bg-muted/30">
                  <div className="border-b border-border/60 px-4 py-3">
                    <div className="text-sm font-medium">{changedSummary}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Current saved values are shown on the left. Draft values that will be published are shown on the right.
                    </div>
                  </div>
                  <div className="grid gap-3 px-4 py-3 md:grid-cols-2">
                    <div className="rounded-lg border border-border/60 bg-background/80 p-3">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Readable Changes</div>
                      <div className="mt-1 text-2xl font-semibold">{readableDiffs.length}</div>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/80 p-3">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Publish Result</div>
                      <div className="mt-1 text-sm font-medium">
                        {entry.action === "create"
                          ? "A new item will be created"
                          : entry.action === "update"
                            ? "The existing item will be updated"
                            : "The item will be deleted"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Detailed Changes ({readableDiffs.length})</div>
                {entry.action === "delete" ? (
                  <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/[0.04] p-4 text-sm text-red-700 dark:text-red-300">
                    This item is queued for deletion. Publishing will remove it from the active editor data.
                  </div>
                ) : readableDiffs.length ? (
                  <div className="mt-4 space-y-4">
                    {readableDiffs.map((diff) => (
                      <div key={diff.id} className="rounded-lg border border-border/60 bg-background/90">
                        <div className="border-b border-border/60 px-4 py-3">
                          <div className="font-medium">{diff.itemLabel || diff.fieldLabel}</div>
                          {diff.itemLabel && <div className="mt-1 text-sm text-muted-foreground">{diff.fieldLabel}</div>}
                          {diff.detailLabel && <div className="mt-2 text-sm font-medium">{diff.detailLabel}</div>}
                        </div>
                        <div className="grid gap-3 p-4 md:grid-cols-2">
                          <div className="rounded-lg border border-rose-500/15 bg-rose-500/[0.04] p-3">
                            <div className="text-xs uppercase tracking-wide text-muted-foreground">Current saved version</div>
                            <div className="mt-2 whitespace-pre-wrap break-words text-sm">{diff.before}</div>
                          </div>
                          <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.05] p-3">
                            <div className="text-xs uppercase tracking-wide text-muted-foreground">Draft to publish</div>
                            <div className="mt-2 whitespace-pre-wrap break-words text-sm">{diff.after}</div>
                          </div>
                        </div>
                        <details className="border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
                          <summary className="cursor-pointer font-medium">Show technical details</summary>
                          <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <pre className="max-h-72 overflow-auto rounded-md bg-muted p-3 whitespace-pre-wrap">
                              {formatTechnicalDiffValue(diff.rawBefore)}
                            </pre>
                            <pre className="max-h-72 overflow-auto rounded-md bg-muted p-3 whitespace-pre-wrap">
                              {formatTechnicalDiffValue(diff.rawAfter)}
                            </pre>
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 rounded-lg border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
                    No field-level differences were detected for this draft.
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
