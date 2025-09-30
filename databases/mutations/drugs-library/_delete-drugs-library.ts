import { eq, inArray } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { drugsLibraryDrafts, pendingDeletion, } from '@/databases/pg/schema';
import { _getScreens } from '@/databases/queries/scripts';
import socket from '@/lib/socket';
import { _getDrugsLibraryItems } from '@/databases/queries/drugs-library';
import { _removeDrugLibraryItemsReferences } from './_remove-items-references';

export type DeleteDrugsLibraryItemsData = {
    itemsIds: string[];
    broadcastAction?: boolean;
    userId?: string;
};

export type DeleteDrugsLibraryItemsResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _deleteAllDrugsLibraryItemsDrafts(opts?: {
    userId?: string | null;
}): Promise<boolean> {
    try {
        await db.delete(drugsLibraryDrafts).where(!opts?.userId ? undefined : eq(drugsLibraryDrafts.createdByUserId, opts.userId));
        return true;
    } catch(e: any) {
        throw e;
    }
}

export async function _deleteDrugsLibraryItems(
    { itemsIds: itemsIdsParam, broadcastAction, userId, }: DeleteDrugsLibraryItemsData,
) {
    const response: DeleteDrugsLibraryItemsResponse = { success: false, };

    try {
        const itemsIds = itemsIdsParam || [];

        if (itemsIds.length) {
            const drugsLibraryItems = await _getDrugsLibraryItems({ itemsIds, returnDraftsIfExist: true, });

            // delete drafts
            await db.delete(drugsLibraryDrafts).where(inArray(drugsLibraryDrafts.itemDraftId, itemsIds));

            const pendingDeletionInsertData = drugsLibraryItems.data.filter(s => !s.isDraft).map(s => ({
                drugsLibraryItemId: s.itemId,
                createdByUserId: userId,
            }));
            
            if (pendingDeletionInsertData.length) await db.insert(pendingDeletion).values(pendingDeletionInsertData);

            await _removeDrugLibraryItemsReferences({ keys: drugsLibraryItems.data.map(d => d.key), userId, });
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
