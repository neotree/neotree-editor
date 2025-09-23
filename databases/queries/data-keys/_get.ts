import { and, eq, inArray, isNull, notInArray, or, sql } from "drizzle-orm";
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
    names?: string[];
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
        const { 
            dataKeysIds: _dataKeysIds, 
            names: namesParam = [],
            returnDraftsIfExist = true, 
        } = { ...params };

        let dataKeysIds = _dataKeysIds || [];
        const names = namesParam.map(n => `${n || ''}`.toLowerCase()).filter(n => n);
        
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
        ].filter(q => q);

        const drafts = !returnDraftsIfExist ? [] : await db.query.dataKeysDrafts.findMany({
            where:!whereDataKeysDrafts.length ? undefined : and(...whereDataKeysDrafts),
        });
        dataKeysIds = dataKeysIds.filter(id => !drafts.map(d => d.uuid).includes(id));

        // published dataKeys conditions
        const whereDataKeys = [
            isNull(dataKeys.deletedAt),
            isNull(pendingDeletion),
            !drafts.length ? undefined : notInArray(dataKeys.uuid, drafts.map(d => d.uuid)),
            !dataKeysIds?.length ? 
                undefined 
                : 
                inArray(dataKeys.uuid, dataKeysIds.filter(id => uuid.validate(id))),
            !names?.length ? 
                undefined 
                : 
                inArray(sql`lower(${dataKeys.name})`, names),
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

export async function _getDataKeysSelectOptions() {
    const res = await _getDataKeys();

    const items: (Awaited<ReturnType<typeof _getDataKeys>>['data'][0]['children'][0] & {
        isChild?: boolean;
    })[] = [];
    
    res.data.forEach(({ children = [], uuid, ...k }) => {
        // const _children = (items: typeof children) => items.map(c => ({ dataType: c.dataType, label: c.label, name: c.name, }));

        // if (
        //     !items.map(k => JSON.stringify({ dataType: k.dataType, label: k.label, name: k.name, children: _children(k.children), }))
        //         .includes(JSON.stringify({ dataType: k.dataType, label: k.label, name: k.name, children: _children(children), }))
        // ) {
        //     items.push({
        //         ...k,
        //         children,
        //         uuid: undefined!,
        //     });
        // }

        items.push({
            ...k,
            children,
            uuid: undefined!,
        });

        children.forEach(({ uuid, ...c }) => {
            if (
                !items.map(c => JSON.stringify({ dataType: c.dataType, label: c.label, name: c.name, }).toLowerCase())
                    .includes(JSON.stringify({ dataType: c.dataType, label: c.label, name: c.name, }).toLowerCase())
            ) {
                items.push({
                    ...c,
                    uuid: undefined!,
                    isChild: true,
                });
            }
        });
    });

    let opts: {
        label: string;
        value: string;
        caption: string;
        description: string;
        defaults: DataKey['defaults'];
        data?: Record<string, any>;
    }[]  = items
        .map(k => ({
            label: k.name,
            value: k.name,
            description: k.label,
            caption: k.dataType || '',
            defaults: k.defaults,
            data: {
                label: k.label,
                key: k.name,
                isChild: k.isChild,
                dataType: k.dataType,
                children: k.children.map(k => ({
                    label: k.label,
                    value: k.name,
                    dataType: k.dataType,
                })),
            },
        }));

    opts = opts
        .filter(o => o.data?.key)
        // .filter((o, i) => {
        //     return opts.map(o => JSON.stringify(o)).indexOf(JSON.stringify(o)) === i;
        // })
        .sort((a, b) => {
            if (a.value < b.value) return -1;
            if (a.value > b.value) return 1;
            return 0;
        })
        .map((o, i) => ({
            ...o,
            value: o.value + i,
        }));

    return {
        errors: res.errors,
        data: opts,
    };
}
