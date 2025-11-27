"use client"

import { ChangelogsTable } from "./changelogs-table"
import type { UseChangelogsTableParams } from "../hooks/use-changelogs-table"

type Props = UseChangelogsTableParams & { isSuperUser: boolean }

export function ChangelogManagement(props: Props) {
  return (
    <div className="space-y-6">
      <ChangelogsTable {...props} />
    </div>
  )
}
