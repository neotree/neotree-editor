"use client"

import Link from "next/link"

import { useContentSyncStatus } from "@/hooks/use-content-sync-status"
import { isOutOfSync } from "@/lib/content-sync"

/** Admins see how many scripts are out of sync with the linked editor (Settings > Content sync). */
export function ContentSyncIndicator() {
  const sync = useContentSyncStatus()
  if (!sync.active || !sync.settings?.showStatus) return null
  const count = (sync.status?.pairs || []).filter(p => isOutOfSync(p.status)).length
  if (!count) return null
  return (
    <Link href="/settings/sync" className="text-amber-600 hover:underline">
      {count} script{count === 1 ? "" : "s"} out of sync with {sync.settings.role === "target" ? sync.sourceName : sync.targetName}
    </Link>
  )
}
