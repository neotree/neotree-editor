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

export type DraftOrigin = "editor" | "data_key_sync" | "import" | "other";

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

async function resolveScriptReference(
    executor: DbOrTransaction,
    scriptId: string,
) {
    /**
     * Resolve against the merged entity state, not the raw payload.
     * Partial saves can omit scriptId in the request, while the final merged
     * screen still has a valid scriptId from the existing draft/published row.
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

export async function _saveScreens({ data, broadcastAction, userId, client, draftOrigin: requestedDraftOrigin = "editor" }: {
    data: SaveScreensData[],
    broadcastAction?: boolean;
    userId?: string;
    client?: DbOrTransaction;
    draftOrigin?: DraftOrigin;
}) {
    const response: SaveScreensResponse = { success: false, };
    data = removeHexCharacters(data)
    const errors = [];
    const warnings: string[] = [];
    const info: SaveScreensResponse['info'] = {};
    const confidentialDataKeyIds = new Set<string>();
    const executor = client || db;
    
    try {
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
                    const draft = !itemScreenId ? null : await executor.query.screensDrafts.findFirst({
                        where: eq(screensDrafts.screenDraftId, screenId),
                    });

                    const published = (draft || !itemScreenId) ? null : await executor.query.screens.findFirst({
                        where: eq(screens.screenId, screenId),
                    });

                    if (draft) {                        
                        const persistedDraftOrigin = requestedDraftOrigin;

                        const data = {
                            ...draft.data,
                            ...item,
                        } as typeof draft.data;
                        
                        const q = db
                            .update(screensDrafts)
                            .set({
                                data,
                                position: data.position,
                                draftOrigin: persistedDraftOrigin,
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
                            const { scriptDraftId, scriptId } = await resolveScriptReference(executor, data.scriptId);

                            if (scriptDraftId || scriptId) {
                                const q = executor.insert(screensDrafts).values({
                                    data,
                                    type: data.type,
                                    scriptId,
                                    scriptDraftId,
                                    screenDraftId: screenId,
                                    position: data.position,
                                    screenId: published?.screenId,
                                    createdByUserId: userId,
                                    draftOrigin: requestedDraftOrigin,
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
