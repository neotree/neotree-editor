import { and, eq, inArray, isNull, notInArray, or } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { configKeys, configKeysDrafts, pendingDeletion, } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { Preferences } from "@/types";

export type GetConfigKeysParams = {
    configKeysIds?: string[];
    returnDraftsIfExist?: boolean;
    withDeleted?: boolean;
};

export type GetConfigKeysResults = {
    data: (typeof configKeys.$inferSelect & {
        isDraft: boolean;
        isDeleted: boolean;
        preferences: Preferences;
        draftCreatedByUserId?: string | null;
    })[];
    errors?: string[];
};

export async function _getConfigKeys(
    params?: GetConfigKeysParams
): Promise<GetConfigKeysResults> {
    try {
        const { configKeysIds: _configKeysIds, returnDraftsIfExist, } = { ...params };

        let configKeysIds = _configKeysIds || [];
        
        // unpublished configKeys conditions
        const whereConfigKeysDraftsIds = !configKeysIds?.length ? 
            undefined 
            : 
            inArray(configKeysDrafts.configKeyDraftId, configKeysIds.map(id => uuid.validate(id) ? id : uuid.v4()));
        const whereConfigKeysDrafts = [
            ...(!whereConfigKeysDraftsIds ? [] : [whereConfigKeysDraftsIds]),
        ];
        const drafts = !returnDraftsIfExist ? [] : await db.query.configKeysDrafts.findMany({
            where: and(...whereConfigKeysDrafts),
        });
        configKeysIds = configKeysIds.filter(id => !drafts.map(d => d.configKeyDraftId).includes(id));

        // published configKeys conditions
        const whereConfigKeysIdsNotIn = !drafts.length ? undefined : notInArray(configKeys.configKeyId, drafts.map(d => d.configKeyDraftId));
        const whereConfigKeysIds = !configKeysIds?.length ? 
            undefined 
            : 
            inArray(configKeys.configKeyId, configKeysIds.filter(id => uuid.validate(id)));
        const whereOldConfigKeysIds = !configKeysIds?.length ? 
            undefined 
            : 
            inArray(configKeys.oldConfigKeyId, configKeysIds.filter(id => !uuid.validate(id)));
        const whereConfigKeys = [
            isNull(configKeys.deletedAt),
            isNull(pendingDeletion),
            ...((!whereConfigKeysIds || !whereOldConfigKeysIds) ? [] : [or(whereConfigKeysIds, whereOldConfigKeysIds)]),
            whereConfigKeysIdsNotIn,
        ];

        const publishedRes = await db
            .select({
                configKey: configKeys,
                pendingDeletion: pendingDeletion,
            })
            .from(configKeys)
            .leftJoin(pendingDeletion, eq(pendingDeletion.configKeyId, configKeys.configKeyId))
            .where(!whereConfigKeys.length ? undefined : and(...whereConfigKeys));

        const published = publishedRes.map(s => s.configKey);

        const inPendingDeletion = !published.length ? [] : await db.query.pendingDeletion.findMany({
            where: inArray(pendingDeletion.configKeyId, published.map(s => s.configKeyId)),
            columns: { configKeyId: true, },
        });

        const responseData = [
            ...published.map(s => ({
                ...s,
                isDraft: false,
                isDeleted: false,
            } as GetConfigKeysResults['data'][0])),

            ...drafts.map((s => ({
                ...s.data,
                isDraft: true,
                isDeleted: false,
                draftCreatedByUserId: s.createdByUserId,
            } as GetConfigKeysResults['data'][0])))
        ]
            .sort((a, b) => a.position - b.position)
            .filter(s => !inPendingDeletion.map(s => s.configKeyId).includes(s.configKeyId));

        return  { 
            data: responseData,
        };
    } catch(e: any) {
        logger.error('_getConfigKeys ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}

export type GetConfigKeyResults = {
    data?: null | typeof configKeys.$inferSelect & {
        isDraft: boolean;
        isDeleted: boolean;
    };
    errors?: string[];
};

export async function _getConfigKey(
    params: {
        configKeyId: string,
        returnDraftIfExists?: boolean;
    },
): Promise<GetConfigKeyResults> {
    const { configKeyId, returnDraftIfExists, } = { ...params };

    try {
        if (!configKeyId) throw new Error('Missing configKeyId');

        const whereConfigKeyId = uuid.validate(configKeyId) ? eq(configKeys.configKeyId, configKeyId) : undefined;
        const whereOldConfigKeyId = !uuid.validate(configKeyId) ? eq(configKeys.oldConfigKeyId, configKeyId) : undefined;
        const whereConfigKeyDraftId = !whereConfigKeyId ? undefined : eq(configKeysDrafts.configKeyDraftId, configKeyId);

        let draft = (returnDraftIfExists && whereConfigKeyDraftId) ? await db.query.configKeysDrafts.findFirst({
            where: whereConfigKeyId,
        }) : undefined;

        let responseData = !draft ? null : {
            ...draft.data,
            isDraft: false,
            isDeleted: false,
        } as GetConfigKeyResults['data'];

        if (responseData) return { data: responseData, };

        const published = await db.query.configKeys.findFirst({
            where: and(
                isNull(configKeys.deletedAt),
                whereConfigKeyId || whereOldConfigKeyId,
            ),
            with: {
                draft: true,
            },
        });

        draft = returnDraftIfExists ? published?.draft : undefined;

        const data = (draft?.data || published) as GetConfigKeyResults['data'];

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
        logger.error('_getConfigKey ERROR', e.message);
        return { errors: [e.message], };
    }
} 
