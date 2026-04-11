import { and, eq, inArray, isNull, or } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import type { DbOrTransaction } from '@/databases/pg/db-client';
import { problems, problemsDrafts, pendingDeletion, scriptsDrafts, } from '@/databases/pg/schema';
import socket from '@/lib/socket';

export type DeleteProblemsData = {
    problemsIds?: string[];
    scriptsIds?: string[];
    broadcastAction?: boolean;
    confirmDeleteAll?: boolean;
    userId?: string | null;
    client?: DbOrTransaction;
};

export type DeleteProblemsResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _deleteAllProblemsDrafts(opts?: {
    userId?: string | null;
}): Promise<boolean> {
    try {
        await db.delete(problemsDrafts).where(!opts?.userId ? undefined : eq(problemsDrafts.createdByUserId, opts.userId));
        return true;
    } catch(e: any) {
        throw e;
    }
}

export async function _deleteProblems(
    { 
        problemsIds = [], 
        scriptsIds = [], 
        confirmDeleteAll,
        broadcastAction, 
        userId,
        client,
    }: DeleteProblemsData,
) {
    const response: DeleteProblemsResponse = { success: false, };
    const executor = client ?? db;

    try {
        const shouldConfirmDeleteAll = !scriptsIds.length && !problemsIds.length && !confirmDeleteAll;
        if (shouldConfirmDeleteAll) throw new Error('You&apos;re about to delete all the problems, please confirm this action!');

        // delete drafts
        await executor.delete(problemsDrafts).where(and(
            !problemsIds.length ? undefined : inArray(problemsDrafts.problemDraftId, problemsIds),
            !scriptsIds.length ? undefined : or(
                inArray(problemsDrafts.scriptId, scriptsIds),
                inArray(problemsDrafts.scriptDraftId, scriptsIds)
            ),
        ));

        // insert config keys into pendingDeletion, we'll delete them when data is published
        const problemsArr = await executor
            .select({
                problemId: problems.problemId,
                problemScriptId: problems.scriptId,
                scriptDraftId: scriptsDrafts.scriptDraftId,
                pendingDeletion: pendingDeletion,
            })
            .from(problems)
            .leftJoin(pendingDeletion, eq(pendingDeletion.problemId, problems.problemId))
            .leftJoin(scriptsDrafts, eq(scriptsDrafts.scriptId, problems.scriptId))
            .where(and(
                isNull(problems.deletedAt),
                isNull(pendingDeletion),
                !problemsIds.length ? undefined : inArray(problems.problemId, problemsIds),
                !scriptsIds.length ? undefined : inArray(problems.scriptId, scriptsIds),
            ));

        const pendingDeletionInsertData = problemsArr.map(s => ({
            ...s,
            createdByUserId: userId,
        }));
        
        if (pendingDeletionInsertData.length) await executor.insert(pendingDeletion).values(pendingDeletionInsertData);

        response.success = true;
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_deleteProblems ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction && !client) socket.emit('data_changed', 'delete_problems');
        return response;
    }
}
