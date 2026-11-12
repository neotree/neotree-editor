import { and, eq, inArray, or, sql } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import type { DbOrTransaction } from '@/databases/pg/db-client';
import socket from '@/lib/socket';
import { changeLogs, dataKeyDuplicateDismissals, dataKeyMerges } from '@/databases/pg/schema';
import { appendChangeReason, dataKeyOperationChangeReason } from '@/lib/data-key-operation-change-reason';
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
/**
 * Whether the database has the operation history at its current shape
 * (manual_migrations/2026-11-09-add_data_key_merges.sql). Publish and discard
 * settle the history inside their own transaction, so on a database that
 * hasn't had the migration yet they must skip it rather than fail outright.
 */
async function hasOperationHistory(client: DbOrTransaction) {
    const rows = await client.execute<{ ready: boolean }>(sql`
        select exists (
            select 1 from information_schema.columns
            where table_schema = 'public' and table_name = 'nt_data_key_merges' and column_name = 'discarded_at'
        ) as ready
    `);
    return !!(rows as unknown as { ready: boolean }[])[0]?.ready;
}

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
    if (!(await hasOperationHistory(client))) {
        logger.error('_settleDataKeyOperations', 'nt_data_key_merges is missing or out of date: run manual_migrations/2026-11-09-add_data_key_merges.sql. Publish/discard went ahead without settling the data key operation history.');
        return;
    }

    const now = new Date();
    const scope = and(
        eq(dataKeyMerges.status, 'applied'),
        userId ? eq(dataKeyMerges.createdByUserId, userId) : undefined,
    );

    if (outcome === 'published' && dataVersion != null) {
        await tagReleaseChangeLogs({ where: scope, dataVersion, client });
    }

    await client.update(dataKeyMerges)
        .set(outcome === 'published'
            ? { status: 'published', publishedAt: now, publishedByUserId: actorUserId || null, publishedDataVersion: dataVersion ?? null, snapshot: {} }
            : { status: 'discarded', discardedAt: now, snapshot: {} })
        .where(scope);
}

const SCRIPT_ENTITY_TYPES = ['script', 'screen', 'diagnosis', 'problem'] as const;

// Older rows hold the JSON as a string.
const asObject = (value: unknown): any => {
    if (typeof value !== 'string') return value || {};
    try { return JSON.parse(value); } catch { return {}; }
};

/**
 * Names the operation in the change reason of this release's changelog
 * entries it is behind: the scripts its report says it changed (their script,
 * screen, diagnosis and problem entries) and the data keys it involved or
 * deleted. Must run before the snapshot is cleared.
 */
async function tagReleaseChangeLogs({
    where,
    dataVersion,
    client,
}: {
    where: ReturnType<typeof and>;
    dataVersion: number;
    client: DbOrTransaction;
}) {
    const operations = await client.select({
        kind: dataKeyMerges.kind,
        title: dataKeyMerges.title,
        survivorName: dataKeyMerges.survivorName,
        report: dataKeyMerges.report,
        snapshot: dataKeyMerges.snapshot,
    }).from(dataKeyMerges).where(where);

    for (const operation of operations) {
        const report = asObject(operation.report);
        const snapshot = asObject(operation.snapshot);
        const scriptIds: string[] = Array.from(new Set<string>((report.scripts || []).map((script: any) => `${script?.scriptId || ''}`).filter(Boolean)));
        const dataKeyIds: string[] = Array.from(new Set<string>([...(snapshot.scope?.dataKeyIds || []), ...(report.deletedDataKeyIds || [])].map((id: any) => `${id || ''}`).filter(Boolean)));
        if (!scriptIds.length && !dataKeyIds.length) continue;

        const entries = await client.select({ id: changeLogs.id, changeReason: changeLogs.changeReason })
            .from(changeLogs)
            .where(and(
                eq(changeLogs.dataVersion, dataVersion),
                or(
                    scriptIds.length ? and(inArray(changeLogs.entityType, [...SCRIPT_ENTITY_TYPES]), or(
                        inArray(changeLogs.scriptId, scriptIds),
                        and(eq(changeLogs.entityType, 'script'), inArray(changeLogs.entityId, scriptIds)),
                    )) : undefined,
                    dataKeyIds.length ? and(eq(changeLogs.entityType, 'data_key'), inArray(changeLogs.entityId, dataKeyIds)) : undefined,
                ),
            ));

        const reason = dataKeyOperationChangeReason(operation);
        for (const entry of entries) {
            const next = appendChangeReason(entry.changeReason, reason);
            if (next !== entry.changeReason) {
                await client.update(changeLogs).set({ changeReason: next }).where(eq(changeLogs.id, entry.id));
            }
        }
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
