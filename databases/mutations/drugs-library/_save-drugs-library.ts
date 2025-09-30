import { count, desc, eq } from 'drizzle-orm';
import * as uuid from 'uuid';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { drugsLibrary, drugsLibraryDrafts } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { _getDrugsLibraryItems } from '@/databases/queries/drugs-library';
import { _saveScreens } from '@/databases/mutations/scripts';
import { _getScreens } from '@/databases/queries/scripts';
import { _removeDrugLibraryItemsReferences } from './_remove-items-references';

export type SaveDrugsLibraryItemsData = Partial<typeof drugsLibrary.$inferSelect>;

export type SaveDrugsLibraryItemsResponse = { 
    success: boolean; 
    errors?: string[]; 
};

const getUniqueKey = async (key: string, tries = 1, ogKey = '') => {
    const [{ count: draftsCount }] = await db.select({
        count: count(),
    }).from(drugsLibraryDrafts).where(eq(drugsLibraryDrafts.key, key));

    const [{ count: publishedCount }] = await db.select({
        count: count(),
    }).from(drugsLibrary).where(eq(drugsLibrary.key, key));

    if (publishedCount || draftsCount) return await getUniqueKey(`${ogKey || key}-${tries + 1}`, tries + 1, ogKey || key);

    return key;
}

export async function _copyDrugsLibraryItems({ data, ...params }: {
    data: { itemId: string; }[],
    broadcastAction?: boolean;
    userId?: string;
}): Promise<SaveDrugsLibraryItemsResponse> {
    const response: SaveDrugsLibraryItemsResponse = { success: false, };

    try {
        const { data: originalItems } = await _getDrugsLibraryItems({ itemsIds: data.map(item => item.itemId), });
        const itemsToCopy: typeof originalItems = [];

        for (const item of originalItems) {
            const key = await getUniqueKey(item.key);
            itemsToCopy.push({
                ...item,
                key,
                itemId: uuid.v4(),
                position: undefined!,
                createdAt: undefined!,
                updatedAt: undefined!,
                deletedAt: undefined!,
                publishDate: undefined!,
                id: undefined!,
            });
        }

        return await _saveDrugsLibraryItems({ data: itemsToCopy, ...params, });
    } catch(e: any) {
        logger.error('_copyDrugsLibraryItems ERROR', e.message);
        return { success: false, errors: [e.message], };
    }
}

export async function _saveDrugsLibraryItemsIfKeysNotExist({ data, ...params }: {
    data: SaveDrugsLibraryItemsData[];
    broadcastAction?: boolean;
    userId?: string;
}) {
    try {
        const keys = data.map(item => item.key!).filter(key => key);
        
        if (keys.length) {
            const existing = await _getDrugsLibraryItems({ keys });

            data = data
                .filter(item => !existing.data.map(d => d.key).includes(item.key!))
                .map(item => ({
                    ...item,
                    itemId: undefined,
                    createdAt: undefined,
                    updatedAt: undefined,
                    deletedAt: undefined,
                    publishDate: undefined,
                    id: undefined,
                    position: undefined,
                    version: undefined,
                }));

            if (data.length) return await _saveDrugsLibraryItems({ data, ...params, });
        }

        return { success: true, };
    } catch(e: any) {
        logger.error('_saveDrugsLibraryItemsIfKeysNotExist ERROR', e.message);
        return { errors: [e.message], success: false, };
    } 
}

export async function _saveDrugsLibraryItemsUpdateIfExists({ data, ...params }: {
    data: SaveDrugsLibraryItemsData[];
    broadcastAction?: boolean;
    userId?: string;
}) {
    try {
        const keys = data.map(item => item.key!).filter(key => key);
        
        if (keys.length) {
            const existing = await _getDrugsLibraryItems({ keys });

            data = data.map(item => {
                const found = existing.data.find(k => `${k.key}`.toLowerCase() === `${item.key}`.toLowerCase());
                return {
                    ...item,
                    itemId: found?.itemId || item.itemId,
                    createdAt: found?.createdAt || item.createdAt,
                    updatedAt: found?.updatedAt || item.updatedAt,
                    deletedAt: found?.deletedAt || item.deletedAt,
                    publishDate: found?.publishDate || item.publishDate,
                    id: found?.id || item.id,
                    position: found?.position || item.position,
                    version: found?.version || item.version,
                };
            });

            if (data.length) return await _saveDrugsLibraryItems({ data, ...params, });
        }

        return { success: true, };
    } catch(e: any) {
        logger.error('_saveDrugsLibraryItemsAndUpdateIfExists ERROR', e.message);
        return { errors: [e.message], success: false, };
    } 
}

export async function _saveDrugsLibraryItems({ data, broadcastAction, userId, }: {
    data: SaveDrugsLibraryItemsData[],
    broadcastAction?: boolean,
    userId?: string;
}) {
    const response: SaveDrugsLibraryItemsResponse = { success: false, };

    try {
        const errors = [];
        const keys: { old: string; new: string; }[] = [];
        const removeReferences: string[] = [];

        let index = 0;
        for (const { itemId: _itemId, ...item } of data) {
            try {
                index++;

                const itemId = _itemId || uuid.v4();
                let oldKey = '';
                let newKey = item.key || '';

                let oldType: null | typeof drugsLibrary.$inferSelect['type'] = null;
                let newType: null | typeof drugsLibrary.$inferSelect['type'] = item.type || null;

                if (!errors.length) {
                    const draft = !_itemId ? null : await db.query.drugsLibraryDrafts.findFirst({
                        where: eq(drugsLibraryDrafts.itemDraftId, itemId),
                    });

                    const published = (draft || !_itemId) ? null : await db.query.drugsLibrary.findFirst({
                        where: eq(drugsLibrary.itemId, itemId),
                    });

                    if (draft) {
                        oldKey = draft.data.key;
                        oldType = draft.data.type || null;

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
                        oldKey = published?.key || '';
                        oldType = published?.type || null!;

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
                            type: data.type,
                            createdByUserId: userId,
                        });
                    }

                    if (oldKey && newKey && (oldKey !== newKey)) keys.push({ old: oldKey, new: newKey, });
                    if (oldType && newType && (oldType !== newType)) {
                        if (oldKey) removeReferences.push(oldKey);
                        // if (newKey) removeReferences.push(newKey);
                    }
                }
            } catch(e: any) {
                errors.push(e.message);
            }
        }

        if (removeReferences.length) await _removeDrugLibraryItemsReferences({ keys: removeReferences, userId, });

        if (keys.length) {
            const screens = await _getScreens({
                types: ['drugs', 'fluids', 'feeds'],
                returnDraftsIfExist: true,
            });

            const updatedScreens: typeof screens.data = [];
            screens.data.forEach(screen => {
                let isUpdated = false;

                const drugs = screen.drugs.map(d => {
                    if (keys.map(key => key.old).includes(d.key)) {
                        const key = keys.filter(key => key.old === d.key).map(key => key.new)[0];
                        d = { ...d, key };
                        isUpdated = true;
                    }
                    return d;
                });

                const fluids = screen.fluids.map(d => {
                    if (keys.map(key => key.old).includes(d.key)) {
                        const key = keys.filter(key => key.old === d.key).map(key => key.new)[0];
                        d = { ...d, key };
                        isUpdated = true;
                    }
                    return d;
                });

                const feeds = screen.feeds.map(d => {
                    if (keys.map(key => key.old).includes(d.key)) {
                        const key = keys.filter(key => key.old === d.key).map(key => key.new)[0];
                        d = { ...d, key };
                        isUpdated = true;
                    }
                    return d;
                });
                
                if (isUpdated) updatedScreens.push({ ...screen, drugs, fluids, feeds, });
            });

            if (updatedScreens.length) await _saveScreens({ data: updatedScreens, userId, });
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
