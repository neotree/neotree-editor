import { and, eq, inArray, isNull, or } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import type { DbOrTransaction } from '@/databases/pg/db-client';
import { scripts, scriptsDrafts, pendingDeletion, } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { _deleteScreens } from './_screens_delete';
import { _deleteDiagnoses } from './_diagnoses_delete';
import { _deleteProblems } from './_problems_delete';

export type DeleteScriptsData = {
    scriptsIds?: string[];
    broadcastAction?: boolean;
    confirmDeleteAll?: boolean;
    userId?: string | null;
    client?: DbOrTransaction;
};

export type DeleteScriptsResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _deleteAllScriptsDrafts(opts?: {
    userId?: string | null;
    client?: DbOrTransaction;
}): Promise<boolean> {
    try {
        const executor = opts?.client ?? db;
        await executor.delete(scriptsDrafts).where(!opts?.userId ? undefined : eq(scriptsDrafts.createdByUserId, opts.userId));
        return true;
    } catch(e: any) {
        throw e;
    }
}

export async function _deleteScripts(
    { scriptsIds = [], broadcastAction, confirmDeleteAll, userId, client, }: DeleteScriptsData,
) {
    const response: DeleteScriptsResponse = { success: false, };
    const executor = client ?? db;

    try {
        const shouldConfirmDeleteAll = !scriptsIds.length && !confirmDeleteAll;
        if (shouldConfirmDeleteAll) throw new Error('You&apos;re about to delete all the scripts, please confirm this action!');

        // delete drafts
        await executor.delete(scriptsDrafts).where(or(
            inArray(scriptsDrafts.scriptId, scriptsIds),
            inArray(scriptsDrafts.scriptDraftId, scriptsIds)
        ));

        // insert config keys into pendingDeletion, we'll delete them when data is published
        let scriptsToDelete = await executor
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

        scriptsToDelete = scriptsToDelete.map(s => ({
            ...s,
            createdByUserId: userId,
        }));

        if (scriptsToDelete.length) {
            await executor.insert(pendingDeletion).values(scriptsToDelete.map(s => ({ scriptId: s.scriptId, })));
            await _deleteScreens({ scriptsIds: scriptsToDelete.map(s => s.scriptId), client: executor, userId });
            await _deleteDiagnoses({ scriptsIds: scriptsToDelete.map(s => s.scriptId), client: executor, userId });
            await _deleteProblems({ scriptsIds: scriptsToDelete.map(s => s.scriptId), client: executor, userId });
        }

        response.success = true;
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_deleteScripts ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction && !client) socket.emit('data_changed', 'delete_scripts');
        return response;
    }
}
