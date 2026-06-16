import { eq } from "drizzle-orm";
import * as uuid from "uuid";

import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import { appUpdatePolicies, appUpdatePoliciesDrafts } from "@/databases/pg/schema";
import socket from "@/lib/socket";
import { normalizeAppUpdatePolicyPayload, validateAppUpdatePolicyPayload } from "@/lib/app-updates/validation";
import { resolvePolicyReleaseReferences } from "@/lib/app-updates/policy-release-resolution";

export type SaveAppUpdatePoliciesData = Partial<typeof appUpdatePolicies.$inferInsert>;

export type SaveAppUpdatePoliciesResponse = {
    success: boolean;
    errors?: string[];
};

export async function _saveAppUpdatePolicies({ data, broadcastAction = true, userId }: {
    data: SaveAppUpdatePoliciesData[];
    broadcastAction?: boolean;
    userId?: string;
}): Promise<SaveAppUpdatePoliciesResponse> {
    const response: SaveAppUpdatePoliciesResponse = { success: false };

    try {
        const errors: string[] = [];

        for (const { policyId: itemPolicyId, ...item } of data) {
            const { countryISO: _countryISO, ...cleanItem } = item as any;
            try {
                const published = await db.query.appUpdatePolicies.findFirst();

                const policyId = itemPolicyId || published?.policyId || uuid.v4();

                const normalizedItem = normalizeAppUpdatePolicyPayload(cleanItem);
                const { resolvedPolicy, releasesById, errors: resolutionErrors } = await resolvePolicyReleaseReferences(db, normalizedItem);
                const validationErrors = [...resolutionErrors, ...validateAppUpdatePolicyPayload(resolvedPolicy, releasesById)];
                if (validationErrors.length) throw new Error(validationErrors.join(", "));

                const draft = await db.query.appUpdatePoliciesDrafts.findFirst({
                    where: eq(appUpdatePoliciesDrafts.policyDraftId, policyId),
                });

                if (draft) {
                    const merged = {
                        ...draft.data,
                        ...resolvedPolicy,
                        policyId,
                    } as typeof appUpdatePolicies.$inferInsert;

                    await db
                        .update(appUpdatePoliciesDrafts)
                        .set({ data: merged })
                        .where(eq(appUpdatePoliciesDrafts.policyDraftId, policyId));
                } else {
                    const merged = {
                        ...(published || {}),
                        ...resolvedPolicy,
                        policyId,
                    } as typeof appUpdatePolicies.$inferInsert;

                    await db.insert(appUpdatePoliciesDrafts).values({
                        data: merged,
                        policyDraftId: policyId,
                        policyId: published?.policyId,
                        createdByUserId: userId,
                    });
                }
            } catch (e: any) {
                logger.error("_saveAppUpdatePolicies item ERROR", JSON.stringify({
                    policyId: itemPolicyId || null,
                    message: e.message,
                }));
                errors.push(e.message);
            }
        }

        if (errors.length) {
            response.errors = errors;
        } else {
            response.success = true;
        }
    } catch (e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error("_saveAppUpdatePolicies ERROR", e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction) socket.emit("data_changed", "save_app_update_policies");
        return response;
    }
}
