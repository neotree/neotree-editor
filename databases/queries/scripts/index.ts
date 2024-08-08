import { eq, and, isNull, SQL, count, inArray, desc, sql, isNotNull, notInArray, or } from "drizzle-orm";
import * as uuid from 'uuid';

import logger from "@/lib/logger";
import { ScriptField } from "@/types";
import { isEmpty } from "@/lib/isEmpty";
import db from "../../pg/drizzle";
import { scripts, scriptsDrafts } from "../../pg/schema";
import { _getScriptsDrafts } from "../scripts-drafts";

export * from './_get-scripts-with-items';
export * from './_count-scripts-items';

export async function _listScripts(scriptsReferences?: string[]) {
    const results: {
        error?: string;
        data: {
            scriptReference: string;
            scriptId?: string;
            scriptDraftId?: string;
            isDraft: boolean;
            title: string;
            position: number;
        }[];
    } = {
        data: [],
    };

    try {
        const drafts = await db.query.scriptsDrafts.findMany({
            where: !scriptsReferences?.length ? undefined : or(
                inArray(scriptsDrafts.scriptId, scriptsReferences),
                inArray(scriptsDrafts.scriptDraftId, scriptsReferences),
            ),
            columns: {
                scriptId: true,
                scriptDraftId: true,
                data: true,
            },
        });

        const published = await db.query.scripts.findMany({
            where: and(...[
                isNull(scripts.deletedAt),
                ...(!drafts.length ? [] : [notInArray(scripts.scriptId, drafts.map(s => s.data.scriptId!))])
            ]),
            columns: {
                scriptId: true,
                position: true,
                title: true,
            },
        });

        results.data = [...results.data, ...drafts.map(s => ({
            scriptReference: s.scriptDraftId,
            scriptId: s.scriptId || undefined,
            scriptDraftId: s.scriptDraftId,
            isDraft: true,
            title: s.data.title,
            position: s.data.position,
        }))];

        results.data = [...results.data, ...published.map(s => ({
            scriptReference: s.scriptId,
            scriptId: s.scriptId,
            isDraft: false,
            title: s.title,
            position: s.position,
        }))].sort((a, b) => a.position - b.position);

        return results;
    } catch(e: any) {
        results.error = e.message;
        logger.error('_listScripts ERROR', e.message);
    } finally {
        return results;
    }
}

export async function _listRawScripts(scriptsReferences?: string[]) {
    const results: {
        error?: string;
        data: (typeof scripts.$inferSelect & {
            scriptReference: string;
            scriptId?: string;
            scriptDraftId?: string;
            isDraft: boolean;
        })[];
    } = {
        data: [],
    };

    try {
        const drafts = await db.query.scriptsDrafts.findMany({
            where: !scriptsReferences?.length ? undefined : or(
                inArray(scriptsDrafts.scriptId, scriptsReferences),
                inArray(scriptsDrafts.scriptDraftId, scriptsReferences),
            ),
        });

        const published = await db.query.scripts.findMany({
            where: and(...[
                isNull(scripts.deletedAt),
                ...(!drafts.length ? [] : [notInArray(scripts.scriptId, drafts.map(s => s.data.scriptId!))])
            ]),
        });

        results.data = [...results.data, ...drafts.map(s => {
            return {
                ...s.data,
                scriptReference: s.scriptDraftId,
                scriptId: s.scriptId || undefined,
                scriptDraftId: s.scriptDraftId,
                isDraft: true,
            } as typeof results.data[0];
        })];

        results.data = [...results.data, ...published.map(s => ({
            ...s,
            scriptReference: s.scriptId,
            scriptId: s.scriptId,
            isDraft: false,
        }))].sort((a, b) => a.position - b.position);

        return results;
    } catch(e: any) {
        results.error = e.message;
        logger.error('_listRawScripts ERROR', e.message);
    } finally {
        return results;
    }
}

export async function _getLastScriptPosition() {
    const res = await db
        .select({ position: scripts.position, })
        .from(scripts)
        .where(isNull(scripts.deletedAt))
        .limit(1)
        .orderBy(desc(scripts.position));
    
    return res[0]?.position || 0;
} 

export async function _countScripts(opts?: {
    withArchived?: boolean;
}) {
    const { withArchived } = { ...opts };

    const q = db
        .select({ count: count(), })
        .from(scripts);

    if (!withArchived) q.where(isNull(scripts.deletedAt));

    const res = await q.execute();
    
    return res[0]?.count;
} 

export type GetScriptParams = string;

export async function _getScript(params: GetScriptParams) {
    const where = uuid.validate(params) ? eq(scripts.scriptId, params) : eq(scripts.oldScriptId, params);
    const res = await db.query.scripts.findFirst({
        where: and(
            where,
            isNull(scripts.deletedAt),
        ),
        columns: {
            id: true,
            scriptId: true,
            oldScriptId: true,
            publishDate: true,
            createdAt: true,
            updatedAt: true,
            version: true,
            type: true,
            position: true,
            title: true,
            printTitle: true,
            description: true,
            hospitalId: true,
            exportable: true,
            nuidSearchEnabled: true,
            nuidSearchFields: true,
        },
    });

    return !res ? null : {
        ...res,
        nuidSearchFields: res.nuidSearchFields as ScriptField[],
    };
}

export async function _getScriptWithDraft(params: GetScriptParams) {
    const where = uuid.validate(params) ? eq(scripts.scriptId, params) : eq(scripts.oldScriptId, params);
    const res = await db.query.scripts.findFirst({
        where: and(
            where,
            isNull(scripts.deletedAt),
        ),
        columns: {
            id: true,
            scriptId: true,
            oldScriptId: true,
            publishDate: true,
            createdAt: true,
            updatedAt: true,
            version: true,
            type: true,
            position: true,
            title: true,
            printTitle: true,
            description: true,
            hospitalId: true,
            exportable: true,
            nuidSearchEnabled: true,
            nuidSearchFields: true,
        },
        with: {
            draft: true,
        },
    });
    return !res ? null : {
        ...res,
        nuidSearchFields: res.nuidSearchFields as ScriptField[],
    };
}

export async function _getScriptMini(params: GetScriptParams) {
    const where = uuid.validate(params) ? eq(scripts.scriptId, params) : eq(scripts.oldScriptId, params);
    return await db.query.scripts.findFirst({
        where: and(
            where,
            isNull(scripts.deletedAt),
        ),
        columns: {
            scriptId: true,
            oldScriptId: true,
            version: true,
            type: true,
            title: true,
            printTitle: true,
            description: true,
        },
    });
}

export async function _getFullScript(params: GetScriptParams) {
    const where = uuid.validate(params) ? eq(scripts.scriptId, params) : eq(scripts.oldScriptId, params);
    return await db.query.scripts.findFirst({
        where: and(
            where,
            isNull(scripts.deletedAt),
        ),
    });
}

export type GetScriptsParams = {
    limit?: number;
    offset?: number;
    page?: number;
    scriptIds?: string[];
    searchValue?: string;
    archived?: boolean;
};

async function __getScripts({
    limit,
    page = 1,
    scriptIds,
    searchValue,
    archived,
}: GetScriptsParams) {
    page = Math.max(0, page);

    const conditions: SQL[] = [];

    if (archived) {
        conditions.push(isNotNull(scripts.deletedAt));
    } else {
        conditions.push(isNull(scripts.deletedAt));
    }

    if (scriptIds?.length) conditions.push(inArray(scripts.scriptId, scriptIds));

    searchValue = `${searchValue || ''}`.trim();
    if (searchValue) {
        const search = ['%', searchValue, '%'].join('');
        conditions.push(sql`LOWER(scripts.name) like LOWER(${search})`);
    }

    const countQuery = db.select({ count: count(), }).from(scripts);
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
            id: scripts.id,
            scriptId: scripts.scriptId,
            oldScriptId: scripts.oldScriptId,
            publishDate: scripts.publishDate,
            createdAt: scripts.createdAt,
            updatedAt: scripts.updatedAt,
            version: scripts.version,
            type: scripts.type,
            position: scripts.position,
            title: scripts.title,
            printTitle: scripts.printTitle,
            description: scripts.description,
            hospitalId: scripts.hospitalId,
            exportable: scripts.exportable,
            nuidSearchEnabled: scripts.nuidSearchEnabled,
            scriptDraftId: scriptsDrafts.scriptDraftId,
        })
        .from(scripts)
        .leftJoin(scriptsDrafts, eq(scripts.scriptId, scriptsDrafts.scriptId))
        .orderBy(desc(scripts.position));

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
        })),
        totalRows,
        totalPages,
        searchValue,
        error: undefined as (undefined | string),
    };
}

export const _getScriptsDefaultResults = {
    page: 1,
    limit: undefined,
    totalRows: 0,
    totalPages: 1,
    data: [],
    searchValue: undefined as (undefined | string),
    error: undefined as (undefined | string),
} as Awaited<ReturnType<typeof __getScripts>>;

export async function _getScripts(params?: GetScriptsParams) {
    let rslts = _getScriptsDefaultResults;

    try {
        rslts = await __getScripts({ ...params });
    } catch(e: any) {
        logger.error('_getScripts ERROR', e);
        rslts.error = e.message;
    } finally {
        return rslts;
    }
}
