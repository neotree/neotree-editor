import { eq, inArray } from "drizzle-orm";

import { _saveChangeLogs, type SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log";
import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import type { DbOrTransaction } from "@/databases/pg/db-client";
import { apkReleases, apkReleasesDrafts, files } from "@/databases/pg/schema";
import { normalizeApkReleasePayload, validateApkReleasePayload } from "@/lib/app-updates/validation";

const validatedStatuses = new Set(["validated", "approved", "available"]);
const approvedStatuses = new Set(["approved", "available"]);

function withServerManagedReleaseDates(
    payload: typeof apkReleases.$inferInsert,
    previous?: Partial<typeof apkReleases.$inferInsert>,
): typeof apkReleases.$inferInsert {
    const now = new Date();
    const next = { ...payload };

    if (validatedStatuses.has(`${next.status || ""}`) && !next.validatedAt) {
        next.validatedAt = previous?.validatedAt || now;
    }
    if (approvedStatuses.has(`${next.status || ""}`) && !next.approvedAt) {
        next.approvedAt = previous?.approvedAt || now;
    }
    if (next.status === "available" && next.isAvailable && !next.releasedAt) {
        next.releasedAt = previous?.releasedAt || now;
    }

    return next;
}

export async function _publishApkReleases(opts?: {
    userId?: string | null;
    dataVersion?: number | null;
    client?: DbOrTransaction;
}): Promise<{ success: boolean; errors?: string[] }> {
    const results: { success: boolean; errors?: string[] } = { success: false };
    const errors: string[] = [];
    const changeLogs: SaveChangeLogData[] = [];
    const publishedDraftIds: string[] = [];

    try {
        const executor = opts?.client || db;
        const drafts = await executor.query.apkReleasesDrafts.findMany({
            where: opts?.userId ? eq(apkReleasesDrafts.createdByUserId, opts.userId) : undefined,
        });

        for (const draft of drafts) {
            try {
                const apkReleaseId = draft.apkReleaseId || draft.data.apkReleaseId || draft.apkReleaseDraftId;
                const { countryISO: _countryISO, ...rawPayload } = { ...draft.data, apkReleaseId } as any;
                let fileMeta: any = null;
                let fileSize: number | null = null;
                if (rawPayload.fileId) {
                    const file = await executor.query.files.findFirst({
                        where: eq(files.fileId, rawPayload.fileId),
                        columns: { size: true, metadata: true },
                    });
                    fileMeta = file?.metadata || null;
                    fileSize = file?.size ?? null;
                }

                const normalized = normalizeApkReleasePayload({
                    ...rawPayload,
                    fileSize: fileSize ?? undefined,
                    checksumSha256: fileMeta?.apkChecksumSha256 ?? null,
                    signatureSha256: fileMeta?.apkSignatureSha256 ?? null,
                });
                const existing = await executor.query.apkReleases.findFirst({
                    where: eq(apkReleases.apkReleaseId, apkReleaseId),
                });

                const payload = withServerManagedReleaseDates(normalized, existing || draft.data || {});
                const validationErrors = validateApkReleasePayload(payload);
                if (validationErrors.length) throw new Error(validationErrors.join(", "));

                if (existing) {
                    await executor
                        .update(apkReleases)
                        .set({
                            ...payload,
                        })
                        .where(eq(apkReleases.apkReleaseId, apkReleaseId));
                } else {
                    await executor.insert(apkReleases).values({
                        ...payload,
                        apkReleaseId,
                        releasedAt: payload.releasedAt || new Date(),
                    });
                }

                if (opts?.userId) {
                    const snapshot = structuredClone(payload);
                    changeLogs.push({
                        entityId: apkReleaseId,
                        entityType: "apk_release",
                        action: "publish",
                        dataVersion: opts.dataVersion,
                        changes: [{
                            action: "publish",
                            description: `APK release published (${payload.versionName})`,
                        }],
                        fullSnapshot: snapshot,
                        previousSnapshot: snapshot,
                        baselineSnapshot: snapshot,
                        description: `APK release published (${payload.versionName})`,
                        changeReason: `APK release published (${payload.versionName})`,
                        userId: opts.userId,
                    });
                }
                publishedDraftIds.push(draft.apkReleaseDraftId);
            } catch (e: any) {
                logger.error("_publishApkReleases item ERROR", JSON.stringify({
                    draftId: draft.apkReleaseDraftId,
                    apkReleaseId: draft.apkReleaseId || draft.data?.apkReleaseId || null,
                    message: e.message,
                }));
                errors.push(e.message);
            }
        }

        if (publishedDraftIds.length) {
            await executor
                .delete(apkReleasesDrafts)
                .where(inArray(apkReleasesDrafts.apkReleaseDraftId, publishedDraftIds));
        }

        if (changeLogs.length && Number.isFinite(opts?.dataVersion)) {
            const saveResult = await _saveChangeLogs({
                data: changeLogs,
                allowPartial: !opts?.client,
                client: executor,
            });
            if (saveResult.errors?.length) {
                logger.error("_publishApkReleases changelog warnings", saveResult.errors.join(", "));
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
        logger.error("_publishApkReleases ERROR", e.message);
    }

    return results;
}
