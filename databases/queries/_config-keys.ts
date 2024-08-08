import { eq, and, isNull, SQL, count, inArray, desc, sql, isNotNull, notInArray, or } from "drizzle-orm";
import * as uuid from 'uuid';

import db from "../pg/drizzle";
import { configKeys, configKeysDrafts } from "../pg/schema";
import { isEmpty } from "@/lib/isEmpty";
import { _getConfigKeysDrafts } from "./_config-keys-drafts";
import logger from "@/lib/logger";

export async function _listConfigKeys(configKeysReferences?: string[]) {
    const results: {
        error?: string;
        data: {
            configKeyReference: string;
            configKeyId?: string | null;
            configKeyDraftId?: string | null;
            scriptId?: string | null;
            scriptDraftId?: string | null;
            isDraft: boolean;
            label: string;
            position: number;
        }[];
    } = {
        data: [],
    };

    try {
        const drafts = await db.query.configKeysDrafts.findMany({
            where: !configKeysReferences?.length ? undefined : or(
                inArray(configKeysDrafts.configKeyId, configKeysReferences),
                inArray(configKeysDrafts.configKeyDraftId, configKeysReferences),
            ),
            columns: {
                configKeyId: true,
                configKeyDraftId: true,
                data: true,
            },
        });

        const published = await db.query.configKeys.findMany({
            where: and(...[
                isNull(configKeys.deletedAt),
                ...(!drafts.length ? [] : [notInArray(configKeys.configKeyId, drafts.map(s => s.data.configKeyId!))])
            ]),
            columns: {
                configKeyId: true,
                position: true,
                label: true,
            },
        });

        results.data = [...results.data, ...drafts.map(s => ({
            configKeyReference: s.configKeyDraftId,
            configKeyId: s.configKeyId,
            configKeyDraftId: s.configKeyDraftId,
            isDraft: true,
            label: s.data.label,
            position: s.data.position,
        }))];

        results.data = [...results.data, ...published.map(s => ({
            configKeyReference: s.configKeyId,
            configKeyId: s.configKeyId,
            isDraft: false,
            label: s.label,
            position: s.position,
        }))].sort((a, b) => a.position - b.position);

        return results;
    } catch(e: any) {
        results.error = e.message;
        logger.error('_listConfigKeys ERROR', e.message);
    } finally {
        return results;
    }
}

export async function _listRawConfigKeys(configKeysReferences?: string[]) {
    const results: {
        error?: string;
        data: (typeof configKeys.$inferSelect & {
            configKeyReference: string;
            configKeyId?: string;
            configKeyDraftId?: string;
            scriptId?: string;
            scriptDraftId?: string;
            isDraft: boolean;
        })[];
    } = {
        data: [],
    };

    try {
        const drafts = await db.query.configKeysDrafts.findMany({
            where: !configKeysReferences?.length ? undefined : or(
                inArray(configKeysDrafts.configKeyId, configKeysReferences),
                inArray(configKeysDrafts.configKeyDraftId, configKeysReferences),
            ),
        });

        const published = await db.query.configKeys.findMany({
            where: and(...[
                isNull(configKeys.deletedAt),
                ...(!drafts.length ? [] : [notInArray(configKeys.configKeyId, drafts.map(s => s.data.configKeyId!))])
            ]),
        });

        results.data = [...results.data, ...drafts.map(s => {
            return {
                ...s.data,
                configKeyReference: s.configKeyDraftId,
                configKeyId: s.configKeyId || undefined,
                configKeyDraftId: s.configKeyDraftId,
                isDraft: true,
            } as typeof results.data[0];
        })];

        results.data = [...results.data, ...published.map(s => ({
            ...s,
            configKeyReference: s.configKeyId,
            configKeyId: s.configKeyId,
            isDraft: false,
        }))].sort((a, b) => a.position - b.position);

        return results;
    } catch(e: any) {
        results.error = e.message;
        logger.error('_listRawConfigKeys ERROR', e.message);
    } finally {
        return results;
    }
}

export async function _getLastConfigKeyPosition() {
    const res = await db
        .select({ position: configKeys.position, })
        .from(configKeys)
        .where(isNull(configKeys.deletedAt))
        .limit(1)
        .orderBy(desc(configKeys.position));
    
    return res[0]?.position || 0;
} 

export async function _countConfigKeys(opts?: {
    withArchived?: boolean;
}) {
    const { withArchived } = { ...opts };

    const q = db
        .select({ count: count(), })
        .from(configKeys);

    if (!withArchived) q.where(isNull(configKeys.deletedAt));

    const res = await q.execute();
    
    return res[0]?.count;
} 

export type GetConfigKeyParams = string;

export async function _getConfigKey(params: GetConfigKeyParams) {
    const where = uuid.validate(params) ? eq(configKeys.configKeyId, params) : eq(configKeys.oldConfigKeyId, params);
    return await db.query.configKeys.findFirst({
        where: and(
            where,
            isNull(configKeys.deletedAt),
        ),
        columns: {
            id: true,
            configKeyId: true,
            oldConfigKeyId: true,
            label: true,
            key: true,
            summary: true,
            version: true,
            position: true,
        },
    });
}

export async function _getConfigKeyWithDraft(params: GetConfigKeyParams) {
    const where = uuid.validate(params) ? eq(configKeys.configKeyId, params) : eq(configKeys.oldConfigKeyId, params);
    return await db.query.configKeys.findFirst({
        where: and(
            where,
            isNull(configKeys.deletedAt),
        ),
        columns: {
            id: true,
            configKeyId: true,
            oldConfigKeyId: true,
            label: true,
            key: true,
            summary: true,
            version: true,
            position: true,
        },
        with: {
            draft: true,
            history: true,
        },
    });
}

export async function _getConfigKeyMini(params: GetConfigKeyParams) {
    const where = uuid.validate(params) ? eq(configKeys.configKeyId, params) : eq(configKeys.oldConfigKeyId, params);
    return await db.query.configKeys.findFirst({
        where: and(
            where,
            isNull(configKeys.deletedAt),
        ),
        columns: {
            id: true,
            configKeyId: true,
            oldConfigKeyId: true,
            label: true,
            key: true,
            summary: true,
            version: true,
            position: true,
        },
    });
}

export async function _getFullConfigKey(params: GetConfigKeyParams) {
    const where = uuid.validate(params) ? eq(configKeys.configKeyId, params) : eq(configKeys.oldConfigKeyId, params);
    return await db.query.configKeys.findFirst({
        where: and(
            where,
            isNull(configKeys.deletedAt),
        ),
    });
}

export type GetConfigKeysParams = {
    limit?: number;
    offset?: number;
    page?: number;
    configKeyIds?: string[];
    searchValue?: string;
    archived?: boolean;
};

async function __getConfigKeys({
    limit,
    page = 1,
    configKeyIds,
    searchValue,
    archived,
}: GetConfigKeysParams) {
    page = Math.max(0, page);

    const conditions: SQL[] = [];

    if (archived) {
        conditions.push(isNotNull(configKeys.deletedAt));
    } else {
        conditions.push(isNull(configKeys.deletedAt));
    }

    if (configKeyIds?.length) conditions.push(inArray(configKeys.configKeyId, configKeyIds));

    searchValue = `${searchValue || ''}`.trim();
    if (searchValue) {
        const search = ['%', searchValue, '%'].join('');
        conditions.push(sql`LOWER(configKeys.name) like LOWER(${search})`);
    }

    const countQuery = db.select({ count: count(), }).from(configKeys);
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
            id: configKeys.id,
            configKeyId: configKeys.configKeyId,
            oldConfigKeyId: configKeys.oldConfigKeyId,
            label: configKeys.label,
            key: configKeys.key,
            summary: configKeys.summary,
            version: configKeys.version,
            position: configKeys.position,
            configKeyDraftId: configKeysDrafts.configKeyDraftId,
        })
        .from(configKeys)
        .leftJoin(configKeysDrafts, eq(configKeys.configKeyId, configKeysDrafts.configKeyId))
        .orderBy(desc(configKeys.id));

    if (!isEmpty(limit)) q.limit(limit!);

    if (offset) q.offset(offset);

    if (conditions.length) q.where(and(...conditions));

    const data = await q.execute();

    return {
        page,
        limit,
        data: data.map(c => ({
            ...c,
            publishedVersion: c.version,
        })),
        totalRows,
        totalPages,
        searchValue,
        error: undefined as (undefined | string),
    };
}

export const _getConfigKeysDefaultResults = {
    page: 1,
    limit: undefined,
    totalRows: 0,
    totalPages: 1,
    data: [],
    searchValue: undefined as (undefined | string),
    error: undefined as (undefined | string),
} as Awaited<ReturnType<typeof __getConfigKeys>>;

export async function _getConfigKeys(params?: GetConfigKeysParams) {
    let rslts = _getConfigKeysDefaultResults;

    try {
        rslts = await __getConfigKeys({ ...params });
    } catch(e: any) {
        logger.error('_getConfigKeys ERROR', e);
        rslts.error = e.message;
    } finally {
        return rslts;
    }
}
