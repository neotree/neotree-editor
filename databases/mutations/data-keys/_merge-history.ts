import { and, eq } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import type { DbOrTransaction } from '@/databases/pg/db-client';
import socket from '@/lib/socket';
import { dataKeyDuplicateDismissals, dataKeyMerges } from '@/databases/pg/schema';
import { getDuplicateGroupKey } from '@/lib/data-key-merge-plan';
import {
    captureMergeDraftRows,
    restoreMergeDraftRows,
    sameMergeDraftRows,
    type MergeSnapshot,
} from './_merge-snapshot';

export { isMergeRevertible, type MergeSnapshot } from './_merge-snapshot';

export async function _revertDataKeyMerge({
    mergeId,
    userId,
    broadcastAction,
}: {
    mergeId: string;
    userId?: string | null;
    broadcastAction?: boolean;
}): Promise<{ success: boolean; errors?: string[]; scriptIds?: string[] }> {
    try {
        const scriptIds = await db.transaction(async (tx) => {
            // Locks serialise two reverts of the same record, and keep the drafts
            // from changing between the "still as the merge left them" check and the restore.
            const [record] = await tx.select().from(dataKeyMerges).where(eq(dataKeyMerges.mergeId, mergeId)).for('update');
            if (!record) throw new Error('Merge not found.');
            if (record.status === 'reverted') throw new Error('This merge has already been reverted.');
            if (record.status === 'published') throw new Error('This change has been published and can no longer be reverted.');
            if (record.status === 'discarded') throw new Error('The drafts of this change were discarded, so there is nothing to revert.');

            const snapshot = record.snapshot as MergeSnapshot;
            const current = await captureMergeDraftRows(tx, snapshot.scope, { lock: true });
            if (!sameMergeDraftRows(current, snapshot.after)) {
                throw new Error('This merge can no longer be reverted: its changes have been published, discarded or edited since.');
            }

            await restoreMergeDraftRows(tx, current, snapshot.before);
            await tx.update(dataKeyMerges).set({
                status: 'reverted',
                revertedByUserId: userId || null,
                revertedAt: new Date(),
            }).where(eq(dataKeyMerges.mergeId, mergeId));

            return snapshot.scope.scriptIds || [];
        });

        if (broadcastAction) {
            socket.emit('data_changed', 'save_data_keys');
            socket.emit('data_changed', 'save_scripts');
        }
        return { success: true, scriptIds };
    } catch (e: any) {
        logger.error('_revertDataKeyMerge ERROR', e.message);
        return { success: false, errors: [e.message] };
    }
}

/**
 * Publishing or discarding drafts settles the operations that made them: they
 * become history (published) or never happened (discarded), and neither can be
 * reverted any more, so the before/after snapshot is dropped.
 *
 * Operations write their drafts as the user who ran them, so `userId` scopes
 * this exactly like the publish/discard does ("my changes"); null or undefined
 * means everyone's. Runs inside the publish/discard transaction.
 */
export async function _settleDataKeyOperations({
    outcome,
    userId,
    actorUserId,
    dataVersion,
    client,
}: {
    outcome: 'published' | 'discarded';
    userId?: string | null;
    /** Who published (published only). */
    actorUserId?: string | null;
    /** The release the drafts went out in (published only). */
    dataVersion?: number | null;
    client: DbOrTransaction;
}) {
    const now = new Date();
    await client.update(dataKeyMerges)
        .set(outcome === 'published'
            ? { status: 'published', publishedAt: now, publishedByUserId: actorUserId || null, publishedDataVersion: dataVersion ?? null, snapshot: {} }
            : { status: 'discarded', discardedAt: now, snapshot: {} })
        .where(and(
            eq(dataKeyMerges.status, 'applied'),
            userId ? eq(dataKeyMerges.createdByUserId, userId) : undefined,
        ));
}

export async function _dismissDuplicateGroup({
    uniqueKeys,
    reason = '',
    userId,
}: {
    uniqueKeys: string[];
    reason?: string;
    userId?: string | null;
}): Promise<{ success: boolean; errors?: string[] }> {
    try {
        const keys = Array.from(new Set(uniqueKeys.map((key) => `${key || ''}`.trim()).filter(Boolean)));
        if (keys.length < 2) throw new Error('A duplicate group needs at least two data keys.');
        const groupKey = getDuplicateGroupKey(keys.map((uniqueKey) => ({ uniqueKey })));
        await db.insert(dataKeyDuplicateDismissals)
            .values({ groupKey, uniqueKeys: keys, reason: `${reason || ''}`.trim(), createdByUserId: userId || null })
            .onConflictDoNothing({ target: dataKeyDuplicateDismissals.groupKey });
        return { success: true };
    } catch (e: any) {
        logger.error('_dismissDuplicateGroup ERROR', e.message);
        return { success: false, errors: [e.message] };
    }
}

export async function _restoreDuplicateGroup({ groupKey }: { groupKey: string; }): Promise<{ success: boolean; errors?: string[] }> {
    try {
        await db.delete(dataKeyDuplicateDismissals).where(eq(dataKeyDuplicateDismissals.groupKey, groupKey));
        return { success: true };
    } catch (e: any) {
        logger.error('_restoreDuplicateGroup ERROR', e.message);
        return { success: false, errors: [e.message] };
    }
}
