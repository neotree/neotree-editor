import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ArrowRight } from "lucide-react"

import type { PendingDraftQueueEntry, PendingDraftQueueSummary } from "@/app/actions/ops"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function PendingChangesOverview({
  summary,
  latestEntry,
}: {
  summary: PendingDraftQueueSummary
  latestEntry?: PendingDraftQueueEntry
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Pending Draft Changes</h2>
            <p className="max-w-3xl text-sm text-muted-foreground">
              {summary.scopeLabel}. These are saved draft changes waiting for review before they are published.
            </p>
          </div>
          <Button asChild>
            <Link href="/changelogs/pending">
              Review pending changes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Pending Changes</div>
            <div className="mt-1 text-2xl font-semibold">{summary.totalEntries}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Saved Draft Changes</div>
            <div className="mt-1 text-2xl font-semibold">{summary.totalDrafts}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Queued Deletes</div>
            <div className="mt-1 text-2xl font-semibold">{summary.totalDeletes}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Unique Entities</div>
            <div className="mt-1 text-2xl font-semibold">{summary.uniqueEntities}</div>
          </div>
        </div>

        {latestEntry ? (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              Latest saved change: {latestEntry.title}
            </Badge>
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              {latestEntry.statusLabel}
            </Badge>
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              {formatDistanceToNow(new Date(latestEntry.createdAt), { addSuffix: true })}
            </Badge>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            There are no saved draft changes right now. Edit and save an item to add it to this review queue.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
