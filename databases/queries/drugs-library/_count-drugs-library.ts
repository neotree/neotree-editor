import { and, count, eq, isNotNull, isNull } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { drugsLibrary, drugsLibraryDrafts, pendingDeletion, } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type CountDrugsLibraryItemsResults = {
    data: {
        allPublished: number;
        publishedWithDrafts: number;
        allDrafts: number;
        newDrafts: number;
        pendingDeletion: number;
    };
    errors?: string[];
};

export const _defaultDrugsLibraryItemsCount = {
    allPublished: 0,
    publishedWithDrafts: 0,
    allDrafts: 0,
    newDrafts: 0,
    pendingDeletion: 0,
} satisfies CountDrugsLibraryItemsResults['data'];

export async function _countDrugsLibraryItems(): Promise<CountDrugsLibraryItemsResults> {
    try {
        const [{ count: allDrafts }] = await db.select({ count: count(), }).from(drugsLibraryDrafts);
        const [{ count: newDrafts }] = await db.select({ count: count(), }).from(drugsLibraryDrafts).where(isNull(drugsLibraryDrafts.itemId));
        const [{ count: publishedWithDrafts }] = await db.select({ count: count(), }).from(drugsLibraryDrafts).where(isNotNull(drugsLibraryDrafts.itemId));
        const [{ count: _pendingDeletion }] = await db.select({ count: count(), }).from(pendingDeletion).where(isNotNull(pendingDeletion.drugsLibraryItemId));
        const [{ count: allPublished }] = await db.select({ count: count(), }).from(drugsLibrary);

        return  { 
            data: {
                allPublished,
                publishedWithDrafts,
                allDrafts,
                newDrafts,
                pendingDeletion: _pendingDeletion,
            },
        };
    } catch(e: any) {
        logger.error('_getDrugsLibraryItems ERROR', e.message);
        return { 
            data: _defaultDrugsLibraryItemsCount, 
            errors: [e.message], 
        };
    }
}
