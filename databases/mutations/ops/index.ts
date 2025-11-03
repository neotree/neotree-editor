import { isNotNull, and, isNull, inArray, sql, eq } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { configKeys, dataKeys, diagnoses, drugsLibrary, pendingDeletion, screens, scripts } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import socket from "@/lib/socket";

export async function _clearPendingDeletion(params?: {
    items?: 'screens' | 'scripts' | 'diagnoses' | 'configKeys' | 'drugsLibrary' | 'dataKeys',
    broadcastAction?: boolean;
    userId?: string | null;
}): Promise<{ success: boolean; errors?: string[]; }> {
    try {
        const { items, broadcastAction, } = { ...params };

        const where = [
            items === 'configKeys' ? isNotNull(pendingDeletion.configKeyId) : undefined,
            items === 'drugsLibrary' ? isNotNull(pendingDeletion.drugsLibraryItemId) : undefined,
            items === 'dataKeys' ? isNotNull(pendingDeletion.dataKeyId) : undefined,
            items === 'scripts' ? and(
                isNotNull(pendingDeletion.scriptId),
                isNull(pendingDeletion.screenId),
                isNull(pendingDeletion.diagnosisId),
            ) : undefined,
            items === 'screens' ? isNotNull(pendingDeletion.screenId) : undefined,
            items === 'diagnoses' ? isNotNull(pendingDeletion.diagnosisId) : undefined,
            !params?.userId ? undefined : eq(pendingDeletion.createdByUserId, params.userId),
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
    items?: 'screens' | 'scripts' | 'diagnoses' | 'configKeys' | 'drugsLibrary' | 'dataKeys',
    broadcastAction?: boolean;
    userId?: string | null;
    publisherUserId?: string | null;
}): Promise<{ success: boolean; errors?: string[]; }> {
    try {
        const { items, } = { ...params };

        const _configKeys = await db.query.pendingDeletion.findMany({
            where: and(
                items === 'configKeys' ? isNotNull(pendingDeletion.configKeyId) : undefined,
                !params?.userId ? undefined : eq(pendingDeletion.createdByUserId, params.userId),
            ),
        });

        if (_configKeys.length) {
            await db.update(configKeys)
                .set({ deletedAt: new Date(), })
                .where(inArray(configKeys.configKeyId, _configKeys.map(c => c.configKeyId!)));
        }

        const _drugsLibraryItems = await db.query.pendingDeletion.findMany({
            where: and(
                items === 'drugsLibrary' ? isNotNull(pendingDeletion.drugsLibraryItemId) : undefined,
                !params?.userId ? undefined : eq(pendingDeletion.createdByUserId, params.userId),
            ),
        });

        const _dataKeys = await db.query.pendingDeletion.findMany({
            where: and(
                items === 'dataKeys' ? isNotNull(pendingDeletion.dataKeyId) : undefined,
                !params?.userId ? undefined : eq(pendingDeletion.createdByUserId, params.userId),
            ),
        });

        if (_dataKeys.length) {
            await db.update(dataKeys)
                .set({ 
                    deletedAt: new Date(),
                    name: sql`CONCAT(${dataKeys.name}, '_', ${dataKeys.uuid})`,
                })
                .where(inArray(dataKeys.uuid, _dataKeys.map(c => c.dataKeyId!)));
        }

        if (_drugsLibraryItems.length) {
            await db.update(drugsLibrary)
                .set({ 
                    deletedAt: new Date(), 
                    key: sql`CONCAT(${drugsLibrary.key}, '_', ${drugsLibrary.itemId})`,
                })
                .where(inArray(drugsLibrary.itemId, _drugsLibraryItems.map(c => c.drugsLibraryItemId!)));
        }

        const _scripts = await db.query.pendingDeletion.findMany({
            where: items === 'scripts' ? and(
                isNotNull(pendingDeletion.scriptId),
                isNull(pendingDeletion.screenId),
                isNull(pendingDeletion.diagnosisId),
                !params?.userId ? undefined : eq(pendingDeletion.createdByUserId, params.userId),
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
            where: and(
                items === 'screens' ? isNotNull(pendingDeletion.screenId) : undefined,
                !params?.userId ? undefined : eq(pendingDeletion.createdByUserId, params.userId),
            ),
        });

        if (_screens.length) {
            await db.update(screens)
                .set({ deletedAt: new Date(), })
                .where(inArray(screens.screenId, _screens.map(c => c.screenId!)));
        }

        const _diagnoses = await db.query.pendingDeletion.findMany({
            where: and(
                items === 'diagnoses' ? isNotNull(pendingDeletion.diagnosisId) : undefined,
                !params?.userId ? undefined : eq(pendingDeletion.createdByUserId, params.userId),
            ),
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
