import { and, eq, inArray, isNotNull, isNull, or } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { screens, screensDrafts, pendingDeletion, scripts, hospitals } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { DrugField, ScriptField, ScriptItem, ScriptImage, Preferences } from "@/types";

export type GetScreensParams = {
    screensIds?: string[];
    scriptsIds?: string[];
    returnDraftsIfExist?: boolean;
    withDeleted?: boolean;
    withImagesOnly?: boolean;
    types?: (typeof screens.$inferSelect)['type'][];
};

export type ScreenType = typeof screens.$inferSelect & {
    isDraft: boolean;
    isDeleted: boolean;
    fields: ScriptField[];
    items: ScriptItem[];
    drugs: DrugField[];
    fluids: DrugField[];
    feeds: DrugField[];
    prePopulate: string[];
    preferences: Preferences;
    image1: null | ScriptImage;
    image2: null | ScriptImage;
    image3: null | ScriptImage;
    scriptTitle?: string;
    hospitalName?: string;
};

export type GetScreensResults = {
    data: ScreenType[];
    errors?: string[];
};

export async function _getScreens(
    params?: GetScreensParams
): Promise<GetScreensResults> {
    try {
        let { 
            scriptsIds: scriptsIds = [],
            screensIds: screensIds = [], 
            types = [],
            returnDraftsIfExist, 
            withImagesOnly,
        } = { ...params };

        const oldScreensIds = screensIds.filter(s => !uuid.validate(s));
        screensIds = screensIds.filter(s => uuid.validate(s));

        if (oldScreensIds.length) {
            const res = await db.query.screens.findMany({
                where: inArray(screens.oldScreenId, oldScreensIds),
                columns: { screenId: true, oldScreenId: true, },
            });
            oldScreensIds.forEach(oldScreenId => {
                const s = res.filter(s => s.oldScreenId === oldScreenId)[0];
                screensIds.push(s?.screenId || uuid.v4());
            });
        }

        scriptsIds = scriptsIds.filter(s => uuid.validate(s));
        const _oldScriptsIds = scriptsIds.filter(s => !uuid.validate(s));

        if (_oldScriptsIds.length) {
            const res = await db.query.scripts.findMany({
                where: inArray(scripts.oldScriptId, _oldScriptsIds),
                columns: { scriptId: true, oldScriptId: true, },
            });
            _oldScriptsIds.forEach(oldScriptId => {
                const s = res.filter(s => s.oldScriptId === oldScriptId)[0];
                scriptsIds.push(s?.scriptId || uuid.v4());
            });
        }
        
        // unpublished screens conditions
        const drafts = !returnDraftsIfExist ? [] : await db.query.screensDrafts.findMany({
            where: and(
                !scriptsIds?.length ? undefined : or(
                    inArray(screensDrafts.scriptId, scriptsIds),
                    inArray(screensDrafts.scriptDraftId, scriptsIds)
                ),
                !screensIds?.length ? undefined : inArray(screensDrafts.screenDraftId, screensIds),
                !types?.length ? undefined : inArray(screensDrafts.type, types)
            ),
        });

        // published screens conditions
        const publishedRes = await db
            .select({
                screen: screens,
                pendingDeletion: pendingDeletion,
                script: {
                    title: scripts.title,
                    hospitalId: scripts.hospitalId,
                },
                hospital: {
                    name: hospitals.name,
                },
            })
            .from(screens)
            .leftJoin(pendingDeletion, eq(pendingDeletion.screenId, screens.screenId))
            .leftJoin(screensDrafts, eq(screensDrafts.screenId, screens.screenId))
            .leftJoin(scripts, eq(scripts.scriptId, screens.scriptId))
            .leftJoin(hospitals, and(
                eq(scripts.scriptId, screens.scriptId),
                eq(scripts.hospitalId, hospitals.hospitalId)
            ))
            .where(and(
                isNull(screens.deletedAt),
                isNull(pendingDeletion),
                !returnDraftsIfExist ? undefined : isNull(screensDrafts.screenId),
                !scriptsIds?.length ? undefined : inArray(screens.scriptId, scriptsIds),
                !screensIds?.length ? undefined : inArray(screens.screenId, screensIds),
                !types?.length ? undefined : inArray(screens.type, types),
                !withImagesOnly ? undefined : or(
                    isNotNull(screens.image1),
                    isNotNull(screens.image2),
                    isNotNull(screens.image3)
                ),
            ));

        const published = publishedRes.map(s => ({
            ...s.screen,
            scriptTitle: s.script?.title || '',
            hospitalName: s.hospital?.name || '',
        }));

        const inPendingDeletion = !published.length ? [] : await db.query.pendingDeletion.findMany({
            where: inArray(pendingDeletion.screenId, published.map(s => s.screenId)),
            columns: { screenId: true, },
        });

        const responseData = [
            ...published.map(s => ({
                ...s,
                isDraft: false,
                isDeleted: false,
            } as GetScreensResults['data'][0])),

            ...drafts.map((s => ({
                ...s.data,
                isDraft: true,
                isDeleted: false,
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
    data?: null | ScreenType;
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
            where: whereScreenDraftId,
        }) : undefined;

        let responseData = !draft ? null : {
            ...draft.data,
            isDraft: false,
            isDeleted: false,
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
            .leftJoin(screensDrafts, eq(screens.screenId, screensDrafts.screenDraftId))
            .where(and(
                isNull(screens.deletedAt),
                isNull(pendingDeletion),
                or(whereScreenId, whereOldScreenId),
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
            isDeleted: false,
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

export type ListScreensResults = {
    data: {
        type: typeof screens.$inferSelect['type'];
        refId: typeof screens.$inferSelect['refId'];
        title: typeof screens.$inferSelect['title'];
        screenId: typeof screens.$inferSelect['screenId'];
        oldScreenId: typeof screens.$inferSelect['oldScreenId'];
        position: typeof screens.$inferSelect['position'];
        isDraft: boolean;
        isDeleted: boolean;
    }[];
    errors?: string[];
};

export async function _listScreens(
    params?: GetScreensParams
): Promise<ListScreensResults> {
    try {
        let { 
            scriptsIds: scriptsIds = [],
            screensIds: screensIds = [], 
            returnDraftsIfExist, 
        } = { ...params };

        const oldScreensIds = screensIds.filter(s => !uuid.validate(s));
        screensIds = screensIds.filter(s => uuid.validate(s));

        if (oldScreensIds.length) {
            const res = await db.query.screens.findMany({
                where: inArray(screens.oldScreenId, oldScreensIds),
                columns: { screenId: true, oldScreenId: true, },
            });
            oldScreensIds.forEach(oldScreenId => {
                const s = res.filter(s => s.oldScreenId === oldScreenId)[0];
                screensIds.push(s?.screenId || uuid.v4());
            });
        }

        scriptsIds = scriptsIds.filter(s => uuid.validate(s));
        const _oldScriptsIds = scriptsIds.filter(s => !uuid.validate(s));

        if (_oldScriptsIds.length) {
            const res = await db.query.scripts.findMany({
                where: inArray(scripts.oldScriptId, _oldScriptsIds),
                columns: { scriptId: true, oldScriptId: true, },
            });
            _oldScriptsIds.forEach(oldScriptId => {
                const s = res.filter(s => s.oldScriptId === oldScriptId)[0];
                scriptsIds.push(s?.scriptId || uuid.v4());
            });
        }
        
        // unpublished screens conditions
        const drafts = !returnDraftsIfExist ? [] : await db.query.screensDrafts.findMany({
            where: and(
                !scriptsIds?.length ? undefined : or(
                    inArray(screensDrafts.scriptId, scriptsIds),
                    inArray(screensDrafts.scriptDraftId, scriptsIds)
                ),
                !screensIds?.length ? undefined : inArray(screensDrafts.screenDraftId, screensIds)
            ),
        });

        // published screens conditions
        const publishedRes = await db
            .select({
                screen: {
                    title: screens.title,
                    screenId: screens.screenId,
                    oldScreenId: screens.oldScreenId,
                    position: screens.position,
                    type: screens.type,
                    refId: screens.refId,
                },
                pendingDeletion: pendingDeletion,
            })
            .from(screens)
            .leftJoin(pendingDeletion, eq(pendingDeletion.screenId, screens.screenId))
            .leftJoin(screensDrafts, eq(screensDrafts.screenId, screens.screenId))
            .where(and(
                isNull(screens.deletedAt),
                isNull(pendingDeletion),
                !returnDraftsIfExist ? undefined : isNull(screensDrafts.screenId),
                !scriptsIds?.length ? undefined : inArray(screens.scriptId, scriptsIds),
                !screensIds?.length ? undefined : inArray(screens.screenId, screensIds),
            ));

        const published = publishedRes.map(s => s.screen);

        const inPendingDeletion = !published.length ? [] : await db.query.pendingDeletion.findMany({
            where: inArray(pendingDeletion.screenId, published.map(s => s.screenId)),
            columns: { screenId: true, },
        });

        const responseData = [
            ...published.map(s => ({
                ...s,
                isDraft: false,
                isDeleted: false,
            } as ListScreensResults['data'][0])),

            ...drafts.map((s => ({
                ...s.data,
                isDraft: true,
                isDeleted: false,
            } as ListScreensResults['data'][0])))
        ]
            .sort((a, b) => a.position - b.position)
            .filter(s => !inPendingDeletion.map(s => s.screenId).includes(s.screenId))
            .map((s, i) => ({
                ...s,
                position: i + 1,
            }));

        return  { 
            data: responseData,
        };
    } catch(e: any) {
        logger.error('_listScreens ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}

