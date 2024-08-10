import { and, eq, inArray, isNull, notInArray, or } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { diagnoses, diagnosesDrafts, pendingDeletion, } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { DiagnosisSymptom, ScriptImage } from "@/types";

export type GetDiagnosesParams = {
    diagnosesIds?: string[];
    scriptsIds?: string[];
    returnDraftsIfExist?: boolean;
};

export type DiagnosisType = typeof diagnoses.$inferSelect & {
    isDraft: boolean;
    symptoms: DiagnosisSymptom[];
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
        const { 
            scriptsIds: _scriptsIds = [],
            diagnosesIds: _diagnosesIds, 
            returnDraftsIfExist, 
        } = { ...params };

        let diagnosesIds = _diagnosesIds || [];
        const scriptsIds = _scriptsIds.filter(s => uuid.validate(s));
        const oldScriptsIds = _scriptsIds.filter(s => !uuid.validate(s));
        
        // unpublished diagnoses conditions
        const whereDiagnosesDraftsScriptsIds = !scriptsIds?.length ? undefined : inArray(diagnosesDrafts.scriptId, scriptsIds);
        const whereDiagnosesDraftsIds = !diagnosesIds?.length ? 
            undefined 
            : 
            inArray(diagnosesDrafts.diagnosisDraftId, diagnosesIds.map(id => uuid.validate(id) ? id : uuid.v4()));
        const whereDiagnosesDrafts = [
            whereDiagnosesDraftsScriptsIds,
            whereDiagnosesDraftsIds,
        ];
        const drafts = !returnDraftsIfExist ? [] : await db.query.diagnosesDrafts.findMany({
            where: and(...whereDiagnosesDrafts),
        });
        diagnosesIds = diagnosesIds.filter(id => !drafts.map(d => d.diagnosisDraftId).includes(id));

        // published diagnoses conditions
        const whereDiagnosesScriptsIds = !scriptsIds?.length ? undefined : inArray(diagnoses.scriptId, scriptsIds);
        const whereDiagnosesOldScriptsIds = !oldScriptsIds?.length ? undefined : inArray(diagnoses.oldScriptId, oldScriptsIds);
        const whereDiagnosesIdsNotIn = !drafts.length ? undefined : notInArray(diagnoses.diagnosisId, drafts.map(d => d.diagnosisDraftId));
        const whereDiagnosesIds = !diagnosesIds?.length ? 
            undefined 
            : 
            inArray(diagnoses.diagnosisId, diagnosesIds.filter(id => uuid.validate(id)));
        const whereOldDiagnosesIds = !diagnosesIds?.length ? 
            undefined 
            : 
            inArray(diagnoses.oldDiagnosisId, diagnosesIds.filter(id => !uuid.validate(id)));
        const whereDiagnoses = [
            isNull(diagnoses.deletedAt),
            isNull(pendingDeletion),
            whereDiagnosesScriptsIds,
            whereDiagnosesOldScriptsIds,
            ...((!whereDiagnosesIds || !whereOldDiagnosesIds) ? [] : [or(whereDiagnosesIds, whereOldDiagnosesIds)]),
            whereDiagnosesIdsNotIn,
        ];

        const publishedRes = await db
            .select({
                diagnosis: diagnoses,
                pendingDeletion: pendingDeletion,
            })
            .from(diagnoses)
            .leftJoin(pendingDeletion, eq(pendingDeletion.diagnosisId, diagnoses.diagnosisId))
            .where(!whereDiagnoses.length ? undefined : and(...whereDiagnoses));

        const published = publishedRes.map(s => s.diagnosis);

        const inPendingDeletion = !published.length ? [] : await db.query.pendingDeletion.findMany({
            where: inArray(pendingDeletion.diagnosisId, published.map(s => s.diagnosisId)),
            columns: { diagnosisId: true, },
        });

        const responseData = [
            ...published.map(s => ({
                ...s,
                isDraft: false,
            } as GetDiagnosesResults['data'][0])),

            ...drafts.map((s => ({
                ...s.data,
                isDraft: true,
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
            where: whereDiagnosisId,
        }) : undefined;

        let responseData = !draft ? null : {
            ...draft.data,
            isDraft: false,
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
            .leftJoin(diagnosesDrafts, eq(diagnosesDrafts.diagnosisId, diagnosesDrafts.diagnosisId))
            .where(and(
                isNull(diagnoses.deletedAt),
                isNull(pendingDeletion),
                whereDiagnosisId || whereOldDiagnosisId,
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
