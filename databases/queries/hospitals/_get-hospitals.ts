import { and, eq, inArray, isNull, or } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { hospitals, } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type GetHospitalsParams = {
    hospitalsIds?: string[];
};

export type GetHospitalsResults = {
    data: typeof hospitals.$inferSelect[];
    errors?: string[];
};

export async function _getHospitals(
    params?: GetHospitalsParams
): Promise<GetHospitalsResults> {
    try {
        const { hospitalsIds: _hospitalsIds, } = { ...params };

        let hospitalsIds = _hospitalsIds || [];

        // published hospitals conditions
        const whereHospitalsIds = !hospitalsIds?.length ? 
            undefined 
            : 
            inArray(hospitals.hospitalId, hospitalsIds.filter(id => uuid.validate(id)));
        const whereOldHospitalsIds = !hospitalsIds?.length ? 
            undefined 
            : 
            inArray(hospitals.oldHospitalId, hospitalsIds.filter(id => !uuid.validate(id)));
        const whereHospitals = [
            isNull(hospitals.deletedAt),
            ...((!whereHospitalsIds || !whereOldHospitalsIds) ? [] : [or(whereHospitalsIds, whereOldHospitalsIds)]),
        ];

        const res = await db
            .select({
                hospital: hospitals,
            })
            .from(hospitals)
            .where(!whereHospitals.length ? undefined : and(...whereHospitals));

        const data = res.map(s => s.hospital);

        return  { 
            data,
        };
    } catch(e: any) {
        logger.error('_getHospitals ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}

export type GetHospitalResults = {
    data?: null | typeof hospitals.$inferSelect;
    errors?: string[];
};

export async function _getHospital(
    params: {
        hospitalId: string,
    },
): Promise<GetHospitalResults> {
    const { hospitalId, } = { ...params };

    try {
        if (!hospitalId) throw new Error('Missing hospitalId');

        const whereHospitalId = uuid.validate(hospitalId) ? eq(hospitals.hospitalId, hospitalId) : undefined;
        const whereOldHospitalId = !uuid.validate(hospitalId) ? eq(hospitals.oldHospitalId, hospitalId) : undefined;

        const data = await db.query.hospitals.findFirst({
            where: and(
                isNull(hospitals.deletedAt),
                whereHospitalId || whereOldHospitalId,
            ),
        });

        return  { 
            data, 
        };
    } catch(e: any) {
        logger.error('_getHospital ERROR', e.message);
        return { errors: [e.message], };
    }
} 
