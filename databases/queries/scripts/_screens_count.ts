import { and, count, inArray, isNotNull, isNull } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { screens, screensDrafts, pendingDeletion, } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type CountScreensParams = {
    scriptsIds?: string[];
};

export type CountScreensResults = {
    data: {
        allPublished: number;
        publishedWithDrafts: number;
        allDrafts: number;
        newDrafts: number;
        pendingDeletion: number;
    };
    errors?: string[];
};

export const _defaultScreensCount = {
    allPublished: 0,
    publishedWithDrafts: 0,
    allDrafts: 0,
    newDrafts: 0,
    pendingDeletion: 0,
} satisfies CountScreensResults['data'];

export async function _countScreens(opts?: CountScreensParams): Promise<CountScreensResults> {
    const { scriptsIds = [], } = { ...opts };
    try {
        const whereScreensScriptsIds = !scriptsIds.length ? undefined : inArray(screens.scriptId, scriptsIds);
        const whereScreensDraftsScriptsIds = !scriptsIds.length ? undefined : inArray(screensDrafts.scriptId, scriptsIds);

        const [{ count: allDrafts }] = await db.select({ count: count(), }).from(screensDrafts).where(whereScreensDraftsScriptsIds);
        const [{ count: newDrafts }] = await db.select({ count: count(), }).from(screensDrafts).where(
            and(whereScreensDraftsScriptsIds, isNull(screensDrafts.screenId))
        );
        const [{ count: publishedWithDrafts }] = await db.select({ count: count(), }).from(screensDrafts).where(
            and(whereScreensDraftsScriptsIds, isNotNull(screensDrafts.screenId))
        );
        const [{ count: _pendingDeletion }] = await db.select({ count: count(), }).from(pendingDeletion).where(
            and(whereScreensScriptsIds, isNotNull(pendingDeletion.screenId))
        );
        const [{ count: allPublished }] = await db.select({ count: count(), }).from(screens).where(whereScreensScriptsIds);

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
        logger.error('_getScreens ERROR', e.message);
        return { 
            data: _defaultScreensCount, 
            errors: [e.message], 
        };
    }
}
