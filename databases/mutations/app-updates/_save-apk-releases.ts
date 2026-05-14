import { eq } from "drizzle-orm";
import * as uuid from "uuid";

import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import { apkReleases, apkReleasesDrafts, files } from "@/databases/pg/schema";
import socket from "@/lib/socket";

export type SaveApkReleasesData = Partial<typeof apkReleases.$inferInsert> & {
    runtimeVersion: string;
    versionName: string;
    versionCode: number;
};

export type SaveApkReleasesResponse = {
    success: boolean;
    errors?: string[];
};

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
                const apkReleaseId = itemApkReleaseId || uuid.v4();

                const published = await db.query.apkReleases.findFirst({
                    where: eq(apkReleases.apkReleaseId, apkReleaseId),
                });

                let fileMeta: any = null;
                if (item?.fileId) {
                    const file = await db.query.files.findFirst({
                        where: eq(files.fileId, item.fileId),
                        columns: { size: true, metadata: true },
                    });
                    fileMeta = file?.metadata || null;
                }

                const draft = await db.query.apkReleasesDrafts.findFirst({
                    where: eq(apkReleasesDrafts.apkReleaseDraftId, apkReleaseId),
                });

                const enriched = {
                    ...cleanItem,
                    fileSize: item.fileSize ?? fileMeta?.size ?? undefined,
                    checksumSha256: item.checksumSha256 ?? fileMeta?.apkChecksumSha256 ?? undefined,
                    signatureSha256: item.signatureSha256 ?? fileMeta?.apkSignatureSha256 ?? undefined,
                };

                if (draft) {
                    const merged = {
                        ...draft.data,
                        ...enriched,
                        apkReleaseId,
                    } as typeof apkReleases.$inferInsert;

                    await db
                        .update(apkReleasesDrafts)
                        .set({ data: merged })
                        .where(eq(apkReleasesDrafts.apkReleaseDraftId, apkReleaseId));
                } else {
                    const merged = {
                        ...(published || {}),
                        ...enriched,
                        apkReleaseId,
                    } as typeof apkReleases.$inferInsert;

                    await db.insert(apkReleasesDrafts).values({
                        data: merged,
                        apkReleaseDraftId: apkReleaseId,
                        apkReleaseId: published?.apkReleaseId,
                        createdByUserId: userId,
                    });
                }
            } catch (e: any) {
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
