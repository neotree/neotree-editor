import { eq, inArray } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { dataKeys, dataKeysDrafts, pendingDeletion, } from '@/databases/pg/schema';
import socket from '@/lib/socket';

export type DeleteDataKeysParams = {
    dataKeysIds: string[];
    broadcastAction?: boolean;
    userId?: string | null;
};

export type DeleteDataKeysResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _deleteAllDataKeysDrafts(opts?: {
    userId?: string | null;
}): Promise<boolean> {
    try {
        await db.delete(dataKeysDrafts).where(!opts?.userId ? undefined : eq(dataKeysDrafts.createdByUserId, opts.userId));
        return true;
    } catch(e: any) {
        throw e;
    }
}

export async function _deleteDataKeys(
    { dataKeysIds: dataKeysIdsParam, broadcastAction, userId, }: DeleteDataKeysParams,
) {
    const response: DeleteDataKeysResponse = { success: false, };

    try {
        const dataKeysIds = dataKeysIdsParam;

        if (dataKeysIds.length) {
            // delete drafts
            await db.delete(dataKeysDrafts).where(inArray(dataKeysDrafts.uuid, dataKeysIds));

            // insert data keys into pendingDeletion, we'll delete them when data is published
            const dataKeysArr = await db
                .select({
                    dataKeyId: dataKeys.uuid,
                    pendingDeletion: pendingDeletion.dataKeyId,
                })
                .from(dataKeys)
                .leftJoin(pendingDeletion, eq(pendingDeletion.dataKeyId, dataKeys.uuid))
                .where(inArray(dataKeys.uuid, dataKeysIds));

            const pendingDeletionInsertData = dataKeysArr.filter(s => !s.pendingDeletion).map(s => ({
                ...s,
                createdByUserId: userId,
            }));
            
            if (pendingDeletionInsertData.length) await db.insert(pendingDeletion).values(pendingDeletionInsertData);
        }

        response.success = true;
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_deleteDataKeys ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction) socket.emit('data_changed', 'delete_data_keys');
        return response;
    }
}
