'use server';

import { v4 } from "uuid";
import queryString from "query-string";

import * as mutations from "@/databases/mutations/scripts";
import * as queries from "@/databases/queries/scripts";
import { _saveDrugsLibraryItemsUpdateIfExists, _saveDrugsLibraryItemsIfKeysNotExist } from "@/databases/mutations/drugs-library";
import { _saveDataKeys } from "@/databases/mutations/data-keys";
import { _getSiteApiKey, } from '@/databases/queries/sites';
import logger from "@/lib/logger";
import socket from "@/lib/socket";
import { getSiteAxiosClient } from "@/lib/server/axios";
import { isAllowed } from "./is-allowed";
import { isValidUrl } from "@/lib/urls";
import { processImage } from "@/lib/process-image";
import { _getDataKeys, DataKey } from "@/databases/queries/data-keys";
import { dataKeyToJSON, parseImportedDataKeys, scrapDataKeys } from "@/lib/data-keys";
import { _getDrugsLibraryItems } from "@/databases/queries/drugs-library";
import { _getEditorInfo } from "@/databases/queries/editor-info";
import { getIntegrityPolicyState } from "@/lib/integrity-policy";
import { createIntegrityImportSnapshot } from "./integrity-imports";

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

// DIAGNOSES
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

// PROBLEMS
export const countProblems: typeof queries._countProblems = async (...args) => {
    try {
        await isAllowed();
        return await queries._countProblems(...args);
    } catch (e: any) {
        logger.error('countProblems ERROR', e.message);
        return { errors: [e.message], data: queries._defaultProblemsCount, };
    }
};

export const getProblems: typeof queries._getProblems = async (...args) => {
    try {
        await isAllowed();
        return await queries._getProblems(...args);
    } catch (e: any) {
        logger.error('getProblems ERROR', e.message);
        return { errors: [e.message], data: [], };
    }
};

export const getProblem: typeof queries._getProblem = async (...args) => {
    await isAllowed();
    return await queries._getProblem(...args);
};

export const deleteProblems: typeof mutations._deleteProblems = async params => {
    try {
        const session = await isAllowed();
        return await mutations._deleteProblems({
            ...params,
            userId: session.user?.userId,
        });
    } catch (e: any) {
        logger.error('deleteProblems ERROR', e.message);
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
        logger.error('saveDiagnoses ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};

export const saveProblems: typeof mutations._saveProblems = async params => {
    try {
        const session = await isAllowed();
        return await mutations._saveProblems({
            ...params,
            userId: session.user?.userId,
        });
    } catch (e: any) {
        logger.error('saveProblems ERROR', e.message);
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
        problems: Awaited<ReturnType<typeof queries._getProblems>>['data'][0][];
        drugsLibrary: Awaited<ReturnType<typeof queries._getScriptsDrugsLibrary>>['data'][0][];
        dataKeys: Awaited<ReturnType<typeof scrapDataKeys>>;
    })[];
};

export async function getScriptsWithItems(params: Parameters<typeof queries._getScripts>[0]): Promise<GetScriptsWithItemsResponse> {
    const data: GetScriptsWithItemsResponse['data'] = [];
    const errors: string[] = [];

    try {
        const returnDraftsIfExist = params?.returnDraftsIfExist !== false;
        const scripts = await queries._getScripts({ ...params, returnDraftsIfExist });
        const { data: dataKeys, } = await _getDataKeys();

        scripts.errors?.forEach(e => errors.push(e));

        for (const s of scripts.data) {
            const screens = await queries._getScreens({ scriptsIds: [s.scriptId], returnDraftsIfExist, });
            const diagnoses = await queries._getDiagnoses({ scriptsIds: [s.scriptId], returnDraftsIfExist, });
            const problems = await queries._getProblems({ scriptsIds: [s.scriptId], returnDraftsIfExist, });
            const drugsLibrary = await queries._getScriptsDrugsLibrary({ scriptsIds: [s.scriptId], returnDraftsIfExist, });

            screens.errors?.forEach(e => errors.push(e));
            diagnoses.errors?.forEach(e => errors.push(e));
            problems.errors?.forEach(e => errors.push(e));

            const drugsLibraryItems = drugsLibrary.data
                .filter(d => {
                    const drugScreens = screens.data.filter(s => ['drugs', 'fluids', 'feeds'].includes(s.type));
                    return (
                        !!drugScreens.find(s => (s.drugs || []).map(d => d.key).includes(d.key)) ||
                        !!drugScreens.find(s => (s.fluids || []).map(d => d.key).includes(d.key)) ||
                        !!drugScreens.find(s => (s.feeds || []).map(d => d.key).includes(d.key))
                    );
                });

            const scrappedDataKeys = await scrapDataKeys({
                dataKeys,
                screens: screens.data,
                diagnoses: diagnoses.data,
                problems: problems.data,
                drugsLibrary: drugsLibraryItems,
            });

            data.push({
                ...s,
                screens: screens.data,
                diagnoses: diagnoses.data,
                problems: problems.data,
                dataKeys: scrappedDataKeys,
                drugsLibrary: drugsLibraryItems,
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
    draftOrigin,
}: {
    preserveScreensIds?: boolean;
    scriptId: string;
    draftOrigin?: "editor" | "data_key_sync" | "import" | "other";
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
                draftOrigin,
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
    draftOrigin,
}: {
    preserveDiagnosesIds?: boolean;
    scriptId: string;
    draftOrigin?: "editor" | "data_key_sync" | "import" | "other";
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
                draftOrigin,
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

export async function saveScriptProblems({
    problems,
    scriptId,
    preserveProblemsIds,
    draftOrigin,
}: {
    preserveProblemsIds?: boolean;
    scriptId: string;
    draftOrigin?: "editor" | "data_key_sync" | "import" | "other";
    problems: Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0]['problems'];
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

        for (const problem of problems) {
            const {
                id,
                publishDate,
                createdAt,
                updatedAt,
                isDraft,
                deletedAt,
                version,
                problemId: _ignoreProblemId,
                scriptId: _ignoreScriptId,
                position,
                ...d
            } = problem;

            let problemId = v4();
            if (preserveProblemsIds && _ignoreProblemId) problemId = _ignoreProblemId;

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

            const res = await saveProblems({
                data: [{
                    ...d,
                    scriptId,
                    oldScriptId: script.data.oldScriptId,
                    problemId,
                    version: 1,
                }],
                draftOrigin,
            });

            res.errors?.forEach(e => errors.push(`(problemId=${_ignoreProblemId}) ${e || ''}`));

            if (!res.errors?.length) saved++;
        }

        if (errors.length) return { errors, saved, success: false, };

        return { saved, success: true, };
    } catch (e: any) {
        logger.error('saveScriptProblems ERROR', e.message);
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

        const delProblems = await deleteProblems({ scriptsIds, });
        delProblems.errors?.forEach(e => errors.push(e));

        if (errors.length) return { errors, success: false, };

        return { success: true, };
    } catch (e: any) {
        logger.error('deleteScriptsItems ERROR', e.message);
        return { success: false, errors: [e.message], };
    }
}

const saveScriptsWithItemsInfo = { 
    scripts: 0, 
    screens: 0, 
    diagnoses: 0, 
    problems: 0,
    dffItems: 0,
    dataKeys: 0,
};

export async function saveScriptsWithItems({ data, }: {
    data: (Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0] & {
        overWriteScriptWithId?: string;
        draftOrigin?: "editor" | "data_key_sync" | "import" | "other";
    })[];
}): Promise<{
    errors?: string[];
    success: boolean;
    info: typeof saveScriptsWithItemsInfo,
    savedScriptIds?: string[];
}> {
    const info = { ...saveScriptsWithItemsInfo };
    const savedScriptIds: string[] = [];

    try {
        const errors: string[] = [];

        for (const { overWriteScriptWithId, draftOrigin, ...script } of data) {
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
                problems: copiedProblems = [],
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

            const problems = copiedProblems.map(d => {
                const diagnosisId = v4();
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
                        screensIds: s.screensIds.map((id: string) => oldScreensIdsMap[id]).filter((id: string | undefined | null): id is string => !!id),
                    })),
                    reviewConfigurations: reviewConfigurations.map(c => ({
                        ...c,
                        screen: oldScreensIdsMap[c.screen],
                    })).filter((c): c is typeof c & { screen: string } => !!c.screen),
                }],
                draftOrigin,
            });

            res.errors?.forEach(e => errors.push(e));
            if (errors.length) continue;

            const saveScreens = await saveScriptScreens({ preserveScreensIds: true, scriptId, screens, draftOrigin });
            saveScreens.errors?.forEach(e => errors.push(e));
            info.screens += saveScreens.saved;

            const saveDiagnoses = await saveScriptDiagnoses({ preserveDiagnosesIds: true, scriptId, diagnoses, draftOrigin });
            saveDiagnoses.errors?.forEach(e => errors.push(e));
            info.diagnoses += saveDiagnoses.saved;

            const saveProblems = await saveScriptProblems({ preserveProblemsIds: true, scriptId, problems, draftOrigin });
            saveProblems.errors?.forEach(e => errors.push(e));
            info.problems += saveProblems.saved;

            if (errors.length) continue;

            info.scripts++;
            savedScriptIds.push(scriptId);
        }

        if (errors.length) return { success: false, errors, info, savedScriptIds, };

        return { success: true, info, savedScriptIds, };
    } catch (e: any) {
        logger.error('saveScriptsWithItems ERROR', e.message);
        return { success: false, errors: [e.message], info, savedScriptIds, };
    }
}

export async function copyScripts(params?: {
    scriptsIds?: string[];
    confirmCopyAll?: boolean;
    toRemoteSiteId?: string;
    fromRemoteSiteId?: string;
    overWriteScriptWithId?: string;
    broadcastAction?: boolean;
    overwriteDataKeys?: boolean;
    overwriteDrugsLibraryItems?: boolean;
}): Promise<Awaited<ReturnType<typeof saveScriptsWithItems>> & {
    warnings?: string[];
    integrityImportReview?: {
        snapshotId: string | null;
        totalBlockingIssues: number;
        totalScripts: number;
        requiresAcceptance: boolean;
        details: Awaited<ReturnType<typeof createIntegrityImportSnapshot>>["reviewDetails"];
    } | null;
}> {
    const { data: localDataKeys, } = await _getDataKeys();
    const info = { ...saveScriptsWithItemsInfo };

    const {
        scriptsIds = [],
        confirmCopyAll,
        toRemoteSiteId,
        fromRemoteSiteId,
        broadcastAction,
        overWriteScriptWithId,
        overwriteDataKeys,
        overwriteDrugsLibraryItems,
    } = { ...params };

    try {
        const session = await isAllowed();

        let importedDataKeys: Awaited<ReturnType<typeof _getDataKeys>>['data'] = [];
        let scrappedDataKeys: Awaited<ReturnType<typeof scrapDataKeys>> = [];
        let importedDataKeyAffectedScriptIds: string[] = [];

        if (!scriptsIds.length && !confirmCopyAll) throw new Error('You&apos;re about copy all the scripts, please confirm this action!');

        let scripts: GetScriptsWithItemsResponse = fromRemoteSiteId ? { data: [], } : await getScriptsWithItems({ scriptsIds });
        let dataKeysToSave: Awaited<ReturnType<typeof parseImportedDataKeys>>['dataKeys'] = [];
        let dffItemsToSave: Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0]['drugsLibrary'] = [];

        if (scripts.errors) return { success: false, errors: scripts.errors, info, };

        if (fromRemoteSiteId) {
            const axiosClient = await getSiteAxiosClient(fromRemoteSiteId);

            const { data: importedDataKeysRes } = await axiosClient.get<Awaited<ReturnType<typeof _getDataKeys>>>('/api/data-keys');
            importedDataKeys = importedDataKeysRes.data;

            const res = await axiosClient.get('/api/scripts/with-items?' + queryString.stringify({
                scriptsIds: JSON.stringify(scriptsIds),
            }));
            const resData = res.data as Awaited<ReturnType<typeof getScriptsWithItems>>;

            if (resData.errors) return { success: false, errors: resData.errors, info, };

            scripts = resData;


            scripts.data.forEach(({ screens, diagnoses, problems, dataKeys, drugsLibrary }, i) => {
                const getImageUrl = (suffix: string) => {
                    let host = res.config.baseURL || '';
                    if (host.substring(host.length - 1, host.length) === '/') host = host.substring(0, host.length - 1);
                    if (suffix[0] === '/') suffix = suffix.substring(1, suffix.length);
                    return [host, suffix].filter(s => s).join('/');
                };

                scrappedDataKeys = [...scrappedDataKeys, ...dataKeys];
                dffItemsToSave = [...dffItemsToSave, ...drugsLibrary];

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

                problems.forEach((p, j) => {
                    if (p.image1?.data && p.image1?.fileId && !isValidUrl(p.image1.data)) {
                        scripts.data[i].problems[j].image1!.data = getImageUrl(p.image1.data);
                    }
                    if (p.image2?.data && p.image2?.fileId && !isValidUrl(p.image2.data)) {
                        scripts.data[i].problems[j].image2!.data = getImageUrl(p.image2.data);
                    }
                    if (p.image3?.data && p.image3?.fileId && !isValidUrl(p.image3.data)) {
                        scripts.data[i].problems[j].image3!.data = getImageUrl(p.image3.data);
                    }
                });
            });

            let index = -1;
            for (const s of scripts.data) {
                index++;
                const { dataKeys, screens, diagnoses, problems, drugsLibrary, } = await parseImportedDataKeys({
                    localDataKeys,
                    importedDataKeys,
                    importedScrappedKeys: scrappedDataKeys,
                    importedScreens: s.screens,
                    importedDiagnoses: s.diagnoses,
                    importedProblems: s.problems,
                    importedDrugsLibraryItems: s.drugsLibrary,
                });
                scripts.data[index].screens = screens as unknown as typeof s.screens;
                scripts.data[index].diagnoses = diagnoses as unknown as typeof s.diagnoses;
                scripts.data[index].problems = problems as unknown as typeof s.problems;
                scripts.data[index].drugsLibrary = drugsLibrary as unknown as typeof s.drugsLibrary;
                
                dataKeys.filter(k => k.canSave).forEach(k => dataKeysToSave.push(k));

                dataKeysToSave = dataKeysToSave.filter(k => {
                    return overwriteDataKeys || k.isNew;
                });
            }
        }

        let response: Awaited<ReturnType<typeof saveScriptsWithItems>> & {
            warnings?: string[];
            integrityImportReview?: {
                snapshotId: string | null;
                totalBlockingIssues: number;
                totalScripts: number;
                requiresAcceptance: boolean;
                details: Awaited<ReturnType<typeof createIntegrityImportSnapshot>>["reviewDetails"];
            } | null;
        } = { success: true, info, };

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
                        draftOrigin: fromRemoteSiteId ? 'import' : 'editor',
                        hospitalId: undefined!,
                        hospitalName: undefined!,
                    })),
                });
            }
        }

        if (!response.success || response.errors?.length) {
            return response;
        }

        if (dffItemsToSave.length) {
            const { data: dffItems, } = await _getDrugsLibraryItems();
            const res = overwriteDrugsLibraryItems ? 
                await _saveDrugsLibraryItemsUpdateIfExists({ data: dffItemsToSave, userId: session.user?.userId, })
                :
                await _saveDrugsLibraryItemsIfKeysNotExist({ data: dffItemsToSave, userId: session.user?.userId, });
            if (res.success) response.info.dffItems = dffItemsToSave.length;
        }

        if (dataKeysToSave.length) {
            const res = await _saveDataKeys({
                data: dataKeysToSave,
                userId: session.user?.userId,
                draftOrigin: fromRemoteSiteId ? 'import' : 'editor',
                propagatedDraftOrigin: fromRemoteSiteId ? 'import' : 'data_key_sync',
            });
            if (res.success) {
                response.info.dataKeys = dataKeysToSave.length;
                importedDataKeyAffectedScriptIds = ((("info" in res) ? res.info?.refs?.affected?.scripts : []) || [])
                    .map((script: { scriptId?: string | null }) => script.scriptId)
                    .filter((value): value is string => !!value);
            }
        }

        if (
            fromRemoteSiteId &&
            !toRemoteSiteId &&
            response.success &&
            !response.errors?.length &&
            response.savedScriptIds?.length
        ) {
            const integrityReviewScriptIds = Array.from(new Set([
                ...(response.savedScriptIds || []),
                ...importedDataKeyAffectedScriptIds,
            ]));

            const [editorInfoRes, importedScriptsRes, currentDataKeysRes] = await Promise.all([
                _getEditorInfo(),
                getScriptsWithItems({
                    scriptsIds: integrityReviewScriptIds,
                    returnDraftsIfExist: true,
                }),
                _getDataKeys(),
            ]);

            const importErrors = [
                ...(editorInfoRes.errors || []),
                ...(importedScriptsRes.errors || []),
                ...(currentDataKeysRes.errors || []),
            ];

            if (importErrors.length) {
                response.warnings = [
                    ...(response.warnings || []),
                    ...importErrors.map((error) => `Imported successfully, but integrity review could not be prepared: ${error}`),
                ];
                return response;
            }

            const integrityPolicy = getIntegrityPolicyState(editorInfoRes.data).policy;
            if (integrityPolicy.triggerSources.imports && integrityPolicy.enforcementMode !== "off") {
                const importedScripts = importedScriptsRes.data;
                const directlyImportedScripts = importedScripts.filter((script) => response.savedScriptIds?.includes(script.scriptId));
                const importedDataKeyIds = currentDataKeysRes.data
                    .filter((dataKey) => dataKeysToSave.some((savedKey) => savedKey.uniqueKey === dataKey.uniqueKey))
                    .map((dataKey) => dataKey.uuid)
                    .filter((value): value is string => !!value);

                const importSnapshot = await createIntegrityImportSnapshot({
                    actorUserId: session.user?.userId || null,
                    policy: integrityPolicy,
                    sourceType: "script_import",
                    sourceLabel: directlyImportedScripts.length === 1
                        ? directlyImportedScripts[0]?.title || directlyImportedScripts[0]?.printTitle || "Imported script"
                        : `${directlyImportedScripts.length || response.savedScriptIds?.length || 0} imported scripts`,
                    importedScriptIds: integrityReviewScriptIds,
                    importedDataKeyIds,
                    metadata: {
                        fromRemoteSiteId,
                        overwriteDataKeys: !!overwriteDataKeys,
                        overwriteDrugsLibraryItems: !!overwriteDrugsLibraryItems,
                        overWriteScriptWithId: overWriteScriptWithId || null,
                    },
                    dataKeys: currentDataKeysRes.data,
                    screens: importedScripts.flatMap((script) => script.screens || []),
                    diagnoses: importedScripts.flatMap((script) => script.diagnoses || []),
                    problems: importedScripts.flatMap((script) => script.problems || []),
                });

                response.integrityImportReview = {
                    snapshotId: importSnapshot.snapshotId,
                    totalBlockingIssues: importSnapshot.snapshot.totalBlockingIssues,
                    totalScripts: importSnapshot.snapshot.totalScripts,
                    requiresAcceptance: !!importSnapshot.snapshotId,
                    details: importSnapshot.reviewDetails,
                };
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

export async function copyProblems(params?: {
    problemsIds?: string[];
    fromScriptsIds?: string[];
    toScriptsIds?: string[];
    confirmCopyAll?: boolean;
    broadcastAction?: boolean;
}): Promise<{ success: boolean; errors?: string[]; copied: number; }> {
    let copied = 0;
    const {
        problemsIds = [],
        fromScriptsIds = [],
        toScriptsIds = [],
        confirmCopyAll,
        broadcastAction,
    } = { ...params };

    try {
        const errors: string[] = [];

        const shouldConfirmCopyingAll = !fromScriptsIds.length && !problemsIds.length;

        if (shouldConfirmCopyingAll && !confirmCopyAll) throw new Error('You&apos;re about to copy all the problems, please confirm this action!');

        const problems = await queries._getProblems({ scriptsIds: fromScriptsIds, problemsIds, returnDraftsIfExist: true, });
        if (problems.errors?.length) throw new Error(problems.errors.join(', '));

        if (!toScriptsIds.length) {
            const problemsGroupedByScriptId = problems.data.reduce((acc, s) => ({
                ...acc,
                [s.scriptId]: [...(acc[s.scriptId] || []), s],
            }), {} as { [key: string]: typeof problems.data; })

            for (const scriptId of Object.keys(problemsGroupedByScriptId)) {
                const res = await saveScriptProblems({ scriptId, problems: problemsGroupedByScriptId[scriptId], });
                res.errors?.forEach(e => errors.push(e));
                if (errors.length) continue;
                copied += res.saved;
            }
        } else {
            for (const scriptId of toScriptsIds) {
                const res = await saveScriptProblems({ scriptId, problems: problems.data, });
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
        logger.error('copyProblems ERROR', e.message);
        return { errors: [e.message], success: false, copied, };
    }
}
