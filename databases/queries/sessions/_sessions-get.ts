import prismadb from "@/databases/prismadb";
import { isEmpty } from "@/lib/isEmpty";
import logger from "@/lib/logger";
import { Prisma } from "@prisma/client";

// GET ONE
export type GetSessionResponse = {
    errors?: string[];
    data: Awaited<ReturnType<typeof prismadb.sessions.findUnique>>;
};

export async function _getSession(id: number): Promise<GetSessionResponse> {
    try {
        const data = await prismadb.sessions
            .findUnique({
                where: { id, },
            });

        return { 
            data,
        };
    } catch(e: any) {
        logger.error('_getSession ERROR', e.message);
        return { data: null, errors: [e.message], }
    }
}

// GET MANY
export type GetSessionsFilters = {
    uid?: string;
    scriptId?: string;
    search?: string;
    sort?: Prisma.sessionsOrderByWithRelationInput;
};

export type GetSessionsResponse = {
    errors?: string[];
    data: Awaited<ReturnType<typeof prismadb.sessions.findMany>>;
    info: {
        limit: number;
        page: number;
        totalPages: number;
        totalRows: number;
        filters: GetSessionsFilters;
    },
};

export type GetSessionsParams = GetSessionsFilters & {
    limit?: number | string;
    page?: number | string;
    searchValue?: string;
};

const defaultLimit = 50;

export const defaultSessionsDataInfo = {
    limit: defaultLimit,
    page: 1,
    searchValue: undefined,
    totalRows: 0,
    totalPages: 1,
    filters: {},
};

export async function _getSessions(params?: GetSessionsParams): Promise<GetSessionsResponse> {
    try {
        const {
            limit: limitParam, 
            page: pageParam,
            ...filters
        } = { ...params };

        const {
            search,
            uid,
            scriptId,
            sort: sortParam,
        } = filters;

        let limit = isEmpty(limitParam) ? 50 : Number(`${limitParam}`);
        limit = isNaN(limit) ? 50 : limit;
        limit = limit || 50;

        let page = isEmpty(pageParam) ? 1 : Number(`${pageParam}`);
        page = Math.max(1, isNaN(page) ? 1 : page);

        const where: Prisma.sessionsWhereInput = {
            uid: (!uid && !search) ? undefined : Object.assign(
                {},
                !uid ? {} : { equals: uid, },
                !search ? {} : { search, },
            ),
            scriptid: (!scriptId && !search) ? undefined : Object.assign(
                {},
                !scriptId ? {} : { equals: scriptId, },
                !search ? {} : { search, },
            ),
            // data: !search ? undefined : {
            //     path: ['data'],
            //     string_contains: search,
            // }
        };

        const totalRows = await prismadb.sessions.count({
            where,
        });

        let totalPages = 1;
        if (totalRows){
            totalPages = Math.ceil(totalRows / limit);
            page = Math.min(page, totalPages);
        }

        const offset = Math.max(0, (page - 1) * limit);

        const sort = sortParam || { ingested_at: 'desc', } satisfies Prisma.sessionsOrderByWithRelationInput;
        filters.sort = sort;

        const data = await prismadb.sessions
            .findMany({
                where,
                take: limit,
                skip: offset,
                orderBy: sort,
            });

        return { 
            data,
            info: {
                limit,
                page,
                totalRows,
                totalPages,
                filters,
            }, 
        };
    } catch(e: any) {
        logger.error('_getSessions ERROR', e.message);
        return { data: [], info: defaultSessionsDataInfo, errors: [e.message], }
    }
}
