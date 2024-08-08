import { and, count, eq, isNotNull, isNull } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { scripts, scriptsDrafts, pendingDeletion, } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type CountScriptsResults = {
    data: {
        allPublished: number;
        publishedWithDrafts: number;
        allDrafts: number;
        newDrafts: number;
        pendingDeletion: number;
    };
    errors?: string[];
};

export const _defaultScriptsCount = {
    allPublished: 0,
    publishedWithDrafts: 0,
    allDrafts: 0,
    newDrafts: 0,
    pendingDeletion: 0,
} satisfies CountScriptsResults['data'];

export async function _countScripts(): Promise<CountScriptsResults> {
    try {
        const [{ count: allDrafts }] = await db.select({ count: count(), }).from(scriptsDrafts);
        const [{ count: newDrafts }] = await db.select({ count: count(), }).from(scriptsDrafts).where(isNull(scriptsDrafts.scriptId));
        const [{ count: publishedWithDrafts }] = await db.select({ count: count(), }).from(scriptsDrafts).where(isNotNull(scriptsDrafts.scriptId));
        const [{ count: _pendingDeletion }] = await db.select({ count: count(), }).from(pendingDeletion).where(isNotNull(pendingDeletion.scriptId));
        const [{ count: allPublished }] = await db.select({ count: count(), }).from(scripts);

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
        logger.error('_getScripts ERROR', e.message);
        return { 
            data: _defaultScriptsCount, 
            errors: [e.message], 
        };
    }
}
