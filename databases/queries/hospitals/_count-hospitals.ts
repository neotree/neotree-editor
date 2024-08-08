import { count } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { hospitals, } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type CountHospitalsResults = {
    data: number;
    errors?: string[];
};

export async function _countHospitals(): Promise<CountHospitalsResults> {
    try {
        const [{ count: found }] = await db.select({ count: count(), }).from(hospitals);

        return  { 
            data: found,
        };
    } catch(e: any) {
        logger.error('_getHospitals ERROR', e.message);
        return { 
            data: 0, 
            errors: [e.message], 
        };
    }
}
