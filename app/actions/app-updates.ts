'use server';

import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";
import { _getAppUpdatePolicy, _getApkReleases, _getAppUpdatePolicyDrafts, _getApkReleaseDrafts } from "@/databases/queries/app-updates";
import { _saveAppUpdatePolicies, _saveApkReleases } from "@/databases/mutations/app-updates";


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
