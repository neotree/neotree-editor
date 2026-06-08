"use client";

import { useState } from "react";
import {
    EditIcon,
    EyeIcon,
    LockIcon,
    MoreVertical,
    RefreshCwIcon,
    Trash2Icon,
    UnlinkIcon,
} from "lucide-react";
import Link from "next/link";

import {
    runDeviceMdmRemoteActionFromForm,
    syncMdmProfileDevicesFromForm,
    unlinkDeviceFromMdmFromForm,
} from "@/app/actions/device-management";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/contexts/app";

export function DeviceManagementRowActions({
    editHref,
    linkId,
    profileId,
}: {
    editHref: string;
    linkId?: string | null;
    profileId?: string | null;
}) {
    const { viewOnly } = useAppContext();
    const [unlinkOpen, setUnlinkOpen] = useState(false);
    const [syncOpen, setSyncOpen] = useState(false);
    const [remoteAction, setRemoteAction] = useState<"lock" | "wipe" | null>(
        null,
    );
    const [reason, setReason] = useState("");

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                        <Link href={editHref}>
                            {viewOnly ? (
                                <>
                                    <EyeIcon className="h-4 w-4 mr-2" /> View
                                </>
                            ) : (
                                <>
                                    <EditIcon className="h-4 w-4 mr-2" /> Edit
                                </>
                            )}
                        </Link>
                    </DropdownMenuItem>
                    {profileId && !viewOnly ? (
                        <DropdownMenuItem
                            onSelect={(event) => {
                                event.preventDefault();
                                setReason("");
                                setSyncOpen(true);
                            }}
                        >
                            <RefreshCwIcon className="h-4 w-4 mr-2" /> Sync
                            devices
                        </DropdownMenuItem>
                    ) : null}
                    {linkId && !viewOnly ? (
                        <>
                            <DropdownMenuItem
                                onSelect={(event) => {
                                    event.preventDefault();
                                    setReason("");
                                    setRemoteAction("lock");
                                }}
                            >
                                <LockIcon className="h-4 w-4 mr-2" /> Request
                                lock
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={(event) => {
                                    event.preventDefault();
                                    setReason("");
                                    setRemoteAction("wipe");
                                }}
                            >
                                <Trash2Icon className="h-4 w-4 mr-2" /> Request
                                wipe
                            </DropdownMenuItem>
                        </>
                    ) : null}
                    {linkId && !viewOnly ? (
                        <DropdownMenuItem
                            onSelect={(event) => {
                                event.preventDefault();
                                setReason("");
                                setUnlinkOpen(true);
                            }}
                        >
                            <UnlinkIcon className="h-4 w-4 mr-2" /> Unlink
                        </DropdownMenuItem>
                    ) : null}
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={syncOpen} onOpenChange={setSyncOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Sync Headwind devices?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            NeoTree will refresh linked device metadata from
                            this Headwind profile.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <form
                        action={syncMdmProfileDevicesFromForm}
                        className="space-y-4"
                    >
                        <input
                            type="hidden"
                            name="profileId"
                            value={profileId || ""}
                        />
                        <input type="hidden" name="reason" value={reason} />
                        <div className="space-y-1">
                            <Label htmlFor="sync-reason">Reason</Label>
                            <Input
                                id="sync-reason"
                                value={reason}
                                onChange={(event) =>
                                    setReason(event.target.value)
                                }
                                placeholder="Routine inventory refresh"
                            />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel type="button">
                                Cancel
                            </AlertDialogCancel>
                            <Button type="submit">Sync devices</Button>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={unlinkOpen} onOpenChange={setUnlinkOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unlink this device?</AlertDialogTitle>
                        <AlertDialogDescription>
                            NeoTree will remove the MDM link but will not delete
                            the device registration.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <form
                        action={unlinkDeviceFromMdmFromForm}
                        className="space-y-4"
                    >
                        <input
                            type="hidden"
                            name="linkId"
                            value={linkId || ""}
                        />
                        <input
                            type="hidden"
                            name="returnTo"
                            value="/device-management?section=devices"
                        />
                        <input type="hidden" name="reason" value={reason} />
                        <div className="space-y-1">
                            <Label htmlFor="unlink-reason">Reason</Label>
                            <Input
                                id="unlink-reason"
                                value={reason}
                                onChange={(event) =>
                                    setReason(event.target.value)
                                }
                                placeholder="Device replaced or moved"
                                required
                            />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel type="button">
                                Cancel
                            </AlertDialogCancel>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={!reason.trim()}
                            >
                                Unlink device
                            </Button>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={!!remoteAction}
                onOpenChange={(open) => !open && setRemoteAction(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {remoteAction === "wipe"
                                ? "Request remote wipe?"
                                : "Request remote lock?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {remoteAction === "wipe"
                                ? "This asks Headwind to wipe the device when it next receives the command. Use only for serious security incidents."
                                : "This asks Headwind to lock the device when it next receives the command."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <form
                        action={runDeviceMdmRemoteActionFromForm}
                        className="space-y-4"
                    >
                        <input
                            type="hidden"
                            name="linkId"
                            value={linkId || ""}
                        />
                        <input
                            type="hidden"
                            name="action"
                            value={remoteAction || ""}
                        />
                        <input type="hidden" name="reason" value={reason} />
                        <div className="space-y-1">
                            <Label htmlFor="remote-action-reason">Reason</Label>
                            <Input
                                id="remote-action-reason"
                                value={reason}
                                onChange={(event) =>
                                    setReason(event.target.value)
                                }
                                placeholder={
                                    remoteAction === "wipe"
                                        ? "Stolen device or confirmed breach"
                                        : "Tablet reported missing"
                                }
                                required
                            />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel type="button">
                                Cancel
                            </AlertDialogCancel>
                            <Button
                                type="submit"
                                variant={
                                    remoteAction === "wipe"
                                        ? "destructive"
                                        : "default"
                                }
                                disabled={!reason.trim()}
                            >
                                {remoteAction === "wipe"
                                    ? "Request wipe"
                                    : "Request lock"}
                            </Button>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
