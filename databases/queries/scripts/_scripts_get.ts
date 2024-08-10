import { and, eq, inArray, isNotNull, isNull, notInArray, or, sql } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { scripts, scriptsDrafts, pendingDeletion, hospitals, } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { ScriptField } from "@/types";

export type GetScriptsParams = {
    scriptsIds?: string[];
    returnDraftsIfExist?: boolean;
};

export type ScriptType = typeof scripts.$inferSelect & {
    isDraft: boolean;
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
        const { scriptsIds: _scriptsIds, returnDraftsIfExist, } = { ...params };

        let scriptsIds = _scriptsIds || [];
        
        // unpublished scripts conditions
        const whereScriptsDraftsIds = !scriptsIds?.length ? 
            undefined 
            : 
            inArray(scriptsDrafts.scriptDraftId, scriptsIds.map(id => uuid.validate(id) ? id : uuid.v4()));
        const whereScriptsDrafts = [
            ...(!whereScriptsDraftsIds ? [] : [whereScriptsDraftsIds]),
        ];
        const draftsRes = await db
            .select({
                scriptDraft: scriptsDrafts,
                // hospitalName: hospitals.name,
            })
            .from(scriptsDrafts)
            // .leftJoin(hospitals, eq(sql`${hospitals.hospitalId}::text`, sql`${scriptsDrafts.data}->>'hospitalId'`))
            .where(and(...whereScriptsDrafts));

        const drafts = draftsRes.map(s => ({ ...s.scriptDraft, }));
        scriptsIds = scriptsIds.filter(id => !drafts.map(d => d.scriptDraftId).includes(id));

        // published scripts conditions
        const whereScriptsIdsNotIn = !drafts.length ? undefined : notInArray(scripts.scriptId, drafts.map(d => d.scriptDraftId));
        const whereScriptsIds = !scriptsIds?.length ? 
            undefined 
            : 
            inArray(scripts.scriptId, scriptsIds.filter(id => uuid.validate(id)));
        const whereOldScriptsIds = !scriptsIds?.length ? 
            undefined 
            : 
            inArray(scripts.oldScriptId, scriptsIds.filter(id => !uuid.validate(id)));
        const whereScripts = [
            isNull(scripts.deletedAt),
            isNull(pendingDeletion),
            ...((!whereScriptsIds || !whereOldScriptsIds) ? [] : [or(whereScriptsIds, whereOldScriptsIds)]),
            whereScriptsIdsNotIn,
        ];

        const publishedRes = await db
            .select({
                script: scripts,
                pendingDeletion: pendingDeletion,
                hospitalName: hospitals.name,
            })
            .from(scripts)
            .leftJoin(pendingDeletion, eq(pendingDeletion.scriptId, scripts.scriptId))
            .leftJoin(hospitals, eq(hospitals.hospitalId, scripts.hospitalId))
            .where(!whereScripts.length ? undefined : and(...whereScripts));

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
            } as GetScriptsResults['data'][0])),

            ...drafts.map((s => ({
                ...s.data,
                isDraft: true,
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
            where: whereScriptId,
        }) : undefined;

        let responseData = !draft ? null : {
            ...draft.data,
            isDraft: false,
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
            .leftJoin(scriptsDrafts, eq(scriptsDrafts.scriptId, scriptsDrafts.scriptId))
            .where(and(
                isNull(scripts.deletedAt),
                isNull(pendingDeletion),
                whereScriptId || whereOldScriptId,
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
