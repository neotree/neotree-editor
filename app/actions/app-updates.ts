'use server';

import { revalidatePath } from "next/cache";

import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";
import { _getAppUpdatePolicy, _getApkReleases, _getAppUpdatePolicyDrafts, _getApkReleaseDrafts, _getApkRolloutHealth } from "@/databases/queries/app-updates";
import { _saveAppUpdatePolicies, _saveApkReleases } from "@/databases/mutations/app-updates";
import { importApkArtifactFromUrl } from "@/lib/app-updates/apk-artifact-import";
import { requestMdmApkRolloutForPolicy } from "@/lib/app-updates/mdm-rollout";


export const getAppUpdatePolicyDrafts: typeof _getAppUpdatePolicyDrafts = async (...args) => {
    try {
        await isAllowed();
        return await _getAppUpdatePolicyDrafts(...args);
    } catch (e: any) {
        logger.error("getAppUpdatePolicyDrafts ERROR", e.message);
        return { data: [], errors: [e.message] };
    }
};

export const getApkReleaseDrafts: typeof _getApkReleaseDrafts = async (...args) => {
    try {
        await isAllowed();
        return await _getApkReleaseDrafts(...args);
    } catch (e: any) {
        logger.error("getApkReleaseDrafts ERROR", e.message);
        return { data: [], errors: [e.message] };
    }
};

export const getAppUpdatePolicy: typeof _getAppUpdatePolicy = async (...args) => {
    try {
        await isAllowed();
        return await _getAppUpdatePolicy(...args);
    } catch (e: any) {
        logger.error("getAppUpdatePolicy ERROR", e.message);
        return { data: null, errors: [e.message] };
    }
};

export const getApkRolloutHealth: typeof _getApkRolloutHealth = async (...args) => {
    try {
        await isAllowed();
        return await _getApkRolloutHealth(...args);
    } catch (e: any) {
        logger.error("getApkRolloutHealth ERROR", e.message);
        return { data: null, errors: [e.message] };
    }
};

export const getApkReleases: typeof _getApkReleases = async (...args) => {
    try {
        await isAllowed();
        return await _getApkReleases(...args);
    } catch (e: any) {
        logger.error("getApkReleases ERROR", e.message);
        return { data: [], errors: [e.message] };
    }
};

export const saveAppUpdatePolicies: typeof _saveAppUpdatePolicies = async (params) => {
    try {
        const session = await isAllowed();
        return await _saveAppUpdatePolicies({
            ...params,
            userId: session.user?.userId,
        });
    } catch (e: any) {
        logger.error("saveAppUpdatePolicies ERROR", e.message);
        return { success: false, errors: [e.message] };
    }
};

export const saveApkReleases: typeof _saveApkReleases = async (params) => {
    try {
        const session = await isAllowed();
        return await _saveApkReleases({
            ...params,
            userId: session.user?.userId,
        });
    } catch (e: any) {
        logger.error("saveApkReleases ERROR", e.message);
        return { success: false, inserted: [], errors: [e.message] };
    }
};

export async function importEasApkReleaseDraft(formData: FormData) {
    try {
        const session = await isAllowed();
        const artifactUrl = `${formData.get("artifactUrl") || ""}`.trim();
        const runtimeVersion = `${formData.get("runtimeVersion") || ""}`.trim();
        const providedVersionName = `${formData.get("versionName") || ""}`.trim();
        const providedVersionCode = Number(formData.get("versionCode") || 0);
        const apkReleaseId = `${formData.get("apkReleaseId") || ""}`.trim() || undefined;
        const releaseNotes = `${formData.get("releaseNotes") || ""}`.trim();

        if (!runtimeVersion) throw new Error("Runtime version is required before importing the APK");

        const imported = await importApkArtifactFromUrl({
            artifactUrl,
            source: "eas",
            metadata: {
                apkReleaseId: apkReleaseId || null,
                runtimeVersion,
                importedByUserId: session.user?.userId || null,
            },
        });

        // Auto-fill version fields from the APK when the admin didn't supply them.
        const versionName = providedVersionName || imported.metadata.versionName || "";
        const versionCode = Number.isInteger(providedVersionCode) && providedVersionCode > 0
            ? providedVersionCode
            : (imported.metadata.versionCode || 0);

        if (!versionName) throw new Error("Version name could not be read from the APK. Use a valid EAS APK build link or upload the APK file directly.");
        if (!Number.isInteger(versionCode) || versionCode <= 0) throw new Error("Version code could not be read from the APK. Use a valid EAS APK build link or upload the APK file directly.");

        const saveResult = await _saveApkReleases({
            userId: session.user?.userId,
            data: [{
                apkReleaseId,
                runtimeVersion,
                versionName,
                versionCode,
                status: "uploaded",
                isAvailable: false,
                fileId: imported.file.fileId,
                fileSize: imported.fileSize,
                checksumSha256: imported.checksumSha256,
                signatureSha256: imported.signatureSha256,
                releaseNotes: [
                    releaseNotes,
                    `Imported from EAS build artifact: ${imported.artifactUrl}`,
                    imported.metadata.packageName ? `Package: ${imported.metadata.packageName}` : "",
                ].filter(Boolean).join("\n\n"),
            }],
        });

        if (saveResult.errors?.length) throw new Error(saveResult.errors.join(", "));

        return {
            success: true,
            data: {
                fileId: imported.file.fileId,
                fileSize: imported.fileSize,
                checksumSha256: imported.checksumSha256,
                signatureSha256: imported.signatureSha256,
                artifactUrl: imported.artifactUrl,
                versionName,
                versionCode,
                packageName: imported.metadata.packageName,
                minSdkVersion: imported.metadata.minSdkVersion,
                targetSdkVersion: imported.metadata.targetSdkVersion,
            },
        };
    } catch (e: any) {
        logger.error("importEasApkReleaseDraft ERROR", e.message);
        return { success: false, errors: [e.message || "Could not import EAS APK"] };
    }
}

export async function requestCurrentPolicyMdmApkRollout() {
    try {
        await isAllowed();
        const policyResult = await _getAppUpdatePolicy();
        const policy = policyResult.data;

        if (!policy) {
            return {
                success: false,
                data: { requested: 0, failed: 0, skipped: 0, errors: ["No published app update policy is configured"] },
                errors: ["No published app update policy is configured"],
            };
        }

        if (!["mdm", "hybrid"].includes(policy.apkDeliveryMode)) {
            return {
                success: false,
                data: { requested: 0, failed: 0, skipped: 0, errors: ["The live policy is not configured for MDM APK delivery"] },
                errors: ["The live policy is not configured for MDM APK delivery"],
            };
        }

        const result = await requestMdmApkRolloutForPolicy(policy);
        revalidatePath("/app-updates");
        revalidatePath("/app-updates/ota");
        revalidatePath("/device-management");

        return {
            success: result.failed === 0 && result.errors.length === 0,
            data: result,
            errors: result.errors,
        };
    } catch (e: any) {
        logger.error("requestCurrentPolicyMdmApkRollout ERROR", e.message);
        return {
            success: false,
            data: { requested: 0, failed: 1, skipped: 0, errors: [e.message || "Could not request MDM APK rollout"] },
            errors: [e.message || "Could not request MDM APK rollout"],
        };
    }
}
