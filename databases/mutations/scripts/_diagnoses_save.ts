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

async function resolveScriptReference(
    executor: DbOrTransaction,
    scriptId: string,
) {
    /**
     * Resolve against the merged entity state, not only the incoming payload.
     * Partial saves can omit scriptId in the request while the final merged
     * diagnosis still legitimately belongs to a script.
     */
    const scriptDraft = await executor.query.scriptsDrafts.findFirst({
        where: eq(scriptsDrafts.scriptDraftId, scriptId),
        columns: { scriptDraftId: true, },
    });

    const publishedScript = await executor.query.scripts.findFirst({
        where: eq(scripts.scriptId, scriptId),
        columns: { scriptId: true, },
    });

    return {
        scriptDraftId: scriptDraft?.scriptDraftId,
        scriptId: publishedScript?.scriptId,
    };
}

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
        let index = 0;
        for (const { diagnosisId: itemDiagnosisId, ...item } of data) {
            try {
                index++;

                const diagnosisId = itemDiagnosisId || uuid.v4();

                if (!errors.length) {
                    const draft = !itemDiagnosisId ? null : await executor.query.diagnosesDrafts.findFirst({
                        where: eq(diagnosesDrafts.diagnosisDraftId, diagnosisId),
                    });

                    const published = (draft || !itemDiagnosisId) ? null : await executor.query.diagnoses.findFirst({
                        where: eq(diagnoses.diagnosisId, diagnosisId),
                    });

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
                            const diagnosis = await executor.query.diagnoses.findFirst({
                                columns: { position: true, },
                                orderBy: desc(diagnoses.position),
                            });

                            const diagnosisDraft = await executor.query.diagnosesDrafts.findFirst({
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
                            const { scriptDraftId, scriptId } = await resolveScriptReference(executor, data.scriptId);

                            if (scriptDraftId || scriptId) {
                                const q = executor.insert(diagnosesDrafts).values({
                                    data,
                                    scriptId,
                                    scriptDraftId,
                                    diagnosisDraftId: diagnosisId,
                                    position: data.position,
                                    diagnosisId: published?.diagnosisId,
                                    createdByUserId: userId,
                                    draftOrigin: requestedDraftOrigin,
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
        if (!response?.errors?.length && broadcastAction && !syncSilently) socket.emit('data_changed', 'save_diagnoses');
        return response;
    }
}
