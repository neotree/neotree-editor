'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { arrayMoveImmutable } from 'array-move';
import { CheckIcon, ExternalLinkIcon, Loader2Icon, MergeIcon, RefreshCwIcon } from 'lucide-react';

import { useDataKeysCtx, type DataKey } from '@/contexts/data-keys';
import { ActionsBar } from '@/components/actions-bar';
import { DataTable } from '@/components/data-table';
import { Loader } from '@/components/loader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageContainer } from '@/app/(dashboard)/(scripts)/components/page-container';
import type { MergeDataKeysResponse } from '@/databases/mutations/data-keys';
import { normalizeDataKeyType } from '@/lib/data-key-types';
import type { LegacyItemLink, LegacyOptionItem } from '@/lib/data-key-merge-analysis';
import {
    buildDataKeysMergePlan,
    getMergeKeyTitle,
    type ChildMergeAction,
    type DataKeyMergeChildRow,
} from '@/lib/data-key-merge-plan';
import { cn } from '@/lib/utils';

import { fetchDataKeyDeleteImpact, type DeleteImpactItem } from '../delete-confirmation';
import { groupScriptsByTitle, type ScriptGroup } from '../delete-replacement-dialog';
import { previewDataKeysMerge } from './api';
import { MergeChangeTotals, MergeReport } from './merge-report';
import {
    ActionBadge,
    Callout,
    MATCH_REASON_LABELS,
    SectionTitle,
    decodeAction,
    describeKey,
    encodeAction,
    pluralize,
    shortId,
    useMergePermission,
} from './shared';
import { useMergeUrlState } from './use-merge-url-state';

type PreviewState = {
    key: string;
    loading: boolean;
    data: MergeDataKeysResponse['preview'] | null;
    error: string;
};

export function MergeWorkspace({ ids, canMerge: canMergeRole }: { ids: string[]; canMerge: boolean; }) {
    const router = useRouter();
    const { editable: canMerge, notice } = useMergePermission(canMergeRole);
    const { allDataKeys, loadingDataKeys, mergeDataKeys, merging } = useDataKeysCtx();
    const state = useMergeUrlState();

    const [impact, setImpact] = useState<DeleteImpactItem[] | null>(null);
    const [impactError, setImpactError] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [preview, setPreview] = useState<PreviewState>({ key: '', loading: false, data: null, error: '' });
    const [refreshCount, setRefreshCount] = useState(0);

    const idsKey = ids.join(',');
    const byId = useMemo(() => new Map(allDataKeys.map((dataKey) => [dataKey.uuid, dataKey])), [allDataKeys]);
    const byUniqueKey = useMemo(() => new Map(allDataKeys.map((dataKey) => [dataKey.uniqueKey, dataKey])), [allDataKeys]);
    const candidates = ids.map((id) => byId.get(id)).filter((dataKey): dataKey is DataKey => !!dataKey);
    const missingIds = allDataKeys.length ? ids.filter((id) => !byId.has(id)) : [];

    useEffect(() => {
        let cancelled = false;
        setImpact(null);
        setImpactError('');
        fetchDataKeyDeleteImpact(ids)
            .then((items) => {
                if (cancelled) return;
                setImpact(items);
                // Keep the most-used key by default: it moves the fewest scripts.
                if (!state.survivorId || !ids.includes(state.survivorId)) {
                    const counts = new Map(items.map((item) => [item.dataKeyId, groupScriptsByTitle(item.scripts).length]));
                    state.setSurvivorId([...ids].sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0))[0]);
                }
            })
            .catch((e: any) => !cancelled && setImpactError(e.message || 'Could not check where the data keys are used.'));
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idsKey]);

    const scriptsById = useMemo(() => new Map((impact || []).map((item) => [item.dataKeyId, item.scripts])), [impact]);
    const survivorId = state.survivorId;
    const survivor = survivorId ? byId.get(survivorId) : undefined;
    const mergedIds = candidates.map((dataKey) => dataKey.uuid).filter((id) => id !== survivorId && !state.excludedIds.includes(id));
    const mergedKey = mergedIds.join(',');

    const plan = useMemo(() => buildDataKeysMergePlan({
        dataKeys: allDataKeys,
        survivorId,
        mergedIds,
        childActions: state.childActions,
        survivorOptionOrder: state.survivorOptionOrder,
        survivorLabel: state.survivorLabel,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [allDataKeys, survivorId, mergedKey, state.childActions, state.survivorOptionOrder.join(','), state.survivorLabel]);

    const survivorChildren = (survivor?.options || [])
        .map((uniqueKey) => byUniqueKey.get(uniqueKey))
        .filter((dataKey): dataKey is DataKey => !!dataKey);

    // Every script using a merged key; a script using two merged keys appears once.
    const mergedScripts = useMemo(() => {
        const byScriptId = new Map<string, DeleteImpactItem['scripts'][number]>();
        for (const id of mergedIds) {
            for (const script of scriptsById.get(id) || []) {
                const existing = byScriptId.get(script.scriptId);
                byScriptId.set(script.scriptId, existing
                    ? { ...existing, usages: [...(existing.usages || []), ...(script.usages || [])] }
                    : script);
            }
        }
        return Array.from(byScriptId.values());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scriptsById, mergedKey]);
    const mergedScriptGroups = groupScriptsByTitle(mergedScripts);

    const scriptsOnly = state.scope === 'scripts';
    const appliedScripts = scriptsOnly
        ? mergedScripts.filter((script) => state.selectedScriptIds.includes(script.scriptId))
        : mergedScripts;

    const counts = plan.children.reduce<Record<ChildMergeAction['action'], number>>((acc, row) => {
        acc[row.action.action] += 1;
        return acc;
    }, { keep: 0, match: 0, add: 0, drop: 0 });
    const toReview = plan.children.filter((row) => row.suggested && (row.action.action === 'add' || row.suggestionReason === 'similar'));
    const hasSwaps = counts.match > 0 || counts.drop > 0;
    const orderChanged = !!state.survivorOptionOrder.length;

    const request = {
        survivorId,
        mergedIds,
        childActions: Object.fromEntries(plan.children.map((row) => [row.uniqueKey, row.action])),
        scriptIds: scriptsOnly ? appliedScripts.map((script) => script.scriptId) : undefined,
        deleteUnusedChildren: !scriptsOnly && state.deleteUnusedChildren,
        survivorOptionOrder: orderChanged ? plan.nextSurvivorOptions : undefined,
        survivorLabel: state.survivorLabel,
        legacyLinks: state.legacyLinks,
    };
    const requestKey = JSON.stringify(request);

    const planBlockers = [
        ...(missingIds.length ? [`${pluralize(missingIds.length, 'data key')} in this link could not be found.`] : []),
        ...(candidates.length < 2 ? ['Choose at least two parent data keys to merge.'] : []),
        ...plan.errors,
        ...(scriptsOnly && !appliedScripts.length ? ['Select at least one script to merge in.'] : []),
    ];

    // Re-run the dry run shortly after the plan settles.
    const previewRun = useRef(0);
    useEffect(() => {
        if (!canMerge || !impact || !survivorId || planBlockers.length) return;
        const run = ++previewRun.current;
        setPreview((current) => ({ ...current, key: requestKey, loading: true, error: '' }));
        const timer = setTimeout(async () => {
            try {
                const res = await previewDataKeysMerge(request);
                if (run !== previewRun.current) return;
                setPreview({ key: requestKey, loading: false, data: res.preview || null, error: res.errors?.[0] || '' });
            } catch (e: any) {
                if (run !== previewRun.current) return;
                setPreview({ key: requestKey, loading: false, data: null, error: e.message || 'Preview failed.' });
            }
        }, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestKey, canMerge, !!impact, planBlockers.length, refreshCount]);

    const previewData = preview.key === requestKey ? preview.data : null;
    const previewReady = !!previewData && !preview.loading && !preview.error;
    const conflicts = previewData?.conflicts || [];
    const blockers = [
        ...planBlockers,
        ...(preview.error && preview.key === requestKey ? [preview.error] : []),
    ];
    const canSubmit = canMerge && !merging && !blockers.length && previewReady && !conflicts.length;

    const setChildAction = (childKey: string, action: ChildMergeAction) => {
        state.setChildActions({ ...state.childActions, [childKey]: action });
    };

    const handleMerge = async () => {
        if (!canSubmit || !survivor) return;
        const mergeId = await mergeDataKeys({ ...request, survivorId: survivor.uuid });
        setConfirming(false);
        if (mergeId) router.push(`/data-keys/merge/history/${mergeId}?merged=1`);
    };

    const loading = (!impact && !impactError) || (loadingDataKeys && !allDataKeys.length);
    const title = candidates[0] ? `Merge “${candidates[0].name}”` : 'Merge data keys';

    const steps = [
        { id: 'keep', label: 'Keep', done: !!survivor },
        { id: 'options', label: toReview.length ? `Options (${toReview.length} to review)` : 'Options', done: !plan.errors.length },
        { id: 'where', label: 'Where', done: !scriptsOnly || !!appliedScripts.length },
        { id: 'preview', label: 'Preview', done: previewReady && !conflicts.length },
    ];

    return (
        <PageContainer title={title} backLink="/data-keys/merge">
            {merging && <Loader overlay />}

            <div className="min-w-0 space-y-6 px-4 pb-6">
                <div className="-mt-2 text-sm text-muted-foreground">
                    Keep one data key, decide what each of the others’ options becomes, and choose where to apply it.
                    Nothing changes until you merge; changes are saved as drafts for the next publish and can be
                    reverted until then.
                </div>

                {!!notice && <Callout variant="warning">{notice}</Callout>}
                {impactError && <Callout variant="error">{impactError}</Callout>}

                <nav aria-label="Merge steps" className="flex flex-wrap gap-2">
                    {steps.map((step, index) => (
                        <a
                            key={step.id}
                            href={`#${step.id}`}
                            className="inline-flex items-center gap-x-1.5 rounded-md border border-border px-2.5 py-1 text-sm hover:bg-accent"
                        >
                            {step.done
                                ? <CheckIcon className="h-3.5 w-3.5 text-primary" />
                                : <span className="text-xs text-muted-foreground">{index + 1}</span>}
                            {step.label}
                        </a>
                    ))}
                </nav>

                {loading ? (
                    <div className="space-y-4" role="status" aria-live="polite">
                        <span className="sr-only">Checking where the data keys are used…</span>
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                ) : (
                    <>
                        {/* 1. Keep */}
                        <section className="space-y-3">
                            <SectionTitle
                                id="keep"
                                title="1. Choose the data key to keep"
                                description="The others are merged into it. Keeping the most-used key changes the fewest scripts."
                            />
                            <RadioGroup
                                value={survivorId}
                                onValueChange={(id) => state.setSurvivorId(id)}
                                className="grid grid-cols-1 gap-3 md:grid-cols-2"
                                disabled={merging}
                            >
                                {candidates.map((dataKey) => (
                                    <CandidateTile
                                        key={dataKey.uuid}
                                        dataKey={dataKey}
                                        kept={dataKey.uuid === survivorId}
                                        included={!state.excludedIds.includes(dataKey.uuid)}
                                        scriptGroups={groupScriptsByTitle(scriptsById.get(dataKey.uuid) || [])}
                                        byUniqueKey={byUniqueKey}
                                        survivorOptions={survivor?.options || []}
                                        disabled={merging}
                                        onIncludedChange={(included) => state.setExcludedIds(included
                                            ? state.excludedIds.filter((id) => id !== dataKey.uuid)
                                            : [...state.excludedIds, dataKey.uuid])}
                                    />
                                ))}
                            </RadioGroup>
                        </section>

                        <Separator />

                        {/* 2. Options */}
                        <section className="space-y-4">
                            <SectionTitle
                                id="options"
                                title="2. Match the options"
                                description={survivor
                                    ? <>What each option of the merged keys becomes under “{getMergeKeyTitle(survivor)}”. Suggestions match by name, then label, then a similar name.</>
                                    : 'Choose the key to keep first.'}
                                aside={!!plan.children.length && (
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={merging}
                                            onClick={() => state.setChildActions({})}
                                        >
                                            Use suggestions
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={merging}
                                            onClick={() => state.setChildActions({
                                                ...state.childActions,
                                                ...Object.fromEntries(plan.children
                                                    .filter((row) => row.action.action === 'drop')
                                                    .map((row) => [row.uniqueKey, { action: 'add' } as ChildMergeAction])),
                                            })}
                                        >
                                            Add all unmatched
                                        </Button>
                                    </div>
                                )}
                            />

                            {!plan.children.length ? (
                                <div className="text-sm text-muted-foreground">Nothing to match yet.</div>
                            ) : (
                                <div className="overflow-x-auto rounded-md border border-border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Option in merged key</TableHead>
                                                <TableHead className="w-32">Used in</TableHead>
                                                <TableHead className="min-w-[240px]">Becomes</TableHead>
                                                <TableHead className="w-28 text-right">Result</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {plan.children.map((row) => (
                                                <OptionRow
                                                    key={row.uniqueKey}
                                                    row={row}
                                                    survivor={survivor}
                                                    survivorChildren={survivorChildren}
                                                    byUniqueKey={byUniqueKey}
                                                    usage={previewData?.optionUsage?.[row.uniqueKey]}
                                                    usageLoading={canMerge && !previewData && !preview.error}
                                                    showParents={plan.merged.length > 1}
                                                    disabled={merging}
                                                    onChange={(action) => setChildAction(row.uniqueKey, action)}
                                                />
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {!!previewData?.legacyItems.length && (
                                <LegacyItems
                                    items={previewData.legacyItems}
                                    links={state.legacyLinks}
                                    byUniqueKey={byUniqueKey}
                                    parents={plan.merged as DataKey[]}
                                    disabled={merging}
                                    onChange={state.setLegacyLinks}
                                />
                            )}

                            {survivor && (
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
                                    <div className="min-w-0 space-y-2">
                                        <Label htmlFor="merge-survivor-label">Label of the kept key</Label>
                                        <Input
                                            id="merge-survivor-label"
                                            value={state.survivorLabel ?? (survivor.label || '')}
                                            disabled={merging}
                                            onChange={(e) => state.setSurvivorLabel(e.target.value === (survivor.label || '') ? null : e.target.value)}
                                        />
                                        <div className="text-xs text-muted-foreground">
                                            {plan.survivorLabel
                                                ? 'The new label is applied wherever the kept key is used.'
                                                : 'Leave as is, or set the label every script should show.'}
                                        </div>
                                    </div>
                                    <div className="min-w-0 overflow-x-auto rounded-md border border-border">
                                        <DataTable
                                            title={`“${getMergeKeyTitle(survivor)}” after the merge`}
                                            sortable={!merging}
                                            onSort={(oldIndex: number, newIndex: number) => {
                                                state.setSurvivorOptionOrder(arrayMoveImmutable([...plan.nextSurvivorOptions], oldIndex, newIndex));
                                            }}
                                            headerActions={orderChanged ? (
                                                <Button size="sm" variant="ghost" onClick={() => state.setSurvivorOptionOrder([])}>
                                                    Reset order
                                                </Button>
                                            ) : null}
                                            columns={[
                                                { name: 'Key' },
                                                { name: 'Label' },
                                                {
                                                    name: '',
                                                    align: 'right',
                                                    cellRenderer({ rowIndex }) {
                                                        const uniqueKey = plan.nextSurvivorOptions[rowIndex];
                                                        const sources = plan.children.filter((row) => row.action.action === 'match' && row.action.to === uniqueKey);
                                                        return (
                                                            <div className="flex items-center justify-end gap-2">
                                                                {!!sources.length && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        ← {sources.map((row) => row.name || shortId(row.uniqueKey)).join(', ')}
                                                                    </span>
                                                                )}
                                                                {plan.addedOptions.includes(uniqueKey) && <ActionBadge action="add" />}
                                                            </div>
                                                        );
                                                    },
                                                },
                                            ]}
                                            data={plan.nextSurvivorOptions.map((uniqueKey) => {
                                                const child = byUniqueKey.get(uniqueKey);
                                                return [child?.name || shortId(uniqueKey), child?.label || '', ''];
                                            })}
                                            noDataMessage="No options"
                                        />
                                        {!!plan.droppedChildren.length && (
                                            <div className="border-t border-border px-4 py-2 text-xs text-destructive">
                                                Removed from the scripts: {plan.droppedChildren.map((key) => byUniqueKey.get(key)?.name || shortId(key)).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>

                        <Separator />

                        {/* 3. Where */}
                        <section className="space-y-3">
                            <SectionTitle
                                id="where"
                                title="3. Choose where to apply it"
                                description="Each script is listed once, with every place the merged keys appear."
                            />
                            <RadioGroup
                                value={state.scope}
                                onValueChange={(value) => state.setScope(value as 'library' | 'scripts')}
                                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                                disabled={merging}
                            >
                                {([
                                    { value: 'library', title: 'All scripts', caption: 'Merged keys are deleted from the library on the next publish.' },
                                    { value: 'scripts', title: 'Selected scripts only', caption: 'Merged keys stay in the library for the other scripts.' },
                                ] as const).map((option) => (
                                    <Label
                                        key={option.value}
                                        htmlFor={`merge-scope-${option.value}`}
                                        className={cn(
                                            'flex cursor-pointer items-start gap-x-3 rounded-md border p-3 font-normal',
                                            state.scope === option.value ? 'border-primary bg-primary/5' : 'border-border',
                                        )}
                                    >
                                        <RadioGroupItem id={`merge-scope-${option.value}`} value={option.value} className="mt-0.5" />
                                        <span>
                                            <span className="block text-sm font-medium">{option.title}</span>
                                            <span className="block text-xs text-muted-foreground">{option.caption}</span>
                                        </span>
                                    </Label>
                                ))}
                            </RadioGroup>

                            {!mergedScriptGroups.length ? (
                                <div className="text-sm text-muted-foreground">The merged keys are not used in any script.</div>
                            ) : (
                                <>
                                    {scriptsOnly && (
                                        <div className="flex items-center gap-x-3 text-sm">
                                            <span className="text-muted-foreground">
                                                {groupScriptsByTitle(appliedScripts).length} of {pluralize(mergedScriptGroups.length, 'script')} selected
                                            </span>
                                            <Button size="sm" variant="ghost" onClick={() => state.setSelectedScriptIds(mergedScripts.map((script) => script.scriptId))}>
                                                Select all
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => state.setSelectedScriptIds([])}>
                                                Clear
                                            </Button>
                                        </div>
                                    )}
                                    <ul className="max-h-[420px] divide-y divide-border overflow-y-auto rounded-md border border-border">
                                        {mergedScriptGroups.map((group) => (
                                            <ScriptRow
                                                key={group.key}
                                                group={group}
                                                selectable={scriptsOnly}
                                                checked={!scriptsOnly || group.scriptIds.every((id) => state.selectedScriptIds.includes(id))}
                                                disabled={merging}
                                                onCheckedChange={(checked) => state.setSelectedScriptIds(checked
                                                    ? [...state.selectedScriptIds, ...group.scriptIds]
                                                    : state.selectedScriptIds.filter((id) => !group.scriptIds.includes(id)))}
                                            />
                                        ))}
                                    </ul>
                                </>
                            )}

                            {!scriptsOnly && hasSwaps && (
                                <div className="flex items-start gap-x-3 rounded-md border border-border p-3">
                                    <Checkbox
                                        id="merge-cleanup"
                                        checked={state.deleteUnusedChildren}
                                        disabled={merging}
                                        onCheckedChange={(checked) => state.setDeleteUnusedChildren(checked === true)}
                                        className="mt-0.5"
                                    />
                                    <Label htmlFor="merge-cleanup" className="font-normal">
                                        <span className="block text-sm font-medium">Clean up replaced options</span>
                                        <span className="block text-xs text-muted-foreground">
                                            Delete matched or removed options that end up with no parent and no usage.
                                        </span>
                                    </Label>
                                </div>
                            )}
                        </section>

                        <Separator />

                        {/* 4. Preview */}
                        <section className="space-y-3">
                            <SectionTitle
                                id="preview"
                                title="4. Preview the changes"
                                description="The merge is run against the current drafts and rolled back, so this is exactly what will change."
                                aside={canMerge && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={preview.loading || !!planBlockers.length}
                                        onClick={() => setRefreshCount((count) => count + 1)}
                                    >
                                        <RefreshCwIcon className={cn('mr-2 h-4 w-4', preview.loading && 'animate-spin')} />
                                        Refresh
                                    </Button>
                                )}
                            />

                            {!!blockers.length && (
                                <Callout variant="error">
                                    {blockers.map((error) => <div key={error}>{error}</div>)}
                                </Callout>
                            )}

                            {!!conflicts.length && (
                                <Callout variant="error">
                                    <div className="font-medium">Other people have unpublished changes here.</div>
                                    <ul className="mt-1 list-inside list-disc">
                                        {conflicts.map((conflict, index) => (
                                            <li key={`${conflict.title}-${index}`}>
                                                {conflict.userName} — {conflict.kind === 'script' ? 'script' : 'data key'} “{conflict.title}”
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-1">Merge after those changes are published or discarded, so nobody’s work is overwritten.</div>
                                </Callout>
                            )}

                            {!canMerge ? (
                                <div className="text-sm text-muted-foreground">The preview runs in development mode, for admins.</div>
                            ) : preview.loading || (!previewData && !preview.error && !planBlockers.length) ? (
                                <div className="space-y-2" role="status" aria-live="polite">
                                    <span className="sr-only">Preparing preview…</span>
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ) : previewData ? (
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-3 text-sm">
                                        <span>{pluralize(previewData.scriptsChanged, 'script')} change</span>
                                        <MergeChangeTotals totals={previewData.report.totals} />
                                    </div>
                                    <MergeReport report={previewData.report} />
                                </div>
                            ) : null}
                        </section>
                    </>
                )}
            </div>

            <ActionsBar className="items-center">
                <div className="mr-auto hidden text-sm text-muted-foreground sm:block">
                    {survivor ? (
                        <>
                            Keep <span className="text-foreground">{describeKey(survivor)}</span>
                            {' · '}merge {pluralize(plan.merged.length, 'key')}
                            {' · '}{counts.match} matched, {counts.add} new, {counts.drop} removed
                            {previewData && <> · {pluralize(previewData.scriptsChanged, 'script')}</>}
                        </>
                    ) : 'Choose the data key to keep'}
                </div>
                <Button
                    className="h-auto w-auto"
                    disabled={!canSubmit}
                    onClick={() => setConfirming(true)}
                >
                    {merging ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <MergeIcon className="mr-2 h-4 w-4" />}
                    Merge data keys
                </Button>
            </ActionsBar>

            <AlertDialog open={confirming} onOpenChange={(open) => !merging && setConfirming(open)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Merge these data keys?</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-2 text-sm">
                                <div>
                                    {pluralize(plan.merged.length, 'key')} will be merged into “{survivor ? describeKey(survivor) : ''}”,
                                    changing {pluralize(previewData?.scriptsChanged || 0, 'script')}.
                                </div>
                                <ul className="list-inside list-disc text-xs">
                                    {!!counts.match && <li>{pluralize(counts.match, 'option')} matched to existing options</li>}
                                    {!!counts.add && <li>{pluralize(counts.add, 'option')} added to the kept key</li>}
                                    {!!counts.drop && <li className="text-destructive">{pluralize(counts.drop, 'option')} removed from the scripts</li>}
                                    {!!state.legacyLinks.length && <li>{pluralize(state.legacyLinks.length, 'unlinked option')} linked</li>}
                                    <li>
                                        {scriptsOnly
                                            ? 'The merged keys stay in the library.'
                                            : 'The merged keys are deleted from the library on the next publish.'}
                                    </li>
                                    <li>You can revert this merge from its report until it is published.</li>
                                </ul>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={merging}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={merging}
                            onClick={(e) => {
                                e.preventDefault();
                                handleMerge();
                            }}
                        >
                            {merging && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                            Merge
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageContainer>
    );
}

function CandidateTile({
    dataKey,
    kept,
    included,
    scriptGroups,
    byUniqueKey,
    survivorOptions,
    disabled,
    onIncludedChange,
}: {
    dataKey: DataKey;
    kept: boolean;
    included: boolean;
    scriptGroups: ScriptGroup[];
    byUniqueKey: Map<string, DataKey>;
    survivorOptions: string[];
    disabled?: boolean;
    onIncludedChange: (included: boolean) => void;
}) {
    return (
        <div className={cn(
            'flex flex-col rounded-md border p-3',
            kept ? 'border-primary bg-primary/5' : 'border-border',
            !kept && !included && 'opacity-60',
        )}>
            <div className="flex items-start gap-x-3">
                <RadioGroupItem id={`keep-${dataKey.uuid}`} value={dataKey.uuid} className="mt-1" aria-label={`Keep ${describeKey(dataKey)}`} />
                <Label htmlFor={`keep-${dataKey.uuid}`} className="min-w-0 flex-1 cursor-pointer font-normal">
                    <span className="flex flex-wrap items-center gap-1.5">
                        <span className="font-medium">{describeKey(dataKey)}</span>
                        <Badge variant="secondary" className="font-normal">{dataKey.dataType}</Badge>
                        {dataKey.isDraft && <Badge variant="outline" className="font-normal">draft</Badge>}
                    </span>
                    <span className="mt-0.5 block font-mono text-xs text-muted-foreground">{dataKey.uniqueKey}</span>
                </Label>
                {kept && <span className="text-sm text-primary">Keep</span>}
            </div>

            <div className="mt-3 text-xs text-muted-foreground">{pluralize((dataKey.options || []).length, 'option')}</div>
            <ul className="mt-1 flex flex-wrap gap-1">
                {(dataKey.options || []).map((option) => {
                    const child = byUniqueKey.get(option);
                    const shared = !kept && survivorOptions.includes(option);
                    return (
                        <li key={option}>
                            <Badge
                                variant={shared ? 'secondary' : 'outline'}
                                className="font-normal"
                                title={shared ? 'Also an option of the kept key' : undefined}
                            >
                                {child ? describeKey(child) : shortId(option)}
                            </Badge>
                        </li>
                    );
                })}
            </ul>

            <details className="mt-3 text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Used in {pluralize(scriptGroups.length, 'script')}
                </summary>
                <ul className="mt-1 space-y-0.5 pl-3">
                    {scriptGroups.map((group) => <li key={group.key} className="truncate">{group.title}</li>)}
                </ul>
            </details>

            {!kept && (
                <div className="mt-3 flex items-center gap-x-2 border-t border-border pt-3">
                    <Checkbox
                        id={`include-${dataKey.uuid}`}
                        checked={included}
                        disabled={disabled}
                        onCheckedChange={(checked) => onIncludedChange(checked === true)}
                    />
                    <Label htmlFor={`include-${dataKey.uuid}`} className="text-sm font-normal">Merge into the kept key</Label>
                </div>
            )}
        </div>
    );
}

function OptionRow({
    row,
    survivor,
    survivorChildren,
    byUniqueKey,
    usage,
    usageLoading,
    showParents,
    disabled,
    onChange,
}: {
    row: DataKeyMergeChildRow;
    survivor?: DataKey;
    survivorChildren: DataKey[];
    byUniqueKey: Map<string, DataKey>;
    usage?: { scripts: number; conditions: number };
    usageLoading: boolean;
    showParents: boolean;
    disabled?: boolean;
    onChange: (action: ChildMergeAction) => void;
}) {
    const offered = (survivor?.options || []).includes(row.uniqueKey);
    const rowType = normalizeDataKeyType(row.dataType);
    const matches = survivorChildren.filter((child) => (
        child.uniqueKey !== row.uniqueKey && normalizeDataKeyType(child.dataType) === rowType
    ));
    const suggestedTo = row.suggestion.action === 'match' ? row.suggestion.to : '';

    return (
        <TableRow>
            <TableCell className="align-top">
                <div className="font-medium">{describeKey(row)}</div>
                <div className="text-xs text-muted-foreground">
                    {row.dataType}
                    {showParents && ` · from ${row.parents.map((uniqueKey) => shortId(uniqueKey)).join(', ')}`}
                </div>
            </TableCell>
            <TableCell className="align-top text-sm">
                {usage ? (
                    <>
                        <div>{pluralize(usage.scripts, 'script')}</div>
                        {!!usage.conditions && (
                            <div className="text-xs text-amber-700 dark:text-amber-400">{pluralize(usage.conditions, 'condition')}</div>
                        )}
                    </>
                ) : usageLoading ? <Skeleton className="h-4 w-16" /> : <span className="text-muted-foreground">—</span>}
            </TableCell>
            <TableCell className="align-top">
                {offered ? (
                    <span className="text-sm text-muted-foreground">Already an option of the kept key</span>
                ) : (
                    <>
                        <Select
                            value={encodeAction(row.action)}
                            disabled={disabled}
                            onValueChange={(value) => onChange(decodeAction(value))}
                        >
                            <SelectTrigger className="h-9 text-sm" aria-label={`What ${describeKey(row)} becomes`}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {!!matches.length && (
                                    <SelectGroup>
                                        <SelectLabel>Match an option of the kept key</SelectLabel>
                                        {matches.map((child) => (
                                            <SelectItem key={child.uniqueKey} value={`match:${child.uniqueKey}`}>
                                                {describeKey(child)}{child.uniqueKey === suggestedTo ? ' (suggested)' : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                )}
                                {!!matches.length && <SelectSeparator />}
                                <SelectItem value="add">Add as a new option</SelectItem>
                                <SelectItem value="drop">Remove from the scripts</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="mt-1 text-xs text-muted-foreground">
                            {row.action.action === 'match' && <>Scripts will show “{byUniqueKey.get(row.action.to)?.name || ''}”. </>}
                            {row.suggested && row.suggestionReason && row.suggestionReason !== 'same' && (
                                <>Suggested: {MATCH_REASON_LABELS[row.suggestionReason]}.</>
                            )}
                            {row.suggested && !row.suggestionReason && <>No similar option found.</>}
                        </div>
                    </>
                )}
            </TableCell>
            <TableCell className="text-right align-top">
                <ActionBadge action={row.action.action} />
            </TableCell>
        </TableRow>
    );
}

function LegacyItems({
    items,
    links,
    byUniqueKey,
    parents,
    disabled,
    onChange,
}: {
    items: LegacyOptionItem[];
    links: LegacyItemLink[];
    byUniqueKey: Map<string, DataKey>;
    parents: DataKey[];
    disabled?: boolean;
    onChange: (links: LegacyItemLink[]) => void;
}) {
    const sameItem = (link: LegacyItemLink, item: LegacyOptionItem) => (
        link.screenId === item.screenId && link.fieldIndex === item.fieldIndex && link.itemIndex === item.itemIndex
    );
    const setLink = (item: LegacyOptionItem, uniqueKey: string | null) => {
        const others = links.filter((link) => !sameItem(link, item));
        onChange(uniqueKey ? [...others, {
            screenId: item.screenId,
            fieldIndex: item.fieldIndex,
            fieldId: item.fieldId,
            itemIndex: item.itemIndex,
            itemId: item.itemId,
            uniqueKey,
        }] : others);
    };

    return (
        <Callout variant="warning" className="space-y-3">
            <div>
                <div className="font-medium">{pluralize(items.length, 'option')} in these scripts {items.length === 1 ? 'is' : 'are'} not linked to a data key</div>
                <div className="text-xs">
                    The merge can only carry linked options over. Link the ones you recognise; unlinked ones are left as
                    they are and stay flagged by the integrity check.
                </div>
            </div>
            <ul className="space-y-2">
                {items.map((item) => {
                    const link = links.find((candidate) => sameItem(candidate, item));
                    const parent = parents.find((candidate) => candidate.uniqueKey === item.parentUniqueKey);
                    const choices = (parent?.options || []).map((key) => byUniqueKey.get(key)).filter((child): child is DataKey => !!child);
                    const id = `legacy-${item.screenId}-${item.fieldIndex}-${item.itemIndex}`;
                    return (
                        <li key={id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border bg-background p-2 text-foreground">
                            <Checkbox
                                id={id}
                                checked={!!link}
                                disabled={disabled || !choices.length}
                                onCheckedChange={(checked) => setLink(item, checked === true ? (item.suggestedUniqueKey || choices[0]?.uniqueKey || null) : null)}
                            />
                            <Label htmlFor={id} className="min-w-0 flex-1 font-normal">
                                <span className="font-mono text-sm">{item.value || '(empty)'}</span>
                                {item.label && item.label !== item.value && <span className="text-sm text-muted-foreground"> — {item.label}</span>}
                                <a
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 inline-flex items-center gap-x-1 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    {item.scriptTitle} › {item.location}
                                    <ExternalLinkIcon className="h-3 w-3 text-primary" />
                                </a>
                            </Label>
                            <Select
                                value={link?.uniqueKey || item.suggestedUniqueKey || ''}
                                disabled={disabled || !choices.length}
                                onValueChange={(uniqueKey) => setLink(item, uniqueKey)}
                            >
                                <SelectTrigger className="h-8 w-full text-sm sm:w-56" aria-label={`Link ${item.value} to`}>
                                    <SelectValue placeholder="Choose an option" />
                                </SelectTrigger>
                                <SelectContent>
                                    {choices.map((child) => (
                                        <SelectItem key={child.uniqueKey} value={child.uniqueKey}>
                                            {describeKey(child)}{child.uniqueKey === item.suggestedUniqueKey ? ' (same name)' : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </li>
                    );
                })}
            </ul>
        </Callout>
    );
}

function ScriptRow({
    group,
    selectable,
    checked,
    disabled,
    onCheckedChange,
}: {
    group: ScriptGroup;
    selectable: boolean;
    checked: boolean;
    disabled?: boolean;
    onCheckedChange: (checked: boolean) => void;
}) {
    const id = `merge-script-${group.key}`;
    return (
        <li className={cn('px-3 py-2 text-sm', selectable && !checked && 'text-muted-foreground')}>
            <div className="flex items-center gap-x-2">
                {selectable && (
                    <Checkbox
                        id={id}
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(value) => onCheckedChange(value === true)}
                    />
                )}
                <Label htmlFor={id} className={cn('min-w-0 flex-1 truncate font-medium', selectable && 'cursor-pointer')}>
                    {group.title}
                    {group.scriptIds.length > 1 && (
                        <span className="ml-1.5 font-normal text-muted-foreground">({group.scriptIds.length} scripts with this title)</span>
                    )}
                </Label>
                <span className="shrink-0 text-xs text-muted-foreground">{pluralize(group.usages.length, 'place')}</span>
            </div>
            <ul className={cn('mt-1 space-y-0.5', selectable && 'pl-6')}>
                {group.usages.map((usage) => (
                    <li key={`${usage.href}::${usage.label}`}>
                        <a
                            href={usage.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex max-w-full items-center gap-x-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <span className="truncate">{usage.label}</span>
                            <ExternalLinkIcon className="h-3 w-3 shrink-0 text-primary" />
                        </a>
                    </li>
                ))}
            </ul>
        </li>
    );
}
