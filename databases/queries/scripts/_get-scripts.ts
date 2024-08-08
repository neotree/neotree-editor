import { and, eq, inArray, isNull, notInArray, or } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { scripts, scriptsDrafts, pendingDeletion, } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { ScriptField } from "@/types";

export type GetScriptsParams = {
    scriptsIds?: string[];
    returnDraftsIfExist?: boolean;
};

export type GetScriptsResults = {
    data: (typeof scripts.$inferSelect & {
        isDraft: boolean;
        nuidSearchFields: ScriptField[];
    })[];
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
        const drafts = !returnDraftsIfExist ? [] : await db.query.scriptsDrafts.findMany({
            where: and(...whereScriptsDrafts),
        });
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
            })
            .from(scripts)
            .leftJoin(pendingDeletion, eq(pendingDeletion.scriptId, scripts.scriptId))
            .where(!whereScripts.length ? undefined : and(...whereScripts));

        const published = publishedRes.map(s => s.script);

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
    data?: null | typeof scripts.$inferSelect & {
        isDraft: boolean;
        nuidSearchFields: ScriptField[];
    };
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

        const published = await db.query.scripts.findFirst({
            where: and(
                isNull(scripts.deletedAt),
                whereScriptId || whereOldScriptId,
            ),
            with: {
                draft: true,
            },
        });

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
