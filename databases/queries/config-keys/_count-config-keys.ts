import { and, count, eq, isNotNull, isNull } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { configKeys, configKeysDrafts, pendingDeletion, } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type CountConfigKeysResults = {
    data: {
        allPublished: number;
        publishedWithDrafts: number;
        allDrafts: number;
        newDrafts: number;
        pendingDeletion: number;
    };
    errors?: string[];
};

export const _defaultConfigKeysCount = {
    allPublished: 0,
    publishedWithDrafts: 0,
    allDrafts: 0,
    newDrafts: 0,
    pendingDeletion: 0,
} satisfies CountConfigKeysResults['data'];

export async function _countConfigKeys(): Promise<CountConfigKeysResults> {
    try {
        const [{ count: allDrafts }] = await db.select({ count: count(), }).from(configKeysDrafts);
        const [{ count: newDrafts }] = await db.select({ count: count(), }).from(configKeysDrafts).where(isNull(configKeysDrafts.configKeyId));
        const [{ count: publishedWithDrafts }] = await db.select({ count: count(), }).from(configKeysDrafts).where(isNotNull(configKeysDrafts.configKeyId));
        const [{ count: _pendingDeletion }] = await db.select({ count: count(), }).from(pendingDeletion).where(isNotNull(pendingDeletion.configKeyId));
        const [{ count: allPublished }] = await db.select({ count: count(), }).from(configKeys);

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
        logger.error('_getConfigKeys ERROR', e.message);
        return { 
            data: _defaultConfigKeysCount, 
            errors: [e.message], 
        };
    }
}
