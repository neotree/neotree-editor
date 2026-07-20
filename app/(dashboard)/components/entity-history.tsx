"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import axios from "axios"
import { format } from "date-fns"
import { ExternalLink, History, RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAppContext } from "@/contexts/app"
import type { ChangeLogType } from "@/databases/queries/changelogs/_get-change-logs"
import {
  getChangelogActionBadgeClass,
  getChangelogActionLabel,
  getChangelogEntityTypeLabel,
  getDataVersion,
} from "@/lib/changelog-utils"
import { getRollbackButtonTargetVersion } from "@/lib/changelog-publish"
import { evaluateEntityRollbackTargetPolicy } from "@/lib/changelog-rollback"
import { getProtectedDependentRollbackMessage, isProtectedDependentRollbackChange } from "@/lib/changelog-rollback-guards"
import { RollbackButton } from "../changelogs/components/rollback-button"

type EntityHistoryProps = {
  entityId: string
  entityType: string
  entityName?: string
}

function isMeaningfulRestoreSnapshot(snapshot: unknown): boolean {
  return !!snapshot && typeof snapshot === "object" && !Array.isArray(snapshot) && Object.keys(snapshot).length > 0
}

export function EntityHistorySheet({
  entityId,
  entityType,
  entityName,
  open,
  onOpenChange,
}: EntityHistoryProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { viewOnly, isSuperUser } = useAppContext()
  const [entries, setEntries] = useState<ChangeLogType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.post("/api/changelogs/entity-history", {
        entityId,
        entityType,
        includeInactive: true,
        limit: 100,
      })
      if (res.data?.errors?.length) {
        throw new Error(res.data.errors.join(", "))
      }
      setEntries(Array.isArray(res.data?.data) ? res.data.data : [])
    } catch (e: any) {
      setError(e?.response?.data?.errors?.join(", ") || e.message || "Failed to load history")
    } finally {
      setLoading(false)
    }
  }, [entityId, entityType])

  useEffect(() => {
    if (open) load()
  }, [load, open])

  const entityLabel = getChangelogEntityTypeLabel(entityType)
  const canRollback = isSuperUser && !viewOnly

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-4 overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {entityLabel} history
          </SheetTitle>
          <SheetDescription>
            {entityName ? `Published versions of "${entityName}".` : "Published versions of this item."} Draft changes appear here
            after they are published. Restoring never rewrites history — it publishes a new version.
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {loading ? "Loading history..." : `${entries.length} version${entries.length === 1 ? "" : "s"}`}
          </div>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="gap-2">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && !entries.length && (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No published history yet for this item. Save and publish a change to start its version trail.
          </div>
        )}

        <div className="space-y-3">
          {entries.map((entry) => {
            const dataVersion = getDataVersion(entry)
            const isProtected = isProtectedDependentRollbackChange(entry)
            const rollbackTargetVersion = getRollbackButtonTargetVersion({
              parentVersion: entry.parentVersion,
              mergedFromVersion: entry.mergedFromVersion,
            })
            const activeVersion = entries.find((candidate) => candidate.isActive)?.version ?? null
            const restorePolicy = evaluateEntityRollbackTargetPolicy({
              entityType: entry.entityType,
              currentVersion: activeVersion,
              targetVersion: entry.version,
              targetDate: entry.dateOfChange,
            })
            const showRollbackPrevious = canRollback && entry.isActive && (rollbackTargetVersion ?? null) !== null && !isProtected
            const showRestoreThis =
              canRollback &&
              !entry.isActive &&
              entry.version > 0 &&
              !isProtected &&
              restorePolicy.allowed &&
              isMeaningfulRestoreSnapshot(entry.fullSnapshot)

            return (
              <div
                key={entry.changeLogId}
                className={cn(
                  "rounded-lg border p-4",
                  entry.isActive ? "border-emerald-500/40 bg-emerald-500/[0.04]" : "border-border/70 bg-background/70",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">v{entry.version}</span>
                  <Badge variant="outline" className={getChangelogActionBadgeClass(entry.action)}>
                    {getChangelogActionLabel(entry.action)}
                  </Badge>
                  {entry.isActive ? (
                    <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground">
                      Superseded
                    </Badge>
                  )}
                  {dataVersion !== null && (
                    <Badge variant="outline" className="bg-muted text-muted-foreground">
                      Data v{dataVersion}
                    </Badge>
                  )}
                </div>

                {(entry.description || entry.changeReason) && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{entry.description || entry.changeReason}</p>
                )}

                <div className="mt-2 text-xs text-muted-foreground">
                  {entry.userName || "Unknown user"} | {format(new Date(entry.dateOfChange), "PPpp")}
                </div>

                {isProtected && (
                  <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                    {getProtectedDependentRollbackMessage(entry.entityType)}
                  </p>
                )}

                {canRollback && !entry.isActive && entry.version > 0 && !isProtected && !restorePolicy.allowed && (
                  <p className="mt-2 text-xs text-muted-foreground">{restorePolicy.reason}</p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {dataVersion !== null && (
                    <Button asChild variant="ghost" size="sm" className="gap-1 text-primary">
                      <Link href={`/changelogs/v${dataVersion}/changes/${entry.changeLogId}`}>
                        View details
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  )}
                  {showRollbackPrevious && (
                    <RollbackButton
                      entityId={entry.entityId}
                      entityType={entry.entityType}
                      targetVersion={rollbackTargetVersion}
                      currentVersion={entry.version}
                    />
                  )}
                  {showRestoreThis && (
                    <RollbackButton entityId={entry.entityId} entityType={entry.entityType} targetVersion={entry.version} mode="restore" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function EntityHistoryButton({ entityId, entityType, entityName, className }: EntityHistoryProps & { className?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" className={cn("gap-2", className)} onClick={() => setOpen(true)}>
        <History className="h-4 w-4" />
        History
      </Button>
      <EntityHistorySheet entityId={entityId} entityType={entityType} entityName={entityName} open={open} onOpenChange={setOpen} />
    </>
  )
}
