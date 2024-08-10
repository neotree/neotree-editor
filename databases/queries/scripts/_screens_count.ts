import { and, count, inArray, isNotNull, isNull } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { screens, screensDrafts, pendingDeletion, } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type CountScreensParams = {
    scriptsIds?: string[];
    types?: (typeof screens.$inferInsert)['type'][];
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
    const { scriptsIds = [], types = [], } = { ...opts };
    try {
        const whereScreensScriptsIds = !scriptsIds.length ? undefined : inArray(screens.scriptId, scriptsIds);
        const whereScreensDraftsScriptsIds = !scriptsIds.length ? undefined : inArray(screensDrafts.scriptId, scriptsIds);

        const whereScreensTypes = !types.length ? undefined : inArray(screens.type, types);
        const whereScreensDraftsTypes = !types.length ? undefined : inArray(screensDrafts.type, types);

        const [{ count: allDrafts }] = await db.select({ count: count(), }).from(screensDrafts).where(and(
            whereScreensDraftsScriptsIds,
            whereScreensDraftsTypes,
        ));
        const [{ count: newDrafts }] = await db.select({ count: count(), }).from(screensDrafts).where(
            and(
                whereScreensDraftsScriptsIds, 
                whereScreensDraftsTypes, 
                isNull(screensDrafts.screenId),
            )
        );
        const [{ count: publishedWithDrafts }] = await db.select({ count: count(), }).from(screensDrafts).where(
            and(
                whereScreensDraftsScriptsIds, 
                whereScreensDraftsTypes, 
                isNotNull(screensDrafts.screenId),
            )
        );
        const [{ count: _pendingDeletion }] = await db.select({ count: count(), }).from(pendingDeletion).where(
            and(
                whereScreensScriptsIds, 
                isNotNull(pendingDeletion.screenId),
                whereScreensTypes,
            )
        );
        const [{ count: allPublished }] = await db.select({ count: count(), }).from(screens).where(and(
            whereScreensScriptsIds,
            whereScreensTypes,
        ));

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
