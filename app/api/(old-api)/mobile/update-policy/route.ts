import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getAppUpdatePolicy } from "@/databases/queries/app-updates";
import { getAppUrl } from "@/lib/urls";

export async function GET(req: NextRequest) {
    try {
        logger.log(`[GET] /api/mobile/update-policy`);

        const isAuthorised = await isAuthenticated();
        if (!isAuthorised.yes) return NextResponse.json({ errors: ["Unauthorised"] });

        const policyRes = await _getAppUpdatePolicy();
        if (policyRes?.errors?.length) return NextResponse.json({ errors: policyRes.errors, data: null });

        const policy = policyRes.data;
        if (!policy) return NextResponse.json({ errors: ["Policy not found"], data: null });

        const mapRelease = (release: typeof policy.currentApkRelease) => {
            if (!release) return null;

            const available = !!(release.isAvailable && release.status === "available");
            const downloadUrl = release.fileId ? getAppUrl(`/api/files/${release.fileId}/download`) : null;

            return {
                apkReleaseId: release.apkReleaseId,
                runtimeVersion: release.runtimeVersion,
                versionName: release.versionName,
                versionCode: release.versionCode,
                status: release.status,
                isAvailable: release.isAvailable,
                available,
                fileId: release.fileId,
                fileSize: release.fileSize,
                checksumSha256: release.checksumSha256,
                signatureSha256: release.signatureSha256,
                validatedAt: release.validatedAt,
                approvedAt: release.approvedAt,
                releaseNotes: release.releaseNotes,
                releasedAt: release.releasedAt,
                downloadUrl,
            };
        };

        const currentApk = mapRelease(policy.currentApkRelease || null);
        const rollbackApk = mapRelease(policy.rollbackApkRelease || null);

        return NextResponse.json({
            data: {
                runtimeVersion: policy.runtimeVersion,
                policyVersion: policy.policyVersion,
                ota: {
                    enabled: policy.otaEnabled,
                    channel: policy.otaChannel,
                },
                apk: {
                    autoDownload: policy.apkAutoDownload,
                    forceInstall: policy.apkForceInstall,
                    gracePeriodHours: policy.apkGracePeriodHours,
                    forceAfter: policy.apkForceAfter,
                    installWindow: policy.apkInstallWindow,
                    messageTitle: policy.apkMessageTitle,
                    messageBody: policy.apkMessageBody,
                },
                currentApkRelease: currentApk,
                rollbackApkRelease: rollbackApk,
            },
        });
    } catch (e: any) {
        logger.error("[GET_ERROR] /api/mobile/update-policy", e.message);
        return NextResponse.json({ errors: ["Internal Error"], data: null });
    }
}
