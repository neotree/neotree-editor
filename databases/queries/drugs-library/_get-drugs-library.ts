import { and, eq, inArray, isNull, notInArray, or } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { drugsLibrary, drugsLibraryDrafts, pendingDeletion, } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { Preferences } from "@/types";

export type GetDrugsLibraryItemsParams = {
    itemsIds?: string[];
    keys?: string[];
    returnDraftsIfExist?: boolean;
    withDeleted?: boolean;
};

export type GetDrugsLibraryItemsResults = {
    data: (typeof drugsLibrary.$inferSelect & {
        isDraft: boolean;
        isDeleted: boolean;
        preferences: Preferences;
    })[];
    errors?: string[];
};

export async function _getDrugsLibraryItems(
    params?: GetDrugsLibraryItemsParams
): Promise<GetDrugsLibraryItemsResults> {
    try {
        const { itemsIds: _itemsIds, keys: _keys, returnDraftsIfExist, } = { ...params };

        let itemsIds = (_itemsIds || []).map(id => uuid.validate(id) ? id : uuid.v4());
        let keys = _keys || [];
        
        // unpublished drugsLibrary conditions
        const whereDrugsLibraryItemsDraftsKeys = !keys?.length ? 
            undefined 
            : 
            inArray(drugsLibraryDrafts.key, keys);
        const whereDrugsLibraryItemsDraftsIds = !itemsIds?.length ? 
            undefined 
            : 
            inArray(drugsLibraryDrafts.itemDraftId, itemsIds);
        const whereDrugsLibraryItemsDrafts = [
            ...(!whereDrugsLibraryItemsDraftsKeys ? [] : [whereDrugsLibraryItemsDraftsKeys]),
            ...(!whereDrugsLibraryItemsDraftsIds ? [] : [whereDrugsLibraryItemsDraftsIds]),
        ];

        const drafts = !returnDraftsIfExist ? [] : await db.query.drugsLibraryDrafts.findMany({
            where: and(...whereDrugsLibraryItemsDrafts),
        });

        const itemDraftsIds = drafts.map(d => d.itemDraftId);
        itemsIds = itemsIds.map(id => itemDraftsIds.includes(id) ? uuid.v4() : id);
        keys = keys.map(key => drafts.map(d => d.key).includes(key) ? uuid.v4() : key);

        // published drugsLibrary conditions
        const whereDrugsLibraryItemsKeys = !keys?.length ? 
            undefined 
            : 
            inArray(drugsLibrary.key, keys);
        
            const whereDrugsLibraryItemsIds = !itemsIds?.length ? 
            undefined 
            : 
            inArray(drugsLibrary.itemId, itemsIds);

        const whereDrugsLibraryItems = [
            isNull(drugsLibrary.deletedAt),
            isNull(pendingDeletion),
            whereDrugsLibraryItemsIds,
            whereDrugsLibraryItemsKeys,
            !itemDraftsIds.length ? undefined : notInArray(drugsLibrary.itemId, itemDraftsIds),
        ];

        const publishedRes = await db
            .select({
                drugsLibraryItem: drugsLibrary,
                pendingDeletion: pendingDeletion,
            })
            .from(drugsLibrary)
            .leftJoin(pendingDeletion, eq(pendingDeletion.drugsLibraryItemId, drugsLibrary.itemId))
            .where(!whereDrugsLibraryItems.length ? undefined : and(...whereDrugsLibraryItems));

        const published = publishedRes.map(s => s.drugsLibraryItem);

        const inPendingDeletion = !published.length ? [] : await db.query.pendingDeletion.findMany({
            where: inArray(pendingDeletion.drugsLibraryItemId, published.map(s => s.itemId)),
            columns: { drugsLibraryItemId: true, },
        });

        const responseData = [
            ...published.map(s => ({
                ...s,
                isDraft: false,
                isDeleted: false,
            } as GetDrugsLibraryItemsResults['data'][0])),

            ...drafts.map((s => ({
                ...s.data,
                isDraft: true,
                isDeleted: false,
            } as GetDrugsLibraryItemsResults['data'][0])))
        ]
            .sort((a, b) => a.position - b.position)
            .filter(s => !inPendingDeletion.map(s => s.drugsLibraryItemId).includes(s.itemId));

        return  { 
            data: responseData,
        };
    } catch(e: any) {
        logger.error('_getDrugsLibraryItems ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}

export type GetDrugsLibraryItemResults = {
    data?: null | typeof drugsLibrary.$inferSelect & {
        isDraft: boolean;
        isDeleted: boolean;
    };
    errors?: string[];
};

export async function _getDrugsLibraryItem(
    params: {
        itemId: string,
        returnDraftIfExists?: boolean;
    },
): Promise<GetDrugsLibraryItemResults> {
    const { itemId, returnDraftIfExists, } = { ...params };

    try {
        if (!itemId) throw new Error('Missing itemId');

        const whereDrugsLibraryItemId = uuid.validate(itemId) ? eq(drugsLibrary.itemId, itemId) : undefined;
        const whereDrugsLibraryItemDraftId = !whereDrugsLibraryItemId ? undefined : eq(drugsLibraryDrafts.itemDraftId, itemId);

        let draft = (returnDraftIfExists && whereDrugsLibraryItemDraftId) ? await db.query.drugsLibraryDrafts.findFirst({
            where: whereDrugsLibraryItemId,
        }) : undefined;

        let responseData = !draft ? null : {
            ...draft.data,
            isDraft: false,
            isDeleted: false,
        } as GetDrugsLibraryItemResults['data'];

        if (responseData) return { data: responseData, };

        const published = await db.query.drugsLibrary.findFirst({
            where: and(
                isNull(drugsLibrary.deletedAt),
            ),
            with: {
                draft: true,
            },
        });

        draft = returnDraftIfExists ? published?.draft : undefined;

        const data = (draft?.data || published) as GetDrugsLibraryItemResults['data'];

        responseData = !data ? null : {
            ...data,
            isDraft: false,
            isDeleted: false,
        };

        if (!responseData) return { data: null, };

        return  { 
            data: responseData, 
        };
    } catch(e: any) {
        logger.error('_getDrugsLibraryItem ERROR', e.message);
        return { errors: [e.message], };
    }
} 
