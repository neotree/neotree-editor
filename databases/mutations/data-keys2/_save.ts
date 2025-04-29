import { desc, eq } from 'drizzle-orm';
import * as uuid from 'uuid';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { dataKeys, dataKeysDrafts } from '@/databases/pg/schema';
import socket from '@/lib/socket';

export type SaveDataKeysData = Partial<typeof dataKeys.$inferSelect>;

export type SaveDataKeysResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _saveDataKeys({ data, broadcastAction, }: {
    data: SaveDataKeysData[],
    broadcastAction?: boolean,
}) {
    const response: SaveDataKeysResponse = { success: false, };

    try {
        const errors = [];

        let index = 0;
        for (const { uuid: itemDataKeyUuid, ...item } of data) {
            try {
                index++;

                const dataKeyUuid = itemDataKeyUuid || uuid.v4();

                if (!errors.length) {
                    const draft = !itemDataKeyUuid ? null : await db.query.dataKeysDrafts.findFirst({
                        where: eq(dataKeysDrafts.uuid, dataKeyUuid),
                    });

                    const published = (draft || !itemDataKeyUuid) ? null : await db.query.dataKeys.findFirst({
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
            response.success = true;
        }
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_saveDataKeys ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction) socket.emit('data_changed', 'save_data_keys');
        return response;
    }
}
