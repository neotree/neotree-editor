import queryString from 'query-string';

import { broadcastActionInProgress as _broadcastActionInProgress, BROADCAST_ACTIONS_IN_PROGRESS }from '@/lib/in-progress';
import { getSiteAxiosClient }from '@/lib/server/axios';
import logger from '@/lib/logger';
import {
    type GetDataKeysParams,
    type GetDataKeysResults,
}from '@/databases/queries/data-keys';
import {
    type GetDrugsLibraryItemsParams,
    type GetDrugsLibraryItemsResults,
}from '@/databases/queries/drugs-library';
import {
    type GetScriptsParams,
    type GetScriptsResults,
    type GetScreensResults,
    type GetScreensParams,
    type GetDiagnosesResults,
    type GetDiagnosesParams,
    type GetProblemsResults,
    type GetProblemsParams,
}from '@/databases/queries/scripts';
import {
    _getFiles,
} from '@/databases/queries/files';
import { scrapDataKeys } from '@/lib/data-keys';
import { parseFileReferences, uploadReferencedFileIfMissing } from '@/lib/files';
import { FileReference } from '@/types';
import { GetFilesResults } from '@/databases/queries/files/types';

const UPLOAD_FILES_CONCURRENCY = 6;

/** Runs tasks with a bounded concurrency so a large file list doesn't fire all requests at once. */
async function runWithConcurrency<T>(items: T[], limit: number, task: (item: T) => Promise<void>): Promise<void> {
    let nextIndex = 0;
    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (nextIndex < items.length) {
            const item = items[nextIndex++];
            await task(item);
        }
    });
    await Promise.all(workers);
}

async function broadcastActionInProgress (
    requestKey: string | undefined, 
    action: string, 
    loading: boolean
) {
    if (requestKey) {
        _broadcastActionInProgress(requestKey!, action, loading);
    }
}

type LoadFnParams = {
    remoteSiteId: string;
    requestKey?: string;
    throwError?: boolean;
    logTime?: boolean;
    axiosClient?: Awaited<ReturnType<typeof getSiteAxiosClient>>;
};

type LoadScriptsParams = GetScriptsParams & LoadFnParams;

type LoadRemoteResultsExtra = {
    time: number;
};

export const loadRemoteScripts = async ({
    remoteSiteId,
    requestKey,
    logTime = true,
    throwError,
    axiosClient,
    ...params
}: LoadScriptsParams): Promise<GetScriptsResults & LoadRemoteResultsExtra> => {
    let time = 0;

    try {
        const startedAt = Date.now();
        axiosClient = axiosClient || await getSiteAxiosClient(remoteSiteId);

        await broadcastActionInProgress(requestKey, BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_scripts, true);

        const url = '/api/scripts?' + queryString.stringify({
            data: JSON.stringify({
                returnDraftsIfExist: false,
                ...params
            }),
        });

        const scriptsRes = await axiosClient.get<GetScriptsResults>(url);

        time = Date.now() - startedAt;

        if (logTime) logger.log('loadRemoteScripts TIMINGS', { url, totalMs: time, });

        await broadcastActionInProgress(requestKey, BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_scripts, false);

        const data = scriptsRes.data;

        if (throwError && data.errors?.length) throw new Error(data.errors .join(', '));

        return { ...data, time, };
    } catch(e: any) {
        if (throwError) throw e;
        return { data: [], errors: [e.message], time, };
    }
};

export const loadRemoteScreens = async ({
    remoteSiteId,
    requestKey,
    logTime = true,
    throwError,
    axiosClient,
    ...params
}: GetScreensParams & LoadFnParams): Promise<GetScreensResults & LoadRemoteResultsExtra> => {
    let time = 0;
    try {
        const startedAt = Date.now();
        axiosClient = axiosClient || await getSiteAxiosClient(remoteSiteId);

        await broadcastActionInProgress(requestKey, BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_screens, true);

        const url = '/api/screens?' + queryString.stringify({
            data: JSON.stringify({
                returnDraftsIfExist: false,
                ...params
            }),
        });

        const screensRes = await axiosClient.get<GetScreensResults>(url);

        time = Date.now() - startedAt;

        if (logTime) logger.log('loadRemoteScreens TIMINGS', { url, totalMs: time, });

        await broadcastActionInProgress(requestKey, BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_screens, false);

        const res = screensRes.data;

        if (throwError && res.errors?.length) throw new Error(res.errors .join(', '));

        const { screens, } = parseFileReferences({ 
            siteUrl: axiosClient.defaults.baseURL, 
            screens: res.data, 
        });

        res.data = screens;

        return { ...res, time, };
    } catch(e: any) {
        if (throwError) throw e;
        return { data: [], errors: [e.message], time, };
    }
};

export const loadRemoteDiagnoses = async ({
    remoteSiteId,
    requestKey,
    logTime = true,
    throwError,
    axiosClient,
    ...params
}: GetDiagnosesParams & LoadFnParams): Promise<GetDiagnosesResults & LoadRemoteResultsExtra> => {
    let time = 0;

    try {
        const startedAt = Date.now();
        axiosClient = axiosClient || await getSiteAxiosClient(remoteSiteId);

        await broadcastActionInProgress(requestKey, BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_diagnoses, true);

        const url = '/api/diagnoses?' + queryString.stringify({
            data: JSON.stringify({
                returnDraftsIfExist: false,
                ...params
            }),
        });

        const diagnosesRes = await axiosClient.get<GetDiagnosesResults>(url);

        time = Date.now() - startedAt;

        if (logTime) logger.log('loadRemoteDiagnoses TIMINGS', { url, totalMs: time, });

        await broadcastActionInProgress(requestKey, BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_diagnoses, false);

        const res = diagnosesRes.data;

        if (throwError && res.errors?.length) throw new Error(res.errors .join(', '));

        const { diagnoses, } = parseFileReferences({ 
            siteUrl: axiosClient.defaults.baseURL, 
            diagnoses: res.data, 
        });

        res.data = diagnoses;

        return { ...res, time, };
    } catch(e: any) {
        if (throwError) throw e;
        return { data: [], errors: [e.message], time, };
    }
};

export const loadRemoteProblems = async ({
    remoteSiteId,
    requestKey,
    logTime = true,
    throwError,
    axiosClient,
    ...params
}: GetProblemsParams & LoadFnParams): Promise<GetProblemsResults & LoadRemoteResultsExtra> => {
    let time = 0;

    try {
        const startedAt = Date.now();
        axiosClient = axiosClient || await getSiteAxiosClient(remoteSiteId);

        await broadcastActionInProgress(requestKey, BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_problems, true);

        const url = '/api/problems?' + queryString.stringify({
            data: JSON.stringify({
                returnDraftsIfExist: false,
                ...params
            }),
        });

        const problemsRes = await axiosClient.get<GetProblemsResults>(url);
        
        time = Date.now() - startedAt;

        if (logTime) logger.log('loadRemoteProblems TIMINGS', { url, totalMs: time, });

        await broadcastActionInProgress(requestKey, BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_problems, false);

        const res = problemsRes.data;

        if (throwError && res.errors?.length) throw new Error(res.errors .join(', '));

        const { problems, } = parseFileReferences({ 
            siteUrl: axiosClient.defaults.baseURL, 
            problems: res.data, 
        });

        res.data = problems;

        return { ...res, time, };
    } catch(e: any) {
        if (throwError) throw e;
        return { data: [], errors: [e.message], time, };
    }
};

export const loadRemoteDrugsLibraryItems = async ({
    remoteSiteId,
    requestKey,
    logTime = true,
    throwError,
    axiosClient,
    ...params
}: GetDrugsLibraryItemsParams & LoadFnParams): Promise<GetDrugsLibraryItemsResults & LoadRemoteResultsExtra> => {
    let time = 0;

    try {
        const startedAt = Date.now();
        axiosClient = axiosClient || await getSiteAxiosClient(remoteSiteId);

        await broadcastActionInProgress(requestKey, BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_dff, true);

        const url = '/api/problems?' + queryString.stringify({
            data: JSON.stringify({
                returnDraftsIfExist: false,
                ...params
            }),
        });

        const problemsRes = await axiosClient.get<GetDrugsLibraryItemsResults>(url);

        time = Date.now() - startedAt;

        if (logTime) logger.log('loadRemoteDrugsLibraryItems TIMINGS', { url, totalMs: time, });

        await broadcastActionInProgress(requestKey, BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_dff, false);

        const data = problemsRes.data;

        if (throwError && data.errors?.length) throw new Error(data.errors .join(', '));

        return { ...data, time, };
    } catch(e: any) {
        if (throwError) throw e;
        return { data: [], errors: [e.message], time, };
    }
};

export const loadRemoteDataKeys = async ({
    remoteSiteId,
    requestKey,
    logTime = true,
    throwError,
    axiosClient,
    ...params
}: GetDataKeysParams & LoadFnParams): Promise<GetDataKeysResults & LoadRemoteResultsExtra> => {
    let time = 0;

    try {
        const startedAt = Date.now();
        axiosClient = axiosClient || await getSiteAxiosClient(remoteSiteId);

        await broadcastActionInProgress(requestKey, BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_datakeys, true);

        const url = '/api/data-keys?' + queryString.stringify({
            data: JSON.stringify({
                returnDraftsIfExist: false,
                ...params
            }),
        });

        const datakeysRes = await axiosClient.get<GetDataKeysResults>(url);

        time = Date.now() - startedAt;

        if (logTime) logger.log('loadRemoteDataKeys TIMINGS', { url, totalMs: time, });

        await broadcastActionInProgress(requestKey, BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_datakeys, false);

        const data = datakeysRes.data;

        if (throwError && data.errors?.length) throw new Error(data.errors .join(', '));

        return { ...data, time, };
    } catch(e: any) {
        if (throwError) throw e;
        return { data: [], errors: [e.message], time, };
    }
};

export const loadRemoteScriptsWithItems = async ({
    dataKeys: dataKeysParam,
    ...params
}: LoadScriptsParams & {
    dataKeys?: GetDataKeysResults['data'];
}): Promise<{
    time: number;
    errors: GetScriptsResults['errors'];
    files: FileReference[];
    data: (GetScriptsResults['data'][0] & {
        screens: GetScreensResults['data'];
        problems: GetProblemsResults['data'];
        diagnoses: GetDiagnosesResults['data'];
        drugsLibrary: GetDrugsLibraryItemsResults['data'];
        dataKeys: Awaited<ReturnType<typeof scrapDataKeys>>;
    })[];
}> => {
    let time = 0;

    const {
        remoteSiteId,
        requestKey,
        throwError,
    } = params;

    try {
        const startedAt = Date.now();

        const axiosClient = params.axiosClient || await getSiteAxiosClient(remoteSiteId);

        const dataKeys: Awaited<ReturnType<typeof loadRemoteDataKeys>> = dataKeysParam?.length ? 
            { data: dataKeysParam, time: 0, } 
            : 
            await loadRemoteDataKeys({
                remoteSiteId,
                requestKey,
                axiosClient,
                logTime: false,
            });

        await broadcastActionInProgress(requestKey, BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_datakeys, false);

        const scripts = await loadRemoteScripts({
            ...params,
            logTime: false,
        });

        const scriptsIds = scripts.data.map(s => s.scriptId);

        const screens = await loadRemoteScreens({
            scriptsIds,
            remoteSiteId,
            requestKey,
            axiosClient,
            logTime: false,
        });

        const diagnoses = await loadRemoteDiagnoses({
            scriptsIds,
            remoteSiteId,
            requestKey,
            axiosClient,
            logTime: false,
        });

        const problems = await loadRemoteProblems({
            scriptsIds,
            remoteSiteId,
            requestKey,
            axiosClient,
            logTime: false,
        });

        const dffItemsIds = screens.data
            .filter(s => ['drugs', 'fluids', 'feeds'].includes(s.type))
            .reduce((acc, s) => {
                (s.drugs || []).forEach(f => acc.push(f.key));
                (s.feeds || []).forEach(f => acc.push(f.key));
                (s.fluids || []).forEach(f => acc.push(f.key));
                return acc;
            }, [] as string[]);

        const drugsLibrary: Awaited<ReturnType<typeof loadRemoteDrugsLibraryItems>> = !dffItemsIds.length ? 
            { data: [], time: 0, } 
            : 
            await loadRemoteDrugsLibraryItems({
                itemsIds: dffItemsIds,
                remoteSiteId,
                requestKey,
                axiosClient,
                logTime: false,
            });

        await broadcastActionInProgress(requestKey, BROADCAST_ACTIONS_IN_PROGRESS.loading_remote_dff, false);

        let errors: undefined | string[] = [
            ...(scripts.errors || []),
            ...(screens.errors || []),
            ...(diagnoses.errors || []),
            ...(problems.errors || []),
            ...(drugsLibrary.errors || []),
            ...(dataKeys.errors || []),
        ];

        const scrappedDataKeys = await scrapDataKeys({
            dataKeys: dataKeys.data,
            screens: screens.data,
            diagnoses: diagnoses.data,
            problems: problems.data,
            drugsLibrary: drugsLibrary.data,
        });

        const data = scripts.data.map(script => {
            return {
                ...script,
                screens: screens.data.filter(s => s.scriptId === script.scriptId),
                diagnoses: diagnoses.data.filter(s => s.scriptId === script.scriptId),
                problems: problems.data.filter(s => s.scriptId === script.scriptId),
                drugsLibrary: drugsLibrary.data,
                dataKeys: scrappedDataKeys,
            };
        });

        time = Date.now() - startedAt;

        logger.log('loadRemoteScriptsWithItems TIMINGS', {
            remoteSite: axiosClient.defaults.baseURL,
            totalMs: time,
            timings: {
                loadRemoteScripts: scripts.time,
                loadRemoteScreens: screens.time,
                loadRemoteDiagnoses: diagnoses.time,
                loadRemoteProblems: problems.time,
                loadRemoteDrugsLibraryItems: drugsLibrary.time,
                loadRemoteDataKeys: dataKeys.time,
            },
        });

        if (throwError && errors?.length) throw new Error(errors .join(', '));

        if (!errors.length) errors = undefined;

        const { files, } = parseFileReferences({ scripts: data, });

        return { 
            time,
            errors,
            data,
            files,
        };
    } catch(e: any) {
        if (throwError) throw e;
        return { data: [], files: [], errors: [e.message], time, };
    }
};

type UploadRemoteFilesResults = { 
    data: Record<string, FileReference & {
        uploaded?: boolean;
    }>; 
    errors?: string[];
} & LoadRemoteResultsExtra;

export const uploadRemoteFiles = async ({
    remoteSiteId,
    requestKey,
    logTime = true,
    throwError,
    axiosClient,
    files: filesParam,
}: { 
    files: FileReference[]; 
} & LoadFnParams): Promise<UploadRemoteFilesResults> => {
    let time = 0;

    try {
        await broadcastActionInProgress(requestKey, BROADCAST_ACTIONS_IN_PROGRESS.uploading_remote_files, true);
        
        const startedAt = Date.now();

        const filesIds = filesParam.filter(f => f.fileId).map(f => f.fileId!);

        let localFiles: Record<string, GetFilesResults['data'][0]> = {};

        if (filesIds.length) {
            const res = await _getFiles({
                filesIds,
                withAliases: true,
            });
            
            res.data.forEach(({ aliases = [], ...f }) => {
                localFiles[f.fileId] = f;
                aliases.forEach(a => {
                    localFiles[a.alias] = f;
                });
            });
        }

        filesParam = filesParam.filter(f => f.fileId && !localFiles[f.fileId]);

        axiosClient = axiosClient || await getSiteAxiosClient(remoteSiteId);

        const data: Record<string, UploadRemoteFilesResults['data'][0]> = {};
        let errors: string[] = [];

        Object.keys(localFiles).map(fileId => {
            const f = localFiles[fileId];
            data[fileId] = {
                ...f,
                data: f.url,
                uploaded: false,
            };
        });

        // Each file is a distinct, already-deduplicated fileId, so these are
        // independent network round trips — safe to run concurrently.
        await runWithConcurrency(filesParam, UPLOAD_FILES_CONCURRENCY, async (f) => {
            const res = await uploadReferencedFileIfMissing(f);
            if (res.errors?.length) errors = [...errors, ...res.errors];
            if (res.file) {
                data[f.fileId || f.data] = {
                    ...res.file,
                    uploaded: res.uploaded,
                };
            }
        });

        time = Date.now() - startedAt;

        if (logTime) logger.log('uploadRemoteFiles TIMINGS', { totalMs: time, });

        await broadcastActionInProgress(requestKey, BROADCAST_ACTIONS_IN_PROGRESS.uploading_remote_files, false);

        if (throwError && errors?.length) throw new Error(errors .join(', '));

        return { data, time, };
    } catch(e: any) {
        if (throwError) throw e;
        return { data: {}, errors: [e.message], time, };
    }
};
