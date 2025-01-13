import { eq, inArray } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { drugsLibrary, drugsLibraryDrafts, pendingDeletion, } from '@/databases/pg/schema';
import socket from '@/lib/socket';

export type DeleteDrugsLibraryItemsData = {
    itemsIds: string[];
    broadcastAction?: boolean;
};

export type DeleteDrugsLibraryItemsResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _deleteAllDrugsLibraryItemsDrafts(): Promise<boolean> {
    try {
        await db.delete(drugsLibraryDrafts);
        return true;
    } catch(e: any) {
        throw e;
    }
}

export async function _deleteDrugsLibraryItems(
    { itemsIds: itemsIdsParam, broadcastAction, }: DeleteDrugsLibraryItemsData,
) {
    const response: DeleteDrugsLibraryItemsResponse = { success: false, };

    try {
        const itemsIds = itemsIdsParam;

        if (itemsIds.length) {
            // delete drafts
            await db.delete(drugsLibraryDrafts).where(inArray(drugsLibraryDrafts.itemDraftId, itemsIds));

            // insert drugs library items into pendingDeletion, we'll delete them when data is published
            const drugsLibraryItemsArr = await db
                .select({
                    drugsLibraryItemId: drugsLibrary.itemId,
                    pendingDeletion: pendingDeletion.drugsLibraryItemId,
                })
                .from(drugsLibrary)
                .leftJoin(pendingDeletion, eq(pendingDeletion.drugsLibraryItemId, drugsLibrary.itemId))
                .where(inArray(drugsLibrary.itemId, itemsIds));

            const pendingDeletionInsertData = drugsLibraryItemsArr.filter(s => !s.pendingDeletion);
            if (pendingDeletionInsertData.length) await db.insert(pendingDeletion).values(pendingDeletionInsertData);
        }

        response.success = true;
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_deleteDrugsLibraryItems ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction) socket.emit('data_changed', 'delete_drugs_library_items');
        return response;
    }
}
