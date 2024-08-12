import { inArray } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { devices } from '@/databases/pg/schema';
import socket from '@/lib/socket';

export type DeleteDevicesData = {
    ids: number[];
};

export type DeleteDevicesResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _deleteDevices(
    data: DeleteDevicesData,
) {
    const response: DeleteDevicesResponse = { success: false, };

    try {
        if (data.ids.length) {
            await db.delete(devices).where(inArray(devices.id, data.ids));
        }

        response.success = true;
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_deleteDevices ERROR', e.message);
    } finally {
        if (!response?.errors?.length) socket.emit('data_changed', 'delete_devices');
        return response;
    }
}
