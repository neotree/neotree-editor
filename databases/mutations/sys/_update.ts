import { eq } from 'drizzle-orm';

import socket  from '@/lib/socket';
import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { sys } from '@/databases/pg/schema';

export type UpdateSysResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _updateSys(
    data: { [key: string]: string; } = {},
    opts?: {
        broadcastAction?: boolean;
    }
) {
    const response: UpdateSysResponse = { success: false, };

    try {
        const keys = Object.keys(data);

        for (const key of keys) {
            try {
                await db.update(sys).set({ value: data[key], }).where(eq(sys.key, key));
            } catch(e: any) {
                response.errors = [...(response?.errors || []), e.message];
            }
        }

        if (!response.errors?.length) {
            response.success = true;
            if (opts?.broadcastAction) socket.emit('update_system');
        }
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_updateSys ERROR', e.message);
    } finally {
        return response;
    }
}
