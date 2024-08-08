import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { emailTemplates } from '@/databases/pg/schema';
import { eq } from 'drizzle-orm';

export type SaveEmailTemplatesData = typeof emailTemplates.$inferInsert;

export type SaveEmailTemplatesResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _saveEmailTemplates(
    data: SaveEmailTemplatesData[],
) {
    const response: SaveEmailTemplatesResponse = { success: false, };

    try {
        const updateData = data.filter(t => t.id);
        const insertData = data.filter(t => !t.id);

        const errors = [];

        for (const item of updateData) {
            try {
                await db.update(emailTemplates).set(item).where(eq(emailTemplates.id, item.id!));
            } catch(e: any) {
                errors.push(e.message);
            }
        }

        if (insertData.length) await db.insert(emailTemplates).values(insertData);

        if (errors.length) {
            response.errors = errors;
        } else {
            response.success = true;
        }
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_saveEmailTemplates ERROR', e.message);
    } finally {
        return response;
    }
}
