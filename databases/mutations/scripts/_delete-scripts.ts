import { eq, inArray } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { scripts, scriptsDrafts, pendingDeletion, } from '@/databases/pg/schema';
import socket from '@/lib/socket';

export type DeleteScriptsData = {
    scriptsIds: string[];
    broadcastAction?: boolean;
};

export type DeleteScriptsResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _deleteScripts(
    { scriptsIds: scriptsIdsParam, broadcastAction, }: DeleteScriptsData,
) {
    const response: DeleteScriptsResponse = { success: false, };

    try {
        const scriptsIds = scriptsIdsParam;

        if (scriptsIds.length) {
            // delete drafts
            await db.delete(scriptsDrafts).where(inArray(scriptsDrafts.scriptDraftId, scriptsIds));

            // insert config keys into pendingDeletion, we'll delete them when data is published
            const scriptsArr = await db
                .select({
                    scriptId: scripts.scriptId,
                    pendingDeletion: pendingDeletion.scriptId,
                })
                .from(scripts)
                .leftJoin(pendingDeletion, eq(pendingDeletion.scriptId, scripts.scriptId))
                .where(inArray(scripts.scriptId, scriptsIds));

            const pendingDeletionInsertData = scriptsArr.filter(s => !s.pendingDeletion);
            if (pendingDeletionInsertData.length) await db.insert(pendingDeletion).values(pendingDeletionInsertData);
        }

        response.success = true;
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_deleteScripts ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction) socket.emit('data_changed', 'delete_scripts');
        return response;
    }
}
