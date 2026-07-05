"use client"

import { ChangelogsTable } from "./changelogs-table"
import type { UseChangelogsTableParams } from "../hooks/use-changelogs-table"

type Props = UseChangelogsTableParams & {
  pendingDraftCount?: number
  isSuperUser: boolean
  currentUserId: string | null
}

export function ChangelogManagement(props: Props) {
  return <ChangelogsTable {...props} />
}
