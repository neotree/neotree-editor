import { desc, eq } from 'drizzle-orm';
import * as uuid from 'uuid';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { dataKeys, dataKeysDrafts } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { checkDataKeyName } from '@/databases/queries/data-keys';

export type SaveDataKeysData = Partial<typeof dataKeys.$inferSelect>;

export type SaveDataKeysParams = {
    data: SaveDataKeysData[],
    broadcastAction?: boolean,
};

export type SaveDataKeysResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _saveDataKeys({ data: dataParam, broadcastAction, }: SaveDataKeysParams) {
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

        const { data: { drafts, published, }, } = await checkDataKeyName(
            data.filter(d => d.name).map(d => d.name!),
            { uuidNot: data.filter(d => d.name).map(d => d.uuid), },
        );

        const duplicates = { ...drafts, ...published, };

        if (Object.keys(duplicates).length) {
            return { success: false, errors: [`Duplicate keys: ${Object.keys(duplicates).join(', ')}`] };
        }

        let index = 0;
        for (const { uuid: dataKeyUuid, isNewUuid, ...item } of data) {
            try {
                index++;

                if (!errors.length) {
                    const draft = isNewUuid ? null : await db.query.dataKeysDrafts.findFirst({
                        where: eq(dataKeysDrafts.uuid, dataKeyUuid),
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
                        const data = {
                            ...published,
                            ...item,
                            uuid: dataKeyUuid,
                            version: published?.version ? (published.version + 1) : 1,
                        } as typeof dataKeys.$inferInsert;

                        await db.insert(dataKeysDrafts).values({
                            data,
                            uuid: dataKeyUuid,
                            dataKeyId: published?.uuid,
                            name: data.name,
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
