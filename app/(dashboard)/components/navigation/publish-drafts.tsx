"use client"

import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ExternalLink } from "lucide-react"

import { useAppContext } from "@/contexts/app"
import { Button } from "@/components/ui/button"
import { useAlertModal } from "@/hooks/use-alert-modal"
import { Loader } from "@/components/loader"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import ucFirst from "@/lib/ucFirst"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { pendingChangesAPI } from "@/lib/indexed-db"
import type { DataKeyIntegrityPublishDetails } from "@/lib/data-key-integrity"
import { getDataKeyIntegrityRulesHref } from "@/lib/data-key-integrity-rules"

type Props = {
  variant: "publish" | "discard"
}

const scopeOptions = [
  { label: "my changes only", value: "0" },
  { label: "everything", value: "1" },
]

const DETAILED_SCRIPT_THRESHOLD = 3

const ruleFixHints: Record<string, string> = {
  "missing data key": "Relink to an existing data key.",
  "unlinked match": "Link the reference to its matching data key.",
  "unmanaged reference": "Choose or create the correct managed data key.",
  "invalid script option": "Resync options from the parent data key.",
  "duplicate parent data key": "Use each parent key only once in the script.",
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

function getRuleCounts(details: DataKeyIntegrityPublishDetails) {
  const counts = new Map<string, number>()
  details.scripts.forEach((script) => {
    script.issues.forEach((issue) => {
      counts.set(issue.ruleLabel, (counts.get(issue.ruleLabel) || 0) + 1)
    })
  })

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }))
}

export function PublishDrafts({ variant }: Props) {
  const { alert } = useAlertModal()
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [scope, setScope] = useState<"0" | "1">("0")
  const [publishBlockingErrors, setPublishBlockingErrors] = useState<string[]>([])
  const [publishBlockingDetails, setPublishBlockingDetails] = useState<DataKeyIntegrityPublishDetails | null>(null)
  const [publishBlockingModalOpen, setPublishBlockingModalOpen] = useState(false)

  const { publishData: _publishData, discardDrafts: _discardDrafts, authenticatedUser } = useAppContext()
  const isCreatingDataKey = pathname === "/data-keys/new"

  // Discarding also restores data keys queued for deletion — surface that so
  // the choice is informed rather than discovered later.
  const [pendingDeletionKeys, setPendingDeletionKeys] = useState<{ createdByUserId: string | null }[]>([])

  const fetchPendingDeletions = useCallback(async () => {
    try {
      const response = await axios.get<{ data: { createdByUserId: string | null }[] }>("/api/data-keys/pending-deletion")
      setPendingDeletionKeys(response.data?.data || [])
    } catch {
      // non-critical — the info line just stays hidden
    }
  }, [])

  const pendingDeletionCount = scope === "1"
    ? pendingDeletionKeys.length
    : pendingDeletionKeys.filter((key) => key.createdByUserId === authenticatedUser?.userId).length

  const closePublishBlockingModal = useCallback(() => {
    setPublishBlockingModalOpen(false)
    setPublishBlockingErrors([])
    setPublishBlockingDetails(null)
  }, [])

  useEffect(() => {
    closePublishBlockingModal()
  }, [pathname, closePublishBlockingModal])

  const publishData = useCallback(async () => {
    try {
      setLoading(true)

      // const res = await _publishData();

      // TODO: Replace this with server action
      const response = await axios.post("/api/ops/publish-data", {
        scope: Number(scope),
      } satisfies Parameters<typeof _publishData>[0])
      const res = response.data as Awaited<ReturnType<typeof _publishData>>

      if (res.errors) {
        if (res.blockingDetails) {
          setPublishBlockingErrors(res.errors)
          setPublishBlockingDetails(res.blockingDetails)
          setPublishBlockingModalOpen(!isCreatingDataKey)
        } else {
          alert({
            variant: "error",
            title: "Failed to publish changes",
            message: res.errors.map((error) => `<div class="mb-1 text-sm text-danger">${error}</div>`).join(""),
          })
        }
      } else {
        await pendingChangesAPI.clearAllChanges()

        alert({
          variant: res.warnings?.length ? "info" : "success",
          title: res.warnings?.length ? "Published with warnings" : "Success",
          message: res.warnings?.length
            ? `Data published successfully.<br /><br />${res.warnings.map((warning) => `<div class="mb-1 text-sm">${warning}</div>`).join("")}`
            : "Data published successfully!",
          onClose: () => window.location.reload(),
        })
      }
    } catch (e: any) {
      alert({
        variant: "error",
        title: "Error",
        message: e.message,
      })
    } finally {
      setLoading(false)
    }
  }, [scope, alert, isCreatingDataKey])

  const discardDrafts = useCallback(async () => {
    try {
      setLoading(true)

      // const res = await _discardDrafts();

      // TODO: Replace this with server action
      const response = await axios.post("/api/ops/discard-drafts", {
        scope: Number(scope),
      } satisfies Parameters<typeof _discardDrafts>[0])
      const res = response.data as Awaited<ReturnType<typeof _discardDrafts>>

      if (res.errors) {
        alert({
          variant: "error",
          title: "Failed to discard changes",
          message: res.errors.map((e) => `<div class="mb-1 text-sm text-danger">${e}</div>`).join(""),
        })
      } else {
        await pendingChangesAPI.clearAllChanges()

        alert({
          variant: "success",
          title: "Success",
          message: "Data discarded successfully!",
          onClose: () => window.location.reload(),
        })
      }
    } catch (e: any) {
      alert({
        variant: "error",
        title: "Error",
        message: e.message,
      })
    } finally {
      setLoading(false)
    }
  }, [scope, alert])

  const trigger =
    variant === "discard" ? (
      <Button variant="destructive" className="h-auto text-xs px-2 py-1">
        Discard changes
      </Button>
    ) : (
      <Button className="h-auto text-xs px-4 py-1">Publish</Button>
    )
  const validationRulesHref = publishBlockingDetails?.scripts[0]?.scriptId
    ? getDataKeyIntegrityRulesHref(publishBlockingDetails.scripts[0].scriptId)
    : null
  const primaryRegistryHref = publishBlockingDetails?.scripts[0]?.registryHref || null
  const ruleCounts = publishBlockingDetails ? getRuleCounts(publishBlockingDetails) : []
  const blocksOnlyNewIssues = !!publishBlockingDetails?.summary.some((line) => line.toLowerCase().includes("block new issues only"))

  return (
    <>
      <AlertDialog
        open={publishBlockingModalOpen && !isCreatingDataKey}
        onOpenChange={(open) => {
          if (!open) closePublishBlockingModal()
          else setPublishBlockingModalOpen(true)
        }}
      >
        <AlertDialogContent className="flex max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <AlertDialogHeader className="shrink-0 border-b border-border px-6 py-5">
            <AlertDialogTitle>Publish blocked</AlertDialogTitle>
            <AlertDialogDescription>
              Review the blocking data key issues, fix them in the registry, then publish again.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
            {!publishBlockingDetails ? (
              <div className="space-y-3">
                {publishBlockingErrors.map((error, index) => (
                  <div
                    key={`${index}-${error}`}
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700"
                  >
                    {error}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="font-medium text-red-950">
                        Fix {pluralize(publishBlockingDetails.totalIssues, "blocking issue")} in {pluralize(publishBlockingDetails.totalScripts, "script")}
                      </div>
                      <p className="text-sm leading-6 text-red-800">
                        {blocksOnlyNewIssues
                          ? "Only newly introduced blocking issues are stopping this publish."
                          : "These blocking issues must be resolved before this publish can continue."}
                      </p>
                    </div>

                    {primaryRegistryHref && (
                      <Button asChild size="sm">
                        <Link href={primaryRegistryHref} target="_blank" rel="noreferrer" onClick={closePublishBlockingModal}>
                          Review blocking issues
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>

                  {!!ruleCounts.length && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {ruleCounts.slice(0, 4).map((rule) => (
                        <span
                          key={rule.label}
                          className="rounded-full border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-800"
                          title={ruleFixHints[rule.label]}
                        >
                          {rule.count} {rule.label}{rule.count === 1 ? "" : "s"}
                        </span>
                      ))}
                      {ruleCounts.length > 4 && (
                        <span className="rounded-full border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-800">
                          +{ruleCounts.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {!!ruleCounts.length && (
                    <div className="mt-3 space-y-1 text-xs leading-5 text-red-800">
                      {ruleCounts.slice(0, 3).map((rule) => (
                        <div key={`hint-${rule.label}`}>
                          <span className="font-medium capitalize">{rule.label}:</span>{" "}
                          {ruleFixHints[rule.label] || "Open the registry and review the affected reference."}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {publishBlockingDetails.scripts.map((script) => {
                    const showDetailedIssues = script.totalIssues <= DETAILED_SCRIPT_THRESHOLD

                    return (
                      <div key={script.scriptId} className="rounded-lg border border-border bg-background">
                        <div className="flex flex-col gap-3 border-b border-b-border px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <div className="font-medium">{script.scriptTitle}</div>
                            <div className="text-sm text-muted-foreground">
                              {script.totalIssues} blocking issue{script.totalIssues === 1 ? "" : "s"}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={script.scriptHref} target="_blank" rel="noreferrer" onClick={closePublishBlockingModal}>
                                Open script
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>

                            <Button asChild variant="outline" size="sm">
                              <Link href={script.registryHref} target="_blank" rel="noreferrer" onClick={closePublishBlockingModal}>
                                Review issues
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>

                        {showDetailedIssues ? (
                          <div className="space-y-3 px-4 py-3">
                            {script.issues.map((issue, index) => (
                              <div key={`${script.scriptId}-${index}-${issue.displayName}`} className="rounded-md border border-amber-200 bg-amber-50 p-3">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="space-y-1">
                                    <div className="text-sm font-medium text-amber-950">{issue.displayName}</div>
                                    <div className="text-xs uppercase tracking-wide text-amber-700">{issue.ruleLabel}</div>
                                    <div className="text-sm leading-6 text-amber-900">{issue.reason}</div>
                                    <div className="text-xs text-amber-800">Location: {issue.location}</div>
                                  </div>

                                  <Button asChild variant="ghost" size="sm" className="justify-start sm:justify-center">
                                    <Link href={issue.usageHref} target="_blank" rel="noreferrer" onClick={closePublishBlockingModal}>
                                      Open usage
                                      <ExternalLink className="ml-2 h-4 w-4" />
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-4 py-3 text-sm text-muted-foreground">
                            Too many issues to show here. Review the focused registry view for the blocking list.
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <AlertDialogFooter className="shrink-0 border-t border-border px-6 py-3">
            {validationRulesHref && (
              <Button asChild variant="outline">
                <Link href={validationRulesHref} target="_blank" rel="noreferrer" onClick={closePublishBlockingModal}>
                  View validation rules
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            <AlertDialogCancel onClick={closePublishBlockingModal}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        onOpenChange={(open) => {
          if (open && variant === "discard") fetchPendingDeletions()
        }}
      >
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent>
          {loading && <Loader overlay />}

          <DialogHeader>
            <DialogTitle>{ucFirst(variant)} data</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <div>
            <RadioGroup
              defaultValue={scopeOptions[0].value}
              onValueChange={(value) => setScope(value as typeof scope)}
              className="flex flex-col gap-y-4"
            >
              {scopeOptions.map((t) => (
                <div key={t.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={t.value} id={t.value} />
                  <Label secondary htmlFor={t.value}>
                    {ucFirst(variant)} {t.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {variant === "discard" && pendingDeletionCount > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {pendingDeletionCount} data key{pendingDeletionCount === 1 ? "" : "s"} queued for deletion will be restored.
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>

            <Button
              variant={variant === "discard" ? "destructive" : undefined}
              onClick={variant === "discard" ? discardDrafts : publishData}
            >
              {ucFirst(variant)} data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
