import { desc, eq } from 'drizzle-orm';
import * as uuid from 'uuid';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { drugsLibrary, drugsLibraryDrafts } from '@/databases/pg/schema';
import socket from '@/lib/socket';

export type SaveDrugsLibraryItemsData = Partial<typeof drugsLibrary.$inferSelect>;

export type SaveDrugsLibraryItemsResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _saveDrugsLibraryItems({ data, broadcastAction, }: {
    data: SaveDrugsLibraryItemsData[],
    broadcastAction?: boolean,
}) {
    const response: SaveDrugsLibraryItemsResponse = { success: false, };

    try {
        const errors = [];

        let index = 0;
        for (const { itemId: _itemId, ...item } of data) {
            try {
                index++;

                const itemId = _itemId || uuid.v4();

                if (!errors.length) {
                    const draft = !_itemId ? null : await db.query.drugsLibraryDrafts.findFirst({
                        where: eq(drugsLibraryDrafts.itemDraftId, itemId),
                    });

                    const published = (draft || !_itemId) ? null : await db.query.drugsLibrary.findFirst({
                        where: eq(drugsLibrary.itemId, itemId),
                    });

                    if (draft) {
                        const data = {
                            ...draft.data,
                            ...item,
                        };
                        
                        await db
                            .update(drugsLibraryDrafts)
                            .set({
                                data,
                                position: data.position,
                            }).where(eq(drugsLibraryDrafts.itemDraftId, itemId));
                    } else {
                        let position = item.position || published?.position;
                        if (!position) {
                            const confKey = await db.query.drugsLibrary.findFirst({
                                columns: { position: true, },
                                orderBy: desc(drugsLibrary.position),
                            });

                            const confKeyDraft = await db.query.drugsLibraryDrafts.findFirst({
                                columns: { position: true, },
                                orderBy: desc(drugsLibraryDrafts.position),
                            });

                            position = Math.max(0, confKey?.position || 0, confKeyDraft?.position || 0) + 1;
                        }

                        const data = {
                            ...published,
                            ...item,
                            itemId,
                            version: published?.version ? (published.version + 1) : 1,
                            position,
                        } as typeof drugsLibrary.$inferInsert;

                        await db.insert(drugsLibraryDrafts).values({
                            data,
                            itemDraftId: itemId,
                            position: data.position,
                            itemId: published?.itemId,
                            key: data.key,
                        });
                    }
                }
            } catch(e: any) {
                errors.push(e.message);
            }
        }

        if (errors.length) {
            response.errors = errors;
        } else {
            response.success = true;
        }
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_saveDrugsLibraryItems ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction) socket.emit('data_changed', 'save_drugs_library_items');
        return response;
    }
}
