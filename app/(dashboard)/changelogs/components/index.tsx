"use client"

import { ChangelogsTable } from "./changelogs-table"
import { PendingChangesOverview } from "./pending-changes-overview"
import type { UseChangelogsTableParams } from "../hooks/use-changelogs-table"
import type { PendingDraftQueueEntry, PendingDraftQueueSummary } from "@/app/actions/ops"
import { Card, CardContent } from "@/components/ui/card"

type Props = UseChangelogsTableParams & {
  pendingDraftSummary: PendingDraftQueueSummary
  pendingDraftLatestEntry?: PendingDraftQueueEntry
  isSuperUser: boolean
  currentUserId: string | null
}

export function ChangelogManagement(props: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Changelogs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review saved drafts, publish approved changes, and inspect every previously published version.
        </p>
      </div>
      <PendingChangesOverview summary={props.pendingDraftSummary} latestEntry={props.pendingDraftLatestEntry} />
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Published Versions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These are the versions that have already been published. The active version is what users currently see.
        </p>
      </div>
      <Card className="mb-20">
        <CardContent className="p-0">
          <ChangelogsTable {...props} />
        </CardContent>
      </Card>
    </div>
  )
}
