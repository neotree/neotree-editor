import { and, asc, desc, eq, inArray, isNotNull, isNull, notInArray, or } from "drizzle-orm";
import { v4 } from "uuid";
import { io } from 'socket.io-client';

import db from "../pg/drizzle";
import { screens, screensDrafts, screensHistory } from "../pg/schema";
import { _getScreen, _getScreens, _listRawScreens, _listScreens } from '../queries/screens';
import logger from "@/lib/logger";
import { _listScripts } from "../queries/_scripts";

const socket = io(process.env.NEXT_PUBLIC_APP_URL);

export async function _copyScreens(
    { screensReferences, scriptsReferences }: { 
        screensReferences: string[], 
        scriptsReferences: string[]; 
    },
    opts?: {
        broadcastAction?: boolean;
    }
) {
    const results: { success: boolean; error?: string; data?: any; } = { success: true }; 
    try {
        const screensList = await _listRawScreens({ screensReferences });

        if (screensList.error) throw new Error(screensList.error);

        const scriptsList = await _listScripts(scriptsReferences);

        if (scriptsList.error) throw new Error(scriptsList.error);

        const insertData: typeof screensDrafts.$inferInsert[] = [];

        for (const s of scriptsList.data) {
            const scriptScreensList = await _listScreens({ scriptsReferences: [s.scriptId! || s.scriptDraftId!], });
            const lastPosition = scriptScreensList.data.length ? Math.max(...scriptScreensList.data.map(s => s.position)) : 0;
            let position = lastPosition + 1;

            screensList.data.forEach(data => {
                const screenId = v4();
                insertData.push({
                    data: {
                        ...data,
                        screenId,
                        scriptId: s.scriptId!,
                        oldScreenId: null,
                        position,
                    },
                    position,
                    type: data.type,
                    screenId,
                    scriptId: s.scriptId,
                    scriptDraftId: s.scriptDraftId,
                });
                position++;
            });
        }

        if (insertData.length) await db.insert(screensDrafts).values(insertData);

        if (opts?.broadcastAction) socket.emit('data_changed', 'create_screens_drafts');
    } catch(e: any) {
        results.success = false;
        results.error = e.message;
        logger.error('_copyScreens ERROR', e.message);
    } finally {
        return results;
    }
}

export async function _updateScreensWithoutPublishing(
    payload: { 
        screenId: string;
        scriptReference: string; 
        data: Partial<typeof screensDrafts.$inferInsert['data']>;  
    }[],
    opts?: {
        broadcastAction?: boolean;
    }
) {
    const results: { success: boolean; error?: string; data?: any; } = { success: true }; 

    try {
        const scriptsReferences = payload.map(s => s.scriptReference).filter(s => s);

        const whereScript = !scriptsReferences.length ? undefined : or(
            inArray(screensDrafts.scriptId, scriptsReferences),
            inArray(screensDrafts.scriptDraftId, scriptsReferences),
        );

        if (whereScript) {
            const drafts = await db.query.screensDrafts.findMany({
                where: whereScript,
            });

            let publishedScreens: typeof screens.$inferSelect[] = [];
            if (scriptsReferences.length) {
                publishedScreens = await db.query.screens.findMany({
                    where: and(...[
                        isNull(screens.deletedAt),
                        inArray(screens.scriptId, scriptsReferences),
                        ...(drafts.filter(s => s.screenId).length ? [notInArray(screens.screenId, drafts.map(s => s.screenId!))] : []),
                    ]),
                    orderBy: asc(screens.position),
                });
            }

            const newDrafts: typeof screensDrafts.$inferInsert[] = [];
            let updatedDrafts = 0;

            for (const { screenId, data } of payload) {
                const draft = drafts.filter(s => s.data.screenId === screenId)[0];
                const publishedScreen = publishedScreens.filter(s => s.screenId === screenId)[0];

                if (draft) {
                    await db.update(screensDrafts).set({
                        data: {
                            ...draft.data,
                            ...data,
                        },
                    }).where(eq(screensDrafts.id, draft.id));
                    updatedDrafts++;
                } else if (publishedScreen) {
                    newDrafts.push({
                        screenId: publishedScreen.screenId,
                        scriptId: publishedScreen.scriptId,
                        position: data.position!,
                        type: publishedScreen.type!,
                        data: {
                            ...publishedScreen,
                            ...data,
                            version: data.version || (publishedScreen.version + 1),
                        },
                    });
                }
            }

            if (newDrafts.length) {
                await db.insert(screensDrafts).values(newDrafts);
                if (opts?.broadcastAction) socket.emit('data_changed', 'create_screens_drafts');
            }

            if (updatedDrafts) if (opts?.broadcastAction) socket.emit('data_changed', 'update_screens_drafts');
        }
    } catch(e: any) {
        results.success = false;
        results.error = e.message;
        logger.error('_updateScreensWithoutPublishing ERROR', e);
    } finally {
        return results;
    }
}

export async function _publishScreens(opts?: {
    scriptsReferences?: string[];
    screensReferences?: string[];
    broadcastAction?: boolean;
}) {
    const { scriptsReferences, screensReferences, } = { ...opts, };

    const results: { success: boolean; errors?: string[]; } = { success: true };
    const errors: string[] = [];

    try {
        let updates: { screenId: string; }[] = [];
        let inserts: { screenDraftId: string; }[] = [];

        if (scriptsReferences?.length || screensReferences?.length) {
            const res = await db.query.screensDrafts.findMany({
                where: or(
                    !scriptsReferences?.length ? undefined : inArray(screensDrafts.scriptId, scriptsReferences),
                    !scriptsReferences?.length ? undefined : inArray(screensDrafts.scriptDraftId, scriptsReferences),
                    !screensReferences?.length ? undefined : inArray(screensDrafts.screenId, screensReferences),
                    !screensReferences?.length ? undefined : inArray(screensDrafts.screenDraftId, screensReferences),
                ),
                columns: { screenId: true, screenDraftId: true, },
            });

            updates = res.filter(s => s.screenId).map(s => ({ screenId: s.screenId! }));
            inserts = res.filter(s => !s.screenId).map(s => ({ screenDraftId: s.screenDraftId! }));
        } else {
            const _screensDrafts = await db.query.screensDrafts.findMany({
                where: isNotNull(screensDrafts.scriptId),
                columns: { screenId: true, screenDraftId: true, },
            });
            updates = _screensDrafts.filter(s => s.screenId).map(s => ({ screenId: s.screenId! }));
            inserts = _screensDrafts.filter(s => !s.screenId).map(s => ({ screenDraftId: s.screenDraftId! }));
        }

        if (updates.length) {
            const res = await _updateScreens(updates);
            res.forEach(s => s.error && errors.push(s.error));
        }

        if (inserts.length) {
            const res = await _createScreens(inserts);
            res.errors?.forEach(e => errors.push(e));
        }

        if (errors.length) {
            results.success = false;
            results.errors = errors;
            logger.error('_publishScreens ERRORS', errors);
        }
    } catch(e: any) {
        results.success = false;
        results.errors = [e.message];
        logger.error('_publishScreens ERROR', e);
    } finally {
        return results;
    }
}

export async function _deleteScreens(
    screenIds: string[],
    opts?: {
        broadcastAction?: boolean;
    }
) {
    if (screenIds.length) {
        const where = inArray(screens.screenId, screenIds);

        const items = await db.query.screens.findMany({
            where,
        });

        const deletedAt = new Date();

        await db
            .update(screens)
            .set({ deletedAt, })
            .where(where);

        await db.delete(screensDrafts).where(and(
            isNotNull(screensDrafts.screenId),
            inArray(screensDrafts.screenId, screenIds)
        ));

        await db.insert(screensHistory).values(items.map(item => ({
            version: item.version,
            screenId: item.screenId,
            scriptId: item.scriptId,
            changes: {
                action: 'delete_screen',
                descreenion: 'Delete screen',
                oldValues: [{ deletedAt: null, }],
                newValues: [{ deletedAt }],
            },
        })));

        if (opts?.broadcastAction) socket.emit('data_changed', 'delete_screens');
    }
    return true;
}

export async function _createScreens(
    data: ({
        screenDraftId: string;
    })[], 
    opts?: {
        returnInserted?: boolean;
        broadcastAction?: boolean;
    }
) {
    let results: {
        success: boolean;
        errors?: string[];
        inserted: Awaited<ReturnType<typeof _getScreens>>['data'];
    } = { inserted: [], success: false, };

    try {
        const insertData: typeof screens.$inferInsert[] = [];

        let drafts = !data.length ? [] : await db.query.screensDrafts.findMany({
            where: inArray(screensDrafts.screenDraftId, data.map(c => c.screenDraftId)),
        });

        // we'll use data before to compare changes
        let dataBefore: typeof screens.$inferSelect[] = [];
        if (drafts.filter(c => c.screenId).length) {
            dataBefore = await db.query.screens.findMany({
                where: inArray(screens.screenId, drafts.filter(c => c.screenId).map(c => c.screenId!))
            });
        }
        
        for(const { id, scriptId: _scriptId, data } of drafts) {
            const screenId = data.screenId || v4();
            const scriptId = (data.scriptId || _scriptId)!;
            const payload = { ...data, screenId, scriptId };
            insertData.push(payload);
            drafts = drafts.map(d => {
                if (d.id === id) d.data.screenId = screenId;
                return d;
            });
            try {
                await db.insert(screens).values(payload);
            } catch(e: any) {
                results.errors = [...(results.errors || []), `Error inserting ${data.title} - ${e.message}`];
            }
        }

        const inserted = await _getScreens({ screenIds: insertData.map(c => c.screenId!), });

        results.inserted = opts?.returnInserted ? inserted.data : [];
        results.success = true;

        await _saveScreensHistory({ drafts: drafts, previous: dataBefore, });

        if (drafts.length) {
            await db.delete(screensDrafts).where(inArray(screensDrafts.id, drafts.map(d => d.id)));
        }

        if (opts?.broadcastAction) socket.emit('data_changed', 'create_screens');
    } catch(e: any) {
        results.errors = [e.message];
        logger.error('_createScreens ERROR', e.message);
    } finally {
        return results;
    }
}

export async function _updateScreens(
    data: ({
        screenId: string;
    })[], 
    opts?: {
        returnUpdated?: boolean;
        broadcastAction?: boolean;
    }
) {
    const results: ({ 
        screenId: string;
        screen?: Awaited<ReturnType<typeof _getScreen>>;
        error?: string; 
    })[] = [];

    let drafts = !data.length ? [] : await db.query.screensDrafts.findMany({
        where: inArray(screensDrafts.screenId, data.map(c => c.screenId)),
    });

    // we'll use data before to compare changes
    let dataBefore: typeof screens.$inferSelect[] = [];
    if (drafts.filter(c => c.screenId).length) {
        dataBefore = await db.query.screens.findMany({
            where: inArray(screens.screenId, drafts.filter(c => c.screenId).map(c => c.screenId!))
        });
    }

    for(const { screenId: _screenId, data: c } of drafts) {
        const screenId = _screenId!;

        const { screenId: __screenId, id, oldScreenId, createdAt, updatedAt, deletedAt, ...payload } = c;

        try {
            const updates = {
                ...payload,
                publishDate: new Date(),
            };
            await db
                .update(screens)
                .set(updates)
                .where(eq(screens.screenId, screenId));

            const screen = !opts?.returnUpdated ? undefined : await _getScreen(screenId);

            results.push({ screenId, screen, });
        } catch(e: any) {
            logger.error(`_updateScreens screenId=${screenId}`, e.message);
            results.push({ screenId, error: e.message, });
            drafts = drafts.filter(c => c.data.screenId !== screenId);
        }
    }

    await _saveScreensHistory({ drafts: drafts, previous: dataBefore, });

    if (drafts.length) {
        await db.delete(screensDrafts).where(inArray(screensDrafts.id, drafts.map(d => d.id)));
    }

    if (opts?.broadcastAction) socket.emit('data_changed', 'create_screens');

    return results;
}

export async function _saveScreensHistory({ previous, drafts, }: {
    drafts: typeof screensDrafts.$inferSelect[];
    previous: typeof screens.$inferSelect[];
}) {
    try {
        const insertData: typeof screensHistory.$inferInsert[] = [];

        for(const c of drafts) {
            const changeHistoryData: typeof screensHistory.$inferInsert = {
                version: c?.data?.version || 1,
                screenId: c?.data?.screenId!,
                scriptId: c?.data?.scriptId,
                changes: {},
            };

            if (c?.data?.version === 1) {
                changeHistoryData.changes = {
                    action: 'create_screen',
                    descreenion: 'Create screen',
                    oldValues: [],
                    newValues: [],
                };
            } else {
                const prev = previous.filter(prevC => prevC.screenId === c?.data?.screenId)[0];

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
                    action: 'update_screen',
                    descreenion: 'Update screen',
                    oldValues,
                    newValues,
                };
            }

            insertData.push(changeHistoryData);
        }

        await db.insert(screensHistory).values(insertData);
    } catch(e: any) {
        logger.error(e.message);
    }
}
