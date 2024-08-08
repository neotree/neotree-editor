import { and, eq, inArray, isNotNull, isNull, notInArray, asc, or } from "drizzle-orm";
import { v4 } from "uuid";
import { io } from 'socket.io-client';

import db from "../pg/drizzle";
import { configKeys, configKeysDrafts, configKeysHistory } from "../pg/schema";
import { _getConfigKey, _getConfigKeys } from '../queries/_config-keys';
import logger from "@/lib/logger";

const socket = io(process.env.NEXT_PUBLIC_APP_URL);

export async function _updateConfigKeysWithoutPublishing(
    payload: { 
        configKeyId: string;
        data: Partial<typeof configKeysDrafts.$inferInsert['data']>;  
    }[],
    opts?: {
        broadcastAction?: boolean;
    },
) {
    const results: { success: boolean; error?: string; data?: any; } = { success: true }; 

    try {
        const configKeysReferences = payload.map(s => s.configKeyId).filter(s => s);

        const whereConfigKey = !configKeysReferences.length ? undefined : or(
            inArray(configKeysDrafts.configKeyId, configKeysReferences),
            inArray(configKeysDrafts.configKeyDraftId, configKeysReferences),
        );

        if (whereConfigKey) {
            const drafts = await db.query.configKeysDrafts.findMany({
                where: whereConfigKey,
            });

            let publishedConfigKeys: typeof configKeys.$inferSelect[] = [];
            if (configKeysReferences.length) {
                publishedConfigKeys = await db.query.configKeys.findMany({
                    where: and(...[
                        isNull(configKeys.deletedAt),
                        inArray(configKeys.configKeyId, configKeysReferences),
                        ...(drafts.filter(s => s.configKeyId).length ? [notInArray(configKeys.configKeyId, drafts.map(s => s.configKeyId!))] : []),
                    ]),
                    orderBy: asc(configKeys.position),
                });
            }

            const newDrafts: typeof configKeysDrafts.$inferInsert[] = [];
            let updatedDrafts = 0;

            for (const { configKeyId, data } of payload) {
                const draft = drafts.filter(s => s.data.configKeyId === configKeyId)[0];
                const publishedConfigKey = publishedConfigKeys.filter(s => s.configKeyId === configKeyId)[0];

                if (draft) {
                    await db.update(configKeysDrafts).set({
                        data: {
                            ...draft.data,
                            ...data,
                        },
                    }).where(eq(configKeysDrafts.id, draft.id));
                    updatedDrafts++;
                } else if (publishedConfigKey) {
                    newDrafts.push({
                        position: data.position!,
                        configKeyId: publishedConfigKey.configKeyId,
                        configKeyDraftId: publishedConfigKey.configKeyId,
                        data: {
                            ...publishedConfigKey,
                            ...data,
                            version: data.version || (publishedConfigKey.version + 1),
                        } as typeof newDrafts[0]['data'],
                    });
                }
            }

            if (newDrafts.length) {
                await db.insert(configKeysDrafts).values(newDrafts);
                if (opts?.broadcastAction) socket.emit('data_changed', 'create_configKeys_drafts');
            }

            if (opts?.broadcastAction && updatedDrafts) if (opts?.broadcastAction) socket.emit('data_changed', 'update_configKeys_drafts');
        }
    } catch(e: any) {
        results.success = false;
        results.error = e.message;
        logger.error('_orderConfigKeys ERROR', e);
    } finally {
        return results;
    }
}

export async function _publishConfigKeys(
    opts?: {
        broadcastAction?: boolean;
    }
) {
    const results: { success: boolean; errors?: string[]; } = { success: true, };

    try {
        const drafts = await db.query.configKeysDrafts.findMany({
            columns: {
                configKeyDraftId: true,
                configKeyId: true,
            },
        });
        const insertData = drafts.filter(c => !c.configKeyId);
        const updateData = drafts.filter(c => c.configKeyId).map(c => ({ ...c, configKeyId: c.configKeyId! }));

        const errors: string[] = [];

        if (insertData.length) {
            const { error } = await _createConfigKeys(insertData);
            if (error) errors.push(error);
        }

        if (updateData.length) {
            const res = await _updateConfigKeys(updateData);
            res.forEach(c => c.error && errors.push(c.error));
        }

        if (errors.length) {
            results.success = false;
            results.errors = errors;
        }
    } catch(e: any) {
        results.success = false;
        results.errors = [e.message];
        logger.error('_publishConfigKeys ERROR', e.message);
    } finally {
        return results;
    }
}

export async function _deleteConfigKeys(
    configKeyIds: string[],
    opts?: {
        broadcastAction?: boolean;
    }
) {
    if (configKeyIds.length) {
        const where = inArray(configKeys.configKeyId, configKeyIds);

        const items = await db.query.configKeys.findMany({
            where,
        });

        if (items.length) {
            const deletedAt = new Date();

            await db
                .update(configKeys)
                .set({ deletedAt, })
                .where(where);

            await db.delete(configKeysDrafts).where(and(
                isNotNull(configKeysDrafts.configKeyId),
                inArray(configKeysDrafts.configKeyId, configKeyIds),
            ));

            await db.insert(configKeysHistory).values(items.map(item => ({
                version: item.version,
                configKeyId: item.configKeyId,
                changes: {
                    action: 'delete_config_key',
                    description: 'Delete config key',
                    oldValues: [{ deletedAt: null, }],
                    newValues: [{ deletedAt }],
                },
            })));

            if (opts?.broadcastAction) socket.emit('data_changed', 'delete_config_keys');
        }
    }
    return true;
}

export async function _createConfigKeys(
    data: ({
        configKeyDraftId: string;
    })[], 
    opts?: {
        returnInserted?: boolean;
        broadcastAction?: boolean;
    }
) {
    let results: {
        success: boolean;
        error?: string;
        inserted: Awaited<ReturnType<typeof _getConfigKeys>>['data'];
    } = { inserted: [], success: false, };

    try {
        const insertData: typeof configKeys.$inferInsert[] = [];

        let drafts = !data.length ? [] : await db.query.configKeysDrafts.findMany({
            where: inArray(configKeysDrafts.configKeyDraftId, data.map(c => c.configKeyDraftId)),
        });

        // we'll use data before to compare changes
        let dataBefore: typeof configKeys.$inferSelect[] = [];
        if (drafts.filter(c => c.configKeyId).length) {
            dataBefore = await db.query.configKeys.findMany({
                where: inArray(configKeys.configKeyId, drafts.filter(c => c.configKeyId).map(c => c.configKeyId!))
            });
        }
        
        for(const { id, data } of drafts) {
            const configKeyId = data.configKeyId || v4();
            insertData.push({ ...data, configKeyId, });
            drafts = drafts.map(d => {
                if (d.id === id) d.data.configKeyId = configKeyId;
                return d;
            });
        }

        await db.insert(configKeys).values(insertData);

        const inserted = await _getConfigKeys({ configKeyIds: insertData.map(c => c.configKeyId!), });

        results.inserted = opts?.returnInserted ? inserted.data : [];
        results.success = true;

        await _saveConfigKeysHistory({ drafts: drafts, previous: dataBefore, });

        if (drafts.length) {
            await db.delete(configKeysDrafts).where(inArray(configKeysDrafts.id, drafts.map(d => d.id)));
        }

        if (opts?.broadcastAction) socket.emit('data_changed', 'create_config_keys');
    } catch(e: any) {
        results.error = e.message;
    } finally {
        return results;
    }
}

export async function _updateConfigKeys(
    data: ({
        configKeyId: string;
    })[], 
    opts?: {
        returnUpdated?: boolean;
        broadcastAction?: boolean;
    }
) {
    const results: ({ 
        configKeyId: string;
        configKey?: Awaited<ReturnType<typeof _getConfigKey>>;
        error?: string; 
    })[] = [];

    let drafts = !data.length ? [] : await db.query.configKeysDrafts.findMany({
        where: inArray(configKeysDrafts.configKeyId, data.map(c => c.configKeyId)),
    });

    // we'll use data before to compare changes
    let dataBefore: typeof configKeys.$inferSelect[] = [];
    if (drafts.filter(c => c.configKeyId).length) {
        dataBefore = await db.query.configKeys.findMany({
            where: inArray(configKeys.configKeyId, drafts.filter(c => c.configKeyId).map(c => c.configKeyId!))
        });
    }

    for(const { configKeyId: _configKeyId, data: c } of drafts) {
        const configKeyId = _configKeyId!;

        const { 
            configKeyId: __configKeyId, 
            oldConfigKeyId, 
            id, 
            createdAt, 
            updatedAt, 
            deletedAt, 
            ...payload 
        } = c;

        try {
            const updates = {
                ...payload,
                publishDate: new Date(),
            };
            await db
                .update(configKeys)
                .set(updates)
                .where(eq(configKeys.configKeyId, configKeyId));

            const configKey = !opts?.returnUpdated ? undefined : await _getConfigKey(configKeyId);

            results.push({ configKeyId, configKey, });
        } catch(e: any) {
            logger.error(`_updateConfigKeys configKeyId=${configKeyId}`, e.message);
            results.push({ configKeyId, error: e.message, });
            drafts = drafts.filter(c => c.data.configKeyId !== configKeyId);
        }
    }

    await _saveConfigKeysHistory({ drafts: drafts, previous: dataBefore, });

    if (drafts.length) {
        await db.delete(configKeysDrafts).where(inArray(configKeysDrafts.id, drafts.map(d => d.id)));
    }

    if (opts?.broadcastAction) socket.emit('data_changed', 'update_config_keys');

    return results;
}

export async function _saveConfigKeysHistory({ previous, drafts, }: {
    drafts: typeof configKeysDrafts.$inferSelect[];
    previous: typeof configKeys.$inferSelect[];
}) {
    try {
        const insertData: typeof configKeysHistory.$inferInsert[] = [];

        for(const c of drafts) {
            const changeHistoryData: typeof configKeysHistory.$inferInsert = {
                version: c?.data?.version || 1,
                configKeyId: c?.data?.configKeyId!,
                changes: {},
            };

            if (c?.data?.version === 1) {
                changeHistoryData.changes = {
                    action: 'create_config_key',
                    description: 'Create config key',
                    oldValues: [],
                    newValues: [],
                };
            } else {
                const prev = previous.filter(prevC => prevC.configKeyId === c?.data?.configKeyId)[0];

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
                    action: 'update_config_key',
                    description: 'Update config key',
                    oldValues,
                    newValues,
                };
            }

            insertData.push(changeHistoryData);
        }

        await db.insert(configKeysHistory).values(insertData);
    } catch(e: any) {
        logger.error(e.message);
    }
}
