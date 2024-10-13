import { inArray } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { sites } from '@/databases/pg/schema';
import socket from '@/lib/socket';

export type DeleteSitesData = {
    ids: number[];
};

export type DeleteSitesResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _deleteSites(
    data: DeleteSitesData,
) {
    const response: DeleteSitesResponse = { success: false, };

    try {
        if (data.ids.length) {
            await db.delete(sites).where(inArray(sites.id, data.ids));
        }

        response.success = true;
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_deleteSites ERROR', e.message);
    } finally {
        if (!response?.errors?.length) socket.emit('data_changed', 'delete_sites');
        return response;
    }
}
