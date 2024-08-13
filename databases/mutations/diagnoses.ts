import { and, asc, desc, eq, inArray, isNotNull, isNull, notInArray, or } from "drizzle-orm";
import { v4 } from "uuid";

import logger from "@/lib/logger";
import socket  from '@/lib/socket';
import db from "../pg/drizzle";
import { diagnoses, diagnosesDrafts, diagnosesHistory } from "../pg/schema";
import { _getDiagnosis, _getDiagnoses, _listRawDiagnoses, _listDiagnoses } from '../queries/diagnoses';
import { _listScripts } from "../queries/_scripts";

export async function _copyDiagnoses(
    { diagnosesReferences, scriptsReferences }: { 
        diagnosesReferences: string[], 
        scriptsReferences: string[]; 
    },
    opts?: {
        broadcastAction?: boolean;
    }
) {
    const results: { success: boolean; error?: string; data?: any; } = { success: true }; 
    try {
        const diagnosesList = await _listRawDiagnoses({ diagnosesReferences });

        if (diagnosesList.error) throw new Error(diagnosesList.error);

        const scriptsList = await _listScripts(scriptsReferences);

        if (scriptsList.error) throw new Error(scriptsList.error);

        const insertData: typeof diagnosesDrafts.$inferInsert[] = [];

        for (const s of scriptsList.data) {
            const scriptDiagnosesList = await _listDiagnoses({ scriptsReferences: [s.scriptId! || s.scriptDraftId!], });
            const lastPosition = scriptDiagnosesList.data.length ? Math.max(...scriptDiagnosesList.data.map(s => s.position)) : 0;
            let position = lastPosition + 1;

            diagnosesList.data.forEach(data => {
                const diagnosisId = v4();
                insertData.push({
                    data: {
                        ...data,
                        diagnosisId,
                        scriptId: s.scriptId!,
                        oldDiagnosisId: null,
                        position,
                    },
                    position,
                    diagnosisId,
                    scriptId: s.scriptId,
                    scriptDraftId: s.scriptDraftId,
                });
                position++;
            });
        }

        if (insertData.length) await db.insert(diagnosesDrafts).values(insertData);

        if (opts?.broadcastAction) socket.emit('data_changed', 'create_diagnoses_drafts');
    } catch(e: any) {
        results.success = false;
        results.error = e.message;
        logger.error('_copyDiagnoses ERROR', e.message);
    } finally {
        return results;
    }
}

export async function _updateDiagnosesWithoutPublishing(
    payload: { 
        diagnosisId: string;
        scriptReference: string; 
        data: Partial<typeof diagnosesDrafts.$inferInsert['data']>;  
    }[],
    opts?: {
        broadcastAction?: boolean;
    }
) {
    const results: { success: boolean; error?: string; data?: any; } = { success: true }; 

    try {
        const scriptsReferences = payload.map(s => s.scriptReference).filter(s => s);

        const whereScript = !scriptsReferences.length ? undefined : or(
            inArray(diagnosesDrafts.scriptId, scriptsReferences),
            inArray(diagnosesDrafts.scriptDraftId, scriptsReferences),
        );

        if (whereScript) {
            const drafts = await db.query.diagnosesDrafts.findMany({
                where: whereScript,
            });

            let publishedDiagnoses: typeof diagnoses.$inferSelect[] = [];
            if (scriptsReferences.length) {
                publishedDiagnoses = await db.query.diagnoses.findMany({
                    where: and(...[
                        isNull(diagnoses.deletedAt),
                        inArray(diagnoses.scriptId, scriptsReferences),
                        ...(drafts.filter(s => s.diagnosisId).length ? [notInArray(diagnoses.diagnosisId, drafts.map(s => s.diagnosisId!))] : []),
                    ]),
                    orderBy: asc(diagnoses.position),
                });
            }

            const newDrafts: typeof diagnosesDrafts.$inferInsert[] = [];
            let updatedDrafts = 0;

            for (const { diagnosisId, data } of payload) {
                const draft = drafts.filter(s => s.data.diagnosisId === diagnosisId)[0];
                const publishedDiagnosis = publishedDiagnoses.filter(s => s.diagnosisId === diagnosisId)[0];

                if (draft) {
                    await db.update(diagnosesDrafts).set({
                        data: {
                            ...draft.data,
                            ...data,
                        },
                    }).where(eq(diagnosesDrafts.id, draft.id));
                    updatedDrafts++;
                } else if (publishedDiagnosis) {
                    newDrafts.push({
                        diagnosisId: publishedDiagnosis.diagnosisId,
                        scriptId: publishedDiagnosis.scriptId,
                        position: data.position!,
                        data: {
                            ...publishedDiagnosis,
                            ...data,
                            version: data.version || (publishedDiagnosis.version + 1),
                        },
                    });
                }
            }

            if (newDrafts.length) {
                await db.insert(diagnosesDrafts).values(newDrafts);
                if (opts?.broadcastAction) socket.emit('data_changed', 'create_diagnoses_drafts');
            }

            if (updatedDrafts) if (opts?.broadcastAction) socket.emit('data_changed', 'update_diagnoses_drafts');
        }
    } catch(e: any) {
        results.success = false;
        results.error = e.message;
        logger.error('_orderDiagnoses ERROR', e);
    } finally {
        return results;
    }
}

export async function _publishDiagnoses(opts?: {
    scriptsReferences?: string[];
    diagnosesReferences?: string[];
    broadcastAction?: boolean;
}) {
    const { scriptsReferences, diagnosesReferences, } = { ...opts, };

    const results: { success: boolean; errors?: string[]; } = { success: true };
    const errors: string[] = [];

    try {
        let updates: { diagnosisId: string; }[] = [];
        let inserts: { diagnosisDraftId: string; }[] = [];

        if (scriptsReferences?.length || diagnosesReferences?.length) {
            const res = await db.query.diagnosesDrafts.findMany({
                where: or(
                    !scriptsReferences?.length ? undefined : inArray(diagnosesDrafts.scriptId, scriptsReferences),
                    !scriptsReferences?.length ? undefined : inArray(diagnosesDrafts.scriptDraftId, scriptsReferences),
                    !diagnosesReferences?.length ? undefined : inArray(diagnosesDrafts.diagnosisId, diagnosesReferences),
                    !diagnosesReferences?.length ? undefined : inArray(diagnosesDrafts.diagnosisDraftId, diagnosesReferences),
                ),
                columns: { diagnosisId: true, diagnosisDraftId: true, },
            });

            updates = res.filter(s => s.diagnosisId).map(s => ({ diagnosisId: s.diagnosisId! }));
            inserts = res.filter(s => !s.diagnosisId).map(s => ({ diagnosisDraftId: s.diagnosisDraftId! }));
        } else {
            const _diagnosesDrafts = await db.query.diagnosesDrafts.findMany({
                where: isNotNull(diagnosesDrafts.scriptId),
                columns: { diagnosisId: true, diagnosisDraftId: true, },
            });
            updates = _diagnosesDrafts.filter(s => s.diagnosisId).map(s => ({ diagnosisId: s.diagnosisId! }));
            inserts = _diagnosesDrafts.filter(s => !s.diagnosisId).map(s => ({ diagnosisDraftId: s.diagnosisDraftId! }));
        }

        if (updates.length) {
            const res = await _updateDiagnoses(updates);
            res.forEach(s => s.error && errors.push(s.error));
        }

        if (inserts.length) {
            const res = await _createDiagnoses(inserts);
            res.errors?.forEach(e => errors.push(e));
        }

        if (errors.length) {
            results.success = false;
            results.errors = errors;
            logger.error('_publishDiagnoses ERRORS', errors);
        }
    } catch(e: any) {
        results.success = false;
        results.errors = [e.message];
        logger.error('_publishDiagnoses ERROR', e);
    } finally {
        return results;
    }
}

export async function _deleteDiagnoses(
    diagnosisIds: string[],
    opts?: {
        broadcastAction?: boolean;
    }
) {
    if (diagnosisIds.length) {
        const where = inArray(diagnoses.diagnosisId, diagnosisIds);

        const items = await db.query.diagnoses.findMany({
            where,
        });

        const deletedAt = new Date();

        await db
            .update(diagnoses)
            .set({ deletedAt, })
            .where(where);

        await db.delete(diagnosesDrafts).where(and(
            isNotNull(diagnosesDrafts.diagnosisId),
            inArray(diagnosesDrafts.diagnosisId, diagnosisIds)
        ));

        await db.insert(diagnosesHistory).values(items.map(item => ({
            version: item.version,
            diagnosisId: item.diagnosisId,
            scriptId: item.scriptId,
            changes: {
                action: 'delete_diagnosis',
                dediagnosision: 'Delete diagnosis',
                oldValues: [{ deletedAt: null, }],
                newValues: [{ deletedAt }],
            },
        })));

        if (opts?.broadcastAction) socket.emit('data_changed', 'delete_diagnoses');
    }
    return true;
}

export async function _createDiagnoses(
    data: ({
        diagnosisDraftId: string;
    })[], 
    opts?: {
        returnInserted?: boolean;
        broadcastAction?: boolean;
    }
) {
    let results: {
        success: boolean;
        errors?: string[];
        inserted: Awaited<ReturnType<typeof _getDiagnoses>>['data'];
    } = { inserted: [], success: false, };

    try {
        const insertData: typeof diagnoses.$inferInsert[] = [];

        let drafts = !data.length ? [] : await db.query.diagnosesDrafts.findMany({
            where: inArray(diagnosesDrafts.diagnosisDraftId, data.map(c => c.diagnosisDraftId)),
        });

        // we'll use data before to compare changes
        let dataBefore: typeof diagnoses.$inferSelect[] = [];
        if (drafts.filter(c => c.diagnosisId).length) {
            dataBefore = await db.query.diagnoses.findMany({
                where: inArray(diagnoses.diagnosisId, drafts.filter(c => c.diagnosisId).map(c => c.diagnosisId!))
            });
        }
        
        for(const { id, scriptId: _scriptId, data } of drafts) {
            const diagnosisId = data.diagnosisId || v4();
            const scriptId = (data.scriptId || _scriptId)!;
            const payload = { ...data, diagnosisId, scriptId };
            insertData.push(payload);
            drafts = drafts.map(d => {
                if (d.id === id) d.data.diagnosisId = diagnosisId;
                return d;
            });
            try {
                await db.insert(diagnoses).values(payload);
            } catch(e: any) {
                results.errors = [...(results.errors || []), `Error inserting ${data.name} - ${e.message}`];
            }
        }

        const inserted = await _getDiagnoses({ diagnosisIds: insertData.map(c => c.diagnosisId!), });

        results.inserted = opts?.returnInserted ? inserted.data : [];
        results.success = true;

        await _saveDiagnosesHistory({ drafts: drafts, previous: dataBefore, });

        if (drafts.length) {
            await db.delete(diagnosesDrafts).where(inArray(diagnosesDrafts.id, drafts.map(d => d.id)));
        }

        if (opts?.broadcastAction) socket.emit('data_changed', 'create_diagnoses');
    } catch(e: any) {
        results.errors = [e.message];
        logger.error('_createDiagnoses ERROR', e.message);
    } finally {
        return results;
    }
}

export async function _updateDiagnoses(
    data: ({
        diagnosisId: string;
    })[], 
    opts?: {
        returnUpdated?: boolean;
        broadcastAction?: boolean;
    }
) {
    const results: ({ 
        diagnosisId: string;
        diagnosis?: Awaited<ReturnType<typeof _getDiagnosis>>;
        error?: string; 
    })[] = [];

    let drafts = !data.length ? [] : await db.query.diagnosesDrafts.findMany({
        where: inArray(diagnosesDrafts.diagnosisId, data.map(c => c.diagnosisId)),
    });

    // we'll use data before to compare changes
    let dataBefore: typeof diagnoses.$inferSelect[] = [];
    if (drafts.filter(c => c.diagnosisId).length) {
        dataBefore = await db.query.diagnoses.findMany({
            where: inArray(diagnoses.diagnosisId, drafts.filter(c => c.diagnosisId).map(c => c.diagnosisId!))
        });
    }

    for(const { diagnosisId: _diagnosisId, data: c } of drafts) {
        const diagnosisId = _diagnosisId!;

        const { diagnosisId: __diagnosisId, id, oldDiagnosisId, createdAt, updatedAt, deletedAt, ...payload } = c;

        try {
            const updates = {
                ...payload,
                publishDate: new Date(),
            };
            await db
                .update(diagnoses)
                .set(updates)
                .where(eq(diagnoses.diagnosisId, diagnosisId));

            const diagnosis = !opts?.returnUpdated ? undefined : await _getDiagnosis(diagnosisId);

            results.push({ diagnosisId, diagnosis, });
        } catch(e: any) {
            logger.error(`_updateDiagnoses diagnosisId=${diagnosisId}`, e.message);
            results.push({ diagnosisId, error: e.message, });
            drafts = drafts.filter(c => c.data.diagnosisId !== diagnosisId);
        }
    }

    await _saveDiagnosesHistory({ drafts: drafts, previous: dataBefore, });

    if (drafts.length) {
        await db.delete(diagnosesDrafts).where(inArray(diagnosesDrafts.id, drafts.map(d => d.id)));
    }

    if (opts?.broadcastAction) socket.emit('data_changed', 'create_diagnoses');

    return results;
}

export async function _saveDiagnosesHistory({ previous, drafts, }: {
    drafts: typeof diagnosesDrafts.$inferSelect[];
    previous: typeof diagnoses.$inferSelect[];
}) {
    try {
        const insertData: typeof diagnosesHistory.$inferInsert[] = [];

        for(const c of drafts) {
            const changeHistoryData: typeof diagnosesHistory.$inferInsert = {
                version: c?.data?.version || 1,
                diagnosisId: c?.data?.diagnosisId!,
                scriptId: c?.data?.scriptId,
                changes: {},
            };

            if (c?.data?.version === 1) {
                changeHistoryData.changes = {
                    action: 'create_diagnosis',
                    dediagnosision: 'Create diagnosis',
                    oldValues: [],
                    newValues: [],
                };
            } else {
                const prev = previous.filter(prevC => prevC.diagnosisId === c?.data?.diagnosisId)[0];

                const oldValues: any[] = [];
                const newValues: any[] = [];

                Object.keys(({ ...c?.data }))
                    .filter(key => !['version', 'draft'].includes(key))
                    .forEach(_key => {
                        const key = _key as unknown as keyof typeof c.data;
                        const newValue = c.data[key];
                        const oldValue = ({ ...prev })[key as keyof typeof prev];
                        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                            oldValues.push({ [key]: oldValue, });
                            newValues.push({ [key]: newValue, });
                        }
                    });

                changeHistoryData.changes = {
                    action: 'update_diagnosis',
                    dediagnosision: 'Update diagnosis',
                    oldValues,
                    newValues,
                };
            }

            insertData.push(changeHistoryData);
        }

        await db.insert(diagnosesHistory).values(insertData);
    } catch(e: any) {
        logger.error(e.message);
    }
}
