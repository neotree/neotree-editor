'use server';

import { GetDataKeysParams, _getDataKeys } from '@/databases/queries/data-keys';
import { _saveDataKeys, _saveDataKeysIfNotExist, _saveDataKeysUpdateIfExist, _previewDataKeysRefsImpact } from '@/databases/mutations/data-keys';
import { _getDiagnoses, _getProblems, _getScreens } from '@/databases/queries/scripts';
import { _saveDiagnoses, _saveProblems, _saveScreens } from '@/databases/mutations/scripts';
import { getSiteAxiosClient } from "@/lib/server/axios";
import logger from "@/lib/logger";
import { isAllowed } from './is-allowed';
import { validateApiKey, validateHeadersItem } from './authenticate';
import { DataKeysUsageExportRow } from '@/types/data-keys-usage-export';
import db from '@/databases/pg/drizzle';
import { dataKeys, dataKeysDrafts, screens, screensDrafts } from '@/databases/pg/schema';
import { count, isNull, max } from 'drizzle-orm';
import { repairSingleDataKeyIntegrityReference, scanDataKeyIntegrity, type DataKeyIntegrityEntry } from '@/lib/data-key-integrity';

type PreparedIntegrityRepair = {
    entry: DataKeyIntegrityEntry;
    selectedTargetUniqueKey?: string;
    repairs: ReturnType<typeof repairSingleDataKeyIntegrityReference>;
    preparedAt: number;
};

type BulkIntegrityRepairItemInput = {
    entry: DataKeyIntegrityEntry;
    selectedTargetUniqueKey?: string;
    reviewed?: boolean;
};

const PREPARED_INTEGRITY_REPAIR_CACHE_TTL_MS = 2 * 60 * 1000;
const PREPARED_INTEGRITY_REPAIR_CACHE_KEY = '__prepared_data_key_integrity_repair_cache__';

function getPreparedIntegrityRepairStore(): Map<string, PreparedIntegrityRepair> {
    const globalWithCache = globalThis as typeof globalThis & {
        [PREPARED_INTEGRITY_REPAIR_CACHE_KEY]?: Map<string, PreparedIntegrityRepair>;
    };
    if (!globalWithCache[PREPARED_INTEGRITY_REPAIR_CACHE_KEY]) {
        globalWithCache[PREPARED_INTEGRITY_REPAIR_CACHE_KEY] = new Map<string, PreparedIntegrityRepair>();
    }
    return globalWithCache[PREPARED_INTEGRITY_REPAIR_CACHE_KEY]!;
}

function buildPreparedIntegrityRepairCacheId(userId: string | null | undefined, entry: DataKeyIntegrityEntry, selectedTargetUniqueKey?: string) {
    return `${userId || 'anonymous'}::${selectedTargetUniqueKey || ''}::${JSON.stringify(entry)}`;
}

function getPreparedIntegrityRepair(userId: string | null | undefined, entry: DataKeyIntegrityEntry, selectedTargetUniqueKey?: string) {
    const store = getPreparedIntegrityRepairStore();
    const cacheId = buildPreparedIntegrityRepairCacheId(userId, entry, selectedTargetUniqueKey);
    const cached = store.get(cacheId);
    if (!cached) return null;
    if ((Date.now() - cached.preparedAt) > PREPARED_INTEGRITY_REPAIR_CACHE_TTL_MS) {
        store.delete(cacheId);
        return null;
    }
    return cached;
}

function setPreparedIntegrityRepair(userId: string | null | undefined, payload: PreparedIntegrityRepair) {
    const store = getPreparedIntegrityRepairStore();
    const cacheId = buildPreparedIntegrityRepairCacheId(userId, payload.entry, payload.selectedTargetUniqueKey);
    store.set(cacheId, payload);
}

function clearPreparedIntegrityRepair(userId: string | null | undefined, entry: DataKeyIntegrityEntry, selectedTargetUniqueKey?: string) {
    getPreparedIntegrityRepairStore().delete(buildPreparedIntegrityRepairCacheId(userId, entry, selectedTargetUniqueKey));
}

async function prepareDataKeyIntegrityEntryRepair(entry: DataKeyIntegrityEntry, selectedTargetUniqueKey?: string) {
    const [dataKeysRes, screensRes, diagnosesRes, problemsRes] = await Promise.all([
        _getDataKeys({ returnDraftsIfExist: true }),
        _getScreens({ scriptsIds: [entry.scriptId], returnDraftsIfExist: true }),
        _getDiagnoses({ scriptsIds: [entry.scriptId], returnDraftsIfExist: true }),
        _getProblems({ scriptsIds: [entry.scriptId], returnDraftsIfExist: true }),
    ]);

    const errors = [
        ...(dataKeysRes.errors || []),
        ...(screensRes.errors || []),
        ...(diagnosesRes.errors || []),
        ...(problemsRes.errors || []),
    ];

    if (errors.length) {
        return {
            success: false as const,
            errors,
            repairs: null,
        };
    }

    return {
        success: true as const,
        errors: [] as string[],
        repairs: repairSingleDataKeyIntegrityReference({
            entry,
            dataKeys: dataKeysRes.data,
            screens: screensRes.data,
            diagnoses: diagnosesRes.data,
            problems: problemsRes.data,
            overrideTargetUniqueKey: selectedTargetUniqueKey,
        }),
    };
}

async function assertCanManageDataKeys(
    user?: { role?: string | null } | null,
    options?: { allowApiKeyAuth?: boolean; },
) {
    const role = user?.role;
    let allowed = role === 'super_user';
    let allowedByApiKey = false;

    if (!allowed && options?.allowApiKeyAuth) {
        allowedByApiKey = await validateHeadersItem('x-api-key', validateApiKey);
        allowed = allowedByApiKey;
    }

    if (!allowed) logger.error('assertCanManageDataKeys ERROR', JSON.stringify({ role, allowApiKeyAuth: !!options?.allowApiKeyAuth, allowedByApiKey }));
    if (!allowed) throw new Error('Forbidden: only super_user can add or edit data keys');
}

export const saveDataKeys: typeof _saveDataKeys = async params => {
    try {
        const session = await isAllowed();
        await assertCanManageDataKeys(session.user);
        return await _saveDataKeys({
            ...params,
            userId: session.user?.userId,
        });
    } catch (e: any) {
        logger.error('saveDataKeys ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
}

export const saveDataKeysIfNotExist: typeof _saveDataKeysIfNotExist = async params => {
    try {
        const session = await isAllowed();
        await assertCanManageDataKeys(session.user, { allowApiKeyAuth: true, });
        return await _saveDataKeysIfNotExist({
            ...params,
            userId: session.user?.userId,
        });
    } catch (e: any) {
        logger.error('saveDataKeysIfNotExist ERROR', e.message);
        return { errors: [e.message], success: false, };
    }
};

export const saveDataKeysUpdateIfExist: typeof _saveDataKeysUpdateIfExist = async params => {
    try {
        const session = await isAllowed();
        await assertCanManageDataKeys(session.user, { allowApiKeyAuth: true, });
        return await _saveDataKeysUpdateIfExist({
            ...params,
            userId: session.user?.userId,
        });
    } catch (e: any) {
        logger.error('saveDataKeysUpdateIfExist ERROR', e.message);
        return { errors: [e.message], success: false, };
    }
};

export const previewDataKeysRefsImpact: typeof _previewDataKeysRefsImpact = async params => {
    try {
        await isAllowed();
        return await _previewDataKeysRefsImpact(params);
    } catch (e: any) {
        logger.error('previewDataKeysRefsImpact ERROR', e.message);
        return { errors: [e.message], success: false, };
    }
}

export const getDataKeys = async (params?: GetDataKeysParams) => {
    const res = await _getDataKeys(params);
    return res;
}

export const getDataKeysIntegrity = async (params?: {
    scriptsIds?: string[];
    onlyIssues?: boolean;
}) => {
    try {
        await isAllowed();

        const [dataKeysRes, screensRes, diagnosesRes, problemsRes] = await Promise.all([
            _getDataKeys({ returnDraftsIfExist: true }),
            _getScreens({ scriptsIds: params?.scriptsIds, returnDraftsIfExist: true }),
            _getDiagnoses({ scriptsIds: params?.scriptsIds, returnDraftsIfExist: true }),
            _getProblems({ scriptsIds: params?.scriptsIds, returnDraftsIfExist: true }),
        ]);

        const errors = [
            ...(dataKeysRes.errors || []),
            ...(screensRes.errors || []),
            ...(diagnosesRes.errors || []),
            ...(problemsRes.errors || []),
        ];

        if (errors.length) {
            logger.error('getDataKeysIntegrity RETURNED_ERRORS', {
                scriptsIds: params?.scriptsIds || [],
                onlyIssues: params?.onlyIssues,
                errors,
            });
            return {
                success: false,
                data: null,
                errors,
            };
        }

        return {
            success: true,
            data: scanDataKeyIntegrity({
                dataKeys: dataKeysRes.data,
                screens: screensRes.data,
                diagnoses: diagnosesRes.data,
                problems: problemsRes.data,
                onlyIssues: params?.onlyIssues !== false,
            }),
        };
    } catch (e: any) {
        logger.error('getDataKeysIntegrity ERROR', e.message);
        return {
            success: false,
            data: null,
            errors: [e.message],
        };
    }
}

export const resolveDataKeyIntegrityEntry = async (params: {
    entry: DataKeyIntegrityEntry;
    selectedTargetUniqueKey?: string;
}) => {
    try {
        const session = await isAllowed();
        const cached = getPreparedIntegrityRepair(session.user?.userId, params.entry, params.selectedTargetUniqueKey);
        const prepared = cached
            ? {
                success: true as const,
                errors: [] as string[],
                repairs: cached.repairs,
            }
            : await prepareDataKeyIntegrityEntryRepair(params.entry, params.selectedTargetUniqueKey);

        if (!prepared.success) {
            logger.error('resolveDataKeyIntegrityEntry FETCH_ERRORS', {
                entry: params.entry,
                errors: prepared.errors,
                cacheHit: !!cached,
            });
            return {
                success: false,
                changed: false,
                reportAfter: null,
                errors: prepared.errors,
                warnings: [],
            };
        }
        const repairs = prepared.repairs;

        if (!repairs.screens.length && !repairs.diagnoses.length && !repairs.problems.length) {
            clearPreparedIntegrityRepair(session.user?.userId, params.entry, params.selectedTargetUniqueKey);
            return {
                success: true,
                changed: false,
                reportAfter: null,
                errors: [],
                warnings: [],
            };
        }

        const warnings: string[] = [];

        if (repairs.screens.length) {
            const repairedScreens = await _saveScreens({
                data: repairs.screens,
                userId: session.user?.userId,
            });
            if (repairedScreens.errors?.length) {
                logger.error('resolveDataKeyIntegrityEntry SAVE_SCREENS_ERRORS', {
                    entry: params.entry,
                    screensCount: repairs.screens.length,
                    errors: repairedScreens.errors,
                });
                return {
                    success: false,
                    changed: false,
                    reportAfter: null,
                    errors: repairedScreens.errors,
                    warnings: repairedScreens.warnings || [],
                };
            }
            warnings.push(...(repairedScreens.warnings || []));
        }

        if (repairs.diagnoses.length) {
            const repairedDiagnoses = await _saveDiagnoses({
                data: repairs.diagnoses,
                userId: session.user?.userId,
            });
            if (repairedDiagnoses.errors?.length) {
                logger.error('resolveDataKeyIntegrityEntry SAVE_DIAGNOSES_ERRORS', {
                    entry: params.entry,
                    diagnosesCount: repairs.diagnoses.length,
                    errors: repairedDiagnoses.errors,
                });
                return {
                    success: false,
                    changed: false,
                    reportAfter: null,
                    errors: repairedDiagnoses.errors,
                    warnings,
                };
            }
        }

        if (repairs.problems.length) {
            const repairedProblems = await _saveProblems({
                data: repairs.problems,
                userId: session.user?.userId,
            });
            if (repairedProblems.errors?.length) {
                logger.error('resolveDataKeyIntegrityEntry SAVE_PROBLEMS_ERRORS', {
                    entry: params.entry,
                    problemsCount: repairs.problems.length,
                    errors: repairedProblems.errors,
                });
                return {
                    success: false,
                    changed: false,
                    reportAfter: null,
                    errors: repairedProblems.errors,
                    warnings,
                };
            }
        }
        clearPreparedIntegrityRepair(session.user?.userId, params.entry, params.selectedTargetUniqueKey);

        return {
            success: true,
            changed: true,
            reportAfter: null,
            errors: [],
            warnings,
        };
    } catch (e: any) {
        logger.error('resolveDataKeyIntegrityEntry ERROR', {
            entry: params.entry,
            error: e.message,
            stack: e.stack,
        });
        return {
            success: false,
            changed: false,
            reportAfter: null,
            errors: [e.message],
            warnings: [],
        };
    }
}

export const resolveDataKeyIntegrityEntriesBulk = async (params: {
    entries?: DataKeyIntegrityEntry[];
    items?: BulkIntegrityRepairItemInput[];
}) => {
    try {
        const session = await isAllowed();
        const items: BulkIntegrityRepairItemInput[] = (params.items?.length
            ? params.items
            : (params.entries || []).map((entry) => ({ entry })))
            .filter((item) => item?.entry);
        const reviewedItems = items.filter((item) => item.reviewed !== false);
        const entries = reviewedItems.map((item) => item.entry);

        if (!reviewedItems.length) {
            return {
                success: true,
                changed: false,
                resolvedCount: 0,
                errors: [],
                warnings: [],
            };
        }

        const scriptIds = Array.from(new Set(entries.map((entry) => entry.scriptId).filter(Boolean)));
        if (scriptIds.length !== 1) {
            return {
                success: false,
                changed: false,
                resolvedCount: 0,
                errors: ['Bulk resolve currently supports one script at a time'],
                warnings: [],
            };
        }

        const [dataKeysRes, screensRes, diagnosesRes, problemsRes] = await Promise.all([
            _getDataKeys({ returnDraftsIfExist: true }),
            _getScreens({ scriptsIds: [scriptIds[0]], returnDraftsIfExist: true }),
            _getDiagnoses({ scriptsIds: [scriptIds[0]], returnDraftsIfExist: true }),
            _getProblems({ scriptsIds: [scriptIds[0]], returnDraftsIfExist: true }),
        ]);

        const fetchErrors = [
            ...(dataKeysRes.errors || []),
            ...(screensRes.errors || []),
            ...(diagnosesRes.errors || []),
            ...(problemsRes.errors || []),
        ];
        if (fetchErrors.length) {
            logger.error('resolveDataKeyIntegrityEntriesBulk FETCH_ERRORS', {
                entriesCount: entries.length,
                scriptId: scriptIds[0],
                errors: fetchErrors,
            });
            return {
                success: false,
                changed: false,
                resolvedCount: 0,
                errors: fetchErrors,
                warnings: [],
            };
        }

        let currentScreens = screensRes.data;
        let currentDiagnoses = diagnosesRes.data;
        let currentProblems = problemsRes.data;
        let resolvedCount = 0;
        const warnings: string[] = [];

        for (const item of reviewedItems) {
            const entry = item.entry;
            const repairs = repairSingleDataKeyIntegrityReference({
                entry,
                dataKeys: dataKeysRes.data,
                screens: currentScreens,
                diagnoses: currentDiagnoses,
                problems: currentProblems,
                overrideTargetUniqueKey: item.selectedTargetUniqueKey,
            });

            if (!repairs.screens.length && !repairs.diagnoses.length && !repairs.problems.length) continue;

            resolvedCount++;
            if (repairs.screens.length) {
                currentScreens = currentScreens.map((screen) => repairs.screens.find((item) => item.screenId === screen.screenId) || screen);
            }
            if (repairs.diagnoses.length) {
                currentDiagnoses = currentDiagnoses.map((diagnosis) => repairs.diagnoses.find((item) => item.diagnosisId === diagnosis.diagnosisId) || diagnosis);
            }
            if (repairs.problems.length) {
                currentProblems = currentProblems.map((problem) => repairs.problems.find((item) => item.problemId === problem.problemId) || problem);
            }
        }

        const changedScreens = currentScreens.filter((screen, index) => JSON.stringify(screen) !== JSON.stringify(screensRes.data[index]));
        const changedDiagnoses = currentDiagnoses.filter((diagnosis, index) => JSON.stringify(diagnosis) !== JSON.stringify(diagnosesRes.data[index]));
        const changedProblems = currentProblems.filter((problem, index) => JSON.stringify(problem) !== JSON.stringify(problemsRes.data[index]));

        if (!changedScreens.length && !changedDiagnoses.length && !changedProblems.length) {
            return {
                success: true,
                changed: false,
                resolvedCount: 0,
                errors: [],
                warnings: [],
            };
        }

        if (changedScreens.length) {
            const repairedScreens = await _saveScreens({
                data: changedScreens,
                userId: session.user?.userId,
            });
            if (repairedScreens.errors?.length) {
                logger.error('resolveDataKeyIntegrityEntriesBulk SAVE_SCREENS_ERRORS', {
                    entriesCount: entries.length,
                    screensCount: changedScreens.length,
                    errors: repairedScreens.errors,
                });
                return {
                    success: false,
                    changed: false,
                    resolvedCount: 0,
                    errors: repairedScreens.errors,
                    warnings: repairedScreens.warnings || [],
                };
            }
            warnings.push(...(repairedScreens.warnings || []));
        }

        if (changedDiagnoses.length) {
            const repairedDiagnoses = await _saveDiagnoses({
                data: changedDiagnoses,
                userId: session.user?.userId,
            });
            if (repairedDiagnoses.errors?.length) {
                logger.error('resolveDataKeyIntegrityEntriesBulk SAVE_DIAGNOSES_ERRORS', {
                    entriesCount: entries.length,
                    diagnosesCount: changedDiagnoses.length,
                    errors: repairedDiagnoses.errors,
                });
                return {
                    success: false,
                    changed: false,
                    resolvedCount: 0,
                    errors: repairedDiagnoses.errors,
                    warnings,
                };
            }
        }

        if (changedProblems.length) {
            const repairedProblems = await _saveProblems({
                data: changedProblems,
                userId: session.user?.userId,
            });
            if (repairedProblems.errors?.length) {
                logger.error('resolveDataKeyIntegrityEntriesBulk SAVE_PROBLEMS_ERRORS', {
                    entriesCount: entries.length,
                    problemsCount: changedProblems.length,
                    errors: repairedProblems.errors,
                });
                return {
                    success: false,
                    changed: false,
                    resolvedCount: 0,
                    errors: repairedProblems.errors,
                    warnings,
                };
            }
        }

        reviewedItems.forEach((item) => clearPreparedIntegrityRepair(session.user?.userId, item.entry, item.selectedTargetUniqueKey));

        return {
            success: true,
            changed: true,
            resolvedCount,
            errors: [],
            warnings,
        };
    } catch (e: any) {
        logger.error('resolveDataKeyIntegrityEntriesBulk ERROR', {
            error: e.message,
            stack: e.stack,
            entriesCount: params.entries?.length || 0,
        });
        return {
            success: false,
            changed: false,
            resolvedCount: 0,
            errors: [e.message],
            warnings: [],
        };
    }
}

export const previewDataKeyIntegrityEntriesBulk = async (params: {
    entries?: DataKeyIntegrityEntry[];
    items?: BulkIntegrityRepairItemInput[];
}) => {
    try {
        await isAllowed();

        const items: BulkIntegrityRepairItemInput[] = (params.items?.length
            ? params.items
            : (params.entries || []).map((entry) => ({ entry })))
            .filter((item) => item?.entry);
        if (!items.length) {
            return {
                success: true,
                previews: [],
                errors: [],
            };
        }

        const scriptIds = Array.from(new Set(items.map((item) => item.entry.scriptId).filter(Boolean)));
        if (scriptIds.length !== 1) {
            return {
                success: false,
                previews: [],
                errors: ['Bulk resolve currently supports one script at a time'],
            };
        }

        const [dataKeysRes, screensRes, diagnosesRes, problemsRes] = await Promise.all([
            _getDataKeys({ returnDraftsIfExist: true }),
            _getScreens({ scriptsIds: [scriptIds[0]], returnDraftsIfExist: true }),
            _getDiagnoses({ scriptsIds: [scriptIds[0]], returnDraftsIfExist: true }),
            _getProblems({ scriptsIds: [scriptIds[0]], returnDraftsIfExist: true }),
        ]);

        const fetchErrors = [
            ...(dataKeysRes.errors || []),
            ...(screensRes.errors || []),
            ...(diagnosesRes.errors || []),
            ...(problemsRes.errors || []),
        ];
        if (fetchErrors.length) {
            return {
                success: false,
                previews: [],
                errors: fetchErrors,
            };
        }

        const previews = items.map((item) => {
            const repairs = repairSingleDataKeyIntegrityReference({
                entry: item.entry,
                dataKeys: dataKeysRes.data,
                screens: screensRes.data,
                diagnoses: diagnosesRes.data,
                problems: problemsRes.data,
                overrideTargetUniqueKey: item.selectedTargetUniqueKey,
            });

            const preferredUniqueKey = item.selectedTargetUniqueKey || item.entry.matchedUniqueKey || item.entry.currentUniqueKey;
            const matchedDataKey = preferredUniqueKey
                ? dataKeysRes.data.find((dataKey) => dataKey.uniqueKey === preferredUniqueKey)
                : undefined;

            return {
                entry: item.entry,
                selectedTargetUniqueKey: item.selectedTargetUniqueKey || matchedDataKey?.uniqueKey || '',
                targetDataKey: !matchedDataKey ? null : {
                    uniqueKey: matchedDataKey.uniqueKey,
                    name: matchedDataKey.name || '',
                    label: matchedDataKey.label || '',
                    dataType: matchedDataKey.dataType || '',
                    confidential: !!matchedDataKey.confidential,
                    isDraft: !!matchedDataKey.isDraft,
                    isDeleted: !!matchedDataKey.isDeleted,
                    optionsCount: Array.isArray(matchedDataKey.options) ? matchedDataKey.options.length : 0,
                    metadata: (matchedDataKey.metadata || {}) as Record<string, any>,
                },
                screens: repairs.screens.map((screen) => ({
                    screenId: screen.screenId,
                    title: screen.title || screen.label || screen.refId || screen.screenId,
                    scriptId: screen.scriptId,
                })),
                diagnoses: repairs.diagnoses.map((diagnosis) => ({
                    diagnosisId: diagnosis.diagnosisId,
                    title: diagnosis.name || diagnosis.key || diagnosis.diagnosisId,
                    scriptId: diagnosis.scriptId,
                })),
                problems: repairs.problems.map((problem) => ({
                    problemId: problem.problemId,
                    title: problem.name || problem.key || problem.problemId,
                    scriptId: problem.scriptId,
                })),
                changed: !!repairs.screens.length || !!repairs.diagnoses.length || !!repairs.problems.length,
                reviewed: item.reviewed === true,
            };
        });

        return {
            success: true,
            previews,
            errors: [],
        };
    } catch (e: any) {
        logger.error('previewDataKeyIntegrityEntriesBulk ERROR', {
            error: e.message,
            stack: e.stack,
            entriesCount: params.items?.length || params.entries?.length || 0,
        });
        return {
            success: false,
            previews: [],
            errors: [e.message],
        };
    }
}

export const previewDataKeyIntegrityEntryRepair = async (params: {
    entry: DataKeyIntegrityEntry;
    selectedTargetUniqueKey?: string;
}) => {
    try {
        const session = await isAllowed();
        const [prepared, dataKeysRes] = await Promise.all([
            prepareDataKeyIntegrityEntryRepair(params.entry, params.selectedTargetUniqueKey),
            _getDataKeys({ returnDraftsIfExist: true }),
        ]);

        if (!prepared.success) {
            return {
                success: false,
                changed: false,
                preview: null,
                errors: prepared.errors,
            };
        }
        if (dataKeysRes.errors?.length) {
            return {
                success: false,
                changed: false,
                preview: null,
                errors: dataKeysRes.errors,
            };
        }
        const repairs = prepared.repairs;
        const preferredUniqueKey = params.selectedTargetUniqueKey || params.entry.matchedUniqueKey || params.entry.currentUniqueKey;
        const matchedDataKey = preferredUniqueKey
            ? dataKeysRes.data.find((dataKey) => dataKey.uniqueKey === preferredUniqueKey)
            : undefined;
        setPreparedIntegrityRepair(session.user?.userId, {
            entry: params.entry,
            selectedTargetUniqueKey: params.selectedTargetUniqueKey,
            repairs,
            preparedAt: Date.now(),
        });

        return {
            success: true,
            changed: !!repairs.screens.length || !!repairs.diagnoses.length || !!repairs.problems.length,
            preview: {
                entry: params.entry,
                targetDataKey: !matchedDataKey ? null : {
                    uniqueKey: matchedDataKey.uniqueKey,
                    name: matchedDataKey.name || '',
                    label: matchedDataKey.label || '',
                    dataType: matchedDataKey.dataType || '',
                    confidential: !!matchedDataKey.confidential,
                    isDraft: !!matchedDataKey.isDraft,
                    isDeleted: !!matchedDataKey.isDeleted,
                    optionsCount: Array.isArray(matchedDataKey.options) ? matchedDataKey.options.length : 0,
                    metadata: (matchedDataKey.metadata || {}) as Record<string, any>,
                },
                screens: repairs.screens.map((screen) => ({
                    screenId: screen.screenId,
                    title: screen.title || screen.label || screen.refId || screen.screenId,
                    scriptId: screen.scriptId,
                })),
                diagnoses: repairs.diagnoses.map((diagnosis) => ({
                    diagnosisId: diagnosis.diagnosisId,
                    title: diagnosis.name || diagnosis.key || diagnosis.diagnosisId,
                    scriptId: diagnosis.scriptId,
                })),
                problems: repairs.problems.map((problem) => ({
                    problemId: problem.problemId,
                    title: problem.name || problem.key || problem.problemId,
                    scriptId: problem.scriptId,
                })),
                savesAsDraft: true,
                publishRequired: true,
            },
            errors: [],
        };
    } catch (e: any) {
        logger.error('previewDataKeyIntegrityEntryRepair ERROR', {
            entry: params.entry,
            error: e.message,
            stack: e.stack,
        });
        return {
            success: false,
            changed: false,
            preview: null,
            errors: [e.message],
        };
    }
}

type UsageExportCache = {
    fingerprint: string;
    generatedAt: number;
    data: DataKeysUsageExportRow[];
};

const USAGE_EXPORT_CACHE_KEY = '__data_keys_usage_export_cache__';

function getUsageExportCacheStore(): { current?: UsageExportCache } {
    const globalWithCache = globalThis as typeof globalThis & {
        [USAGE_EXPORT_CACHE_KEY]?: { current?: UsageExportCache };
    };
    if (!globalWithCache[USAGE_EXPORT_CACHE_KEY]) {
        globalWithCache[USAGE_EXPORT_CACHE_KEY] = {};
    }
    return globalWithCache[USAGE_EXPORT_CACHE_KEY]!;
}

function normalizeUsageExportRows(rows: unknown[]): DataKeysUsageExportRow[] {
    return rows.map((row) => {
        const r = (row || {}) as {
            DataKeyUniqueKey?: unknown;
            DataKeyKey?: unknown;
            DataKeyLabel?: unknown;
            DataKey?: unknown;
            ScriptTitle?: unknown;
            Confidential?: unknown;
        };

        const dataKeyUniqueKey = `${r.DataKeyUniqueKey ?? ''}`.trim();
        const dataKeyKey = `${r.DataKeyKey ?? r.DataKey ?? ''}`.trim();
        const dataKeyLabel = `${r.DataKeyLabel ?? ''}`.trim();
        const scriptTitle = `${r.ScriptTitle ?? ''}`.trim();
        const confidential = `${r.Confidential ?? 'false'}`.toLowerCase() === 'true' ? 'true' : 'false';

        return {
            DataKeyUniqueKey: dataKeyUniqueKey,
            DataKeyKey: dataKeyKey,
            DataKeyLabel: dataKeyLabel,
            ScriptTitle: scriptTitle,
            Confidential: confidential,
        };
    });
}

async function getUsageExportFingerprint() {
    const [
        [publishedKeysMeta],
        [draftKeysMeta],
        [publishedScreensMeta],
        [draftScreensMeta],
    ] = await Promise.all([
        db.select({
            updatedAt: max(dataKeys.updatedAt),
            count: count(),
        }).from(dataKeys).where(isNull(dataKeys.deletedAt)),
        db.select({
            updatedAt: max(dataKeysDrafts.updatedAt),
            count: count(),
        }).from(dataKeysDrafts),
        db.select({
            updatedAt: max(screens.updatedAt),
            count: count(),
        }).from(screens).where(isNull(screens.deletedAt)),
        db.select({
            updatedAt: max(screensDrafts.updatedAt),
            count: count(),
        }).from(screensDrafts),
    ]);

    return [
        publishedKeysMeta?.updatedAt ? new Date(publishedKeysMeta.updatedAt).toISOString() : '',
        `${publishedKeysMeta?.count || 0}`,
        draftKeysMeta?.updatedAt ? new Date(draftKeysMeta.updatedAt).toISOString() : '',
        `${draftKeysMeta?.count || 0}`,
        publishedScreensMeta?.updatedAt ? new Date(publishedScreensMeta.updatedAt).toISOString() : '',
        `${publishedScreensMeta?.count || 0}`,
        draftScreensMeta?.updatedAt ? new Date(draftScreensMeta.updatedAt).toISOString() : '',
        `${draftScreensMeta?.count || 0}`,
    ].join('|');
}

export const getDataKeysUsageExportRows = async (params?: {
    dataKeys?: string[];
    uniqueKeys?: string[];
}): Promise<{
    success: boolean;
    data: DataKeysUsageExportRow[];
    errors?: string[];
}> => {
    try {
        await isAllowed();

        const [dataKeysRes, screensRes] = await Promise.all([
            _getDataKeys({ returnDraftsIfExist: true }),
            _getScreens({ returnDraftsIfExist: true }),
        ]);

        const errors = [
            ...(dataKeysRes.errors || []),
            ...(screensRes.errors || []),
        ];

        if (errors.length) return { success: false, data: [], errors };

        const [fingerprint] = await Promise.all([
            getUsageExportFingerprint(),
        ]);

        const cache = getUsageExportCacheStore();
        const filterDataKeys = new Set([
            ...(params?.dataKeys || []),
            ...(params?.uniqueKeys || []),
        ].filter(Boolean));
        const applyFilter = (rows: DataKeysUsageExportRow[]) => (
            !filterDataKeys.size
                ? rows
                : rows.filter(row => filterDataKeys.has(row.DataKeyUniqueKey || row.DataKeyKey))
        );

        if (cache.current && cache.current.fingerprint === fingerprint) {
            const normalizedCachedRows = normalizeUsageExportRows(cache.current.data as unknown[]);
            cache.current.data = normalizedCachedRows;
            return {
                success: true,
                data: applyFilter(normalizedCachedRows),
            };
        }

        const byUniqueKey = new Map<string, {
            uniqueKey: string;
            name: string;
            label: string;
            confidential: boolean;
            metadata: Record<string, any>;
        }>();
        const namesMap = new Map<string, Set<string>>();
        const allowLegacyNameMatch = process.env.DATA_KEYS_USAGE_ALLOW_LEGACY_NAME_MATCH === 'true';

        dataKeysRes.data.forEach(dataKey => {
            if (dataKey.uniqueKey) byUniqueKey.set(dataKey.uniqueKey, {
                uniqueKey: dataKey.uniqueKey,
                name: dataKey.name,
                label: dataKey.label || '',
                confidential: !!dataKey.confidential,
                metadata: dataKey.metadata || {},
            });
            if (dataKey.name) {
                if (!namesMap.has(dataKey.name)) namesMap.set(dataKey.name, new Set());
                namesMap.get(dataKey.name)!.add(dataKey.uniqueKey);
            }
        });

        const rowsMap = new Map<string, DataKeysUsageExportRow>();

        const resolveDataKey = (keyId?: string | null, keyName?: string | null) => {
            const byKeyId = keyId ? byUniqueKey.get(keyId) : undefined;
            if (byKeyId) return byKeyId;

            if (!allowLegacyNameMatch) return null;

            const name = `${keyName || ''}`.trim();
            if (!name) return null;

            const matched = namesMap.get(name);
            if (!matched || matched.size !== 1) return null;

            const [matchedUniqueKey] = Array.from(matched);
            if (!matchedUniqueKey) return null;
            return byUniqueKey.get(matchedUniqueKey) || null;
        };

        const addRow = ({
            keyId,
            keyName,
            scriptTitle,
        }: {
            keyId?: string | null;
            keyName?: string | null;
            scriptTitle: string;
        }) => {
            const dataKey = resolveDataKey(keyId, keyName);
            if (!dataKey) return;
            const confidentialValue = !!dataKey.confidential;

            const row: DataKeysUsageExportRow = {
                DataKeyUniqueKey: dataKey.uniqueKey || keyId || '',
                DataKeyKey: dataKey.name,
                DataKeyLabel: dataKey.label || '',
                ScriptTitle: scriptTitle || '',
                Confidential: confidentialValue ? 'true' : 'false',
            };

            const mapKey = `${row.DataKeyUniqueKey}|||${row.DataKeyKey}|||${row.DataKeyLabel}|||${row.ScriptTitle}|||${row.Confidential}`;
            rowsMap.set(mapKey, row);
        };

        screensRes.data.forEach(screen => {
            const scriptTitle = screen.scriptTitle || '';
            const includeScreenItems = `${screen.type || ''}`.trim().toLowerCase() !== 'progress';

            addRow({
                keyId: screen.keyId,
                keyName: screen.key,
                scriptTitle,
            });

            (screen.fields || []).forEach(field => {
                addRow({
                    keyId: field.keyId,
                    keyName: field.key,
                    scriptTitle,
                });

                (field.items || []).forEach(item => {
                    addRow({
                        keyId: item.keyId,
                        keyName: `${item.value || ''}` || `${item.label || ''}`,
                        scriptTitle,
                    });
                });
            });

            if (includeScreenItems) {
                (screen.items || []).forEach(item => {
                    addRow({
                        keyId: item.keyId,
                        keyName: item.key || item.id,
                        scriptTitle,
                    });
                });
            }
        });

        const data = normalizeUsageExportRows(Array.from(rowsMap.values()))
            .sort((a, b) => {
                if (a.DataKeyKey !== b.DataKeyKey) return a.DataKeyKey.localeCompare(b.DataKeyKey);
                if (a.DataKeyLabel !== b.DataKeyLabel) return a.DataKeyLabel.localeCompare(b.DataKeyLabel);
                if (a.ScriptTitle !== b.ScriptTitle) return a.ScriptTitle.localeCompare(b.ScriptTitle);
                if (a.DataKeyUniqueKey !== b.DataKeyUniqueKey) return a.DataKeyUniqueKey.localeCompare(b.DataKeyUniqueKey);
                return a.Confidential.localeCompare(b.Confidential);
            });

        cache.current = {
            fingerprint,
            generatedAt: Date.now(),
            data,
        };

        return {
            success: true,
            data: applyFilter(data),
        };
    } catch (e: any) {
        logger.error('getDataKeysUsageExportRows ERROR', e.message);
        return {
            success: false,
            data: [],
            errors: [e.message],
        };
    }
};

export const exportDataKeys = async ({
    uuids,
    siteId,
    overwriteExisting,
}: {
    uuids: string[];
    siteId: string;
    overwriteExisting?: boolean;
}): Promise<{
    success: boolean;
    errors?: string[];
}> => {
    try {
        const session = await isAllowed();
        await assertCanManageDataKeys(session.user);

        const axiosClient = await getSiteAxiosClient(siteId);
        
        const dataKeys = await _getDataKeys({
            dataKeysIds: uuids,
            returnDraftsIfExist: true,
        });

        if (dataKeys.errors?.length) {
            return {
                success: false,
                errors: dataKeys.errors,
            };
        }

        let errors: string[] = [];

        if (dataKeys.data.length) {
            if (overwriteExisting) {
                const res = await axiosClient.post<Awaited<ReturnType<typeof saveDataKeysUpdateIfExist>>>('/api/data-keys/save-and-update-if-exist', {
                    data: dataKeys.data,
                    broadcastAction: true,
                } satisfies Parameters<typeof saveDataKeysUpdateIfExist>[0]);

                if (res.data.errors) errors = res.data.errors;
            } else {
                const res = await axiosClient.post<Awaited<ReturnType<typeof saveDataKeysIfNotExist>>>('/api/data-keys/save-if-not-exist', {
                    data: dataKeys.data,
                    broadcastAction: true,
                } satisfies Parameters<typeof saveDataKeysIfNotExist>[0]);

                if (res.data.errors) errors = res.data.errors;
            }
        }

        if (errors.length) {
            logger.error('exportDataKeys remote import ERROR', JSON.stringify({ siteId, overwriteExisting: !!overwriteExisting, errors }));
        }

        return {
            success: !errors.length,
            errors: errors.length ? errors.map(error => `Target site import failed: ${error}`) : undefined,
        };
    } catch(e: any) {
        logger.error('exportDataKeys ERROR', JSON.stringify({ siteId, overwriteExisting: !!overwriteExisting, message: e.message }));
        return {
            success: false,
            errors: [e.message],
        };
    }
}
