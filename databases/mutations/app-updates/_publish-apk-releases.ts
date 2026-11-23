import { eq, inArray } from "drizzle-orm";

import { _saveChangeLogs, type SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log";
import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import type { DbOrTransaction } from "@/databases/pg/db-client";
import { apkReleases, apkReleasesDrafts, files } from "@/databases/pg/schema";
import { releaseSemanticKey } from "@/lib/app-updates/policy-release-resolution";
import {
    normalizeApkReleasePayload,
    normalizeNullableDate,
    sanitizeApkReleaseWritePayload,
    validateApkReleasePayload,
} from "@/lib/app-updates/validation";

const validatedStatuses = new Set(["validated", "approved", "available"]);
const approvedStatuses = new Set(["approved", "available"]);

function withServerManagedReleaseDates(
    payload: typeof apkReleases.$inferInsert,
    previous?: Partial<typeof apkReleases.$inferInsert>,
): typeof apkReleases.$inferInsert {
    const now = new Date();
    const next = { ...payload };

    if (validatedStatuses.has(`${next.status || ""}`) && !next.validatedAt) {
        next.validatedAt = normalizeNullableDate(previous?.validatedAt) || now;
    }
    if (approvedStatuses.has(`${next.status || ""}`) && !next.approvedAt) {
        next.approvedAt = normalizeNullableDate(previous?.approvedAt) || now;
    }
    if (next.status === "available" && next.isAvailable && !next.releasedAt) {
        next.releasedAt = normalizeNullableDate(previous?.releasedAt) || now;
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
        const allDrafts = await executor.query.apkReleasesDrafts.findMany({
            where: opts?.userId ? eq(apkReleasesDrafts.createdByUserId, opts.userId) : undefined,
        });
        const seenSemanticKeys = new Set<string>();
        const drafts = [...allDrafts]
            .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
            .filter((draft) => {
                const key = releaseSemanticKey((draft.data || {}) as any) || draft.apkReleaseDraftId;
                if (seenSemanticKeys.has(key)) {
                    publishedDraftIds.push(draft.apkReleaseDraftId);
                    return false;
                }
                seenSemanticKeys.add(key);
                return true;
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
                const releasesWithVersionCode = await executor.query.apkReleases.findMany({
                    where: eq(apkReleases.versionCode, Number(normalized.versionCode || 0)),
                });
                if (releasesWithVersionCode.length > 1) {
                    throw new Error(`Android version code ${normalized.versionCode} belongs to multiple historical releases. Resolve the duplicate releases before publishing.`);
                }
                const existingById = await executor.query.apkReleases.findFirst({
                    where: eq(apkReleases.apkReleaseId, apkReleaseId),
                });
                const existingByVersionCode = releasesWithVersionCode[0] || null;
                if (existingById && existingByVersionCode && existingById.apkReleaseId !== existingByVersionCode.apkReleaseId) {
                    throw new Error(`Android version code ${normalized.versionCode} already belongs to ${existingByVersionCode.versionName}. Choose a new APK build.`);
                }
                const existing = existingById || existingByVersionCode;

                const resolvedApkReleaseId = existing?.apkReleaseId || apkReleaseId;
                const payload = sanitizeApkReleaseWritePayload(withServerManagedReleaseDates({
                    ...normalized,
                    apkReleaseId: resolvedApkReleaseId,
                }, existing || draft.data || {}));
                const validationErrors = validateApkReleasePayload(payload);
                if (validationErrors.length) throw new Error(validationErrors.join(", "));

                if (existing) {
                    await executor
                        .update(apkReleases)
                        .set({
                            ...payload,
                        })
                        .where(eq(apkReleases.apkReleaseId, resolvedApkReleaseId));
                } else {
                    await executor.insert(apkReleases).values({
                        ...payload,
                        apkReleaseId: resolvedApkReleaseId,
                        releasedAt: payload.releasedAt || new Date(),
                    });
                }

                if (opts?.userId) {
                    const snapshot = structuredClone(payload);
                    changeLogs.push({
                        entityId: resolvedApkReleaseId,
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
                    stack: e.stack,
                }));
                if (opts?.client) {
                    throw e;
                }
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
        logger.error("_publishApkReleases ERROR", JSON.stringify({
            message: e.message,
            stack: e.stack,
        }));
    }

    return results;
}
