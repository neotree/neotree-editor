import { eq, and, SQL, count, inArray, desc, isNull, } from "drizzle-orm";

import { isEmpty } from "@/lib/isEmpty";
import db from "../pg/drizzle";
import { scriptsDrafts } from "../pg/schema";
import logger from "@/lib/logger";

export async function _countScriptsDrafts(opts?: {
    firstVersion?: boolean;
}) {
    const q = db
        .select({ count: count(), })
        .from(scriptsDrafts);

    if (opts?.firstVersion) q.where(isNull(scriptsDrafts.scriptId));

    const res = await q.execute();
    
    return res[0]?.count || 0;
}

export type GetScriptDraftParams = string;

export async function _getScriptDraft(params: GetScriptDraftParams) {
    const where = eq(scriptsDrafts.scriptDraftId, params);
    return await db.query.scriptsDrafts.findFirst({
        where,
        columns: {
            id: true,
            scriptDraftId: true,
            scriptId: true,
            data: true,
        },
    });
}

export async function _getScriptDraftMini(params: GetScriptDraftParams) {
    const where = eq(scriptsDrafts.scriptDraftId, params);
    return await db.query.scriptsDrafts.findFirst({
        where,
        columns: {
            id: true,
            scriptDraftId: true,
            scriptId: true,
            data: true,
        },
    });
}

export async function _getFullScriptDraft(params: GetScriptDraftParams) {
    const where = eq(scriptsDrafts.scriptDraftId, params);
    return await db.query.scriptsDrafts.findFirst({
        where,
    });
}

export type GetScriptsDraftsParams = {
    limit?: number;
    offset?: number;
    page?: number;
    scriptDraftIds?: string[];
    searchValue?: string;
    withoutScriptId?: boolean;
};

async function __getScriptsDrafts({
    limit,
    page = 1,
    scriptDraftIds,
    searchValue,
    withoutScriptId,
}: GetScriptsDraftsParams) {
    page = Math.max(0, page);

    const conditions: SQL[] = [];

    if (scriptDraftIds?.length) conditions.push(inArray(scriptsDrafts.scriptDraftId, scriptDraftIds));

    if (withoutScriptId) conditions.push(isNull(scriptsDrafts.scriptId));

    searchValue = `${searchValue || ''}`.trim();
    // if (searchValue) {
    //     const search = ['%', searchValue, '%'].join('');
    //     conditions.push(sql`json_array_elements(content->data) like LOWER(${search})`);
    // }

    const countQuery = db.select({ count: count(), }).from(scriptsDrafts);
    if (conditions.length) countQuery.where(and(...conditions));

    const [{ count: totalRows, }] = await countQuery.execute();

    let totalPages = 1;
    if (totalRows){
        totalPages = isEmpty(limit) ? 1 : Math.ceil(totalRows / limit!);
        page = Math.min(page, totalPages);
    }

    const offset = isEmpty(limit) ? undefined : Math.max(0, (page - 1) * limit!);

    const data = await db.query.scriptsDrafts.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: isEmpty(limit) ? undefined : limit!,
        orderBy: desc(scriptsDrafts.id),
        offset,
        columns: {
            id: true,
            scriptDraftId: true,
            scriptId: true,
            data: true,
        },
    });

    return {
        page,
        limit,
        data: data.map(({ data, id, scriptDraftId, scriptId, }) => ({
            ...data,
            id,
            scriptDraftId,
            publishedVersion: !scriptId ? null : Math.max(1, data.version - 1),
        })),
        totalRows,
        totalPages,
        searchValue,
        error: undefined as (undefined | string),
    };
}

export const _getScriptsDraftsDefaultResults = {
    page: 1,
    limit: undefined,
    totalRows: 0,
    totalPages: 1,
    data: [],
    searchValue: undefined as (undefined | string),
    error: undefined as (undefined | string),
} as Awaited<ReturnType<typeof __getScriptsDrafts>>;

export async function _getScriptsDrafts(params?: GetScriptsDraftsParams) {
    let rslts = _getScriptsDraftsDefaultResults;

    try {
        rslts = await __getScriptsDrafts({ ...params });
    } catch(e: any) {
        logger.error('_getScriptDrafts ERROR', e);
        rslts.error = e.message;
    } finally {
        return rslts;
    }
}
