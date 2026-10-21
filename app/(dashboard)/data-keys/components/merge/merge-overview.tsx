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
import { cn } from '@/lib/utils';
import { PageContainer } from '@/app/(dashboard)/(scripts)/components/page-container';
import type { DataKeyMergeListItem, DuplicateDismissal } from '@/databases/queries/data-keys';
import {
    findDuplicateKeyGroups,
    findPossibleDuplicateGroups,
    getDuplicateGroupKey,
    type PossibleDuplicateReason,
} from '@/lib/data-key-merge-plan';

import { buildDataKeyParentIndex, getDataKeyParentTitle, type DataKeyParentRef } from '@/lib/data-key-children';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { dismissDuplicateGroup, restoreDuplicateGroup } from './api';
import { isCleanGroup, useScriptUsage } from './groups';
import { Callout, MergeStatusBadge, OperationKindBadge, describeKey, operationTitle, pluralize, shortId, useMergePermission } from './shared';

/** parent: keys with options · option: keys a parent offers · key: any other key */
type GroupKind = 'parent' | 'option' | 'key';

type Group = {
    key: string;
    kind: GroupKind;
    keys: DataKey[];
    possible?: { reason: PossibleDuplicateReason; overlap: number };
};

const KIND_LABELS: Record<GroupKind, string> = { parent: 'Parent', option: 'Option', key: 'Key' };

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
    const [kindFilter, setKindFilter] = useQueryState('kind', { defaultValue: 'all', clearOnDefault: true, shallow: true });
    const [dismissing, setDismissing] = useState<Group | null>(null);
    const [dismissReason, setDismissReason] = useState('');
    const [busy, setBusy] = useState(false);

    const dismissedKeys = useMemo(() => new Set(dismissals.map((dismissal) => dismissal.groupKey)), [dismissals]);
    const byUniqueKey = useMemo(() => new Map(allDataKeys.map((dataKey) => [dataKey.uniqueKey, dataKey])), [allDataKeys]);

    const parentIndex = useMemo(() => buildDataKeyParentIndex(allDataKeys), [allDataKeys]);
    const kindOf = (keys: DataKey[]): GroupKind => keys.some((dataKey) => (dataKey.options || []).length)
        ? 'parent'
        : keys.some((dataKey) => (parentIndex.get(dataKey.uniqueKey) || []).length) ? 'option' : 'key';

    const exact = useMemo<Group[]>(() => findDuplicateKeyGroups(allDataKeys)
        .map((keys) => ({ key: getDuplicateGroupKey(keys), kind: kindOf(keys), keys }))
        .filter((group) => !dismissedKeys.has(group.key)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allDataKeys, dismissedKeys, parentIndex]);
    const possible = useMemo<Group[]>(() => findPossibleDuplicateGroups(allDataKeys)
        .map((group) => ({
            key: getDuplicateGroupKey(group.keys),
            kind: kindOf(group.keys),
            keys: group.keys,
            possible: { reason: group.reason, overlap: group.overlap },
        }))
        .filter((group) => !dismissedKeys.has(group.key)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allDataKeys, dismissedKeys, parentIndex]);

    const { usage, error: usageError } = useScriptUsage([...exact, ...possible].flatMap((group) => group.keys.map((dataKey) => dataKey.uuid)));
    // Until the library has loaded, counts would read as "nothing to do".
    const libraryReady = !!allDataKeys.length;
    // Each check builds a full merge plan, so only recount when the inputs change.
    const cleanCount = useMemo(
        () => (usage && libraryReady ? exact.filter((group) => isCleanGroup(group.keys, allDataKeys, usage)).length : 0),
        [usage, libraryReady, exact, allDataKeys],
    );
    const count = (value: number) => (libraryReady ? ` (${value})` : '');

    const unpublished = merges.filter((merge) => merge.status === 'applied');
    const published = merges.filter((merge) => merge.status === 'published');

    // Scripts-only merges leave the merged key in the library: show where a
    // group was already partly merged.
    const partialMerges = (group: Group) => merges.filter((merge) => (
        merge.kind === 'merge' &&
        (merge.status === 'applied' || merge.status === 'published') &&
        merge.scope === 'scripts' &&
        merge.mergedUniqueKeys.some((uniqueKey) => group.keys.some((dataKey) => dataKey.uniqueKey === uniqueKey))
    ));

    const matchesSearch = (group: Group) => {
        if (kindFilter !== 'all' && group.kind !== kindFilter) return false;
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
        if (!visible.length) return <div className="py-12 text-center text-muted-foreground">No groups match your filters.</div>;
        return (
            <div className="space-y-3">
                {visible.map((group) => (
                    <GroupTile
                        key={group.key}
                        group={group}
                        byUniqueKey={byUniqueKey}
                        parentIndex={parentIndex}
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
                    Data keys that look like the same key: the same name and type — parents, options and other keys alike.
                    Merging keeps one of them, replaces the others everywhere they are used — in scripts, conditions and the
                    parents that offer them — and deletes them on the next publish.
                </div>

                {!!notice && <Callout variant="warning">{notice}</Callout>}
                {usageError && <Callout variant="error">{usageError}</Callout>}

                <Tabs value={tab} onValueChange={(value) => setTab(value)}>
                    <div className="flex flex-wrap items-center gap-2">
                        <TabsList>
                            <TabsTrigger value="exact">Duplicates{count(exact.length)}</TabsTrigger>
                            <TabsTrigger value="possible">Possible{count(possible.length)}</TabsTrigger>
                            <TabsTrigger value="dismissed">Dismissed ({dismissals.length})</TabsTrigger>
                            <TabsTrigger value="history">
                                History ({published.length}{unpublished.length ? ` + ${unpublished.length} unpublished` : ''})
                            </TabsTrigger>
                        </TabsList>
                        {(tab === 'exact' || tab === 'possible') && (
                            <Select value={kindFilter} onValueChange={(value) => setKindFilter(value)}>
                                <SelectTrigger className="ml-auto w-full sm:w-[180px]" aria-label="Kind of key">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {(['all', 'parent', 'option', 'key'] as const).map((value) => {
                                        const list = tab === 'possible' ? possible : exact;
                                        const total = value === 'all' ? list.length : list.filter((group) => group.kind === value).length;
                                        const label = value === 'all' ? 'All kinds' : value === 'parent' ? 'Parents' : value === 'option' ? 'Options' : 'Other keys';
                                        return <SelectItem key={value} value={value}>{label}{libraryReady ? ` (${total})` : ''}</SelectItem>;
                                    })}
                                </SelectContent>
                            </Select>
                        )}
                        {(tab === 'exact' || tab === 'possible') && (
                            <div className="relative w-full min-w-[220px] sm:w-72">
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
                        <div className="mb-3 text-sm text-muted-foreground">
                            Same name, type and label (case, spacing and word order aside).
                        </div>
                        {renderGroups(exact, 'No duplicate data keys — the library is harmonised.')}
                    </TabsContent>

                    <TabsContent value="possible" className="mt-4">
                        <div className="mb-3 text-sm text-muted-foreground">
                            Same name and type, with labels that say much the same thing in different words. Review before merging,
                            or mark them as not duplicates. Keys that share a name but mean different things (such as “0 = Alert”
                            and “0 = None”) are not listed.
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

                    <TabsContent value="history" className="mt-4 space-y-6">
                        {!!unpublished.length && (
                            <section className="space-y-3">
                                <div>
                                    <div className="text-base">Not yet published ({unpublished.length})</div>
                                    <div className="text-sm text-muted-foreground">
                                        Saved as drafts. Review each one and revert it if needed: it moves to the history when it is
                                        published, and is dropped if its drafts are discarded.
                                    </div>
                                </div>
                                <OperationsTable merges={unpublished} />
                            </section>
                        )}
                        <section className="space-y-3">
                            <div>
                                <div className="text-base">Published ({published.length})</div>
                                <div className="text-sm text-muted-foreground">
                                    Merges, deletes, replacements and unlinks that went out in a release.
                                </div>
                            </div>
                            {!published.length ? (
                                <div className="py-12 text-center text-muted-foreground">Nothing published yet.</div>
                            ) : (
                                <OperationsTable merges={published} published />
                            )}
                        </section>
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
    parentIndex,
    usage,
    partialMerges,
    canMerge,
    onDismiss,
}: {
    group: Group;
    byUniqueKey: Map<string, DataKey>;
    parentIndex: Map<string, DataKeyParentRef[]>;
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
    const hasOptions = keys.some((dataKey) => (dataKey.options || []).length);
    // Labels can differ in case, order or wording — show each key's own label when they do.
    const labelsDiffer = keys.some((dataKey) => `${dataKey.label || ''}` !== `${keys[0].label || ''}`);

    return (
        <div className="space-y-3 rounded-md border border-border p-3">
            <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{sameName ? keys[0].name : keys.map((dataKey) => dataKey.name).join(' / ')}</span>
                {sameName && !labelsDiffer && keys[0].label && keys[0].label !== keys[0].name && (
                    <span className="text-muted-foreground">{keys[0].label}</span>
                )}
                <Badge variant="secondary" className="font-normal">{keys[0].dataType}</Badge>
                {/* The kind adds nothing when the data type already says it ("option"). */}
                {KIND_LABELS[group.kind].toLowerCase() !== `${keys[0].dataType || ''}`.toLowerCase() && (
                    <Badge variant="outline" className="font-normal">{KIND_LABELS[group.kind]}</Badge>
                )}
                {group.possible && (
                    <Badge variant="outline" className="font-normal">
                        Similar labels · {Math.round(group.possible.overlap * 100)}%
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
                    const parents = parentIndex.get(dataKey.uniqueKey) || [];
                    return (
                        <div key={dataKey.uuid} className="rounded-md bg-muted/40 p-2">
                            {(!sameName || labelsDiffer) && (
                                <div className="mb-1 text-sm font-medium">{describeKey(dataKey)}</div>
                            )}
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="font-mono" title={dataKey.uniqueKey}>{shortId(dataKey.uniqueKey)}</span>
                                {dataKey.isDraft && <Badge variant="outline" className="font-normal">draft</Badge>}
                                <span className="ml-auto">
                                    {used === undefined ? <Skeleton className="inline-block h-3 w-16" /> : `used in ${pluralize(used, 'script')}`}
                                </span>
                            </div>
                            {!!parents.length && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                    Option of {parents.slice(0, 3).map((parent) => getDataKeyParentTitle(parent)).join(', ')}
                                    {parents.length > 3 && ` and ${parents.length - 3} more`}
                                </div>
                            )}
                            <ul className={cn('flex flex-wrap gap-1', hasOptions && 'mt-2')}>
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
            {hasOptions && (
                <div className="text-xs text-muted-foreground">
                    Filled badges are options every key offers; outlined ones are only in that key.
                </div>
            )}
        </div>
    );
}

function OperationsTable({ merges, published }: { merges: DataKeyMergeListItem[]; published?: boolean; }) {
    const router = useRouter();
    return (
        <div className="rounded-md border border-border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{published ? 'Published' : 'Date'}</TableHead>
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
                            <TableCell className="whitespace-nowrap text-sm">
                                {format(new Date((published && merge.publishedAt) || merge.createdAt), 'PP p')}
                                {published && merge.publishedDataVersion != null && (
                                    <div className="text-xs text-muted-foreground">v{merge.publishedDataVersion}</div>
                                )}
                            </TableCell>
                            <TableCell>{operationTitle(merge)}</TableCell>
                            <TableCell><OperationKindBadge kind={merge.kind} /></TableCell>
                            <TableCell className="text-sm">
                                {merge.scope === 'library' ? 'All scripts' : pluralize(merge.scriptIds.length, 'selected script')}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {merge.createdByName || '—'}
                                {published && merge.publishedByName && merge.publishedByName !== merge.createdByName && (
                                    <div className="text-xs">published by {merge.publishedByName}</div>
                                )}
                            </TableCell>
                            <TableCell><MergeStatusBadge status={merge.status} /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
