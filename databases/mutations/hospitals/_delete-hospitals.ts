import { inArray } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { hospitals } from '@/databases/pg/schema';
import socket from '@/lib/socket';

export type DeleteHospitalsData = {
    ids: number[];
};

export type DeleteHospitalsResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _deleteHospitals(
    data: DeleteHospitalsData,
) {
    const response: DeleteHospitalsResponse = { success: false, };

    try {
        if (data.ids.length) {
            await db.delete(hospitals).where(inArray(hospitals.id, data.ids));
        }

        response.success = true;
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_deleteHospitals ERROR', e.message);
    } finally {
        if (!response?.errors?.length) socket.emit('data_changed', 'delete_hospitals');
        return response;
    }
}
