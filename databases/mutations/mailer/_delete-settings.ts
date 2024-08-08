import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { mailerSettings } from '@/databases/pg/schema';
import { inArray } from 'drizzle-orm';

export type DeleteMailerSettingsData = {
    ids: number[];
};

export type DeleteMailerSettingsResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _deleteMailerSettings(
    data: DeleteMailerSettingsData,
) {
    const response: DeleteMailerSettingsResponse = { success: false, };

    try {
        if (data.ids.length) {
            await db.delete(mailerSettings).where(inArray(mailerSettings.id, data.ids));
        }

        response.success = true;
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_deleteMailerSettings ERROR', e.message);
    } finally {
        return response;
    }
}
