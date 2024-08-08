import { and, inArray } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { sites } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type GetSitesParams = {
    types?: typeof sites.$inferSelect['type'][];
};

export type GetSitesResults = {
    data: {
        name: typeof sites.$inferSelect['name'];
        type: typeof sites.$inferSelect['type'];
        siteId: typeof sites.$inferSelect['siteId'];
        link: typeof sites.$inferSelect['link'];
    }[];
    errors?: string[];
};

export async function _getSites(params?: GetSitesParams): Promise<GetSitesResults> {
    try {
        const where = [
            ...(!params?.types?.length ? [] : [inArray(sites.type, params.types)]),
        ];

        const data = await db.query.sites.findMany({
            where: !where.length ? undefined : and(...where),
            columns: {
                siteId: true,
                type: true,
                name: true,
                link: true,
            },
        });

        return  { data };
    } catch(e: any) {
        logger.error('_getSites ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}
