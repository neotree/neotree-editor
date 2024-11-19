import { and, count, gte, inArray, isNotNull, isNull, or, sql } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { files } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { isEmpty } from "@/lib/isEmpty";
import { getAppUrl } from "@/lib/urls";
import { FileDetails, GetFilesParams, GetFilesResults } from "./types";

export async function _getFiles(params?: GetFilesParams): Promise<GetFilesResults> {
    try {
        const {
            filesIds,
            archived,
            searchValue,
            limit,
            page: pageParam = 1,
        } = { ...params };

        let page = Math.max(0, pageParam);
        const search = !searchValue ? '' : ['%', searchValue, '%'].join('');
        
        const where = [
            archived ? isNotNull(files.deletedAt) : isNull(files.deletedAt),
            ...(!filesIds?.length ? [] : [inArray(files.fileId, filesIds)]),
            ...(!search ? [] : [sql`LOWER(screens.name) like LOWER(${search})`]),
        ];

        const countQuery = db.select({ count: count(), }).from(files);
        if (where.length) countQuery.where(and(...where));

        const [{ count: totalRows, }] = await countQuery.execute();

        let totalPages = 1;
        if (totalRows){
            totalPages = isEmpty(limit) ? 1 : Math.ceil(totalRows / limit!);
            page = Math.min(page, totalPages);
        }

        const offset = isEmpty(limit) ? undefined : Math.max(0, (page - 1) * limit!);

        const res = await db.query.files.findMany({
            where: !where.length ? undefined : and(...where),
            limit,
            offset,
            columns: {
                fileId: true,
                contentType: true,
                filename: true,
                size: true,
                metadata: true,
                createdAt: true,
            },
        });

        const data = res.map(f => ({
            ...f,
            url: getAppUrl(`/files/${f.fileId}`),
        })) as FileDetails[];

        return  { 
            data,
            searchValue,
            totalPages,
            totalRows, 
            page,
            limit,
        };
    } catch(e: any) {
        logger.error('_getFiles ERROR', e.message);
        return  { 
            errors: [e.message],
            data: [],
            totalPages: 0,
            totalRows: 0, 
            page: 1,
        };
    }
}
