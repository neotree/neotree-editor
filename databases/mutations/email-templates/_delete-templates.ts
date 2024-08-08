import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { emailTemplates } from '@/databases/pg/schema';
import { inArray } from 'drizzle-orm';

export type DeleteEmailTemplatesData = {
    ids: number[];
};

export type DeleteEmailTemplatesResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _deleteEmailTemplates(
    data: DeleteEmailTemplatesData,
) {
    const response: DeleteEmailTemplatesResponse = { success: false, };

    try {
        if (data.ids.length) {
            await db.delete(emailTemplates).where(inArray(emailTemplates.id, data.ids));
        }

        response.success = true;
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_deleteEmailTemplates ERROR', e.message);
    } finally {
        return response;
    }
}
