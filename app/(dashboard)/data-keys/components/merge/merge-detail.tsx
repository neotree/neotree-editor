'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Loader2Icon, Undo2Icon } from 'lucide-react';

import { useDataKeysCtx } from '@/contexts/data-keys';
import { Loader } from '@/components/loader';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
import { pendingChangesAPI } from '@/lib/indexed-db';
import { PageContainer } from '@/app/(dashboard)/(scripts)/components/page-container';
import type { DataKeyMergeDetail } from '@/databases/queries/data-keys';
import type { ChildMergeAction } from '@/lib/data-key-merge-plan';
import type { OptionPlacement } from '@/lib/data-key-merge-analysis';

import { revertDataKeysMerge } from './api';
import { MergeChangeTotals, MergeReport } from './merge-report';
import { ActionBadge, Callout, MergeStatusBadge, OperationKindBadge, SectionTitle, describeKey, operationTitle, pluralize, shortId, useMergePermission } from './shared';

export function MergeDetail({
    merge,
    canMerge: canMergeRole,
    justMerged,
}: {
    merge: DataKeyMergeDetail;
    canMerge: boolean;
    justMerged: boolean;
}) {
    const router = useRouter();
    const { alert } = useAlertModal();
    const { editable: canMerge, notice } = useMergePermission(canMergeRole);
    const { allDataKeys, loadDataKeys } = useDataKeysCtx();
    const [confirming, setConfirming] = useState(false);
    const [reverting, setReverting] = useState(false);

    // Arriving straight from a merge: the header's publish bar and drafts count
    // come from the root layout, which a client navigation does not re-render.
    useEffect(() => {
        if (justMerged) router.refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const byUniqueKey = new Map(allDataKeys.map((dataKey) => [dataKey.uniqueKey, dataKey]));
    const request = merge.request || {};
    const report = merge.report || { scripts: [], totals: {} };
    const childActions = Object.entries((request.childActions || {}) as Record<string, ChildMergeAction>);
    const mergedKeys: { uniqueKey: string; name?: string; label?: string }[] = request.mergedKeys
        || merge.mergedUniqueKeys.map((uniqueKey) => ({ uniqueKey }));
    const placements = Object.entries((request.optionPlacements || {}) as Record<string, OptionPlacement>);
    const nameOf = (uniqueKey: string) => describeKey(byUniqueKey.get(uniqueKey)) || shortId(uniqueKey);
    const kind = merge.kind || 'merge';
    const isMerge = kind === 'merge';
    const noun = isMerge ? 'merge' : 'change';
    const Noun = isMerge ? 'Merge' : 'Change';
    const byUuid = new Map(allDataKeys.map((dataKey) => [dataKey.uuid, dataKey]));

    const handleRevert = async () => {
        try {
            setReverting(true);
            await revertDataKeysMerge(merge.mergeId);
            // The keys this merge queued for deletion are back in the library.
            await Promise.all((report.deletedDataKeyIds || []).map((id: string) => pendingChangesAPI.clearEntityChanges(id, 'dataKey')));
            await loadDataKeys();
            router.refresh();
            alert({ title: `${Noun} reverted`, message: `The drafts are back to how they were before the ${noun}.`, variant: 'success' });
        } catch (e: any) {
            alert({ title: 'Error', message: e.message, variant: 'error' });
        } finally {
            setReverting(false);
            setConfirming(false);
        }
    };

    return (
        <PageContainer
            title={operationTitle(merge)}
            backLink="/data-keys/merge?tab=history"
            actions={canMerge && merge.status === 'applied' && merge.revertible && (
                <Button variant="outline" size="sm" disabled={reverting} onClick={() => setConfirming(true)}>
                    <Undo2Icon className="mr-2 h-4 w-4" />
                    Revert {noun}
                </Button>
            )}
        >
            {reverting && <Loader overlay />}

            <div className="min-w-0 space-y-6 px-4 pb-6">
                <div className="-mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <OperationKindBadge kind={kind} />
                    <MergeStatusBadge status={merge.status} />
                    <span>
                        {isMerge ? 'Merged' : 'Made'} {format(new Date(merge.createdAt), 'PP p')}
                        {merge.createdByName && ` by ${merge.createdByName}`}
                        {' · '}{merge.scope === 'library' ? 'all scripts' : `${pluralize(merge.scriptIds.length, 'selected script')}`}
                    </span>
                    {merge.status === 'reverted' && merge.revertedAt && (
                        <span>
                            · reverted {format(new Date(merge.revertedAt), 'PP p')}
                            {merge.revertedByName && ` by ${merge.revertedByName}`}
                        </span>
                    )}
                    {merge.status === 'published' && merge.publishedAt && (
                        <span>
                            · published {format(new Date(merge.publishedAt), 'PP p')}
                            {merge.publishedByName && ` by ${merge.publishedByName}`}
                            {merge.publishedDataVersion != null && ` in v${merge.publishedDataVersion}`}
                        </span>
                    )}
                </div>

                {!!notice && merge.status === 'applied' && merge.revertible && <Callout variant="warning">{notice}</Callout>}

                {justMerged && merge.status === 'applied' && (
                    <Callout variant="info">
                        The {noun} is saved as drafts. Review the changes below, check data key integrity for the changed
                        scripts, then publish. You can revert it until it is published; it shows in the history once it is.
                    </Callout>
                )}
                {merge.status === 'applied' && !merge.revertible && (
                    <Callout variant="info">
                        This {noun} can no longer be reverted: its drafts have been edited since.
                    </Callout>
                )}
                {merge.status === 'discarded' && (
                    <Callout variant="info">
                        The drafts of this {noun} were discarded
                        {merge.discardedAt && ` on ${format(new Date(merge.discardedAt), 'PP p')}`} before it was published,
                        so nothing changed.
                    </Callout>
                )}

                {isMerge ? (
                <section className="space-y-3">
                    <SectionTitle title="Data keys" />
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="rounded-md border border-border p-3">
                            <div className="text-xs uppercase tracking-wide text-muted-foreground">Kept</div>
                            <div className="mt-1 font-medium">{merge.survivorName}</div>
                            <div className="font-mono text-xs text-muted-foreground">{merge.survivorUniqueKey}</div>
                            {request.survivorLabel && <div className="mt-1 text-sm">New label: “{request.survivorLabel}”</div>}
                        </div>
                        <div className="rounded-md border border-border p-3">
                            <div className="text-xs uppercase tracking-wide text-muted-foreground">Merged into it</div>
                            {mergedKeys.map((key) => (
                                <div key={key.uniqueKey} className="mt-1">
                                    <span>{describeKey(key) || nameOf(key.uniqueKey)}</span>
                                    <span className="ml-1.5 font-mono text-xs text-muted-foreground">{shortId(key.uniqueKey)}</span>
                                </div>
                            ))}
                        </div>
                        {!!request.parentOptionRewrites?.length && (
                            <div className="rounded-md border border-border p-3 md:col-span-2">
                                <div className="text-xs uppercase tracking-wide text-muted-foreground">Parents now offering the kept key</div>
                                <div className="mt-1 text-sm">
                                    {request.parentOptionRewrites.map((rewrite: { parentTitle: string }) => rewrite.parentTitle).join(', ')}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
                ) : (
                    <section className="space-y-3">
                        <SectionTitle title={kind === 'unlink' ? `Options unlinked from “${merge.survivorName}”` : 'Data keys'} />
                        <ul className="divide-y divide-border rounded-md border border-border">
                            {kind === 'unlink'
                                ? (request.deletedUniqueKeys || []).map((uniqueKey: string) => {
                                    const unlinked = (request.unlinkedKeys || []).find((key: { uniqueKey: string }) => key.uniqueKey === uniqueKey);
                                    const replacement = request.optionReplacements?.[uniqueKey];
                                    return (
                                        <li key={uniqueKey} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm">
                                            <span className="min-w-0 flex-1">{describeKey(unlinked) || nameOf(uniqueKey)}</span>
                                            <span className="text-muted-foreground">
                                                {replacement
                                                    ? <>replaced by <span className="text-foreground">{describeKey((request.unlinkedKeys || []).find((key: { uniqueKey: string }) => key.uniqueKey === replacement)) || nameOf(replacement)}</span></>
                                                    : 'removed from the linked screens'}
                                            </span>
                                        </li>
                                    );
                                })
                                : (request.targetKeys || merge.mergedUniqueKeys.map((uniqueKey) => ({ uniqueKey }))).map((target: { uuid?: string; uniqueKey: string; name?: string; label?: string }) => {
                                    const replacementId = target.uuid ? request.replacements?.[target.uuid] : undefined;
                                    const replacement = replacementId
                                        ? ((request.replacementKeys || []).find((key: { uuid: string }) => key.uuid === replacementId) || byUuid.get(replacementId))
                                        : undefined;
                                    return (
                                        <li key={target.uniqueKey} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm">
                                            <span className="min-w-0 flex-1">
                                                {describeKey(target) || nameOf(target.uniqueKey)}
                                                <span className="ml-1.5 font-mono text-xs text-muted-foreground">{shortId(target.uniqueKey)}</span>
                                            </span>
                                            <span className="text-muted-foreground">
                                                {replacement
                                                    ? <>replaced by <span className="text-foreground">{describeKey(replacement)}</span></>
                                                    : (kind === 'delete' ? 'references removed' : 'removed from the selected scripts')}
                                                {kind === 'delete' && ' · deleted from the library'}
                                            </span>
                                        </li>
                                    );
                                })}
                        </ul>
                    </section>
                )}

                {!!placements.length && (
                    <>
                        <Separator />
                        <section className="space-y-3">
                            <SectionTitle
                                title="Where options show"
                                description="Options set to show in all or selected scripts. Every other option stayed in the scripts it was in."
                            />
                            <ul className="divide-y divide-border rounded-md border border-border">
                                {placements.map(([uniqueKey, placement]) => (
                                    <li key={uniqueKey} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm">
                                        <span className="min-w-0 flex-1">{nameOf(uniqueKey)}</span>
                                        <span className="text-muted-foreground">
                                            {placement.scope === 'all'
                                                ? 'All scripts'
                                                : placement.scriptIds.length
                                                    ? pluralize(placement.scriptIds.length, 'selected script')
                                                    : 'Taken out of every script'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </>
                )}

                {!!childActions.length && (
                    <>
                        <Separator />
                        <section className="space-y-3">
                            <SectionTitle title="Options" />
                            <ul className="divide-y divide-border rounded-md border border-border">
                                {childActions.map(([childKey, action]) => (
                                    <li key={childKey} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm">
                                        <span className="min-w-0 flex-1">
                                            {nameOf(childKey)}
                                            {action.action === 'match' && <span className="text-muted-foreground"> → {nameOf(action.to)}</span>}
                                        </span>
                                        <ActionBadge action={action.action} />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </>
                )}

                <Separator />

                <section className="space-y-3">
                    <SectionTitle
                        title="Changes"
                        description={`What the ${noun} changed in each script. Use the integrity check before publishing.`}
                        aside={<MergeChangeTotals totals={report.totals} />}
                    />
                    <MergeReport
                        report={report}
                        integrityLinks
                        defaultOpen={report.scripts.length <= 3}
                        emptyMessage="No script was changed."
                    />
                    {!!report.deletedDataKeyIds?.length && merge.status === 'applied' && (
                        <div className="text-sm text-muted-foreground">
                            {pluralize(report.deletedDataKeyIds.length, 'data key')} {report.deletedDataKeyIds.length === 1 ? 'is' : 'are'} deleted
                            from the library on the next publish.{' '}
                            <Link href="/changelogs/pending" className="text-primary hover:underline">Pending changes</Link>
                        </div>
                    )}
                    {!!report.deletedDataKeyIds?.length && merge.status === 'published' && (
                        <div className="text-sm text-muted-foreground">
                            {pluralize(report.deletedDataKeyIds.length, 'data key')} {report.deletedDataKeyIds.length === 1 ? 'was' : 'were'} deleted
                            from the library when this was published.
                        </div>
                    )}
                </section>
            </div>

            <AlertDialog open={confirming} onOpenChange={(open) => !reverting && setConfirming(open)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revert this {noun}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            The drafts of the {pluralize(report.scripts.length, 'changed script')} and the data keys go back to
                            exactly how they were before the {noun}
                            {(isMerge || kind === 'delete') ? `, and the ${isMerge ? 'merged' : 'deleted'} keys stay in the library` : ''}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={reverting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={reverting}
                            onClick={(e) => {
                                e.preventDefault();
                                handleRevert();
                            }}
                        >
                            {reverting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                            Revert
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageContainer>
    );
}
