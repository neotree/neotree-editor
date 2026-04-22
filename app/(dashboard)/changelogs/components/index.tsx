"use client"

import { ChangelogsTable } from "./changelogs-table"
import { PendingChangesOverview } from "./pending-changes-overview"
import type { UseChangelogsTableParams } from "../hooks/use-changelogs-table"
import type { PendingDraftQueueEntry, PendingDraftQueueSummary } from "@/app/actions/ops"

type Props = UseChangelogsTableParams & {
  pendingDraftSummary: PendingDraftQueueSummary
  pendingDraftLatestEntry?: PendingDraftQueueEntry
  isSuperUser: boolean
  currentUserId: string | null
}

export function ChangelogManagement(props: Props) {
  return (
    <div className="space-y-6">
      <PendingChangesOverview
        summary={props.pendingDraftSummary}
        latestEntry={props.pendingDraftLatestEntry}
      />
      <ChangelogsTable {...props} />
    </div>
  )
}
