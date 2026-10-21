// 'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { AlertCircle, CheckCircle2, CheckIcon, EllipsisIcon, Loader2, XIcon } from "lucide-react";

import { DialogClose, } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useScriptsContext } from "@/contexts/scripts";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/modal";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/contexts/app";
import { ErrorCard } from "@/components/error-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BROADCAST_ACTIONS_IN_PROGRESS, IMPORT_JOB_COMPLETE_EVENT } from "@/lib/in-progress";
import socket  from '@/lib/socket';
import type { ScriptImportPreview } from "@/lib/script-import-preview";
import { ScriptImportPreviewSummary } from "./script-import-preview";
import { ImportSourcePicker } from "./import-source-picker";

type Step = 'source' | 'review' | 'running' | 'done' | 'error';
type CopyResult = Awaited<ReturnType<ReturnType<typeof useScriptsContext>['copyScripts']>>;

const newRequestKey = () => Math.random().toString(12).substring(2);

const STEPS: { key: 'source' | 'review' | 'import'; label: string; }[] = [
    { key: 'source', label: 'Source' },
    { key: 'review', label: 'Review' },
    { key: 'import', label: 'Import' },
];

function Stepper({ current, complete }: { current: 'source' | 'review' | 'import'; complete?: boolean; }) {
    const index = complete ? STEPS.length : STEPS.findIndex(s => s.key === current);
    return (
        <ol className="flex items-center gap-x-2 text-xs">
            {STEPS.map((s, i) => (
                <li key={s.key} className="flex items-center gap-x-2">
                    <span className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border text-[10px]",
                        i < index && "border-primary bg-primary text-primary-foreground",
                        i === index && "border-primary text-primary",
                        i > index && "text-muted-foreground",
                    )}>
                        {i < index ? <CheckIcon className="h-3 w-3" /> : i + 1}
                    </span>
                    <span className={cn(i === index ? "font-medium" : "text-muted-foreground")}>{s.label}</span>
                    {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
                </li>
            ))}
        </ol>
    );
}

function ChoiceGroup<T extends string>({
    id,
    label,
    value,
    onChange,
    disabled,
    options,
}: {
    id: string;
    label: string;
    value: T;
    onChange: (value: T) => void;
    disabled?: boolean;
    options: { value: T; title: string; description: string; }[];
}) {
    return (
        <div className="flex flex-col gap-y-2">
            <Label>{label}</Label>
            <RadioGroup value={value} onValueChange={(v) => onChange(v as T)} disabled={disabled} className="gap-2">
                {options.map(o => (
                    <label
                        key={o.value}
                        htmlFor={`${id}-${o.value}`}
                        className={cn(
                            "flex cursor-pointer items-start gap-x-3 rounded-md border px-3 py-2",
                            value === o.value ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                            disabled && "cursor-not-allowed opacity-60",
                        )}
                    >
                        <RadioGroupItem id={`${id}-${o.value}`} value={o.value} className="mt-0.5" />
                        <div>
                            <div className="text-sm font-medium">{o.title}</div>
                            <div className="text-xs text-muted-foreground">{o.description}</div>
                        </div>
                    </label>
                ))}
            </RadioGroup>
        </div>
    );
}

export function ScriptsImportModal({ 
    open, 
    overWriteScriptWithId,
    onOpenChange, 
    onImportSuccess,
    defaultSourceScriptId,
}: {
    open: boolean;
    overWriteScriptWithId?: string;
    onOpenChange: (open: boolean) => void;
    onImportSuccess?: () => void;
    /** Pre-fill the source script (e.g. from the content sync status page). */
    defaultSourceScriptId?: string;
}) {
    const [requestKey, setRequestKey] = useState(newRequestKey());

    const router = useRouter();
    const routeParams = useParams();

    overWriteScriptWithId = overWriteScriptWithId || (routeParams.scriptId as string);
    const isOverwriteImport = !!overWriteScriptWithId;

    const { copyScripts } = useScriptsContext();
    const { alert } = useAlertModal();

    const [step, setStep] = useState<Step>('source');
    const [runningKind, setRunningKind] = useState<'preview' | 'import'>('preview');
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<CopyResult | null>(null);
    const [importReview, setImportReview] = useState<NonNullable<CopyResult['integrityImportReview']> | null>(null);
    // What the import would do, computed by the server without saving (dry run).
    const [preview, setPreview] = useState<ScriptImportPreview[] | null>(null);

    const { sites: _sites, contentSync } = useAppContext();
    const sites = _sites.filter(s => s.type === 'webeditor');
    // Content sync: imports normally come from the linked editor.
    const defaultSiteId = contentSync?.settings?.role !== 'off' ? (contentSync?.settings?.linkedSiteId || '') : '';

    const [siteId, setSiteId] = useState(defaultSiteId);
    const [scriptIds, setScriptIds] = useState<string[]>(defaultSourceScriptId ? [defaultSourceScriptId] : []);
    const [dataKeysMode, setDataKeysMode] = useState<'add' | 'apply'>('add');
    const [drugsMode, setDrugsMode] = useState<'replace' | 'add'>('replace');
    const [keepTargetOnly, setKeepTargetOnly] = useState(true);
    const [confirmSourceMismatch, setConfirmSourceMismatch] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    const running = step === 'running';
    const [targetTitle, setTargetTitle] = useState('');

    // Defaults can arrive after mount (opened from a link); apply them when the dialog opens.
    useEffect(() => {
        if (!open) return;
        if (defaultSourceScriptId && !scriptIds.length) setScriptIds([defaultSourceScriptId]);
        if (defaultSiteId && !siteId) setSiteId(defaultSiteId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, defaultSourceScriptId, defaultSiteId]);

    // A preview belongs to the choices it was made with.
    useEffect(() => {
        setPreview(null);
        setConfirmed(false);
        setConfirmSourceMismatch(false);
        if (step === 'review') setStep('source');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteId, scriptIds.join(','), dataKeysMode, drugsMode]);

    const sourceMismatch = preview?.find(p => p.requiresConfirmation?.sourceMismatch)?.requiresConfirmation?.sourceMismatch;
    const allUpToDate = !!preview?.length && preview.every(p => p.upToDate);
    const needsKeepChoice = isOverwriteImport && !!preview?.some(p => p.firstImport && p.mode === 'merge');
    const site = useMemo(() => sites.find(s => s.siteId === siteId), [sites, siteId]);

    const resetAll = () => {
        setStep('source');
        setPreview(null);
        setResult(null);
        setError(null);
        setConfirmed(false);
        setConfirmSourceMismatch(false);
        setKeepTargetOnly(true);
        setScriptIds(defaultSourceScriptId ? [defaultSourceScriptId] : []);
        setRequestKey(newRequestKey());
    };

    const close = () => {
        if (running) return;
        onOpenChange(false);
        resetAll();
    };

    // Handles the final result of a run, whichever way it arrived: an immediate answer from the POST
    // (auth/validation errors), or the background job's result fetched after its completion signal.
    const handleRunResult = (res: CopyResult, dryRun: boolean) => {
        // Every run gets its own request key, so a later run is never answered with this one's result.
        setRequestKey(newRequestKey());
        if (!res.success || res.errors?.length) {
            setError(res.errors?.join(', ') || (dryRun ? 'The preview could not be prepared.' : 'The import failed.'));
            // a preview that can't be confirmed (source mismatch) still comes back with what it would do
            if (dryRun && res.preview?.length) setPreview(res.preview);
            setStep('error');
            return;
        }
        if (dryRun) {
            setPreview(res.preview || []);
            setStep('review');
            return;
        }
        router.refresh();
        setResult(res);
        const review = res.integrityImportReview;
        if (review?.totalBlockingIssues) {
            onOpenChange(false);
            resetAll();
            setImportReview(review);
            return;
        }
        setStep('done');
    };

    // The import runs in the background on the server (it can take minutes for large scripts): the POST
    // only acks that it started, and the same request is asked again (idempotent on requestKey) when the
    // job signals completion over the socket, or every 45 s in case that signal is missed. The socket
    // event is only a "check now" signal: the result itself only travels over this authenticated request.
    const waitForCompletion = (requestBody: Record<string, any>) => {
        let settled = false;
        const stop = () => { settled = true; socket.off(requestBody.requestKey, onSignal); clearInterval(pollTimer); };
        const check = async () => {
            if (settled) return;
            try {
                const res = (await axios.post('/api/scripts/copy', requestBody)).data as { started?: boolean; } & CopyResult;
                if (!res.started && !settled) { stop(); handleRunResult(res, !!requestBody.dryRun); }
            } catch {
                // the next signal or poll resolves it
            }
        };
        const onSignal = (key: string) => { if (key === IMPORT_JOB_COMPLETE_EVENT && !settled) check(); };
        socket.on(requestBody.requestKey, onSignal);
        const pollTimer = setInterval(check, 45 * 1000);
    };

    const run = async (dryRun: boolean) => {
        setError(null);
        if (!siteId) return setError('Choose the editor to import from.');
        if (!scriptIds.length) return setError(isOverwriteImport ? 'Choose the script to import.' : 'Choose at least one script to import.');
        setRunningKind(dryRun ? 'preview' : 'import');
        setStep('running');
        const requestBody = {
            requestKey,
            fromRemoteSiteId: siteId,
            overwriteDrugsLibraryItems: drugsMode === 'replace',
            overwriteDataKeys: dataKeysMode === 'apply',
            scriptsIds: isOverwriteImport ? scriptIds.slice(0, 1) : scriptIds,
            overWriteScriptWithId: overWriteScriptWithId,
            broadcastAction: true,
            dryRun,
            confirmSourceMismatch,
            keepTargetOnly,
        };
        try {
            const res = (await axios.post('/api/scripts/copy', requestBody)).data as { started?: boolean; } & CopyResult;
            if (!res.started) return handleRunResult(res, dryRun);
            waitForCompletion(requestBody);
        } catch (e: any) {
            setError(e.message);
            setStep('error');
        }
    };

    // keepTargetOnly changes what a first import removes: the preview must be redone
    useEffect(() => {
        if (step === 'review' && needsKeepChoice) run(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keepTargetOnly]);

    const importBlockedReason = !preview ? 'Preview the changes first.'
        : allUpToDate ? null
        : (sourceMismatch && !confirmSourceMismatch) ? 'Confirm the source script above.'
        : (isOverwriteImport && !confirmed) ? 'Tick the confirmation to import.'
        : null;

    const [accepting, setAccepting] = useState(false);
    const disabled = running || accepting;

    const acceptImportedIssues = async () => {
        try {
            if (!importReview?.snapshotId) throw new Error('Missing import review snapshot');

            setAccepting(true);

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
            setAccepting(false);
        }
    };

    const acceptImportedIssuesForScript = async (scriptId: string) => {
        try {
            if (!importReview?.snapshotId) throw new Error('Missing import review snapshot');

            setAccepting(true);

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
            setAccepting(false);
        }
    };


    const savedScriptIds = result?.savedScriptIds || [];
    const doneUpToDate = !!result?.preview?.length && result.preview.every(p => p.upToDate);
    const progressStep: 'source' | 'review' | 'import' = step === 'source' ? 'source'
        : step === 'review' ? 'review'
        : step === 'running' ? (runningKind === 'preview' ? 'review' : 'import')
        : step === 'error' ? (preview ? 'review' : 'source')
        : 'import';

    return (
        <>
            {accepting && <Loader overlay />}

            <Modal
                open={open}
                onOpenChange={(next) => { if (!next) close(); }}
                title={(
                    <div className="flex flex-col gap-y-3">
                        <span>{isOverwriteImport ? `Import into ${targetTitle ? `“${targetTitle}”` : 'this script'}` : 'Import scripts'}</span>
                        <Stepper current={progressStep} complete={step === 'done'} />
                    </div>
                )}
                contentProps={{
                    className: 'sm:max-w-3xl',
                    // a running import can't be dismissed by clicking outside or Esc
                    onInteractOutside: (e) => { if (running) e.preventDefault(); },
                    onEscapeKeyDown: (e) => { if (running) e.preventDefault(); },
                }}
                actions={(
                    <>
                        {step === 'source' && (
                            <>
                                <div className="flex-1" />
                                <DialogClose asChild>
                                    <Button variant="ghost" onClick={close}>Cancel</Button>
                                </DialogClose>
                                <Button onClick={() => run(true)} disabled={!siteId || !scriptIds.length}>
                                    Preview changes
                                </Button>
                            </>
                        )}

                        {step === 'review' && (
                            <>
                                <Button variant="ghost" onClick={() => setStep('source')}>Back</Button>
                                <div className="flex-1" />
                                {allUpToDate ? (
                                    <Button onClick={close}>Close</Button>
                                ) : (
                                    <>
                                        {!!importBlockedReason && <span className="text-xs text-muted-foreground">{importBlockedReason}</span>}
                                        <Button variant="outline" onClick={() => run(true)}>Refresh preview</Button>
                                        <Button onClick={() => run(false)} disabled={!!importBlockedReason}>
                                            Import as drafts
                                        </Button>
                                    </>
                                )}
                            </>
                        )}

                        {step === 'running' && (
                            <>
                                <span className="text-xs text-muted-foreground">You can keep this open; it finishes on the server.</span>
                                <div className="flex-1" />
                                <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />{runningKind === 'preview' ? 'Preparing preview' : 'Importing'}</Button>
                            </>
                        )}

                        {step === 'error' && (
                            <>
                                <Button variant="ghost" onClick={() => setStep(preview && !sourceMismatch ? 'review' : 'source')}>Back</Button>
                                <div className="flex-1" />
                                <Button variant="outline" onClick={close}>Close</Button>
                                <Button onClick={() => run(runningKind === 'preview')}>Try again</Button>
                            </>
                        )}

                        {step === 'done' && (
                            <>
                                <div className="flex-1" />
                                {!isOverwriteImport && savedScriptIds.length === 1 && (
                                    <Button variant="outline" onClick={() => { close(); router.push(`/script/${savedScriptIds[0]}`); }}>
                                        Open the new script
                                    </Button>
                                )}
                                <Button onClick={() => { onImportSuccess?.(); close(); }}>Done</Button>
                            </>
                        )}
                    </>
                )}
            >
                <div className="flex flex-col gap-y-5">
                    {step === 'source' && (
                        <>
                            {!!error && <ErrorCard><div className="p-2 text-sm">{error}</div></ErrorCard>}
                            <ImportSourcePicker
                                sites={sites}
                                siteId={siteId}
                                onSiteChange={setSiteId}
                                targetScriptId={overWriteScriptWithId}
                                targetTitle={targetTitle}
                                multiple={!isOverwriteImport}
                                value={scriptIds}
                                onChange={setScriptIds}
                                disabled={disabled}
                                onLoaded={(r) => setTargetTitle(r.targetTitle || '')}
                            />

                            {isOverwriteImport && (
                                <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                                    The source is <b>merged</b> into this script: its changes are applied, screens and options that only exist here are kept.
                                    Nothing is saved until you have reviewed the changes, and then only as drafts.
                                </div>
                            )}

                            <ChoiceGroup
                                id="import-data-keys"
                                label="Data keys"
                                value={dataKeysMode}
                                onChange={setDataKeysMode}
                                disabled={disabled}
                                options={[
                                    { value: 'add', title: 'Add what this editor is missing (recommended)', description: 'New keys and new options are added. Labels and options already here are not changed or removed.' },
                                    { value: 'apply', title: 'Also apply the source\u2019s changes', description: 'The source\u2019s changes to labels and options are applied. Options only here are kept; options the source removed since the last import are removed unless other scripts use them.' },
                                ]}
                            />

                            <ChoiceGroup
                                id="import-drugs"
                                label="Drugs, feeds & fluids"
                                value={drugsMode}
                                onChange={setDrugsMode}
                                disabled={disabled}
                                options={[
                                    { value: 'replace', title: 'Use the source\u2019s version', description: 'Items the scripts use are updated to match the source.' },
                                    { value: 'add', title: 'Only add missing items', description: 'Items that already exist here are left as they are.' },
                                ]}
                            />
                        </>
                    )}

                    {step === 'review' && !!preview && (
                        <>
                            {/* the most important thing on this screen when it applies: is this the right source? */}
                            {!!sourceMismatch && (
                                <ErrorCard>
                                    <div className="flex flex-col gap-y-2 p-2 text-sm">
                                        <div>{sourceMismatch}</div>
                                        <div className="flex gap-x-2">
                                            <Checkbox id="confirmSourceMismatch" checked={confirmSourceMismatch} onCheckedChange={() => setConfirmSourceMismatch(!confirmSourceMismatch)} />
                                            <Label secondary htmlFor="confirmSourceMismatch">This is the right source script, import it anyway</Label>
                                        </div>
                                    </div>
                                </ErrorCard>
                            )}
                            {preview.map((p) => (
                                <ScriptImportPreviewSummary key={p.sourceScript.scriptId} preview={p} />
                            ))}

                            {needsKeepChoice && (
                                <div className="flex gap-x-2 rounded-md border px-3 py-2">
                                    <Checkbox id="keepTargetOnly" checked={keepTargetOnly} onCheckedChange={() => setKeepTargetOnly(!keepTargetOnly)} />
                                    <Label secondary htmlFor="keepTargetOnly">Keep screens, diagnoses and problems that are not in the source script</Label>
                                </div>
                            )}


                            {isOverwriteImport && !allUpToDate && (
                                <div className="flex gap-x-2 rounded-md border border-primary/40 bg-primary/5 px-3 py-2">
                                    <Checkbox id="confirmed" checked={confirmed} onCheckedChange={() => setConfirmed(!confirmed)} />
                                    <Label secondary htmlFor="confirmed">I have reviewed these changes and want to import them into this script as drafts</Label>
                                </div>
                            )}
                        </>
                    )}

                    {step === 'running' && (
                        <ImportProgress
                            requestKey={requestKey}
                            site={site}
                            title={runningKind === 'preview' ? 'Working out what would change\u2026' : 'Importing\u2026'}
                            description={runningKind === 'preview'
                                ? 'Nothing is saved yet: this only compares the source with this editor.'
                                : 'Saving the changes as drafts. Large scripts can take a few minutes.'}
                        />
                    )}

                    {step === 'error' && (
                        <ErrorCard>
                            <div className="flex gap-x-2 p-2 text-sm">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <div>
                                    <div className="font-medium">{runningKind === 'preview' ? 'The preview could not be prepared' : 'The import did not go through'}</div>
                                    <div className="mt-1">{error}</div>
                                    {runningKind === 'import' && <div className="mt-1 opacity-80">Nothing was saved: an import is saved completely or not at all.</div>}
                                </div>
                            </div>
                        </ErrorCard>
                    )}

                    {step === 'done' && !!result && (
                        <div className="flex flex-col gap-y-4">
                            <div className="flex items-start gap-x-3 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-3">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                                <div className="text-sm">
                                    <div className="font-medium">{doneUpToDate ? 'Already up to date: nothing was changed' : 'Imported as drafts'}</div>
                                    {!doneUpToDate && (
                                        <div className="mt-1 text-muted-foreground">
                                            {[
                                                result.info?.scripts && `${result.info.scripts} script${result.info.scripts === 1 ? '' : 's'}`,
                                                result.info?.screens && `${result.info.screens} screen${result.info.screens === 1 ? '' : 's'}`,
                                                result.info?.diagnoses && `${result.info.diagnoses} diagnos${result.info.diagnoses === 1 ? 'is' : 'es'}`,
                                                result.info?.problems && `${result.info.problems} problem${result.info.problems === 1 ? '' : 's'}`,
                                                result.info?.dataKeys && `${result.info.dataKeys} data key${result.info.dataKeys === 1 ? '' : 's'}`,
                                                result.info?.dffItems && `${result.info.dffItems} drug/fluid/feed item${result.info.dffItems === 1 ? '' : 's'}`,
                                            ].filter(Boolean).join(', ') || 'Changes'} saved as drafts. Review them, then publish when ready.
                                        </div>
                                    )}
                                </div>
                            </div>
                            {!!result.warnings?.length && (
                                <ErrorCard color="warning">
                                    <div className="py-2 text-sm">
                                        <div className="mb-1 font-medium">Worth checking</div>
                                        <ul className="list-disc space-y-1 pl-5">
                                            {result.warnings.map((w, i) => <li key={`${w}-${i}`}>{w}</li>)}
                                        </ul>
                                    </div>
                                </ErrorCard>
                            )}
                        </div>
                    )}
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

function ImportProgress({
    requestKey,
    site,
    title,
    description,
}: {
    requestKey: string;
    site?: ReturnType<typeof useAppContext>['sites'][0];
    title: string;
    description: string;
}) {
    const { getSocketEvent, removeSocketEvent } = useAppContext();

    // Elapsed-time clock: something concrete to watch while a slow step runs on the server.
    const startedAt = useRef(Date.now());
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    useEffect(() => {
        startedAt.current = Date.now();
        const interval = setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
        return () => clearInterval(interval);
    }, [requestKey]);
    const elapsed = elapsedSeconds >= 60 ? `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s` : `${elapsedSeconds}s`;

    const steps = useMemo(() => [
        ...(!site ? [{ key: BROADCAST_ACTIONS_IN_PROGRESS.loading_local_data, label: 'Loading data' }] : [
            { key: BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_datakeys, label: `Loading data keys from ${site.name}` },
            { key: BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_scripts, label: `Loading scripts from ${site.name}` },
            { key: BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_screens, label: `Loading screens from ${site.name}` },
            { key: BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_diagnoses, label: `Loading diagnoses from ${site.name}` },
            { key: BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_problems, label: `Loading problems from ${site.name}` },
            { key: BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_dff, label: `Loading drugs library from ${site.name}` },
            { key: BROADCAST_ACTIONS_IN_PROGRESS.uploading_remote_files, label: `Copying files from ${site.name}` },
        ]),
        { key: BROADCAST_ACTIONS_IN_PROGRESS.saving_scripts, label: 'Saving scripts' },
        { key: BROADCAST_ACTIONS_IN_PROGRESS.saving_dff, label: 'Saving drugs & fluids' },
        { key: BROADCAST_ACTIONS_IN_PROGRESS.saving_data_keys, label: 'Saving data keys' },
    ], [site]);

    const [events, setEvents] = useState<Record<string, boolean>>({});
    const [latestEvent, setLatestEvent] = useState<string>(steps[0]?.key || '');

    useEffect(() => {
        const onEvent = (key: string, value: boolean) => {
            setLatestEvent(key);
            setEvents(prev => ({ ...prev, [key]: value }));
        };
        socket.on(requestKey, onEvent);
        // also ask the server for what happened so far (events can be missed, e.g. on a reconnect)
        let timer: ReturnType<typeof setTimeout> | null = null;
        let stopped = false;
        const poll = async () => {
            const res: string[] = await getSocketEvent(requestKey);
            if (stopped) return;
            const evts = (res || []).map(e => e.split('__'));
            const last = evts[evts.length - 1];
            if (last?.[0]) setLatestEvent(last[0]);
            setEvents(prev => evts.reduce((acc, e) => ({ ...acc, [e[0]]: e[1] === 'true' }), { ...prev }));
            timer = setTimeout(poll, 5 * 1000);
        };
        poll();
        return () => {
            stopped = true;
            socket.off(requestKey, onEvent);
            if (timer) clearTimeout(timer);
            removeSocketEvent(requestKey);
        };
    }, [requestKey, getSocketEvent, removeSocketEvent]);

    return (
        <div className="flex flex-col gap-y-4">
            <div>
                <div className="flex items-center gap-x-2 text-sm font-medium">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    {title}
                    <span className="text-xs font-normal text-muted-foreground">{elapsed}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{description}</div>
            </div>
            <ScrollArea className="max-h-[320px]">
                <div className="flex flex-col gap-y-1.5">
                    {steps.map(s => {
                        const active = latestEvent === s.key && events[s.key] !== false;
                        const done = events[s.key] === false;
                        const Icon = active ? EllipsisIcon : done ? CheckIcon : XIcon;
                        return (
                            <div key={s.key} className={cn("flex items-center gap-x-2 text-xs", active ? "font-medium" : done ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground opacity-60")}>
                                <Icon className={cn("size-3", !active && !done && "opacity-0")} />
                                <span>{s.label}</span>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}
