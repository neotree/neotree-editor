import { eq } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { sites } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import getLocalSites from "./local-sites";

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

        let site = res || null;

        if (!res) {
            const localSites = getLocalSites();
            Object.values(localSites).forEach(s=> {
                if (s.siteId === siteId) {
                    site = {
                        link: s.link,
                        apiKey: s.apiKey,
                    };
                }
            })
        }

        return { data: site, };
    } catch(e: any) {
        logger.error('_getSiteApiKey ERROR', e.message);
        return { data: null, errors: [e.message], };
    }
}
