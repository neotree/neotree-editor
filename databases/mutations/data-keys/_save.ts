import {} from 'drizzle-orm';

import socket from '@/lib/socket';
import logger from '@/lib/logger';
import { CreateDataKeysParams, _createDataKeys } from './_create';
import { UpdateDataKeysParams, _updateDataKeys } from './_update';

export type SaveDataKeysParams = {
    data: {
        inserts: CreateDataKeysParams['data'];
        updates: UpdateDataKeysParams['data'];
    };
    throwErrors?: boolean;
    broadcastAction?: boolean;
};

export type SaveDataKeysResponse = {
    errors?: string[];
    data: {
        success: boolean;
    };
};

export async function _saveDataKeys({
    data,
    throwErrors,
    broadcastAction,
}: SaveDataKeysParams): Promise<SaveDataKeysResponse> {
    try {
        let errors: string[] = [];
        let success = true;
                
        if (data.inserts.length) {
            const createRes = await _createDataKeys({
                data: data.inserts,
            });
            errors = [...errors, ...(createRes?.errors || [])];
            success = createRes.data.success;
        }

        if (data.updates.length) {
            const updateRes = await _updateDataKeys({
                data: data.updates,
            });
            errors = [...errors, ...(updateRes?.errors || [])];
            success = updateRes.data.success;
        }

        if (broadcastAction) socket.emit('data_changed', 'save_data_keys');

        return {
            data: { success, },
            errors: errors.length ? errors : undefined,
        };
    } catch(e: any) {
        logger.error('_saveDataKeys ERROR', e.message);

        if (throwErrors) throw e;

        return {
            errors: [e.message],
            data: {
                success: false,
            },
        };
    }
}
