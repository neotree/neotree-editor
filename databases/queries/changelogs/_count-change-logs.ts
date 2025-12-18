import { and, eq, inArray, sql, count } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { changeLogs } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type CountChangeLogsParams = {
    entityIds?: string[];
    entityTypes?: (typeof changeLogs.$inferSelect)['entityType'][];
    userIds?: string[];
    actions?: (typeof changeLogs.$inferSelect)['action'][];
    isActiveOnly?: boolean;
    scriptIds?: string[];
    screenIds?: string[];
    diagnosisIds?: string[];
    startDate?: Date;
    endDate?: Date;
};

export type CountChangeLogsResults = {
    count: number;
    errors?: string[];
};

export async function _countChangeLogs(
    params?: CountChangeLogsParams
): Promise<CountChangeLogsResults> {
    try {
        let {
            entityIds = [],
            entityTypes = [],
            userIds = [],
            actions = [],
            isActiveOnly = false,
            scriptIds = [],
            screenIds = [],
            diagnosisIds = [],
            startDate,
            endDate,
        } = { ...params };

        // Filter valid UUIDs
        entityIds = entityIds.filter(id => uuid.validate(id));
        userIds = userIds.filter(id => uuid.validate(id));
        scriptIds = scriptIds.filter(id => uuid.validate(id));
        screenIds = screenIds.filter(id => uuid.validate(id));
        diagnosisIds = diagnosisIds.filter(id => uuid.validate(id));

        const result = await db
            .select({ count: count() })
            .from(changeLogs)
            .where(and(
                !entityIds.length ? undefined : inArray(changeLogs.entityId, entityIds),
                !entityTypes.length ? undefined : inArray(changeLogs.entityType, entityTypes),
                !userIds.length ? undefined : inArray(changeLogs.userId, userIds),
                !actions.length ? undefined : inArray(changeLogs.action, actions),
                !scriptIds.length ? undefined : inArray(changeLogs.scriptId, scriptIds),
                !screenIds.length ? undefined : inArray(changeLogs.screenId, screenIds),
                !diagnosisIds.length ? undefined : inArray(changeLogs.diagnosisId, diagnosisIds),
                isActiveOnly ? eq(changeLogs.isActive, true) : undefined,
                startDate ? sql`${changeLogs.dateOfChange} >= ${startDate}` : undefined,
                endDate ? sql`${changeLogs.dateOfChange} <= ${endDate}` : undefined,
            ));

        return {
            count: result[0]?.count || 0,
        };
    } catch (e: any) {
        logger.error('_countChangeLogs ERROR', e.message);
        return { count: 0, errors: [e.message] };
    }
}

export type CountByEntityParams = {
    entityType?: (typeof changeLogs.$inferSelect)['entityType'];
    isActiveOnly?: boolean;
    startDate?: Date;
    endDate?: Date;
};

export type CountByEntityResults = {
    data: {
        entityId: string;
        entityType: string;
        totalVersions: number;
        activeVersions: number;
    }[];
    errors?: string[];
};

export async function _countChangeLogsByEntity(
    params?: CountByEntityParams
): Promise<CountByEntityResults> {
    try {
        const { entityType, isActiveOnly = false, startDate, endDate } = { ...params };

        const result = await db
            .select({
                entityId: changeLogs.entityId,
                entityType: changeLogs.entityType,
                totalVersions: count(),
                activeVersions: sql<number>`
                    count(*) FILTER (WHERE ${changeLogs.isActive} = true)::int
                `,
            })
            .from(changeLogs)
            .where(and(
                entityType ? eq(changeLogs.entityType, entityType) : undefined,
                isActiveOnly ? eq(changeLogs.isActive, true) : undefined,
                startDate ? sql`${changeLogs.dateOfChange} >= ${startDate}` : undefined,
                endDate ? sql`${changeLogs.dateOfChange} <= ${endDate}` : undefined,
            ))
            .groupBy(changeLogs.entityId, changeLogs.entityType);

        return {
            data: result,
        };
    } catch (e: any) {
        logger.error('_countChangeLogsByEntity ERROR', e.message);
        return { data: [], errors: [e.message] };
    }
}

export type CountByActionParams = {
    entityId?: string;
    entityType?: (typeof changeLogs.$inferSelect)['entityType'];
    userId?: string;
    startDate?: Date;
    endDate?: Date;
};

export type CountByActionResults = {
    data: {
        action: string;
        count: number;
    }[];
    errors?: string[];
};

export async function _countChangeLogsByAction(
    params?: CountByActionParams
): Promise<CountByActionResults> {
    try {
        const { entityId, entityType, userId, startDate, endDate } = { ...params };

        const result = await db
            .select({
                action: changeLogs.action,
                count: count(),
            })
            .from(changeLogs)
            .where(and(
                entityId && uuid.validate(entityId) ? eq(changeLogs.entityId, entityId) : undefined,
                entityType ? eq(changeLogs.entityType, entityType) : undefined,
                userId && uuid.validate(userId) ? eq(changeLogs.userId, userId) : undefined,
                startDate ? sql`${changeLogs.dateOfChange} >= ${startDate}` : undefined,
                endDate ? sql`${changeLogs.dateOfChange} <= ${endDate}` : undefined,
            ))
            .groupBy(changeLogs.action);

        return {
            data: result,
        };
    } catch (e: any) {
        logger.error('_countChangeLogsByAction ERROR', e.message);
        return { data: [], errors: [e.message] };
    }
}

export type CountByUserParams = {
    entityId?: string;
    entityType?: (typeof changeLogs.$inferSelect)['entityType'];
    action?: (typeof changeLogs.$inferSelect)['action'];
    startDate?: Date;
    endDate?: Date;
};

export type CountByUserResults = {
    data: {
        userId: string;
        count: number;
    }[];
    errors?: string[];
};

export async function _countChangeLogsByUser(
    params?: CountByUserParams
): Promise<CountByUserResults> {
    try {
        const { entityId, entityType, action, startDate, endDate } = { ...params };

        const result = await db
            .select({
                userId: changeLogs.userId,
                count: count(),
            })
            .from(changeLogs)
            .where(and(
                entityId && uuid.validate(entityId) ? eq(changeLogs.entityId, entityId) : undefined,
                entityType ? eq(changeLogs.entityType, entityType) : undefined,
                action ? eq(changeLogs.action, action) : undefined,
                startDate ? sql`${changeLogs.dateOfChange} >= ${startDate}` : undefined,
                endDate ? sql`${changeLogs.dateOfChange} <= ${endDate}` : undefined,
            ))
            .groupBy(changeLogs.userId);

        return {
            data: result,
        };
    } catch (e: any) {
        logger.error('_countChangeLogsByUser ERROR', e.message);
        return { data: [], errors: [e.message] };
    }
}

export type CountVersionsParams = {
    entityId: string;
    includeInactive?: boolean;
};

export type CountVersionsResults = {
    totalVersions: number;
    activeVersions: number;
    errors?: string[];
};

export async function _countEntityVersions(
    params: CountVersionsParams
): Promise<CountVersionsResults> {
    try {
        const { entityId, includeInactive = true } = { ...params };

        if (!entityId || !uuid.validate(entityId)) {
            throw new Error('Invalid entityId');
        }

        const result = await db
            .select({
                totalVersions: count(),
                activeVersions: sql<number>`
                    count(*) FILTER (WHERE ${changeLogs.isActive} = true)::int
                `,
            })
            .from(changeLogs)
            .where(and(
                eq(changeLogs.entityId, entityId),
                !includeInactive ? eq(changeLogs.isActive, true) : undefined,
            ));

        return {
            totalVersions: result[0]?.totalVersions || 0,
            activeVersions: result[0]?.activeVersions || 0,
        };
    } catch (e: any) {
        logger.error('_countEntityVersions ERROR', e.message);
        return { totalVersions: 0, activeVersions: 0, errors: [e.message] };
    }
}
