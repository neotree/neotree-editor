import { and, count, eq, isNotNull, isNull } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { hospitals, hospitalsDrafts, pendingDeletion, } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type CountHospitalsResults = {
    data: {
        allPublished: number;
        publishedWithDrafts: number;
        allDrafts: number;
        newDrafts: number;
        pendingDeletion: number;
    };
    errors?: string[];
};

export const _defaultHospitalsCount = {
    allPublished: 0,
    publishedWithDrafts: 0,
    allDrafts: 0,
    newDrafts: 0,
    pendingDeletion: 0,
} satisfies CountHospitalsResults['data'];

export async function _countHospitals(): Promise<CountHospitalsResults> {
    try {
        const [{ count: allDrafts }] = await db.select({ count: count(), }).from(hospitalsDrafts);
        const [{ count: newDrafts }] = await db.select({ count: count(), }).from(hospitalsDrafts).where(isNull(hospitalsDrafts.hospitalId));
        const [{ count: publishedWithDrafts }] = await db.select({ count: count(), }).from(hospitalsDrafts).where(isNotNull(hospitalsDrafts.hospitalId));
        const [{ count: _pendingDeletion }] = await db.select({ count: count(), }).from(pendingDeletion).where(isNotNull(pendingDeletion.hospitalId));
        const [{ count: allPublished }] = await db.select({ count: count(), }).from(hospitals);

        return  { 
            data: {
                allPublished,
                publishedWithDrafts,
                allDrafts,
                newDrafts,
                pendingDeletion: _pendingDeletion,
            },
        };
    } catch(e: any) {
        logger.error('_getHospitals ERROR', e.message);
        return { 
            data: _defaultHospitalsCount, 
            errors: [e.message], 
        };
    }
}
