import { and, inArray } from "drizzle-orm";
import { getHeaders } from "@/lib/header";

import db from "@/databases/pg/drizzle";
import { sites } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { v4 } from "uuid";

export type SiteType = {
    name: typeof sites.$inferSelect['name'];
    type: typeof sites.$inferSelect['type'];
    siteId: typeof sites.$inferSelect['siteId'];
    link: typeof sites.$inferSelect['link'];
}

export type GetSitesParams = {
    types?: typeof sites.$inferSelect['type'][];
};

export type GetSitesResults = {
    data: SiteType[];
    errors?: string[];
};

export async function _getSites(params?: GetSitesParams): Promise<GetSitesResults> {
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

        const headers = getHeaders();

        const devSites = [];
        if (process.env.NODE_ENV !== 'production') {
            if (types.includes('webeditor')) {
                devSites.push({
                    name: 'Local editor',
                    siteId: v4(),
                    link: headers.origin,
                    type: 'webeditor',
                });
            }

            if (types.includes('nodeapi')) {
                devSites.push({
                    name: 'Local nodeapi',
                    siteId: v4(),
                    link: headers.origin,
                    type: 'nodeapi',
                });
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
