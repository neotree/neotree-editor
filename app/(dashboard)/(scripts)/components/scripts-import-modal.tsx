// 'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";
import { CheckIcon, XIcon, EllipsisIcon } from "lucide-react";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DialogClose, } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useScriptsContext } from "@/contexts/scripts";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/modal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/contexts/app";
import { ErrorCard } from "@/components/error-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OverlayInfoCard } from "@/components/overlay-info-card";
import { BROADCAST_ACTIONS_IN_PROGRESS, IMPORT_JOB_COMPLETE_EVENT } from "@/lib/in-progress";
import { SocketEventsListener } from "@/components/socket-events-listener";
import socket  from '@/lib/socket';

const getDefaultFormFields = (overWriteScriptWithId?: string) => ({
    siteId: '',
    scriptId: '',
    confirmed: overWriteScriptWithId ? false : true,
    overwriteDataKeys: true,
    overwriteDrugsLibraryItems: true,
});

export function ScriptsImportModal({ 
    open, 
    overWriteScriptWithId,
    onOpenChange, 
    onImportSuccess,
}: {
    open: boolean;
    overWriteScriptWithId?: string;
    onOpenChange: (open: boolean) => void;
    onImportSuccess?: () => void;
}) {
    const [requestKey] = useState(Math.random().toString(12).substring(2));

    const router = useRouter();
    const routeParams = useParams();

    overWriteScriptWithId = overWriteScriptWithId || (routeParams.scriptId as string);

    const { copyScripts } = useScriptsContext();
    const { alert } = useAlertModal();

    const [loading, setLoading] = useState(false);
    const [importReview, setImportReview] = useState<NonNullable<Awaited<ReturnType<typeof copyScripts>>['integrityImportReview']> | null>(null);
    
    const { sites: _sites } = useAppContext();
    const sites = _sites.filter(s => s.type === 'webeditor');

    const isLoading = loading;
    const disabled = isLoading;
    const isOverwriteImport = !!overWriteScriptWithId;

    const {
        formState: { errors },
        reset: resetForm,
        watch,
        setValue,
        register,
        handleSubmit,
    } = useForm({
        defaultValues: getDefaultFormFields(overWriteScriptWithId),
    });

    const confirmed = watch('confirmed');
    const overwriteDataKeys = watch('overwriteDataKeys');
    const overwriteDrugsLibraryItems = watch('overwriteDrugsLibraryItems');

    // Handles the final result of an import, whichever way it arrived: an
    // immediate failure from the POST itself (auth/validation), or the
    // background job's result delivered later over the socket channel.
    const handleImportResult = (res: Awaited<ReturnType<typeof copyScripts>>) => {
        try {
            if (!res.success) throw new Error(res.errors?.join(', ') || 'Failed to import script');
            if (res.errors?.length) throw new Error(res.errors.join(', '));

            router.refresh();

            const review = res.integrityImportReview;
            if (review?.totalBlockingIssues) {
                resetForm(getDefaultFormFields(overWriteScriptWithId));
                onOpenChange(false);
                setImportReview(review);
                return;
            }

            const successMessage = res.warnings?.length
                ? `Script imported successfully. ${res.warnings.join(' ')}`
                : 'Script imported successfully!';

            alert({
                variant: 'success',
                title: 'Success',
                message: successMessage,
                onClose: () => {
                    onImportSuccess?.();
                    resetForm(getDefaultFormFields(overWriteScriptWithId));
                    onOpenChange(false);
                },
            });
        } catch (e: any) {
            alert({
                variant: 'error',
                title: 'Error',
                message: 'Failed to import script: ' + e.message,
            });
        } finally {
            setLoading(false);
        }
    };

    // The import runs in the background on the server (it can take minutes
    // for large scripts) — the POST only acks that it started. The actual
    // result arrives over the same per-requestKey socket channel already
    // used for progress. As a safety net against a dropped socket event, we
    // also poll by re-POSTing the identical request every 45s; the endpoint
    // is idempotent on requestKey, so a poll either returns the
    // already-finished result (if the socket event was missed) or another
    // "still running" ack (a cheap no-op — it does NOT re-run the import,
    // see lib/import-jobs.ts's coalescing). This is a repeating poll rather
    // than a one-shot check specifically so it keeps recovering regardless
    // of how long the import actually takes, not just within one fixed
    // window.
    const waitForImportCompletion = (requestBody: Record<string, any>) => {
        let settled = false;

        const stopWaiting = () => {
            settled = true;
            socket.off(requestBody.requestKey, onSignal);
            clearInterval(pollTimer);
        };

        // The socket event is only a "check now" signal — it never carries
        // the import result itself (the socket.io relay is an unauthenticated,
        // global broadcast, so the result must only ever travel over this
        // authenticated HTTP endpoint instead). This same check also serves
        // as the periodic fallback poll below, for a socket event that never
        // arrives.
        const checkStatus = async () => {
            if (settled) return;
            try {
                const response = await axios.post('/api/scripts/copy', requestBody);
                const res = response.data as { started?: boolean; } & Awaited<ReturnType<typeof copyScripts>>;
                if (!res.started && !settled) {
                    stopWaiting();
                    handleImportResult(res);
                }
            } catch {
                // Ignore — the next signal or poll will still resolve it.
            }
        };

        const onSignal = (key: string) => {
            if (key !== IMPORT_JOB_COMPLETE_EVENT || settled) return;
            checkStatus();
        };

        socket.on(requestBody.requestKey, onSignal);

        const pollTimer = setInterval(checkStatus, 45 * 1000);
    };

    const importScripts = handleSubmit(async (data) => {
        try {
            if (!data.siteId) throw new Error('Please select a site!');
            if (!data.scriptId) throw new Error('Please provide a script ID!');
            if (overWriteScriptWithId && !data.confirmed) throw new Error('Please confirm that you want to overwrite this script!');

            setLoading(true);

            const requestBody = {
                requestKey,
                fromRemoteSiteId: data.siteId,
                overwriteDrugsLibraryItems: data.overwriteDrugsLibraryItems,
                overwriteDataKeys: data.overwriteDataKeys,
                scriptsIds: [data.scriptId],
                overWriteScriptWithId: overWriteScriptWithId,
                broadcastAction: true,
            };

            const response = await axios.post('/api/scripts/copy', requestBody);
            const res = response.data as { started?: boolean; } & Awaited<ReturnType<typeof copyScripts>>;

            if (!res.started) {
                handleImportResult(res);
                return;
            }

            waitForImportCompletion(requestBody);
        } catch(e: any) {
            setLoading(false);
            alert({
                variant: 'error',
                title: 'Error',
                message: 'Failed to import script: ' + e.message,
            });
        }
    });

    const acceptImportedIssues = async () => {
        try {
            if (!importReview?.snapshotId) throw new Error('Missing import review snapshot');

            setLoading(true);

            const response = await axios.post('/api/integrity-imports/accept', {
                snapshotId: importReview.snapshotId,
            });

            const res = response.data as { success: boolean; errors?: string[] };
            if (!res.success || res.errors?.length) {
                throw new Error(res.errors?.join(', ') || 'Failed to accept imported issues');
            }

            alert({
                variant: 'success',
                title: 'Imported issues accepted',
                message: 'Known issues from this import were accepted separately from the global legacy baseline.',
                onClose: () => {
                    onImportSuccess?.();
                    setImportReview(null);
                },
            });
        } catch (e: any) {
            alert({
                variant: 'error',
                title: 'Error',
                message: 'Failed to accept imported issues: ' + e.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const acceptImportedIssuesForScript = async (scriptId: string) => {
        try {
            if (!importReview?.snapshotId) throw new Error('Missing import review snapshot');

            setLoading(true);

            const response = await axios.post('/api/integrity-imports/accept', {
                snapshotId: importReview.snapshotId,
                scriptIds: [scriptId],
            });

            const res = response.data as { success: boolean; errors?: string[] };
            if (!res.success || res.errors?.length) {
                throw new Error(res.errors?.join(', ') || 'Failed to accept imported script issues');
            }

            setImportReview((current) => {
                if (!current) return current;
                const remainingScripts = (current.details?.scripts || []).filter((script) => script.scriptId !== scriptId);
                const nextTotalIssues = remainingScripts.reduce((sum, script) => sum + script.totalIssues, 0);
                if (!remainingScripts.length) return null;
                return {
                    ...current,
                    totalBlockingIssues: nextTotalIssues,
                    totalScripts: remainingScripts.length,
                    details: current.details ? {
                        ...current.details,
                        totalIssues: nextTotalIssues,
                        totalScripts: remainingScripts.length,
                        scripts: remainingScripts,
                    } : current.details,
                };
            });

            alert({
                variant: 'success',
                title: 'Imported script issues accepted',
                message: 'Selected imported script issues were accepted separately from the global legacy baseline.',
                onClose: () => onImportSuccess?.(),
            });
        } catch (e: any) {
            alert({
                variant: 'error',
                title: 'Error',
                message: 'Failed to accept imported script issues: ' + e.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const siteId = watch('siteId');

    const selectedSite = useMemo(() => sites.find(s => s.siteId === siteId), [siteId]);

    return (
        <>
            {isLoading && <Loader overlay />}

            {open && (
                <ImportInfo 
                    show={loading} 
                    site={selectedSite}
                    overwriteDataKeys={overwriteDataKeys}
                    overwriteDrugsLibraryItems={overwriteDrugsLibraryItems}
                    requestKey={requestKey}
                />
            )}

            <Modal
                open={open}
                onOpenChange={() => {
                    onOpenChange(false);
                    resetForm(getDefaultFormFields(overWriteScriptWithId));
                }}
                title={isOverwriteImport ? "Import and overwrite script" : "Import script"}
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
                            onClick={() => importScripts()}
                            disabled={disabled}
                        >
                            Import
                        </Button>
                    </>
                )}
            >
                <div className="flex flex-col gap-y-5">
                    <ErrorCard>
                        <div className="p-2 text-sm">
                            New data keys, drugs, feeds & fluids <b>will be appended</b> to the library
                        </div>
                    </ErrorCard>

                    {isOverwriteImport && (
                        <ErrorCard>
                            <div className="p-2 text-sm">
                                This import will <b>update this script with the imported version</b>. The import will still follow the <b>Imports</b> integrity policy.
                            </div>
                        </ErrorCard>
                    )}

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
                                    {sites.map(({ siteId, name }) => (
                                        <SelectItem key={siteId} value={siteId}>
                                            {name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {!!errors.siteId?.message && <div className="text-xs text-danger mt-1">{errors.siteId.message}</div>}
                    </div>

                    <div>
                        <Label htmlFor="scriptId">Script ID *</Label>
                        <Input
                            {...register('scriptId', { disabled, required: true, })}
                            name="scriptId"
                        />
                        {!!errors.scriptId?.message && <div className="text-xs text-danger mt-1">{errors.scriptId.message}</div>}
                    </div>

                    <div className={cn("flex gap-x-2")}>
                        <Checkbox 
                            name="overwriteDataKeys"
                            id="overwriteDataKeys"
                            disabled={disabled}
                            checked={overwriteDataKeys}
                            onCheckedChange={() => setValue('overwriteDataKeys', !overwriteDataKeys, { shouldDirty: true, })}
                        />
                        <Label secondary htmlFor="overwriteDataKeys">Overwrite datakeys</Label>
                    </div>

                    <div className={cn("flex gap-x-2")}>
                        <Checkbox 
                            name="overwriteDrugsLibraryItems"
                            id="overwriteDrugsLibraryItems"
                            disabled={disabled}
                            checked={overwriteDrugsLibraryItems}
                            onCheckedChange={() => setValue('overwriteDrugsLibraryItems', !overwriteDrugsLibraryItems, { shouldDirty: true, })}
                        />
                        <Label secondary htmlFor="overwriteDrugsLibraryItems">Overwrite drugs, fluids & feeds</Label>
                    </div>

                    <div className={cn("flex gap-x-2", !overWriteScriptWithId && 'hidden')}>
                        <Checkbox 
                            name="confirmed"
                            id="confirmed"
                            disabled={disabled}
                            checked={confirmed}
                            onCheckedChange={() => setValue('confirmed', !confirmed, { shouldDirty: true, })}
                        />
                        <Label secondary htmlFor="confirmed">Confirm that you want to overwrite the current script with the imported script</Label>
                    </div>
                </div>
            </Modal>

            <Modal
                open={!!importReview}
                onOpenChange={() => setImportReview(null)}
                title="Import integrity review"
                actions={(
                    <>
                        <div className="text-xs text-muted-foreground">
                            Imported issues are tracked separately from the global baseline.
                        </div>

                        <div className="flex-1" />

                        <Button
                            variant="ghost"
                            disabled={disabled}
                            onClick={() => setImportReview(null)}
                        >
                            Fix before publish
                        </Button>

                        <Button
                            disabled={disabled || !importReview?.snapshotId}
                            onClick={acceptImportedIssues}
                        >
                            Accept all imported issues
                        </Button>
                    </>
                )}
            >
                {!importReview ? null : (
                    <div className="flex flex-col gap-y-4">
                        <ErrorCard>
                            <div className="p-2 text-sm">
                                This import introduced <b>{importReview.totalBlockingIssues}</b> blocking integrity issue{importReview.totalBlockingIssues === 1 ? '' : 's'} across <b>{importReview.totalScripts}</b> script{importReview.totalScripts === 1 ? '' : 's'}.
                            </div>
                        </ErrorCard>

                        {!!importReview.details?.summary?.length && (
                            <div className="space-y-2">
                                {importReview.details.summary.map((summary, index) => (
                                    <div key={`${summary}-${index}`} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                                        {summary}
                                    </div>
                                ))}
                            </div>
                        )}

                        <ScrollArea className="h-[360px] rounded-md border p-3">
                            <div className="space-y-4">
                                {(importReview.details?.scripts || []).map((script) => (
                                    <div key={script.scriptId} className="rounded-md border p-3">
                                        <div className="font-medium">{script.scriptTitle}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {script.totalIssues} blocking issue{script.totalIssues === 1 ? '' : 's'}
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <Button
                                                variant="outline"
                                                asChild
                                            >
                                                <a href={script.scriptHref}>Open script</a>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                asChild
                                            >
                                                <a href={script.registryHref}>Open integrity registry</a>
                                            </Button>
                                            <Button
                                                disabled={disabled || !importReview?.snapshotId}
                                                onClick={() => acceptImportedIssuesForScript(script.scriptId)}
                                            >
                                                Accept this script only
                                            </Button>
                                        </div>

                                        <div className="mt-3 space-y-3">
                                            {script.issues.map((issue, index) => (
                                                <div key={`${script.scriptId}-${issue.location}-${index}`} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                                                    <div className="text-xs font-medium uppercase tracking-wide text-amber-800">
                                                        {issue.ruleLabel}
                                                    </div>
                                                    <div className="mt-1 font-medium text-amber-950">{issue.displayName}</div>
                                                    <div className="mt-1 text-sm text-amber-900">{issue.reason}</div>
                                                    <div className="mt-1 text-xs text-amber-800">Location: {issue.location}</div>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        <Button size="sm" variant="outline" asChild>
                                                            <a href={issue.usageHref}>Open usage</a>
                                                        </Button>
                                                        <Button size="sm" variant="outline" asChild>
                                                            <a href={issue.registryHref}>Open registry</a>
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {!!script.hiddenIssuesCount && (
                                                <div className="rounded-md border border-dashed border-amber-300 px-3 py-2 text-sm text-amber-900">
                                                    {script.hiddenIssuesCount} more blocking issue{script.hiddenIssuesCount === 1 ? "" : "s"} in this script are not shown here. Open the integrity registry to review the full list.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}
            </Modal>
        </>
    );
}

function ImportInfo({ 
    requestKey,
    show: showProp, 
    site, 
    overwriteDataKeys,
    overwriteDrugsLibraryItems,
}: {
    show: boolean;
    site?: ReturnType<typeof useAppContext>['sites'][0];
    overwriteDataKeys?: boolean;
    overwriteDrugsLibraryItems?: boolean;
    requestKey: string;
}) {
    const [show, setShow] = useState(false);

    useEffect(() => { if (showProp) setShow(true); }, [showProp]);

    // Elapsed-time clock: gives users something concrete to watch while a
    // slow step (e.g. propagating an overwritten data key/drug item to every
    // script that references it) runs in the background.
    const startedAtRef = useRef<number | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        if (!show) {
            startedAtRef.current = null;
            setElapsedSeconds(0);
            return;
        }

        startedAtRef.current = Date.now();
        setElapsedSeconds(0);

        const interval = setInterval(() => {
            if (startedAtRef.current) setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [show]);

    const formatElapsed = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    };

    const actionsInProgress = useMemo(() => {
        return [
            ...(!site ? [{ 
                key: BROADCAST_ACTIONS_IN_PROGRESS.loading_local_data, 
                label: 'Loading data', 
            }] : [
                { 
                    key: BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_datakeys, 
                    label: 'Loading data keys from ' + site.name, 
                },
                { 
                    key: BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_scripts, 
                    label: 'Loading scripts from ' + site.name, 
                },
                { 
                    key: BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_screens, 
                    label: 'Loading screens from ' + site.name, 
                },
                { 
                    key: BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_diagnoses, 
                    label: 'Loading diagnoses from ' + site.name, 
                },
                { 
                    key: BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_problems, 
                    label: 'Loading problems from ' + site.name, 
                },
                { 
                    key: BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_dff, 
                    label: 'Loading drugs library from ' + site.name, 
                },
                { 
                    key: BROADCAST_ACTIONS_IN_PROGRESS.uploading_remote_files, 
                    label: 'Uploading files from ' + site.name, 
                },
            ]),

            { 
                key: BROADCAST_ACTIONS_IN_PROGRESS.saving_scripts, 
                label: 'Saving scripts', 
            },

            { 
                key: BROADCAST_ACTIONS_IN_PROGRESS.saving_dff, 
                label: 'Saving drugs & fluids', 
            },

            { 
                key: BROADCAST_ACTIONS_IN_PROGRESS.saving_data_keys, 
                label: 'Saving data keys', 
            },
        ];
    }, [
        site,
        overwriteDataKeys,
        overwriteDrugsLibraryItems,
    ]);

    const [events, setEvents] = useState<Record<string, boolean>>({});
    const [latestEvent, setLatestEvent] = useState('');

    useEffect(() => {
        socket.on(requestKey, (key: string, value: boolean) => {
            setLatestEvent(key);
            setEvents(prev => ({
                ...prev,
                [key]: value,
            }));
        });
    }, [requestKey]);

    return (
        <>
            <OverlayInfoCard
                show={show}
                // onClose={() => setShow(false)}
            >
                <div className="text-xs text-muted-foreground mb-2">
                    Running for {formatElapsed(elapsedSeconds)}
                </div>

                <div className="flex flex-col gap-y-1">
                    {actionsInProgress.map(a => {
                        const inProgress = latestEvent === a.key;
                        const isCompleted = events[a.key] === false;

                        let className = 'opacity-50';

                        if (inProgress) className = 'opacity-100';

                        if (isCompleted) className = 'opacity-100 text-green-400';

                        let Icon = isCompleted ? CheckIcon : XIcon;

                        if (inProgress) Icon = EllipsisIcon;

                        return (
                            <div key={a.key} className="text-xs flex items-center gap-x-2">
                                <Icon className={cn(className, 'size-3')} />
                                <span className={cn(className)}>{a.label}</span>
                            </div>
                        )
                    })}
                </div>
            </OverlayInfoCard>
        </>
    );
}
