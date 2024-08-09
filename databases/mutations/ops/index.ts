import { isNotNull, and, isNull } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { pendingDeletion } from "@/databases/pg/schema";
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
