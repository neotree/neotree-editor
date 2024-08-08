import { and, asc, eq, inArray, isNotNull, isNull, notInArray, or } from "drizzle-orm";
import { v4 } from "uuid";
import { io } from 'socket.io-client';

import logger from "@/lib/logger";
import db from "../../pg/drizzle";
import { screensDrafts, scripts, scriptsDrafts, scriptsHistory, screensHistory, diagnosesDrafts } from "../../pg/schema";
import { _getScript, _getScripts } from '../../queries/_scripts';
import { _publishScreens } from "../screens";
import { _restoreScreens } from "./_restore-screens";
import { _publishDiagnoses } from "../diagnoses";

const socket = io(process.env.NEXT_PUBLIC_APP_URL);

export * from './_import-scripts';
export * from './_delete-screens';
export * from './_delete-diagnoses';
export * from './_restore-screens';
export * from './_restore-diagnoses';

export async function _publishScripts() {
    const results: { 
        success: boolean; 
        errors?: string[]; 
    } = { success: true, };

    try {
        const drafts = await db.query.scriptsDrafts.findMany({
            columns: {
                scriptDraftId: true,
                scriptId: true,
            },
        });
        const insertData = drafts.filter(c => !c.scriptId).map(s => ({ scriptDraftId: s.scriptDraftId, }));
        const updateData = drafts.filter(c => c.scriptId).map(c => ({ scriptId: c.scriptId! }));

        const errors: string[] = [];

        if (updateData.length) {
            const res = await _updateScripts(updateData);
            res.data.forEach(c => c.errors?.forEach(e => errors.push(e)));
            res.errors?.forEach(e => errors.push(e));
        }

        if (insertData.length) {
            const res = await _createScripts(insertData);
            res.errors?.forEach(e => errors.push(e));
        }

        if (errors.length) {
            results.success = false;
            results.errors = errors;
        }
    } catch(e: any) {
        results.success = false;
        results.errors = [e.message];
        logger.error('_publishScripts ERROR', e.message);
    } finally {
        return results;
    }
}

export async function _deleteScripts(
    scriptsIds: string[],
    opts?: {
        broadcastAction?: boolean;
    },
) {
    if (scriptsIds.length) {
        const where = inArray(scripts.scriptId, scriptsIds);

        const items = await db.query.scripts.findMany({
            where,
        });

        const deletedAt = new Date();

        await db
            .update(scripts)
            .set({ deletedAt, })
            .where(where);

        await db.delete(scriptsDrafts).where(and(
            isNotNull(scriptsDrafts.scriptId),
            inArray(scriptsDrafts.scriptId, scriptsIds),
        ));

        if (scriptsIds.length) {
            await _restoreScreens({ restoreKeys: scriptsIds.map(id => `script_draft_${id}`), });
            await db.update(screensHistory).set({ restoreKey: null, }).where(inArray(screensHistory.restoreKey, scriptsIds.map(sId => `script_draft_${sId}`)));
        }

        await db.insert(scriptsHistory).values(items.map(item => ({
            version: item.version,
            scriptId: item.scriptId,
            changes: {
                action: 'delete_script',
                description: 'Delete script',
                oldValues: [{ deletedAt: null, }],
                newValues: [{ deletedAt }],
            },
        })));

        if (opts?.broadcastAction) socket.emit('data_changed', 'delete_scripts');
    }
    return true;
}

export async function _updateScriptsWithoutPublishing(
    payload: { 
        scriptId: string;
        data: Partial<typeof scriptsDrafts.$inferInsert['data']>;  
    }[],
    opts?: {
        broadcastAction?: boolean;
    },
) {
    const results: { success: boolean; error?: string; data?: any; } = { success: true }; 

    try {
        const scriptsReferences = payload.map(s => s.scriptId).filter(s => s);

        const whereScript = !scriptsReferences.length ? undefined : or(
            inArray(scriptsDrafts.scriptId, scriptsReferences),
            inArray(scriptsDrafts.scriptDraftId, scriptsReferences),
        );

        if (whereScript) {
            const drafts = await db.query.scriptsDrafts.findMany({
                where: whereScript,
            });

            let publishedScripts: typeof scripts.$inferSelect[] = [];
            if (scriptsReferences.length) {
                publishedScripts = await db.query.scripts.findMany({
                    where: and(...[
                        isNull(scripts.deletedAt),
                        inArray(scripts.scriptId, scriptsReferences),
                        ...(drafts.filter(s => s.scriptId).length ? [notInArray(scripts.scriptId, drafts.map(s => s.scriptId!))] : []),
                    ]),
                    orderBy: asc(scripts.position),
                });
            }

            const newDrafts: typeof scriptsDrafts.$inferInsert[] = [];
            let updatedDrafts = 0;

            for (const { scriptId, data } of payload) {
                const draft = drafts.filter(s => s.data.scriptId === scriptId)[0];
                const publishedScript = publishedScripts.filter(s => s.scriptId === scriptId)[0];

                if (draft) {
                    await db.update(scriptsDrafts).set({
                        data: {
                            ...draft.data,
                            ...data,
                        },
                    }).where(eq(scriptsDrafts.id, draft.id));
                    updatedDrafts++;
                } else if (publishedScript) {
                    newDrafts.push({
                        position: data.position!,
                        scriptId: publishedScript.scriptId,
                        scriptDraftId: publishedScript.scriptId,
                        data: {
                            ...publishedScript,
                            ...data,
                            version: data.version || (publishedScript.version + 1),
                        } as typeof newDrafts[0]['data'],
                    });
                }
            }

            if (newDrafts.length) {
                await db.insert(scriptsDrafts).values(newDrafts);
                if (opts?.broadcastAction) socket.emit('data_changed', 'create_scripts_drafts');
            }

            if (opts?.broadcastAction && updatedDrafts) if (opts?.broadcastAction) socket.emit('data_changed', 'update_scripts_drafts');
        }
    } catch(e: any) {
        results.success = false;
        results.error = e.message;
        logger.error('_orderScripts ERROR', e);
    } finally {
        return results;
    }
}

export async function _createScripts(
    data: ({
        scriptDraftId: string;
    })[], 
    opts?: {
        returnInserted?: boolean;
        broadcastAction?: boolean;
    },
) {
    let results: {
        success: boolean;
        errors?: string[];
        inserted: Awaited<ReturnType<typeof _getScripts>>['data'];
    } = { inserted: [], success: false, };

    try {
        const insertData: typeof scripts.$inferInsert[] = [];

        let drafts = !data.length ? [] : await db.query.scriptsDrafts.findMany({
            where: inArray(scriptsDrafts.scriptDraftId, data.map(c => c.scriptDraftId)),
        });

        // we'll use data before to compare changes
        let dataBefore: typeof scripts.$inferSelect[] = [];
        if (drafts.filter(c => c.scriptId).length) {
            dataBefore = await db.query.scripts.findMany({
                where: inArray(scripts.scriptId, drafts.filter(c => c.scriptId).map(c => c.scriptId!))
            });
        }
        
        for(const { id, data } of drafts) {
            const scriptId = data.scriptId || v4();
            insertData.push({ ...data, scriptId, });
            drafts = drafts.map(d => {
                if (d.id === id) d.data.scriptId = scriptId;
                return d;
            });
        }

        await db.insert(scripts).values(insertData);

        const inserted = await _getScripts({ scriptIds: insertData.map(c => c.scriptId!), });

        for(const { scriptId } of inserted.data) {
            const draft = drafts.filter(s => s.data.scriptId === scriptId)[0];
            await db.update(screensDrafts).set({ scriptId }).where(eq(screensDrafts.scriptDraftId, draft.scriptDraftId));
            await db.update(diagnosesDrafts).set({ scriptId }).where(eq(diagnosesDrafts.scriptDraftId, draft.scriptDraftId));
        }

        const publishScreens = await _publishScreens({ scriptsReferences: data.map(s => s.scriptDraftId), });
        if (publishScreens.errors) results.errors = [...(results.errors || []), ...publishScreens.errors];

        const publishDiagnoses = await _publishDiagnoses({ scriptsReferences: data.map(s => s.scriptDraftId), });
        if (publishDiagnoses.errors) results.errors = [...(results.errors || []), ...publishDiagnoses.errors];

        results.inserted = opts?.returnInserted ? inserted.data : [];
        results.success = true;

        await _saveScriptsHistory({ drafts, previous: dataBefore, });

        if (drafts.length) {
            await db.delete(scriptsDrafts).where(inArray(scriptsDrafts.id, drafts.map(d => d.id)));
            if (drafts.length) {
                await _restoreScreens({ restoreKeys: drafts.map(d => `script_draft_${d.scriptDraftId}`), });
                await db.update(screensHistory).set({ restoreKey: null, }).where(inArray(screensHistory.restoreKey, drafts.map(s => `script_draft_${s.scriptDraftId}`)));
            }
        }

        if (opts?.broadcastAction) socket.emit('data_changed', 'create_scripts');
    } catch(e: any) {
        results.errors = [e.message];
        logger.error('_createScripts ERROR', e.message);
    } finally {
        return results;
    }
}

export async function _updateScripts(
    data: ({
        scriptId: string;
    })[], 
    opts?: {
        returnUpdated?: boolean;
        broadcastAction?: boolean;
    },
) {
    const results: {
        errors?: string[];
        data: ({ 
            scriptId: string;
            script?: Awaited<ReturnType<typeof _getScript>>;
            errors?: string[]; 
        })[];
    } = { data: [], };
    try {
        let drafts = !data.length ? [] : await db.query.scriptsDrafts.findMany({
            where: inArray(scriptsDrafts.scriptId, data.map(c => c.scriptId)),
        });

        // we'll use data before to compare changes
        let dataBefore: typeof scripts.$inferSelect[] = [];
        if (drafts.filter(c => c.scriptId).length) {
            dataBefore = await db.query.scripts.findMany({
                where: inArray(scripts.scriptId, drafts.filter(c => c.scriptId).map(c => c.scriptId!))
            });
        }

        for(const { scriptId: _scriptId, data: c } of drafts) {
            const scriptId = _scriptId!;

            const { scriptId: __scriptId, id, oldScriptId, createdAt, updatedAt, deletedAt, ...payload } = c;

            try {
                const updates = {
                    ...payload,
                    publishDate: new Date(),
                };
                await db
                    .update(scripts)
                    .set(updates)
                    .where(eq(scripts.scriptId, scriptId));

                const script = !opts?.returnUpdated ? undefined : await _getScript(scriptId);

                results.data.push({ scriptId, script, });
            } catch(e: any) {
                logger.error(`_updateScripts scriptId=${scriptId}`, e.message);
                results.data.push({ scriptId, errors: [e.message], });
                drafts = drafts.filter(c => c.data.scriptId !== scriptId);
            }
        }

        await _saveScriptsHistory({ drafts: drafts, previous: dataBefore, });

        const publishScreens = await _publishScreens({ scriptsReferences: data.map(s => s.scriptId) });
        if (publishScreens.errors) results.errors = [...(results.errors || []), ...publishScreens.errors];

        if (drafts.length) {
            await db.delete(scriptsDrafts).where(inArray(scriptsDrafts.id, drafts.map(d => d.id)));
            if (drafts.length) {
                await _restoreScreens({ restoreKeys: drafts.map(d => `script_draft_${d.scriptDraftId}`), });
                await db.update(screensHistory).set({ restoreKey: null, }).where(inArray(screensHistory.restoreKey, drafts.map(s => `script_draft_${s.scriptDraftId}`)));
            }
        }

        if (opts?.broadcastAction) socket.emit('data_changed', 'update_scripts');
    } catch(e: any) {
        logger.error('_updateScripts ERROR', e);
        results.errors = [e.message, ...(results.errors || [])];
    } finally {
        return results;
    }
}

export async function _saveScriptsHistory({ previous, drafts, }: {
    drafts: typeof scriptsDrafts.$inferSelect[];
    previous: typeof scripts.$inferSelect[];
}) {
    try {
        const insertData: typeof scriptsHistory.$inferInsert[] = [];

        for(const c of drafts) {
            const changeHistoryData: typeof scriptsHistory.$inferInsert = {
                version: c?.data?.version || 1,
                scriptId: c?.data?.scriptId!,
                changes: {},
            };

            if (c?.data?.version === 1) {
                changeHistoryData.changes = {
                    action: 'create_script',
                    description: 'Create script',
                    oldValues: [],
                    newValues: [],
                };
            } else {
                const prev = previous.filter(prevC => prevC.scriptId === c?.data?.scriptId)[0];

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
                    action: 'update_script',
                    description: 'Update script',
                    oldValues,
                    newValues,
                };
            }

            insertData.push(changeHistoryData);
        }

        await db.insert(scriptsHistory).values(insertData);
    } catch(e: any) {
        logger.error(e.message);
    }
}
