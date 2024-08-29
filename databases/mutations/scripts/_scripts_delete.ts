import { and, eq, inArray, isNull, or } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { scripts, scriptsDrafts, pendingDeletion, } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { _deleteScreens } from './_screens_delete';
import { _deleteDiagnoses } from './_diagnoses_delete';

export type DeleteScriptsData = {
    scriptsIds?: string[];
    broadcastAction?: boolean;
    confirmDeleteAll?: boolean;
};

export type DeleteScriptsResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _deleteScripts(
    { scriptsIds = [], broadcastAction, confirmDeleteAll, }: DeleteScriptsData,
) {
    const response: DeleteScriptsResponse = { success: false, };

    try {
        const shouldConfirmDeleteAll = !scriptsIds.length && !confirmDeleteAll;
        if (shouldConfirmDeleteAll) throw new Error('You&apos;re about to delete all the scripts, please confirm this action!');

        // delete drafts
        await db.delete(scriptsDrafts).where(or(
            inArray(scriptsDrafts.scriptId, scriptsIds),
            inArray(scriptsDrafts.scriptDraftId, scriptsIds)
        ));

        // insert config keys into pendingDeletion, we'll delete them when data is published
        const scriptsToDelete = await db
            .select({
                scriptId: scripts.scriptId,
                pendingDeletion: pendingDeletion,
            })
            .from(scripts)
            .leftJoin(pendingDeletion, eq(pendingDeletion.scriptId, scripts.scriptId))
            .where(and(
                isNull(scripts.deletedAt),
                isNull(pendingDeletion),
                !scriptsIds.length ? undefined : inArray(scripts.scriptId, scriptsIds),
            ));

        if (scriptsToDelete.length) {
            await db.insert(pendingDeletion).values(scriptsToDelete.map(s => ({ scriptId: s.scriptId, })));
            await _deleteScreens({ scriptsIds: scriptsToDelete.map(s => s.scriptId), });
            await _deleteDiagnoses({ scriptsIds: scriptsToDelete.map(s => s.scriptId), });
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
