import { eq, inArray } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { drugsLibraryDrafts, pendingDeletion, } from '@/databases/pg/schema';
import { _getScreens } from '@/databases/queries/scripts';
import socket from '@/lib/socket';
import { _getDrugsLibraryItems } from '@/databases/queries/drugs-library';
import { _saveScreens } from '@/databases/mutations/scripts';

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
        const itemsIds = itemsIdsParam || [];

        if (itemsIds.length) {
            const drugsLibraryItems = await _getDrugsLibraryItems({ itemsIds, returnDraftsIfExist: true, });

            // delete drafts
            await db.delete(drugsLibraryDrafts).where(inArray(drugsLibraryDrafts.itemDraftId, itemsIds));

            const pendingDeletionInsertData = drugsLibraryItems.data.filter(s => !s.isDraft).map(s => ({
                drugsLibraryItemId: s.itemId,
            }));
            if (pendingDeletionInsertData.length) await db.insert(pendingDeletion).values(pendingDeletionInsertData);

            const screens = await _getScreens({
                types: ['drugs', 'fluids', 'feeds'],
                returnDraftsIfExist: true,
            });

            const updated: typeof screens.data = [];
            screens.data.forEach(screen => {
                const keys = drugsLibraryItems.data.map(d => d.key);

                const drugs = screen.drugs.filter(d => !keys.includes(d.key));
                const fluids = screen.fluids.filter(d => !keys.includes(d.key));
                const feeds = screen.feeds.filter(d => !keys.includes(d.key));

                if (drugs.length !== screen.drugs.length) updated.push({ ...screen, drugs });
                if (fluids.length !== screen.fluids.length) updated.push({ ...screen, fluids });
                if (feeds.length !== screen.feeds.length) updated.push({ ...screen, feeds });
            });

            if (updated.length) await _saveScreens({ data: updated, });
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
