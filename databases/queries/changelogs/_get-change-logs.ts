import { and, eq, inArray, desc, asc, sql } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { changeLogs, users, scripts, screens, diagnoses, configKeys, drugsLibrary, dataKeys, aliases } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type GetChangeLogsParams = {
    changeLogIds?: string[];
    entityIds?: string[];
    entityTypes?: (typeof changeLogs.$inferSelect)['entityType'][];
    userIds?: string[];
    actions?: (typeof changeLogs.$inferSelect)['action'][];
    isActiveOnly?: boolean;
    versions?: number[];
    scriptIds?: string[];
    screenIds?: string[];
    diagnosisIds?: string[];
    limit?: number;
    offset?: number;
    sortBy?: 'dateOfChange' | 'version';
    sortOrder?: 'asc' | 'desc';
};

export type ChangeLogType = typeof changeLogs.$inferSelect & {
    userName?: string;
    userEmail?: string;
    entityName?: string;
};

export type GetChangeLogsResults = {
    data: ChangeLogType[];
    total?: number;
    errors?: string[];
};

export async function _getChangeLogs(
    params?: GetChangeLogsParams
): Promise<GetChangeLogsResults> {
    try {
        let {
            changeLogIds = [],
            entityIds = [],
            entityTypes = [],
            userIds = [],
            actions = [],
            isActiveOnly = false,
            versions = [],
            scriptIds = [],
            screenIds = [],
            diagnosisIds = [],
            limit,
            offset,
            sortBy = 'dateOfChange',
            sortOrder = 'desc',
        } = { ...params };

        // Filter valid UUIDs
        changeLogIds = changeLogIds.filter(id => uuid.validate(id));
        entityIds = entityIds.filter(id => uuid.validate(id));
        userIds = userIds.filter(id => uuid.validate(id));
        scriptIds = scriptIds.filter(id => uuid.validate(id));
        screenIds = screenIds.filter(id => uuid.validate(id));
        diagnosisIds = diagnosisIds.filter(id => uuid.validate(id));

        const changeLogsRes = await db
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
                !changeLogIds.length ? undefined : inArray(changeLogs.changeLogId, changeLogIds),
                !entityIds.length ? undefined : inArray(changeLogs.entityId, entityIds),
                !entityTypes.length ? undefined : inArray(changeLogs.entityType, entityTypes),
                !userIds.length ? undefined : inArray(changeLogs.userId, userIds),
                !actions.length ? undefined : inArray(changeLogs.action, actions),
                !versions.length ? undefined : inArray(changeLogs.version, versions),
                !scriptIds.length ? undefined : inArray(changeLogs.scriptId, scriptIds),
                !screenIds.length ? undefined : inArray(changeLogs.screenId, screenIds),
                !diagnosisIds.length ? undefined : inArray(changeLogs.diagnosisId, diagnosisIds),
                isActiveOnly ? eq(changeLogs.isActive, true) : undefined,
            ))
            .orderBy(
                sortOrder === 'desc'
                    ? desc(changeLogs[sortBy])
                    : asc(changeLogs[sortBy])
            )
            .limit(limit || 1000)
            .offset(offset || 0);

        const responseData = changeLogsRes.map(item => ({
            ...item.changeLog,
            userName: item.user?.name || '',
            userEmail: item.user?.email || '',
        }));

        return {
            data: responseData,
            total: responseData.length,
        };
    } catch (e: any) {
        logger.error('_getChangeLogs ERROR', e.message);
        return { data: [], errors: [e.message] };
    }
}

export type GetChangeLogResults = {
    data?: null | ChangeLogType;
    errors?: string[];
};

export async function _getChangeLog(
    params: {
        changeLogId?: string;
        entityId?: string;
        version?: number;
    }
): Promise<GetChangeLogResults> {
    const { changeLogId, entityId, version } = { ...params };

    try {
        if (!changeLogId && (!entityId || version === undefined)) {
            throw new Error('Missing changeLogId or entityId+version');
        }

        const whereChangeLogId = changeLogId && uuid.validate(changeLogId)
            ? eq(changeLogs.changeLogId, changeLogId)
            : undefined;

        const whereEntityAndVersion = entityId && version !== undefined
            ? and(
                eq(changeLogs.entityId, entityId),
                eq(changeLogs.version, version)
            )
            : undefined;

        const changeLogRes = await db
            .select({
                changeLog: changeLogs,
                user: {
                    name: users.displayName,
                    email: users.email,
                },
            })
            .from(changeLogs)
            .leftJoin(users, eq(users.userId, changeLogs.userId))
            .where(whereChangeLogId || whereEntityAndVersion)
            .limit(1);

        if (!changeLogRes[0]) return { data: null };

        const responseData = {
            ...changeLogRes[0].changeLog,
            userName: changeLogRes[0].user?.name || '',
            userEmail: changeLogRes[0].user?.email || '',
        };

        return { data: responseData };
    } catch (e: any) {
        logger.error('_getChangeLog ERROR', e.message);
        return { errors: [e.message] };
    }
}

export type GetEntityHistoryParams = {
    entityId: string;
    entityType?: (typeof changeLogs.$inferSelect)['entityType'];
    includeInactive?: boolean;
    limit?: number;
};

export type GetEntityHistoryResults = {
    data: ChangeLogType[];
    currentVersion?: number;
    errors?: string[];
};

export async function _getEntityHistory(
    params: GetEntityHistoryParams
): Promise<GetEntityHistoryResults> {
    const { entityId, entityType, includeInactive = false, limit } = { ...params };

    try {
        if (!entityId || !uuid.validate(entityId)) {
            throw new Error('Invalid entityId');
        }

        const historyRes = await db
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
                eq(changeLogs.entityId, entityId),
                entityType ? eq(changeLogs.entityType, entityType) : undefined,
                !includeInactive ? eq(changeLogs.isActive, true) : undefined,
            ))
            .orderBy(desc(changeLogs.version))
            .limit(limit || 100);

        const responseData = historyRes.map(item => ({
            ...item.changeLog,
            userName: item.user?.name || '',
            userEmail: item.user?.email || '',
        }));

        const currentVersion = responseData.length > 0 
            ? Math.max(...responseData.map(item => item.version))
            : undefined;

        return {
            data: responseData,
            currentVersion,
        };
    } catch (e: any) {
        logger.error('_getEntityHistory ERROR', e.message);
        return { data: [], errors: [e.message] };
    }
}

export type GetActiveVersionParams = {
    entityId: string;
    entityType?: (typeof changeLogs.$inferSelect)['entityType'];
};

export type GetActiveVersionResults = {
    data?: null | ChangeLogType;
    errors?: string[];
};

export async function _getActiveVersion(
    params: GetActiveVersionParams
): Promise<GetActiveVersionResults> {
    const { entityId, entityType } = { ...params };

    try {
        if (!entityId || !uuid.validate(entityId)) {
            throw new Error('Invalid entityId');
        }

        const activeVersionRes = await db
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
                eq(changeLogs.entityId, entityId),
                eq(changeLogs.isActive, true),
                entityType ? eq(changeLogs.entityType, entityType) : undefined,
            ))
            .orderBy(desc(changeLogs.version))
            .limit(1);

        if (!activeVersionRes[0]) return { data: null };

        const responseData = {
            ...activeVersionRes[0].changeLog,
            userName: activeVersionRes[0].user?.name || '',
            userEmail: activeVersionRes[0].user?.email || '',
        };

        return { data: responseData };
    } catch (e: any) {
        logger.error('_getActiveVersion ERROR', e.message);
        return { errors: [e.message] };
    }
}

export type GetVersionChainParams = {
    entityId: string;
    fromVersion?: number;
    includeInactive?: boolean;
};

export type GetVersionChainResults = {
    data: ChangeLogType[];
    errors?: string[];
};

export async function _getVersionChain(
    params: GetVersionChainParams
): Promise<GetVersionChainResults> {
    const { entityId, fromVersion, includeInactive = false } = { ...params };

    try {
        if (!entityId || !uuid.validate(entityId)) {
            throw new Error('Invalid entityId');
        }

        // Get starting version
        let currentVersion = fromVersion;
        if (!currentVersion) {
            const latestRes = await db
                .select({ version: changeLogs.version })
                .from(changeLogs)
                .where(eq(changeLogs.entityId, entityId))
                .orderBy(desc(changeLogs.version))
                .limit(1);
            
            currentVersion = latestRes[0]?.version;
        }

        if (!currentVersion) return { data: [] };

        const chain: ChangeLogType[] = [];
        let nextVersion: number | null = currentVersion;

        // Traverse the version chain backwards
        while (nextVersion !== null) {
            const versionRes = await db
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
                    eq(changeLogs.entityId, entityId),
                    eq(changeLogs.version, nextVersion),
                    !includeInactive ? eq(changeLogs.isActive, true) : undefined,
                ))
                .limit(1);

            if (!versionRes[0]) break;

            chain.push({
                ...versionRes[0].changeLog,
                userName: versionRes[0].user?.name || '',
                userEmail: versionRes[0].user?.email || '',
            });

            nextVersion = versionRes[0].changeLog.parentVersion;
        }

        return { data: chain };
    } catch (e: any) {
        logger.error('_getVersionChain ERROR', e.message);
        return { data: [], errors: [e.message] };
    }
}

export type GetChangeLogStatsParams = {
    entityId?: string;
    entityType?: (typeof changeLogs.$inferSelect)['entityType'];
    userId?: string;
    startDate?: Date;
    endDate?: Date;
};

export type GetChangeLogStatsResults = {
    data: {
        totalChanges: number;
        byAction: Record<string, number>;
        byUser: Record<string, number>;
        byEntityType: Record<string, number>;
    };
    errors?: string[];
};

export async function _getChangeLogStats(
    params?: GetChangeLogStatsParams
): Promise<GetChangeLogStatsResults> {
    try {
        const { entityId, entityType, userId, startDate, endDate } = { ...params };

        const statsRes = await db
            .select({
                action: changeLogs.action,
                entityType: changeLogs.entityType,
                userId: changeLogs.userId,
                count: sql<number>`count(*)::int`,
            })
            .from(changeLogs)
            .where(and(
                entityId ? eq(changeLogs.entityId, entityId) : undefined,
                entityType ? eq(changeLogs.entityType, entityType) : undefined,
                userId ? eq(changeLogs.userId, userId) : undefined,
                startDate ? sql`${changeLogs.dateOfChange} >= ${startDate}` : undefined,
                endDate ? sql`${changeLogs.dateOfChange} <= ${endDate}` : undefined,
            ))
            .groupBy(changeLogs.action, changeLogs.entityType, changeLogs.userId);

        const stats = {
            totalChanges: 0,
            byAction: {} as Record<string, number>,
            byUser: {} as Record<string, number>,
            byEntityType: {} as Record<string, number>,
        };

        statsRes.forEach(row => {
            stats.totalChanges += row.count;
            stats.byAction[row.action] = (stats.byAction[row.action] || 0) + row.count;
            stats.byEntityType[row.entityType] = (stats.byEntityType[row.entityType] || 0) + row.count;
            stats.byUser[row.userId] = (stats.byUser[row.userId] || 0) + row.count;
        });

        return { data: stats };
    } catch (e: any) {
        logger.error('_getChangeLogStats ERROR', e.message);
        return {
            data: {
                totalChanges: 0,
                byAction: {},
                byUser: {},
                byEntityType: {},
            },
            errors: [e.message],
        };
    }
}