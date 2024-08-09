import { and, eq, inArray, isNull, notInArray, or } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { screens, screensDrafts, pendingDeletion, } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type GetScreensParams = {
    screensIds?: string[];
    scriptsIds?: string[];
    returnDraftsIfExist?: boolean;
};

export type GetScreensResults = {
    data: (typeof screens.$inferSelect & {
        isDraft: boolean;
    })[];
    errors?: string[];
};

export async function _getScreens(
    params?: GetScreensParams
): Promise<GetScreensResults> {
    try {
        const { 
            scriptsIds: _scriptsIds = [],
            screensIds: _screensIds, 
            returnDraftsIfExist, 
        } = { ...params };

        let screensIds = _screensIds || [];
        const scriptsIds = _scriptsIds.filter(s => uuid.validate(s));
        const oldScriptsIds = _scriptsIds.filter(s => !uuid.validate(s));
        
        // unpublished screens conditions
        const whereScreensDraftsScriptsIds = !scriptsIds?.length ? undefined : inArray(screensDrafts.scriptId, scriptsIds);
        const whereScreensDraftsIds = !screensIds?.length ? 
            undefined 
            : 
            inArray(screensDrafts.screenDraftId, screensIds.map(id => uuid.validate(id) ? id : uuid.v4()));
        const whereScreensDrafts = [
            whereScreensDraftsScriptsIds,
            whereScreensDraftsIds,
        ];
        const drafts = !returnDraftsIfExist ? [] : await db.query.screensDrafts.findMany({
            where: and(...whereScreensDrafts),
        });
        screensIds = screensIds.filter(id => !drafts.map(d => d.screenDraftId).includes(id));

        // published screens conditions
        const whereScreensScriptsIds = !scriptsIds?.length ? undefined : inArray(screens.scriptId, scriptsIds);
        const whereScreensOldScriptsIds = !oldScriptsIds?.length ? undefined : inArray(screens.oldScriptId, oldScriptsIds);
        const whereScreensIdsNotIn = !drafts.length ? undefined : notInArray(screens.screenId, drafts.map(d => d.screenDraftId));
        const whereScreensIds = !screensIds?.length ? 
            undefined 
            : 
            inArray(screens.screenId, screensIds.filter(id => uuid.validate(id)));
        const whereOldScreensIds = !screensIds?.length ? 
            undefined 
            : 
            inArray(screens.oldScreenId, screensIds.filter(id => !uuid.validate(id)));
        const whereScreens = [
            isNull(screens.deletedAt),
            isNull(pendingDeletion),
            whereScreensScriptsIds,
            whereScreensOldScriptsIds,
            ...((!whereScreensIds || !whereOldScreensIds) ? [] : [or(whereScreensIds, whereOldScreensIds)]),
            whereScreensIdsNotIn,
        ];

        const publishedRes = await db
            .select({
                screen: screens,
                pendingDeletion: pendingDeletion,
            })
            .from(screens)
            .leftJoin(pendingDeletion, eq(pendingDeletion.screenId, screens.screenId))
            .where(!whereScreens.length ? undefined : and(...whereScreens));

        const published = publishedRes.map(s => s.screen);

        const inPendingDeletion = !published.length ? [] : await db.query.pendingDeletion.findMany({
            where: inArray(pendingDeletion.screenId, published.map(s => s.screenId)),
            columns: { screenId: true, },
        });

        const responseData = [
            ...published.map(s => ({
                ...s,
                isDraft: false,
            } as GetScreensResults['data'][0])),

            ...drafts.map((s => ({
                ...s.data,
                isDraft: true,
            } as GetScreensResults['data'][0])))
        ]
            .sort((a, b) => a.position - b.position)
            .filter(s => !inPendingDeletion.map(s => s.screenId).includes(s.screenId));

        return  { 
            data: responseData,
        };
    } catch(e: any) {
        logger.error('_getScreens ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}

export type GetScreenResults = {
    data?: null | typeof screens.$inferSelect & {
        isDraft: boolean;
    };
    errors?: string[];
};

export async function _getScreen(
    params: {
        screenId: string,
        returnDraftIfExists?: boolean;
    },
): Promise<GetScreenResults> {
    const { screenId, returnDraftIfExists, } = { ...params };

    try {
        if (!screenId) throw new Error('Missing screenId');

        const whereScreenId = uuid.validate(screenId) ? eq(screens.screenId, screenId) : undefined;
        const whereOldScreenId = !uuid.validate(screenId) ? eq(screens.oldScreenId, screenId) : undefined;
        const whereScreenDraftId = !whereScreenId ? undefined : eq(screensDrafts.screenDraftId, screenId);

        let draft = (returnDraftIfExists && whereScreenDraftId) ? await db.query.screensDrafts.findFirst({
            where: whereScreenId,
        }) : undefined;

        let responseData = !draft ? null : {
            ...draft.data,
            isDraft: false,
        } as GetScreenResults['data'];

        if (responseData) return { data: responseData, };

        const publishedRes = await db
            .select({
                screen: screens,
                pendingDeletion,
                draft: screensDrafts,
            })
            .from(screens)
            .leftJoin(pendingDeletion, eq(pendingDeletion.screenId, screens.screenId))
            .leftJoin(screensDrafts, eq(screensDrafts.screenId, screensDrafts.screenId))
            .where(and(
                isNull(screens.deletedAt),
                isNull(pendingDeletion),
                whereScreenId || whereOldScreenId,
            ));

        const published = !publishedRes[0] ? null : {
            ...publishedRes[0].screen,
            draft: publishedRes[0].draft || undefined,
        };

        draft = returnDraftIfExists ? published?.draft : undefined;

        const data = (draft?.data || published) as GetScreenResults['data'];

        responseData = !data ? null : {
            ...data,
            isDraft: false,
        };

        if (!responseData) return { data: null, };

        return  { 
            data: responseData, 
        };
    } catch(e: any) {
        logger.error('_getScreen ERROR', e.message);
        return { errors: [e.message], };
    }
} 
