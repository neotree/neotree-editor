import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { _getAppUpdatePolicy } from "@/databases/queries/app-updates";
import { getAppUrl } from "@/lib/urls";
import { authenticateMobileDevice } from "@/lib/mobile-device-auth";

export async function GET(req: NextRequest) {
    try {
        logger.log(`[GET] /api/mobile/update-policy`);

        const deviceId = req.nextUrl.searchParams.get("deviceId") || "";
        const auth = await authenticateMobileDevice(req, deviceId);
        if (!auth.ok) return NextResponse.json({ errors: auth.errors, data: null }, { status: auth.status });

        const runtimeVersion = req.nextUrl.searchParams.get("runtimeVersion") || undefined;
        const nativeBuildVersion = Number(req.nextUrl.searchParams.get("nativeBuildVersion") || NaN);
        const hospitalId = req.nextUrl.searchParams.get("hospitalId") || null;
        const countryISO = req.nextUrl.searchParams.get("countryISO") || null;
        const policyRes = await _getAppUpdatePolicy({ runtimeVersion, deviceId, hospitalId, countryISO });
        if (policyRes?.errors?.length) return NextResponse.json({ errors: policyRes.errors, data: null }, { status: 500 });

        const policy = policyRes.data;
        if (!policy) return NextResponse.json({ errors: ["Policy not found"], data: null }, { status: 404 });
        const allowsInAppDownload = policy.apkDeliveryMode === "in_app" || policy.apkDeliveryMode === "hybrid";

        const mapRelease = (release: typeof policy.currentApkRelease) => {
            if (!release) return null;

            const available = !!(release.isAvailable && release.status === "available");
            const downloadUrl = allowsInAppDownload && release.fileId
                ? getAppUrl(`/api/mobile/apk-releases/${release.apkReleaseId}/download?deviceId=${encodeURIComponent(deviceId)}`)
                : null;

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
                isDowngrade: Number.isFinite(nativeBuildVersion) && release.versionCode < nativeBuildVersion,
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
                    deliveryMode: policy.apkDeliveryMode,
                    autoDownload: policy.apkAutoDownload,
                    forceInstall: policy.apkForceInstall,
                    wifiOnly: policy.apkWifiOnly,
                    healthCheckHours: policy.apkHealthCheckHours,
                    gracePeriodHours: policy.apkGracePeriodHours,
                    forceAfter: policy.apkForceAfter,
                    installWindow: policy.apkInstallWindow,
                    messageTitle: policy.apkMessageTitle,
                    messageBody: policy.apkMessageBody,
                },
                targeting: {
                    scope: policy.targetScope,
                    groupId: policy.targetGroupId,
                    hospitalId: policy.targetHospitalId,
                },
                rollback: {
                    enabled: policy.rollbackEnabled,
                },
                currentApkRelease: currentApk,
                rollbackApkRelease: rollbackApk,
            },
        });
    } catch (e: any) {
        logger.error("[GET_ERROR] /api/mobile/update-policy", e.message);
        return NextResponse.json({ errors: ["Internal Error"], data: null }, { status: 500 });
    }
}
