import { count, eq, or } from 'drizzle-orm';
import * as uuid from 'uuid';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import type { DbOrTransaction } from '@/databases/pg/db-client';
import { dataKeys, dataKeysDrafts } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { _getDataKeys } from '@/databases/queries/data-keys';
import { normalizeIncomingDataKeyPatch, rebaseDataKeyOptions } from '@/lib/data-key-save';
import { isNuidManagedDataKey, NUID_MANAGED } from '@/lib/nuid-search';
import { normalizeDataKeyCompatibilityType } from '@/lib/data-key-types';
import { _updateDataKeysRefs } from './_update_data_keys_refs';
import type { DataKeyDraftOrigin } from '@/databases/pg/_data-keys';
import { _deleteReferencedDataKeyOptions } from './_delete-referenced-options';
import { assertDraftOwner } from "@/lib/server/draft-owner";

export type SaveDataKeysData = Partial<typeof dataKeys.$inferSelect> & {
    deletedUniqueKeys?: string[];
    /**
     * The option list the editor started from. When the key changed since (another user, an import),
     * only this edit's own additions and removals are applied to the current list instead of replacing it.
     */
    baseOptions?: string[];
};



export type SaveDataKeysParams = {
    data: SaveDataKeysData[],
    broadcastAction?: boolean,
    userId?: string;
    updateRefs?: boolean;
    allowConfidentialDowngrade?: boolean;
    draftOrigin?: DataKeyDraftOrigin;
    propagatedDraftOrigin?: Extract<DataKeyDraftOrigin, "data_key_sync" | "import">;
    /** Run inside this transaction (e.g. an import saving its screens and data keys together). */
    client?: DbOrTransaction;
};

export type SaveDataKeysResponse = { 
    success: boolean; 
    errors?: string[];
    warnings?: string[];
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

/** Thrown inside the save transaction to roll it back and return this response instead. */
class SaveDataKeysRollback extends Error {
    constructor(public response: SaveDataKeysResponse) {
        super((response.errors || []).join(', ') || 'Data keys were not saved');
    }
}

const describeOthersDrafts = (items: { title: string; scriptTitle?: string; }[]) =>
    items.slice(0, 10).map(e => `${e.scriptTitle ? `${e.scriptTitle} > ` : ''}${e.title}`).join('; ') +
    (items.length > 10 ? '; ...' : '');

async function enforceDraftOriginForTouchedDataKeys({
    uniqueKeys,
    userId,
    draftOrigin,
    executor,
}: {
    uniqueKeys: string[];
    userId?: string;
    draftOrigin: DataKeyDraftOrigin;
    executor: DbOrTransaction;
}) {
    if (!uniqueKeys.length) return;

    const touchedPublishedDataKeys = await _getDataKeys({ uniqueKeys, client: executor, });
    if (touchedPublishedDataKeys.errors?.length) {
        throw new Error(touchedPublishedDataKeys.errors.join(', '));
    }

    const touchedPublishedIds = touchedPublishedDataKeys.data
        .map((item) => item.uuid)
        .filter((value): value is string => !!value);

    const drafts = await executor.query.dataKeysDrafts.findMany({
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
        await executor
            .update(dataKeysDrafts)
            .set({ draftOrigin })
            .where(eq(dataKeysDrafts.uuid, draftId));
    }
}

/**
 * Saves data keys as drafts and brings the scripts that use them in line (labels, removed options).
 *
 * Everything happens in one transaction (the caller's, when `client` is given): either the keys and every
 * change they cause in scripts are saved, or nothing is. A save made in the editor that would have to
 * change another user's unpublished draft (or an ownerless one) is refused instead: writing into someone
 * else's work in progress is how key changes used to get lost or published half-way.
 */
export async function _saveDataKeys(params: SaveDataKeysParams): Promise<SaveDataKeysResponse> {
    try {
        // nobody could see, publish or discard a draft without an owner
        await assertDraftOwner(params.userId);
        const run = (tx: DbOrTransaction) => saveDataKeysInTransaction(params, tx);
        const response = params.client
            ? await params.client.transaction(run)
            : await db.transaction(run);
        if (response.success) socket.emit('data_changed', 'save_data_keys');
        return response;
    } catch (e: any) {
        if (e instanceof SaveDataKeysRollback) return e.response;
        logger.error('_saveDataKeys ERROR', e.message);
        return { success: false, errors: [e.message], };
    }
}

async function saveDataKeysInTransaction({ 
    data: dataParam, 
    broadcastAction, 
    updateRefs = true,
    userId,
    draftOrigin = "editor",
    propagatedDraftOrigin,
}: SaveDataKeysParams, executor: DbOrTransaction): Promise<SaveDataKeysResponse> {
    const response: SaveDataKeysResponse = { success: false, };
    // an editor save never writes into another user's (or an ownerless) unpublished draft
    const refuseOthersDrafts = draftOrigin === 'editor' && !!userId;

    {
        const errors = [];
        const warnings: string[] = [];
        const propagationMatchUniqueKeysByDataKey: Record<string, string[]> = {};
        // parent uniqueKey -> options that left its list in this save (and were asked to be removed)
        const removedOptionsByParent: Record<string, string[]> = {};
        const reconcileRemovedOptions = (parentUniqueKey: string | undefined | null, previous: string[], next: string[], requested: string[]) => {
            if (!parentUniqueKey || !requested.length) return;
            // Only options that really left this key's list. The form's list of deleted options was never
            // reconciled: an option deleted and added back, or deleted from the wrong row, was still sent.
            const removed = requested.filter(uk => previous.includes(uk) && !next.includes(uk));
            if (removed.length) removedOptionsByParent[parentUniqueKey] = Array.from(new Set([...(removedOptionsByParent[parentUniqueKey] || []), ...removed]));
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
            throw new SaveDataKeysRollback({ success: false, errors });
        }

        // const { data: { drafts, published, }, } = await checkDataKeyName(
        //     data.filter(d => d.name).map(d => d.name!),
        //     { uuidNot: data.filter(d => d.name).map(d => d.uuid), },
        // );

        // const duplicates = { ...drafts, ...published, };

        // if (Object.keys(duplicates).length) {
        //     return { success: false, errors: [`Duplicate keys: ${Object.keys(duplicates).join(', ')}`] };
        // }

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
                ...item 
            } of data
        ) {
            try {
                const normalizedItem = normalizeIncomingDataKeyPatch(item);
                const rebase = (current?: string[] | null) => {
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

                    if (draft) {
                        rebase(draft.data?.options);
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
                                // an ownerless draft is taken over by whoever edits it next
                                ...(!draft.createdByUserId && userId ? { createdByUserId: userId } : {}),
                            // the draft may have been found by uniqueKey under a different uuid
                            }).where(eq(dataKeysDrafts.uuid, draft.uuid));

                        if (data.uniqueKey) {
                            propagationMatchUniqueKeysByDataKey[data.uniqueKey] = Array.from(new Set([
                                `${draft.uniqueKey || ''}`.trim(),
                                `${normalizedItem.uniqueKey || ''}`.trim(),
                                `${data.uniqueKey || ''}`.trim(),
                            ].filter(Boolean)));
                        }

                        if (data.uniqueKey) uniqueKeys.push(data.uniqueKey);

                        const publishedOptions = !draft.dataKeyId ? [] : ((await executor.query.dataKeys.findFirst({
                            where: eq(dataKeys.uuid, draft.dataKeyId),
                            columns: { options: true, },
                        }))?.options || []);
                        reconcileRemovedOptions(
                            data.uniqueKey,
                            Array.from(new Set([...(draft.data?.options || []), ...publishedOptions])),
                            data.options || [],
                            deletedUniqueKeys,
                        );
                    } else {
                        if (published) rebase(published.options);
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

                        if (data.uniqueKey) {
                            propagationMatchUniqueKeysByDataKey[data.uniqueKey] = Array.from(new Set([
                                `${published?.uniqueKey || ''}`.trim(),
                                `${normalizedItem.uniqueKey || ''}`.trim(),
                                `${data.uniqueKey || ''}`.trim(),
                            ].filter(Boolean)));
                        }

                        uniqueKeys.push(data.uniqueKey);

                        reconcileRemovedOptions(data.uniqueKey, published?.options || [], data.options || [], deletedUniqueKeys);
                    }
                }
            } catch(e: any) {
                errors.push(e.message);
            }
        }

        if (!errors.length) {
            // Remove options that left a key's list from that key's own questions only.
            for (const [parentUniqueKey, removed] of Object.entries(removedOptionsByParent)) {
                const res = await _deleteReferencedDataKeyOptions({ userId, uniqueKeys: removed, parentUniqueKey, client: executor, });
                res.errors?.forEach(e => errors.push(e));
                if (res.skipped?.length && refuseOthersDrafts) {
                    errors.push(
                        `Not saved: removing ${removed.length === 1 ? 'this option' : 'these options'} would change ${res.skipped.length === 1 ? 'a question' : `${res.skipped.length} questions`} that another user is still editing (unpublished): ` +
                        describeOthersDrafts(res.skipped) +
                        '. Ask them to publish or discard their changes first (an admin can take over drafts that have no owner).',
                    );
                } else if (res.skipped?.length) {
                    warnings.push(
                        `${res.skipped.length} question${res.skipped.length === 1 ? '' : 's'} still list the removed option${removed.length === 1 ? '' : 's'} because another user has unpublished changes there: ` +
                        res.skipped.slice(0, 10).map(s => s.title).join(', ') +
                        (res.skipped.length > 10 ? ', ...' : ''),
                    );
                }
            }
        }

        if (warnings.length) response.warnings = warnings;

        if (errors.length) {
            throw new SaveDataKeysRollback({ success: false, errors, warnings: warnings.length ? warnings : undefined, });
        } else {
            if (draftOrigin === "import") {
                await enforceDraftOriginForTouchedDataKeys({
                    uniqueKeys,
                    userId,
                    draftOrigin,
                    executor,
                });
            }

            if (updateRefs && uniqueKeys.length) {
                const { data: dataKeys, } = await _getDataKeys({ uniqueKeys, client: executor, });
                const updateRefsRes = await _updateDataKeysRefs({
                    dataKeys,
                    broadcastAction,
                    userId,
                    draftOrigin: propagatedDraftOrigin || (draftOrigin === "import" ? "import" : "data_key_sync"),
                    matchUniqueKeysByDataKey: propagationMatchUniqueKeysByDataKey,
                    client: executor,
                });
                if (updateRefsRes.errors?.length || !updateRefsRes.success) {
                    throw new SaveDataKeysRollback({
                        success: false,
                        errors: updateRefsRes.errors?.length ? updateRefsRes.errors : ['Failed to update related scripts references'],
                    });
                }
                response.info = {
                    ...response.info,
                    refs: {
                        info: updateRefsRes.info,
                        affected: updateRefsRes.affected,
                    },
                };
                const othersDrafts = updateRefsRes.othersDrafts || [];
                if (othersDrafts.length && refuseOthersDrafts) {
                    throw new SaveDataKeysRollback({
                        success: false,
                        errors: [
                            `Not saved: this change would also update ${othersDrafts.length === 1 ? 'a question' : `${othersDrafts.length} questions`} that another user is still editing (unpublished): ` +
                            describeOthersDrafts(othersDrafts) +
                            '. Ask them to publish or discard their changes first (an admin can take over drafts that have no owner).',
                        ],
                    });
                }
                if (othersDrafts.length) {
                    const names = describeOthersDrafts(othersDrafts);
                    response.warnings = [
                        ...(response.warnings || []),
                        `${othersDrafts.length} question${othersDrafts.length === 1 ? ' is' : 's are'} in another user's unpublished draft and ${othersDrafts.length === 1 ? 'was' : 'were'} updated there; ${othersDrafts.length === 1 ? 'it goes' : 'they go'} live when that user publishes: ${names}`,
                    ];
                }
            }

            response.success = true;
        }

        return response;
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
