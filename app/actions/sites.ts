'use server';

import * as sitesMutations from '@/databases/mutations/sites';
import * as sitesQueries from "@/databases/queries/sites";
import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";
import { _importRemoteScripts } from "@/databases/mutations/sites";

export const getSite = sitesQueries._getSite;

export const getSites = sitesQueries._getSites;

export const getSitesWithoutConfidentialData = sitesQueries._getSitesWithoutConfidentialData;

export const saveSites: typeof sitesMutations._saveSites = async (...args) => {
    try {
        await isAllowed();
        return await sitesMutations._saveSites(...args);
    } catch(e: any) {
        logger.error('getSys ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};

export const importRemoteScripts: typeof _importRemoteScripts = async (...args) => {
    let response: Awaited<ReturnType<typeof _importRemoteScripts>> = { success: false, };
    try {
        await isAllowed(['import_scripts']);
        response = await _importRemoteScripts(...args);
    } catch(e: any) {
        response.errors = [e.message];
        logger.error('importRemoteScripts ERROR', e.message);
    } finally {
        return response;
    }
};
