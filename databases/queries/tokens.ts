import { SQL, and, eq, gte, or } from "drizzle-orm";

import db from "../pg/drizzle";
import * as schema from "../pg/schema";

export async function _getToken(tokenOrTokenId: number, userId?: string) {
    const conditions: SQL[] = [];

    if (userId) conditions.push(eq(schema.tokens.userId, userId));

    return await db.query.tokens.findFirst({
        where: and(
            gte(schema.tokens.validUntil, new Date()),
            or(
                and(
                    eq(schema.tokens.id, Number(tokenOrTokenId)),
                    ...conditions,
                ),
                and(
                    eq(schema.tokens.token, Number(tokenOrTokenId)),
                    ...conditions,
                ),
            ),
        ),
    });
}

export async function _getFullToken(tokenOrTokenId: number, userId?: string) {
    const conditions: SQL[] = [];

    if (userId) conditions.push(eq(schema.tokens.userId, userId));

    return await db.query.tokens.findFirst({
        where: and(
            gte(schema.tokens.validUntil, new Date()),
            or(
                and(
                    eq(schema.tokens.id, Number(tokenOrTokenId)),
                    ...conditions,
                ),
                and(
                    eq(schema.tokens.token, Number(tokenOrTokenId)),
                    ...conditions,
                ),
            ),
        ),
        with: {
            user: {
                columns: {
                    userId: true,
                    email: true,
                    displayName: true,
                },
            },
        },
    });
}
