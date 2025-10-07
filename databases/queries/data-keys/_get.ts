import { and, eq, inArray, isNull, notInArray, or, sql } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { dataKeys, dataKeysDrafts, pendingDeletion, } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { Pagination } from "@/types";


export type DataKey = typeof dataKeys.$inferSelect & {
    isDraft: boolean;
    isDeleted: boolean;
};

export type GetDataKeysParams = {
    dataKeysIds?: string[];
    names?: string[];
    uniqueKeys?: string[];
    keys?: {
        name: string;
        label: string;
        dataType: string;
    }[];
    returnDraftsIfExist?: boolean;
    withDeleted?: boolean;
    pagination?: {
        limit: number;
        page: number;
    }
};

export type GetDataKeysResults = {
    data: DataKey[];
    pagination?: Pagination;
    errors?: string[];
};

export function batchData<T>(data: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < data.length; i += batchSize) {
        batches.push(data.slice(i, i + batchSize));
    }
    return batches;
}

export function paginateData<T>(
    data: T[], 
    page: number, 
    limit: number
): { data: T[], pagination: Pagination } {
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
        data: data.slice(startIndex, endIndex),
        pagination: {
            page,
            limit,
            total,
            totalPages,
        }
    };
}

export async function _getDataKeys(
    params?: GetDataKeysParams
): Promise<GetDataKeysResults> {
    try {
        const { 
            keys = [],
            dataKeysIds: _dataKeysIds, 
            names: namesParam = [],
            uniqueKeys: uniqueKeysParam = [],
            returnDraftsIfExist = true, 
            pagination: paginationParam,
        } = { ...params };

        let dataKeysIds = _dataKeysIds || [];
        const names = namesParam.map(n => `${n || ''}`.toLowerCase()).filter(n => n);
        const uniqueKeys = uniqueKeysParam.filter(n => n);

        let drafts: typeof dataKeysDrafts.$inferSelect[] = [];

        if (keys.length) {
            drafts = await db.query.dataKeysDrafts.findMany();

            drafts = drafts
                .filter(d => !dataKeysIds.length ? true : dataKeysIds.includes(d.uuid))
                .filter(d => !names.length ? true : names.includes(d.name))
                .filter(d => !uniqueKeys.length ? true : uniqueKeys.includes(d.uniqueKey));

            drafts = drafts.filter(d => {
                return keys.map(k => JSON.stringify({
                    name: k.name,
                    label: k.label,
                    dataType: k.dataType,
                }).toLowerCase()).includes(JSON.stringify({
                    name: d.data.name,
                    label: d.data.label,
                    dataType: d.data.dataType,
                }).toLowerCase());
            });
        } else {
            // unpublished dataKeys conditions
            const whereDataKeysDrafts = [
                !dataKeysIds?.length ? 
                    undefined 
                    : 
                    inArray(dataKeysDrafts.uuid, dataKeysIds.map(id => uuid.validate(id) ? id : uuid.v4())),
                    
                !names?.length ? 
                    undefined 
                    : 
                    inArray(sql`lower(${dataKeysDrafts.name})`, names),

                !uniqueKeys?.length ? 
                    undefined 
                    : 
                    inArray(dataKeysDrafts.uniqueKey, uniqueKeys),
            ].filter(q => q);

            drafts = !returnDraftsIfExist ? [] : await db.query.dataKeysDrafts.findMany({
                where:!whereDataKeysDrafts.length ? undefined : and(...whereDataKeysDrafts),
            });
        }

        dataKeysIds = dataKeysIds.filter(id => !drafts.map(d => d.uuid).includes(id));

        // published dataKeys conditions
        const whereDataKeys = [
            isNull(dataKeys.deletedAt),
            isNull(pendingDeletion),

            !drafts.length ? undefined : notInArray(dataKeys.uuid, drafts.map(d => d.uuid)),

            !keys.length ?
                undefined
                :
                inArray(
                    sql`lower(concat(${dataKeys.name},',',${dataKeys.label},',',${dataKeys.dataType}))`, 
                    keys.map(k => `${k.name},${k.label},${k.dataType}`.toLowerCase()),
                ),

            !dataKeysIds?.length ? 
                undefined 
                : 
                inArray(dataKeys.uuid, dataKeysIds.filter(id => uuid.validate(id))),

            !names?.length ? 
                undefined 
                : 
                inArray(sql`lower(${dataKeys.name})`, names),

            !uniqueKeys?.length ? 
                undefined 
                : 
                inArray(dataKeys.uniqueKey, uniqueKeys),
        ].filter(q => q);

        const publishedRes = await db
            .select({
                dataKey: dataKeys,
                pendingDeletion: pendingDeletion,
            })
            .from(dataKeys)
            .leftJoin(pendingDeletion, eq(pendingDeletion.dataKeyId, dataKeys.uuid))
            .where(!whereDataKeys.length ? undefined : and(...whereDataKeys));

        const published = publishedRes.map(s => s.dataKey);

        const inPendingDeletion = !published.length ? [] : await db.query.pendingDeletion.findMany({
            where: inArray(pendingDeletion.dataKeyId, published.map(s => s.uuid)),
            columns: { dataKeyId: true, },
        });

        const allData = [
            ...published.map(s => ({
                ...s,
                isDraft: false,
                isDeleted: false,
            } as GetDataKeysResults['data'][0])),

            ...drafts.map((s => ({
                ...s.data,
                isDraft: true,
                isDeleted: false,
            } as GetDataKeysResults['data'][0])))
        ]
            .sort((a, b) => {
                let returnVal = 0;
                if(a.label < b.label) returnVal = -1;
                if(a.label > b.label) returnVal = 1;
                return returnVal;
            })
            .filter(s => !inPendingDeletion.map(s => s.dataKeyId).includes(s.uuid));

        // Apply pagination if requested
        if (paginationParam) {
            const { limit, page } = paginationParam;
            const paginatedResult = paginateData(allData, page, limit);
            
            return {
                data: paginatedResult.data,
                pagination: paginatedResult.pagination,
            };
        }

        // Return all data without pagination
        return { 
            data: allData,
        };
    } catch(e: any) {
        logger.error('_getDataKeys ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}

export async function _getDataKeysInBatches(
    params?: GetDataKeysParams & { batchSize?: number }
): Promise<GetDataKeysResults & { batches?: DataKey[][] }> {
    try {
        const { batchSize = 50, ...restParams } = { ...params };
        
        // Get all data at once without pagination
        const result = await _getDataKeys({ ...restParams, pagination: undefined });
        
        if (result.errors || !result.data) {
            return result;
        }

        // Split data into batches
        const batches = batchData(result.data, batchSize);
        
        return {
            data: result.data,
            batches,
        };
    } catch(e: any) {
        logger.error('_getDataKeysInBatches ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}

export type GetDataKeyResults = {
    data?: null | DataKey;
    errors?: string[];
};

export async function _getDataKey(
    params: {
        dataKeyId: string,
        returnDraftIfExists?: boolean;
    },
): Promise<GetDataKeyResults> {
    const { dataKeyId, returnDraftIfExists, } = { ...params };

    try {
        if (!dataKeyId) throw new Error('Missing dataKeyId');

        const whereDataKeyId = uuid.validate(dataKeyId) ? eq(dataKeys.uuid, dataKeyId) : undefined;
        const whereDataKeyDraftId = !whereDataKeyId ? undefined : eq(dataKeysDrafts.uuid, dataKeyId);

        let draft = (returnDraftIfExists && whereDataKeyDraftId) ? await db.query.dataKeysDrafts.findFirst({
            where: whereDataKeyId,
        }) : undefined;

        let responseData = !draft ? null : {
            ...draft.data,
            isDraft: false,
            isDeleted: false,
        } as GetDataKeyResults['data'];

        if (responseData) return { data: responseData, };

        const published = await db.query.dataKeys.findFirst({
            where: and(
                isNull(dataKeys.deletedAt),
                whereDataKeyId,
            ),
            with: {
                draft: true,
            },
        });

        draft = returnDraftIfExists ? published?.draft : undefined;

        const data = (draft?.data || published) as GetDataKeyResults['data'];

        responseData = !data ? null : {
            ...data,
            isDraft: false,
            isDeleted: false,
        };

        if (!responseData) return { data: null, };

        return  { 
            data: responseData, 
        };
    } catch(e: any) {
        logger.error('_getDataKey ERROR', e.message);
        return { errors: [e.message], };
    }
}