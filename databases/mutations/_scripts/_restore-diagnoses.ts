import { inArray } from 'drizzle-orm';

import db from '@/databases/pg/drizzle';
import logger from '@/lib/logger';
import socket  from '@/lib/socket';
import { diagnoses, diagnosesHistory } from '@/databases/pg/schema';

export async function _restoreDiagnoses(
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
        const histories = !restoreKeys.length ? [] : await db.query.diagnosesHistory.findMany({
            where: inArray(diagnosesHistory.restoreKey, restoreKeys),
            columns: {
                id: true,
                diagnosisId: true,
            },
        });
        const diagnosesIds = histories.map(s => s.diagnosisId);
        if (diagnosesIds.length) {
            await db.update(diagnoses).set({ deletedAt: null }).where(inArray(diagnoses.diagnosisId, diagnosesIds));
            await db.delete(diagnosesHistory).where(inArray(diagnosesHistory.id, histories.map(s => s.id)));
        }

        if (!response.errors?.length) {
            response.success = true;
            if (diagnosesIds.length && opts?.broadcastAction) if (opts?.broadcastAction) socket.emit('data_changed', 'update_diagnoses');
        }
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_restoreDiagnoses ERROR', e.message);
    } finally {
        return response;
    }
}
