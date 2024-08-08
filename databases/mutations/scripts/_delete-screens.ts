import { and, inArray, isNotNull, or } from "drizzle-orm";
import { io } from 'socket.io-client';

import db from "../../pg/drizzle";
import { screens, screensDrafts, screensHistory } from "../../pg/schema";
import { _getScreen, _getScreens, _listRawScreens, _listScreens } from '../../queries/screens';
import logger from "@/lib/logger";
import { _listScripts } from "../../queries/scripts";

const socket = io(process.env.NEXT_PUBLIC_APP_URL);

export async function _deleteScreens(
    params?: {
        screenIds?: string[];
        scriptsIds?: string[];
        restoreKey?: string;
        force?: boolean;
    }, 
    opts?: {
        broadcastAction?: boolean;
    }
) {
    const response: { success: boolean; errors?: string[]; } = { success: false, };

    try {
        const { screenIds, scriptsIds, restoreKey, force } = { ...params };

        const where = [
            ...((!screenIds && !scriptsIds) ? [] : [or(
                !screenIds?.filter(s => s)?.length ? undefined : inArray(screens.screenId, screenIds),
                !scriptsIds?.filter(s => s)?.length ? undefined : inArray(screens.scriptId, scriptsIds),
            )]),
        ];

        if (!where.length && !force) throw new Error('You&apos;re trying to delete all the screens, please provide a force parameter.');

        const items = await db.query.screens.findMany({
            where: and(...where),
        });

        const deletedAt = new Date();

        await db
            .update(screens)
            .set({ deletedAt, })
            .where(and(...where));

        if (items.length) {
            await db.delete(screensDrafts).where(and(
                isNotNull(screensDrafts.screenId),
                inArray(screensDrafts.screenId, items.map(s => s.screenId)),
            ));
        }

        await db.insert(screensHistory).values(items.map(item => ({
            version: item.version,
            screenId: item.screenId,
            scriptId: item.scriptId,
            restoreKey,
            changes: {
                action: 'delete_screen',
                descreenion: 'Delete screen',
                oldValues: [{ deletedAt: null, }],
                newValues: [{ deletedAt }],
            },
        })));

        if (!response.errors?.length) {
            response.success = true;
            if (opts?.broadcastAction) socket.emit('data_changed', 'delete_screens');
        }
    } catch(e: any) {
        logger.error('_deleteScreens ERROR', e.message);
        response.success = false;
        response.errors = [e.message];
    } finally {
        return response;
    }
}
