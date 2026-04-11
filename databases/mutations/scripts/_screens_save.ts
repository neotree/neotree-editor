import { desc, eq, Query } from 'drizzle-orm';
import * as uuid from 'uuid';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import type { DbOrTransaction } from '@/databases/pg/db-client';
import { screens, screensDrafts, scripts, scriptsDrafts } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { ScreenType } from '../../queries/scripts/_screens_get';
import { removeHexCharacters } from '../../utils'
import { validateSelectionRules } from '@/lib/selection-rules';


export type SaveScreensData = Partial<ScreenType>;

export type SaveScreensResponse = { 
    success: boolean; 
    errors?: string[]; 
    info?: { query?: Query; };
};

function getConfidentialDataKeyIds(screen: SaveScreensData) {
    const ids = new Set<string>();

    if (screen.confidential && screen.keyId) {
        ids.add(screen.keyId);
    }

    for (const field of screen.fields || []) {
        if (field?.confidential && field?.keyId) {
            ids.add(field.keyId);
        }
    }

    for (const item of screen.items || []) {
        if (item?.confidential && item?.keyId) {
            ids.add(item.keyId);
        }
    }

    return Array.from(ids).filter(Boolean);
}

async function promoteDataKeysAsConfidential(uniqueKeys: string[], userId?: string) {
    const ids = Array.from(new Set(uniqueKeys.filter(Boolean)));
    if (!ids.length) return;

    const { _getDataKeys } = await import('@/databases/queries/data-keys');
    const { _saveDataKeys } = await import('@/databases/mutations/data-keys');

    const dataKeysRes = await _getDataKeys({ uniqueKeys: ids, returnDraftsIfExist: true });
    if (dataKeysRes.errors?.length) {
        throw new Error(dataKeysRes.errors.join(', '));
    }

    const updates = dataKeysRes.data
        .filter((key) => !key?.confidential)
        .map((key) => ({
            uuid: key.uuid,
            uniqueKey: key.uniqueKey,
            confidential: true,
        }));

    if (!updates.length) return;

    const saveRes = await _saveDataKeys({
        data: updates,
        userId,
        updateRefs: false,
        broadcastAction: false,
    });

    if (saveRes.errors?.length || !saveRes.success) {
        throw new Error(saveRes.errors?.join(', ') || 'Failed to promote confidential data keys');
    }
}

export async function _saveScreens({ data, broadcastAction, userId, client, }: {
    data: SaveScreensData[],
    broadcastAction?: boolean;
    userId?: string;
    client?: DbOrTransaction;
}) {
    const response: SaveScreensResponse = { success: false, };
    data = removeHexCharacters(data)
    const errors = [];
    const info: SaveScreensResponse['info'] = {};
    const confidentialDataKeyIds = new Set<string>();
    const executor = client ?? db;
    
    try {
        let index = 0;
        for (const { screenId: itemScreenId, ...item } of data) {
            try {
                index++;

                const screenId = itemScreenId || uuid.v4();

                const screenLabel = item.title || item.label || itemScreenId || `screen ${index}`;
                const validationErrors = [
                    ...validateSelectionRules(item.items || [], `Screen "${screenLabel}" items`),
                    ...(item.fields || []).flatMap((field, fieldIndex) =>
                        validateSelectionRules(
                            field.items || [],
                            `Screen "${screenLabel}" field "${field.label || field.key || fieldIndex}" items`
                        )
                    ),
                ];

                if (validationErrors.length) {
                    errors.push(...validationErrors);
                }

                getConfidentialDataKeyIds(item).forEach((id) => confidentialDataKeyIds.add(id));

                if (!errors.length) {
                    const draft = !itemScreenId ? null : await executor.query.screensDrafts.findFirst({
                        where: eq(screensDrafts.screenDraftId, screenId),
                    });

                    const published = (draft || !itemScreenId) ? null : await executor.query.screens.findFirst({
                        where: eq(screens.screenId, screenId),
                    });

                    if (draft) {
                        const data = {
                            ...draft.data,
                            ...item,
                        } as typeof draft.data;
                        
                        const q = executor
                            .update(screensDrafts)
                            .set({
                                data,
                                position: data.position,
                            }).where(eq(screensDrafts.screenDraftId, screenId));

                        info.query = q.toSQL();

                        await q.execute();
                    } else {
                        let position = item.position || published?.position;
                        if (!position) {
                            const screen = await executor.query.screens.findFirst({
                                columns: { position: true, },
                                orderBy: desc(screens.position),
                            });

                            const screenDraft = await executor.query.screensDrafts.findFirst({
                                columns: { position: true, },
                                orderBy: desc(screensDrafts.position),
                            });

                            position = Math.max(0, screen?.position || 0, screenDraft?.position || 0) + 1;
                        }

                        const data = {
                            ...published,
                            ...item,
                            screenId,
                            version: published?.version ? (published.version + 1) : 1,
                            position,
                        } as typeof screensDrafts.$inferInsert['data'];

                        if (data.scriptId) {
                            const scriptDraft = await executor.query.scriptsDrafts.findFirst({
                                where: eq(scriptsDrafts.scriptDraftId, data.scriptId),
                                columns: { scriptDraftId: true, },
                            });

                            const publishedScript = await executor.query.scripts.findFirst({
                                where: eq(scripts.scriptId, data.scriptId),
                                columns: { scriptId: true, },
                            });

                            if (scriptDraft || publishedScript) {
                                const q = executor.insert(screensDrafts).values({
                                    data,
                                    type: data.type,
                                    scriptId: publishedScript?.scriptId,
                                    scriptDraftId: scriptDraft?.scriptDraftId,
                                    screenDraftId: screenId,
                                    position: data.position,
                                    screenId: published?.screenId,
                                    createdByUserId: userId,
                                });

                                info.query = q.toSQL();

                                await q.execute();
                            } else {
                                errors.push(`Could not save screen ${index}: ${data.title}, because script was not found`);
                            }
                        } else {
                            errors.push(`Could not save screen ${index}: ${data.title}, because scriptId was not specified`);
                        }
                    }
                }
            } catch(e: any) {
                errors.push(e.message);
            }
        }

        if (errors.length) {
            response.errors = errors;
            response.info = info;
        } else {
            if (confidentialDataKeyIds.size) {
                await promoteDataKeysAsConfidential(Array.from(confidentialDataKeyIds), userId);
            }
            response.success = true;
        }
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        response.info = info;
        logger.error('_saveScreens ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction && !client) socket.emit('data_changed', 'save_screens');
        return response;
    }
}
