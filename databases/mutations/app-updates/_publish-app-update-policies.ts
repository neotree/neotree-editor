import { eq, inArray } from "drizzle-orm";

import { _saveChangeLogs, type SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log";
import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import type { DbOrTransaction } from "@/databases/pg/db-client";
import { appUpdatePolicies, appUpdatePoliciesDrafts } from "@/databases/pg/schema";
import { normalizeAppUpdatePolicyPayload, validateAppUpdatePolicyPayload } from "@/lib/app-updates/validation";
import { resolvePolicyReleaseReferences } from "@/lib/app-updates/policy-release-resolution";

type PublishedMdmRolloutPolicy = typeof appUpdatePolicies.$inferSelect;

export async function _publishAppUpdatePolicies(opts?: {
    userId?: string | null;
    dataVersion?: number | null;
    client?: DbOrTransaction;
}): Promise<{ success: boolean; errors?: string[]; mdmRolloutPolicies?: PublishedMdmRolloutPolicy[] }> {
    const results: { success: boolean; errors?: string[]; mdmRolloutPolicies?: PublishedMdmRolloutPolicy[] } = { success: false };
    const errors: string[] = [];
    const changeLogs: SaveChangeLogData[] = [];
    const publishedDraftIds: string[] = [];
    const mdmRolloutPolicies: PublishedMdmRolloutPolicy[] = [];

    try {
        const executor = opts?.client || db;
        const drafts = await executor.query.appUpdatePoliciesDrafts.findMany({
            where: opts?.userId ? eq(appUpdatePoliciesDrafts.createdByUserId, opts.userId) : undefined,
        });

        for (const draft of drafts) {
            try {
                const policyId = draft.policyId || draft.data.policyId || draft.policyDraftId;
                const { countryISO: _countryISO, ...rawPayload } = { ...draft.data, policyId } as any;
                const normalizedPayload = normalizeAppUpdatePolicyPayload(rawPayload);
                const { resolvedPolicy, releasesById, errors: resolutionErrors } = await resolvePolicyReleaseReferences(executor, normalizedPayload);
                const payload = resolvedPolicy;
                const validationErrors = [...resolutionErrors, ...validateAppUpdatePolicyPayload(payload, releasesById)];
                if (validationErrors.length) throw new Error(validationErrors.join(", "));

                const existing = await executor.query.appUpdatePolicies.findFirst({
                    where: eq(appUpdatePolicies.policyId, policyId),
                    columns: { policyVersion: true },
                });

                const policyVersion = existing?.policyVersion ? existing.policyVersion + 1 : (payload.policyVersion || 1);

                if (existing) {
                    await executor
                        .update(appUpdatePolicies)
                        .set({
                            ...payload,
                            policyVersion,
                        })
                        .where(eq(appUpdatePolicies.policyId, policyId));
                } else {
                    await executor.insert(appUpdatePolicies).values({
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

                if (payload.apkDeliveryMode === "mdm" || payload.apkDeliveryMode === "hybrid") {
                    mdmRolloutPolicies.push({
                        ...payload,
                        policyId,
                        policyVersion,
                    } as PublishedMdmRolloutPolicy);
                }
                publishedDraftIds.push(draft.policyDraftId);
            } catch (e: any) {
                logger.error("_publishAppUpdatePolicies item ERROR", JSON.stringify({
                    draftId: draft.policyDraftId,
                    policyId: draft.policyId || draft.data?.policyId || null,
                    message: e.message,
                }));
                if (opts?.client) {
                    throw e;
                }
                errors.push(e.message);
            }
        }

        if (publishedDraftIds.length) {
            await executor
                .delete(appUpdatePoliciesDrafts)
                .where(inArray(appUpdatePoliciesDrafts.policyDraftId, publishedDraftIds));
        }

        if (changeLogs.length && Number.isFinite(opts?.dataVersion)) {
            const saveResult = await _saveChangeLogs({
                data: changeLogs,
                allowPartial: !opts?.client,
                client: executor,
            });
            if (saveResult.errors?.length) {
                logger.error("_publishAppUpdatePolicies changelog warnings", saveResult.errors.join(", "));
            }
        }

        if (errors.length) {
            results.errors = errors;
        } else {
            results.success = true;
        }
        results.mdmRolloutPolicies = mdmRolloutPolicies;
    } catch (e: any) {
        results.success = false;
        results.errors = [e.message];
        logger.error("_publishAppUpdatePolicies ERROR", e.message);
    }

    return results;
}
