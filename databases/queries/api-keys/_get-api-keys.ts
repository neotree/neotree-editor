import { and, gte, inArray, isNull, or } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { apiKeys } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type GetApiKeysParams = {
    apiKeys?: string[];
    apiKeysIds?: string[];
};

export type GetApiKeysResults = {
    data: {
        apiKeyId: typeof apiKeys.$inferSelect['apiKeyId'];
        apiKey: typeof apiKeys.$inferSelect['apiKey'];
    }[];
    errors?: string[];
};

export async function _getApiKeys(params?: GetApiKeysParams): Promise<GetApiKeysResults> {
    try {
        const where = [
            or(isNull(apiKeys.validUntil), gte(apiKeys.validUntil, new Date())),
            ...(!params?.apiKeys?.length ? [] : [inArray(apiKeys.apiKey, params.apiKeys)]),
            ...(!params?.apiKeysIds?.length ? [] : [inArray(apiKeys.apiKeyId, params.apiKeysIds)]),
        ];

        const data = await db.query.apiKeys.findMany({
            where: !where.length ? undefined : and(...where),
            columns: {
                apiKeyId: true,
                apiKey: true,
            },
        });

        return  { data };
    } catch(e: any) {
        logger.error('_getApiKeys ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}
