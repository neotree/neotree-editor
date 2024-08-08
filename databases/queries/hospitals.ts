import { eq, and, isNull, SQL, count, inArray, desc, sql, isNotNull } from "drizzle-orm";
import * as uuid from 'uuid';

import db from "../pg/drizzle";
import { hospitals } from "../pg/schema";
import { isEmpty } from "@/lib/isEmpty";
import logger from "@/lib/logger";

export type GetHospitalParams = string;

export async function _searchHospitals(searchValue: string) {
    let search = searchValue.split(' ').join(':* | ');
    search = [search, ':*'].join('');

    const matchQuery = sql`(
        setweight(to_tsvector('english', ${hospitals.name}), 'A')
    ), to_tsquery('english', ${search})`;

    const whereMatchQuery = sql`(
        setweight(to_tsvector('english', ${hospitals.name}), 'A')
    ) @@ to_tsquery('english', ${search})`;

    return await db
        .select({
            //   ...getTableColumns(hospitals),
            hospitalId: hospitals.hospitalId,
            name: hospitals.name,
            rank: sql`ts_rank(${matchQuery})`,
            rankCd: sql`ts_rank_cd(${matchQuery})`,
        })
        .from(hospitals)
        .where(whereMatchQuery)
        .orderBy((t) => desc(t.rank));
}

export async function _getHospital(params: GetHospitalParams) {
    const where = uuid.validate(params) ? eq(hospitals.hospitalId, params) : eq(hospitals.oldHospitalId, params);
    return await db.query.hospitals.findFirst({
        where: and(
            where,
            isNull(hospitals.deletedAt),
        ),
        columns: {
            id: true,
            hospitalId: true,
            name: true,
            oldHospitalId: true,
        },
    });
}

export async function _getHospitalMini(params: GetHospitalParams) {
    const where = uuid.validate(params) ? eq(hospitals.hospitalId, params) : eq(hospitals.oldHospitalId, params);
    return await db.query.hospitals.findFirst({
        where: and(
            where,
            isNull(hospitals.deletedAt),
        ),
        columns: {
            id: true,
            hospitalId: true,
            name: true,
            oldHospitalId: true,
        },
    });
}

export async function _getFullHospital(params: GetHospitalParams) {
    const where = uuid.validate(params) ? eq(hospitals.hospitalId, params) : eq(hospitals.oldHospitalId, params);
    return await db.query.hospitals.findFirst({
        where: and(
            where,
            isNull(hospitals.deletedAt),
        ),
    });
}

export type GetHospitalsParams = {
    limit?: number;
    offset?: number;
    page?: number;
    hospitalIds?: string[];
    searchValue?: string;
    archived?: boolean;
};

async function __getHospitals({
    limit,
    archived,
    page = 1,
    hospitalIds,
    searchValue,
}: GetHospitalsParams) {
    page = Math.max(0, page);

    const conditions: SQL[] = [];

    if (archived) {
        conditions.push(isNotNull(hospitals.deletedAt));
    } else {
        conditions.push(isNull(hospitals.deletedAt));
    }

    if (hospitalIds?.length) conditions.push(inArray(hospitals.hospitalId, hospitalIds));

    searchValue = `${searchValue || ''}`.trim();
    if (searchValue) {
        const search = ['%', searchValue, '%'].join('');
        conditions.push(sql`LOWER(hospitals.name) like LOWER(${search})`);
    }

    const countQuery = db.select({ count: count(), }).from(hospitals);
    if (conditions.length) countQuery.where(and(...conditions));

    const [{ count: totalRows, }] = await countQuery.execute();

    let totalPages = 1;
    if (totalRows){
        totalPages = isEmpty(limit) ? 1 : Math.ceil(totalRows / limit!);
        page = Math.min(page, totalPages);
    }

    const offset = isEmpty(limit) ? undefined : Math.max(0, (page - 1) * limit!);

    const data = await db.query.hospitals.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: isEmpty(limit) ? undefined : limit!,
        orderBy: desc(hospitals.id),
        offset,
        columns: {
            id: true,
            hospitalId: true,
            name: true,
            oldHospitalId: true,
        },
    });

    return {
        page,
        limit,
        data,
        totalRows,
        totalPages,
        searchValue,
        error: undefined as (undefined | string),
    };
}

export const _getHospitalsDefaultResults = {
    page: 1,
    limit: undefined,
    totalRows: 0,
    totalPages: 1,
    data: [],
    searchValue: undefined as (undefined | string),
    error: undefined as (undefined | string),
} as Awaited<ReturnType<typeof __getHospitals>>;

export async function _getHospitals(params: GetHospitalsParams) {
    let rslts = _getHospitalsDefaultResults;

    try {
        rslts = await __getHospitals(params);
    } catch(e: any) {
        logger.error('_getHospitals ERROR', e);
        rslts.error = e.message;
    } finally {
        return rslts;
    }
}
