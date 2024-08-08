import { eq, and, count, inArray, desc, isNull, or, } from "drizzle-orm";

import { isEmpty } from "@/lib/isEmpty";
import db from "../pg/drizzle";
import { screensDrafts } from "../pg/schema";
import { ScriptField, ImageTextField, ScriptImage, ScriptItem } from "@/types";
import logger from "@/lib/logger";

export async function _countScreensDrafts(opts?: {
    firstVersion?: boolean;
    scriptId?: string;
}) {
    const q = db
        .select({ count: count(), })
        .from(screensDrafts);

    if (opts?.firstVersion) q.where(isNull(screensDrafts.screenId));

    if (opts?.scriptId) q.where(eq(screensDrafts.scriptId, opts.scriptId));

    const res = await q.execute();
    
    return res[0]?.count || 0;
}

export type GetScreenDraftParams = string;

export async function _getScreenDraft(params: GetScreenDraftParams) {
    const where = eq(screensDrafts.screenDraftId, params);
    const res = await db.query.screensDrafts.findFirst({
        where,
        columns: {
            id: true,
            screenDraftId: true,
            scriptDraftId: true,
            screenId: true,
            scriptId: true,
            data: true,
        },
    });
    return !res ? null : {
        ...res,
        data: {
            ...res.data,
            fields: res.data.fields as ScriptField[],
            items: res.data.items as ScriptItem[],
            image1: res.data.image1 as null | ScriptImage,
            image2: res.data.image2 as null | ScriptImage,
            image3: res.data.image3 as null | ScriptImage,
            prePopulate: res.data.prePopulate as string[],
        },
    }; 
}

export async function _getScreenDraftMini(params: GetScreenDraftParams) {
    const where = eq(screensDrafts.screenDraftId, params);
    const res = await db.query.screensDrafts.findFirst({
        where,
        columns: {
            id: true,
            screenDraftId: true,
            screenId: true,
            scriptId: true,
            data: true,
        },
    });

    return !res ? null : {
        ...res,
        data: {
            ...res.data,
            fields: res.data.fields as ScriptField[],
            items: res.data.items as ScriptItem[],
            image1: res.data.image1 as null | ScriptImage,
            image2: res.data.image2 as null | ScriptImage,
            image3: res.data.image3 as null | ScriptImage,
            prePopulate: res.data.prePopulate as string[],
        },
    };
}

export async function _getFullScreenDraft(params: GetScreenDraftParams) {
    const where = eq(screensDrafts.screenDraftId, params);
    const res = await db.query.screensDrafts.findFirst({
        where,
    });
    return !res ? null : {
        ...res,
        data: {
            ...res.data,
            fields: res.data.fields as ScriptField[],
            items: res.data.items as ScriptItem[],
            image1: res.data.image1 as null | ScriptImage,
            image2: res.data.image2 as null | ScriptImage,
            image3: res.data.image3 as null | ScriptImage,
            prePopulate: res.data.prePopulate as string[],
        },
    };
}

export type GetScreensDraftsParams = {
    limit?: number;
    offset?: number;
    page?: number;
    screenDraftIds?: string[];
    scriptsDraftsIds?: string[];
    scriptsIds?: string[];
    searchValue?: string;
    withoutScreenId?: boolean;
};

async function __getScreensDrafts({
    limit,
    page = 1,
    screenDraftIds,
    scriptsDraftsIds,
    searchValue,
    withoutScreenId,
    scriptsIds,
}: GetScreensDraftsParams) {
    page = Math.max(0, page);

    const where = [
        !withoutScreenId ? undefined : isNull(screensDrafts.screenId),
        !scriptsIds?.length && !scriptsDraftsIds?.length ? undefined : or(
            !scriptsDraftsIds?.length ? undefined : inArray(screensDrafts.scriptDraftId, scriptsDraftsIds),
            !scriptsIds?.length ? undefined : inArray(screensDrafts.scriptId, scriptsIds)
        ),
    ].filter(s => s);

    searchValue = `${searchValue || ''}`.trim();
    // if (searchValue) {
    //     const search = ['%', searchValue, '%'].join('');
    //     conditions.push(sql`json_array_elements(content->data) like LOWER(${search})`);
    // }

    const countQuery = db.select({ count: count(), }).from(screensDrafts);
    if (where.length) countQuery.where(and(...where));

    const [{ count: totalRows, }] = await countQuery.execute();

    let totalPages = 1;
    if (totalRows){
        totalPages = isEmpty(limit) ? 1 : Math.ceil(totalRows / limit!);
        page = Math.min(page, totalPages);
    }

    const offset = isEmpty(limit) ? undefined : Math.max(0, (page - 1) * limit!);

    const data = await db.query.screensDrafts.findMany({
        where: where.length ? and(...where) : undefined,
        limit: isEmpty(limit) ? undefined : limit!,
        orderBy: desc(screensDrafts.id),
        offset,
        columns: {
            id: true,
            screenDraftId: true,
            screenId: true,
            scriptId: true,
            data: true,
            scriptDraftId: true,
        },
    });

    return {
        page,
        limit,
        data: data.map(({ data, id, screenId, screenDraftId, scriptId, scriptDraftId, }) => {
            return {
                ...data,
                id,
                scriptId,
                scriptDraftId,
                screenDraftId,
                isDraft: true,
                publishedVersion: !screenId ? null : Math.max(1, data.version - 1),
            };
        }),
        totalRows,
        totalPages,
        searchValue,
        error: undefined as (undefined | string),
    };
}

export const _getScreensDraftsDefaultResults = {
    page: 1,
    limit: undefined,
    totalRows: 0,
    totalPages: 1,
    data: [],
    searchValue: undefined as (undefined | string),
    error: undefined as (undefined | string),
} as Awaited<ReturnType<typeof __getScreensDrafts>>;

export async function _getScreensDrafts(params?: GetScreensDraftsParams) {
    let rslts = _getScreensDraftsDefaultResults;

    try {
        rslts = await __getScreensDrafts({ ...params });
    } catch(e: any) {
        logger.error('_getScreenDrafts ERROR', e);
        rslts.error = e.message;
    } finally {
        return rslts;
    }
}
