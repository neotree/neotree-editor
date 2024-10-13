import { eq } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { sites } from '@/databases/pg/schema';
import socket from '@/lib/socket';

export type SaveSitesData = typeof sites.$inferInsert;

export type SaveSitesResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _saveSites(
    data: SaveSitesData[],
) {
    const response: SaveSitesResponse = { success: false, };

    try {
        const updateData = data.filter(t => t.id);
        const insertData = data.filter(t => !t.id);

        const errors = [];

        for (const item of updateData) {
            try {
                await db.update(sites).set(item).where(eq(sites.id, item.id!));
            } catch(e: any) {
                errors.push(e.message);
            }
        }

        if (insertData.length) await db.insert(sites).values(insertData);

        if (errors.length) {
            response.errors = errors;
        } else {
            response.success = true;
        }
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_saveSites ERROR', e.message);
    } finally {
        if (!response?.errors?.length) socket.emit('data_changed', 'save_sites');
        return response;
    }
}
