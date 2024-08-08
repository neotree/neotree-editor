import { eq, and, SQL, count, inArray, desc, isNull, } from "drizzle-orm";

import { isEmpty } from "@/lib/isEmpty";
import db from "../pg/drizzle";
import { configKeysDrafts } from "../pg/schema";
import logger from "@/lib/logger";

export async function _countConfigKeysDrafts(opts?: {
    firstVersion?: boolean;
    version?: boolean;
    configKeysIds?: string[];
    configKeysDraftsIds?: string[];
}) {
    const where = opts?.firstVersion ? [isNull(configKeysDrafts.configKeyId)] : [];
    if (opts?.configKeysDraftsIds) where.push(inArray(configKeysDrafts.configKeyDraftId, opts.configKeysDraftsIds));
    if (opts?.configKeysIds) where.push(inArray(configKeysDrafts.configKeyId, opts.configKeysIds));

    const q = db
        .select({ count: count(), })
        .from(configKeysDrafts);

    if (where.length) q.where(and(...where));

    const res = await q.execute();
    
    return res[0]?.count || 0;
}

export type GetConfigKeyDraftParams = string;

export async function _getConfigKeyDraft(params: GetConfigKeyDraftParams) {
    const where = eq(configKeysDrafts.configKeyDraftId, params);
    return await db.query.configKeysDrafts.findFirst({
        where,
        columns: {
            id: true,
            configKeyDraftId: true,
            configKeyId: true,
            data: true,
        },
    });
}

export async function _getConfigKeyDraftMini(params: GetConfigKeyDraftParams) {
    const where = eq(configKeysDrafts.configKeyDraftId, params);
    return await db.query.configKeysDrafts.findFirst({
        where,
        columns: {
            id: true,
            configKeyDraftId: true,
            configKeyId: true,
            data: true,
        },
    });
}

export async function _getFullConfigKeyDraft(params: GetConfigKeyDraftParams) {
    const where = eq(configKeysDrafts.configKeyDraftId, params);
    return await db.query.configKeysDrafts.findFirst({
        where,
    });
}

export type GetConfigKeysDraftsParams = {
    limit?: number;
    offset?: number;
    page?: number;
    configKeyDraftIds?: string[];
    searchValue?: string;
    withoutConfigKeyId?: boolean;
};

async function __getConfigKeysDrafts({
    limit,
    page = 1,
    configKeyDraftIds,
    searchValue,
    withoutConfigKeyId,
}: GetConfigKeysDraftsParams) {
    page = Math.max(0, page);

    const conditions: SQL[] = [];

    if (configKeyDraftIds?.length) conditions.push(inArray(configKeysDrafts.configKeyDraftId, configKeyDraftIds));

    if (withoutConfigKeyId) conditions.push(isNull(configKeysDrafts.configKeyId));

    searchValue = `${searchValue || ''}`.trim();
    // if (searchValue) {
    //     const search = ['%', searchValue, '%'].join('');
    //     conditions.push(sql`json_array_elements(content->data) like LOWER(${search})`);
    // }

    const countQuery = db.select({ count: count(), }).from(configKeysDrafts);
    if (conditions.length) countQuery.where(and(...conditions));

    const [{ count: totalRows, }] = await countQuery.execute();

    let totalPages = 1;
    if (totalRows){
        totalPages = isEmpty(limit) ? 1 : Math.ceil(totalRows / limit!);
        page = Math.min(page, totalPages);
    }

    const offset = isEmpty(limit) ? undefined : Math.max(0, (page - 1) * limit!);

    const data = await db.query.configKeysDrafts.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: isEmpty(limit) ? undefined : limit!,
        orderBy: desc(configKeysDrafts.id),
        offset,
        columns: {
            id: true,
            configKeyDraftId: true,
            configKeyId: true,
            data: true,
        },
    });

    return {
        page,
        limit,
        data: data.map(({ data, id, configKeyId, configKeyDraftId, }) => ({
            ...data,
            id,
            configKeyDraftId,
            publishedVersion: !configKeyId ? null : Math.max(1, data.version - 1),
        })),
        totalRows,
        totalPages,
        searchValue,
        error: undefined as (undefined | string),
    };
}

export const _getConfigKeysDraftsDefaultResults = {
    page: 1,
    limit: undefined,
    totalRows: 0,
    totalPages: 1,
    data: [],
    searchValue: undefined as (undefined | string),
    error: undefined as (undefined | string),
} as Awaited<ReturnType<typeof __getConfigKeysDrafts>>;

export async function _getConfigKeysDrafts(params?: GetConfigKeysDraftsParams) {
    let rslts = _getConfigKeysDraftsDefaultResults;

    try {
        rslts = await __getConfigKeysDrafts({ ...params });
    } catch(e: any) {
        logger.error('_getConfigKeyDrafts ERROR', e);
        rslts.error = e.message;
    } finally {
        return rslts;
    }
}
