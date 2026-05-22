import { and, eq, inArray, isNotNull, isNull, or } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { diagnoses, diagnosesDrafts, hospitals, pendingDeletion, scripts, scriptsDrafts } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { DiagnosisSymptom, Preferences, ScriptImage } from "@/types";

export type GetDiagnosesParams = {
    diagnosesIds?: string[];
    scriptsIds?: string[];
    returnDraftsIfExist?: boolean;
    withDeleted?: boolean;
    withImagesOnly?: boolean;
};

export type DiagnosisType = typeof diagnoses.$inferSelect & {
    isDraft: boolean;
    isDeleted: boolean;
    symptoms: DiagnosisSymptom[];
    preferences: Preferences;
    image1: null | ScriptImage;
    image2: null | ScriptImage;
    image3: null | ScriptImage;
    scriptTitle?: string;
    hospitalName?: string;
    draftCreatedByUserId?: string | null;
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
            returnDraftsIfExist = true, 
            withImagesOnly,
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
            columns: {
                diagnosisId: true,
                diagnosisDraftId: true,
                scriptId: true,
                scriptDraftId: true,
                data: true,
                createdByUserId: true,
            },
        });

        const draftPublishedScriptIds = Array.from(new Set(drafts.map((draft) => draft.scriptId).filter(Boolean))) as string[];
        const draftScriptDraftIds = Array.from(new Set(drafts.map((draft) => draft.scriptDraftId).filter(Boolean))) as string[];

        const [draftPublishedScripts, draftScriptDrafts] = await Promise.all([
            !draftPublishedScriptIds.length
                ? Promise.resolve([])
                : db.query.scripts.findMany({
                    where: inArray(scripts.scriptId, draftPublishedScriptIds),
                    columns: { scriptId: true, title: true, hospitalId: true, },
                }),
            !draftScriptDraftIds.length
                ? Promise.resolve([])
                : db.query.scriptsDrafts.findMany({
                    where: inArray(scriptsDrafts.scriptDraftId, draftScriptDraftIds),
                    columns: { scriptDraftId: true, hospitalId: true, data: true, },
                }),
        ]);

        const draftHospitalIds = Array.from(new Set([
            ...draftPublishedScripts.map((script) => script.hospitalId).filter(Boolean),
            ...draftScriptDrafts.map((script) => script.hospitalId).filter(Boolean),
        ])) as string[];

        const draftHospitals = !draftHospitalIds.length ? [] : await db.query.hospitals.findMany({
            where: inArray(hospitals.hospitalId, draftHospitalIds),
            columns: { hospitalId: true, name: true, },
        });

        const publishedScriptById = new Map(draftPublishedScripts.map((script) => [script.scriptId, script]));
        const scriptDraftById = new Map(draftScriptDrafts.map((script) => [script.scriptDraftId, script]));
        const hospitalNameById = new Map(draftHospitals.map((hospital) => [hospital.hospitalId, hospital.name]));

        // published diagnoses conditions
        const publishedRes = await db
            .select({
                diagnosis: diagnoses,
                pendingDeletion: pendingDeletion,
                script: {
                    title: scripts.title,
                    hospitalId: scripts.hospitalId,
                },
                hospital: {
                    name: hospitals.name,
                },
            })
            .from(diagnoses)
            .leftJoin(pendingDeletion, eq(pendingDeletion.diagnosisId, diagnoses.diagnosisId))
            .leftJoin(diagnosesDrafts, eq(diagnosesDrafts.diagnosisId, diagnoses.diagnosisId))
            .leftJoin(scripts, eq(scripts.scriptId, diagnoses.scriptId))
            .leftJoin(hospitals, and(
                eq(scripts.scriptId, diagnoses.scriptId),
                eq(scripts.hospitalId, hospitals.hospitalId)
            ))
            .where(and(
                isNull(diagnoses.deletedAt),
                isNull(pendingDeletion),
                !returnDraftsIfExist ? undefined : isNull(diagnosesDrafts.diagnosisId),
                !scriptsIds?.length ? undefined : inArray(diagnoses.scriptId, scriptsIds),
                !diagnosesIds?.length ? undefined : inArray(diagnoses.diagnosisId, diagnosesIds),
                !withImagesOnly ? undefined : or(
                    isNotNull(diagnoses.image1),
                    isNotNull(diagnoses.image2),
                    isNotNull(diagnoses.image3)
                ),
            ));

        const published = publishedRes.map(s => ({
            ...s.diagnosis,
            scriptTitle: s.script?.title || '',
            hospitalName: s.hospital?.name || '',
        }));

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

            ...drafts.map((s => {
                const publishedScript = s.scriptId ? publishedScriptById.get(s.scriptId) : undefined;
                const scriptDraft = s.scriptDraftId ? scriptDraftById.get(s.scriptDraftId) : undefined;
                const resolvedHospitalId = publishedScript?.hospitalId || scriptDraft?.hospitalId || null;
                const resolvedScriptTitle = publishedScript?.title || scriptDraft?.data?.title || "";

                return ({
                    ...s.data,
                    // Diagnosis drafts can be copied across scripts, so derive
                    // display metadata from the owning relation instead of the
                    // stored JSON payload.
                    scriptTitle: resolvedScriptTitle,
                    hospitalName: resolvedHospitalId ? (hospitalNameById.get(resolvedHospitalId) || "") : "",
                    isDraft: true,
                    isDeleted: false,
                    draftCreatedByUserId: s.createdByUserId,
                } as GetDiagnosesResults['data'][0]);
            }))
        ]
            .sort((a, b) => a.position - b.position)
            .filter(s => !inPendingDeletion.map(s => s.diagnosisId).includes(s.diagnosisId))
            .map(s => ({
                ...s,
                scriptTitle: s.scriptTitle || '',
                hospitalName: s.hospitalName || '',
            }));

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
            columns: {
                data: true,
                createdByUserId: true,
            },
        }) : undefined;

        let responseData = !draft ? null : {
            ...draft.data,
            draftCreatedByUserId: draft.createdByUserId,
            isDraft: true,
            isDeleted: false,
        } as GetDiagnosisResults['data'];

        if (responseData) return { data: responseData, };

        const publishedRes = await db
            .select({
                diagnosis: diagnoses,
                pendingDeletion,
                draft: {
                    data: diagnosesDrafts.data,
                    createdByUserId: diagnosesDrafts.createdByUserId,
                },
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
            draftCreatedByUserId: draft?.createdByUserId,
            isDraft: !!draft?.data,
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
