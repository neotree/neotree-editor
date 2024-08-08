import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { mailerSettings } from '@/databases/pg/schema';
import { eq } from 'drizzle-orm';

export type SaveMailerSettingsData = typeof mailerSettings.$inferInsert;

export type SaveMailerSettingsResponse = { 
    data?: typeof mailerSettings.$inferSelect;
    success: boolean; 
    errors?: string[]; 
};

export async function _saveMailerSettings(
    data: SaveMailerSettingsData,
) {
    const response: SaveMailerSettingsResponse = { success: false, };

    try {
        const validationErrors: string[] = [];

        if (!data.name) validationErrors.push('Missing: NAME');
        if (!data.authUsername) validationErrors.push('Missing: USERNAME');
        if (!data.authPassword) validationErrors.push('Missing: PASSWORD');
        if (data.service === 'smtp') {
            if (!data.host) validationErrors.push('SMTP requires: HOST');
            if (!data.port) validationErrors.push('SMTP requires: PORT');
        }

        if (validationErrors.length) {
            response.errors = validationErrors;
            logger.error('_saveMailerSettings VALIDATION ERRORS', validationErrors.join(', '));
            return response;
        }

        let existing: undefined | { isActive: boolean; id: number; };
        if (data.id) {
            existing = await db.query.mailerSettings.findFirst({
                where: eq(mailerSettings.id, data.id),
                columns: { isActive: true, id: true, }
            });
        }

        let deActiveCurrentActiveWithID: undefined | number = undefined;
        if (data.isActive) {
            const active = existing?.isActive ? existing : await db.query.mailerSettings.findFirst({
                where: eq(mailerSettings.isActive, true),
                columns: { id: true, },
            });
            if (active && (active?.id !== existing?.id)) deActiveCurrentActiveWithID = active.id; 
        }

        let saved: typeof mailerSettings.$inferSelect = null!;
        if (existing) {
            const res = await db.update(mailerSettings).set(data).where(eq(mailerSettings.id, existing.id)).returning();
            saved = res[0];
        } else {
            const res = await db.insert(mailerSettings).values(data).returning();
            saved = res[0];
        }

        if (deActiveCurrentActiveWithID) {
            await db.update(mailerSettings).set({ isActive: false, }).where(eq(mailerSettings.id, deActiveCurrentActiveWithID));
        }

        if (!saved) throw new Error(`Failed to ${existing ? 'update' : 'add'} mailer settings`);

        response.success = true;
        response.data = saved;
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_saveMailerSettings ERROR', e.message);
    } finally {
        return response;
    }
}
