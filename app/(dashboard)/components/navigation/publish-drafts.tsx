"use client"

import { useCallback, useState } from "react"
import axios from "axios"

import { useAppContext } from "@/contexts/app"
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

type Props = {
  variant: "publish" | "discard"
}

const scopeOptions = [
  { label: "my changes only", value: "0" },
  { label: "everything", value: "1" },
]

export function PublishDrafts({ variant }: Props) {
  const { alert } = useAlertModal()
  const [loading, setLoading] = useState(false)
  const [scope, setScope] = useState<"0" | "1">("0")

  const { publishData: _publishData, discardDrafts: _discardDrafts, drafts, myDrafts, pendingDeletion, myPendingDeletion } = useAppContext()

  const selectedDrafts = scope === "0" ? myDrafts : drafts
  const selectedDeletes = scope === "0" ? myPendingDeletion : pendingDeletion
  const selectedTotal = (selectedDrafts?.total || 0) + (selectedDeletes || 0)

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
        alert({
          variant: "error",
          title: "Failed to publish data",
          message: res.errors.map((e) => `<div class="mb-1 text-sm text-danger">${e}</div>`).join(""),
        })
      } else {
        alert({
          variant: "success",
          title: "Success",
          message: "Data published successfully!",
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
      <Dialog>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent>
          {loading && <Loader overlay />}

          <DialogHeader>
            <DialogTitle>{variant === "publish" ? "Publish reviewed draft changes" : "Discard draft changes"}</DialogTitle>
            <DialogDescription>
              {variant === "publish"
                ? "Review this summary before publishing. Publishing creates a new published version and makes these saved draft changes live."
                : "Discarding removes saved draft changes from the review queue. This cannot be undone from this screen."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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

            <div className="rounded-lg border border-l-4 border-l-primary bg-primary/[0.03] p-4 text-sm">
              <div className="font-medium">
                {scope === "0" ? "Selected scope: my saved draft changes" : "Selected scope: all team saved draft changes"}
              </div>
              <div className="mt-3 grid gap-2 text-muted-foreground sm:grid-cols-2">
                <span>{selectedDrafts?.scripts || 0} script drafts</span>
                <span>{selectedDrafts?.screens || 0} screen drafts</span>
                <span>{selectedDrafts?.diagnoses || 0} diagnosis drafts</span>
                <span>{selectedDrafts?.problems || 0} problem drafts</span>
                <span>{selectedDrafts?.dataKeys || 0} data key drafts</span>
                <span>{selectedDrafts?.drugsLibraryItems || 0} drug/fluid/feed drafts</span>
                <span>{selectedDrafts?.configKeys || 0} configuration drafts</span>
                <span>{selectedDrafts?.hospitals || 0} hospital drafts</span>
                <span className="font-medium text-foreground">{selectedDeletes || 0} queued deletes</span>
                <span className="font-medium text-foreground">{selectedTotal} total pending changes</span>
              </div>
            </div>

            {variant === "publish" && selectedDeletes > 0 && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-800 dark:text-red-200">
                This publish includes queued deletes. Continue only if those deletes were reviewed and are intentional.
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>

            <Button
              variant={variant === "discard" ? "destructive" : undefined}
              disabled={!selectedTotal || loading}
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
