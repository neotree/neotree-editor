import { isNotNull, and, isNull, inArray } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { configKeys, diagnoses, pendingDeletion, screens, scripts } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import socket from "@/lib/socket";

export async function _clearPendingDeletion(params?: {
    items?: 'screens' | 'scripts' | 'diagnoses' | 'configKeys',
    broadcastAction?: boolean;
}): Promise<{ success: boolean; errors?: string[]; }> {
    try {
        const { items, broadcastAction, } = { ...params };

        const where = [
            items === 'configKeys' ? isNotNull(pendingDeletion.configKeyId) : undefined,
            items === 'scripts' ? and(
                isNotNull(pendingDeletion.scriptId),
                isNull(pendingDeletion.screenId),
                isNull(pendingDeletion.diagnosisId),
            ) : undefined,
            items === 'screens' ? isNotNull(pendingDeletion.screenId) : undefined,
            items === 'diagnoses' ? isNotNull(pendingDeletion.diagnosisId) : undefined,
        ];

        await db.delete(pendingDeletion).where(!where.length ? undefined : and(...where));

        if (broadcastAction) socket.emit('data_changed', 'clear_pending_deletion');

        return { success: true, };
    } catch(e: any) {
        logger.error('_clearPendingDeletion ERROR', e.message);
        return { success: false, errors: [e.message], };
    }
}

export async function _processPendingDeletion(params?: {
    items?: 'screens' | 'scripts' | 'diagnoses' | 'configKeys',
    broadcastAction?: boolean;
}): Promise<{ success: boolean; errors?: string[]; }> {
    try {
        const { items, } = { ...params };

        const _configKeys = await db.query.pendingDeletion.findMany({
            where: items === 'configKeys' ? isNotNull(pendingDeletion.configKeyId) : undefined,
        });

        if (_configKeys.length) {
            await db.update(configKeys)
                .set({ deletedAt: new Date(), })
                .where(inArray(configKeys.configKeyId, _configKeys.map(c => c.configKeyId!)));
        }

        const _scripts = await db.query.pendingDeletion.findMany({
            where: items === 'scripts' ? and(
                isNotNull(pendingDeletion.scriptId),
                isNull(pendingDeletion.screenId),
                isNull(pendingDeletion.diagnosisId),
            ) : undefined,
        });

        if (_scripts.length) {
            await db.update(scripts)
                .set({ deletedAt: new Date(), })
                .where(inArray(scripts.scriptId, _scripts.map(c => c.scriptId!)));

            await db.update(screens)
                .set({ deletedAt: new Date(), })
                .where(inArray(screens.scriptId, _scripts.map(c => c.scriptId!)));

            await db.update(diagnoses)
                .set({ deletedAt: new Date(), })
                .where(inArray(diagnoses.scriptId, _scripts.map(c => c.scriptId!)));
        }

        const _screens = await db.query.pendingDeletion.findMany({
            where: items === 'screens' ? isNotNull(pendingDeletion.screenId) : undefined,
        });

        if (_screens.length) {
            await db.update(screens)
                .set({ deletedAt: new Date(), })
                .where(inArray(screens.screenId, _screens.map(c => c.screenId!)));
        }

        const _diagnoses = await db.query.pendingDeletion.findMany({
            where: items === 'diagnoses' ? isNotNull(pendingDeletion.diagnosisId) : undefined,
        });

        if (_diagnoses.length) {
            await db.update(diagnoses)
                .set({ deletedAt: new Date(), })
                .where(inArray(diagnoses.diagnosisId, _diagnoses.map(c => c.diagnosisId!)));
        }

        await _clearPendingDeletion(params);

        return { success: true, };
    } catch(e: any) {
        logger.error('_processPendingDeletion ERROR', e.message);
        return { success: false, errors: [e.message], };
    }
}
