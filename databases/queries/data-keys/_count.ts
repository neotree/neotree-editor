import { and, count, eq, isNotNull, isNull } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { dataKeys, dataKeysDrafts, pendingDeletion, } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type CountDataKeysResults = {
    data: {
        allPublished: number;
        publishedWithDrafts: number;
        allDrafts: number;
        newDrafts: number;
        pendingDeletion: number;
    };
    errors?: string[];
};

export const _defaultDataKeysCount = {
    allPublished: 0,
    publishedWithDrafts: 0,
    allDrafts: 0,
    newDrafts: 0,
    pendingDeletion: 0,
} satisfies CountDataKeysResults['data'];

export async function _countDataKeys(): Promise<CountDataKeysResults> {
    try {
        const [{ count: allDrafts }] = await db.select({ count: count(), }).from(dataKeysDrafts);
        const [{ count: newDrafts }] = await db.select({ count: count(), }).from(dataKeysDrafts).where(isNull(dataKeysDrafts.dataKeyId));
        const [{ count: publishedWithDrafts }] = await db.select({ count: count(), }).from(dataKeysDrafts).where(isNotNull(dataKeysDrafts.dataKeyId));
        const [{ count: _pendingDeletion }] = await db.select({ count: count(), }).from(pendingDeletion).where(isNotNull(pendingDeletion.dataKeyId));
        const [{ count: allPublished }] = await db.select({ count: count(), }).from(dataKeys);

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
        logger.error('_getDataKeys ERROR', e.message);
        return { 
            data: _defaultDataKeysCount, 
            errors: [e.message], 
        };
    }
}
