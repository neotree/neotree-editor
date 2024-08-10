import { eq } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { sites } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export async function _getSiteApiKey(siteId: string): Promise<{ 
    data: null | { 
        apiKey: string; 
        link: string; 
    }, 
    errors?: string[]; 
}> {
    try {
        const res = await db.query.sites.findFirst({
            where: eq(sites.siteId, siteId),
            columns: {
                apiKey: true,
                link: true,
            },
        });

        return { data: res || null, };
    } catch(e: any) {
        logger.error('_getSiteApiKey ERROR', e.message);
        return { data: null, errors: [e.message], };
    }
}
