import {} from 'drizzle-orm';

import socket from '@/lib/socket';
import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { dataKeys } from '@/databases/pg/schema';

export type CreateDataKeysParams = {
    data: typeof dataKeys.$inferInsert[];
    throwErrors?: boolean;
    broadcastAction?: boolean;
};

export type CreateDataKeysResponse = {
    errors?: string[];
    data: {
        success: boolean;
    };
};

export async function _createDataKeys({
    data,
    throwErrors,
    broadcastAction,
}: CreateDataKeysParams): Promise<CreateDataKeysResponse> {
    try {
        await db.insert(dataKeys).values(data);

        if (broadcastAction) socket.emit('data_changed', 'create_data_keys');

        return {
            data: {
                success: true,
            },
        };
    } catch(e: any) {
        logger.error('_createDataKeys ERROR', e.message);

        if (throwErrors) throw e;

        return {
            errors: [e.message],
            data: {
                success: false,
            },
        };
    }
}
