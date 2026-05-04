'use client';

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";

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
import { useSites } from "@/hooks/use-sites";
import { ErrorCard } from "@/components/error-card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    const router = useRouter();
    const routeParams = useParams();

    overWriteScriptWithId = overWriteScriptWithId || (routeParams.scriptId as string);

    const { copyScripts } = useScriptsContext();
    const { alert } = useAlertModal();

    const [loading, setLoading] = useState(false);
    const [importReview, setImportReview] = useState<NonNullable<Awaited<ReturnType<typeof copyScripts>>['integrityImportReview']> | null>(null);
    const { sites, loading: sitesLoading, } = useSites({
        onLoadSitesError: () => onOpenChange(false),
    });

    const isLoading = sitesLoading || loading;
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

    const importScripts = handleSubmit(async (data) => {
        try {
            if (!data.siteId) throw new Error('Please select a site!');
            if (!data.scriptId) throw new Error('Please provide a script ID!');
            if (overWriteScriptWithId && !data.confirmed) throw new Error('Please confirm that you want to overwrite this script!');

            setLoading(true);

            // const res = await copyScripts({ 
            //     fromRemoteSiteId: data.siteId, 
            //     scriptsIds: [data.scriptId], 
            //     overWriteScriptWithId: overWriteScriptWithId,
            //     broadcastAction: true,
            // });

            // TODO: Replace this with server action
            const response = await axios.post('/api/scripts/copy', { 
                fromRemoteSiteId: data.siteId, 
                overwriteDrugsLibraryItems: data.overwriteDrugsLibraryItems, 
                overwriteDataKeys: data.overwriteDataKeys, 
                scriptsIds: [data.scriptId], 
                overWriteScriptWithId: overWriteScriptWithId,
                broadcastAction: true,
            });
            const res = response.data as Awaited<ReturnType<typeof copyScripts>>;

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
        } catch(e: any) {
            alert({
                variant: 'error',
                title: 'Error',
                message: 'Failed to import script: ' + e.message,
            });
        } finally {
            setLoading(false);
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

    return (
        <>
            {isLoading && <Loader overlay />}

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
