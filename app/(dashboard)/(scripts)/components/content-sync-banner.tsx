'use client';

import { useState } from "react";
import Link from "next/link";

import { closeContentSyncHotfix, openContentSyncHotfix } from "@/app/actions/content-sync";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ContentSyncStatusBadge } from "@/components/content-sync-status-badge";
import { useAppContext } from "@/contexts/app";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useContentLock } from "@/hooks/use-content-lock";
import { useContentSyncStatus } from "@/hooks/use-content-sync-status";

/**
 * Content sync on a script page: why the script is read-only here and what to do instead (target), the
 * hotfix controls for admins, and on the source a warning when the target has changes to bring back.
 */
export function ContentSyncBanner({ scriptId }: { scriptId?: string | null }) {
    const { alert } = useAlertModal();
    const { confirm } = useConfirmModal();
    const { contentSync, isAdmin, isSuperUser, viewOnly } = useAppContext();
    const settings = contentSync?.settings;
    const lock = useContentLock("scripts", scriptId || null);
    // this script only: its published content against its counterpart's on the linked editor
    const sync = useContentSyncStatus({ enabled: !!scriptId, scriptId });
    const [hotfixOpen, setHotfixOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [busy, setBusy] = useState(false);

    if (!settings || settings.role === "off" || !scriptId) return null;

    const pair = sync.pairsByLocalScriptId.get(scriptId);
    const canManageHotfix = (isAdmin || isSuperUser) && !viewOnly;
    const isTarget = settings.role === "target";
    const otherScriptId = isTarget ? pair?.sourceScriptId : pair?.targetScriptId;

    const submitHotfix = async () => {
        setBusy(true);
        try {
            const res = await openContentSyncHotfix({ scriptId, reason });
            if (!res.success) throw new Error(res.errors?.join(", ") || "Failed to open the hotfix");
            setHotfixOpen(false);
            setReason("");
            window.location.reload();
        } catch (e: any) {
            alert({ variant: "error", title: "Error", message: e.message });
        } finally {
            setBusy(false);
        }
    };

    const closeHotfix = () => confirm(async () => {
        const res = await closeContentSyncHotfix({ scriptId });
        if (!res.success) alert({ variant: "error", title: "Error", message: res.errors?.join(", ") || "Failed" });
        else window.location.reload();
    }, {
        title: "Close the hotfix?",
        message: `The script is locked again. Make sure the change has been brought back to ${sync.sourceName}.`,
    });

    const status = pair && settings.showStatus ? (
        <ContentSyncStatusBadge status={pair.status} sourceName={sync.sourceName} targetName={sync.targetName} />
    ) : null;

    if (isTarget && lock.hotfix) {
        return (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">Hotfix open</span>
                    {status}
                </div>
                <div className="mt-1">
                    {lock.hotfix.openedByName ? `${lock.hotfix.openedByName}: ` : ""}{lock.hotfix.reason}
                </div>
                <div className="mt-1">
                    This script can be edited here until the hotfix is closed. Once it is published, bring the change back on {sync.sourceName} so the next import does not undo it.
                </div>
                {canManageHotfix && (
                    <Button size="sm" variant="outline" className="mt-2" onClick={closeHotfix}>Close hotfix</Button>
                )}
            </div>
        );
    }

    if (isTarget && lock.locked) {
        return (
            <>
                <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">This script comes from {sync.sourceName}</span>
                        {status}
                    </div>
                    <div className="mt-1">
                        It can only be changed by importing it from there. Make the change on {sync.sourceName}, publish it, then import it here.
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {!viewOnly && (
                            <Button size="sm" asChild>
                                <Link href={`/script/${scriptId}?import=1&source=${otherScriptId || ""}`}>Import from {sync.sourceName}</Link>
                            </Button>
                        )}
                        {canManageHotfix && settings.hotfixes.enabled && (
                            <Button size="sm" variant="outline" onClick={() => setHotfixOpen(true)}>Open a hotfix</Button>
                        )}
                    </div>
                </div>

                <Modal
                    open={hotfixOpen}
                    onOpenChange={setHotfixOpen}
                    title="Open a hotfix"
                    actions={(
                        <>
                            <div className="flex-1" />
                            <Button variant="ghost" disabled={busy} onClick={() => setHotfixOpen(false)}>Cancel</Button>
                            <Button disabled={busy || !reason.trim()} onClick={submitHotfix}>Open hotfix</Button>
                        </>
                    )}
                >
                    <div className="flex flex-col gap-y-3 text-sm">
                        <div>
                            A hotfix lets you change this script here for an emergency. Until the change is brought back on {sync.sourceName},
                            this script shows as ahead of it, and the next import from {sync.sourceName} keeps your change.
                        </div>
                        <div>
                            <Label htmlFor="hotfix-reason">Why is it needed? *</Label>
                            <Textarea id="hotfix-reason" value={reason} onChange={e => setReason(e.target.value)} rows={3} />
                        </div>
                    </div>
                </Modal>
            </>
        );
    }

    if (!isTarget && pair && (pair.status === "target_ahead" || pair.status === "diverged")) {
        return (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{sync.targetName} has changes to this script that are not here</span>
                    {status}
                </div>
                <div className="mt-1">
                    Bring them back before changing this script further, otherwise the two editors drift apart.
                </div>
                {!viewOnly && otherScriptId && (
                    <Button size="sm" className="mt-2" asChild>
                        <Link href={`/script/${scriptId}?import=1&source=${otherScriptId}`}>Bring back from {sync.targetName}</Link>
                    </Button>
                )}
            </div>
        );
    }

    if (status) {
        return <div className="flex items-center gap-2 text-sm text-muted-foreground">Sync with {isTarget ? sync.sourceName : sync.targetName}: {status}</div>;
    }

    return null;
}
