"use client"

import { useCallback, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

import { useAppContext } from "@/contexts/app"
import { Modal } from "@/components/modal"
import { Button } from "@/components/ui/button"
import { useAlertModal } from "@/hooks/use-alert-modal"
import { Loader } from "@/components/loader"
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

type Props = {
  variant: "publish" | "discard"
}

const scopeOptions = [
  { label: "my changes only", value: "0" },
  { label: "everything", value: "1" },
]

const DETAILED_SCRIPT_THRESHOLD = 3

export function PublishDrafts({ variant }: Props) {
  const { alert } = useAlertModal()
  const [loading, setLoading] = useState(false)
  const [scope, setScope] = useState<"0" | "1">("0")
  const [publishBlockingErrors, setPublishBlockingErrors] = useState<string[]>([])
  const [publishBlockingDetails, setPublishBlockingDetails] = useState<DataKeyIntegrityPublishDetails | null>(null)
  const [publishBlockingModalOpen, setPublishBlockingModalOpen] = useState(false)

  const { publishData: _publishData, discardDrafts: _discardDrafts } = useAppContext()

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
        setPublishBlockingErrors(res.errors)
        setPublishBlockingDetails(res.blockingDetails || null)
        setPublishBlockingModalOpen(true)
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
  }, [scope, _publishData, alert])

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
  }, [scope, _discardDrafts, alert])

  const trigger =
    variant === "discard" ? (
      <Button variant="destructive" className="h-auto text-xs px-2 py-1">
        Discard changes
      </Button>
    ) : (
      <Button className="h-auto text-xs px-4 py-1">Publish</Button>
    )

  return (
    <>
      <Modal
        open={publishBlockingModalOpen}
        onOpenChange={setPublishBlockingModalOpen}
        title="Publish blocked"
        description="Resolve the blocking data key validation issues below before publishing."
        contentProps={{
          className: "sm:max-w-3xl max-h-[85vh] overflow-hidden",
        }}
        actions={(
          <Button
            variant="outline"
            onClick={() => setPublishBlockingModalOpen(false)}
          >
            Close
          </Button>
        )}
      >
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
            <div className="space-y-3">
              {publishBlockingDetails.summary.map((line, index) => (
                <div
                  key={`${index}-${line}`}
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700"
                >
                  {line}
                </div>
              ))}
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
                          <Link href={script.scriptHref} target="_blank" rel="noreferrer">
                            Open script
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>

                        <Button asChild variant="outline" size="sm">
                          <Link href={script.registryHref} target="_blank" rel="noreferrer">
                            Open datakey integrity registry
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
                                <Link href={issue.usageHref} target="_blank" rel="noreferrer">
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
                        Too many issues to show individually here. Open the datakey integrity registry for this script to review and resolve them.
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Modal>

      <Dialog>
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
