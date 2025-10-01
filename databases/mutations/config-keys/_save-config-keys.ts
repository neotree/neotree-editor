import { desc, eq } from 'drizzle-orm';
import * as uuid from 'uuid';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { configKeys, configKeysDrafts } from '@/databases/pg/schema';
import socket from '@/lib/socket';

export type SaveConfigKeysData = Partial<typeof configKeys.$inferSelect>;

export type SaveConfigKeysResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _saveConfigKeys({ data, broadcastAction, userId, }: {
    data: SaveConfigKeysData[],
    broadcastAction?: boolean,
    userId?: string;
}) {
    const response: SaveConfigKeysResponse = { success: false, };

    try {
        const errors = [];

        let index = 0;
        for (const { configKeyId: itemConfigKeyId, ...item } of data) {
            try {
                index++;

                const configKeyId = itemConfigKeyId || uuid.v4();

                if (!errors.length) {
                    const draft = !itemConfigKeyId ? null : await db.query.configKeysDrafts.findFirst({
                        where: eq(configKeysDrafts.configKeyDraftId, configKeyId),
                    });

                    const published = (draft || !itemConfigKeyId) ? null : await db.query.configKeys.findFirst({
                        where: eq(configKeys.configKeyId, configKeyId),
                    });

                    if (draft) {
                        const data = {
                            ...draft.data,
                            ...item,
                        };
                        
                        await db
                            .update(configKeysDrafts)
                            .set({
                                data,
                                position: data.position,
                            }).where(eq(configKeysDrafts.configKeyDraftId, configKeyId));
                    } else {
                        let position = item.position || published?.position;
                        if (!position) {
                            const confKey = await db.query.configKeys.findFirst({
                                columns: { position: true, },
                                orderBy: desc(configKeys.position),
                            });

                            const confKeyDraft = await db.query.configKeysDrafts.findFirst({
                                columns: { position: true, },
                                orderBy: desc(configKeysDrafts.position),
                            });

                            position = Math.max(0, confKey?.position || 0, confKeyDraft?.position || 0) + 1;
                        }

                        const data = {
                            ...published,
                            ...item,
                            configKeyId,
                            version: published?.version ? (published.version + 1) : 1,
                            position,
                        } as typeof configKeys.$inferInsert;

                        await db.insert(configKeysDrafts).values({
                            data,
                            configKeyDraftId: configKeyId,
                            position: data.position,
                            configKeyId: published?.configKeyId,
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
            response.success = true;
        }
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_saveConfigKeys ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction) socket.emit('data_changed', 'save_config_keys');
        return response;
    }
}
