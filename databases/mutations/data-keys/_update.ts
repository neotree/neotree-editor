import { eq } from 'drizzle-orm';

import socket from '@/lib/socket';
import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { dataKeys } from '@/databases/pg/schema';

export type UpdateDataKeysParams = {
    data: (Partial<Omit<typeof dataKeys.$inferSelect, 'uuid'>> & {
        uuid: string;
    })[];
    throwErrors?: boolean;
    broadcastAction?: boolean;
};

export type UpdateDataKeysResponse = {
    errors?: string[];
    data: {
        success: boolean;
    };
};

export async function _updateDataKeys({
    data,
    throwErrors,
    broadcastAction,
}: UpdateDataKeysParams): Promise<UpdateDataKeysResponse> {
    try {
        for (const { updatedAt, createdAt, deletedAt, id, uuid, ...item } of data) {
            await db.update(dataKeys).set(item).where(eq(dataKeys.uuid, uuid));
        }

        if (broadcastAction) socket.emit('data_changed', 'update_data_keys');

        return {
            data: {
                success: true,
            },
        };
    } catch(e: any) {
        logger.error('_updateDataKeys ERROR', e.message);

        if (throwErrors) throw e;

        return {
            errors: [e.message],
            data: {
                success: false,
            },
        };
    }
}
