import { and, eq, inArray, isNotNull, isNull, notInArray, or, sql } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { scripts, scriptsDrafts, pendingDeletion, hospitals, } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { ScriptField } from "@/types";

export type GetScriptsParams = {
    scriptsIds?: string[];
    returnDraftsIfExist?: boolean;
    withDeleted?: boolean;
};

export type ScriptType = typeof scripts.$inferSelect & {
    isDraft: boolean;
    isDeleted: boolean;
    nuidSearchFields: ScriptField[];
    hospitalName: string;
};

export type GetScriptsResults = {
    data: ScriptType[];
    errors?: string[];
};

export async function _getScripts(
    params?: GetScriptsParams
): Promise<GetScriptsResults> {
    try {
        let { scriptsIds = [], returnDraftsIfExist, } = { ...params };

        scriptsIds = scriptsIds.filter(s => uuid.validate(s));
        const oldScriptsIds = scriptsIds.filter(s => !uuid.validate(s));

        if (oldScriptsIds.length) {
            const res = await db.query.scripts.findMany({
                where: inArray(scripts.oldScriptId, oldScriptsIds),
                columns: { scriptId: true, oldScriptId: true, },
            });
            oldScriptsIds.forEach(oldScriptId => {
                const s = res.filter(s => s.oldScriptId === oldScriptId)[0];
                scriptsIds.push(s?.scriptId || uuid.v4());
            });
        }
        
        // unpublished scripts conditions
        const draftsRes = !returnDraftsIfExist ? [] : await db
            .select({
                scriptDraft: scriptsDrafts,
                // hospitalName: hospitals.name,
            })
            .from(scriptsDrafts)
            // .leftJoin(hospitals, eq(sql`${hospitals.hospitalId}::text`, sql`${scriptsDrafts.data}->>'hospitalId'`))
            .where(and(
                !scriptsIds?.length ? undefined : inArray(scriptsDrafts.scriptDraftId, scriptsIds),
            ));

        const drafts = draftsRes.map(s => ({ ...s.scriptDraft, }));

        // published scripts conditions
        const publishedRes = await db
            .select({
                script: scripts,
                pendingDeletion: pendingDeletion,
                hospitalName: hospitals.name,
            })
            .from(scripts)
            .leftJoin(pendingDeletion, eq(pendingDeletion.scriptId, scripts.scriptId))
            .leftJoin(scriptsDrafts, eq(scriptsDrafts.scriptId, scripts.scriptId))
            .leftJoin(hospitals, eq(hospitals.hospitalId, scripts.hospitalId))
            .where(and(
                isNull(scripts.deletedAt),
                isNull(pendingDeletion),
                !returnDraftsIfExist ? undefined : isNull(scriptsDrafts.scriptId),
                !scriptsIds.length ? undefined : inArray(scripts.scriptId, scriptsIds),
            ));

        const published = publishedRes.map(s => ({
            ...s.script,
            hospitalName: s.hospitalName,
        }));

        const inPendingDeletion = !published.length ? [] : await db.query.pendingDeletion.findMany({
            where: inArray(pendingDeletion.scriptId, published.map(s => s.scriptId)),
            columns: { scriptId: true, },
        });

        const responseData = [
            ...published.map(s => ({
                ...s,
                isDraft: false,
                isDeleted: false,
            } as GetScriptsResults['data'][0])),

            ...drafts.map((s => ({
                ...s.data,
                isDraft: true,
                isDeleted: false,
            } as GetScriptsResults['data'][0])))
        ]
            .sort((a, b) => a.position - b.position)
            .filter(s => !inPendingDeletion.map(s => s.scriptId).includes(s.scriptId));

        return  { 
            data: responseData,
        };
    } catch(e: any) {
        logger.error('_getScripts ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}

export type GetScriptResults = {
    data?: null | ScriptType;
    errors?: string[];
};

export async function _getScript(
    params: {
        scriptId: string,
        returnDraftIfExists?: boolean;
    },
): Promise<GetScriptResults> {
    const { scriptId, returnDraftIfExists, } = { ...params };

    try {
        if (!scriptId) throw new Error('Missing scriptId');

        const whereScriptId = uuid.validate(scriptId) ? eq(scripts.scriptId, scriptId) : undefined;
        const whereOldScriptId = !uuid.validate(scriptId) ? eq(scripts.oldScriptId, scriptId) : undefined;
        const whereScriptDraftId = !whereScriptId ? undefined : eq(scriptsDrafts.scriptDraftId, scriptId);

        let draft = (returnDraftIfExists && whereScriptDraftId) ? await db.query.scriptsDrafts.findFirst({
            where: whereScriptDraftId,
        }) : undefined;

        let responseData = !draft ? null : {
            ...draft.data,
            isDraft: false,
            isDeleted: false,
        } as GetScriptResults['data'];

        if (responseData) return { data: responseData, };

        const publishedRes = await db
            .select({
                script: scripts,
                pendingDeletion,
                draft: scriptsDrafts,
                hospitalName: hospitals.name,
            })
            .from(scripts)
            .leftJoin(hospitals, eq(hospitals.hospitalId, scripts.hospitalId))
            .leftJoin(pendingDeletion, eq(pendingDeletion.scriptId, scripts.scriptId))
            .leftJoin(scriptsDrafts, eq(scripts.scriptId, scriptsDrafts.scriptDraftId))
            .where(and(
                isNull(scripts.deletedAt),
                isNull(pendingDeletion),
                or(whereScriptId, whereOldScriptId),
            ));

        const published = !publishedRes[0] ? null : {
            ...publishedRes[0].script,
            draft: publishedRes[0].draft || undefined,
            hospitalName: publishedRes[0].hospitalName || '',
        };

        draft = returnDraftIfExists ? published?.draft : undefined;

        const data = (draft?.data || published) as GetScriptResults['data'];

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
        logger.error('_getScript ERROR', e.message);
        return { errors: [e.message], };
    }
} 
