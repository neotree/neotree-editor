import { and, eq, inArray, isNull, notInArray, or } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { diagnoses, diagnosesDrafts, pendingDeletion, scripts, } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { DiagnosisSymptom, Preferences, ScriptImage } from "@/types";

export type GetDiagnosesParams = {
    diagnosesIds?: string[];
    scriptsIds?: string[];
    returnDraftsIfExist?: boolean;
    withDeleted?: boolean;
};

export type DiagnosisType = typeof diagnoses.$inferSelect & {
    isDraft: boolean;
    isDeleted: boolean;
    symptoms: DiagnosisSymptom[];
    preferences: Preferences;
    image1: null | ScriptImage;
    image2: null | ScriptImage;
    image3: null | ScriptImage;
};

export type GetDiagnosesResults = {
    data: DiagnosisType[];
    errors?: string[];
};

export async function _getDiagnoses(
    params?: GetDiagnosesParams
): Promise<GetDiagnosesResults> {
    try {
        let { 
            scriptsIds: scriptsIds = [],
            diagnosesIds: diagnosesIds = [], 
            returnDraftsIfExist, 
        } = { ...params };

        const oldDiagnosesIds = diagnosesIds.filter(s => !uuid.validate(s));
        diagnosesIds = diagnosesIds.filter(s => uuid.validate(s));

        if (oldDiagnosesIds.length) {
            const res = await db.query.diagnoses.findMany({
                where: inArray(diagnoses.oldDiagnosisId, oldDiagnosesIds),
                columns: { diagnosisId: true, oldDiagnosisId: true, },
            });
            oldDiagnosesIds.forEach(oldDiagnosisId => {
                const s = res.filter(s => s.oldDiagnosisId === oldDiagnosisId)[0];
                diagnosesIds.push(s?.diagnosisId || uuid.v4());
            });
        }

        scriptsIds = scriptsIds.filter(s => uuid.validate(s));
        const _oldScriptsIds = scriptsIds.filter(s => !uuid.validate(s));

        if (_oldScriptsIds.length) {
            const res = await db.query.scripts.findMany({
                where: inArray(scripts.oldScriptId, _oldScriptsIds),
                columns: { scriptId: true, oldScriptId: true, },
            });
            _oldScriptsIds.forEach(oldScriptId => {
                const s = res.filter(s => s.oldScriptId === oldScriptId)[0];
                scriptsIds.push(s?.scriptId || uuid.v4());
            });
        }
        
        // unpublished diagnoses conditions
        const drafts = !returnDraftsIfExist ? [] : await db.query.diagnosesDrafts.findMany({
            where: and(
                !scriptsIds?.length ? undefined : or(
                    inArray(diagnosesDrafts.scriptId, scriptsIds),
                    inArray(diagnosesDrafts.scriptDraftId, scriptsIds)
                ),
                !diagnosesIds?.length ? undefined : inArray(diagnosesDrafts.diagnosisDraftId, diagnosesIds)
            ),
        });

        // published diagnoses conditions
        const publishedRes = await db
            .select({
                diagnosis: diagnoses,
                pendingDeletion: pendingDeletion,
            })
            .from(diagnoses)
            .leftJoin(pendingDeletion, eq(pendingDeletion.diagnosisId, diagnoses.diagnosisId))
            .leftJoin(diagnosesDrafts, eq(diagnosesDrafts.diagnosisId, diagnoses.diagnosisId))
            .where(and(
                isNull(diagnoses.deletedAt),
                isNull(pendingDeletion),
                !returnDraftsIfExist ? undefined : isNull(diagnosesDrafts.diagnosisId),
                !scriptsIds?.length ? undefined : inArray(diagnoses.scriptId, scriptsIds),
                !diagnosesIds?.length ? undefined : inArray(diagnoses.diagnosisId, diagnosesIds),
            ));

        const published = publishedRes.map(s => s.diagnosis);

        const inPendingDeletion = !published.length ? [] : await db.query.pendingDeletion.findMany({
            where: inArray(pendingDeletion.diagnosisId, published.map(s => s.diagnosisId)),
            columns: { diagnosisId: true, },
        });

        const responseData = [
            ...published.map(s => ({
                ...s,
                isDraft: false,
                isDeleted: false,
            } as GetDiagnosesResults['data'][0])),

            ...drafts.map((s => ({
                ...s.data,
                isDraft: true,
                isDeleted: false,
            } as GetDiagnosesResults['data'][0])))
        ]
            .sort((a, b) => a.position - b.position)
            .filter(s => !inPendingDeletion.map(s => s.diagnosisId).includes(s.diagnosisId));

        return  { 
            data: responseData,
        };
    } catch(e: any) {
        logger.error('_getDiagnoses ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}

export type GetDiagnosisResults = {
    data?: null | DiagnosisType;
    errors?: string[];
};

export async function _getDiagnosis(
    params: {
        diagnosisId: string,
        returnDraftIfExists?: boolean;
    },
): Promise<GetDiagnosisResults> {
    const { diagnosisId, returnDraftIfExists, } = { ...params };

    try {
        if (!diagnosisId) throw new Error('Missing diagnosisId');

        const whereDiagnosisId = uuid.validate(diagnosisId) ? eq(diagnoses.diagnosisId, diagnosisId) : undefined;
        const whereOldDiagnosisId = !uuid.validate(diagnosisId) ? eq(diagnoses.oldDiagnosisId, diagnosisId) : undefined;
        const whereDiagnosisDraftId = !whereDiagnosisId ? undefined : eq(diagnosesDrafts.diagnosisDraftId, diagnosisId);

        let draft = (returnDraftIfExists && whereDiagnosisDraftId) ? await db.query.diagnosesDrafts.findFirst({
            where: whereDiagnosisDraftId,
        }) : undefined;

        let responseData = !draft ? null : {
            ...draft.data,
            isDraft: false,
            isDeleted: false,
        } as GetDiagnosisResults['data'];

        if (responseData) return { data: responseData, };

        const publishedRes = await db
            .select({
                diagnosis: diagnoses,
                pendingDeletion,
                draft: diagnosesDrafts,
            })
            .from(diagnoses)
            .leftJoin(pendingDeletion, eq(pendingDeletion.diagnosisId, diagnoses.diagnosisId))
            .leftJoin(diagnosesDrafts, eq(diagnoses.diagnosisId, diagnosesDrafts.diagnosisDraftId))
            .where(and(
                isNull(diagnoses.deletedAt),
                isNull(pendingDeletion),
                or(whereDiagnosisId, whereOldDiagnosisId)
            ));

        const published = !publishedRes[0] ? null : {
            ...publishedRes[0].diagnosis,
            draft: publishedRes[0].draft || undefined,
        };

        draft = returnDraftIfExists ? published?.draft : undefined;

        const data = (draft?.data || published) as GetDiagnosisResults['data'];

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
        logger.error('_getDiagnosis ERROR', e.message);
        return { errors: [e.message], };
    }
} 
