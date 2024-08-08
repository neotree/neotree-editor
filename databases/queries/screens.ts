import { eq, and, isNull, SQL, count, inArray, desc, sql, isNotNull, notInArray, or } from "drizzle-orm";
import * as uuid from 'uuid';

import { ScriptField, ScriptImage, ScriptItem } from "@/types";
import { isEmpty } from "@/lib/isEmpty";
import db from "../pg/drizzle";
import { screens, screensDrafts } from "../pg/schema";
import logger from "@/lib/logger";

export async function _listScreens(opts?: {
    screensReferences?: string[]
    scriptsReferences?: string[]
}) {
    const { screensReferences, scriptsReferences } = { ...opts };

    const results: {
        error?: string;
        data: {
            screenReference: string;
            screenId?: string | null;
            screenDraftId?: string | null;
            scriptId?: string | null;
            scriptDraftId?: string | null;
            isDraft: boolean;
            title: string;
            position: number;
        }[];
    } = {
        data: [],
    };

    try {
        const where = !screensReferences?.length ? [] : [or(
            inArray(screensDrafts.screenId, screensReferences),
            inArray(screensDrafts.screenDraftId, screensReferences),
        )];
        if (scriptsReferences?.length) {
            where.push(or(
                inArray(screensDrafts.scriptId, scriptsReferences),
                inArray(screensDrafts.scriptDraftId, scriptsReferences),
            ));
        }

        const drafts = await db.query.screensDrafts.findMany({
            where: !where.length ? undefined : and(...where),
            columns: {
                screenId: true,
                screenDraftId: true,
                scriptDraftId: true,
                scriptId: true,
                data: true,
            },
        });

        const published = await db.query.screens.findMany({
            where: and(...[
                isNull(screens.deletedAt),
                ...(!drafts.length ? [] : [notInArray(screens.screenId, drafts.map(s => s.data.screenId!))])
            ]),
            columns: {
                screenId: true,
                position: true,
                title: true,
                scriptId: true,
            },
        });

        results.data = [...results.data, ...drafts.map(s => ({
            screenReference: s.screenDraftId,
            screenId: s.screenId,
            screenDraftId: s.screenDraftId,
            scriptId: s.scriptId,
            scriptDraftId: s.scriptDraftId,
            isDraft: true,
            title: s.data.title,
            position: s.data.position,
        }))];

        results.data = [...results.data, ...published.map(s => ({
            screenReference: s.screenId,
            screenId: s.screenId,
            scriptId: s.scriptId,
            isDraft: false,
            title: s.title,
            position: s.position,
        }))].sort((a, b) => a.position - b.position);

        return results;
    } catch(e: any) {
        results.error = e.message;
        logger.error('_listScreens ERROR', e.message);
    } finally {
        return results;
    }
}

export async function _listRawScreens(opts?: {
    screensReferences?: string[];
    scriptsReferences?: string[];
}) {
    const { screensReferences, scriptsReferences } = { ...opts };

    const results: {
        error?: string;
        data: (typeof screens.$inferSelect & {
            screenReference: string;
            screenId?: string;
            screenDraftId?: string;
            scriptId?: string;
            scriptDraftId?: string;
            isDraft: boolean;
        })[];
    } = {
        data: [],
    };

    try {
        const where = !screensReferences?.length ? [] : [or(
            inArray(screensDrafts.screenId, screensReferences),
            inArray(screensDrafts.screenDraftId, screensReferences),
        )];
        if (scriptsReferences?.length) {
            where.push(or(
                inArray(screensDrafts.scriptId, scriptsReferences),
                inArray(screensDrafts.scriptDraftId, scriptsReferences),
            ));
        }

        const drafts = await db.query.screensDrafts.findMany({
            where: !where.length ? undefined : and(...where),
        });

        const published = await db.query.screens.findMany({
            where: and(...[
                isNull(screens.deletedAt),
                ...(!drafts.length ? [] : [notInArray(screens.screenId, drafts.map(s => s.data.screenId!))])
            ]),
        });

        results.data = [...results.data, ...drafts.map(s => {
            return {
                ...s.data,
                screenReference: s.screenDraftId,
                screenId: s.screenId || undefined,
                screenDraftId: s.screenDraftId,
                scriptId: s.scriptId,
                scriptDraftId: s.scriptDraftId,
                isDraft: true,
            } as typeof results.data[0];
        })];

        results.data = [...results.data, ...published.map(s => ({
            ...s,
            screenReference: s.screenId,
            screenId: s.screenId,
            scriptId: s.scriptId,
            isDraft: false,
        }))].sort((a, b) => a.position - b.position);

        return results;
    } catch(e: any) {
        results.error = e.message;
        logger.error('_listRawScreens ERROR', e.message);
    } finally {
        return results;
    }
}

export async function _getLastScreenPosition() {
    const res = await db
        .select({ position: screens.position, })
        .from(screens)
        .where(isNull(screens.deletedAt))
        .limit(1)
        .orderBy(desc(screens.position));
    
    return res[0]?.position || 0;
} 

export async function _countScreens(opts?: {
    withArchived?: boolean;
}) {
    const { withArchived } = { ...opts };

    const q = db
        .select({ count: count(), })
        .from(screens);

    if (!withArchived) q.where(isNull(screens.deletedAt));

    const res = await q.execute();
    
    return res[0]?.count;
} 

export type GetScreenParams = string;

export async function _getScreen(params: GetScreenParams) {
    const where = uuid.validate(params) ? eq(screens.screenId, params) : eq(screens.oldScreenId, params);
    const res = await db.query.screens.findFirst({
        where: and(
            where,
            isNull(screens.deletedAt),
        ),
    });

    return !res ? null : {
        ...res,
        fields: res.fields as ScriptField[],
        items: res.items as ScriptItem[],
        image1: res.image1 as null | ScriptImage,
        image2: res.image2 as null | ScriptImage,
        image3: res.image3 as null | ScriptImage,
    };
}

export async function _getScreenWithDraft(params: GetScreenParams) {
    const where = uuid.validate(params) ? eq(screens.screenId, params) : eq(screens.oldScreenId, params);
    const res = await db.query.screens.findFirst({
        where: and(
            where,
            isNull(screens.deletedAt),
        ),
        with: {
            draft: true,
        },
    });
    return !res ? null : {
        ...res,
        fields: res.fields as ScriptField[],
        items: res.items as ScriptItem[],
        image1: res.image1 as null | ScriptImage,
        image2: res.image2 as null | ScriptImage,
        image3: res.image3 as null | ScriptImage,
        prePopulate: res.prePopulate as string[],
        draft: !res.draft ? null! : {
            ...res.draft,
            data: {
                ...res.draft.data,
                fields: res.draft.data.fields as ScriptField[],
                items: res.draft.data.items as ScriptItem[],
                image1: res.draft.data.image1 as null | ScriptImage,
                image2: res.draft.data.image2 as null | ScriptImage,
                image3: res.draft.data.image3 as null | ScriptImage,
                prePopulate: res.draft.data.prePopulate as string[],
            },
        },
    };
}

export async function _getScreenMini(params: GetScreenParams) {
    const where = uuid.validate(params) ? eq(screens.screenId, params) : eq(screens.oldScreenId, params);
    return await db.query.screens.findFirst({
        where: and(
            where,
            isNull(screens.deletedAt),
        ),
        columns: {
            screenId: true,
            oldScreenId: true,
            version: true,
            type: true,
            title: true,
        },
    });
}

export async function _getFullScreen(params: GetScreenParams) {
    const where = uuid.validate(params) ? eq(screens.screenId, params) : eq(screens.oldScreenId, params);
    return await db.query.screens.findFirst({
        where: and(
            where,
            isNull(screens.deletedAt),
        ),
    });
}

export type GetScreensParams = {
    limit?: number;
    offset?: number;
    page?: number;
    screenIds?: string[];
    searchValue?: string;
    archived?: boolean;
    scriptsIds?: string[];
};

async function __getScreens({
    limit,
    page = 1,
    screenIds,
    searchValue,
    archived,
    scriptsIds,
}: GetScreensParams) {
    page = Math.max(0, page);

    const conditions: SQL[] = [];

    if (archived) {
        conditions.push(isNotNull(screens.deletedAt));
    } else {
        conditions.push(isNull(screens.deletedAt));
    }

    if (screenIds?.length) conditions.push(inArray(screens.screenId, screenIds));

    if (scriptsIds?.length) conditions.push(inArray(screens.scriptId, scriptsIds));

    searchValue = `${searchValue || ''}`.trim();
    if (searchValue) {
        const search = ['%', searchValue, '%'].join('');
        conditions.push(sql`LOWER(screens.name) like LOWER(${search})`);
    }

    const countQuery = db.select({ count: count(), }).from(screens);
    if (conditions.length) countQuery.where(and(...conditions));

    const [{ count: totalRows, }] = await countQuery.execute();

    let totalPages = 1;
    if (totalRows){
        totalPages = isEmpty(limit) ? 1 : Math.ceil(totalRows / limit!);
        page = Math.min(page, totalPages);
    }

    const offset = isEmpty(limit) ? undefined : Math.max(0, (page - 1) * limit!);

    const q = db
        .select({
            id: screens.id,
            screenId: screens.screenId,
            oldScreenId: screens.oldScreenId,
            version: screens.version,
            scriptId: screens.scriptId,
            type: screens.type,
            position: screens.position,
            sectionTitle: screens.sectionTitle,
            condition: screens.condition,
            epicId: screens.epicId,
            storyId: screens.storyId,
            refId: screens.refId,
            step: screens.step,
            actionText: screens.actionText,
            contentText: screens.contentText,
            title: screens.title,
            title1: screens.title1,
            title2: screens.title2,
            title3: screens.title3,
            title4: screens.title4,
            instructions: screens.instructions,
            instructions2: screens.instructions2,
            instructions3: screens.instructions3,
            instructions4: screens.instructions4,
            text1: screens.text1,
            text2: screens.text2,
            text3: screens.text3,
            image1: screens.image1,
            image2: screens.image2,
            image3: screens.image3,
            hcwDiagnosesInstructions: screens.hcwDiagnosesInstructions,
            suggestedDiagnosesInstructions: screens.suggestedDiagnosesInstructions,
            notes: screens.notes,
            dataType: screens.dataType,
            confidential: screens.confidential,
            key: screens.key,
            label: screens.label,
            negativeLabel: screens.negativeLabel,
            positiveLabel: screens.positiveLabel,
            timerValue: screens.timerValue,
            multiplier: screens.multiplier,
            minValue: screens.minValue,
            maxValue: screens.maxValue,
            exportable: screens.exportable,
            skippable: screens.skippable,
            prePopulate: screens.prePopulate,
            fields: screens.fields,
            items: screens.items,
            publishDate: screens.publishDate,
            createdAt: screens.createdAt,
            updatedAt: screens.updatedAt,
            deletedAt: screens.deletedAt,
            screenDraftId: screensDrafts.screenDraftId,
            scriptDraftId: screensDrafts.scriptDraftId,
        })
        .from(screens)
        .leftJoin(screensDrafts, eq(screens.screenId, screensDrafts.screenId))
        .orderBy(desc(screens.position));

    if (!isEmpty(limit)) q.limit(limit!);

    if (offset) q.offset(offset);

    if (conditions.length) q.where(and(...conditions));

    const data = await q.execute();

    return {
        page,
        limit,
        data: data.map(s => ({
            ...s,
            publishedVersion: s.version,
            isDraft: false,
            screenDraftId: s.screenDraftId as typeof screensDrafts.$inferSelect['screenDraftId'] | undefined,
            scriptDraftId: s.scriptDraftId as typeof screensDrafts.$inferSelect['scriptDraftId'] | undefined,
        })),
        totalRows,
        totalPages,
        searchValue,
        error: undefined as (undefined | string),
    };
}

export const _getScreensDefaultResults = {
    page: 1,
    limit: undefined,
    totalRows: 0,
    totalPages: 1,
    data: [],
    searchValue: undefined as (undefined | string),
    error: undefined as (undefined | string),
} as Awaited<ReturnType<typeof __getScreens>>;

export async function _getScreens(params?: GetScreensParams) {
    let rslts = _getScreensDefaultResults;
    
    try {
        rslts = await __getScreens({ ...params });
    } catch(e: any) {
        logger.error('_getScreens ERROR', e);
        rslts.error = e.message;
    } finally {
        return rslts;
    }
}
