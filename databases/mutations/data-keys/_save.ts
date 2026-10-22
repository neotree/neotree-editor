import { count, eq, or } from 'drizzle-orm';
import * as uuid from 'uuid';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import type { DbOrTransaction } from '@/databases/pg/db-client';
import { dataKeys, dataKeysDrafts } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { _getDataKeys, _getDataKeysRefs } from '@/databases/queries/data-keys';
import { normalizeIncomingDataKeyPatch, rebaseDataKeyOptions } from '@/lib/data-key-save';
import { validateDataKeyOptionsAddition } from '@/lib/data-key-children';
import { isNuidManagedDataKey, NUID_MANAGED } from '@/lib/nuid-search';
import { normalizeDataKeyCompatibilityType } from '@/lib/data-key-types';
import { assertDraftOwner } from '@/lib/server/draft-owner';
import { _updateDataKeysRefs } from './_update_data_keys_refs';
import { _syncConditionRefsAfterReplacement } from './_sync_condition_refs';
import { reportKeyDescriber, runRecordedDataKeyOperation, type OperationPreview } from './_recorded-operation';
import type { DataKeyDraftOrigin } from '@/databases/pg/_data-keys';
import {
    _deleteReferencedDataKeyOptions,
    type UnlinkReplacementDataKey,
} from './_delete-referenced-options';

export type SaveDataKeysData = Partial<typeof dataKeys.$inferSelect> & {
    deletedUniqueKeys?: string[];
    /**
     * The option list the editor started from. If the current draft changed
     * meanwhile, apply only this edit's additions/removals to that newer list.
     */
    baseOptions?: string[];
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
    /**
     * Run the save, report what it would change in the scripts, then roll back.
     * Saves that unlink options from a parent are always recorded this way, so
     * they can be previewed and reverted.
     */
    dryRun?: boolean;
};

export type SaveDataKeysResponse = {
    success: boolean;
    errors?: string[];
    /** Saved, but worth telling the user (e.g. an imported option pool that mixes data types). */
    warnings?: string[];
    info?: {
        refs?: Pick<Awaited<ReturnType<typeof _updateDataKeysRefs>>, 'info' | 'affected'>;
        /** Conditions rewritten because a key or option was renamed. */
        conditionsRewritten?: number;
    };
    /** What changes (dry run) or changed (recorded unlink) in each script. */
    preview?: OperationPreview;
    /** The recorded operation, for its report and revert. */
    operationId?: string;
};

const uniqueValues = (values: string[]) => Array.from(new Set(values.map((value) => `${value || ''}`.trim()).filter(Boolean)));

const describeOthersDrafts = (items: { title: string; scriptTitle?: string }[]) =>
    items.slice(0, 10).map(item => `${item.scriptTitle ? `${item.scriptTitle} > ` : ''}${item.title}`).join('; ') +
    (items.length > 10 ? '; ...' : '');

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
    const savedOptionSet = new Set(savedOptions.map(option => `${option || ''}`.trim()).filter(Boolean));
    const normalizedDeleted = Array.from(new Set(
        deletedUniqueKeys
            .map(key => `${key || ''}`.trim())
            .filter(key => key && !savedOptionSet.has(key)),
    ));
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
            replacedName: removed?.name || '',
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
    dryRun,
}: SaveDataKeysParams): Promise<SaveDataKeysResponse> {
    const response: SaveDataKeysResponse = { success: false, };
    const refuseOthersDrafts = draftOrigin === 'editor' && !!userId;

    try {
        // Nobody can see, publish, or discard a draft without an owner.
        await assertDraftOwner(userId);
        let refsSaved = 0;
        let saveWarnings: string[] = [];

        const executeSave = async (executor: DbOrTransaction) => {
            const errors: string[] = [];
            const warnings: string[] = [];
            saveWarnings = warnings;
            const propagationMatchUniqueKeysByDataKey: Record<string, string[]> = {};
            // Name changes (old -> new): scripts follow them, so conditions must too.
            const nameRenames: { from: string; to: string }[] = [];
            const trackRename = (from?: string | null, to?: string | null) => {
                const previous = `${from || ''}`.trim();
                const next = `${to || ''}`.trim();
                if (previous && next && previous.toLowerCase() !== next.toLowerCase()) nameRenames.push({ from: previous, to: next });
            };

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

            const resolveConfidentialLabelOnly = ({
                incoming,
                existing,
                fallback,
            }: {
                incoming: SaveDataKeysData;
                existing?: Partial<typeof dataKeys.$inferSelect> | null;
                fallback?: boolean | null;
            }) => {
                if (typeof incoming.confidentialLabelOnly === 'boolean') return incoming.confidentialLabelOnly;
                if (typeof existing?.confidentialLabelOnly === 'boolean') return existing.confidentialLabelOnly;
                if (typeof fallback === 'boolean') return fallback;
                return false;
            };

            const data = dataParam.map(item => {
                return {
                    ...item,
                    uuid: item.uuid || uuid.v4(),
                    isNewUuid: !item.uuid,
                };
            });

            const uniqueKeys: string[] = [];

            if (draftOrigin === 'editor') try {
                const incomingNames = Array.from(
                    new Set(data.map((d) => `${d.name || ''}`.trim().toLowerCase()).filter(Boolean)),
                );
                if (incomingNames.length) {
                    const existing = await _getDataKeys({ names: incomingNames, client: executor, });
                    const managedExisting = (existing.data || []).filter((k) => isNuidManagedDataKey(k as any));
                    for (const item of data) {
                        const name = `${item.name || ''}`.trim();
                        if (!name) continue;
                        const compat = normalizeDataKeyCompatibilityType(item.dataType);
                        const dup = managedExisting.find((k) =>
                            `${k.name || ''}`.trim().toLowerCase() === name.toLowerCase() &&
                            normalizeDataKeyCompatibilityType(k.dataType) === compat &&
                            `${k.uniqueKey || ''}` !== `${item.uniqueKey || ''}` &&
                            `${k.uuid || ''}` !== `${item.uuid || ''}`,
                        );
                        if (dup) {
                            errors.push(
                                `A NUID Search data key "${dup.name}" (${dup.dataType}) already exists — duplicate managed keys aren't allowed.`,
                            );
                        }
                    }
                }
            } catch (e: any) {
                logger.error('_saveDataKeys managed-duplicate check ERROR', e?.message);
            }
            if (errors.length) {
                throw new Error(errors.join(', '));
            }

            // The library the new options are checked against: what is stored, with this save's keys laid
            // over it. A save can create a parent and its new options together (an import does: DEV added an
            // option key, and the parent that lists it comes in the same batch); whichever is written first,
            // the options it is creating count as existing, and cycles are checked on the result.
            let validationLibraryCache: Awaited<ReturnType<typeof _getDataKeys>>['data'] | null = null;
            const getValidationLibrary = async () => {
                if (!validationLibraryCache) {
                    const res = await _getDataKeys({ client: executor });
                    if (res.errors?.length) throw new Error(res.errors.join(', '));
                    const stored = res.data;
                    const byUuid = new Map(stored.map((k) => [`${k.uuid || ''}`, k] as const));
                    const byUniqueKey = new Map(stored.map((k) => [`${k.uniqueKey || ''}`.trim(), k] as const));
                    const library = new Map(byUniqueKey);
                    data.forEach((item) => {
                        const base = byUuid.get(`${item.uuid || ''}`) || byUniqueKey.get(`${item.uniqueKey || ''}`.trim());
                        const uniqueKey = `${item.uniqueKey || base?.uniqueKey || ''}`.trim();
                        if (!uniqueKey) return;
                        library.set(uniqueKey, {
                            ...(base || {}),
                            uuid: base?.uuid || item.uuid,
                            uniqueKey,
                            name: item.name ?? base?.name ?? '',
                            label: item.label ?? base?.label ?? '',
                            dataType: item.dataType ?? base?.dataType ?? '',
                            options: (item.options ?? base?.options ?? []) as string[],
                        } as (typeof stored)[number]);
                    });
                    validationLibraryCache = Array.from(library.values());
                }
                return validationLibraryCache;
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
                    baseOptions,
                    optionReplacements = {},
                    ...item
                } of data
            ) {
                try {
                    const normalizedItem = normalizeIncomingDataKeyPatch(item);
                    const rebaseOptions = (current?: string[] | null) => {
                        if (!Array.isArray(baseOptions) || !Array.isArray(normalizedItem.options)) return;
                        normalizedItem.options = rebaseDataKeyOptions({
                            incoming: normalizedItem.options,
                            base: baseOptions,
                            current: current || [],
                        });
                    };

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
                        rebaseOptions(previousOptions);
                        const nextOptions = normalizedItem.options !== undefined
                            ? (normalizedItem.options || [])
                            : previousOptions;
                        const reconciledDeletedUniqueKeys = deletedUniqueKeys.filter(key =>
                            previousOptions.includes(key) && !nextOptions.includes(key),
                        );

                        // Newly added options must exist, keep the pool single-typed,
                        // and never create circular references.
                        if (nextOptions.some(option => !previousOptions.includes(option))) {
                            const validationLibrary = await getValidationLibrary();
                            const parentEntry = validationLibrary.find((k) => `${k.uniqueKey || ''}`.trim() === `${existingUniqueKey}`.trim());
                            const parentTitle = normalizedItem.label || normalizedItem.name || parentEntry?.label || parentEntry?.name || existingUniqueKey;
                            const optionsError = validateDataKeyOptionsAddition({
                                dataKeys: validationLibrary,
                                parentUniqueKey: existingUniqueKey,
                                previousOptions,
                                nextOptions,
                                // an import mirrors the source editor, which already has this option pool
                                ...(draftOrigin === 'import' ? {
                                    onTypeMismatch: (message: string) => warnings.push(
                                        `Data key "${parentTitle}": ${message} Imported as it is on the source editor.`,
                                    ),
                                } : {}),
                            });
                            if (optionsError) throw new Error(optionsError);
                        }

                        // Validate the unlink plan BEFORE writing the draft so a bad
                        // replacement can never leave a half-applied save behind.
                        const unlinkPlan = await buildOptionUnlinkPlan({
                            deletedUniqueKeys: reconciledDeletedUniqueKeys,
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
                                    confidentialLabelOnly: true,
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
                            const resolvedConfidentialLabelOnly = resolveConfidentialLabelOnly({
                                incoming: normalizedItem,
                                existing: draft.data,
                                fallback: publishedForDraft?.confidentialLabelOnly,
                            });
                            if (resolvedConfidential && resolvedConfidentialLabelOnly) {
                                errors.push(
                                    `Data key "${data.name || dataKeyUuid}" cannot be both Confidential and Confidential (label only).`,
                                );
                                continue;
                            }
                            data.confidential = resolvedConfidential;
                            data.confidentialLabelOnly = resolvedConfidentialLabelOnly;

                            // A NUID-managed key's `name` and `dataType` are immutable — force
                            // them back to the stored draft values and keep the managed flag.
                            if (isNuidManagedDataKey(draft.data as any)) {
                                (data as any).name = (draft.data as any)?.name ?? (data as any).name;
                                (data as any).dataType = (draft.data as any)?.dataType ?? (data as any).dataType;
                                (data as any).metadata = { ...((data as any).metadata || {}), managed: NUID_MANAGED };
                            }

                            await executor
                                .update(dataKeysDrafts)
                                .set({
                                    data,
                                    name: data.name,
                                    uniqueKey: data.uniqueKey,
                                    draftOrigin,
                                    // An ownerless draft is claimed by the next authenticated editor.
                                    ...(!draft.createdByUserId && userId ? { createdByUserId: userId } : {}),
                                })
                                // The draft may have matched by uniqueKey under a different uuid.
                                .where(eq(dataKeysDrafts.uuid, draft.uuid));
                            trackRename(draft.data?.name, data.name);

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
                            const resolvedConfidentialLabelOnly = resolveConfidentialLabelOnly({ incoming: normalizedItem, existing: published });
                            if (resolvedConfidential && resolvedConfidentialLabelOnly) {
                                errors.push(
                                    `Data key "${data.name || dataKeyUuid}" cannot be both Confidential and Confidential (label only).`,
                                );
                                continue;
                            }
                            data.confidential = resolvedConfidential;
                            data.confidentialLabelOnly = resolvedConfidentialLabelOnly;

                            if (isNuidManagedDataKey(published as any)) {
                                data.name = published?.name ?? data.name;
                                data.dataType = published?.dataType ?? data.dataType;
                                data.metadata = { ...((data as any).metadata || {}), managed: NUID_MANAGED } as any;
                            }

                            await executor.insert(dataKeysDrafts).values({
                                data,
                                uuid: dataKeyUuid,
                                dataKeyId: published?.uuid,
                                name: data.name,
                                uniqueKey,
                                draftOrigin,
                                createdByUserId: userId,
                            });
                            trackRename(published?.name, data.name);

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
                            if (unlinkRes.skipped?.length && refuseOthersDrafts) {
                                throw new Error(
                                    `Not saved: removing ${reconciledDeletedUniqueKeys.length === 1 ? 'this option' : 'these options'} would change ${unlinkRes.skipped.length === 1 ? 'a question' : `${unlinkRes.skipped.length} questions`} that another user is still editing (unpublished): ` +
                                    describeOthersDrafts(unlinkRes.skipped) +
                                    '. Ask them to publish or discard their changes first (an admin can take over drafts that have no owner).',
                                );
                            }
                            if (unlinkRes.skipped?.length) {
                                warnings.push(
                                    `${unlinkRes.skipped.length} question${unlinkRes.skipped.length === 1 ? '' : 's'} still list the removed option${reconciledDeletedUniqueKeys.length === 1 ? '' : 's'} because another user has unpublished changes there: ` +
                                    describeOthersDrafts(unlinkRes.skipped),
                                );
                            }
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

                const othersDrafts = updateRefsRes.othersDrafts || [];
                if (othersDrafts.length && refuseOthersDrafts) {
                    throw new Error(
                        `Not saved: this change would also update ${othersDrafts.length === 1 ? 'a question' : `${othersDrafts.length} questions`} that another user is still editing (unpublished): ` +
                        describeOthersDrafts(othersDrafts) +
                        '. Ask them to publish or discard their changes first (an admin can take over drafts that have no owner).',
                    );
                }
                if (othersDrafts.length) {
                    warnings.push(
                        `${othersDrafts.length} question${othersDrafts.length === 1 ? ' is' : 's are'} in another user's unpublished draft and ${othersDrafts.length === 1 ? 'was' : 'were'} updated there; ${othersDrafts.length === 1 ? 'it goes' : 'they go'} live when that user publishes: ` +
                        describeOthersDrafts(othersDrafts),
                    );
                }

                // The refs sync renamed field keys and option values in these
                // scripts; bring their conditions along ($Old, $Parent = 'Old').
                // Each rename is only applied where the script itself shows it.
                const affectedScriptIds = (updateRefsRes.affected?.scripts || []).map((script) => script.scriptId).filter(Boolean);
                if (nameRenames.length && affectedScriptIds.length) {
                    const conditionsRes = await _syncConditionRefsAfterReplacement({
                        renamesByScriptId: Object.fromEntries(affectedScriptIds.map((scriptId) => [scriptId, nameRenames])),
                        userId,
                        client: executor,
                    });
                    if (conditionsRes.errors?.length) throw new Error(conditionsRes.errors.join(', '));
                    response.info = { ...response.info, conditionsRewritten: conditionsRes.rewritten };
                }
            }

            if (warnings.length) {
                response.warnings = [...(response.warnings || []), ...warnings];
            }
        };

        // Unlinking options from a parent rewrites the scripts that use it:
        // record it (preview, conflict check, revert) like merges and deletes.
        const unlinkItems = dataParam.filter((item) => (item.deletedUniqueKeys || []).some((key) => `${key || ''}`.trim()));
        const recorded = !client && (dryRun || unlinkItems.length > 0);

        // Run atomically: either every draft write, unlink sync, and refs update
        // lands, or none do. When a client is provided we join its transaction.
        if (client) {
            await executeSave(client);
        } else if (recorded) {
            const parentKeys = uniqueValues(dataParam.map((item) => item.uniqueKey || ''));
            const childKeys = uniqueValues(unlinkItems.flatMap((item) => [
                ...(item.deletedUniqueKeys || []),
                ...Object.values(item.optionReplacements || {}),
            ]));
            const involved = await _getDataKeys({ uniqueKeys: uniqueValues([...parentKeys, ...childKeys]) });
            if (involved.errors?.length) throw new Error(involved.errors[0]);
            const byUniqueKey = new Map(involved.data.map((dataKey) => [dataKey.uniqueKey, dataKey]));
            const byId = new Map(involved.data.map((dataKey) => [dataKey.uuid, dataKey]));

            // The save rewrites the scripts that reference the saved keys.
            const refs = !parentKeys.length ? { data: [] as { refType: string; data: any }[] } : await _getDataKeysRefs({ uniqueKeys: parentKeys });
            const scriptTitles = new Map<string, string>();
            const scriptIds = uniqueValues(refs.data.map((ref) => {
                const scriptId = `${ref.data?.scriptId || ref.data?.scriptDraftId || ''}`;
                if (scriptId && ref.data?.scriptTitle) scriptTitles.set(scriptId, ref.data.scriptTitle);
                return scriptId;
            }));

            const parent = byUniqueKey.get(parentKeys[0]);
            const parentTitle = parent?.name || parent?.label || parentKeys[0] || 'data key';
            const unlinkedCount = uniqueValues(unlinkItems.flatMap((item) => item.deletedUniqueKeys || [])).length;

            const outcome = await runRecordedDataKeyOperation({
                dryRun,
                userId,
                snapshotScope: {
                    scriptIds,
                    dataKeyIds: uniqueValues([...dataParam.map((item) => item.uuid || ''), ...involved.data.map((dataKey) => dataKey.uuid)]),
                    dataKeyUniqueKeys: uniqueValues([...parentKeys, ...childKeys]),
                },
                titles: {
                    script: (id) => scriptTitles.get(id) || 'a script',
                    dataKey: (id) => byId.get(id)?.name || 'a data key',
                },
                describeKey: reportKeyDescriber(byUniqueKey),
                run: (tx) => executeSave(tx),
                record: () => ({
                    kind: 'unlink',
                    title: `Unlink ${unlinkedCount} option${unlinkedCount === 1 ? '' : 's'} from “${parentTitle}”`,
                    scope: 'library',
                    subjectUniqueKey: parentKeys[0] || '',
                    subjectName: parentTitle,
                    affectedUniqueKeys: uniqueValues(unlinkItems.flatMap((item) => item.deletedUniqueKeys || [])),
                    scriptIds,
                    request: {
                        parentUniqueKey: parentKeys[0],
                        deletedUniqueKeys: uniqueValues(unlinkItems.flatMap((item) => item.deletedUniqueKeys || [])),
                        optionReplacements: Object.assign({}, ...unlinkItems.map((item) => item.optionReplacements || {})),
                        unlinkedKeys: childKeys.map((uniqueKey) => {
                            const key = byUniqueKey.get(uniqueKey);
                            return { uniqueKey, name: key?.name || '', label: key?.label || '' };
                        }),
                    },
                    reportExtras: { deletedDataKeyIds: [] },
                }),
            });

            response.preview = outcome.preview;
            response.operationId = outcome.operationId;

            if (!dryRun) {
                socket.emit('data_changed', 'save_data_keys');
                if (broadcastAction && refsSaved) socket.emit('data_changed', 'save_scripts');
            }
        } else {
            await db.transaction(executeSave);

            // Emit only when we own the transaction — a joined transaction may
            // still roll back after we return.
            socket.emit('data_changed', 'save_data_keys');
            if (broadcastAction && refsSaved) socket.emit('data_changed', 'save_scripts');
        }

        if (saveWarnings.length) response.warnings = Array.from(new Set(saveWarnings));
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
    ...params
}: SaveDataKeysParams): Promise<SaveDataKeysResponse> {
    try {
        const uniqueKeys = data.map(item => item.uniqueKey!).filter(n => n);

        const saved = await _getDataKeys({ uniqueKeys, client: params.client, });

        data = data.filter(item => {
            const existing = saved.data.find(dk => dk.uniqueKey === item.uniqueKey);

            if (existing) return false;

            return true;
        });

        const res = await _saveDataKeys({
            ...params,
            data: data.map(item => ({
                ...item,
                uuid: undefined,
                id: undefined,
                createdAt: undefined,
                updatedAt: undefined,
                publishDate: undefined,
                deletedAt: undefined,
                version: undefined,
                createdByUserId: params.userId,
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
    ...params
}: SaveDataKeysParams): Promise<SaveDataKeysResponse> {
    try {
        const uniqueKeys = data.map(item => item.uniqueKey!).filter(n => n);

        const saved = await _getDataKeys({ uniqueKeys, client: params.client, });

        const res = await _saveDataKeys({
            ...params,
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
                    createdByUserId: params.userId,
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
