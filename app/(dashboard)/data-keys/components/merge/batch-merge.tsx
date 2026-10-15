'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2Icon, MergeIcon } from 'lucide-react';

import { useDataKeysCtx, type DataKey } from '@/contexts/data-keys';
import { ActionsBar } from '@/components/actions-bar';
import { Loader } from '@/components/loader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { CHANGELOG_ACTION_BADGE_CLASSES } from '@/lib/changelog-utils';
import { PageContainer } from '@/app/(dashboard)/(scripts)/components/page-container';
import type { MergeBatchResult } from '@/databases/mutations/data-keys';
import { findDuplicateParentGroups } from '@/lib/data-key-merge-plan';
import { cn } from '@/lib/utils';

import { mergeDataKeyGroups } from './api';
import { getDefaultSurvivor, isCleanGroup, useScriptUsage } from './groups';
import { MergeChangeTotals } from './merge-report';
import { Callout, describeKey, pluralize, shortId, useMergePermission } from './shared';

type Checked = { status: 'ready' | 'conflict' | 'unlinked' | 'error'; result: MergeBatchResult };

const STATUS_BADGES: Record<Checked['status'], { label: string; className: string; }> = {
    ready: { label: 'Ready', className: CHANGELOG_ACTION_BADGE_CLASSES.create },
    unlinked: { label: 'Has unlinked options', className: CHANGELOG_ACTION_BADGE_CLASSES.restore },
    conflict: { label: 'Someone else is editing', className: CHANGELOG_ACTION_BADGE_CLASSES.delete },
    error: { label: 'Error', className: CHANGELOG_ACTION_BADGE_CLASSES.delete },
};

/**
 * Merges every duplicate group that needs no decisions, after checking each
 * with a dry run. Groups with conflicts or unlinked options are left for the
 * one-by-one page, where they can be resolved.
 */
export function BatchMerge({ canMerge: canMergeRole }: { canMerge: boolean; }) {
    const router = useRouter();
    const { editable: canMerge, notice } = useMergePermission(canMergeRole);
    const { allDataKeys, loadingDataKeys, loadDataKeys } = useDataKeysCtx();
    const [checked, setChecked] = useState<Map<string, Checked> | null>(null);
    const [checkError, setCheckError] = useState('');
    const [selected, setSelected] = useState<string[]>([]);
    const [confirming, setConfirming] = useState(false);
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState<MergeBatchResult[] | null>(null);

    const groups = useMemo(() => findDuplicateParentGroups(allDataKeys), [allDataKeys]);
    const { usage, error: usageError } = useScriptUsage(groups.flat().map((dataKey) => dataKey.uuid));

    const cleanGroups = useMemo(() => (usage ? groups.filter((group) => isCleanGroup(group, allDataKeys, usage)) : [])
        .map((group) => {
            const survivor = getDefaultSurvivor(group, usage);
            return {
                id: group.map((dataKey) => dataKey.uuid).sort().join(','),
                survivor,
                merged: group.filter((dataKey) => dataKey.uuid !== survivor.uuid),
            };
        }), [groups, allDataKeys, usage]);
    const cleanKey = cleanGroups.map((group) => group.id).join('|');

    // Check every clean group with a dry run as soon as they are known.
    useEffect(() => {
        if (!canMerge || !usage || results) return;
        if (!cleanGroups.length) {
            setChecked(new Map());
            return;
        }
        let cancelled = false;
        setChecked(null);
        setCheckError('');
        mergeDataKeyGroups(cleanGroups.map((group) => ({
            survivorId: group.survivor.uuid,
            mergedIds: group.merged.map((dataKey) => dataKey.uuid),
        })), true)
            .then((items) => {
                if (cancelled) return;
                const next = new Map<string, Checked>();
                items.forEach((result, index) => {
                    const status: Checked['status'] = !result.success ? 'error'
                        : result.preview?.conflicts.length ? 'conflict'
                        : result.preview?.legacyItems.length ? 'unlinked'
                        : 'ready';
                    next.set(cleanGroups[index].id, { status, result });
                });
                setChecked(next);
                setSelected(cleanGroups.filter((group) => next.get(group.id)?.status === 'ready').map((group) => group.id));
            })
            .catch((e: any) => !cancelled && setCheckError(e.message || 'Could not check the groups.'));
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cleanKey, canMerge, !!usage]);

    const selectedGroups = cleanGroups.filter((group) => selected.includes(group.id));
    const totalScripts = selectedGroups.reduce((sum, group) => sum + (checked?.get(group.id)?.result.preview?.scriptsChanged || 0), 0);

    const handleRun = async () => {
        try {
            setRunning(true);
            const items = await mergeDataKeyGroups(selectedGroups.map((group) => ({
                survivorId: group.survivor.uuid,
                mergedIds: group.merged.map((dataKey) => dataKey.uuid),
            })), false);
            setResults(items);
            await loadDataKeys();
            router.refresh();
        } catch (e: any) {
            setCheckError(e.message || 'The merge failed.');
        } finally {
            setRunning(false);
            setConfirming(false);
        }
    };

    const loading = (loadingDataKeys && !allDataKeys.length) || !usage || (canMerge && !checked && !checkError);
    const byId = new Map(allDataKeys.map((dataKey) => [dataKey.uuid, dataKey]));

    return (
        <PageContainer title="Merge clean groups" backLink="/data-keys/merge">
            {running && <Loader overlay />}

            <div className="space-y-4 px-4 pb-6">
                <div className="-mt-2 text-sm text-muted-foreground">
                    These duplicate groups need no decisions: every option is already shared or matches by name or label.
                    Each group is merged into its most-used key in all scripts, as its own merge you can revert.
                </div>

                {!!notice && <Callout variant="warning">{notice}</Callout>}
                {(usageError || checkError) && <Callout variant="error">{usageError || checkError}</Callout>}

                {results ? (
                    <BatchResults results={results} byId={byId} />
                ) : loading ? (
                    <div className="space-y-2" role="status" aria-live="polite">
                        <span className="sr-only">Checking groups…</span>
                        {[0, 1, 2, 3].map((index) => <Skeleton key={index} className="h-12 w-full" />)}
                    </div>
                ) : !cleanGroups.length ? (
                    <div className="py-12 text-center text-muted-foreground">
                        No clean groups — the remaining duplicates need a decision.{' '}
                        <Link href="/data-keys/merge" className="text-primary hover:underline">Review them one by one</Link>.
                    </div>
                ) : (
                    <div className="rounded-md border border-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10">
                                        <Checkbox
                                            aria-label="Select all ready groups"
                                            checked={!!selected.length && selected.length === cleanGroups.filter((group) => checked?.get(group.id)?.status === 'ready').length}
                                            onCheckedChange={(value) => setSelected(value === true
                                                ? cleanGroups.filter((group) => checked?.get(group.id)?.status === 'ready').map((group) => group.id)
                                                : [])}
                                        />
                                    </TableHead>
                                    <TableHead>Group</TableHead>
                                    <TableHead>Keep</TableHead>
                                    <TableHead>Changes</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cleanGroups.map((group) => {
                                    const check = checked?.get(group.id);
                                    const ready = check?.status === 'ready';
                                    return (
                                        <TableRow key={group.id} className={cn(!ready && 'text-muted-foreground')}>
                                            <TableCell>
                                                <Checkbox
                                                    aria-label={`Merge ${group.survivor.name}`}
                                                    checked={selected.includes(group.id)}
                                                    disabled={!ready}
                                                    onCheckedChange={(value) => setSelected((current) => value === true
                                                        ? [...current, group.id]
                                                        : current.filter((id) => id !== group.id))}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-foreground">{describeKey(group.survivor)}</div>
                                                <div className="text-xs">
                                                    <Badge variant="secondary" className="font-normal">{group.survivor.dataType}</Badge>
                                                    {' '}{pluralize(group.merged.length + 1, 'key')}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{shortId(group.survivor.uniqueKey)}</TableCell>
                                            <TableCell>
                                                {check?.result.preview ? (
                                                    <div className="space-y-1">
                                                        <div className="text-sm">{pluralize(check.result.preview.scriptsChanged, 'script')}</div>
                                                        <MergeChangeTotals totals={check.result.preview.report.totals} />
                                                    </div>
                                                ) : check?.result.errors?.[0]}
                                            </TableCell>
                                            <TableCell>
                                                {check && (
                                                    <div className="space-y-1">
                                                        <Badge variant="outline" className={cn('font-normal', STATUS_BADGES[check.status].className)}>
                                                            {STATUS_BADGES[check.status].label}
                                                        </Badge>
                                                        {!ready && (
                                                            <div>
                                                                <Link
                                                                    href={`/data-keys/merge?ids=${[group.survivor, ...group.merged].map((dataKey: DataKey) => dataKey.uuid).join(',')}`}
                                                                    className="text-xs text-primary hover:underline"
                                                                >
                                                                    Resolve on its own page
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {!results && canMerge && (
                <ActionsBar className="items-center">
                    <div className="mr-auto hidden text-sm text-muted-foreground sm:block">
                        {pluralize(selectedGroups.length, 'group')} selected · {pluralize(totalScripts, 'script')} change
                    </div>
                    <Button className="h-auto w-auto" disabled={!selectedGroups.length || running} onClick={() => setConfirming(true)}>
                        <MergeIcon className="mr-2 h-4 w-4" />
                        Merge {pluralize(selectedGroups.length, 'group')}
                    </Button>
                </ActionsBar>
            )}

            <AlertDialog open={confirming} onOpenChange={(open) => !running && setConfirming(open)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Merge {pluralize(selectedGroups.length, 'group')}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Each group is merged into its most-used key in all scripts ({pluralize(totalScripts, 'script')} in
                            total), and the merged keys are deleted from the library on the next publish. Every group gets its
                            own report and can be reverted until it is published.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={running}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={running}
                            onClick={(e) => {
                                e.preventDefault();
                                handleRun();
                            }}
                        >
                            {running && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                            Merge
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageContainer>
    );
}

function BatchResults({ results, byId }: { results: MergeBatchResult[]; byId: Map<string, DataKey>; }) {
    const done = results.filter((result) => result.success);
    return (
        <div className="space-y-3">
            <Callout variant={done.length === results.length ? 'info' : 'warning'}>
                {pluralize(done.length, 'group')} merged{results.length > done.length ? `, ${results.length - done.length} failed` : ''}.
                Review each report, check data key integrity, then publish.
            </Callout>
            <div className="rounded-md border border-border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Kept key</TableHead>
                            <TableHead>Result</TableHead>
                            <TableHead className="w-40" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.map((result) => (
                            <TableRow key={result.survivorId}>
                                <TableCell>{describeKey(byId.get(result.survivorId)) || shortId(result.survivorId)}</TableCell>
                                <TableCell className="text-sm">
                                    {result.success
                                        ? `${pluralize(result.preview?.scriptsChanged || 0, 'script')} changed`
                                        : <span className="text-destructive">{result.errors?.[0]}</span>}
                                </TableCell>
                                <TableCell className="text-right">
                                    {result.mergeId && (
                                        <Button asChild size="sm" variant="outline">
                                            <Link href={`/data-keys/merge/history/${result.mergeId}`}>View report</Link>
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Button asChild variant="outline">
                <Link href="/data-keys/merge">Back to duplicates</Link>
            </Button>
        </div>
    );
}
