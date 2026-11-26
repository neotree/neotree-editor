import { eq, and, isNull, SQL, count, inArray, isNotNull, desc, sql, or } from "drizzle-orm";
import * as uuid from 'uuid';

import { isEmpty } from "@/lib/isEmpty";
import logger from "@/lib/logger";
import { validEmailRegex } from "@/constants/email";
import db from "../pg/drizzle";
import { changeLogs, users } from "../pg/schema";

export type GetUserParams = string;

export async function _searchUsers(searchValue: string) {
    let search = searchValue.split(' ').join(':* | ');
    search = [search, ':*'].join('');

    const matchQuery = sql`(
        setweight(to_tsvector('english', ${users.email}), 'A') ||
        setweight(to_tsvector('english', ${users.displayName}), 'B')
    ), to_tsquery('english', ${search})`;

    const whereMatchQuery = sql`(
        setweight(to_tsvector('english', ${users.email}), 'A') ||
        setweight(to_tsvector('english', ${users.displayName}), 'B')
    ) @@ to_tsquery('english', ${search})`;

    return await db
        .select({
            //   ...getTableColumns(users),
            userId: users.userId,
            email: users.email,
            displayName: users.displayName,
            firstName: users.firstName,
            lastName: users.lastName,
            rank: sql`ts_rank(${matchQuery})`,
            rankCd: sql`ts_rank_cd(${matchQuery})`,
        })
        .from(users)
        .where(whereMatchQuery)
        .orderBy((t) => desc(t.rank));
}

export async function _getUser(params: GetUserParams) {
    const where = validEmailRegex.test(params) ? eq(users.email, params) : eq(users.userId, params);

    const res = await db.query.users.findFirst({
        where: and(
            where,
            isNull(users.deletedAt),
        ),
        columns: {
            id: true,
            userId: true,
            displayName: true,
            firstName: true,
            lastName: true,
            avatar: true,
            avatar_md: true,
            avatar_sm: true,
            activationDate: true,
            email: true,
            role: true,
            createdAt: true,
            lastLoginDate: true,
            deactivatedAt: true,
            password: true,
        },
    });

    if (!res) return null;

    return { ...res, isActive: !!res?.password, };
}

export async function _getUserMini(params: GetUserParams) {
    const where = validEmailRegex.test(params) ? eq(users.email, params) : eq(users.userId, params);
    return await db.query.users.findFirst({
        where: and(
            where,
            isNull(users.deletedAt),
        ),
        columns: {
            id: true,
            userId: true,
            email: true,
            role: true,
            lastLoginDate: true,
            deactivatedAt: true,
        },
    });
}

export async function _getFullUser(params: GetUserParams) {
    const where = validEmailRegex.test(params) ? eq(users.email, params) : eq(users.userId, params);
    return db.query.users.findFirst({
        where: and(
            where,
            isNull(users.deletedAt),
        ),
    });
}

export type GetUsersParams = {
    limit?: number;
    offset?: number;
    page?: number;
    userIds?: string[];
    roles?: string[];
    status?: string;
    searchValue?: string;
};

async function __getUsers({
    limit,
    roles,
    page = 1,
    userIds,
    status,
    searchValue,
}: GetUsersParams) {
    page = Math.max(0, page);

    const conditions: SQL[] = [isNull(users.deletedAt)];

    if (userIds?.length) conditions.push(inArray(users.userId, userIds));

    if (roles?.length) conditions.push(inArray(users.role, roles as (typeof users.$inferSelect['role'])[]));

    if (status === 'active') conditions.push(isNotNull(users.activationDate), isNull(users.deactivatedAt));

    if (status === 'inactive') conditions.push(isNull(users.activationDate), isNull(users.deactivatedAt));

    if (status === 'deactivated') conditions.push(isNotNull(users.deactivatedAt));

    searchValue = `${searchValue || ''}`.trim();
    if (searchValue) {
        const search = ['%', searchValue, '%'].join('');
        conditions.push(sql`(LOWER(users.email) like LOWER(${search}) OR LOWER(users.display_name) like LOWER(${search}) OR LOWER(users.first_name) like LOWER(${search}) OR LOWER(users.last_name) like LOWER(${search}))`);
    }

    const countQuery = db.select({ count: count(), }).from(users);
    if (conditions.length) countQuery.where(and(...conditions));

    const [{ count: totalRows, }] = await countQuery.execute();

    let totalPages = 1;
    if (totalRows){
        totalPages = isEmpty(limit) ? 1 : Math.ceil(totalRows / limit!);
        page = Math.min(page, totalPages);
    }

    const offset = isEmpty(limit) ? undefined : Math.max(0, (page - 1) * limit!);

    const data = await db.query.users.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: isEmpty(limit) ? undefined : limit!,
        orderBy: desc(users.id),
        offset,
        columns: {
            id: true,
            userId: true,
            displayName: true,
            firstName: true,
            lastName: true,
            avatar: true,
            avatar_md: true,
            avatar_sm: true,
            activationDate: true,
            email: true,
            role: true,
            createdAt: true,
            lastLoginDate: true,
            deactivatedAt: true,
        },
    });

    return {
        page,
        limit,
        data,
        totalRows,
        totalPages,
        searchValue,
        error: undefined as (undefined | string),
    };
}

export const _getUsersDefaultResults = {
    page: 1,
    limit: undefined,
    totalRows: 0,
    totalPages: 1,
    data: [],
    searchValue: undefined as (undefined | string),
    error: undefined as (undefined | string),
} as Awaited<ReturnType<typeof __getUsers>>;

export async function _getUsers(params: GetUsersParams) {
    let rslts = _getUsersDefaultResults;
    try {
        rslts = await __getUsers(params);
    } catch(e: any) {
        logger.error('_getUsers ERROR', e);
        rslts.error = e.message;
    } finally {
        return rslts;
    }
}

export type UserAccessHistoryEntry = {
    id: string;
    action: 'deactivated' | 'reactivated';
    description: string;
    date: string;
    byName: string;
    byEmail: string;
};

/** Who deactivated / reactivated this user, and when, newest first. */
export async function _getUserAccessHistory(userId: string): Promise<UserAccessHistoryEntry[]> {
    if (!uuid.validate(userId)) return [];

    const rows = await db
        .select({
            id: changeLogs.changeLogId,
            description: changeLogs.description,
            changes: changeLogs.changes,
            date: changeLogs.dateOfChange,
            byName: users.displayName,
            byEmail: users.email,
        })
        .from(changeLogs)
        .leftJoin(users, eq(users.userId, changeLogs.userId))
        .where(and(eq(changeLogs.entityType, 'user'), eq(changeLogs.entityId, userId), eq(changeLogs.action, 'update')))
        .orderBy(desc(changeLogs.dateOfChange));

    return rows.map(r => {
        const change = (r.changes || []).find(c => c.field === 'deactivatedAt');
        return {
            id: r.id,
            // a new deactivation date means the account was switched off; an empty one means back on
            action: change?.newValue ? 'deactivated' as const : 'reactivated' as const,
            description: r.description,
            date: r.date.toISOString(),
            byName: r.byName || 'Unknown user',
            byEmail: r.byEmail || '',
        };
    });
}
