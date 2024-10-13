import { and, inArray } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { sites } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import getLocalSites from "./local-sites";

export type SiteWithoutConfidentialData = {
    name: typeof sites.$inferSelect['name'];
    type: typeof sites.$inferSelect['type'];
    siteId: typeof sites.$inferSelect['siteId'];
    link: typeof sites.$inferSelect['link'];
}

export type GetSitesWithoutConfidentialDataParams = {
    types?: typeof sites.$inferSelect['type'][];
};

export type GetSitesWithoutConfidentialDataResults = {
    data: SiteWithoutConfidentialData[];
    errors?: string[];
};

export async function _getSitesWithoutConfidentialData(params?: GetSitesWithoutConfidentialDataParams): Promise<GetSitesWithoutConfidentialDataResults> {
    try {
        const { types = [], } = { ...params };

        const where = [
            ...(!types.length ? [] : [inArray(sites.type, types)]),
        ];

        const res = await db.query.sites.findMany({
            where: !where.length ? undefined : and(...where),
            columns: {
                siteId: true,
                type: true,
                name: true,
                link: true,
            },
        });

        const localSites = getLocalSites();
        const devSites = [];
        if (process.env.NODE_ENV !== 'production') {
            if (types.includes('webeditor')) {
                devSites.push(localSites.webeditor);
            }

            if (types.includes('nodeapi')) {
                devSites.push(localSites.nodeapi);
            }
        }

        const data = [
            ...devSites,
            ...res,
        ] as typeof res;

        return  { 
            data,
        };
    } catch(e: any) {
        logger.error('_getSites ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}
