'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { format } from 'date-fns';
import { ArrowRightIcon, Loader2Icon, Search } from 'lucide-react';

import { useDataKeysCtx, type DataKey } from '@/contexts/data-keys';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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
import { useAlertModal } from '@/hooks/use-alert-modal';
import { PageContainer } from '@/app/(dashboard)/(scripts)/components/page-container';
import type { DataKeyMergeListItem, DuplicateDismissal } from '@/databases/queries/data-keys';
import {
    findDuplicateParentGroups,
    findPossibleDuplicateGroups,
    getDuplicateGroupKey,
    type PossibleDuplicateReason,
} from '@/lib/data-key-merge-plan';

import { dismissDuplicateGroup, restoreDuplicateGroup } from './api';
import { isCleanGroup, useScriptUsage } from './groups';
import { Callout, MergeStatusBadge, OperationKindBadge, describeKey, operationTitle, pluralize, shortId, useMergePermission } from './shared';

type Group = {
    key: string;
    keys: DataKey[];
    possible?: { reason: PossibleDuplicateReason; overlap: number };
};

export function MergeOverview({
    canMerge: canMergeRole,
    dismissals,
    merges,
}: {
    canMerge: boolean;
    dismissals: DuplicateDismissal[];
    merges: DataKeyMergeListItem[];
}) {
    const router = useRouter();
    const { alert } = useAlertModal();
    const { allDataKeys } = useDataKeysCtx();
    const { editable: canMerge, notice } = useMergePermission(canMergeRole);
    const [tab, setTab] = useQueryState('tab', { defaultValue: 'exact', clearOnDefault: true, shallow: true });
    const [search, setSearch] = useState('');
    const [dismissing, setDismissing] = useState<Group | null>(null);
    const [dismissReason, setDismissReason] = useState('');
    const [busy, setBusy] = useState(false);

    const dismissedKeys = useMemo(() => new Set(dismissals.map((dismissal) => dismissal.groupKey)), [dismissals]);
    const byUniqueKey = useMemo(() => new Map(allDataKeys.map((dataKey) => [dataKey.uniqueKey, dataKey])), [allDataKeys]);

    const exact = useMemo<Group[]>(() => findDuplicateParentGroups(allDataKeys)
        .map((keys) => ({ key: getDuplicateGroupKey(keys), keys }))
        .filter((group) => !dismissedKeys.has(group.key)), [allDataKeys, dismissedKeys]);
    const possible = useMemo<Group[]>(() => findPossibleDuplicateGroups(allDataKeys)
        .map((group) => ({ key: getDuplicateGroupKey(group.keys), keys: group.keys, possible: { reason: group.reason, overlap: group.overlap } }))
        .filter((group) => !dismissedKeys.has(group.key)), [allDataKeys, dismissedKeys]);

    const { usage, error: usageError } = useScriptUsage([...exact, ...possible].flatMap((group) => group.keys.map((dataKey) => dataKey.uuid)));
    // Until the library has loaded, counts would read as "nothing to do".
    const libraryReady = !!allDataKeys.length;
    const cleanCount = usage && libraryReady ? exact.filter((group) => isCleanGroup(group.keys, allDataKeys, usage)).length : 0;
    const count = (value: number) => (libraryReady ? ` (${value})` : '');

    // Scripts-only merges leave the merged key in the library: show where a
    // group was already partly merged.
    const partialMerges = (group: Group) => merges.filter((merge) => (
        merge.kind === 'merge' &&
        merge.status === 'applied' &&
        merge.scope === 'scripts' &&
        merge.mergedUniqueKeys.some((uniqueKey) => group.keys.some((dataKey) => dataKey.uniqueKey === uniqueKey))
    ));

    const matchesSearch = (group: Group) => {
        const term = search.trim().toLowerCase();
        return !term || group.keys.some((dataKey) => [dataKey.name, dataKey.label, dataKey.uniqueKey]
            .some((value) => `${value || ''}`.toLowerCase().includes(term)));
    };

    const handleDismiss = async () => {
        if (!dismissing) return;
        try {
            setBusy(true);
            await dismissDuplicateGroup(dismissing.keys.map((dataKey) => dataKey.uniqueKey), dismissReason);
            setDismissing(null);
            setDismissReason('');
            router.refresh();
        } catch (e: any) {
            alert({ title: 'Error', message: e.message, variant: 'error' });
        } finally {
            setBusy(false);
        }
    };

    const handleRestore = async (groupKey: string) => {
        try {
            setBusy(true);
            await restoreDuplicateGroup(groupKey);
            router.refresh();
        } catch (e: any) {
            alert({ title: 'Error', message: e.message, variant: 'error' });
        } finally {
            setBusy(false);
        }
    };

    const renderGroups = (groups: Group[], emptyMessage: string) => {
        const visible = groups.filter(matchesSearch);
        if (!libraryReady) {
            return <div className="space-y-3">{[0, 1, 2].map((index) => <Skeleton key={index} className="h-32 w-full" />)}</div>;
        }
        if (!groups.length) return <div className="py-12 text-center text-muted-foreground">{emptyMessage}</div>;
        if (!visible.length) return <div className="py-12 text-center text-muted-foreground">No groups match your search.</div>;
        return (
            <div className="space-y-3">
                {visible.map((group) => (
                    <GroupTile
                        key={group.key}
                        group={group}
                        byUniqueKey={byUniqueKey}
                        usage={usage}
                        partialMerges={partialMerges(group)}
                        canMerge={canMerge}
                        onDismiss={() => setDismissing(group)}
                    />
                ))}
            </div>
        );
    };

    return (
        <PageContainer
            title="Harmonise data keys"
            backLink="/data-keys"
            actions={canMerge && (cleanCount ? (
                <Button asChild variant="outline" size="sm">
                    <Link href="/data-keys/merge/batch">
                        Merge clean groups ({cleanCount})
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            ) : (
                <Button variant="outline" size="sm" disabled>
                    {usage && libraryReady ? 'No clean groups' : 'Checking groups…'}
                </Button>
            ))}
        >
            <div className="space-y-4 px-4 pb-6">
                <div className="-mt-2 text-sm text-muted-foreground">
                    Parent data keys that look like the same key. Merging keeps one of them, matches the others’ options
                    to its options, and updates every script that uses them — including their conditions.
                </div>

                {!!notice && <Callout variant="warning">{notice}</Callout>}
                {usageError && <Callout variant="error">{usageError}</Callout>}

                <Tabs value={tab} onValueChange={(value) => setTab(value)}>
                    <div className="flex flex-wrap items-center gap-2">
                        <TabsList>
                            <TabsTrigger value="exact">Duplicates{count(exact.length)}</TabsTrigger>
                            <TabsTrigger value="possible">Possible{count(possible.length)}</TabsTrigger>
                            <TabsTrigger value="dismissed">Dismissed ({dismissals.length})</TabsTrigger>
                            <TabsTrigger value="history">History ({merges.length})</TabsTrigger>
                        </TabsList>
                        {(tab === 'exact' || tab === 'possible') && (
                            <div className="relative ml-auto w-full min-w-[220px] sm:w-72">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name, label or key"
                                    aria-label="Search duplicate groups"
                                    className="pl-10"
                                />
                            </div>
                        )}
                    </div>

                    <TabsContent value="exact" className="mt-4">
                        <div className="mb-3 text-sm text-muted-foreground">Same name, label and type.</div>
                        {renderGroups(exact, 'No duplicate parent data keys — the library is harmonised.')}
                    </TabsContent>

                    <TabsContent value="possible" className="mt-4">
                        <div className="mb-3 text-sm text-muted-foreground">
                            Same name with a different label, or at least 70% of their options in common. Review before merging,
                            or mark them as not duplicates.
                        </div>
                        {renderGroups(possible, 'No possible duplicates found.')}
                    </TabsContent>

                    <TabsContent value="dismissed" className="mt-4">
                        {!dismissals.length ? (
                            <div className="py-12 text-center text-muted-foreground">Nothing has been dismissed.</div>
                        ) : (
                            <div className="rounded-md border border-border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Data keys</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Dismissed</TableHead>
                                            <TableHead className="w-24" />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dismissals.map((dismissal) => (
                                            <TableRow key={dismissal.groupKey}>
                                                <TableCell>
                                                    {dismissal.uniqueKeys.map((uniqueKey) => (
                                                        <div key={uniqueKey}>
                                                            {describeKey(byUniqueKey.get(uniqueKey)) || 'Deleted data key'}
                                                            <span className="ml-1.5 font-mono text-xs text-muted-foreground">{shortId(uniqueKey)}</span>
                                                        </div>
                                                    ))}
                                                </TableCell>
                                                <TableCell className="text-sm">{dismissal.reason || <span className="text-muted-foreground">—</span>}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {format(new Date(dismissal.createdAt), 'PP p')}
                                                    {dismissal.createdByName && <div>by {dismissal.createdByName}</div>}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {canMerge && (
                                                        <Button size="sm" variant="ghost" disabled={busy} onClick={() => handleRestore(dismissal.groupKey)}>
                                                            Restore
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="mt-4">
                        <div className="mb-3 text-sm text-muted-foreground">
                            Merges, deletes, replacements and unlinks. Each one can be reviewed, and reverted until it is published.
                        </div>
                        {!merges.length ? (
                            <div className="py-12 text-center text-muted-foreground">No changes recorded yet.</div>
                        ) : (
                            <div className="rounded-md border border-border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Change</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Applied to</TableHead>
                                            <TableHead>By</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {merges.map((merge) => (
                                            <TableRow
                                                key={merge.mergeId}
                                                className="cursor-pointer transition-colors hover:bg-muted/60"
                                                onClick={() => router.push(`/data-keys/merge/history/${merge.mergeId}`)}
                                            >
                                                <TableCell className="whitespace-nowrap text-sm">{format(new Date(merge.createdAt), 'PP p')}</TableCell>
                                                <TableCell>{operationTitle(merge)}</TableCell>
                                                <TableCell><OperationKindBadge kind={merge.kind} /></TableCell>
                                                <TableCell className="text-sm">
                                                    {merge.scope === 'library' ? 'All scripts' : pluralize(merge.scriptIds.length, 'selected script')}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{merge.createdByName || '—'}</TableCell>
                                                <TableCell><MergeStatusBadge status={merge.status} kind={merge.kind} /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            <AlertDialog open={!!dismissing} onOpenChange={(open) => !busy && !open && setDismissing(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Not a duplicate?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This group is hidden from the list. You can restore it from the Dismissed tab.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="dismiss-reason">Reason (optional)</Label>
                        <Textarea
                            id="dismiss-reason"
                            value={dismissReason}
                            onChange={(e) => setDismissReason(e.target.value)}
                            placeholder="e.g. Different clinical meaning at each site"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={busy}
                            onClick={(e) => {
                                e.preventDefault();
                                handleDismiss();
                            }}
                        >
                            {busy && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                            Dismiss
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageContainer>
    );
}

function GroupTile({
    group,
    byUniqueKey,
    usage,
    partialMerges,
    canMerge,
    onDismiss,
}: {
    group: Group;
    byUniqueKey: Map<string, DataKey>;
    usage: Map<string, number> | null;
    partialMerges: DataKeyMergeListItem[];
    canMerge: boolean;
    onDismiss: () => void;
}) {
    const { keys } = group;
    // An option is "shared" when every key in the group offers it.
    const sharedOptions = new Set((keys[0].options || []).filter((option) => keys.every((dataKey) => (dataKey.options || []).includes(option))));
    const totalUsage = usage ? keys.reduce((sum, dataKey) => sum + (usage.get(dataKey.uuid) || 0), 0) : null;
    const sameName = keys.every((dataKey) => `${dataKey.name}`.toLowerCase() === `${keys[0].name}`.toLowerCase());

    return (
        <div className="space-y-3 rounded-md border border-border p-3">
            <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{sameName ? keys[0].name : keys.map((dataKey) => dataKey.name).join(' / ')}</span>
                {sameName && keys[0].label && keys[0].label !== keys[0].name && (
                    <span className="text-muted-foreground">{keys[0].label}</span>
                )}
                <Badge variant="secondary" className="font-normal">{keys[0].dataType}</Badge>
                {group.possible && (
                    <Badge variant="outline" className="font-normal">
                        {group.possible.reason === 'same_name' ? 'Same name, different label' : `${Math.round(group.possible.overlap * 100)}% options shared`}
                    </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                    {pluralize(keys.length, 'key')}
                    {totalUsage !== null && ` · ${pluralize(totalUsage, 'script')}`}
                </span>
                <div className="ml-auto flex items-center gap-2">
                    {canMerge && (
                        <Button size="sm" variant="ghost" onClick={onDismiss}>Not a duplicate</Button>
                    )}
                    <Button asChild size="sm" variant="outline">
                        <Link href={`/data-keys/merge?ids=${keys.map((dataKey) => dataKey.uuid).join(',')}`}>
                            {canMerge ? 'Review & merge' : 'Review'}
                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            {!!partialMerges.length && (
                <div className="text-sm text-muted-foreground">
                    Partly merged already:{' '}
                    {partialMerges.map((merge, index) => (
                        <span key={merge.mergeId}>
                            {index > 0 && ', '}
                            <Link href={`/data-keys/merge/history/${merge.mergeId}`} className="text-primary hover:underline">
                                {pluralize(merge.scriptIds.length, 'script')} on {format(new Date(merge.createdAt), 'PP')}
                            </Link>
                        </span>
                    ))}
                    . The remaining scripts still use the merged key.
                </div>
            )}

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                {keys.map((dataKey) => {
                    const used = usage?.get(dataKey.uuid);
                    return (
                        <div key={dataKey.uuid} className="rounded-md bg-muted/40 p-2">
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                {!sameName && <span className="font-medium text-foreground">{describeKey(dataKey)}</span>}
                                <span className="font-mono" title={dataKey.uniqueKey}>{shortId(dataKey.uniqueKey)}</span>
                                {dataKey.isDraft && <Badge variant="outline" className="font-normal">draft</Badge>}
                                <span className="ml-auto">
                                    {used === undefined ? <Skeleton className="inline-block h-3 w-16" /> : `used in ${pluralize(used, 'script')}`}
                                </span>
                            </div>
                            <ul className="mt-2 flex flex-wrap gap-1">
                                {(dataKey.options || []).map((option) => {
                                    const child = byUniqueKey.get(option);
                                    const shared = sharedOptions.has(option);
                                    return (
                                        <li key={option}>
                                            <Badge
                                                variant={shared ? 'secondary' : 'outline'}
                                                className="font-normal"
                                                title={shared ? 'Offered by every key in this group' : 'Only offered by this key'}
                                            >
                                                {child ? describeKey(child) : shortId(option)}
                                            </Badge>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </div>
            <div className="text-xs text-muted-foreground">
                Filled badges are options every key offers; outlined ones are only in that key.
            </div>
        </div>
    );
}
