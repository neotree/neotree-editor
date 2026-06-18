"use client";

import { useEffect, useRef, useState } from "react";
import { useTransition } from "react";
import { useFormStatus } from "react-dom";
import {
    EditIcon,
    EyeIcon,
    Loader2Icon,
    LockIcon,
    MoreVertical,
    PackageIcon,
    RefreshCwIcon,
    Trash2Icon,
    UnlinkIcon,
} from "lucide-react";
import Link from "next/link";

import {
    requestDeviceMdmApkRolloutFromForm,
    runDeviceMdmRemoteActionFromForm,
    syncMdmProfileDevicesReport,
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
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useRouter } from "next/navigation";

function escapeHtml(value: unknown) {
    return `${value ?? ""}`
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function ActionSubmitButton({
    children,
    pendingLabel,
    disabled,
    variant = "default",
    onComplete,
}: {
    children: React.ReactNode;
    pendingLabel: string;
    disabled?: boolean;
    variant?: "default" | "destructive";
    onComplete?: () => void;
}) {
    const { pending } = useFormStatus();
    const wasPending = useRef(false);

    useEffect(() => {
        if (pending) {
            wasPending.current = true;
            return;
        }
        if (wasPending.current) {
            wasPending.current = false;
            onComplete?.();
        }
    }, [onComplete, pending]);

    return (
        <Button
            type="submit"
            variant={variant}
            disabled={pending || disabled}
            aria-busy={pending}
        >
            {pending ? (
                <>
                    <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                    {pendingLabel}
                </>
            ) : (
                children
            )}
        </Button>
    );
}

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
    const router = useRouter();
    const { alert } = useAlertModal();
    const [syncPending, startSyncTransition] = useTransition();
    const [unlinkOpen, setUnlinkOpen] = useState(false);
    const [syncOpen, setSyncOpen] = useState(false);
    const [pushApkOpen, setPushApkOpen] = useState(false);
    const [remoteAction, setRemoteAction] = useState<"lock" | "wipe" | null>(
        null,
    );
    const [reason, setReason] = useState("");

    function syncProfileDevices() {
        if (!profileId) return;
        startSyncTransition(async () => {
            const result = await syncMdmProfileDevicesReport(profileId, reason || "Routine inventory sync");
            router.refresh();
            setSyncOpen(false);
            if (result.success && result.summary) {
                const scanned = result.summary.rawRemoteDevices && result.summary.rawRemoteDevices !== result.summary.remoteDevices
                    ? `${result.summary.remoteDevices || 0} in scope from ${result.summary.rawRemoteDevices} scanned`
                    : `${result.summary.remoteDevices || 0} devices scanned`;
                alert({
                    title: "Headwind sync complete",
                    variant: "success",
                    buttonLabel: "Ok",
                    message: `
                        <p><strong>${escapeHtml(result.profileName || "MDM profile")}</strong> synced successfully.</p>
                        <p>${scanned}, ${result.summary.autoLinked || 0} auto-linked, ${result.summary.needsReview || 0} need review, ${result.summary.unmatched || 0} unmatched, ${result.summary.conflicts || 0} conflicts.</p>
                    `,
                });
            } else {
                alert({
                    title: "Headwind sync failed",
                    variant: "error",
                    buttonLabel: "Ok",
                    message: escapeHtml(result.errors?.[0] || "Could not sync Headwind devices"),
                });
            }
        });
    }

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
                                    setPushApkOpen(true);
                                }}
                            >
                                <PackageIcon className="h-4 w-4 mr-2" /> Push
                                APK
                            </DropdownMenuItem>
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
                    <div className="space-y-4">
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
                            <AlertDialogCancel type="button" disabled={syncPending}>
                                Cancel
                            </AlertDialogCancel>
                            <Button
                                type="button"
                                disabled={syncPending}
                                aria-busy={syncPending}
                                onClick={syncProfileDevices}
                            >
                                {syncPending ? (
                                    <>
                                        <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                                        Syncing devices...
                                    </>
                                ) : (
                                    "Sync devices"
                                )}
                            </Button>
                        </AlertDialogFooter>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={pushApkOpen} onOpenChange={setPushApkOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Push current APK?</AlertDialogTitle>
                        <AlertDialogDescription>
                            NeoTree will ask Headwind to install the APK from
                            the current MDM or hybrid app update policy on this
                            tablet.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <form
                        action={requestDeviceMdmApkRolloutFromForm}
                        className="space-y-4"
                    >
                        <input
                            type="hidden"
                            name="linkId"
                            value={linkId || ""}
                        />
                        <input type="hidden" name="reason" value={reason} />
                        <div className="space-y-1">
                            <Label htmlFor="push-apk-reason">Reason</Label>
                            <Input
                                id="push-apk-reason"
                                value={reason}
                                onChange={(event) =>
                                    setReason(event.target.value)
                                }
                                placeholder="Retry current APK rollout"
                                required
                            />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel type="button">
                                Cancel
                            </AlertDialogCancel>
                            <ActionSubmitButton
                                disabled={!reason.trim()}
                                pendingLabel="Requesting push..."
                                onComplete={() => setPushApkOpen(false)}
                            >
                                Push APK
                            </ActionSubmitButton>
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
                            <ActionSubmitButton
                                variant="destructive"
                                disabled={!reason.trim()}
                                pendingLabel="Unlinking device..."
                                onComplete={() => setUnlinkOpen(false)}
                            >
                                Unlink device
                            </ActionSubmitButton>
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
                            <ActionSubmitButton
                                variant={
                                    remoteAction === "wipe"
                                        ? "destructive"
                                        : "default"
                                }
                                disabled={!reason.trim()}
                                pendingLabel={
                                    remoteAction === "wipe"
                                        ? "Requesting wipe..."
                                        : "Requesting lock..."
                                }
                                onComplete={() => setRemoteAction(null)}
                            >
                                {remoteAction === "wipe"
                                    ? "Request wipe"
                                    : "Request lock"}
                            </ActionSubmitButton>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
