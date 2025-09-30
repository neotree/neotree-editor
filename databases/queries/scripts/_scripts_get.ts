import { and, eq, inArray, isNull, or } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { scripts, scriptsDrafts, pendingDeletion, hospitals } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { ScriptField, Preferences, PrintSection,ScreenReviewField,Alias} from "@/types";
import { _getScreens } from "./_screens_get";


export type GetScriptsParams = {
    scriptsIds?: string[];
    hospitalIds?: string[];
    returnDraftsIfExist?: boolean;
    withDeleted?: boolean;
};

export type ScriptType = typeof scripts.$inferSelect & {
    isDraft: boolean;
    isDeleted: boolean;
    nuidSearchFields: ScriptField[];
    reviewConfigurations: ScreenReviewField[];
    aliases: Alias[];
    lastAlias:string;
    preferences: Preferences;
    printSections: PrintSection[];
    hospitalName: string;
    draftCreatedByUserId?: string | null;
};

export type GetScriptsResults = {
    data: ScriptType[];
    errors?: string[];
};
export type AliaseType = {
    key: string
    value: string
}

export async function _getLeanScriptIds():Promise<any> {
   const allScripts = await db.select({
               scriptId:scripts.scriptId,
             })
            .from(scripts)
            .where(
            isNull(scripts.deletedAt))
 return allScripts?.map(sid=>sid.scriptId)??[];
}

export async function _getOldScript(script:string):Promise<any> {
   const oldScript = await db.select({
               oldScript:scripts.oldScriptId,
             })
            .from(scripts)
            .where(
            eq(scripts.scriptId, script))
 return oldScript?.map(os=>os.oldScript)??[];
}




export async function _getScripts(
    params?: GetScriptsParams
): Promise<GetScriptsResults> {
    try {
       
        let { 
            scriptsIds = [], 
            hospitalIds = [],
            returnDraftsIfExist, 
        } = { ...params };

        const oldScriptsIds = scriptsIds.filter(s => !uuid.validate(s));
        scriptsIds = scriptsIds.filter(s => uuid.validate(s));

        const oldHospitalIds = hospitalIds.filter(s => !uuid.validate(s));
        hospitalIds = hospitalIds.filter(s => uuid.validate(s));

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

        if (oldHospitalIds.length) {
            const res = await db.query.hospitals.findMany({
                where: inArray(hospitals.oldHospitalId, oldHospitalIds),
                columns: { hospitalId: true, oldHospitalId: true, },
            });
            oldHospitalIds.forEach(oldHospitalId => {
                const s = res.filter(s => s.oldHospitalId === oldHospitalId)[0];
                hospitalIds.push(s?.hospitalId || uuid.v4());
            });
        }
        
        // unpublished scripts conditions
        const draftsRes = !returnDraftsIfExist ? [] : await db
            .select({
                scriptDraft: scriptsDrafts,
                hospitalName: hospitals.name,
            })
            .from(scriptsDrafts)
            .leftJoin(hospitals, eq(hospitals.hospitalId, scriptsDrafts.hospitalId))
            .where(and(
                !scriptsIds?.length ? undefined : inArray(scriptsDrafts.scriptDraftId, scriptsIds),
                !hospitalIds.length ? undefined : inArray(scriptsDrafts.hospitalId, hospitalIds),
            ));

        const drafts = draftsRes
            .map(s => ({ ...s.scriptDraft, hospitalName: s.hospitalName, }));

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
            .leftJoin(hospitals, and(
                eq(hospitals.hospitalId, scripts.hospitalId),
                isNull(hospitals.deletedAt)
            ))
            .where(and(
                isNull(scripts.deletedAt),
                isNull(pendingDeletion),
                !returnDraftsIfExist ? undefined : isNull(scriptsDrafts.scriptId),
                !scriptsIds.length ? undefined : inArray(scripts.scriptId, scriptsIds),
                !hospitalIds.length ? undefined : inArray(scripts.hospitalId, hospitalIds),
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
                hospitalName: s.hospitalName,
                isDraft: true,
                isDeleted: false,
                draftCreatedByUserId: s.createdByUserId,
            } as GetScriptsResults['data'][0])))
        ]
            .sort((a, b) => a.position - b.position)
            .filter(s => !inPendingDeletion.map(s => s.scriptId).includes(s.scriptId))
            .map(s => ({
                ...s,
                hospitalId: s.hospitalName ? s.hospitalId : null,
            }));
        
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

export type GetAliasResults = {
    data?: null | Alias[];
    lastAlias?: string;
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
            .leftJoin(hospitals, and(
                eq(hospitals.hospitalId, scripts.hospitalId),
                isNull(hospitals.deletedAt)
            ))
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
            hospitalId: data.hospitalName ? data.hospitalId : null,
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

