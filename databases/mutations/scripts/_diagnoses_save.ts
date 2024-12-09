import { desc, eq, Query } from 'drizzle-orm';
import * as uuid from 'uuid';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { diagnoses, diagnosesDrafts, scripts, scriptsDrafts } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { DiagnosisType } from '../../queries/scripts/_diagnoses_get';

export type SaveDiagnosesData = Partial<DiagnosisType>;

export type SaveDiagnosesResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _saveDiagnoses({ data, broadcastAction, }: {
    data: SaveDiagnosesData[],
    broadcastAction?: boolean,
}) {
    const response: SaveDiagnosesResponse = { success: false, };

    const errors = [];
    let sqlInfo: { [key: string]: Query; } = {};

    try {
        let index = 0;
        for (const { diagnosisId: itemDiagnosisId, ...item } of data) {
            try {
                index++;

                const diagnosisId = itemDiagnosisId || uuid.v4();

                if (!errors.length) {
                    const getDiagnosisDraftQuery = db.query.diagnosesDrafts.findFirst({
                        where: eq(diagnosesDrafts.diagnosisDraftId, diagnosisId),
                    });

                    sqlInfo[`${diagnosisId} - getDiagnosisDraftQuery`] = getDiagnosisDraftQuery.toSQL();

                    const draft = !itemDiagnosisId ? null : await getDiagnosisDraftQuery.execute();

                    const getPublishedDiagnosisQuery = db.query.diagnoses.findFirst({
                        where: eq(diagnoses.diagnosisId, diagnosisId),
                    });

                    sqlInfo[`${diagnosisId} - getPublishedDiagnosisQuery`] = getPublishedDiagnosisQuery.toSQL();

                    const published = (draft || !itemDiagnosisId) ? null : await getPublishedDiagnosisQuery.execute();

                    if (draft) {
                        const data = {
                            ...draft.data,
                            ...item,
                        } as typeof draft.data;
                        
                        const q = db
                            .update(diagnosesDrafts)
                            .set({
                                data,
                                position: data.position,
                            }).where(eq(diagnosesDrafts.diagnosisDraftId, diagnosisId));

                        sqlInfo[`${diagnosisId} - updateDiagnosisDraft`] = q.toSQL();

                        await q.execute();
                    } else {
                        let position = item.position || published?.position;
                        if (!position) {
                            const diagnosis = await db.query.diagnoses.findFirst({
                                columns: { position: true, },
                                orderBy: desc(diagnoses.position),
                            });

                            const diagnosisDraft = await db.query.diagnosesDrafts.findFirst({
                                columns: { position: true, },
                                orderBy: desc(diagnosesDrafts.position),
                            });

                            position = Math.max(0, diagnosis?.position || 0, diagnosisDraft?.position || 0) + 1;
                        }

                        const data = {
                            ...published,
                            ...item,
                            diagnosisId,
                            version: published?.version ? (published.version + 1) : 1,
                            position,
                        } as typeof diagnosesDrafts.$inferInsert['data'];

                        if (data.scriptId) {
                            const scriptDraft = await db.query.scriptsDrafts.findFirst({
                                where: eq(scriptsDrafts.scriptDraftId, data.scriptId),
                                columns: { scriptDraftId: true, },
                            });

                            const publishedScript = await db.query.scripts.findFirst({
                                where: eq(scripts.scriptId, data.scriptId),
                                columns: { scriptId: true, },
                            });

                            if (scriptDraft || publishedScript) {
                                const q = db.insert(diagnosesDrafts).values({
                                    data,
                                    scriptId: publishedScript?.scriptId,
                                    scriptDraftId: scriptDraft?.scriptDraftId,
                                    diagnosisDraftId: diagnosisId,
                                    position: data.position,
                                    diagnosisId: published?.diagnosisId,
                                });

                                sqlInfo[`${diagnosisId} - createDiagnosisDraft`] = q.toSQL();

                                await q.execute();
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
        if (!response?.errors?.length && broadcastAction) socket.emit('data_changed', 'save_diagnoses');
        return response;
    }
}
