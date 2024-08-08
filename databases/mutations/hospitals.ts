import { eq, inArray } from "drizzle-orm";
import { v4 } from "uuid";

import db from "../pg/drizzle";
import { hospitals } from "../pg/schema";
import { _getHospital, _getHospitals } from '../queries/hospitals';

export async function _deleteHospitals(hospitalIds: string[]) {
    if (hospitalIds.length) {
        const where = inArray(hospitals.hospitalId, hospitalIds);

        const deletedAt = new Date();

        await db
            .update(hospitals)
            .set({ deletedAt, })
            .where(where);
    }
    return true;
}

export async function _createHospitals(
    data: (typeof hospitals.$inferInsert & {
        hospitalId: string;
    })[], 
    opts?: {
        returnInserted?: boolean;
        broadcastAction?: boolean;
    }
) {
    const insertData: typeof hospitals.$inferInsert[] = [];
    
    for(const h of data) {
        insertData.push({
            ...h,
            hospitalId: h.hospitalId || v4(),
        });
    }

    let results: {
        success: boolean;
        error?: string;
        inserted: Awaited<ReturnType<typeof _getHospitals>>['data'];
    } = { inserted: [], success: false, };

    try {
        await db.insert(hospitals).values(insertData);
        if (opts?.returnInserted) {
            const inserted = await _getHospitals({ hospitalIds: insertData.map(u => u.hospitalId!), });
            results.inserted = inserted.data;
        }
        results.success = true;
    } catch(e: any) {
        results.error = e.message;
    } finally {
        return results;
    }
}

export async function _updateHospitals(
    data: ({
        hospitalId: string;
        data: Partial<typeof hospitals.$inferSelect>;
    })[], 
    opts?: {
        returnUpdated?: boolean;
        broadcastAction?: boolean;
    }
) {
    const results: ({ 
        hospitalId: string;
        hospital?: Awaited<ReturnType<typeof _getHospital>>;
        error?: string; 
    })[] = [];

    for(const { hospitalId, data: h,  } of data) {
        try {
            delete h.id;
            delete h.createdAt;
            delete h.updatedAt;
            delete h.oldHospitalId;
            delete h.hospitalId;

            await db.update(hospitals).set(h).where(eq(hospitals.hospitalId, hospitalId));
            const hospital = !opts?.returnUpdated ? undefined : await _getHospital(hospitalId);
            results.push({ hospitalId, hospital, });
        } catch(e: any) {
            results.push({ hospitalId, error: e.message, });
        }
    }

    return results;
}
