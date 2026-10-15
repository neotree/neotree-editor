import { desc, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { dataKeyDuplicateDismissals, dataKeyMerges, users } from '@/databases/pg/schema';
// The snapshot module has no socket import, so this read path stays side-effect free.
import { isMergeRevertible, type MergeSnapshot } from '@/databases/mutations/data-keys/_merge-snapshot';

const revertedBy = alias(users, 'reverted_by');

const listColumns = {
    mergeId: dataKeyMerges.mergeId,
    kind: dataKeyMerges.kind,
    title: dataKeyMerges.title,
    status: dataKeyMerges.status,
    scope: dataKeyMerges.scope,
    survivorUniqueKey: dataKeyMerges.survivorUniqueKey,
    survivorName: dataKeyMerges.survivorName,
    mergedUniqueKeys: dataKeyMerges.mergedUniqueKeys,
    scriptIds: dataKeyMerges.scriptIds,
    createdAt: dataKeyMerges.createdAt,
    revertedAt: dataKeyMerges.revertedAt,
    createdByName: users.displayName,
    revertedByName: revertedBy.displayName,
};

export type DataKeyOperationKind = 'merge' | 'delete' | 'scripts' | 'unlink';

export type DataKeyMergeListItem = {
    mergeId: string;
    /** merge | delete (library delete/replace) | scripts (replace/remove in selected scripts) | unlink */
    kind: DataKeyOperationKind;
    /** Readable summary; empty on merges recorded before titles existed. */
    title: string;
    status: 'applied' | 'reverted';
    scope: 'library' | 'scripts';
    survivorUniqueKey: string;
    survivorName: string;
    mergedUniqueKeys: string[];
    scriptIds: string[];
    createdAt: Date;
    revertedAt: Date | null;
    createdByName: string | null;
    revertedByName: string | null;
};

export type DataKeyMergeDetail = DataKeyMergeListItem & {
    request: any;
    report: any;
    revertible: boolean;
};

export async function _listDataKeyMerges({ limit = 200 }: { limit?: number; } = {}): Promise<{ data: DataKeyMergeListItem[]; errors?: string[] }> {
    try {
        const rows = await db
            .select(listColumns)
            .from(dataKeyMerges)
            .leftJoin(users, eq(users.userId, dataKeyMerges.createdByUserId))
            .leftJoin(revertedBy, eq(revertedBy.userId, dataKeyMerges.revertedByUserId))
            .orderBy(desc(dataKeyMerges.createdAt))
            .limit(limit);
        return { data: rows as DataKeyMergeListItem[] };
    } catch (e: any) {
        logger.error('_listDataKeyMerges ERROR', e.message);
        return { data: [], errors: [e.message] };
    }
}

export async function _getDataKeyMerge(mergeId: string): Promise<{ data: DataKeyMergeDetail | null; errors?: string[] }> {
    try {
        const [row] = await db
            .select({ ...listColumns, request: dataKeyMerges.request, report: dataKeyMerges.report, snapshot: dataKeyMerges.snapshot })
            .from(dataKeyMerges)
            .leftJoin(users, eq(users.userId, dataKeyMerges.createdByUserId))
            .leftJoin(revertedBy, eq(revertedBy.userId, dataKeyMerges.revertedByUserId))
            .where(eq(dataKeyMerges.mergeId, mergeId));
        if (!row) return { data: null };

        const { snapshot, ...rest } = row;
        const revertible = rest.status === 'applied' && await isMergeRevertible(snapshot as MergeSnapshot);
        return { data: { ...(rest as Omit<DataKeyMergeDetail, 'revertible'>), revertible } };
    } catch (e: any) {
        logger.error('_getDataKeyMerge ERROR', e.message);
        return { data: null, errors: [e.message] };
    }
}

export type DuplicateDismissal = {
    groupKey: string;
    uniqueKeys: string[];
    reason: string;
    createdAt: Date;
    createdByName: string | null;
};

export async function _listDuplicateDismissals(): Promise<{ data: DuplicateDismissal[]; errors?: string[] }> {
    try {
        const rows = await db
            .select({
                groupKey: dataKeyDuplicateDismissals.groupKey,
                uniqueKeys: dataKeyDuplicateDismissals.uniqueKeys,
                reason: dataKeyDuplicateDismissals.reason,
                createdAt: dataKeyDuplicateDismissals.createdAt,
                createdByName: users.displayName,
            })
            .from(dataKeyDuplicateDismissals)
            .leftJoin(users, eq(users.userId, dataKeyDuplicateDismissals.createdByUserId))
            .orderBy(desc(dataKeyDuplicateDismissals.createdAt));
        return { data: rows };
    } catch (e: any) {
        logger.error('_listDuplicateDismissals ERROR', e.message);
        return { data: [], errors: [e.message] };
    }
}
