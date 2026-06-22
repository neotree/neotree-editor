import { and, desc, eq, inArray, count, isNull, isNotNull } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { appUpdatePolicies, apkReleases, appUpdatePoliciesDrafts, apkReleasesDrafts, deviceMdmLinks, deviceRolloutStates } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { deviceBelongsToMdmGroup, getMdmGroupIds } from "@/lib/mdm/group-membership";
import { shouldServeCanaryRelease } from "@/lib/app-updates/rollout-canary";
import { summarizeRolloutHealth, type RolloutHealth } from "@/lib/app-updates/rollout-health";

export type AppUpdatePolicy = (typeof appUpdatePolicies.$inferSelect) & {
    currentApkRelease?: (typeof apkReleases.$inferSelect) | null;
    rollbackApkRelease?: (typeof apkReleases.$inferSelect) | null;
};

export type GetAppUpdatePolicyResult = {
    data: AppUpdatePolicy | null;
    errors?: string[];
};

/**
 * Resolves the targeting context for a device so that we can apply a policy's
 * targetScope (#1). Hospital + MDM group come from the device's MDM link when
 * present; the caller (mobile request) may also pass its own hospital/country.
 */
async function resolveDeviceTargeting(params: {
    deviceId?: string;
    hospitalId?: string | null;
    countryISO?: string | null;
}) {
    let hospitalId = params.hospitalId || null;
    let countryISO = params.countryISO || null;
    let mdmGroupId: string | null = null;
    let mdmGroupIds: string[] = [];

    if (params.deviceId) {
        try {
            const link = await db.query.deviceMdmLinks.findFirst({
                where: eq(deviceMdmLinks.deviceId, params.deviceId),
                orderBy: [desc(deviceMdmLinks.updatedAt)],
            });
            if (link) {
                hospitalId = hospitalId || link.hospitalId || null;
                countryISO = countryISO || link.countryISO || null;
                mdmGroupId = link.mdmGroupId || null;
                mdmGroupIds = getMdmGroupIds(link);
            }
        } catch (e: any) {
            logger.error("resolveDeviceTargeting ERROR", e.message);
        }
    }

    return { hospitalId, countryISO, mdmGroupId, mdmGroupIds };
}

/**
 * Score a policy against a device's targeting context. Returns null when the
 * policy explicitly targets a hospital/group that this device is NOT in (so it
 * must be excluded). More specific matches score higher so a hospital-targeted
 * policy wins over a country-wide one for the same runtime.
 */
function scorePolicyForDevice(
    policy: typeof appUpdatePolicies.$inferSelect,
    targeting: { hospitalId: string | null; mdmGroupId: string | null; mdmGroupIds: string[]; countryISO: string | null },
): number | null {
    // Country gate (#3): if the policy is pinned to a country and we know the
    // device's country, they must match. Unknown device country = lenient (don't
    // exclude) so offline devices that don't report country still get updates.
    if (policy.targetCountryISO && targeting.countryISO &&
        policy.targetCountryISO.toUpperCase() !== targeting.countryISO.toUpperCase()) {
        return null;
    }

    const scope = policy.targetScope || "country";

    if (scope === "hospital") {
        if (!policy.targetHospitalId) return null;
        return policy.targetHospitalId === targeting.hospitalId ? 100 : null;
    }
    if (scope === "group") {
        if (!policy.targetGroupId) return null;
        return deviceBelongsToMdmGroup({
            mdmGroupId: targeting.mdmGroupId,
            deviceCapabilities: { groups: { ids: targeting.mdmGroupIds } },
        }, policy.targetGroupId) ? 80 : null;
    }
    // country / default scope applies to everyone.
    return 10;
}

export async function _getAppUpdatePolicy(params?: {
    runtimeVersion?: string;
    deviceId?: string;
    hospitalId?: string | null;
    countryISO?: string | null;
}): Promise<GetAppUpdatePolicyResult> {
    try {
        const runtimeVersion = params?.runtimeVersion?.trim();
        const candidates = await db.query.appUpdatePolicies.findMany({
            where: runtimeVersion ? eq(appUpdatePolicies.runtimeVersion, runtimeVersion) : undefined,
            with: {
                currentApkRelease: true,
                rollbackApkRelease: true,
            },
            orderBy: [desc(appUpdatePolicies.policyVersion), desc(appUpdatePolicies.updatedAt)],
        });

        if (!candidates.length) return { data: null };

        const targeting = await resolveDeviceTargeting({
            deviceId: params?.deviceId,
            hospitalId: params?.hospitalId,
            countryISO: params?.countryISO,
        });

        let best: { policy: AppUpdatePolicy; score: number } | null = null;
        for (const policy of candidates) {
            const score = scorePolicyForDevice(policy, targeting);
            if (score === null) continue; // device is outside this policy's target
            // candidates are already ordered by policyVersion/updatedAt desc, so the
            // first policy at a given score wins the tie-break naturally.
            if (!best || score > best.score) best = { policy, score };
        }

        if (!best?.policy) return { data: null };

        // Staged canary + auto-halt (#5): a device outside the current rollout
        // percentage — or any device once the rollout is halted — is served the
        // policy WITHOUT a current APK release, so it stays on its version. The
        // rollback release is left intact so a halt can actively pull devices back.
        const policy = best.policy;
        const served = shouldServeCanaryRelease({
            deviceId: params?.deviceId,
            apkReleaseId: policy.currentApkReleaseId,
            percentage: policy.apkRolloutPercentage,
            halted: policy.apkRolloutHalted,
        });
        if (!served && (policy.currentApkRelease || policy.currentApkReleaseId)) {
            return { data: { ...policy, currentApkRelease: null, currentApkReleaseId: null } };
        }

        return { data: policy };
    } catch (e: any) {
        logger.error("_getAppUpdatePolicy ERROR", e.message);
        return { data: null, errors: [e.message] };
    }
}

export type ApkRolloutHealthResult = {
    data: (RolloutHealth & { apkReleaseId: string; stalledDevices: { deviceId: string; rolloutState: string; updatedAt: Date | null }[] }) | null;
    errors?: string[];
};

/**
 * Fleet rollout observability (#6): aggregates per-device rollout states for a
 * release into download/install/failure/stall counts, plus the list of stuck
 * devices operators need to chase. `stallHours` defines how long a download/install
 * may sit without progress before it counts as stalled.
 */
export async function _getApkRolloutHealth(params: {
    apkReleaseId: string;
    stallHours?: number;
}): Promise<ApkRolloutHealthResult> {
    try {
        if (!params.apkReleaseId) return { data: null };
        const rows = await db.query.deviceRolloutStates.findMany({
            where: eq(deviceRolloutStates.apkReleaseId, params.apkReleaseId),
        });

        const health = summarizeRolloutHealth(rows, { stallHours: params.stallHours });

        const stallMs = Math.max(1, params.stallHours ?? 6) * 60 * 60 * 1000;
        const now = Date.now();
        const stalledDevices = rows
            .filter((row) => {
                if (row.rolloutState !== "download_started" && row.rolloutState !== "install_started") return false;
                const updated = row.updatedAt ? new Date(row.updatedAt).getTime() : null;
                return updated !== null && now - updated >= stallMs;
            })
            .map((row) => ({ deviceId: row.deviceId, rolloutState: row.rolloutState, updatedAt: row.updatedAt || null }));

        return { data: { apkReleaseId: params.apkReleaseId, ...health, stalledDevices } };
    } catch (e: any) {
        logger.error("_getApkRolloutHealth ERROR", e.message);
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
            orderBy: [desc(apkReleases.versionCode), desc(apkReleases.updatedAt)],
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
