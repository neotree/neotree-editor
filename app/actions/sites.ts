'use server';

import * as sitesMutations from '@/databases/mutations/sites';
import * as sitesQueries from "@/databases/queries/sites";
import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";

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
