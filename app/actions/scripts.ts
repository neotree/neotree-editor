'use server';

import { v4 } from "uuid";
import queryString from "query-string";

import * as mutations from "@/databases/mutations/scripts";
import * as queries from "@/databases/queries/scripts";
import * as drugsLibraryMutations from "@/databases/mutations/drugs-library";
import { _saveDataKeysIfNotExist } from "@/databases/mutations/data-keys";
import { _getSiteApiKey, } from '@/databases/queries/sites';
import logger from "@/lib/logger";
import socket from "@/lib/socket";
import { getSiteAxiosClient } from "@/lib/server/axios";
import { isAllowed } from "./is-allowed";
import { isValidUrl } from "@/lib/urls";
import { processImage } from "@/lib/process-image";
import { _getDataKeys, DataKey } from "@/databases/queries/data-keys";

export const getScriptsMetadata = queries._getScriptsMetadata;

// DIAGNOSES
export const countScreens: typeof queries._countScreens = async (...args) => {
    try {
        await isAllowed();
        return await queries._countScreens(...args);
    } catch (e: any) {
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

export const listScreens: typeof queries._listScreens = async (...args) => {
    try {
        await isAllowed();
        return await queries._listScreens(...args);
    } catch (e: any) {
        logger.error('listScreens ERROR', e.message);
        return { errors: [e.message], data: [], };
    }
};

export const getScreen: typeof queries._getScreen = async (...args) => {
    await isAllowed();
    return await queries._getScreen(...args);
};

export const deleteScreens: typeof mutations._deleteScreens = async params => {
    try {
        const session = await isAllowed();
        return await mutations._deleteScreens({
            ...params,
            userId: session.user?.userId,
        });
    } catch (e: any) {
        logger.error('deleteScreens ERROR', e.message);
        return { errors: [e.message], success: false, };
    }
};

export const saveScreens: typeof mutations._saveScreens = async params => {
    try {
        const session = await isAllowed();
        return await mutations._saveScreens({
            ...params,
            userId: session.user?.userId,
        });
    } catch (e: any) {
        logger.error('getSys ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};

// SCREENS
export const countDiagnoses: typeof queries._countDiagnoses = async (...args) => {
    try {
        await isAllowed();
        return await queries._countDiagnoses(...args);
    } catch (e: any) {
        logger.error('countDiagnoses ERROR', e.message);
        return { errors: [e.message], data: queries._defaultDiagnosesCount, };
    }
};

export const getDiagnoses: typeof queries._getDiagnoses = async (...args) => {
    try {
        await isAllowed();
        return await queries._getDiagnoses(...args);
    } catch (e: any) {
        logger.error('getDiagnoses ERROR', e.message);
        return { errors: [e.message], data: [], };
    }
};

export const getDiagnosis: typeof queries._getDiagnosis = async (...args) => {
    await isAllowed();
    return await queries._getDiagnosis(...args);
};

export const deleteDiagnoses: typeof mutations._deleteDiagnoses = async params => {
    try {
        const session = await isAllowed();
        return await mutations._deleteDiagnoses({
            ...params,
            userId: session.user?.userId,
        });
    } catch (e: any) {
        logger.error('deleteDiagnoses ERROR', e.message);
        return { errors: [e.message], success: false, };
    }
};

export const saveDiagnoses: typeof mutations._saveDiagnoses = async params => {
    try {
        const session = await isAllowed();
        return await mutations._saveDiagnoses({
            ...params,
            userId: session.user?.userId,
        });
    } catch (e: any) {
        logger.error('getSys ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};

// SCRIPTS
export const countScripts: typeof queries._countScripts = async (...args) => {
    try {
        await isAllowed();
        return await queries._countScripts(...args);
    } catch (e: any) {
        logger.error('countScripts ERROR', e.message);
        return { errors: [e.message], data: queries._defaultScriptsCount, };
    }
};

export const getScripts: typeof queries._getScripts = async (...args) => {
    try {
        await isAllowed();
        return await queries._getScripts(...args);
    } catch (e: any) {
        logger.error('getScripts ERROR', e.message);
        return { errors: [e.message], data: [], };
    }
};

export const getScript: typeof queries._getScript = async (...args) => {
    await isAllowed();
    return await queries._getScript(...args);
};

export const deleteScripts: typeof mutations._deleteScripts = async params => {
    try {
        const session = await isAllowed();
        return await mutations._deleteScripts({
            ...params,
            userId: session.user?.userId,
        });
    } catch (e: any) {
        logger.error('deleteScripts ERROR', e.message);
        return { errors: [e.message], success: false, };
    }
};

export const saveScripts: typeof mutations._saveScripts = async params => {
    try {
        const session = await isAllowed();
        return await mutations._saveScripts({
            ...params,
            userId: session.user?.userId,
        });
    } catch (e: any) {
        logger.error('saveScripts ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};

type GetScriptsWithItemsResponse = {
    errors?: string[];
    data: (Awaited<ReturnType<typeof queries._getScripts>>['data'][0] & {
        screens: Awaited<ReturnType<typeof queries._getScreens>>['data'][0][];
        diagnoses: Awaited<ReturnType<typeof queries._getDiagnoses>>['data'][0][];
        drugsLibrary: Awaited<ReturnType<typeof queries._getScriptsDrugsLibrary>>['data'][0][];
        dataKeys: Awaited<ReturnType<typeof _getDataKeys>>['data'];
    })[];
};

export async function getScriptsWithItems(params: Parameters<typeof queries._getScripts>[0]): Promise<GetScriptsWithItemsResponse> {
    const data: GetScriptsWithItemsResponse['data'] = [];
    const errors: string[] = [];

    try {
        const returnDraftsIfExist = params?.returnDraftsIfExist !== false;
        const scripts = await queries._getScripts({ ...params, returnDraftsIfExist });

        scripts.errors?.forEach(e => errors.push(e));

        for (const s of scripts.data) {
            const screens = await queries._getScreens({ scriptsIds: [s.scriptId], returnDraftsIfExist, });
            const diagnoses = await queries._getDiagnoses({ scriptsIds: [s.scriptId], returnDraftsIfExist, });
            const drugsLibrary = await queries._getScriptsDrugsLibrary({ scriptsIds: [s.scriptId], returnDraftsIfExist, });

            screens.errors?.forEach(e => errors.push(e));
            diagnoses.errors?.forEach(e => errors.push(e));

            const dataItem: typeof data[0] = {
                ...s,
                screens: screens.data,
                diagnoses: diagnoses.data,
                dataKeys: [],
                drugsLibrary: drugsLibrary.data
                    .filter(d => {
                        const drugScreens = screens.data.filter(s => ['drugs', 'fluids', 'feeds'].includes(s.type));
                        return (
                            !!drugScreens.find(s => (s.drugs || []).map(d => d.key).includes(d.key)) ||
                            !!drugScreens.find(s => (s.fluids || []).map(d => d.key).includes(d.key)) ||
                            !!drugScreens.find(s => (s.feeds || []).map(d => d.key).includes(d.key))
                        );
                    }),
            };

            const { data: { dataKeys }, } = await getScriptsDataKeys({
                scriptsIds: [],
                scripts: []
            });

            data.push({
                ...dataItem,
                dataKeys,
            });
        }

        if (errors.length) return { errors, data: [], };

        return { data, };
    } catch (e: any) {
        logger.error('getScriptsWithItems ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}

export async function saveScriptScreens({
    screens,
    scriptId,
    preserveScreensIds,
}: {
    preserveScreensIds?: boolean;
    scriptId: string;
    screens: Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0]['screens'];
}): Promise<{
    errors?: string[];
    success: boolean;
    saved: number;
}> {
    try {
        let saved = 0;
        const errors: string[] = [];

        const script = await queries._getScript({ scriptId, returnDraftIfExists: true, });
        if (script.errors?.length) throw new Error(script.errors.join(', '));
        if (!script.data) throw new Error('Script not found');

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
                screenId: _ignoreScreenId,
                scriptId: _ignoreScriptId,
                position,
                ...s
            } = screen;

            let screenId = v4();
            if (preserveScreensIds && _ignoreScreenId) screenId = _ignoreScreenId;

            try {
                if (s.image1) {
                    const res = await processImage(s.image1);
                    s.image1 = res.image;
                }
                if (s.image2) {
                    const res = await processImage(s.image2);
                    s.image2 = res.image;
                }
                if (s.image3) {
                    const res = await processImage(s.image3);
                    s.image3 = res.image;
                }
            } catch (e: any) {
                logger.error('process image', e.message);
            }

            const res = await saveScreens({
                data: [{
                    ...s,
                    scriptId,
                    oldScriptId: script.data.oldScriptId,
                    screenId,
                    version: 1,
                }],
            });

            res.errors?.forEach(e => errors.push(`(screenId=${_ignoreScreenId}) ${e || ''}`));

            if (!res.errors?.length) saved++;
        }

        if (errors.length) return { errors, saved, success: false, };

        return { saved, success: true, };
    } catch (e: any) {
        logger.error('saveScriptScreens ERROR', e.message);
        return { saved: 0, success: false, errors: [e.message], };
    }
}

export async function saveScriptDiagnoses({
    diagnoses,
    scriptId,
    preserveDiagnosesIds,
}: {
    preserveDiagnosesIds?: boolean;
    scriptId: string;
    diagnoses: Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0]['diagnoses'];
}): Promise<{
    errors?: string[];
    success: boolean;
    saved: number;
}> {
    try {
        let saved = 0;
        const errors: string[] = [];

        const script = await queries._getScript({ scriptId, returnDraftIfExists: true, });
        if (script.errors?.length) throw new Error(script.errors.join(', '));
        if (!script.data) throw new Error('Script not found');

        for (const diagnosis of diagnoses) {
            const {
                id,
                publishDate,
                createdAt,
                updatedAt,
                isDraft,
                deletedAt,
                version,
                oldDiagnosisId,
                diagnosisId: _ignoreDiagnosisId,
                scriptId: _ignoreScriptId,
                position,
                ...d
            } = diagnosis;

            let diagnosisId = v4();
            if (preserveDiagnosesIds && _ignoreDiagnosisId) diagnosisId = _ignoreDiagnosisId;

            try {
                if (d.image1) {
                    const res = await processImage(d.image1);
                    d.image1 = res.image;
                }
                if (d.image2) {
                    const res = await processImage(d.image2);
                    d.image2 = res.image;
                }
                if (d.image3) {
                    const res = await processImage(d.image3);
                    d.image3 = res.image;
                }
            } catch (e: any) {
                logger.error('process image', e.message);
            }

            const res = await saveDiagnoses({
                data: [{
                    ...d,
                    scriptId,
                    oldScriptId: script.data.oldScriptId,
                    diagnosisId,
                    version: 1,
                }],
            });

            res.errors?.forEach(e => errors.push(`(diagnosisId=${_ignoreDiagnosisId}) ${e || ''}`));

            if (!res.errors?.length) saved++;
        }

        if (errors.length) return { errors, saved, success: false, };

        return { saved, success: true, };
    } catch (e: any) {
        logger.error('saveScriptDiagnoses ERROR', e.message);
        return { saved: 0, success: false, errors: [e.message], };
    }
}

export async function deleteScriptsItems({ scriptsIds, }: {
    scriptsIds: string[];
}): Promise<{
    errors?: string[];
    success: boolean;
}> {
    try {
        const errors: string[] = [];

        const delScreens = await deleteScreens({ scriptsIds, });
        delScreens.errors?.forEach(e => errors.push(e));

        const delDiagnoses = await deleteDiagnoses({ scriptsIds, });
        delDiagnoses.errors?.forEach(e => errors.push(e));

        if (errors.length) return { errors, success: false, };

        return { success: true, };
    } catch (e: any) {
        logger.error('deleteScriptsItems ERROR', e.message);
        return { success: false, errors: [e.message], };
    }
}

const saveScriptsWithItemsInfo = { scripts: 0, screens: 0, diagnoses: 0, drugsLibrary: 0, };

export async function saveScriptsWithItems({ data, }: {
    data: (Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0] & {
        overWriteScriptWithId?: string;
    })[];
}): Promise<{
    errors?: string[];
    success: boolean;
    info: typeof saveScriptsWithItemsInfo,
}> {
    const info = { ...saveScriptsWithItemsInfo };

    try {
        const errors: string[] = [];

        for (const { overWriteScriptWithId, ...script } of data) {
            const overWriteScript = !overWriteScriptWithId ? { data: null, } : await getScript({
                scriptId: overWriteScriptWithId,
                returnDraftIfExists: true,
            });

            overWriteScript.errors?.forEach(e => errors.push(e));
            if (errors.length) continue;

            if (overWriteScriptWithId && !overWriteScript?.data) {
                errors.push('Overwrite script was not found');
                continue;
            }

            if (overWriteScript?.data) {
                const res = await deleteScriptsItems({ scriptsIds: [overWriteScript.data.scriptId], });
                res.errors?.forEach(e => errors.push(e));
                if (errors.length) continue;
            }

            const {
                id,
                screens: copiedScreens = [],
                diagnoses: copiedDiagnoses = [],
                drugsLibrary = [],
                dataKeys = [],
                publishDate,
                createdAt,
                updatedAt,
                isDraft,
                deletedAt,
                version,
                oldScriptId,
                scriptId: _ignoreScriptId,
                position,
                printSections = [],
                reviewConfigurations = [],
                ...s 
            } = script;

            const oldScreensIdsMap: { [key: string]: string; } = {};
            const oldDiagnosesIdsMap: { [key: string]: string; } = {};

            let screens = copiedScreens.map(s => {
                const screenId = v4();
                oldScreensIdsMap[s.screenId] = screenId;
                if (s.oldScreenId) oldScreensIdsMap[s.oldScreenId] = screenId;
                return { 
                    ...s, 
                    screenId,
                };
            });

            screens = screens.map(s => {
                return {
                    ...s,
                    skipToScreenId: (!s.skipToScreenId ? null : oldScreensIdsMap[s.skipToScreenId]) || null,
                };
            });

            const diagnoses = copiedDiagnoses.map(d => {
                const diagnosisId = v4();
                oldDiagnosesIdsMap[d.diagnosisId] = diagnosisId;
                if (d.oldDiagnosisId) oldDiagnosesIdsMap[d.oldDiagnosisId] = diagnosisId;
                return { ...d, diagnosisId, };
            });

            const scriptId = overWriteScript?.data?.scriptId || v4();

            const res = await saveScripts({
                data: [{
                    ...s,
                    scriptId,
                    version: 1,
                    printSections: printSections.map(s => ({
                        ...s,
                        screensIds: s.screensIds.map(id => oldScreensIdsMap[id]).filter(id => id),
                    })),
                    reviewConfigurations: reviewConfigurations.map(c => ({
                        ...c,
                        screen: oldScreensIdsMap[c.screen],
                    })).filter(c => c.screen),
                }],
            });

            res.errors?.forEach(e => errors.push(e));
            if (errors.length) continue;

            info.scripts++;

            const saveScreens = await saveScriptScreens({ preserveScreensIds: true, scriptId, screens, });
            // saveScreens.errors?.forEach(e => errors.push(e));
            info.screens += saveScreens.saved;

            const saveDiagnoses = await saveScriptDiagnoses({ preserveDiagnosesIds: true, scriptId, diagnoses, });
            // saveDiagnoses.errors?.forEach(e => errors.push(e));
            info.diagnoses += saveDiagnoses.saved;

            if (dataKeys.length) await _saveDataKeysIfNotExist({ data: dataKeys, });

            if (drugsLibrary.length) {
                const saveDrugsLibrary = await drugsLibraryMutations._saveDrugsLibraryItemsIfKeysNotExist({ 
                    data: drugsLibrary.map(item => ({
                        ...item,
                        itemId: v4(),
                        createdAt: undefined!,
                        updatedAt: undefined!,
                        deletedAt: undefined!,
                        publishDate: undefined!,
                        id: undefined!,
                        position: undefined,
                    })),
                });
                // saveDrugsLibrary.errors?.forEach(e => errors.push(e));
                info.drugsLibrary += drugsLibrary.length;
            }
        }

        if (errors.length) return { success: false, errors, info, };

        return { success: true, info, };
    } catch (e: any) {
        logger.error('saveScriptsWithItems ERROR', e.message);
        return { success: false, errors: [e.message], info, };
    }
}

export async function copyScripts(params?: {
    scriptsIds?: string[];
    confirmCopyAll?: boolean;
    toRemoteSiteId?: string;
    fromRemoteSiteId?: string;
    overWriteScriptWithId?: string;
    broadcastAction?: boolean;
}): Promise<Awaited<ReturnType<typeof saveScriptsWithItems>>> {
    const info = { ...saveScriptsWithItemsInfo };

    const {
        scriptsIds = [],
        confirmCopyAll,
        toRemoteSiteId,
        fromRemoteSiteId,
        broadcastAction,
        overWriteScriptWithId,
    } = { ...params };

    try {
        if (!scriptsIds.length && !confirmCopyAll) throw new Error('You&apos;re about copy all the scripts, please confirm this action!');

        let scripts: GetScriptsWithItemsResponse = fromRemoteSiteId ? { data: [], } : await getScriptsWithItems({ scriptsIds });

        if (scripts.errors) return { success: false, errors: scripts.errors, info, };

        if (fromRemoteSiteId) {
            const axiosClient = await getSiteAxiosClient(fromRemoteSiteId);

            const res = await axiosClient.get('/api/scripts/with-items?' + queryString.stringify({
                scriptsIds: JSON.stringify(scriptsIds),
            }));

            const resData = res.data as Awaited<ReturnType<typeof getScriptsWithItems>>;

            if (resData.errors) return { success: false, errors: resData.errors, info, };

            scripts = resData;

            console.log('axiosClient', res.config.baseURL)

            scripts.data.forEach(({ screens, diagnoses }, i) => {
                const getImageUrl = (suffix: string) => {
                    let host = res.config.baseURL || '';
                    if (host.substring(host.length - 1, host.length) === '/') host = host.substring(0, host.length - 1);
                    if (suffix[0] === '/') suffix = suffix.substring(1, suffix.length);
                    return [host, suffix].filter(s => s).join('/');
                };

                screens.forEach((d, j) => {
                    if (d.image1?.data && d.image1?.fileId && !isValidUrl(d.image1.data)) {
                        scripts.data[i].screens[j].image1!.data = getImageUrl(d.image1.data);
                    }
                    if (d.image2?.data && d.image2?.fileId && !isValidUrl(d.image2.data)) {
                        scripts.data[i].screens[j].image2!.data = getImageUrl(d.image2.data);
                    }
                    if (d.image3?.data && d.image3?.fileId && !isValidUrl(d.image3.data)) {
                        scripts.data[i].screens[j].image3!.data = getImageUrl(d.image3.data);
                    }
                });

                diagnoses.forEach((d, j) => {
                    if (d.image1?.data && d.image1?.fileId && !isValidUrl(d.image1.data)) {
                        scripts.data[i].diagnoses[j].image1!.data = getImageUrl(d.image1.data);
                    }
                    if (d.image2?.data && d.image2?.fileId && !isValidUrl(d.image2.data)) {
                        scripts.data[i].diagnoses[j].image2!.data = getImageUrl(d.image2.data);
                    }
                    if (d.image3?.data && d.image3?.fileId && !isValidUrl(d.image3.data)) {
                        scripts.data[i].diagnoses[j].image3!.data = getImageUrl(d.image3.data);
                    }
                });
            });
        }

        let response: Awaited<ReturnType<typeof saveScriptsWithItems>> = { success: true, info, };

        if (scripts.data.length) {
            if (toRemoteSiteId) {
                const axiosClient = await getSiteAxiosClient(toRemoteSiteId);

                const res = await axiosClient.post('/api/scripts/with-items?', {
                    data: scripts.data.map(s => ({
                        ...s,
                        hospitalId: undefined!,
                        hospitalName: undefined!,
                    })),
                });

                response = res.data as Awaited<ReturnType<typeof saveScriptsWithItems>>;
            } else {
                response = await saveScriptsWithItems({
                    data: scripts.data.map(s => ({
                        ...s,
                        overWriteScriptWithId,
                        hospitalId: undefined!,
                        hospitalName: undefined!,
                    })),
                });
            }
        }

        if (broadcastAction && !response?.errors?.length) socket.emit('data_changed', 'copy_scripts');

        return response;
    } catch (e: any) {
        logger.error('copyScripts ERROR', e.response?.data?.errors?.join(', ') || e.message);
        return { errors: e.response?.data?.errors || [e.message], success: false, info, };
    }
}

export async function copyScreens(params?: {
    screensIds?: string[];
    fromScriptsIds?: string[];
    toScriptsIds?: string[];
    confirmCopyAll?: boolean;
    broadcastAction?: boolean;
}): Promise<{ success: boolean; errors?: string[]; copied: number; }> {
    let copied = 0;
    const {
        screensIds = [],
        fromScriptsIds = [],
        toScriptsIds = [],
        confirmCopyAll,
        broadcastAction,
    } = { ...params };

    try {
        const errors: string[] = [];

        const shouldConfirmCopyingAll = !fromScriptsIds.length && !screensIds.length;

        if (shouldConfirmCopyingAll && !confirmCopyAll) throw new Error('You&apos;re about to copy all the screens, please confirm this action!');

        const screens = await queries._getScreens({ scriptsIds: fromScriptsIds, screensIds, returnDraftsIfExist: true, });
        if (screens.errors?.length) throw new Error(screens.errors.join(', '));

        if (!toScriptsIds.length) {
            const screensGroupedByScriptId = screens.data.reduce((acc, s) => ({
                ...acc,
                [s.scriptId]: [...(acc[s.scriptId] || []), s],
            }), {} as { [key: string]: typeof screens.data; })

            for (const scriptId of Object.keys(screensGroupedByScriptId)) {
                const res = await saveScriptScreens({ scriptId, screens: screensGroupedByScriptId[scriptId], });
                res.errors?.forEach(e => errors.push(e));
                if (errors.length) continue;
                copied += res.saved;
            }
        } else {
            for (const scriptId of toScriptsIds) {
                const res = await saveScriptScreens({ scriptId, screens: screens.data, });
                res.errors?.forEach(e => errors.push(e));
                if (errors.length) continue;
                copied++;
            }
        }

        if (broadcastAction && !errors.length) socket.emit('data_changed', 'copy_scripts');

        return {
            copied,
            success: !errors.length,
            errors: errors.length ? errors : undefined,
        };
    } catch (e: any) {
        logger.error('copyScreens ERROR', e.message);
        return { errors: [e.message], success: false, copied, };
    }
}

export async function copyDiagnoses(params?: {
    diagnosesIds?: string[];
    fromScriptsIds?: string[];
    toScriptsIds?: string[];
    confirmCopyAll?: boolean;
    broadcastAction?: boolean;
}): Promise<{ success: boolean; errors?: string[]; copied: number; }> {
    let copied = 0;
    const {
        diagnosesIds = [],
        fromScriptsIds = [],
        toScriptsIds = [],
        confirmCopyAll,
        broadcastAction,
    } = { ...params };

    try {
        const errors: string[] = [];

        const shouldConfirmCopyingAll = !fromScriptsIds.length && !diagnosesIds.length;

        if (shouldConfirmCopyingAll && !confirmCopyAll) throw new Error('You&apos;re about to copy all the diagnoses, please confirm this action!');

        const diagnoses = await queries._getDiagnoses({ scriptsIds: fromScriptsIds, diagnosesIds, returnDraftsIfExist: true, });
        if (diagnoses.errors?.length) throw new Error(diagnoses.errors.join(', '));

        if (!toScriptsIds.length) {
            const diagnosesGroupedByScriptId = diagnoses.data.reduce((acc, s) => ({
                ...acc,
                [s.scriptId]: [...(acc[s.scriptId] || []), s],
            }), {} as { [key: string]: typeof diagnoses.data; })

            for (const scriptId of Object.keys(diagnosesGroupedByScriptId)) {
                const res = await saveScriptDiagnoses({ scriptId, diagnoses: diagnosesGroupedByScriptId[scriptId], });
                res.errors?.forEach(e => errors.push(e));
                if (errors.length) continue;
                copied += res.saved;
            }
        } else {
            for (const scriptId of toScriptsIds) {
                const res = await saveScriptDiagnoses({ scriptId, diagnoses: diagnoses.data, });
                res.errors?.forEach(e => errors.push(e));
                if (errors.length) continue;
                copied++;
            }
        }

        if (broadcastAction && !errors.length) socket.emit('data_changed', 'copy_scripts');

        return {
            copied,
            success: !errors.length,
            errors: errors.length ? errors : undefined,
        };
    } catch (e: any) {
        logger.error('copyDiagnoses ERROR', e.message);
        return { errors: [e.message], success: false, copied, };
    }
}

type Key = {
    name: string;
    label: string;
    dataType: string;
    refId?: string;
    uniqueKey?: string;
};

type GetScriptsDataKeysResponse = {
    errors?: string[];
    data: {
        dataKeys: DataKey[];
        scripts: {
            title: string;
            id: string;
            keys: Key[];
            drugsLibrary: (Key & {
                id: string;
                displayText: string;
            })[];
            diagnoses: (Key & {
                id: string;
                displayText: string;
                symptoms: Key[];
            })[];
            screens: (Key & {
                id: string;
                displayText: string;
                fields: (Key & {
                    items: Key[];
                })[];
                items: Key[];
            })[];
        }[];
    },
}

export async function getScriptsDataKeys({ 
    scriptsIds = [], 
    scripts: scriptsParam,
}: {
    scriptsIds: string[];
    scripts?: (Awaited<ReturnType<typeof queries._getScripts>>['data'][0] & {
        screens: Awaited<ReturnType<typeof queries._getScreens>>['data'][0][];
        diagnoses: Awaited<ReturnType<typeof queries._getDiagnoses>>['data'][0][];
        drugsLibrary: Awaited<ReturnType<typeof queries._getScriptsDrugsLibrary>>['data'][0][];
    })[];
}): Promise<GetScriptsDataKeysResponse> {
    try {
        const { data: scripts, } = scriptsParam ? { data: scriptsParam, } : await getScriptsWithItems({ scriptsIds, });

        let allKeys: GetScriptsDataKeysResponse['data']['scripts'][0]['keys'] = [];

        const scriptsKeys: GetScriptsDataKeysResponse['data']['scripts'] = scripts.map(({ screens, diagnoses, drugsLibrary, ...script }) => {
            const keys: typeof allKeys = [];

            const dffKeys = drugsLibrary.map(d => {
                const key: typeof keys[0] = {
                    name: d.key,
                    label: d.drug,
                    dataType: d.type,
                    uniqueKey: d.keyId,
                };
                keys.push(key);
                return {
                    ...key,
                    id: d.itemId,
                    displayText: d.drug,
                };
            });

            const diagnosesKeys = diagnoses.map(d => {
                let key: typeof keys[0] | null = {
                    name: d.key || d.name || '',
                    label: d.name || '',
                    dataType: 'diagnosis',
                    uniqueKey: d.keyId,
                };

                keys.push(key);

                const symptoms = (d.symptoms || []).map(item => {
                    const key: typeof keys[0] = {
                        name: item.name || '',
                        label: item.name || '',
                        dataType: `diagnosis_symptom_${item.type}`,
                        uniqueKey: item.keyId,
                    };
                    keys.push(key);
                    return key;
                });

                return {
                    ...key!,
                    symptoms,
                    id: d.diagnosisId,
                    displayText: d.name,
                };
            });

            const screensKeys = screens.map(s => {
                if (s.refId) {
                    const key: typeof keys[0] = {
                        name: s.refId || '',
                        label: s.refId || '',
                        dataType: 'ref_id',
                        refId: s.refId,
                        uniqueKey: s.refIdDataKey,
                    };

                    keys.push(key);
                }

                const key: typeof keys[0] = {
                    name: s.key || '',
                    label: s.label || '',
                    dataType: s.type,
                    refId: s.refId,
                    uniqueKey: s.keyId,
                };

                keys.push(key);

                const fields = s.fields.map(f => {
                    const dataType = `${f.type}`;
                    const key = {
                        name: f.key,
                        label: f.label || '',
                        dataType: dataType,
                        uniqueKey: f.keyId,
                    };

                    keys.push(key);
                    
                    const items = (f.items || []).map(f => {
                        const key: typeof keys[0] = {
                            name: f.value as string,
                            label: `${f.label || ''}`,
                            dataType: `${dataType}_option`,
                            uniqueKey: f.keyId,
                        };
                        keys.push(key);
                        return key;
                    });

                    return {
                        ...key,
                        items,
                    };
                });

                const items = s.items.map(f => {
                    let dataType = `${s.type}_option`;
                    if (['diagnosis'].includes(s.type)) dataType = s.type;
                    const key: typeof keys[0] = {
                        name: f.key || f.id,
                        label: f.label || '',
                        dataType: dataType,
                        uniqueKey: f.keyId,
                    };
                    keys.push(key);
                    return key;
                });

                return {
                    ...key!,
                    fields,
                    items,
                    id: s.screenId,
                    displayText: s.title,
                };
            });

            allKeys = [...allKeys, ...keys];

            return {
                title: script.title,
                id: script.scriptId,
                keys: keys.filter((k, i) => keys.map(k => JSON.stringify(k)).indexOf(JSON.stringify(k)) === i).filter(k => k.name || k.refId),
                drugsLibrary: dffKeys,
                diagnoses: diagnosesKeys,
                screens: screensKeys,
            };
        });

        const { data: dataKeys, } = await _getDataKeys();

        return { 
            data: {
                scripts: scriptsKeys,
                dataKeys: dataKeys.filter(k => {
                    return allKeys.map(k => JSON.stringify({
                        name: k.name,
                        dataType: k.dataType,
                    }).toLowerCase()).includes(JSON.stringify({
                        name: k.name,
                        dataType: k.dataType,
                    }).toLowerCase())
                }),
            }, 
        };
    } catch(e: any) {
        return {
            errors: [e.message],
            data: {
                scripts: [],
                dataKeys: [],
            },
        };
    }
}
