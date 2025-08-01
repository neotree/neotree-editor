import { and, eq, inArray, isNull, notInArray, or } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { dataKeys, dataKeysDrafts, pendingDeletion, } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type DataKey = typeof dataKeys.$inferSelect & {
    isDraft: boolean;
    isDeleted: boolean;
};

export type GetDataKeysParams = {
    dataKeysIds?: string[];
    returnDraftsIfExist?: boolean;
    withDeleted?: boolean;
};

export type GetDataKeysResults = {
    data: DataKey[];
    errors?: string[];
};

export async function _getDataKeys(
    params?: GetDataKeysParams
): Promise<GetDataKeysResults> {
    try {
        const { dataKeysIds: _dataKeysIds, returnDraftsIfExist = true, } = { ...params };

        let dataKeysIds = _dataKeysIds || [];
        
        // unpublished dataKeys conditions
        const whereDataKeysDraftsIds = !dataKeysIds?.length ? 
            undefined 
            : 
            inArray(dataKeysDrafts.uuid, dataKeysIds.map(id => uuid.validate(id) ? id : uuid.v4()));
        const whereDataKeysDrafts = [
            ...(!whereDataKeysDraftsIds ? [] : [whereDataKeysDraftsIds]),
        ];
        const drafts = !returnDraftsIfExist ? [] : await db.query.dataKeysDrafts.findMany({
            where: and(...whereDataKeysDrafts),
        });
        dataKeysIds = dataKeysIds.filter(id => !drafts.map(d => d.uuid).includes(id));

        // published dataKeys conditions
        const whereDataKeysIdsNotIn = !drafts.length ? undefined : notInArray(dataKeys.uuid, drafts.map(d => d.uuid));
        const whereDataKeysIds = !dataKeysIds?.length ? 
            undefined 
            : 
            inArray(dataKeys.uuid, dataKeysIds.filter(id => uuid.validate(id)));
        const whereDataKeys = [
            isNull(dataKeys.deletedAt),
            isNull(pendingDeletion),
            whereDataKeysIds,
            whereDataKeysIdsNotIn,
        ];

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

        const responseData = [
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

        return  { 
            data: responseData,
        };
    } catch(e: any) {
        logger.error('_getDataKeys ERROR', e.message);
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
