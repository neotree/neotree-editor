"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { ArrowRight, MoreVertical, Search } from "lucide-react"

import { Loader } from "@/components/loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TablePagination } from "@/components/table-pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  CHANGELOG_ENTITY_TYPE_LABELS,
  getChangelogEntityTypeLabel,
  resolveEntityTitle,
} from "@/lib/changelog-utils"
import {
  DEFAULT_RELEASE_ROLLBACK_CREATED_ENTITY_POLICY,
  RELEASE_ROLLBACK_MAX_RECENT_DEPTH,
  ROLLBACK_MAX_TARGET_AGE_DAYS,
  evaluateReleaseRollbackTargetPolicy,
} from "@/lib/changelog-rollback"
import axios from "axios"
import { useAlertModal } from "@/hooks/use-alert-modal"
import { useAppContext } from "@/contexts/app"
import {
  type ChangeLogType,
  type DataVersionSummary,
  type UseChangelogsTableParams,
  useChangelogsTable,
} from "../hooks/use-changelogs-table"

type Props = UseChangelogsTableParams & {
  isSuperUser: boolean
  currentUserId?: string | null
  pendingDraftCount?: number
}

function formatEntitySummary(entry: DataVersionSummary) {
  const items = Object.entries(entry.entityCounts).sort(([, countA], [, countB]) => countB - countA)

  if (!items.length) return "-"

  return items
    .map(([entityType, count]) => {
      const label = getChangelogEntityTypeLabel(entityType)
      return `${count} ${label}${count === 1 ? "" : "s"}`
    })
    .join(", ")
}

function buildDetailsHref(dataVersion: number) {
  return `/changelogs/v${dataVersion}`
}

function VersionStatus({ entry }: { entry: DataVersionSummary }) {
  if (entry.rollbackSourceVersion) {
    return (
      <div
        className="inline-flex items-center gap-x-1.5"
        title={`This release restores the state of release v${entry.rollbackSourceVersion}.`}
      >
        <div className="w-2 h-2 rounded-full bg-orange-400" />
        <span>Restores release v{entry.rollbackSourceVersion}</span>
      </div>
    )
  }

  // A release created by rolling back a single item. Its target version belongs to the
  // item itself and must not read like a release number.
  if (entry.rollbackEntity) {
    const entityLabel = getChangelogEntityTypeLabel(entry.rollbackEntity.entityType)
    const targetVersion = entry.rollbackEntity.targetVersion

    return (
      <div
        className="inline-flex items-center gap-x-1.5"
        title={
          `This release was published by rolling back a ${entityLabel}` +
          (targetVersion !== null ? ` to its own version v${targetVersion} (item version, not a release number).` : ".")
        }
      >
        <div className="w-2 h-2 rounded-full bg-orange-400" />
        <span>{entityLabel} rollback</span>
      </div>
    )
  }

  if (entry.isLatestVersion) {
    return (
      <div className="inline-flex items-center gap-x-1.5" title="This is the latest published version.">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <span>Active</span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-x-1.5" title="A newer release has replaced this version.">
      <div className="w-2 h-2 rounded-full bg-gray-300" />
      <span>Superseded</span>
    </div>
  )
}

export function ChangelogsTable(props: Props) {
  const {
    dataVersions,
    loading,
    searchValue,
    entityType,
    action,
    sort,
    pagination,
    currentPage,
    itemsPerPage,
    sortOptions,
    setSearchValue,
    setEntityType,
    setAction,
    setSort,
    setCurrentPage,
    loadChangelogs,
    clearFilters,
    latestDataVersion,
    detailsByVersion,
    detailsLoadingByVersion,
    loadVersionDetails,
  } = useChangelogsTable(props)

  const { isSuperUser, pendingDraftCount = 0 } = props
  const { viewOnly } = useAppContext()

  const router = useRouter()
  const { alert } = useAlertModal()
  const [rollbacking, setRollbacking] = useState<number | null>(null)
  const [pendingRollbackEntry, setPendingRollbackEntry] = useState<DataVersionSummary | null>(null)
  const [showEntityDetails, setShowEntityDetails] = useState(false)
  const [softDeleteCreated, setSoftDeleteCreated] = useState(DEFAULT_RELEASE_ROLLBACK_CREATED_ENTITY_POLICY === "soft_delete")
  const [allowDeepRollback, setAllowDeepRollback] = useState(false)
  const [targetRollbackVersion, setTargetRollbackVersion] = useState<number | null>(null)
  const [deepRollbackConfirmText, setDeepRollbackConfirmText] = useState("")

  useEffect(() => {
    if (pendingRollbackEntry) {
      loadVersionDetails(pendingRollbackEntry.dataVersion)
    }
  }, [loadVersionDetails, pendingRollbackEntry])

  useEffect(() => {
    if (!viewOnly) return
    setPendingRollbackEntry(null)
    setShowEntityDetails(false)
    setSoftDeleteCreated(DEFAULT_RELEASE_ROLLBACK_CREATED_ENTITY_POLICY === "soft_delete")
    setAllowDeepRollback(false)
    setTargetRollbackVersion(null)
    setDeepRollbackConfirmText("")
  }, [viewOnly])

  const currentRollbackVersion = pendingRollbackEntry?.dataVersion ?? latestDataVersion ?? null
  const publishedAtByVersion = useMemo(
    () => new Map(dataVersions.map((entry) => [entry.dataVersion, entry.publishedAt])),
    [dataVersions],
  )
  const recentRollbackTargets = useMemo(() => {
    if (!currentRollbackVersion || currentRollbackVersion < 2) return []
    const targets: number[] = []
    const minVersion = Math.max(1, currentRollbackVersion - RELEASE_ROLLBACK_MAX_RECENT_DEPTH)
    for (let version = currentRollbackVersion - 1; version >= minVersion; version--) {
      // When the release's publish date is loaded, hide targets the server would reject
      // (older than the age window or before the clean-slate floor); unknown dates are
      // kept and validated server-side.
      const publishedAt = publishedAtByVersion.get(version)
      if (
        publishedAt &&
        !evaluateReleaseRollbackTargetPolicy({ targetDataVersion: version, targetPublishedAt: publishedAt }).allowed
      ) {
        continue
      }
      targets.push(version)
    }
    return targets
  }, [currentRollbackVersion, publishedAtByVersion])

  const handleNavigate = (version: number) => {
    router.push(buildDetailsHref(version))
  }

  const handleRollbackDataVersion = async (dataVersion: number, restoreToVersion: number, deepRollbackOverride: boolean) => {
    if (viewOnly) return
    if (dataVersion < 2) return
    if (!Number.isFinite(restoreToVersion) || restoreToVersion < 1 || restoreToVersion >= dataVersion) {
      alert({
        title: "Invalid rollback target",
        message: "Choose an older published release to restore.",
        variant: "error",
      })
      return
    }

    try {
      setRollbacking(dataVersion)
      const res = await axios.post("/api/changelogs/rollback-data-version", {
        dataVersion,
        toDataVersion: restoreToVersion,
        allowDeepRollback: deepRollbackOverride,
        changeReason: `Rollback release v${dataVersion} to state of v${restoreToVersion}`,
        createdEntityPolicy: softDeleteCreated ? "soft_delete" : "keep",
      })

      if (res.data?.errors?.length) {
        throw new Error(res.data.errors.join(", "))
      }

      const warnings: string[] = res.data?.warnings || []
      alert({
        title: "Rollback complete",
        message: [
          `Release v${dataVersion} was rolled back to the state of v${restoreToVersion}. New release v${dataVersion + 1} was created. Refreshing...`,
          ...warnings,
        ].join("\n\n"),
        variant: "success",
        onClose: () => {
          router.refresh()
          loadChangelogs()
        },
      })
    } catch (e: any) {
      const serverErrors: string[] = e?.response?.data?.errors || []
      alert({
        title: "Rollback failed",
        message: serverErrors.length ? serverErrors.join(", ") : e.message || "An unexpected error occurred.",
        variant: "error",
      })
    } finally {
      setRollbacking(null)
      setPendingRollbackEntry(null)
      setSoftDeleteCreated(DEFAULT_RELEASE_ROLLBACK_CREATED_ENTITY_POLICY === "soft_delete")
      setAllowDeepRollback(false)
      setTargetRollbackVersion(null)
      setDeepRollbackConfirmText("")
    }
  }

  const renderEntityImpactList = (entry: DataVersionSummary) => {
    const items = Object.entries(entry.entityCounts)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)

    if (!items.length) return <p className="text-sm text-muted-foreground">No entities recorded.</p>

    return (
      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
        {items.map(([entityType, count]) => (
          <li key={entityType}>
            {count} {getChangelogEntityTypeLabel(entityType)}
          </li>
        ))}
      </ul>
    )
  }

  const renderEntityDetails = (entry: DataVersionSummary, details?: ChangeLogType[]) => {
    if (!details || details.length === 0) {
      return <p className="text-sm text-muted-foreground">No entity details available.</p>
    }

    const groups = details.reduce<Record<string, { label: string; items: string[] }>>((acc, change) => {
      const key = change.entityType
      const label = getChangelogEntityTypeLabel(key)
      const title = resolveEntityTitle(change) || change.entityId
      if (!acc[key]) acc[key] = { label, items: [] }
      acc[key].items.push(`${title} (${change.entityId})`)
      return acc
    }, {})

    const groupEntries = Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
    if (!groupEntries.length) return null

    return (
      <div className="space-y-3">
        {groupEntries.map(([key, group]) => (
          <div key={key}>
            <p className="text-sm font-semibold text-foreground">{group.label}</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {group.items.map((item, idx) => (
                <li key={`${key}-${idx}`}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {(loading || rollbacking !== null) && <Loader overlay />}

      <div className="flex flex-col gap-y-4">
        <div className="pt-4 px-4 flex items-center gap-x-4">
          <div className="text-2xl">Changelogs</div>

          <div className="ml-auto">
            <Button asChild variant="outline" size="sm">
              <Link href="/changelogs/pending">
                Pending changes{pendingDraftCount ? ` (${pendingDraftCount})` : ""}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="px-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by version, publisher, or item id"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {Object.entries(CHANGELOG_ENTITY_TYPE_LABELS)
                .filter(([value]) => value !== "release")
                .map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="rollback">Rollback</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(searchValue || entityType !== "all" || action !== "all" || sort !== sortOptions[0].value) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} disabled={loading}>
              Clear
            </Button>
          )}
        </div>

        {dataVersions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {loading ? "Loading..." : "No published versions match your filters."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Version</TableHead>
                <TableHead className="w-[110px]">Status</TableHead>
                <TableHead className="w-[90px] text-right">Changes</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead className="w-[180px]">Published By</TableHead>
                <TableHead className="w-[170px]">Published At</TableHead>
                <TableHead className="text-right w-10">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataVersions.map((entry) => {
                const publishedAt = entry.publishedAt ? format(new Date(entry.publishedAt), "PP p") : "Unknown"

                return (
                  <TableRow
                    key={entry.dataVersion}
                    className="cursor-pointer transition-colors hover:bg-muted/60"
                    onClick={() => handleNavigate(entry.dataVersion)}
                  >
                    <TableCell className="font-medium">v{entry.dataVersion}</TableCell>
                    <TableCell className="text-sm">
                      <VersionStatus entry={entry} />
                    </TableCell>
                    <TableCell className="text-right">{entry.totalChanges}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatEntitySummary(entry)}</TableCell>
                    <TableCell title={entry.publishedByEmail || undefined}>{entry.publishedByName || "Unknown user"}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{publishedAt}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="p-0 h-auto w-auto transition-colors rounded-full hover:text-primary hover:bg-transparent"
                          >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                          <DropdownMenuItem onClick={() => handleNavigate(entry.dataVersion)} className="cursor-pointer">
                            View details
                          </DropdownMenuItem>
                          {isSuperUser && !viewOnly && entry.isLatestVersion && entry.dataVersion > 1 && (
                            <DropdownMenuItem
                              disabled={rollbacking === entry.dataVersion}
                              onClick={() => {
                                setPendingRollbackEntry(entry)
                                setAllowDeepRollback(false)
                                setTargetRollbackVersion(entry.dataVersion - 1)
                              }}
                              className="cursor-pointer text-orange-600 focus:text-orange-700"
                            >
                              {rollbacking === entry.dataVersion ? "Rolling back..." : `Rollback to v${entry.dataVersion - 1}`}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 pb-4">
            <TablePagination
              page={currentPage}
              totalPages={pagination.totalPages}
              total={pagination.total}
              pageSize={itemsPerPage}
              itemNoun="releases"
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <AlertDialog
        open={!viewOnly && pendingRollbackEntry !== null}
        onOpenChange={(open) => {
          // Keep the dialog up while the rollback request is in flight
          if (!open && rollbacking === null) {
            setPendingRollbackEntry(null)
            setShowEntityDetails(false)
            setSoftDeleteCreated(DEFAULT_RELEASE_ROLLBACK_CREATED_ENTITY_POLICY === "soft_delete")
            setAllowDeepRollback(false)
            setTargetRollbackVersion(null)
            setDeepRollbackConfirmText("")
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Danger: rollback release</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                {pendingRollbackEntry && (
                  <>
                    <p>
                      You are about to publish a rollback for release v{pendingRollbackEntry.dataVersion}, restoring the state of an earlier
                      release. This will publish a new release v{pendingRollbackEntry.dataVersion + 1}.
                    </p>
                    {rollbacking !== null && <p className="text-sm text-muted-foreground">Rollback in progress. Please wait...</p>}
                    <div>
                      <p className="font-medium text-foreground mb-1">Entities affected:</p>
                      {renderEntityImpactList(pendingRollbackEntry)}
                      <div className="mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-0 text-primary"
                          onClick={() => setShowEntityDetails((prev) => !prev)}
                        >
                          {showEntityDetails ? "Hide entity list" : "View entity list"}
                        </Button>
                      </div>
                      {showEntityDetails && (
                        <div className="mt-2 max-h-56 overflow-y-auto pr-2">
                          {detailsLoadingByVersion[pendingRollbackEntry.dataVersion] ? (
                            <p className="text-sm text-muted-foreground">Loading entity details...</p>
                          ) : (
                            renderEntityDetails(pendingRollbackEntry, detailsByVersion[pendingRollbackEntry.dataVersion])
                          )}
                        </div>
                      )}
                    </div>
                    <div className="pt-1">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Restore to release</label>
                        {!allowDeepRollback ? (
                          <select
                            value={targetRollbackVersion ?? ""}
                            onChange={(event) => setTargetRollbackVersion(Number(event.target.value))}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            disabled={viewOnly || rollbacking !== null}
                          >
                            {recentRollbackTargets.map((version) => (
                              <option key={version} value={version}>
                                v{version}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            type="number"
                            min={1}
                            max={pendingRollbackEntry.dataVersion - 1}
                            value={targetRollbackVersion ?? ""}
                            onChange={(event) => setTargetRollbackVersion(Number(event.target.value))}
                            disabled={viewOnly || rollbacking !== null}
                            placeholder={`Enter target release version`}
                          />
                        )}
                        <p className="text-xs text-muted-foreground">
                          Standard rollback is limited to the last {RELEASE_ROLLBACK_MAX_RECENT_DEPTH} prior releases. Only releases
                          published within the last {ROLLBACK_MAX_TARGET_AGE_DAYS} days (and after the clean-slate baseline of 1 July
                          2026) can be restored.
                        </p>
                      </div>
                      <label className="mt-3 flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowDeepRollback}
                          onChange={(event) => {
                            const checked = event.target.checked
                            setAllowDeepRollback(checked)
                            setDeepRollbackConfirmText("")
                            if (!checked) {
                              setTargetRollbackVersion(pendingRollbackEntry.dataVersion - 1)
                            }
                          }}
                          className="rounded"
                          disabled={viewOnly || rollbacking !== null}
                        />
                        <span>Deep restore override for older releases</span>
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Superuser-only. Widens the choice beyond the last {RELEASE_ROLLBACK_MAX_RECENT_DEPTH} releases, but cannot bypass
                        the {ROLLBACK_MAX_TARGET_AGE_DAYS}-day age limit or the clean-slate baseline.
                      </p>
                      {allowDeepRollback && (
                        <div className="mt-3 space-y-1">
                          <label className="text-sm font-medium text-foreground">
                            Type <span className="font-mono">v{targetRollbackVersion ?? "?"}</span> to confirm the deep restore
                          </label>
                          <Input
                            value={deepRollbackConfirmText}
                            onChange={(event) => setDeepRollbackConfirmText(event.target.value)}
                            placeholder={`v${targetRollbackVersion ?? ""}`}
                            disabled={viewOnly || rollbacking !== null}
                          />
                        </div>
                      )}
                    </div>
                    <div className="pt-1">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={softDeleteCreated}
                          onChange={(event) => setSoftDeleteCreated(event.target.checked)}
                          className="rounded"
                          disabled={viewOnly || rollbacking !== null}
                        />
                        <span>Soft delete items created in this release</span>
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Recommended. Newly created entities with no prior snapshot will be marked deleted so the rollback matches the
                        previous published release.
                      </p>
                    </div>
                  </>
                )}
                <p className="font-semibold text-foreground">Do not proceed unless you are absolutely sure what you are doing.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rollbacking !== null} onClick={() => setPendingRollbackEntry(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={
                viewOnly ||
                rollbacking !== null ||
                pendingRollbackEntry === null ||
                !targetRollbackVersion ||
                targetRollbackVersion < 1 ||
                targetRollbackVersion >= pendingRollbackEntry.dataVersion ||
                (allowDeepRollback && deepRollbackConfirmText.trim().toLowerCase() !== `v${targetRollbackVersion}`)
              }
              onClick={() => {
                if (pendingRollbackEntry !== null && targetRollbackVersion) {
                  handleRollbackDataVersion(pendingRollbackEntry.dataVersion, targetRollbackVersion, allowDeepRollback)
                }
              }}
            >
              Proceed with rollback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
