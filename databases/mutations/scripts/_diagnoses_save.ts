import { desc, eq } from 'drizzle-orm';
import * as uuid from 'uuid';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { diagnoses, diagnosesDrafts } from '@/databases/pg/schema';
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

    try {
        const errors = [];

        let index = 0;
        for (const { diagnosisId: itemDiagnosisId, ...item } of data) {
            try {
                index++;

                const diagnosisId = itemDiagnosisId || uuid.v4();

                if (!errors.length) {
                    const draft = !itemDiagnosisId ? null : await db.query.diagnosesDrafts.findFirst({
                        where: eq(diagnosesDrafts.diagnosisDraftId, diagnosisId),
                    });

                    const published = (draft || !itemDiagnosisId) ? null : await db.query.diagnoses.findFirst({
                        where: eq(diagnoses.diagnosisId, diagnosisId),
                    });

                    if (draft) {
                        const data = {
                            ...draft.data,
                            ...item,
                        } as typeof draft.data;
                        
                        await db
                            .update(diagnosesDrafts)
                            .set({
                                data,
                                position: data.position,
                            }).where(eq(diagnosesDrafts.diagnosisDraftId, diagnosisId));
                    } else {
                        let position = item.position || published?.position;
                        if (!position) {
                            const confKey = await db.query.diagnoses.findFirst({
                                columns: { position: true, },
                                orderBy: desc(diagnoses.position),
                            });

                            const confKeyDraft = await db.query.diagnosesDrafts.findFirst({
                                columns: { position: true, },
                                orderBy: desc(diagnosesDrafts.position),
                            });

                            position = Math.max(0, confKey?.position || 0, confKeyDraft?.position || 0) + 1;
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
                                where: eq(diagnosesDrafts.scriptDraftId, data.scriptId),
                                columns: { scriptDraftId: true, },
                            });

                            await db.insert(diagnosesDrafts).values({
                                data,
                                scriptId: data.scriptId,
                                scriptDraftId: scriptDraft?.scriptDraftId,
                                diagnosisDraftId: diagnosisId,
                                position: data.position,
                                diagnosisId: published?.diagnosisId,
                            });
                        } else {
                            errors.push(`Could not save item ${index}: ${data.name}, because scriptId was not specified`);
                        }
                    }
                }
            } catch(e: any) {
                errors.push(e.message);
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
