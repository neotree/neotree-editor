import { desc, eq, inArray, Query } from 'drizzle-orm';
import * as uuid from 'uuid';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import type { DbOrTransaction } from '@/databases/pg/db-client';
import { diagnoses, diagnosesDrafts, scripts, scriptsDrafts } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { DiagnosisType } from '../../queries/scripts/_diagnoses_get';
import { removeHexCharacters } from '../../utils'
import type { DraftOrigin } from './_screens_save';

export type SaveDiagnosesData = Partial<DiagnosisType>;

export type SaveDiagnosesResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _saveDiagnoses({ data, broadcastAction, syncSilently, userId, client, draftOrigin: requestedDraftOrigin = "editor" }: {
    data: SaveDiagnosesData[],
    broadcastAction?: boolean;
    userId?: string;
    syncSilently?: boolean;
    client?: DbOrTransaction;
    draftOrigin?: DraftOrigin;
}) {
    const response: SaveDiagnosesResponse = { success: false, };
    data = removeHexCharacters(data)
    const errors = [];
    let sqlInfo: { [key: string]: Query; } = {};
    const executor = client || db;

    try {
        const existingDiagnosisIds = Array.from(new Set(
            data.map((item) => item.diagnosisId).filter((id): id is string => !!id)
        ));
        const referencedScriptIds = Array.from(new Set(
            data.map((item) => item.scriptId).filter((id): id is string => !!id)
        ));

        const [
            drafts,
            publishedDiagnoses,
            publishedScripts,
            scriptDraftsRows,
            maxPublishedDiagnosis,
            maxDraftDiagnosis,
        ] = await Promise.all([
            existingDiagnosisIds.length
                ? executor.query.diagnosesDrafts.findMany({
                    where: inArray(diagnosesDrafts.diagnosisDraftId, existingDiagnosisIds),
                })
                : Promise.resolve([]),
            existingDiagnosisIds.length
                ? executor.query.diagnoses.findMany({
                    where: inArray(diagnoses.diagnosisId, existingDiagnosisIds),
                })
                : Promise.resolve([]),
            referencedScriptIds.length
                ? executor.query.scripts.findMany({
                    where: inArray(scripts.scriptId, referencedScriptIds),
                    columns: { scriptId: true, },
                })
                : Promise.resolve([]),
            referencedScriptIds.length
                ? executor.query.scriptsDrafts.findMany({
                    where: inArray(scriptsDrafts.scriptDraftId, referencedScriptIds),
                    columns: { scriptDraftId: true, },
                })
                : Promise.resolve([]),
            executor.query.diagnoses.findFirst({
                columns: { position: true, },
                orderBy: desc(diagnoses.position),
            }),
            executor.query.diagnosesDrafts.findFirst({
                columns: { position: true, },
                orderBy: desc(diagnosesDrafts.position),
            }),
        ]);

        const draftsById = new Map(drafts.map((draft) => [draft.diagnosisDraftId, draft]));
        const publishedDiagnosesById = new Map(publishedDiagnoses.map((diagnosis) => [diagnosis.diagnosisId, diagnosis]));
        const publishedScriptIds = new Set(publishedScripts.map((script) => script.scriptId));
        const scriptDraftIds = new Set(scriptDraftsRows.map((draft) => draft.scriptDraftId).filter(Boolean));
        let nextPosition = Math.max(0, maxPublishedDiagnosis?.position || 0, maxDraftDiagnosis?.position || 0) + 1;

        let index = 0;
        for (const { diagnosisId: itemDiagnosisId, ...item } of data) {
            try {
                index++;

                const diagnosisId = itemDiagnosisId || uuid.v4();

                if (!errors.length) {
                    const draft = !itemDiagnosisId ? null : draftsById.get(diagnosisId) || null;
                    const published = (draft || !itemDiagnosisId) ? null : publishedDiagnosesById.get(diagnosisId) || null;

                    if (draft) {
                        const data = {
                            ...draft.data,
                            ...item,
                        } as typeof draft.data;
                        
                        const persistedDraftOrigin = requestedDraftOrigin;
                        const q = executor
                            .update(diagnosesDrafts)
                            .set({
                                data,
                                position: data.position,
                                draftOrigin: persistedDraftOrigin,
                            }).where(eq(diagnosesDrafts.diagnosisDraftId, diagnosisId));

                        sqlInfo[`${diagnosisId} - updateDiagnosisDraft`] = q.toSQL();

                        await q.execute();
                    } else {
                        let position = item.position || published?.position;
                        if (!position) {
                            position = nextPosition;
                            nextPosition++;
                        }

                        const data = {
                            ...published,
                            ...item,
                            diagnosisId,
                            version: published?.version ? (published.version + 1) : 1,
                            position,
                        } as typeof diagnosesDrafts.$inferInsert['data'];

                        if (data.scriptId) {
                            const scriptDraftId = scriptDraftIds.has(data.scriptId) ? data.scriptId : undefined;
                            const publishedScriptId = publishedScriptIds.has(data.scriptId) ? data.scriptId : undefined;

                            if (scriptDraftId || publishedScriptId) {
                                const q = executor.insert(diagnosesDrafts).values({
                                    data,
                                    scriptId: publishedScriptId,
                                    scriptDraftId,
                                    diagnosisDraftId: diagnosisId,
                                    position: data.position,
                                    diagnosisId: published?.diagnosisId,
                                    createdByUserId: userId,
                                    draftOrigin: requestedDraftOrigin,
                                });

                                sqlInfo[`${diagnosisId} - createDiagnosisDraft`] = q.toSQL();

                                await q.execute();
                                draftsById.set(diagnosisId, {
                                    diagnosisDraftId: diagnosisId,
                                    diagnosisId: published?.diagnosisId,
                                    scriptId: publishedScriptId || null,
                                    scriptDraftId: scriptDraftId || null,
                                    createdByUserId: userId || null,
                                    data,
                                    position: data.position || null,
                                } as typeof diagnosesDrafts.$inferSelect);
                            } else {
                                errors.push(`Could not save diagnosis ${index}: ${data.name}, because script was not found`);
                            }
                        } else {
                            errors.push(`Could not save diagnosis ${index}: ${data.name}, because scriptId was not specified`);
                        }
                    }
                }
            } catch(e: any) {
                errors.push(e.message);
                logger.error('saveDiagnosis SQL (FAILED)', JSON.stringify(sqlInfo));
            }
        }

        if (errors.length) {
            response.errors = errors;
        } else {
            response.success = true;
        }
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_saveDiagnoses ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction && !syncSilently) socket.emit('data_changed', 'save_diagnoses');
        return response;
    }
}
