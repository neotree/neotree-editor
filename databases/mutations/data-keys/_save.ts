import { count, eq, or } from 'drizzle-orm';
import * as uuid from 'uuid';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import type { DbOrTransaction } from '@/databases/pg/db-client';
import { dataKeys, dataKeysDrafts } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { _getDataKeys } from '@/databases/queries/data-keys';
import { normalizeIncomingDataKeyPatch } from '@/lib/data-key-save';
import { validateDataKeyOptionsAddition } from '@/lib/data-key-children';
import { _updateDataKeysRefs } from './_update_data_keys_refs';
import type { DataKeyDraftOrigin } from '@/databases/pg/_data-keys';
import {
    _deleteReferencedDataKeyOptions,
    type UnlinkReplacementDataKey,
} from './_delete-referenced-options';

export type SaveDataKeysData = Partial<typeof dataKeys.$inferSelect> & {
    deletedUniqueKeys?: string[];
    /**
     * Unlinked child uniqueKey -> fellow child uniqueKey that replaces it in
     * screens owned by this data key. Replacements must be present in the saved
     * `options` array; unmapped unlinked children are removed from owned screens.
     */
    optionReplacements?: Record<string, string>;
};

export type SaveDataKeysParams = {
    data: SaveDataKeysData[],
    broadcastAction?: boolean,
    userId?: string;
    updateRefs?: boolean;
    allowConfidentialDowngrade?: boolean;
    draftOrigin?: DataKeyDraftOrigin;
    propagatedDraftOrigin?: Extract<DataKeyDraftOrigin, "data_key_sync" | "import">;
    client?: DbOrTransaction;
};

export type SaveDataKeysResponse = {
    success: boolean;
    errors?: string[];
    info?: {
        refs?: Pick<Awaited<ReturnType<typeof _updateDataKeysRefs>>, 'info' | 'affected'>;
    };
};

async function createNewUniqueKey(executor: DbOrTransaction, uniqueKey?: string): Promise<string> {
    uniqueKey = `${uniqueKey || ''}`.trim();
    uniqueKey = uniqueKey || uuid.v4()
    const [{ count: existing, }] = await executor
        .select({ count: count(dataKeys.uniqueKey), })
        .from(dataKeys)
        .where(eq(dataKeys.uniqueKey, uniqueKey));
    if (existing) return await createNewUniqueKey(executor);
    return uniqueKey;
}

async function enforceDraftOriginForTouchedDataKeys({
    uniqueKeys,
    userId,
    draftOrigin,
    client,
}: {
    uniqueKeys: string[];
    userId?: string;
    draftOrigin: DataKeyDraftOrigin;
    client: DbOrTransaction;
}) {
    if (!uniqueKeys.length) return;

    const touchedPublishedDataKeys = await _getDataKeys({ uniqueKeys, client, });
    if (touchedPublishedDataKeys.errors?.length) {
        throw new Error(touchedPublishedDataKeys.errors.join(', '));
    }

    const touchedPublishedIds = touchedPublishedDataKeys.data
        .map((item) => item.uuid)
        .filter((value): value is string => !!value);

    const drafts = await client.query.dataKeysDrafts.findMany({
        where: userId ? eq(dataKeysDrafts.createdByUserId, userId) : undefined,
    });

    const touchedUniqueKeys = new Set(uniqueKeys.filter(Boolean));
    const touchedDataKeyIds = new Set(touchedPublishedIds);
    const touchedDraftIds = drafts
        .filter((draft) => (
            touchedUniqueKeys.has(`${draft.uniqueKey || ''}`) ||
            (draft.dataKeyId ? touchedDataKeyIds.has(draft.dataKeyId) : false)
        ))
        .map((draft) => draft.uuid);

    for (const draftId of touchedDraftIds) {
        await client
            .update(dataKeysDrafts)
            .set({ draftOrigin })
            .where(eq(dataKeysDrafts.uuid, draftId));
    }
}

async function buildOptionUnlinkPlan({
    deletedUniqueKeys,
    optionReplacements,
    parentUniqueKey,
    savedOptions,
    hasExistingEntity,
    client,
}: {
    deletedUniqueKeys: string[];
    optionReplacements: Record<string, string>;
    parentUniqueKey: string;
    savedOptions: string[];
    hasExistingEntity: boolean;
    client: DbOrTransaction;
}): Promise<null | {
    parentUniqueKey: string;
    deletedUniqueKeys: string[];
    replacements: Record<string, UnlinkReplacementDataKey>;
}> {
    const normalizedDeleted = Array.from(new Set(deletedUniqueKeys.map(k => `${k || ''}`.trim()).filter(Boolean)));
    if (!normalizedDeleted.length) return null;

    // A brand-new data key has no screens bound to it yet, so there is nothing to unlink.
    if (!hasExistingEntity) return null;

    const normalizedParent = `${parentUniqueKey || ''}`.trim();
    if (!normalizedParent) {
        throw new Error('Cannot unlink options from a data key that has no unique key.');
    }

    const options = new Set(savedOptions.map(o => `${o || ''}`.trim()).filter(Boolean));
    const deletedSet = new Set(normalizedDeleted);

    const replacementEntries = Object.entries(optionReplacements || {})
        .map(([removed, replacement]) => [`${removed || ''}`.trim(), `${replacement || ''}`.trim()] as const)
        .filter(([removed, replacement]) => removed && replacement && deletedSet.has(removed));

    const lookupKeys = Array.from(new Set([
        ...normalizedDeleted,
        ...replacementEntries.map(([, replacement]) => replacement),
    ]));
    const lookup = await _getDataKeys({ uniqueKeys: lookupKeys, client, });
    if (lookup.errors?.length) throw new Error(lookup.errors.join(', '));
    const byUniqueKey = new Map(lookup.data.map(k => [k.uniqueKey, k]));

    const replacements: Record<string, UnlinkReplacementDataKey> = {};

    for (const [removedKey, replacementKey] of replacementEntries) {
        const removed = byUniqueKey.get(removedKey);
        const replacement = byUniqueKey.get(replacementKey);
        const removedTitle = removed?.name || removed?.label || removedKey;

        if (!replacement) {
            throw new Error(`The replacement selected for unlinked option "${removedTitle}" could not be found.`);
        }
        if ((removed?.options || []).length) {
            throw new Error(`"${removedTitle}" is a parent data key and cannot be replaced. Unlink it without a replacement instead.`);
        }
        if (deletedSet.has(replacementKey)) {
            throw new Error(`"${replacement.name || replacementKey}" cannot replace "${removedTitle}" because it is also being unlinked.`);
        }
        if (!options.has(replacementKey)) {
            throw new Error(`"${replacement.name || replacementKey}" cannot replace "${removedTitle}" because it is not a fellow child option of this data key.`);
        }
        const removedType = `${removed?.dataType || ''}`.trim().toLowerCase();
        const replacementType = `${replacement.dataType || ''}`.trim().toLowerCase();
        if (removed && removedType !== replacementType) {
            throw new Error(`"${replacement.name || replacementKey}" cannot replace "${removedTitle}" because it uses a different data type.`);
        }

        replacements[removedKey] = {
            uniqueKey: replacement.uniqueKey,
            name: replacement.name || '',
            label: replacement.label || '',
            confidential: replacement.confidential,
        };
    }

    return {
        parentUniqueKey: normalizedParent,
        deletedUniqueKeys: normalizedDeleted,
        replacements,
    };
}

export async function _saveDataKeys({
    data: dataParam,
    broadcastAction,
    updateRefs = true,
    userId,
    draftOrigin = "editor",
    propagatedDraftOrigin,
    client,
}: SaveDataKeysParams) {
    const response: SaveDataKeysResponse = { success: false, };

    try {
        let refsSaved = 0;

        const executeSave = async (executor: DbOrTransaction) => {
            const errors: string[] = [];
            const propagationMatchUniqueKeysByDataKey: Record<string, string[]> = {};

            const resolveConfidential = ({
                incoming,
                existing,
                fallback,
            }: {
                incoming: SaveDataKeysData;
                existing?: Partial<typeof dataKeys.$inferSelect> | null;
                fallback?: boolean | null;
            }) => {
                if (typeof incoming.confidential === 'boolean') return incoming.confidential;
                if (typeof existing?.confidential === 'boolean') return existing.confidential;
                if (typeof fallback === 'boolean') return fallback;
                return true;
            };

            const data = dataParam.map(item => {
                return {
                    ...item,
                    uuid: item.uuid || uuid.v4(),
                    isNewUuid: !item.uuid,
                };
            });

            const uniqueKeys: string[] = [];

            // Full-library snapshot for options validation, fetched once per save.
            let allDataKeysCache: Awaited<ReturnType<typeof _getDataKeys>>['data'] | null = null;
            const getAllDataKeys = async () => {
                if (!allDataKeysCache) {
                    const res = await _getDataKeys({ client: executor });
                    if (res.errors?.length) throw new Error(res.errors.join(', '));
                    allDataKeysCache = res.data;
                }
                return allDataKeysCache;
            };

            let index = 0;
            for (
                const {
                    uuid: dataKeyUuid,
                    isNewUuid,
                    createdAt,
                    publishDate,
                    deletedAt,
                    updatedAt,
                    deletedUniqueKeys = [],
                    optionReplacements = {},
                    ...item
                } of data
            ) {
                try {
                    const normalizedItem = normalizeIncomingDataKeyPatch(item);

                    index++;

                    if (!errors.length) {
                        const draft = isNewUuid ? null : await executor.query.dataKeysDrafts.findFirst({
                            where: or(
                                eq(dataKeysDrafts.uuid, dataKeyUuid),
                                !normalizedItem.uniqueKey ? undefined :  eq(dataKeysDrafts.uniqueKey, normalizedItem.uniqueKey)
                            ),
                        });

                        const published = (draft || isNewUuid) ? null : await executor.query.dataKeys.findFirst({
                            where: or(
                                eq(dataKeys.uuid, dataKeyUuid),
                                !normalizedItem.uniqueKey ? undefined : eq(dataKeys.uniqueKey, normalizedItem.uniqueKey)
                            ),
                        });

                        const existingUniqueKey = draft?.data?.uniqueKey || published?.uniqueKey || normalizedItem.uniqueKey || '';
                        const previousOptions = (draft?.data?.options || published?.options || []) as string[];
                        const nextOptions = normalizedItem.options !== undefined
                            ? (normalizedItem.options || [])
                            : previousOptions;

                        // Newly added options must exist, keep the pool single-typed,
                        // and never create circular references.
                        if (nextOptions.some(option => !previousOptions.includes(option))) {
                            const optionsError = validateDataKeyOptionsAddition({
                                dataKeys: await getAllDataKeys(),
                                parentUniqueKey: existingUniqueKey,
                                previousOptions,
                                nextOptions,
                            });
                            if (optionsError) throw new Error(optionsError);
                        }

                        // Validate the unlink plan BEFORE writing the draft so a bad
                        // replacement can never leave a half-applied save behind.
                        const unlinkPlan = await buildOptionUnlinkPlan({
                            deletedUniqueKeys,
                            optionReplacements,
                            parentUniqueKey: existingUniqueKey,
                            savedOptions: nextOptions,
                            hasExistingEntity: !!draft || !!published,
                            client: executor,
                        });

                        if (draft) {
                            const publishedForDraft = !draft.dataKeyId ? null : await executor.query.dataKeys.findFirst({
                                where: eq(dataKeys.uuid, draft.dataKeyId),
                                columns: {
                                    confidential: true,
                                    name: true,
                                },
                            });

                            const data = {
                                ...draft.data,
                                ...normalizedItem,
                            };
                            const resolvedConfidential = resolveConfidential({
                                incoming: normalizedItem,
                                existing: draft.data,
                                fallback: publishedForDraft?.confidential,
                            });
                            data.confidential = resolvedConfidential;

                            await executor
                                .update(dataKeysDrafts)
                                .set({
                                    data,
                                    name: data.name,
                                    uniqueKey: data.uniqueKey,
                                    draftOrigin,
                                }).where(eq(dataKeysDrafts.uuid, dataKeyUuid));

                            if (data.uniqueKey) {
                                propagationMatchUniqueKeysByDataKey[data.uniqueKey] = Array.from(new Set([
                                    `${draft.uniqueKey || ''}`.trim(),
                                    `${normalizedItem.uniqueKey || ''}`.trim(),
                                    `${data.uniqueKey || ''}`.trim(),
                                ].filter(Boolean)));
                            }

                            if (data.uniqueKey) uniqueKeys.push(data.uniqueKey);
                        } else {
                            const uniqueKey = published?.uniqueKey || await createNewUniqueKey(executor, normalizedItem.uniqueKey || '');

                            const data = {
                                ...published,
                                ...normalizedItem,
                                uniqueKey,
                                uuid: dataKeyUuid,
                                version: published?.version ? (published.version + 1) : 1,
                            } as typeof dataKeys.$inferSelect;
                            const resolvedConfidential = resolveConfidential({ incoming: normalizedItem, existing: published });
                            data.confidential = resolvedConfidential;

                            await executor.insert(dataKeysDrafts).values({
                                data,
                                uuid: dataKeyUuid,
                                dataKeyId: published?.uuid,
                                name: data.name,
                                uniqueKey,
                                draftOrigin,
                                createdByUserId: userId,
                            });

                            if (data.uniqueKey) {
                                propagationMatchUniqueKeysByDataKey[data.uniqueKey] = Array.from(new Set([
                                    `${published?.uniqueKey || ''}`.trim(),
                                    `${normalizedItem.uniqueKey || ''}`.trim(),
                                    `${data.uniqueKey || ''}`.trim(),
                                ].filter(Boolean)));
                            }

                            uniqueKeys.push(data.uniqueKey);
                        }

                        if (unlinkPlan) {
                            const unlinkRes = await _deleteReferencedDataKeyOptions({
                                userId,
                                uniqueKeys: unlinkPlan.deletedUniqueKeys,
                                scope: {
                                    parentUniqueKeys: [unlinkPlan.parentUniqueKey],
                                    replacements: unlinkPlan.replacements,
                                },
                                client: executor,
                            });
                            if (unlinkRes.errors?.length) throw new Error(unlinkRes.errors.join(', '));
                        }
                    }
                } catch(e: any) {
                    errors.push(e.message);
                }
            }

            // Any per-item failure aborts and rolls back the whole save — a
            // partially-applied batch is worse than a retried one.
            if (errors.length) {
                throw new Error(errors.join(', '));
            }

            if (draftOrigin === "import") {
                await enforceDraftOriginForTouchedDataKeys({
                    uniqueKeys,
                    userId,
                    draftOrigin,
                    client: executor,
                });
            }

            if (updateRefs && uniqueKeys.length) {
                const { data: savedDataKeys, } = await _getDataKeys({ uniqueKeys, client: executor, });
                const updateRefsRes = await _updateDataKeysRefs({
                    dataKeys: savedDataKeys,
                    broadcastAction: false,
                    userId,
                    draftOrigin: propagatedDraftOrigin || (draftOrigin === "import" ? "import" : "data_key_sync"),
                    matchUniqueKeysByDataKey: propagationMatchUniqueKeysByDataKey,
                    client: executor,
                });
                if (updateRefsRes.errors?.length || !updateRefsRes.success) {
                    throw new Error(updateRefsRes.errors?.length
                        ? updateRefsRes.errors.join(', ')
                        : 'Failed to update related scripts references');
                }
                refsSaved = (updateRefsRes.info?.savedScreens || 0)
                    + (updateRefsRes.info?.savedDiagnoses || 0)
                    + (updateRefsRes.info?.savedProblems || 0);
                response.info = {
                    ...response.info,
                    refs: {
                        info: updateRefsRes.info,
                        affected: updateRefsRes.affected,
                    },
                };
            }
        };

        // Run atomically: either every draft write, unlink sync, and refs update
        // lands, or none do. When a client is provided we join its transaction.
        if (client) {
            await executeSave(client);
        } else {
            await db.transaction(executeSave);

            // Emit only when we own the transaction — a joined transaction may
            // still roll back after we return.
            socket.emit('data_changed', 'save_data_keys');
            if (broadcastAction && refsSaved) socket.emit('data_changed', 'save_scripts');
        }

        response.success = true;
        return response;
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_saveDataKeys ERROR', e.message);
        return { success: false, errors: [e.message], };
    }
}

export async function _saveDataKeysIfNotExist({
    data,
}: SaveDataKeysParams): Promise<SaveDataKeysResponse> {
    try {
        const uniqueKeys = data.map(item => item.uniqueKey!).filter(n => n);

        const saved = await _getDataKeys({ uniqueKeys, });

        data = data.filter(item => {
            const existing = saved.data.find(dk => dk.uniqueKey === item.uniqueKey);

            if (existing) return false;

            return true;
        });

        const res = await _saveDataKeys({
            data: data.map(item => ({
                ...item,
                uuid: undefined,
                id: undefined,
                createdAt: undefined,
                updatedAt: undefined,
                publishDate: undefined,
                deletedAt: undefined,
                version: undefined,
            })),
        });

        return res;
    } catch(e: any) {
        return {
            success: false,
            errors: [e.message],
        };
    }
}

export async function _saveDataKeysUpdateIfExist({
    data,
}: SaveDataKeysParams): Promise<SaveDataKeysResponse> {
    try {
        const uniqueKeys = data.map(item => item.uniqueKey!).filter(n => n);

        const saved = await _getDataKeys({ uniqueKeys, });

        const res = await _saveDataKeys({
            data: data.map(item => {
                const existing = saved.data.find(dk => dk.uniqueKey === item.uniqueKey);

                return {
                    ...item,
                    uuid: existing?.uuid,
                    id: existing?.id,
                    createdAt: existing?.createdAt,
                    updatedAt: existing?.updatedAt,
                    publishDate: existing?.publishDate,
                    deletedAt: existing?.deletedAt,
                    version: existing?.version,
                };
            }),
        });

        return res;
    } catch(e: any) {
        return {
            success: false,
            errors: [e.message],
        };
    }
}
