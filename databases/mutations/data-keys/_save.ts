import { count, eq, or } from 'drizzle-orm';
import * as uuid from 'uuid';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { dataKeys, dataKeysDrafts } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { _getDataKeys } from '@/databases/queries/data-keys';
import { _updateDataKeysRefs } from './_update_data_keys_refs';
import type { DataKeyDraftOrigin } from '@/databases/pg/_data-keys';

export type SaveDataKeysData = Partial<typeof dataKeys.$inferSelect>;

export type SaveDataKeysParams = {
    data: SaveDataKeysData[],
    broadcastAction?: boolean,
    userId?: string;
    updateRefs?: boolean;
    allowConfidentialDowngrade?: boolean;
    draftOrigin?: DataKeyDraftOrigin;
    propagatedDraftOrigin?: Extract<DataKeyDraftOrigin, "data_key_sync" | "import">;
};

export type SaveDataKeysResponse = { 
    success: boolean; 
    errors?: string[];
    info?: {
        refs?: Pick<Awaited<ReturnType<typeof _updateDataKeysRefs>>, 'info' | 'affected'>;
    };
};

async function createNewUniqueKey(uniqueKey?: string) {
    uniqueKey = `${uniqueKey || ''}`.trim();
    uniqueKey = uniqueKey || uuid.v4()
    const [{ count: existing, }] = await db
        .select({ count: count(dataKeys.uniqueKey), })
        .from(dataKeys)
        .where(eq(dataKeys.uniqueKey, uniqueKey));
    if (existing) return await createNewUniqueKey();
    return uniqueKey;
}

async function enforceDraftOriginForTouchedDataKeys({
    uniqueKeys,
    userId,
    draftOrigin,
}: {
    uniqueKeys: string[];
    userId?: string;
    draftOrigin: DataKeyDraftOrigin;
}) {
    if (!uniqueKeys.length) return;

    const touchedPublishedDataKeys = await _getDataKeys({ uniqueKeys });
    if (touchedPublishedDataKeys.errors?.length) {
        throw new Error(touchedPublishedDataKeys.errors.join(', '));
    }

    const touchedPublishedIds = touchedPublishedDataKeys.data
        .map((item) => item.uuid)
        .filter((value): value is string => !!value);

    const drafts = await db.query.dataKeysDrafts.findMany({
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
        await db
            .update(dataKeysDrafts)
            .set({ draftOrigin })
            .where(eq(dataKeysDrafts.uuid, draftId));
    }
}

export async function _saveDataKeys({ 
    data: dataParam, 
    broadcastAction, 
    updateRefs = true,
    userId,
    draftOrigin = "editor",
    propagatedDraftOrigin,
}: SaveDataKeysParams) {
    const response: SaveDataKeysResponse = { success: false, };

    try {
        const errors = [];

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

        // const { data: { drafts, published, }, } = await checkDataKeyName(
        //     data.filter(d => d.name).map(d => d.name!),
        //     { uuidNot: data.filter(d => d.name).map(d => d.uuid), },
        // );

        // const duplicates = { ...drafts, ...published, };

        // if (Object.keys(duplicates).length) {
        //     return { success: false, errors: [`Duplicate keys: ${Object.keys(duplicates).join(', ')}`] };
        // }

        let index = 0;
        for (const { uuid: dataKeyUuid, isNewUuid, createdAt, publishDate, deletedAt, updatedAt, ...item } of data) {
            try {
                item.name = `${item.name || ''}`.trim();
                item.label = `${item.label || ''}`.trim();

                index++;

                if (!errors.length) {
                    const draft = isNewUuid ? null : await db.query.dataKeysDrafts.findFirst({
                        where: or(
                            eq(dataKeysDrafts.uuid, dataKeyUuid),
                            !item.uniqueKey ? undefined :  eq(dataKeysDrafts.uniqueKey, item.uniqueKey)
                        ),
                    });

                    const published = (draft || isNewUuid) ? null : await db.query.dataKeys.findFirst({
                        where: or(
                            eq(dataKeys.uuid, dataKeyUuid),
                            !item.uniqueKey ? undefined : eq(dataKeys.uniqueKey, item.uniqueKey)
                        ),
                    });

                    if (draft) {
                        const publishedForDraft = !draft.dataKeyId ? null : await db.query.dataKeys.findFirst({
                            where: eq(dataKeys.uuid, draft.dataKeyId),
                            columns: {
                                confidential: true,
                                name: true,
                            },
                        });

                        const data = {
                            ...draft.data,
                            ...item,
                        };
                        const resolvedConfidential = resolveConfidential({
                            incoming: item,
                            existing: draft.data,
                            fallback: publishedForDraft?.confidential,
                        });
                        data.confidential = resolvedConfidential;

                        await db
                            .update(dataKeysDrafts)
                            .set({
                                data,
                                name: data.name,
                                uniqueKey: data.uniqueKey,
                                draftOrigin,
                            }).where(eq(dataKeysDrafts.uuid, dataKeyUuid));

                        if (data.uniqueKey) uniqueKeys.push(data.uniqueKey);
                    } else {
                        const uniqueKey = published?.uniqueKey || await createNewUniqueKey(item.uniqueKey || '');

                        const data = {
                            ...published,
                            ...item,
                            uniqueKey,
                            uuid: dataKeyUuid,
                            version: published?.version ? (published.version + 1) : 1,
                        } as typeof dataKeys.$inferSelect;
                        const resolvedConfidential = resolveConfidential({ incoming: item, existing: published });
                        data.confidential = resolvedConfidential;

                        await db.insert(dataKeysDrafts).values({
                            data,
                            uuid: dataKeyUuid,
                            dataKeyId: published?.uuid,
                            name: data.name,
                            uniqueKey,
                            draftOrigin,
                            createdByUserId: userId,
                        });

                        uniqueKeys.push(data.uniqueKey);
                    }
                }
            } catch(e: any) {
                errors.push(e.message);
            }
        }

        if (errors.length) {
            response.errors = errors;
        } else {
            if (draftOrigin === "import") {
                await enforceDraftOriginForTouchedDataKeys({
                    uniqueKeys,
                    userId,
                    draftOrigin,
                });
            }

            if (updateRefs && uniqueKeys.length) {
                const { data: dataKeys, } = await _getDataKeys({ uniqueKeys, });
                const updateRefsRes = await _updateDataKeysRefs({
                    dataKeys,
                    broadcastAction,
                    userId,
                    draftOrigin: propagatedDraftOrigin || (draftOrigin === "import" ? "import" : "data_key_sync"),
                });
                if (updateRefsRes.errors?.length || !updateRefsRes.success) {
                    response.success = false;
                    response.errors = updateRefsRes.errors?.length ? updateRefsRes.errors : ['Failed to update related scripts references'];
                    return response;
                }
                response.info = {
                    ...response.info,
                    refs: {
                        info: updateRefsRes.info,
                        affected: updateRefsRes.affected,
                    },
                };
            }

            socket.emit('data_changed', 'save_data_keys');
            response.success = true;
        }

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

                console.log('existing?.uuid', existing?.uuid);

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
