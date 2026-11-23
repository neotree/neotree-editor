"use client"

import { useState } from "react"
import { CheckIcon, MoreVertical, XIcon } from "lucide-react"
import Link from "next/link"

import { reviewMdmInventoryFromForm } from "@/app/actions/device-management"
import { Button } from "@/components/ui/button"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppContext } from "@/contexts/app"

export function MdmInventoryReviewActions({
  inventoryId,
  suggestedDeviceId,
}: {
  inventoryId: string
  suggestedDeviceId?: string | null
}) {
  const { viewOnly } = useAppContext()
  const [action, setAction] = useState<"approve" | "ignore" | null>(null)
  const [reason, setReason] = useState("")

  if (viewOnly) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {suggestedDeviceId ? (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault()
                setReason("")
                setAction("approve")
              }}
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Approve match
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem asChild>
            <Link href={`/device-management/links/new?mdmInventoryId=${inventoryId}`}>
              <CheckIcon className="h-4 w-4 mr-2" />
              Link manually
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault()
              setReason("")
              setAction("ignore")
            }}
          >
            <XIcon className="h-4 w-4 mr-2" />
            Ignore
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={!!action} onOpenChange={(open) => !open && setAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "approve" ? "Approve this MDM match?" : "Ignore this MDM device?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "approve"
                ? "NeoTree will create or update the device MDM link using this reviewed match."
                : "NeoTree will keep this Headwind device in inventory but remove it from the review queue."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form action={reviewMdmInventoryFromForm} className="space-y-4">
            <input type="hidden" name="inventoryId" value={inventoryId} />
            <input type="hidden" name="reviewAction" value={action || ""} />
            <input type="hidden" name="deviceId" value={suggestedDeviceId || ""} />
            <input type="hidden" name="reason" value={reason} />
            <div className="space-y-1">
              <Label htmlFor="inventory-review-reason">Reason</Label>
              <Input
                id="inventory-review-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={action === "approve" ? "Confirmed tablet identity" : "Test device or not used by NeoTree"}
                required
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
              <Button type="submit" variant={action === "ignore" ? "primary-outline" : "default"} disabled={!reason.trim()}>
                {action === "approve" ? "Approve match" : "Ignore device"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
