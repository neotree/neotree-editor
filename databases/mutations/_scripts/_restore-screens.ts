import { io } from 'socket.io-client';
import { inArray } from 'drizzle-orm';

import db from '@/databases/pg/drizzle';
import logger from '@/lib/logger';
import { screens, screensHistory } from '@/databases/pg/schema';

const socket = io(process.env.NEXT_PUBLIC_APP_URL);

export async function _restoreScreens(
    { restoreKeys }: {
        restoreKeys: string[];
    },
    opts?: {
        broadcastAction?: boolean;
    }
) {
    const response: { 
        success: boolean; 
        errors?: string[]; 
    } = { success: false, };

    try {
        const histories = !restoreKeys.length ? [] : await db.query.screensHistory.findMany({
            where: inArray(screensHistory.restoreKey, restoreKeys),
            columns: {
                id: true,
                screenId: true,
            },
        });
        const screensIds = histories.map(s => s.screenId);
        if (screensIds.length) {
            await db.update(screens).set({ deletedAt: null }).where(inArray(screens.screenId, screensIds));
            await db.delete(screensHistory).where(inArray(screensHistory.id, histories.map(s => s.id)));
        }

        if (!response.errors?.length) {
            response.success = true;
            if (screensIds.length && opts?.broadcastAction) if (opts?.broadcastAction) socket.emit('data_changed', 'update_screens');
        }
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_restoreScreens ERROR', e.message);
    } finally {
        return response;
    }
}
