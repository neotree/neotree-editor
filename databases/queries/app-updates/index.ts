import { and, inArray, count, isNull, isNotNull } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { appUpdatePolicies, apkReleases, appUpdatePoliciesDrafts, apkReleasesDrafts } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type AppUpdatePolicy = (typeof appUpdatePolicies.$inferSelect) & {
    currentApkRelease?: (typeof apkReleases.$inferSelect) | null;
    rollbackApkRelease?: (typeof apkReleases.$inferSelect) | null;
};

export type GetAppUpdatePolicyResult = {
    data: AppUpdatePolicy | null;
    errors?: string[];
};

export async function _getAppUpdatePolicy(): Promise<GetAppUpdatePolicyResult> {
    try {
        const data = await db.query.appUpdatePolicies.findFirst({
            where: undefined,
            with: {
                currentApkRelease: true,
                rollbackApkRelease: true,
            },
        });

        return { data: data || null };
    } catch (e: any) {
        logger.error("_getAppUpdatePolicy ERROR", e.message);
        return { data: null, errors: [e.message] };
    }
}

export type AppUpdatePolicyDraft = typeof appUpdatePoliciesDrafts.$inferSelect;

export type GetAppUpdatePolicyDraftsResult = {
    data: AppUpdatePolicyDraft[];
    errors?: string[];
};

export async function _getAppUpdatePolicyDrafts(params?: {
}): Promise<GetAppUpdatePolicyDraftsResult> {
    try {
        const drafts = await db.query.appUpdatePoliciesDrafts.findMany();
        return { data: drafts };
    } catch (e: any) {
        logger.error("_getAppUpdatePolicyDrafts ERROR", e.message);
        return { data: [], errors: [e.message] };
    }
}

export type ApkReleaseDraft = typeof apkReleasesDrafts.$inferSelect;

export type GetApkReleaseDraftsParams = {
    statuses?: string[];
};

export type GetApkReleaseDraftsResult = {
    data: ApkReleaseDraft[];
    errors?: string[];
};

export async function _getApkReleaseDrafts(params?: GetApkReleaseDraftsParams): Promise<GetApkReleaseDraftsResult> {
    try {
        const { statuses = [] } = { ...params };
        const drafts = await db.query.apkReleasesDrafts.findMany();

        const data = drafts.filter((draft) => {
            const payload = draft.data as any;
            const matchesStatus = !statuses.length || statuses.includes(payload?.status);
            return matchesStatus;
        });

        return { data };
    } catch (e: any) {
        logger.error("_getApkReleaseDrafts ERROR", e.message);
        return { data: [], errors: [e.message] };
    }
}

export type GetApkReleasesParams = {
    apkReleaseIds?: string[];
    statuses?: string[];
};

export type GetApkReleasesResult = {
    data: (typeof apkReleases.$inferSelect)[];
    errors?: string[];
};

export async function _getApkReleases(params?: GetApkReleasesParams): Promise<GetApkReleasesResult> {
    try {
        const { apkReleaseIds = [], statuses = [] } = { ...params };

        const where = [
            ...(!apkReleaseIds.length ? [] : [inArray(apkReleases.apkReleaseId, apkReleaseIds)]),
            ...(!statuses.length ? [] : [inArray(apkReleases.status, statuses as any)]),
        ];

        const data = await db.query.apkReleases.findMany({
            where: !where.length ? undefined : and(...where),
        });

        return { data };
    } catch (e: any) {
        logger.error("_getApkReleases ERROR", e.message);
        return { data: [], errors: [e.message] };
    }
}

export type CountAppUpdatePoliciesResults = {
    data: {
        allPublished: number;
        publishedWithDrafts: number;
        allDrafts: number;
        newDrafts: number;
    };
    errors?: string[];
};

export const _defaultAppUpdatePoliciesCount = {
    allPublished: 0,
    publishedWithDrafts: 0,
    allDrafts: 0,
    newDrafts: 0,
} satisfies CountAppUpdatePoliciesResults["data"];

export async function _countAppUpdatePolicies(): Promise<CountAppUpdatePoliciesResults> {
    try {
        const [{ count: allDrafts }] = await db.select({ count: count() }).from(appUpdatePoliciesDrafts);
        const [{ count: newDrafts }] = await db.select({ count: count() }).from(appUpdatePoliciesDrafts).where(isNull(appUpdatePoliciesDrafts.policyId));
        const [{ count: publishedWithDrafts }] = await db.select({ count: count() }).from(appUpdatePoliciesDrafts).where(isNotNull(appUpdatePoliciesDrafts.policyId));
        const [{ count: allPublished }] = await db.select({ count: count() }).from(appUpdatePolicies);

        return {
            data: {
                allPublished,
                publishedWithDrafts,
                allDrafts,
                newDrafts,
            },
        };
    } catch (e: any) {
        logger.error("_countAppUpdatePolicies ERROR", e.message);
        return { data: _defaultAppUpdatePoliciesCount, errors: [e.message] };
    }
}

export type CountApkReleasesResults = {
    data: {
        allPublished: number;
        publishedWithDrafts: number;
        allDrafts: number;
        newDrafts: number;
    };
    errors?: string[];
};

export const _defaultApkReleasesCount = {
    allPublished: 0,
    publishedWithDrafts: 0,
    allDrafts: 0,
    newDrafts: 0,
} satisfies CountApkReleasesResults["data"];

export async function _countApkReleases(): Promise<CountApkReleasesResults> {
    try {
        const [{ count: allDrafts }] = await db.select({ count: count() }).from(apkReleasesDrafts);
        const [{ count: newDrafts }] = await db.select({ count: count() }).from(apkReleasesDrafts).where(isNull(apkReleasesDrafts.apkReleaseId));
        const [{ count: publishedWithDrafts }] = await db.select({ count: count() }).from(apkReleasesDrafts).where(isNotNull(apkReleasesDrafts.apkReleaseId));
        const [{ count: allPublished }] = await db.select({ count: count() }).from(apkReleases);

        return {
            data: {
                allPublished,
                publishedWithDrafts,
                allDrafts,
                newDrafts,
            },
        };
    } catch (e: any) {
        logger.error("_countApkReleases ERROR", e.message);
        return { data: _defaultApkReleasesCount, errors: [e.message] };
    }
}
