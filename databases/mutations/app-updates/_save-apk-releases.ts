import { and, eq } from "drizzle-orm";
import * as uuid from "uuid";

import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import { apkReleases, apkReleasesDrafts, files } from "@/databases/pg/schema";
import socket from "@/lib/socket";
import { releaseSemanticKey } from "@/lib/app-updates/policy-release-resolution";
import { normalizeApkReleasePayload, normalizeNullableDate, validateApkReleasePayload } from "@/lib/app-updates/validation";

export type SaveApkReleasesData = Partial<typeof apkReleases.$inferInsert> & {
    runtimeVersion: string;
    versionName: string;
    versionCode: number;
};

export type SaveApkReleasesResponse = {
    success: boolean;
    errors?: string[];
};

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

export async function _saveApkReleases({ data, broadcastAction = true, userId }: {
    data: SaveApkReleasesData[];
    broadcastAction?: boolean;
    userId?: string;
}): Promise<SaveApkReleasesResponse> {
    const response: SaveApkReleasesResponse = { success: false };

    try {
        const errors: string[] = [];

        for (const { apkReleaseId: itemApkReleaseId, ...item } of data) {
            const { countryISO: _countryISO, ...cleanItem } = item as any;
            try {
                const semanticPublished = await db.query.apkReleases.findFirst({
                    where: and(
                        eq(apkReleases.runtimeVersion, `${cleanItem.runtimeVersion || ""}`.trim()),
                        eq(apkReleases.versionCode, Number(cleanItem.versionCode || 0)),
                    ),
                });

                const published = await db.query.apkReleases.findFirst({
                    where: eq(apkReleases.apkReleaseId, itemApkReleaseId || semanticPublished?.apkReleaseId || uuid.v4()),
                });

                let fileMeta: any = null;
                let fileDetails: { size: number; contentType: string; filename: string } | null = null;
                if (item?.fileId) {
                    const file = await db.query.files.findFirst({
                        where: eq(files.fileId, item.fileId),
                        columns: { size: true, metadata: true, contentType: true, filename: true },
                    });
                    fileDetails = file ? {
                        size: file.size,
                        contentType: file.contentType,
                        filename: file.filename,
                    } : null;
                    fileMeta = file?.metadata || null;
                }

                const allDrafts = await db.query.apkReleasesDrafts.findMany();
                const directDraft = itemApkReleaseId
                    ? allDrafts.find((entry) => entry.apkReleaseDraftId === itemApkReleaseId) || null
                    : null;
                const semanticKey = releaseSemanticKey(cleanItem);
                const semanticDraft = allDrafts.find((entry) => releaseSemanticKey((entry.data || {}) as any) === semanticKey) || null;
                const draft = directDraft || semanticDraft;
                const apkReleaseId =
                    semanticPublished?.apkReleaseId ||
                    (typeof draft?.data?.apkReleaseId === "string" ? draft.data.apkReleaseId : null) ||
                    itemApkReleaseId ||
                    uuid.v4();
                const draftRowId = draft?.apkReleaseDraftId || apkReleaseId;

                const previous = (draft?.data || published || {}) as Partial<typeof apkReleases.$inferInsert>;
                const nextFileId = item.fileId ?? previous.fileId ?? null;
                const previousFileId = previous.fileId ?? null;
                const fileChanged = !!item.fileId && item.fileId !== previousFileId;
                const trustedFileSize = fileDetails?.size ?? (!fileChanged ? previous.fileSize : null);
                const trustedChecksumSha256 = fileMeta?.apkChecksumSha256 ?? (!fileChanged ? previous.checksumSha256 : null);
                const trustedSignatureSha256 = fileMeta?.apkSignatureSha256 ?? (!fileChanged ? previous.signatureSha256 : null);

                const enriched = withServerManagedReleaseDates(normalizeApkReleasePayload({
                    ...cleanItem,
                    fileId: nextFileId,
                    fileSize: trustedFileSize ?? undefined,
                    checksumSha256: trustedChecksumSha256 ?? undefined,
                    signatureSha256: trustedSignatureSha256 ?? undefined,
                }), previous);

                const validationErrors = validateApkReleasePayload(enriched, {
                    fileContentType: fileDetails?.contentType,
                    fileName: fileDetails?.filename,
                });
                if (validationErrors.length) throw new Error(validationErrors.join(", "));

                if (draft) {
                    const merged = {
                        ...draft.data,
                        ...enriched,
                        apkReleaseId,
                    } as typeof apkReleases.$inferInsert;

                    await db
                        .update(apkReleasesDrafts)
                        .set({ data: merged })
                        .where(eq(apkReleasesDrafts.apkReleaseDraftId, draftRowId));
                } else {
                    const merged = {
                        ...(published || {}),
                        ...enriched,
                        apkReleaseId,
                    } as typeof apkReleases.$inferInsert;

                    await db.insert(apkReleasesDrafts).values({
                        data: merged,
                        apkReleaseDraftId: draftRowId,
                        apkReleaseId: semanticPublished?.apkReleaseId || published?.apkReleaseId,
                        createdByUserId: userId,
                    });
                }

            } catch (e: any) {
                logger.error("_saveApkReleases item ERROR", e.message);
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
        logger.error("_saveApkReleases ERROR", e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction) socket.emit("data_changed", "save_apk_releases");
        return response;
    }
}
