'use server';

import { v4 } from "uuid";
import queryString from "query-string";

import * as mutations from "@/databases/mutations/scripts";
import * as queries from "@/databases/queries/scripts";
import { _getSiteApiKey, } from '@/databases/queries/sites';
import logger from "@/lib/logger";
import socket from "@/lib/socket";
import { getSiteAxiosClient } from "@/lib/axios";
import { isAllowed } from "./is-allowed";

// DIAGNOSES
export const countScreens: typeof queries._countScreens = async (...args) => {
    try {
        await isAllowed();
        return await queries._countScreens(...args);
    } catch(e: any) {
        logger.error('countScreens ERROR', e.message);
        return { errors: [e.message], data: queries._defaultScreensCount, };
    }
};

export const getScreens: typeof queries._getScreens = async (...args) => {
    try {
        await isAllowed();
        return await queries._getScreens(...args);
    } catch(e: any) {
        logger.error('getScreens ERROR', e.message);
        return { errors: [e.message], data: [], };
    }
};

export const getScreen: typeof queries._getScreen = async (...args) => {
    await isAllowed();
    return await queries._getScreen(...args);
};

export const deleteScreens: typeof mutations._deleteScreens = async (...args) => {
    try {
        await isAllowed();
        return await mutations._deleteScreens(...args);
    } catch(e: any) {
        logger.error('deleteScreens ERROR', e.message);
        return { errors: [e.message], success: false, };
    }
};

export const saveScreens: typeof mutations._saveScreens = async (...args) => {
    try {
        await isAllowed();
        return await mutations._saveScreens(...args);
    } catch(e: any) {
        logger.error('getSys ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};

// SCREENS
export const countDiagnoses: typeof queries._countDiagnoses = async (...args) => {
    try {
        await isAllowed();
        return await queries._countDiagnoses(...args);
    } catch(e: any) {
        logger.error('countDiagnoses ERROR', e.message);
        return { errors: [e.message], data: queries._defaultDiagnosesCount, };
    }
};

export const getDiagnoses: typeof queries._getDiagnoses = async (...args) => {
    try {
        await isAllowed();
        return await queries._getDiagnoses(...args);
    } catch(e: any) {
        logger.error('getDiagnoses ERROR', e.message);
        return { errors: [e.message], data: [], };
    }
};

export const getDiagnosis: typeof queries._getDiagnosis = async (...args) => {
    await isAllowed();
    return await queries._getDiagnosis(...args);
};

export const deleteDiagnoses: typeof mutations._deleteDiagnoses = async (...args) => {
    try {
        await isAllowed();
        return await mutations._deleteDiagnoses(...args);
    } catch(e: any) {
        logger.error('deleteDiagnoses ERROR', e.message);
        return { errors: [e.message], success: false, };
    }
};

export const saveDiagnoses: typeof mutations._saveDiagnoses = async (...args) => {
    try {
        await isAllowed();
        return await mutations._saveDiagnoses(...args);
    } catch(e: any) {
        logger.error('getSys ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};

// SCRIPTS
export const countScripts: typeof queries._countScripts = async (...args) => {
    try {
        await isAllowed();
        return await queries._countScripts(...args);
    } catch(e: any) {
        logger.error('countScripts ERROR', e.message);
        return { errors: [e.message], data: queries._defaultScriptsCount, };
    }
};

export const getScripts: typeof queries._getScripts = async (...args) => {
    try {
        await isAllowed();
        return await queries._getScripts(...args);
    } catch(e: any) {
        logger.error('getScripts ERROR', e.message);
        return { errors: [e.message], data: [], };
    }
};

export const getScript: typeof queries._getScript = async (...args) => {
    await isAllowed();
    return await queries._getScript(...args);
};

export const importRemoteScripts: typeof mutations._importRemoteScripts = async (...args) => {
    try {
        await isAllowed();
        return await mutations._importRemoteScripts(...args);
    } catch(e: any) {
        logger.error('importRemoteScripts ERROR', e.message);
        return { errors: [e.message], success: false, };
    }
};

export const deleteScripts: typeof mutations._deleteScripts = async (...args) => {
    try {
        await isAllowed();
        return await mutations._deleteScripts(...args);
    } catch(e: any) {
        logger.error('deleteScripts ERROR', e.message);
        return { errors: [e.message], success: false, };
    }
};

export const saveScripts: typeof mutations._saveScripts = async (...args) => {
    try {
        await isAllowed();
        return await mutations._saveScripts(...args);
    } catch(e: any) {
        logger.error('getSys ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};
export async function getScriptsWithItems (params: Parameters<typeof queries._getScripts>[0]) {
    const data: (Awaited<ReturnType<typeof queries._getScripts>>['data'][0] & {
        screens: Awaited<ReturnType<typeof queries._getScreens>>['data'][0][],
        diagnoses: Awaited<ReturnType<typeof queries._getDiagnoses>>['data'][0][]
    })[] = [];
    const errors: string[] = [];
	try {
        const scripts = await queries._getScripts(params);

        scripts.errors?.forEach(e => errors.push(e));

        for (const s of scripts.data) {
            const screens = await queries._getScreens({ scriptsIds: [s.scriptId], });
            const diagnoses = await queries._getDiagnoses({ scriptsIds: [s.scriptId], });

            screens.errors?.forEach(e => errors.push(e));
            diagnoses.errors?.forEach(e => errors.push(e));

            data.push({
                ...s,
                screens: screens.data,
                diagnoses: diagnoses.data,
            });
        }

        if (errors.length) return { errors, data: [], };

        return { data, };
	} catch(e: any) {
		logger.error('getScriptsWithItems ERROR', e.message);
		return { data: [], errors: [e.message], };
	}
}

const _info = { scripts: 0, screens: 0, diagnoses: 0, };

export async function saveScriptsWithItems({ data }: {
    data: Awaited<ReturnType<typeof getScriptsWithItems>>['data']
}): Promise<{ 
    errors?: string[]; 
    success: boolean;
    info: typeof _info, 
}> {
    const info = { ..._info };

    try {
        const errors: string[] = [];

        for (const script of data) {
            const { 
                id,
                screens = [], 
                diagnoses = [], 
                publishDate,
                createdAt,
                updatedAt,
                isDraft,
                deletedAt,
                version,
                oldScriptId,
                ...s 
            } = script;

            const scriptId = v4();

            const res = await saveScripts({
                data: [{
                    ...s,
                    scriptId,
                    version: 1,
                }],
            });

            res.errors?.forEach(e => errors.push(e));

            if (!res.errors?.length) {
                if (!res.errors?.length) info.scripts++;

                for (const screen of screens) {
                    const { 
                        id,
                        publishDate,
                        createdAt,
                        updatedAt,
                        isDraft,
                        deletedAt,
                        version,
                        oldScriptId,
                        oldScreenId,
                        ...s 
                    } = screen;

                    const screenId = v4();

                    const res = await saveScreens({
                        data: [{
                            ...s,
                            scriptId,
                            screenId,
                            version: 1,
                        }],
                    });

                    res.errors?.forEach(e => errors.push(e));

                    if (!res.errors?.length) info.screens++;
                }

                for (const diagnosis of diagnoses) {
                    const { 
                        id,
                        publishDate,
                        createdAt,
                        updatedAt,
                        isDraft,
                        deletedAt,
                        version,
                        oldScriptId,
                        oldDiagnosisId,
                        ...d
                    } = diagnosis;

                    const diagnosisId = v4();

                    const res = await saveDiagnoses({
                        data: [{
                            ...d,
                            scriptId,
                            diagnosisId,
                            version: 1,
                        }],
                    });

                    res.errors?.forEach(e => errors.push(e));

                    if (!res.errors?.length) info.diagnoses++;
                }
            }
        }

        if (errors.length) return { success: false, errors, info, };

        return { success: true, info, };
    } catch(e: any) {
        logger.error('saveScriptsWithItems ERROR', e.message);
		return { success: false, errors: [e.message], info, };
    }
}

export async function copyScripts(params?: {
    scriptsIds?: string[];
    confirmCopyAll?: boolean;
    toRemoteSiteId?: string;
    fromRemoteSiteId?: string;
    overwriteScriptWithId?: string;
    broadcastAction?: boolean;
}): Promise<Awaited<ReturnType<typeof saveScriptsWithItems>>> {
    const info = { ..._info };

    const { 
        scriptsIds = [], 
        confirmCopyAll, 
        toRemoteSiteId,
        fromRemoteSiteId,
        broadcastAction,
    } = { ...params };

    try {
        if (!scriptsIds.length && !confirmCopyAll) throw new Error('You&apos;re about copy all the scripts, please confirm this action!');

        let scripts = fromRemoteSiteId ? { data: [], } : await getScriptsWithItems({ scriptsIds });

        if (scripts.errors) return { success: false, errors: scripts.errors, info, };

        if (fromRemoteSiteId) {
            const axiosClient = await getSiteAxiosClient(fromRemoteSiteId);

            const res = await axiosClient.get('/scripts/with-items?' + queryString.stringify({ 
                scriptsIds: JSON.stringify(scriptsIds), 
            }));

            const resData = res.data as Awaited<ReturnType<typeof getScriptsWithItems>>;

            if (resData.errors) return { success: false, errors: resData.errors, info, };

            scripts = resData;
        }

        let response: Awaited<ReturnType<typeof saveScriptsWithItems>> = { success: true, info, };

        if (scripts.data.length) {
            if (toRemoteSiteId) {
                const axiosClient = await getSiteAxiosClient(toRemoteSiteId);

                const res = await axiosClient.post('/scripts/with-items?', {
                    data: scripts.data,
                });

                response = res.data as Awaited<ReturnType<typeof saveScriptsWithItems>>;
            } else {
                response = await saveScriptsWithItems({
                    data: scripts.data,
                });
            }
        }

        if (broadcastAction && !response?.errors?.length) socket.emit('data_changed', 'copy_scripts');

        return response;
    } catch(e: any) {
        logger.log('copyScripts ERROR', e.message);
        return { errors: [e.message], success: false, info, };
    }
}
