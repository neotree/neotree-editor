import { eq } from "drizzle-orm";

import { _saveChangeLogs, type SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log";
import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import { appUpdatePolicies, appUpdatePoliciesDrafts } from "@/databases/pg/schema";

export async function _publishAppUpdatePolicies(opts?: {
    userId?: string | null;
    dataVersion?: number | null;
}): Promise<{ success: boolean; errors?: string[] }> {
    const results: { success: boolean; errors?: string[] } = { success: false };
    const errors: string[] = [];
    const changeLogs: SaveChangeLogData[] = [];

    try {
        const drafts = await db.query.appUpdatePoliciesDrafts.findMany({
            where: opts?.userId ? eq(appUpdatePoliciesDrafts.createdByUserId, opts.userId) : undefined,
        });

        for (const draft of drafts) {
            try {
                const policyId = draft.policyId || draft.data.policyId || draft.policyDraftId;
                const { countryISO: _countryISO, ...payload } = { ...draft.data, policyId } as any;

                const existing = await db.query.appUpdatePolicies.findFirst({
                    where: eq(appUpdatePolicies.policyId, policyId),
                    columns: { policyVersion: true },
                });

                const policyVersion = existing?.policyVersion ? existing.policyVersion + 1 : (payload.policyVersion || 1);

                if (existing) {
                    await db
                        .update(appUpdatePolicies)
                        .set({
                            ...payload,
                            policyVersion,
                        })
                        .where(eq(appUpdatePolicies.policyId, policyId));
                } else {
                    await db.insert(appUpdatePolicies).values({
                        ...payload,
                        policyId,
                        policyVersion,
                    });
                }

                if (opts?.userId) {
                    const snapshot = structuredClone(payload);
                    changeLogs.push({
                        entityId: policyId,
                        entityType: "app_update_policy",
                        action: "publish",
                        version: policyVersion,
                        dataVersion: opts.dataVersion,
                        changes: [{
                            action: "publish",
                            description: `App update policy published`,
                        }],
                        fullSnapshot: snapshot,
                        previousSnapshot: snapshot,
                        baselineSnapshot: snapshot,
                        description: `App update policy published`,
                        changeReason: `App update policy published`,
                        userId: opts.userId,
                    });
                }
            } catch (e: any) {
                errors.push(e.message);
            }
        }

        await db
            .delete(appUpdatePoliciesDrafts)
            .where(opts?.userId ? eq(appUpdatePoliciesDrafts.createdByUserId, opts.userId) : undefined);

        if (changeLogs.length && Number.isFinite(opts?.dataVersion)) {
            const saveResult = await _saveChangeLogs({ data: changeLogs, allowPartial: true });
            if (saveResult.errors?.length) {
                logger.error("_publishAppUpdatePolicies changelog warnings", saveResult.errors.join(", "));
            }
        }

        if (errors.length) {
            results.errors = errors;
        } else {
            results.success = true;
        }
    } catch (e: any) {
        results.success = false;
        results.errors = [e.message];
        logger.error("_publishAppUpdatePolicies ERROR", e.message);
    }

    return results;
}
