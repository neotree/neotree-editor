import { eq } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
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
}): Promise<{ success: boolean; errors?: string[] }> {
    try {
        await db.transaction(async (tx) => {
            const [record] = await tx.select().from(dataKeyMerges).where(eq(dataKeyMerges.mergeId, mergeId));
            if (!record) throw new Error('Merge not found.');
            if (record.status === 'reverted') throw new Error('This merge has already been reverted.');

            const snapshot = record.snapshot as MergeSnapshot;
            const current = await captureMergeDraftRows(tx, snapshot.scope);
            if (!sameMergeDraftRows(current, snapshot.after)) {
                throw new Error('This merge can no longer be reverted: its changes have been published, discarded or edited since.');
            }

            await restoreMergeDraftRows(tx, current, snapshot.before);
            await tx.update(dataKeyMerges).set({
                status: 'reverted',
                revertedByUserId: userId || null,
                revertedAt: new Date(),
            }).where(eq(dataKeyMerges.mergeId, mergeId));
        });

        if (broadcastAction) {
            socket.emit('data_changed', 'save_data_keys');
            socket.emit('data_changed', 'save_scripts');
        }
        return { success: true };
    } catch (e: any) {
        logger.error('_revertDataKeyMerge ERROR', e.message);
        return { success: false, errors: [e.message] };
    }
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
