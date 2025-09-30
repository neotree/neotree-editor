import { eq, inArray } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { configKeys, configKeysDrafts, pendingDeletion, } from '@/databases/pg/schema';
import socket from '@/lib/socket';

export type DeleteConfigKeysData = {
    configKeysIds: string[];
    broadcastAction?: boolean;
};

export type DeleteConfigKeysResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _deleteAllConfigKeysDrafts(opts?: {
    userId?: string | null;
}): Promise<boolean> {
    try {
        await db.delete(configKeysDrafts).where(!opts?.userId ? undefined : eq(configKeysDrafts.createdByUserId, opts.userId));
        return true;
    } catch(e: any) {
        throw e;
    }
}

export async function _deleteConfigKeys(
    { configKeysIds: configKeysIdsParam, broadcastAction, }: DeleteConfigKeysData,
) {
    const response: DeleteConfigKeysResponse = { success: false, };

    try {
        const configKeysIds = configKeysIdsParam;

        if (configKeysIds.length) {
            // delete drafts
            await db.delete(configKeysDrafts).where(inArray(configKeysDrafts.configKeyDraftId, configKeysIds));

            // insert config keys into pendingDeletion, we'll delete them when data is published
            const configKeysArr = await db
                .select({
                    configKeyId: configKeys.configKeyId,
                    pendingDeletion: pendingDeletion.configKeyId,
                })
                .from(configKeys)
                .leftJoin(pendingDeletion, eq(pendingDeletion.configKeyId, configKeys.configKeyId))
                .where(inArray(configKeys.configKeyId, configKeysIds));

            const pendingDeletionInsertData = configKeysArr.filter(s => !s.pendingDeletion);
            if (pendingDeletionInsertData.length) await db.insert(pendingDeletion).values(pendingDeletionInsertData);
        }

        response.success = true;
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_deleteConfigKeys ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction) socket.emit('data_changed', 'delete_config_keys');
        return response;
    }
}
