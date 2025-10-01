import { desc, eq, or } from 'drizzle-orm';
import * as uuid from 'uuid';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { dataKeys, dataKeysDrafts } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { _getDataKeys } from '@/databases/queries/data-keys';

export type SaveDataKeysData = Partial<typeof dataKeys.$inferSelect>;

export type SaveDataKeysParams = {
    data: SaveDataKeysData[],
    broadcastAction?: boolean,
    userId?: string;
};

export type SaveDataKeysResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _saveDataKeys({ data: dataParam, broadcastAction, userId, }: SaveDataKeysParams) {
    const response: SaveDataKeysResponse = { success: false, };

    try {
        const errors = [];

        const data = dataParam.map(item => {
            return {
                ...item,
                uuid: item.uuid || uuid.v4(),
                isNewUuid: !item.uuid,
            };
        });

        // const { data: { drafts, published, }, } = await checkDataKeyName(
        //     data.filter(d => d.name).map(d => d.name!),
        //     { uuidNot: data.filter(d => d.name).map(d => d.uuid), },
        // );

        // const duplicates = { ...drafts, ...published, };

        // if (Object.keys(duplicates).length) {
        //     return { success: false, errors: [`Duplicate keys: ${Object.keys(duplicates).join(', ')}`] };
        // }

        let index = 0;
        for (const { uuid: dataKeyUuid, isNewUuid, ...item } of data) {
            try {
                index++;

                if (!errors.length) {
                    const draft = isNewUuid ? null : await db.query.dataKeysDrafts.findFirst({
                        where: or(
                            eq(dataKeysDrafts.uuid, dataKeyUuid),
                            !item.uniqueKey ? undefined :  eq(dataKeysDrafts.uniqueKey, item.uniqueKey)
                        ),
                    });

                    const published = (draft || isNewUuid) ? null : await db.query.dataKeys.findFirst({
                        where: eq(dataKeys.uuid, dataKeyUuid),
                    });

                    if (draft) {
                        const data = {
                            ...draft.data,
                            ...item,
                        };
                        
                        await db
                            .update(dataKeysDrafts)
                            .set({
                                data,
                                name: data.name,
                            }).where(eq(dataKeysDrafts.uuid, dataKeyUuid));
                    } else {
                        const uniqueKey = published?.uniqueKey || item.uniqueKey || uuid.v4();

                        const data = {
                            ...published,
                            ...item,
                            uniqueKey,
                            uuid: dataKeyUuid,
                            version: published?.version ? (published.version + 1) : 1,
                        } as typeof dataKeys.$inferSelect;

                        await db.insert(dataKeysDrafts).values({
                            data,
                            uuid: dataKeyUuid,
                            dataKeyId: published?.uuid,
                            name: data.name,
                            uniqueKey,
                            createdByUserId: userId,
                        });
                    }
                }
            } catch(e: any) {
                errors.push(e.message);
            }
        }

        if (errors.length) {
            response.errors = errors;
        } else {
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
