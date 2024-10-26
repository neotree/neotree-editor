import { and, inArray } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { hospitals } from '@/databases/pg/schema';
import socket from '@/lib/socket';

export type DeleteHospitalsData = {
    ids?: number[];
    hospitalsIds?: string[];
    confirmDeleteAll?: boolean;
};

export type DeleteHospitalsResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _deleteHospitals(
    params?: DeleteHospitalsData,
) {
    const response: DeleteHospitalsResponse = { success: false, };

    const { ids, hospitalsIds, confirmDeleteAll, } = { ...params, };

    try {
        const where = [
            !ids?.length ? undefined : inArray(hospitals.id, ids),
            !hospitalsIds?.length ? undefined : inArray(hospitals.hospitalId, hospitalsIds),
        ].filter(q => q);

        if (!where.length && !confirmDeleteAll) throw new Error('Please confirm that you want to delete all the hospitals!'); 

        await db.delete(hospitals).where(and(...where));

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
