import { desc, eq, inArray, Query } from 'drizzle-orm';
import * as uuid from 'uuid';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import type { DbOrTransaction } from '@/databases/pg/db-client';
import { screens, screensDrafts, scripts, scriptsDrafts } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { ScreenType } from '../../queries/scripts/_screens_get';
import { removeHexCharacters } from '../../utils'
import { normalizeSelectionRuleItems, validateSelectionRules } from '@/lib/selection-rules';


export type SaveScreensData = Partial<ScreenType>;

export type SaveScreensResponse = { 
    success: boolean; 
    errors?: string[]; 
    warnings?: string[];
    info?: { query?: Query; };
};

function summarizeSelectionRuleWarnings(contextLabel: string, warnings: string[]) {
    if (!warnings.length) return [];

    const counters = {
        assignedItemIds: 0,
        remappedDuplicateItemIds: 0,
        remappedForbidWith: 0,
        droppedSelfForbidWith: 0,
        droppedUnknownForbidWith: 0,
        other: [] as string[],
    };

    warnings.forEach((warning) => {
        if (warning.startsWith('Assigned generated itemId ')) counters.assignedItemIds++;
        else if (warning.startsWith('Remapped duplicate itemId ')) counters.remappedDuplicateItemIds++;
        else if (warning.startsWith('Remapped forbidWith ')) counters.remappedForbidWith++;
        else if (warning.startsWith('Dropped self-referencing forbidWith ')) counters.droppedSelfForbidWith++;
        else if (warning.startsWith('Dropped unknown forbidWith ')) counters.droppedUnknownForbidWith++;
        else counters.other.push(warning);
    });

    const summary: string[] = [];
    if (counters.assignedItemIds) summary.push(`${contextLabel}: assigned generated itemIds to ${counters.assignedItemIds} item${counters.assignedItemIds === 1 ? '' : 's'}`);
    if (counters.remappedDuplicateItemIds) summary.push(`${contextLabel}: remapped ${counters.remappedDuplicateItemIds} duplicate itemId${counters.remappedDuplicateItemIds === 1 ? '' : 's'}`);
    if (counters.remappedForbidWith) summary.push(`${contextLabel}: remapped ${counters.remappedForbidWith} forbidWith link${counters.remappedForbidWith === 1 ? '' : 's'}`);
    if (counters.droppedSelfForbidWith) summary.push(`${contextLabel}: dropped ${counters.droppedSelfForbidWith} self-referencing forbidWith link${counters.droppedSelfForbidWith === 1 ? '' : 's'}`);
    if (counters.droppedUnknownForbidWith) summary.push(`${contextLabel}: dropped ${counters.droppedUnknownForbidWith} unknown forbidWith link${counters.droppedUnknownForbidWith === 1 ? '' : 's'}`);

    return [...summary, ...counters.other.map((warning) => `${contextLabel}: ${warning}`)];
}

function normalizeScreenSelectionRuleItemIds(screen: SaveScreensData): {
    value: SaveScreensData;
    warnings: string[];
} {
    const screenItems = normalizeSelectionRuleItems(screen.items || [], () => uuid.v4());
    const fieldWarnings: string[] = [];
    const fields = (screen.fields || []).map((field, fieldIndex) => {
        const result = normalizeSelectionRuleItems(field.items || [], () => uuid.v4());
        const fieldLabel = field.label || field.key || `field ${fieldIndex}`;
        fieldWarnings.push(...summarizeSelectionRuleWarnings(`Field "${fieldLabel}" items`, result.warnings));
        return {
            ...field,
            items: result.items,
        };
    });

    return {
        value: {
            ...screen,
            items: screenItems.items,
            fields,
        },
        warnings: [
            ...summarizeSelectionRuleWarnings('Screen items', screenItems.warnings),
            ...fieldWarnings,
        ],
    };
}

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
    const warnings: string[] = [];
    const info: SaveScreensResponse['info'] = {};
    const confidentialDataKeyIds = new Set<string>();
    const executor = client || db;
    
    try {
        const existingScreenIds = Array.from(new Set(
            data.map((item) => item.screenId).filter((id): id is string => !!id)
        ));
        const referencedScriptIds = Array.from(new Set(
            data.map((item) => item.scriptId).filter((id): id is string => !!id)
        ));

        const [
            drafts,
            publishedScreens,
            publishedScripts,
            scriptDraftsRows,
            maxPublishedScreen,
            maxDraftScreen,
        ] = await Promise.all([
            existingScreenIds.length
                ? executor.query.screensDrafts.findMany({
                    where: inArray(screensDrafts.screenDraftId, existingScreenIds),
                })
                : Promise.resolve([]),
            existingScreenIds.length
                ? executor.query.screens.findMany({
                    where: inArray(screens.screenId, existingScreenIds),
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
            executor.query.screens.findFirst({
                columns: { position: true, },
                orderBy: desc(screens.position),
            }),
            executor.query.screensDrafts.findFirst({
                columns: { position: true, },
                orderBy: desc(screensDrafts.position),
            }),
        ]);

        const draftsById = new Map(drafts.map((draft) => [draft.screenDraftId, draft]));
        const publishedScreensById = new Map(publishedScreens.map((screen) => [screen.screenId, screen]));
        const publishedScriptIds = new Set(publishedScripts.map((script) => script.scriptId));
        const scriptDraftIds = new Set(scriptDraftsRows.map((draft) => draft.scriptDraftId).filter(Boolean));
        let nextPosition = Math.max(0, maxPublishedScreen?.position || 0, maxDraftScreen?.position || 0) + 1;

        let index = 0;
        for (const { screenId: itemScreenId, ...item } of data) {
            try {
                index++;
                const normalized = normalizeScreenSelectionRuleItemIds(item);
                const normalizedItem = normalized.value;

                const screenId = itemScreenId || uuid.v4();

                const screenLabel = normalizedItem.title || normalizedItem.label || itemScreenId || `screen ${index}`;
                if (normalized.warnings.length) {
                    warnings.push(...normalized.warnings.map((warning) => `Screen "${screenLabel}": ${warning}`));
                }
                const validationErrors = [
                    ...validateSelectionRules(normalizedItem.items || [], `Screen "${screenLabel}" items`),
                    ...(normalizedItem.fields || []).flatMap((field, fieldIndex) =>
                        validateSelectionRules(
                            field.items || [],
                            `Screen "${screenLabel}" field "${field.label || field.key || fieldIndex}" items`
                        )
                    ),
                ];

                if (validationErrors.length) {
                    errors.push(...validationErrors);
                }

                getConfidentialDataKeyIds(normalizedItem).forEach((id) => confidentialDataKeyIds.add(id));

                if (!errors.length) {
                    const draft = !itemScreenId ? null : draftsById.get(screenId) || null;

                    const published = (draft || !itemScreenId) ? null : publishedScreensById.get(screenId) || null;

                    if (draft) {
                        const mergedNormalization = normalizeScreenSelectionRuleItemIds({
                            ...draft.data,
                            ...normalizedItem,
                        } as typeof draft.data);
                        const data = mergedNormalization.value as typeof draft.data;
                        if (mergedNormalization.warnings.length) {
                            warnings.push(...mergedNormalization.warnings.map((warning) => `Screen "${screenLabel}" merged draft: ${warning}`));
                        }
                        
                        const q = db
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
                            position = nextPosition;
                            nextPosition++;
                        }

                        const mergedNormalization = normalizeScreenSelectionRuleItemIds({
                            ...published,
                            ...normalizedItem,
                            screenId,
                            version: published?.version ? (published.version + 1) : 1,
                            position,
                        } as typeof screensDrafts.$inferInsert['data']);
                        const data = mergedNormalization.value as typeof screensDrafts.$inferInsert['data'];
                        if (mergedNormalization.warnings.length) {
                            warnings.push(...mergedNormalization.warnings.map((warning) => `Screen "${screenLabel}" merged publish source: ${warning}`));
                        }

                        if (data.scriptId) {
                            const scriptDraftId = scriptDraftIds.has(data.scriptId) ? data.scriptId : undefined;
                            const publishedScriptId = publishedScriptIds.has(data.scriptId) ? data.scriptId : undefined;

                            if (scriptDraftId || publishedScriptId) {
                                const q = executor.insert(screensDrafts).values({
                                    data,
                                    type: data.type,
                                    scriptId: publishedScriptId,
                                    scriptDraftId,
                                    screenDraftId: screenId,
                                    position: data.position,
                                    screenId: published?.screenId,
                                    createdByUserId: userId,
                                });

                                info.query = q.toSQL();

                                await q.execute();
                                draftsById.set(screenId, {
                                    screenDraftId: screenId,
                                    screenId: published?.screenId,
                                    scriptId: publishedScriptId || null,
                                    scriptDraftId: scriptDraftId || null,
                                    createdByUserId: userId || null,
                                    data,
                                    type: data.type || null,
                                    position: data.position || null,
                                } as typeof screensDrafts.$inferSelect);
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
        if (warnings.length) {
            response.warnings = Array.from(new Set(warnings));
        }
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        response.info = info;
        logger.error('_saveScreens ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction) socket.emit('data_changed', 'save_screens');
        return response;
    }
}
