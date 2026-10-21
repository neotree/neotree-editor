'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";

import { DialogClose, } from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useAppContext } from "@/contexts/app";
import { useScriptsContext } from "@/contexts/scripts";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/modal";
import socket from "@/lib/socket";
import { IMPORT_JOB_COMPLETE_EVENT } from "@/lib/in-progress";
import type { ScriptImportPreview } from "@/lib/script-import-preview";
import { ScriptImportPreviewSummary } from "./script-import-preview";

type CopyResult = { started?: boolean; } & Awaited<ReturnType<ReturnType<typeof useScriptsContext>['copyScripts']>>;

/**
 * Exports run in the background on this editor, which asks the target editor to import from here and
 * waits for it. POST once, then ask again (same body = same job) until the job has a result.
 */
async function runCopyJob(body: Record<string, any>): Promise<CopyResult> {
    const post = async () => (await axios.post('/api/scripts/copy', body)).data as CopyResult;
    let res = await post();
    if (!res.started) return res;
    return await new Promise<CopyResult>((resolve) => {
        let settled = false;
        const check = async () => {
            if (settled) return;
            try {
                const next = await post();
                if (!next.started && !settled) {
                    settled = true;
                    socket.off(body.requestKey, onSignal);
                    clearInterval(timer);
                    resolve(next);
                }
            } catch {
                // the next signal or poll resolves it
            }
        };
        const onSignal = (key: string) => { if (key === IMPORT_JOB_COMPLETE_EVENT) check(); };
        socket.on(body.requestKey, onSignal);
        const timer = setInterval(check, 10 * 1000);
    });
}

const newRequestKey = () => Math.random().toString(12).substring(2);

export function ScriptsExportModal({ open, scriptsIdsToExport, setScriptsIdsToExport, onOpenChange, }: {
    open: boolean;
    scriptsIdsToExport: string[];
    setScriptsIdsToExport: (ids: string[]) => void;
    onOpenChange: (open: boolean) => void;
}) {
    const { getSites } = useAppContext();
    const { copyScripts } = useScriptsContext();
    const { alert } = useAlertModal();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [sites, setSites] = useState<Awaited<ReturnType<typeof getSites>>>({ data: [] });
    const [preview, setPreview] = useState<ScriptImportPreview[] | null>(null);

    const {
        formState: { errors },
        setValue,
        reset: resetForm,
        handleSubmit,
        watch,
    } = useForm({
        defaultValues: {
            siteId: '',
        },
    });

    const watchedSiteId = watch('siteId');
    useEffect(() => { setPreview(null); }, [watchedSiteId, scriptsIdsToExport]);

    const disabled = useMemo(() => loading, [loading]);

    const loadSites = useCallback(async () => {
        try {
            // const res = await getSites({ types: ['webeditor'], });

            // TODO: Replace this with server action
            const response = await axios.get('/api/sites?data='+JSON.stringify({ types: ['webeditor'], }));
            const res = response.data as Awaited<ReturnType<typeof getSites>>;

            if (res.errors?.length) throw new Error(res.errors.join(', '));
            setSites(res);
        } catch(e: any) {
            alert({
                title: 'Error',
                message: 'Failed to load sites: ' + e.message,
                variant: 'error',
                onClose: () => onOpenChange(false),
            });
        } finally {
            setLoading(false);
        }
    }, [getSites, alert, onOpenChange]);

    const exportScripts = (dryRun: boolean) => handleSubmit(async (data) => {
        try {
            if (!data.siteId) throw new Error('Please select a site!');
            if (!dryRun && !preview) throw new Error('Preview the export first.');

            setLoading(true);

            // The target editor imports these scripts from this editor (as new scripts, saved as drafts
            // owned by you there). The result only comes back once the target has finished.
            const res = await runCopyJob({
                requestKey: newRequestKey(),
                toRemoteSiteId: data.siteId,
                scriptsIds: scriptsIdsToExport,
                broadcastAction: true,
                dryRun,
            });

            if (!res.success || res.errors?.length) throw new Error(res.errors?.join(', ') || 'The target editor did not confirm the import');

            if (dryRun) {
                setPreview(res.preview || []);
                return;
            }

            router.refresh();

            alert({
                variant: 'success',
                title: 'Success',
                message: 'The target editor imported the script as drafts. Publish it there when ready.',
                onClose: () => {
                    resetForm({ siteId: '', });
                    setPreview(null);
                    onOpenChange(false);
                },
            });
        } catch(e: any) {
            alert({
                variant: 'error',
                title: 'Error',
                message: (dryRun ? 'Failed to prepare the export preview: ' : 'Failed to export script: ') + e.message,
            });
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => { if(open) { loadSites();  } }, [open, loadSites]);

    return (
        <>
            {loading && <Loader overlay />}

            <Modal
                open={open}
                onOpenChange={() => {
                    onOpenChange(false);
                    if (!open) setScriptsIdsToExport([]);
                }}
                title="Export script"
                contentProps={{ className: 'sm:max-w-3xl' }}
                actions={(
                    <>
                        <span className="text-xs text-danger">* Required</span>

                        <div className="flex-1" />

                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                                disabled={disabled}
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button
                            variant={preview ? "outline" : "default"}
                            onClick={() => exportScripts(true)()}
                            disabled={disabled}
                        >
                            {preview ? 'Refresh preview' : 'Preview changes'}
                        </Button>

                        <Button
                            onClick={() => exportScripts(false)()}
                            disabled={disabled || !preview}
                        >
                            Export as drafts
                        </Button>
                    </>
                )}
            >
                <div className="flex flex-col gap-y-5">
                    <div>
                        <Label htmlFor="siteId">Site *</Label>
                        <Select
                            name="siteId"
                            disabled={disabled}
                            onValueChange={value => setValue('siteId', value, { shouldDirty: true, })}
                        >
                            <SelectTrigger >
                                <SelectValue placeholder="Select site" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Sites</SelectLabel>
                                    {sites.data.map(({ siteId, name }) => (
                                        <SelectItem key={siteId} value={siteId}>
                                            {name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {!!errors.siteId?.message && <div className="text-xs text-danger mt-1">{errors.siteId.message}</div>}
                    </div>

                    <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                        The target editor imports the selected scripts from this editor as <b>new scripts</b>, saved as drafts owned by you there.
                        To update a script that already exists on the target, open it there and use <b>Import</b> instead.
                    </div>

                    {!!preview?.length && (
                        <div className="flex flex-col gap-y-4 border-t pt-4">
                            {preview.map((p) => (
                                <ScriptImportPreviewSummary key={p.sourceScript.scriptId} preview={p} />
                            ))}
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}
