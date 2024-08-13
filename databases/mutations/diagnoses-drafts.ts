import { eq, inArray } from "drizzle-orm";
import { v4 } from "uuid";

import socket  from '@/lib/socket';
import db from "../pg/drizzle";
import { diagnosesDrafts } from "../pg/schema";
import { _getDiagnosisDraft, _getDiagnosesDrafts } from '../queries/diagnoses-drafts';
import { _listDiagnoses } from "../queries/diagnoses";

export async function _deleteDiagnosesDrafts(
    diagnosesDraftsIds: string[],
    opts?: {
        broadcastAction?: boolean;
    }
) {
    if (diagnosesDraftsIds.length) {
        await db.delete(diagnosesDrafts).where(inArray(diagnosesDrafts.diagnosisDraftId, diagnosesDraftsIds));
        // if (opts?.broadcastAction) socket.emit('data_changed', { action: 'delete_diagnoses_drafts', data: diagnosesDraftsIds, });
        if (opts?.broadcastAction) socket.emit('data_changed', 'delete_diagnoses_drafts');
    }
    return true;
}

export async function _deleteAllDiagnosesDrafts(
    opts?: {
        broadcastAction?: boolean;
    }
) {
    const res = await db.delete(diagnosesDrafts);
    if (opts?.broadcastAction) socket.emit('data_changed', 'delete_diagnoses_drafts');
    return res;
}

export async function _createDiagnosesDrafts(
    data: (typeof diagnosesDrafts.$inferInsert & {
        scriptId?: string;
        scriptDraftId?: string;
        diagnosisDraftId: string;
        data: Exclude<(typeof diagnosesDrafts.$inferInsert)['data'], 'version'>;
    })[], 
    opts?: {
        returnInserted?: boolean;
        broadcastAction?: boolean;
    }
) {
    let results: {
        success: boolean;
        error?: string;
        inserted: Awaited<ReturnType<typeof _getDiagnosesDrafts>>['data'];
    } = { inserted: [], success: false, };

    try {
        const missingScriptsReferences = data.filter(s => !s.scriptDraftId && !s.scriptId);

        if (missingScriptsReferences.length) throw new Error('Missing scripts references');

        const diagnosesList = await _listDiagnoses({ scriptsReferences: data.map(s => s.scriptId! || s.scriptDraftId!), });
        const lastPosition = diagnosesList.data.length ? Math.max(...diagnosesList.data.map(s => s.position)) : 0;
        let position = lastPosition + 1;

        const insertData: typeof diagnosesDrafts.$inferInsert[] = [];
        
        for(const s of data) {
            let diagnosisDraftId = s.diagnosisId || s.data.diagnosisId;
            const existing = !diagnosisDraftId ? null : await db.query.diagnosesDrafts.findFirst({
                where: eq(diagnosesDrafts.diagnosisDraftId, diagnosisDraftId),
            });

            if (!existing) {
                insertData.push({
                    ...s,
                    data: {
                        ...s.data,
                        position: s.diagnosisId ? s.data.position : position,
                    },
                    diagnosisDraftId: diagnosisDraftId || v4(),
                    scriptId: s.scriptId,
                    scriptDraftId: s.scriptDraftId,
                });
                if (!s.diagnosisId) position++;
            }
        }

        if (insertData.length) await db.insert(diagnosesDrafts).values(insertData);
        
        if (opts?.returnInserted) {
            const inserted = await _getDiagnosesDrafts({ diagnosisDraftIds: insertData.map(u => u.diagnosisDraftId!), });
            results.inserted = inserted.data;
        }
        results.success = true;
        if (opts?.broadcastAction) socket.emit('data_changed', 'create_diagnoses_drafts');
    } catch(e: any) {
        results.error = e.message;
    } finally {
        return results;
    }
}

export async function _updateDiagnosesDrafts(
    data: ({
        diagnosisDraftId: string;
        data: Partial<typeof diagnosesDrafts.$inferSelect>['data'];
    })[], 
    opts?: {
        returnUpdated?: boolean;
        broadcastAction?: boolean;
    }
) {
    const results: ({ 
        diagnosisDraftId: string;
        diagnosisDraft?: Awaited<ReturnType<typeof _getDiagnosisDraft>>;
        error?: string; 
    })[] = [];

    for(const { diagnosisDraftId, data: draft,  } of data) {
        try {
            const existing = await db.query.diagnosesDrafts.findFirst({
                where: eq(diagnosesDrafts.diagnosisDraftId, diagnosisDraftId),
            });
            const draftData = { ...existing?.data, ...draft, } as typeof draft;
            await db.update(diagnosesDrafts).set({ data: draftData, }).where(eq(diagnosesDrafts.diagnosisDraftId, diagnosisDraftId));
            const diagnosisDraft = !opts?.returnUpdated ? undefined : await _getDiagnosisDraft(diagnosisDraftId);
            results.push({ diagnosisDraftId, diagnosisDraft, });
            // if (opts?.broadcastAction) socket.emit('data_changed', { action: 'update_diagnoses_drafts', data: data.map(u => u.diagnosisDraftId), });
            if (opts?.broadcastAction) socket.emit('data_changed', 'create_diagnoses_drafts');
        } catch(e: any) {
            results.push({ diagnosisDraftId, error: e.message, });
        }
    }

    return results;
}
