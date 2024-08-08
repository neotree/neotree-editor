import { eq } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { hospitals } from '@/databases/pg/schema';
import socket from '@/lib/socket';

export type SaveHospitalsData = typeof hospitals.$inferInsert;

export type SaveHospitalsResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _saveHospitals(
    data: SaveHospitalsData[],
) {
    const response: SaveHospitalsResponse = { success: false, };

    try {
        const updateData = data.filter(t => t.id);
        const insertData = data.filter(t => !t.id);

        const errors = [];

        for (const item of updateData) {
            try {
                await db.update(hospitals).set(item).where(eq(hospitals.id, item.id!));
            } catch(e: any) {
                errors.push(e.message);
            }
        }

        if (insertData.length) await db.insert(hospitals).values(insertData);

        if (errors.length) {
            response.errors = errors;
        } else {
            response.success = true;
        }
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_saveHospitals ERROR', e.message);
    } finally {
        if (!response?.errors?.length) socket.emit('data_changed', 'save_hospitals');
        return response;
    }
}
