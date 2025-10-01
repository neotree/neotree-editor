import { and, eq, inArray, isNull, notInArray, sql } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { dataKeys, dataKeysDrafts, pendingDeletion } from "@/databases/pg/schema";
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
    returnDraftsIfExist?: boolean;
    withDeleted?: boolean;
    pagination?: {
        limit: number;
        page: number;
    };
};

export type GetDataKeysResults = {
    data: DataKey[];
    pagination?: Pagination;
    errors?: string[];
};

export async function _getDataKeys(
    params?: GetDataKeysParams
): Promise<GetDataKeysResults> {
    try {
        const {
            dataKeysIds: _dataKeysIds,
            names: namesParam = [],
            uniqueKeys: uniqueKeysParam = [],
            returnDraftsIfExist = true,
            pagination: paginationParam,
        } = { ...params };

        let dataKeysIds = _dataKeysIds || [];

        const names = namesParam.map(n => `${n || ''}`.toLowerCase()).filter(n => n);
        const uniqueKeys = uniqueKeysParam.filter(n => n);

        // ============================================
        // STEP 1: Fetch drafts (these are always few)
        // ============================================
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

        const drafts = !returnDraftsIfExist ? [] : await db.query.dataKeysDrafts.findMany({
            where: !whereDataKeysDrafts.length ? undefined : and(...whereDataKeysDrafts),
        });

        const draftUuids = drafts.map(d => d.uuid);
        dataKeysIds = dataKeysIds.filter(id => !draftUuids.includes(id));

        // ============================================
        // STEP 2: Build base query for published keys
        // ============================================
        const whereDataKeys = [
            isNull(dataKeys.deletedAt),
            draftUuids.length ? notInArray(dataKeys.uuid, draftUuids) : undefined,
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

        const baseWhere = !whereDataKeys.length ? undefined : and(...whereDataKeys);

        // ============================================
        // STEP 3: Get total count (optimized)
        // ============================================
        const [countResult] = await db
            .select({
                count: sql<number>`cast(count(*) as integer)`
            })
            .from(dataKeys)
            .where(baseWhere);

        const publishedCount = countResult?.count || 0;
        const totalCount = publishedCount + drafts.length;

        // Calculate pagination
        const limit = paginationParam?.limit || totalCount || 10;
        const page = paginationParam?.page || 1;
        const offset = (page - 1) * limit;
        const totalPages = Math.ceil(totalCount / limit);

        // ============================================
        // STEP 4: Fetch paginated published data
        // ============================================
        // Note: We need to handle drafts + published merge, so we fetch enough data
        // to account for drafts that might be inserted at the beginning
        const fetchLimit = paginationParam ? limit + drafts.length : undefined;

        const publishedQuery = db
            .select({
                dataKey: dataKeys,
            })
            .from(dataKeys)
            .where(baseWhere)
            .orderBy(sql`lower(${dataKeys.label})`) // Add ORDER BY for consistent pagination
            .$dynamic();

        // Only apply limit/offset if pagination is requested
        const publishedRes = paginationParam
            ? await publishedQuery.limit(fetchLimit!).offset(Math.max(0, offset - drafts.length))
            : await publishedQuery;

        const published = publishedRes.map(s => s.dataKey);

        // ============================================
        // STEP 5: Check pending deletions (only for fetched records)
        // ============================================
        const allUuids = [...draftUuids, ...published.map(p => p.uuid)];

        const inPendingDeletion = !allUuids.length ? [] : await db.query.pendingDeletion.findMany({
            where: inArray(pendingDeletion.dataKeyId, allUuids),
            columns: { dataKeyId: true },
        });

        const pendingDeletionIds = new Set(inPendingDeletion.map(s => s.dataKeyId));

        // ============================================
        // STEP 6: Merge and sort data
        // ============================================
        const allData = [
            ...published.map(s => ({
                ...s,
                isDraft: false,
                isDeleted: false,
            } as DataKey)),

            ...drafts.map(s => ({
                ...s.data,
                isDraft: true,
                isDeleted: false,
            } as DataKey))
        ]
            .filter(s => !pendingDeletionIds.has(s.uuid))
            .sort((a, b) => {
                const labelA = (a.label || '').toLowerCase();
                const labelB = (b.label || '').toLowerCase();
                if (labelA < labelB) return -1;
                if (labelA > labelB) return 1;
                return 0;
            });

        // ============================================
        // STEP 7: Apply client-side pagination slice
        // ============================================
        const responseData = paginationParam
            ? allData.slice(offset, offset + limit)
            : allData;

        return {
            data: responseData,
            pagination: paginationParam ? {
                limit,
                page,
                total: totalCount,
                totalPages,
            } : undefined,
        };
    } catch(e: any) {
        logger.error('_getDataKeys ERROR', e.message);
        return { data: [], errors: [e.message] };
    }
}

export type GetDataKeyResults = {
    data?: null | DataKey;
    errors?: string[];
};

export async function _getDataKey(
    params: {
        dataKeyId: string;
        returnDraftIfExists?: boolean;
    }
): Promise<GetDataKeyResults> {
    const { dataKeyId, returnDraftIfExists } = params;

    try {
        if (!dataKeyId) throw new Error('Missing dataKeyId');
        if (!uuid.validate(dataKeyId)) throw new Error('Invalid dataKeyId format');

        const whereDataKeyId = eq(dataKeys.uuid, dataKeyId);
        const whereDataKeyDraftId = eq(dataKeysDrafts.uuid, dataKeyId);

        // ============================================
        // STEP 1: Check for draft first (if requested)
        // ============================================
        if (returnDraftIfExists) {
            const draft = await db.query.dataKeysDrafts.findFirst({
                where: whereDataKeyDraftId,
            });

            if (draft) {
                return {
                    data: {
                        ...draft.data,
                        isDraft: true,
                        isDeleted: false,
                    }
                };
            }
        }

        // ============================================
        // STEP 2: Fetch published with optional draft
        // ============================================
        const published = await db.query.dataKeys.findFirst({
            where: and(
                isNull(dataKeys.deletedAt),
                whereDataKeyId
            ),
            with: returnDraftIfExists ? {
                draft: true,
            } : undefined,
        });

        if (!published) {
            return { data: null };
        }

        // ============================================
        // STEP 3: Check if in pending deletion
        // ============================================
        const isPendingDeletion = await db.query.pendingDeletion.findFirst({
            where: eq(pendingDeletion.dataKeyId, dataKeyId),
            columns: { dataKeyId: true },
        });

        if (isPendingDeletion) {
            return { data: null };
        }

        // ============================================
        // STEP 4: Return draft data if exists, otherwise published
        // ============================================
        const draft = returnDraftIfExists ? published?.draft : undefined;
        const finalData = draft?.data || published;

        return {
            data: {
                ...finalData,
                isDraft: !!draft,
                isDeleted: false,
            }
        };
    } catch(e: any) {
        logger.error('_getDataKey ERROR', e.message);
        return { errors: [e.message] };
    }
}
