import { and, asc, eq, inArray, isNull, or } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { sites, } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type GetSitesParams = {
    sitesIds?: string[];
    types?: typeof sites.$inferSelect['type'][];
    envs?: typeof sites.$inferSelect['env'][];
};

export type GetSitesResults = {
    data: typeof sites.$inferSelect[];
    errors?: string[];
};

export async function _getSites(
    params?: GetSitesParams
): Promise<GetSitesResults> {
    try {
        const { sitesIds: _sitesIds, types = [], envs = [] } = { ...params };

        let sitesIds = _sitesIds || [];

        const whereSitesIds = !sitesIds?.length ? 
            undefined 
            : 
            inArray(sites.siteId, sitesIds.filter(id => uuid.validate(id)));

        const whereSites = [
            isNull(sites.deletedAt),
            whereSitesIds,
            !types.length ? undefined : inArray(sites.type, types),
            !envs.length ? undefined : inArray(sites.env, envs),
        ];

        const res = await db
            .select({
                site: sites,
            })
            .from(sites)
            .where(!whereSites.length ? undefined : and(...whereSites))
            .orderBy(asc(sites.id));

        const data = res.map(s => s.site);

        return  { 
            data,
        };
    } catch(e: any) {
        logger.error('_getSites ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}

export type GetSiteResults = {
    data?: null | typeof sites.$inferSelect;
    errors?: string[];
};

export async function _getSite(
    params: {
        siteId: string,
    },
): Promise<GetSiteResults> {
    const { siteId, } = { ...params };

    try {
        if (!siteId) throw new Error('Missing siteId');

        const whereSiteId = uuid.validate(siteId) ? eq(sites.siteId, siteId) : undefined;

        const data = await db.query.sites.findFirst({
            where: and(
                isNull(sites.deletedAt),
                whereSiteId,
            ),
        });

        return  { 
            data, 
        };
    } catch(e: any) {
        logger.error('_getSite ERROR', e.message);
        return { errors: [e.message], };
    }
} 
