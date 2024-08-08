import { and, gte, inArray, isNull, or } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { authClients } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type GetAuthClientsParams = {
    usersIds?: string[];
    clientIds?: string[];
    clientTokens?: string[];
};

export type GetAuthClientsResults = {
    data: {
        clientId: typeof authClients.$inferSelect['clientId'];
        clientToken: typeof authClients.$inferSelect['clientToken'];
        userId: typeof authClients.$inferSelect['userId'];
    }[];
    errors?: string[];
};

export async function _getAuthClients(params?: GetAuthClientsParams): Promise<GetAuthClientsResults> {
    try {
        const where = [
            or(isNull(authClients.validUntil), gte(authClients.validUntil, new Date())),
            ...(!params?.usersIds?.length ? [] : [inArray(authClients.userId, params.usersIds)]),
            ...(!params?.clientIds?.length ? [] : [inArray(authClients.clientId, params.clientIds)]),
            ...(!params?.clientTokens?.length ? [] : [inArray(authClients.clientToken, params.clientTokens)]),
        ];

        const data = await db.query.authClients.findMany({
            where: !where.length ? undefined : and(...where),
            columns: {
                clientId: true,
                clientToken: true,
                userId: true,
            },
        });

        return  { data };
    } catch(e: any) {
        logger.error('_getAuthClients ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}
