import { eq, inArray } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { hospitals, hospitalsDrafts, pendingDeletion, } from '@/databases/pg/schema';
import socket from '@/lib/socket';

export type DeleteHospitalsData = {
    hospitalsIds: string[];
    broadcastAction?: boolean;
    userId?: string | null;
};

export type DeleteHospitalsResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _deleteAllHospitalsDrafts(opts?: {
    userId?: string | null;
}): Promise<boolean> {
    try {
        await db.delete(hospitalsDrafts).where(!opts?.userId ? undefined : eq(hospitalsDrafts.createdByUserId, opts.userId));
        return true;
    } catch(e: any) {
        throw e;
    }
}

export async function _deleteHospitals(
    { hospitalsIds: hospitalsIdsParam, broadcastAction = true, userId, }: DeleteHospitalsData,
) {
    const response: DeleteHospitalsResponse = { success: false, };

    try {
        const hospitalsIds = hospitalsIdsParam;

        if (hospitalsIds.length) {
            // delete drafts
            await db.delete(hospitalsDrafts).where(inArray(hospitalsDrafts.hospitalDraftId, hospitalsIds));

            // insert hospitals into pendingDeletion, we'll delete them when data is published
            const hospitalsArr = await db
                .select({
                    hospitalId: hospitals.hospitalId,
                    pendingDeletion: pendingDeletion.hospitalId,
                })
                .from(hospitals)
                .leftJoin(pendingDeletion, eq(pendingDeletion.hospitalId, hospitals.hospitalId))
                .where(inArray(hospitals.hospitalId, hospitalsIds));

            const pendingDeletionInsertData = hospitalsArr.filter(s => !s.pendingDeletion).map(s => ({
                ...s,
                createdByUserId: userId,
            }));
            
            if (pendingDeletionInsertData.length) await db.insert(pendingDeletion).values(pendingDeletionInsertData);
        }

        response.success = true;
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_deleteHospitals ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction) socket.emit('data_changed', 'delete_hospitals');
        return response;
    }
}
