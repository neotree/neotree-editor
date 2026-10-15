import { eq, isNotNull } from 'drizzle-orm';

import db from '@/databases/pg/drizzle';
import type { DbOrTransaction } from '@/databases/pg/db-client';
import { dataKeys, pendingDeletion } from '@/databases/pg/schema';
import logger from '@/lib/logger';

export type PendingDeletionDataKey = {
    uuid: string;
    uniqueKey: string;
    name: string;
    label: string;
    dataType: string;
    createdByUserId: string | null;
};

/**
 * Data keys queued for deletion on the next publish. These are hidden from the
 * regular library listing, so this is the only way the UI can surface them.
 */
export async function _getPendingDeletionDataKeys(params?: {
    client?: DbOrTransaction;
}): Promise<{
    data: PendingDeletionDataKey[];
    errors?: string[];
}> {
    try {
        const executor = params?.client || db;

        const rows = await executor
            .select({
                uuid: dataKeys.uuid,
                uniqueKey: dataKeys.uniqueKey,
                name: dataKeys.name,
                label: dataKeys.label,
                dataType: dataKeys.dataType,
                createdByUserId: pendingDeletion.createdByUserId,
            })
            .from(pendingDeletion)
            .innerJoin(dataKeys, eq(dataKeys.uuid, pendingDeletion.dataKeyId))
            .where(isNotNull(pendingDeletion.dataKeyId));

        return {
            data: rows.map(row => ({
                uuid: row.uuid,
                uniqueKey: row.uniqueKey || '',
                name: row.name || '',
                label: row.label || '',
                dataType: row.dataType || '',
                createdByUserId: row.createdByUserId || null,
            })),
        };
    } catch (e: any) {
        logger.error('_getPendingDeletionDataKeys ERROR', e.message);
        return { data: [], errors: [e.message] };
    }
}
