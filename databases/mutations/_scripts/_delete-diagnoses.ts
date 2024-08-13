import { and, inArray, isNotNull, or } from "drizzle-orm";

import logger from "@/lib/logger";
import socket  from '@/lib/socket';
import db from "../../pg/drizzle";
import { diagnoses, diagnosesDrafts, diagnosesHistory } from "../../pg/schema";
import { _getDiagnosis, _getDiagnoses, _listRawDiagnoses, _listDiagnoses } from '../../queries/diagnoses';
import { _listScripts } from "../../queries/_scripts";

export async function _deleteDiagnoses(
    params?: {
        diagnosisIds?: string[];
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
        const { diagnosisIds, scriptsIds, restoreKey, force } = { ...params };

        const where = [
            ...((!diagnosisIds && !scriptsIds) ? [] : [or(
                !diagnosisIds?.filter(s => s)?.length ? undefined : inArray(diagnoses.diagnosisId, diagnosisIds),
                !scriptsIds?.filter(s => s)?.length ? undefined : inArray(diagnoses.scriptId, scriptsIds),
            )]),
        ];

        if (!where.length && !force) throw new Error('You&apos;re trying to delete all the diagnoses, please provide a force parameter.');

        const items = await db.query.diagnoses.findMany({
            where: and(...where),
        });

        const deletedAt = new Date();

        await db
            .update(diagnoses)
            .set({ deletedAt, })
            .where(and(...where));

        if (items.length) {
            await db.delete(diagnosesDrafts).where(and(
                isNotNull(diagnosesDrafts.diagnosisId),
                inArray(diagnosesDrafts.diagnosisId, items.map(s => s.diagnosisId)),
            ));
        }

        await db.insert(diagnosesHistory).values(items.map(item => ({
            version: item.version,
            diagnosisId: item.diagnosisId,
            scriptId: item.scriptId,
            restoreKey,
            changes: {
                action: 'delete_diagnosis',
                dediagnosision: 'Delete diagnosis',
                oldValues: [{ deletedAt: null, }],
                newValues: [{ deletedAt }],
            },
        })));

        if (!response.errors?.length) {
            response.success = true;
            if (opts?.broadcastAction) socket.emit('data_changed', 'delete_diagnoses');
        }
    } catch(e: any) {
        logger.error('_deleteDiagnoses ERROR', e.message);
        response.success = false;
        response.errors = [e.message];
    } finally {
        return response;
    }
}
