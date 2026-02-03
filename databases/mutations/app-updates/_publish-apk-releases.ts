import { eq } from "drizzle-orm";

import { _saveChangeLogs, type SaveChangeLogData } from "@/databases/mutations/changelogs/_save-change-log";
import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import { apkReleases, apkReleasesDrafts } from "@/databases/pg/schema";

export async function _publishApkReleases(opts?: {
    userId?: string | null;
    dataVersion?: number | null;
}): Promise<{ success: boolean; errors?: string[] }> {
    const results: { success: boolean; errors?: string[] } = { success: false };
    const errors: string[] = [];
    const changeLogs: SaveChangeLogData[] = [];

    try {
        const drafts = await db.query.apkReleasesDrafts.findMany({
            where: opts?.userId ? eq(apkReleasesDrafts.createdByUserId, opts.userId) : undefined,
        });

        for (const draft of drafts) {
            try {
                const apkReleaseId = draft.apkReleaseId || draft.data.apkReleaseId || draft.apkReleaseDraftId;
                const { countryISO: _countryISO, ...payload } = { ...draft.data, apkReleaseId } as any;

                const existing = await db.query.apkReleases.findFirst({
                    where: eq(apkReleases.apkReleaseId, apkReleaseId),
                    columns: { apkReleaseId: true },
                });

                if (existing) {
                    await db
                        .update(apkReleases)
                        .set({
                            ...payload,
                        })
                        .where(eq(apkReleases.apkReleaseId, apkReleaseId));
                } else {
                    await db.insert(apkReleases).values({
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
            } catch (e: any) {
                errors.push(e.message);
            }
        }

        await db
            .delete(apkReleasesDrafts)
            .where(opts?.userId ? eq(apkReleasesDrafts.createdByUserId, opts.userId) : undefined);

        if (changeLogs.length && Number.isFinite(opts?.dataVersion)) {
            const saveResult = await _saveChangeLogs({ data: changeLogs, allowPartial: true });
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
