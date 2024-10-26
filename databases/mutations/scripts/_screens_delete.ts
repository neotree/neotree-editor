import { and, eq, inArray, isNull, or } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { screens, screensDrafts, pendingDeletion, scriptsDrafts, } from '@/databases/pg/schema';
import socket from '@/lib/socket';

export type DeleteScreensData = {
    screensIds?: string[];
    scriptsIds?: string[];
    broadcastAction?: boolean;
    confirmDeleteAll?: boolean;
};

export type DeleteScreensResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _deleteAllScreensDrafts(): Promise<boolean> {
    try {
        await db.delete(screensDrafts);
        return true;
    } catch(e: any) {
        throw e;
    }
}

export async function _deleteScreens(
    { 
        screensIds = [], 
        scriptsIds = [], 
        confirmDeleteAll,
        broadcastAction, 
    }: DeleteScreensData,
) {
    const response: DeleteScreensResponse = { success: false, };

    try {
        const shouldConfirmDeleteAll = !scriptsIds.length && !screensIds.length && !confirmDeleteAll;
        if (shouldConfirmDeleteAll) throw new Error('You&apos;re about to delete all the screens, please confirm this action!');

        // delete drafts
        await db.delete(screensDrafts).where(and(
            !screensIds.length ? undefined : inArray(screensDrafts.screenDraftId, screensIds),
            !scriptsIds.length ? undefined : or(
                inArray(screensDrafts.scriptId, scriptsIds),
                inArray(screensDrafts.scriptDraftId, scriptsIds)
            ),
        ));

        // insert config keys into pendingDeletion, we'll delete them when data is published
        const screensArr = await db
            .select({
                screenId: screens.screenId,
                screenScriptId: screens.scriptId,
                scriptDraftId: scriptsDrafts.scriptDraftId,
                pendingDeletion: pendingDeletion,
            })
            .from(screens)
            .leftJoin(pendingDeletion, eq(pendingDeletion.screenId, screens.screenId))
            .leftJoin(scriptsDrafts, eq(scriptsDrafts.scriptId, screens.scriptId))
            .where(and(
                isNull(screens.deletedAt),
                isNull(pendingDeletion),
                !screensIds.length ? undefined : inArray(screens.screenId, screensIds),
                !scriptsIds.length ? undefined : inArray(screens.scriptId, scriptsIds),
            ));

        const pendingDeletionInsertData = screensArr;
        if (pendingDeletionInsertData.length) await db.insert(pendingDeletion).values(pendingDeletionInsertData);

        response.success = true;
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_deleteScreens ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction) socket.emit('data_changed', 'delete_screens');
        return response;
    }
}
