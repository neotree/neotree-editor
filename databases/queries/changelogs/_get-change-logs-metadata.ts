import { and, eq, inArray, desc, sql, or, ilike } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { changeLogs, users } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type SearchChangeLogsParams = {
    searchTerm?: string;
    entityTypes?: (typeof changeLogs.$inferSelect)['entityType'][];
    actions?: (typeof changeLogs.$inferSelect)['action'][];
    userIds?: string[];
    startDate?: Date;
    endDate?: Date;
    isActiveOnly?: boolean;
    limit?: number;
    offset?: number;
};

export type SearchChangeLogsResults = {
    data: (typeof changeLogs.$inferSelect & {
        userName?: string;
        userEmail?: string;
        relevanceScore?: number;
    })[];
    total: number;
    errors?: string[];
};

export async function _searchChangeLogs(
    params?: SearchChangeLogsParams
): Promise<SearchChangeLogsResults> {
    try {
        let {
            searchTerm,
            entityTypes = [],
            actions = [],
            userIds = [],
            startDate,
            endDate,
            isActiveOnly = false,
            limit = 50,
            offset = 0,
        } = { ...params };

        // Filter valid UUIDs
        userIds = userIds.filter(id => uuid.validate(id));

        const searchConditions = searchTerm
            ? or(
                ilike(changeLogs.description, `%${searchTerm}%`),
                ilike(changeLogs.changeReason, `%${searchTerm}%`),
                sql`${changeLogs.changes}::text ILIKE ${'%' + searchTerm + '%'}`,
                sql`${changeLogs.fullSnapshot}::text ILIKE ${'%' + searchTerm + '%'}`,
            )
            : undefined;

        const result = await db
            .select({
                changeLog: changeLogs,
                user: {
                    name: users.displayName,
                    email: users.email,
                },
            })
            .from(changeLogs)
            .leftJoin(users, eq(users.userId, changeLogs.userId))
            .where(and(
                searchConditions,
                !entityTypes.length ? undefined : inArray(changeLogs.entityType, entityTypes),
                !actions.length ? undefined : inArray(changeLogs.action, actions),
                !userIds.length ? undefined : inArray(changeLogs.userId, userIds),
                isActiveOnly ? eq(changeLogs.isActive, true) : undefined,
                startDate ? sql`${changeLogs.dateOfChange} >= ${startDate}` : undefined,
                endDate ? sql`${changeLogs.dateOfChange} <= ${endDate}` : undefined,
            ))
            .orderBy(desc(changeLogs.dateOfChange))
            .limit(limit)
            .offset(offset);

        const data = result.map(item => ({
            ...item.changeLog,
            userName: item.user?.name || '',
            userEmail: item.user?.email || '',
        }));

        return {
            data,
            total: data.length,
        };
    } catch (e: any) {
        logger.error('_searchChangeLogs ERROR', e.message);
        return { data: [], total: 0, errors: [e.message] };
    }
}

export type SearchChangesByFieldParams = {
    fieldName: string;
    searchValue?: string;
    entityId?: string;
    entityType?: (typeof changeLogs.$inferSelect)['entityType'];
    limit?: number;
};

export type SearchChangesByFieldResults = {
    data: {
        version: number;
        entityId: string;
        entityType: string;
        action: string;
        field: string;
        previousValue: any;
        newValue: any;
        dateOfChange: Date;
        userId: string;
        userName?: string;
    }[];
    errors?: string[];
};

export async function _searchChangesByField(
    params: SearchChangesByFieldParams
): Promise<SearchChangesByFieldResults> {
    try {
        const { fieldName, searchValue, entityId, entityType, limit = 50 } = { ...params };

        if (!fieldName) {
            throw new Error('fieldName is required');
        }

        const fieldCondition = searchValue
            ? sql`EXISTS (
                SELECT 1 FROM jsonb_array_elements(${changeLogs.changes}) AS change
                WHERE (change->>'field' = ${fieldName} OR change->>'fieldPath' = ${fieldName})
                AND (
                    change->>'previousValue' ILIKE ${'%' + searchValue + '%'}
                    OR change->>'newValue' ILIKE ${'%' + searchValue + '%'}
                )
            )`
            : sql`EXISTS (
                SELECT 1 FROM jsonb_array_elements(${changeLogs.changes}) AS change
                WHERE change->>'field' = ${fieldName} OR change->>'fieldPath' = ${fieldName}
            )`;

        const result = await db
            .select({
                changeLog: changeLogs,
                user: {
                    name: users.displayName,
                },
            })
            .from(changeLogs)
            .leftJoin(users, eq(users.userId, changeLogs.userId))
            .where(and(
                fieldCondition,
                entityId && uuid.validate(entityId) ? eq(changeLogs.entityId, entityId) : undefined,
                entityType ? eq(changeLogs.entityType, entityType) : undefined,
            ))
            .orderBy(desc(changeLogs.dateOfChange))
            .limit(limit);

        const data = result.map(item => {
            const changes = (item.changeLog.changes || []) as any[];
            const fieldChange = changes.find(
                c => c.field === fieldName || c.fieldPath === fieldName
            );

            return {
                version: item.changeLog.version,
                entityId: item.changeLog.entityId,
                entityType: item.changeLog.entityType,
                action: item.changeLog.action,
                field: fieldChange?.field || fieldChange?.fieldPath || fieldName,
                previousValue: fieldChange?.previousValue,
                newValue: fieldChange?.newValue,
                dateOfChange: item.changeLog.dateOfChange,
                userId: item.changeLog.userId,
                userName: item.user?.name || '',
            };
        });

        return { data };
    } catch (e: any) {
        logger.error('_searchChangesByField ERROR', e.message);
        return { data: [], errors: [e.message] };
    }
}

export type SearchByUserParams = {
    userId?: string;
    userName?: string;
    entityType?: (typeof changeLogs.$inferSelect)['entityType'];
    action?: (typeof changeLogs.$inferSelect)['action'];
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
};

export type SearchByUserResults = {
    data: (typeof changeLogs.$inferSelect & {
        userName?: string;
        userEmail?: string;
    })[];
    errors?: string[];
};

export async function _searchChangeLogsByUser(
    params: SearchByUserParams
): Promise<SearchByUserResults> {
    try {
        const {
            userId,
            userName,
            entityType,
            action,
            startDate,
            endDate,
            limit = 50,
            offset = 0,
        } = { ...params };

        if (!userId && !userName) {
            throw new Error('Either userId or userName is required');
        }

        const userCondition = userName
            ? ilike(users.displayName, `%${userName}%`)
            : userId && uuid.validate(userId)
                ? eq(changeLogs.userId, userId)
                : undefined;

        const result = await db
            .select({
                changeLog: changeLogs,
                user: {
                    name: users.displayName,
                    email: users.email,
                },
            })
            .from(changeLogs)
            .leftJoin(users, eq(users.userId, changeLogs.userId))
            .where(and(
                userCondition,
                entityType ? eq(changeLogs.entityType, entityType) : undefined,
                action ? eq(changeLogs.action, action) : undefined,
                startDate ? sql`${changeLogs.dateOfChange} >= ${startDate}` : undefined,
                endDate ? sql`${changeLogs.dateOfChange} <= ${endDate}` : undefined,
            ))
            .orderBy(desc(changeLogs.dateOfChange))
            .limit(limit)
            .offset(offset);

        const data = result.map(item => ({
            ...item.changeLog,
            userName: item.user?.name || '',
            userEmail: item.user?.email || '',
        }));

        return { data };
    } catch (e: any) {
        logger.error('_searchChangeLogsByUser ERROR', e.message);
        return { data: [], errors: [e.message] };
    }
}

export type SearchByDateRangeParams = {
    startDate: Date;
    endDate: Date;
    entityType?: (typeof changeLogs.$inferSelect)['entityType'];
    action?: (typeof changeLogs.$inferSelect)['action'];
    groupBy?: 'day' | 'week' | 'month';
    limit?: number;
};

export type SearchByDateRangeResults = {
    data: (typeof changeLogs.$inferSelect & {
        userName?: string;
    })[];
    summary?: {
        totalChanges: number;
        byAction: Record<string, number>;
        byEntityType: Record<string, number>;
    };
    errors?: string[];
};

export async function _searchChangeLogsByDateRange(
    params: SearchByDateRangeParams
): Promise<SearchByDateRangeResults> {
    try {
        const {
            startDate,
            endDate,
            entityType,
            action,
            limit = 100,
        } = { ...params };

        const result = await db
            .select({
                changeLog: changeLogs,
                user: {
                    name: users.displayName,
                },
            })
            .from(changeLogs)
            .leftJoin(users, eq(users.userId, changeLogs.userId))
            .where(and(
                sql`${changeLogs.dateOfChange} >= ${startDate}`,
                sql`${changeLogs.dateOfChange} <= ${endDate}`,
                entityType ? eq(changeLogs.entityType, entityType) : undefined,
                action ? eq(changeLogs.action, action) : undefined,
            ))
            .orderBy(desc(changeLogs.dateOfChange))
            .limit(limit);

        const data = result.map(item => ({
            ...item.changeLog,
            userName: item.user?.name || '',
        }));

        // Calculate summary statistics
        const summary = {
            totalChanges: data.length,
            byAction: {} as Record<string, number>,
            byEntityType: {} as Record<string, number>,
        };

        data.forEach(item => {
            summary.byAction[item.action] = (summary.byAction[item.action] || 0) + 1;
            summary.byEntityType[item.entityType] = (summary.byEntityType[item.entityType] || 0) + 1;
        });

        return { data, summary };
    } catch (e: any) {
        logger.error('_searchChangeLogsByDateRange ERROR', e.message);
        return { data: [], errors: [e.message] };
    }
}

export type FindRelatedChangesParams = {
    changeLogId: string;
    includeParentChain?: boolean;
    includeMergedVersions?: boolean;
};

export type FindRelatedChangesResults = {
    data: {
        current: typeof changeLogs.$inferSelect;
        parent?: typeof changeLogs.$inferSelect;
        children: (typeof changeLogs.$inferSelect)[];
        mergedVersions: (typeof changeLogs.$inferSelect)[];
        supersededVersions: (typeof changeLogs.$inferSelect)[];
    };
    errors?: string[];
};

export async function _findRelatedChanges(
    params: FindRelatedChangesParams
): Promise<FindRelatedChangesResults> {
    try {
        const { changeLogId, includeParentChain = true, includeMergedVersions = true } = { ...params };

        if (!changeLogId || !uuid.validate(changeLogId)) {
            throw new Error('Invalid changeLogId');
        }

        // Get the main change log
        const current = await db.query.changeLogs.findFirst({
            where: eq(changeLogs.changeLogId, changeLogId),
        });

        if (!current) {
            throw new Error('Change log not found');
        }

        // Get parent version
        let parent: typeof changeLogs.$inferSelect | undefined;
        if (includeParentChain && current.parentVersion !== null) {
            parent = await db.query.changeLogs.findFirst({
                where: and(
                    eq(changeLogs.entityId, current.entityId),
                    eq(changeLogs.version, current.parentVersion),
                ),
            });
        }

        // Get children (versions that have this as parent)
        const children = await db.query.changeLogs.findMany({
            where: and(
                eq(changeLogs.entityId, current.entityId),
                eq(changeLogs.parentVersion, current.version),
            ),
            orderBy: [desc(changeLogs.version)],
        });

        // Get merged versions
        let mergedVersions: (typeof changeLogs.$inferSelect)[] = [];
        if (includeMergedVersions && current.mergedFromVersion !== null) {
            const merged = await db.query.changeLogs.findFirst({
                where: and(
                    eq(changeLogs.entityId, current.entityId),
                    eq(changeLogs.version, current.mergedFromVersion),
                ),
            });
            if (merged) mergedVersions = [merged];
        }

        // Get superseded versions
        const supersededVersions = await db.query.changeLogs.findMany({
            where: and(
                eq(changeLogs.entityId, current.entityId),
                eq(changeLogs.supersededBy, current.version),
            ),
            orderBy: [desc(changeLogs.version)],
        });

        return {
            data: {
                current,
                parent,
                children,
                mergedVersions,
                supersededVersions,
            },
        };
    } catch (e: any) {
        logger.error('_findRelatedChanges ERROR', e.message);
        return {
            data: {
                current: {} as any,
                children: [],
                mergedVersions: [],
                supersededVersions: [],
            },
            errors: [e.message],
        };
    }
}
