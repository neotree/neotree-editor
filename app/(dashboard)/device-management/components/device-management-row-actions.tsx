"use client";

import { useEffect, useRef, useState } from "react";
import { useTransition } from "react";
import { useFormStatus } from "react-dom";
import {
    EditIcon,
    EyeIcon,
    KeyRoundIcon,
    Loader2Icon,
    LockIcon,
    MoreVertical,
    PackageIcon,
    PowerIcon,
    RefreshCwIcon,
    Trash2Icon,
    UnlinkIcon,
    UnlockIcon,
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

type RemoteCommand = "lock" | "unlock" | "wipe" | "reboot" | "resetPassword";

// Maps each command to the provider capability that must be enabled on the device's
// MDM profile. When `capabilities` is supplied we hide actions that are not enabled,
// matching the server-side default-deny gating in runDeviceMdmRemoteActionFromForm.
const COMMAND_CAPABILITY: Record<RemoteCommand, string> = {
    lock: "remoteLock",
    unlock: "remoteLock",
    wipe: "remoteWipe",
    reboot: "reboot",
    resetPassword: "resetPassword",
};

const COMMAND_COPY: Record<
    RemoteCommand,
    { title: string; description: string; cta: string; pending: string; reasonPlaceholder: string; destructive?: boolean }
> = {
    lock: {
        title: "Lock device?",
        description: "Headwind will lock the device when it next receives the command.",
        cta: "Lock device",
        pending: "Locking...",
        reasonPlaceholder: "Tablet reported missing",
    },
    unlock: {
        title: "Unlock device?",
        description: "Headwind will remove the remote device lock when it next receives the command.",
        cta: "Unlock device",
        pending: "Unlocking...",
        reasonPlaceholder: "Tablet recovered and identity confirmed",
    },
    wipe: {
        title: "Factory reset device?",
        description:
            "Headwind will factory reset (wipe) the device when it next receives the command. This deletes Headwind MDM and all data; the device must be re-enrolled. Use only for a confirmed loss or breach.",
        cta: "Factory reset",
        pending: "Requesting reset...",
        reasonPlaceholder: "Stolen device or confirmed breach",
        destructive: true,
    },
    reboot: {
        title: "Reboot device?",
        description: "Headwind will reboot the device when it next receives the command.",
        cta: "Reboot device",
        pending: "Requesting reboot...",
        reasonPlaceholder: "Clear a stuck tablet",
    },
    resetPassword: {
        title: "Reset device password?",
        description:
            "Headwind will set (or clear) the device screen-lock password when it next receives the command. Leave the password blank to clear it.",
        cta: "Reset password",
        pending: "Requesting reset...",
        reasonPlaceholder: "Staff locked out of tablet",
    },
};

export function DeviceManagementRowActions({
    editHref,
    linkId,
    profileId,
    capabilities,
}: {
    editHref: string;
    linkId?: string | null;
    profileId?: string | null;
    capabilities?: Record<string, any> | null;
}) {
    const { viewOnly } = useAppContext();
    const router = useRouter();
    const { alert } = useAlertModal();
    const [syncPending, startSyncTransition] = useTransition();
    const [unlinkOpen, setUnlinkOpen] = useState(false);
    const [syncOpen, setSyncOpen] = useState(false);
    const [pushApkOpen, setPushApkOpen] = useState(false);
    const [remoteAction, setRemoteAction] = useState<RemoteCommand | null>(null);
    const [reason, setReason] = useState("");
    const [password, setPassword] = useState("");

    // When capabilities are known, only offer enabled commands; otherwise show all
    // (the server still enforces the capability and rejects disabled commands).
    const can = (command: RemoteCommand) => !capabilities || !!capabilities[COMMAND_CAPABILITY[command]];
    const openRemote = (command: RemoteCommand) => {
        setReason("");
        setPassword("");
        setRemoteAction(command);
    };

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

    async function submitRemoteAction(formData: FormData) {
        const response = await runDeviceMdmRemoteActionFromForm(formData);
        router.refresh();

        if (!response.success || !response.result) {
            alert({
                title: "Remote action failed",
                variant: "error",
                buttonLabel: "Ok",
                message: escapeHtml(response.errors?.[0] || "Headwind did not accept the remote action"),
            });
            return;
        }

        setRemoteAction(null);
        const result = response.result;
        const state = result.state;
        const reportedState = response.action === "lock" && state?.deviceLocked === true
            ? "Headwind reports the device as locked."
            : response.action === "unlock" && state?.deviceLocked === false
                ? "Headwind reports the device as unlocked."
                : "The command was accepted and will be applied when the device checks in.";
        const actionName = COMMAND_COPY[response.action].cta;
        const details = [
            result.providerStatus ? `Provider status: ${escapeHtml(result.providerStatus)}.` : "",
            result.providerActionId ? `Request ID: ${escapeHtml(result.providerActionId)}.` : "",
        ].filter(Boolean).join(" ");

        alert({
            title: `${actionName} requested`,
            variant: "success",
            buttonLabel: "Ok",
            message: `
                <p>${escapeHtml(result.message || `${actionName} was accepted by Headwind.`)}</p>
                <p>${escapeHtml(reportedState)}</p>
                ${details ? `<p>${details}</p>` : ""}
            `,
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
                            {can("lock") ? (
                                <DropdownMenuItem
                                    onSelect={(event) => {
                                        event.preventDefault();
                                        openRemote("lock");
                                    }}
                                >
                                    <LockIcon className="h-4 w-4 mr-2" /> Lock
                                </DropdownMenuItem>
                            ) : null}
                            {can("unlock") ? (
                                <DropdownMenuItem
                                    onSelect={(event) => {
                                        event.preventDefault();
                                        openRemote("unlock");
                                    }}
                                >
                                    <UnlockIcon className="h-4 w-4 mr-2" /> Unlock
                                </DropdownMenuItem>
                            ) : null}
                            {can("reboot") ? (
                                <DropdownMenuItem
                                    onSelect={(event) => {
                                        event.preventDefault();
                                        openRemote("reboot");
                                    }}
                                >
                                    <PowerIcon className="h-4 w-4 mr-2" /> Reboot
                                </DropdownMenuItem>
                            ) : null}
                            {can("resetPassword") ? (
                                <DropdownMenuItem
                                    onSelect={(event) => {
                                        event.preventDefault();
                                        openRemote("resetPassword");
                                    }}
                                >
                                    <KeyRoundIcon className="h-4 w-4 mr-2" /> Reset
                                    password
                                </DropdownMenuItem>
                            ) : null}
                            {can("wipe") ? (
                                <DropdownMenuItem
                                    onSelect={(event) => {
                                        event.preventDefault();
                                        openRemote("wipe");
                                    }}
                                >
                                    <Trash2Icon className="h-4 w-4 mr-2" /> Factory
                                    reset
                                </DropdownMenuItem>
                            ) : null}
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
                            {remoteAction ? COMMAND_COPY[remoteAction].title : ""}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {remoteAction ? COMMAND_COPY[remoteAction].description : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <form
                        action={submitRemoteAction}
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
                        {remoteAction === "resetPassword" ? (
                            <input type="hidden" name="password" value={password} />
                        ) : null}
                        <div className="space-y-1">
                            <Label htmlFor="remote-action-reason">Reason</Label>
                            <Input
                                id="remote-action-reason"
                                value={reason}
                                onChange={(event) =>
                                    setReason(event.target.value)
                                }
                                placeholder={
                                    remoteAction ? COMMAND_COPY[remoteAction].reasonPlaceholder : ""
                                }
                                required
                            />
                        </div>
                        {remoteAction === "resetPassword" ? (
                            <div className="space-y-1">
                                <Label htmlFor="remote-action-password">
                                    New password (leave blank to clear)
                                </Label>
                                <Input
                                    id="remote-action-password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder="Blank clears the screen-lock password"
                                />
                            </div>
                        ) : null}
                        <AlertDialogFooter>
                            <AlertDialogCancel type="button">
                                Cancel
                            </AlertDialogCancel>
                            <ActionSubmitButton
                                variant={
                                    remoteAction && COMMAND_COPY[remoteAction].destructive
                                        ? "destructive"
                                        : "default"
                                }
                                disabled={!reason.trim()}
                                pendingLabel={
                                    remoteAction ? COMMAND_COPY[remoteAction].pending : ""
                                }
                            >
                                {remoteAction ? COMMAND_COPY[remoteAction].cta : ""}
                            </ActionSubmitButton>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
