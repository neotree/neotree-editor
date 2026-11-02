import { isNotNull, and, isNull, inArray, sql, eq } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import type { DbOrTransaction } from "@/databases/pg/db-client";
import { configKeys, dataKeys, diagnoses, problems, drugsLibrary, pendingDeletion, screens, scripts } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import socket from "@/lib/socket";

export async function _clearPendingDeletion(params?: {
    items?: 'screens' | 'scripts' | 'diagnoses' | 'problems' | 'configKeys' | 'drugsLibrary' | 'dataKeys',
    broadcastAction?: boolean;
    userId?: string | null;
    client?: DbOrTransaction;
}): Promise<{ success: boolean; errors?: string[]; }> {
    try {
        const { items, broadcastAction, } = { ...params };
        const executor = params?.client || db;

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
            items === 'problems' ? isNotNull(pendingDeletion.problemId) : undefined,
            !params?.userId ? undefined : eq(pendingDeletion.createdByUserId, params.userId),
        ];

        await executor.delete(pendingDeletion).where(!where.length ? undefined : and(...where));

        if (broadcastAction) socket.emit('data_changed', 'clear_pending_deletion');

        return { success: true, };
    } catch(e: any) {
        logger.error('_clearPendingDeletion ERROR', e.message);
        return { success: false, errors: [e.message], };
    }
}

export async function _processPendingDeletion(params?: {
    items?: 'screens' | 'scripts' | 'diagnoses' | 'problems' | 'configKeys' | 'drugsLibrary' | 'dataKeys',
    broadcastAction?: boolean;
    userId?: string | null;
    publisherUserId?: string | null;
    client?: DbOrTransaction;
}): Promise<{ success: boolean; errors?: string[]; }> {
    try {
        const { items, } = { ...params };
        const executor = params?.client || db;

        // Each kind only looks at its own rows, and only at the publisher's rows unless everything is
        // being published. The script query used to have no filter at all unless items === 'scripts',
        // so "publish my changes" also applied every other user's queued script deletions.
        const wants = (kind: NonNullable<typeof items>) => !items || items === kind;
        const byUser = !params?.userId ? undefined : eq(pendingDeletion.createdByUserId, params.userId);
        const rowsFor = (kind: NonNullable<typeof items>, where: ReturnType<typeof and>) => !wants(kind)
            ? Promise.resolve([] as (typeof pendingDeletion.$inferSelect)[])
            : executor.query.pendingDeletion.findMany({ where: and(where, byUser) });

        const _configKeys = await rowsFor('configKeys', isNotNull(pendingDeletion.configKeyId));

        if (_configKeys.length) {
            await executor.update(configKeys)
                .set({ deletedAt: new Date(), })
                .where(inArray(configKeys.configKeyId, _configKeys.map(c => c.configKeyId!)));
        }

        const _drugsLibraryItems = await rowsFor('drugsLibrary', isNotNull(pendingDeletion.drugsLibraryItemId));

        const _dataKeys = await rowsFor('dataKeys', isNotNull(pendingDeletion.dataKeyId));

        if (_dataKeys.length) {
            await executor.update(dataKeys)
                .set({ 
                    deletedAt: new Date(),
                    name: sql`CONCAT(${dataKeys.name}, '_', ${dataKeys.uuid})`,
                })
                .where(inArray(dataKeys.uuid, _dataKeys.map(c => c.dataKeyId!)));
        }

        if (_drugsLibraryItems.length) {
            await executor.update(drugsLibrary)
                .set({ 
                    deletedAt: new Date(), 
                    key: sql`CONCAT(${drugsLibrary.key}, '_', ${drugsLibrary.itemId})`,
                })
                .where(inArray(drugsLibrary.itemId, _drugsLibraryItems.map(c => c.drugsLibraryItemId!)));
        }

        const _scripts = await rowsFor('scripts', and(
            isNotNull(pendingDeletion.scriptId),
            isNull(pendingDeletion.screenId),
            isNull(pendingDeletion.diagnosisId),
        ));

        if (_scripts.length) {
            await executor.update(scripts)
                .set({ deletedAt: new Date(), })
                .where(inArray(scripts.scriptId, _scripts.map(c => c.scriptId!)));

            await executor.update(screens)
                .set({ deletedAt: new Date(), })
                .where(inArray(screens.scriptId, _scripts.map(c => c.scriptId!)));

            await executor.update(diagnoses)
                .set({ deletedAt: new Date(), })
                .where(inArray(diagnoses.scriptId, _scripts.map(c => c.scriptId!)));

            await executor.update(problems)
                .set({ deletedAt: new Date(), })
                .where(inArray(problems.scriptId, _scripts.map(c => c.scriptId!)));
        }

        const _screens = await rowsFor('screens', isNotNull(pendingDeletion.screenId));

        if (_screens.length) {
            await executor.update(screens)
                .set({ deletedAt: new Date(), })
                .where(inArray(screens.screenId, _screens.map(c => c.screenId!)));
        }

        const _diagnoses = await rowsFor('diagnoses', isNotNull(pendingDeletion.diagnosisId));

        if (_diagnoses.length) {
            await executor.update(diagnoses)
                .set({ deletedAt: new Date(), })
                .where(inArray(diagnoses.diagnosisId, _diagnoses.map(c => c.diagnosisId!)));
        }

        const _problems = await rowsFor('problems', isNotNull(pendingDeletion.problemId));

        if (_problems.length) {
            await executor.update(problems)
                .set({ deletedAt: new Date(), })
                .where(inArray(problems.problemId, _problems.map(c => c.problemId!)));
        }

        await _clearPendingDeletion(params);

        return { success: true, };
    } catch(e: any) {
        logger.error('_processPendingDeletion ERROR', e.message);
        return { success: false, errors: [e.message], };
    }
}
