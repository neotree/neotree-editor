import { and, eq } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import logger from "@/lib/logger";
import { appUpdatePolicies, deviceRolloutStates } from "@/databases/pg/schema";
import { shouldAutoHaltRollout, summarizeRolloutHealth } from "@/lib/app-updates/rollout-health";

/**
 * Auto-halt evaluation (#5): when a release's post-install health regresses past a
 * policy's thresholds, freeze that policy's rollout so no further devices receive
 * the bad build. Idempotent and conservative — it only halts policies that
 * currently serve this release, are not already halted, and have a large enough
 * sample. It never un-halts (recovery is a deliberate admin action).
 *
 * Intended to be called from the device telemetry ingestion path on failure/rollback
 * events; safe to call on every such event (it short-circuits cheaply).
 */
export async function _evaluateApkRolloutAutoHalt(apkReleaseId?: string | null): Promise<{ halted: string[] }> {
    const halted: string[] = [];
    if (!apkReleaseId) return { halted };

    try {
        const policies = await db.query.appUpdatePolicies.findMany({
            where: and(
                eq(appUpdatePolicies.currentApkReleaseId, apkReleaseId),
                eq(appUpdatePolicies.apkRolloutHalted, false),
            ),
        });
        if (!policies.length) return { halted };

        const rows = await db.query.deviceRolloutStates.findMany({
            where: eq(deviceRolloutStates.apkReleaseId, apkReleaseId),
        });

        for (const policy of policies) {
            const health = summarizeRolloutHealth(rows, { stallHours: policy.apkHealthCheckHours });
            const halt = shouldAutoHaltRollout(health, {
                thresholdPercent: policy.apkAutoHaltThresholdPercent,
                minDevices: policy.apkAutoHaltMinDevices,
            });
            if (!halt) continue;

            const reason = `Auto-halted: ${health.failed + health.rolledBack}/${health.total} devices failed `
                + `(${Math.round(health.failureRate * 100)}% ≥ ${policy.apkAutoHaltThresholdPercent}% threshold)`;

            await db
                .update(appUpdatePolicies)
                .set({ apkRolloutHalted: true, apkRolloutHaltedReason: reason })
                .where(eq(appUpdatePolicies.policyId, policy.policyId));

            halted.push(policy.policyId);
            logger.error("_evaluateApkRolloutAutoHalt halted policy", JSON.stringify({ policyId: policy.policyId, apkReleaseId, reason }));
        }
    } catch (e: any) {
        logger.error("_evaluateApkRolloutAutoHalt ERROR", e.message);
    }

    return { halted };
}
