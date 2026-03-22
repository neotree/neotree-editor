import { and, inArray, isNull, or, sql, type SQL } from 'drizzle-orm';

import logger from '@/lib/logger';
import socket from '@/lib/socket';
import db from '@/databases/pg/drizzle';
import { diagnoses, diagnosesDrafts, problems, problemsDrafts, screens, screensDrafts } from '@/databases/pg/schema';
import { _getScreens, _getDiagnoses, _getProblems } from '@/databases/queries/scripts';
import { _saveScreens, _saveDiagnoses, _saveProblems } from '@/databases/mutations/scripts';
import { DataKey } from "@/databases/queries/data-keys";
import { buildNormalizedDataKeyMatchKey } from '@/lib/data-key-types';

export type UpdateDataKeysRefsParams = {
    broadcastAction?: boolean;
    dataKeys: DataKey[];
    dryRun?: boolean;
    previousDataKeys?: Array<{
        uniqueKey: string;
        name?: string | null;
        label?: string | null;
        dataType?: string | null;
    }>;
    userId?: string;
};

type MatchSource = 'uniqueKey' | 'legacyName' | 'legacyLabel';

type UpdateStats = {
    candidateScripts: number;
    fetchedScreens: number;
    fetchedDiagnoses: number;
    fetchedProblems: number;
    updatedScreens: number;
    updatedDiagnoses: number;
    updatedProblems: number;
    savedScreens: number;
    savedDiagnoses: number;
    savedProblems: number;
    chunkRetries: number;
    matchedByUniqueKey: number;
    matchedByLegacyName: number;
    matchedByLegacyLabel: number;
    ambiguousLegacySkips: number;
};

type AffectedEntity = {
    id: string;
    scriptId: string;
    scriptTitle?: string;
    title: string;
    type: 'screen' | 'diagnosis' | 'problem';
};

type AffectedUsage = {
    id: string;
    kind: 'screen' | 'screen_item' | 'screen_field' | 'screen_field_item' | 'diagnosis' | 'diagnosis_symptom' | 'problem';
    title: string;
    location: string;
    scriptId: string;
    scriptTitle?: string;
    screenId?: string;
    diagnosisId?: string;
    problemId?: string;
    screenItemIndex?: number;
    fieldIndex?: number;
    fieldItemIndex?: number;
    diagnosisSymptomIndex?: number;
};

export type UpdateDataKeysRefsResponse = {
    errors?: string[];
    success: boolean;
    info?: UpdateStats;
    affected?: {
        scripts: { scriptId: string; scriptTitle?: string; }[];
        screens: AffectedEntity[];
        diagnoses: AffectedEntity[];
        problems: AffectedEntity[];
        usages: AffectedUsage[];
    };
};

const parsePositiveInt = (value: string | undefined, fallback: number) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    const normalized = Math.floor(parsed);
    return normalized > 0 ? normalized : fallback;
};

const SAVE_CHUNK_SIZE = parsePositiveInt(process.env.DATA_KEYS_REFS_SAVE_CHUNK_SIZE, 50);
const SAVE_RETRY_CONCURRENCY = parsePositiveInt(process.env.DATA_KEYS_REFS_RETRY_CONCURRENCY, 5);
const ALLOW_LEGACY_DATA_KEY_MATCH = process.env.DATA_KEYS_REFS_ALLOW_LEGACY_MATCH !== 'false';

function chunkArray<T>(arr: T[], size: number): T[][] {
    if (size <= 0) return [arr];
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

function buildLikeClauses(column: SQL, patterns: string[]): SQL | undefined {
    if (!patterns.length) return undefined;
    const clauses = patterns.map(pattern => sql`${column}::text ILIKE ${pattern}`);
    if (clauses.length === 1) return clauses[0];
    return or(...clauses) as SQL;
}

function buildLegacyLookupKey(value: string, dataType?: string | null) {
    return buildNormalizedDataKeyMatchKey(value, dataType);
}

function escapeLikePattern(value: string) {
    return value.replace(/[\\%_]/g, '\\$&');
}

async function mapWithConcurrency<T>(
    items: T[],
    concurrency: number,
    fn: (item: T) => Promise<void>,
) {
    const workers = Math.max(1, Math.min(concurrency, items.length || 1));
    let index = 0;

    async function runWorker() {
        while (index < items.length) {
            const current = items[index];
            index++;
            await fn(current);
        }
    }

    await Promise.all(Array.from({ length: workers }).map(() => runWorker()));
}

export async function _updateDataKeysRefs({
    dataKeys,
    dryRun = false,
    previousDataKeys = [],
    broadcastAction,
    userId,
}: UpdateDataKeysRefsParams): Promise<UpdateDataKeysRefsResponse> {
    try {
        const stats: UpdateStats = {
            candidateScripts: 0,
            fetchedScreens: 0,
            fetchedDiagnoses: 0,
            fetchedProblems: 0,
            updatedScreens: 0,
            updatedDiagnoses: 0,
            updatedProblems: 0,
            savedScreens: 0,
            savedDiagnoses: 0,
            savedProblems: 0,
            chunkRetries: 0,
            matchedByUniqueKey: 0,
            matchedByLegacyName: 0,
            matchedByLegacyLabel: 0,
            ambiguousLegacySkips: 0,
        };

        const byUniqueKey = new Map<string, DataKey>();
        dataKeys.forEach(key => {
            if (key.uniqueKey) byUniqueKey.set(key.uniqueKey, key);
        });

        const changedUniqueKeys = Array.from(byUniqueKey.keys());
        const legacyNameToUniqueKey = new Map<string, string>();
        const legacyLabelToUniqueKey = new Map<string, string>();
        const legacyNameFallbackToUniqueKey = new Map<string, string>();
        const legacyLabelFallbackToUniqueKey = new Map<string, string>();
        const legacyNameConflicts = new Set<string>();
        const legacyLabelConflicts = new Set<string>();
        const legacyNameFallbackConflicts = new Set<string>();
        const legacyLabelFallbackConflicts = new Set<string>();
        const oldNames = new Set<string>();
        const oldLabels = new Set<string>();

        previousDataKeys.forEach(prev => {
            if (!prev.uniqueKey) return;
            const current = byUniqueKey.get(prev.uniqueKey);
            if (!current) return;

            const oldName = `${prev.name || ''}`.trim();
            const oldLabel = `${prev.label || ''}`.trim();

            if (oldName && oldName !== current.name) {
                oldNames.add(oldName);
                const lookupKey = buildLegacyLookupKey(oldName, prev.dataType);
                const existing = legacyNameToUniqueKey.get(lookupKey);
                if (existing && existing !== current.uniqueKey) legacyNameConflicts.add(lookupKey);
                legacyNameToUniqueKey.set(lookupKey, current.uniqueKey);

                const fallbackLookupKey = buildLegacyLookupKey(oldName);
                const fallbackExisting = legacyNameFallbackToUniqueKey.get(fallbackLookupKey);
                if (fallbackExisting && fallbackExisting !== current.uniqueKey) legacyNameFallbackConflicts.add(fallbackLookupKey);
                legacyNameFallbackToUniqueKey.set(fallbackLookupKey, current.uniqueKey);
            }

            if (oldLabel && oldLabel !== current.label) {
                oldLabels.add(oldLabel);
                const lookupKey = buildLegacyLookupKey(oldLabel, prev.dataType);
                const existing = legacyLabelToUniqueKey.get(lookupKey);
                if (existing && existing !== current.uniqueKey) legacyLabelConflicts.add(lookupKey);
                legacyLabelToUniqueKey.set(lookupKey, current.uniqueKey);

                const fallbackLookupKey = buildLegacyLookupKey(oldLabel);
                const fallbackExisting = legacyLabelFallbackToUniqueKey.get(fallbackLookupKey);
                if (fallbackExisting && fallbackExisting !== current.uniqueKey) legacyLabelFallbackConflicts.add(fallbackLookupKey);
                legacyLabelFallbackToUniqueKey.set(fallbackLookupKey, current.uniqueKey);
            }
        });

        const getUpdatedDataKey = ({
            uniqueKey,
            key,
            label,
            dataType,
        }: {
            uniqueKey?: string | null;
            key?: string | null;
            label?: string | null;
            dataType?: string | null;
        }): { dataKey?: DataKey; source?: MatchSource } => {
            if (uniqueKey) {
                const keyById = byUniqueKey.get(uniqueKey);
                if (keyById) return { dataKey: keyById, source: 'uniqueKey' };
            }

            if (!ALLOW_LEGACY_DATA_KEY_MATCH) {
                return {};
            }

            const trimmedKey = `${key || ''}`.trim();
            const trimmedLabel = `${label || ''}`.trim();

            if (trimmedKey) {
                const legacyLookupKey = buildLegacyLookupKey(trimmedKey, dataType);
                if (legacyNameConflicts.has(legacyLookupKey)) {
                    stats.ambiguousLegacySkips++;
                } else {
                    const matchedUniqueKey = legacyNameToUniqueKey.get(legacyLookupKey);
                    if (matchedUniqueKey) {
                        const matched = byUniqueKey.get(matchedUniqueKey);
                        if (matched) return { dataKey: matched, source: 'legacyName' };
                    }
                }

                const fallbackLookupKey = buildLegacyLookupKey(trimmedKey);
                if (legacyNameFallbackConflicts.has(fallbackLookupKey)) {
                    stats.ambiguousLegacySkips++;
                } else {
                    const matchedUniqueKey = legacyNameFallbackToUniqueKey.get(fallbackLookupKey);
                    if (matchedUniqueKey) {
                        const matched = byUniqueKey.get(matchedUniqueKey);
                        if (matched) return { dataKey: matched, source: 'legacyName' };
                    }
                }
            }

            if (trimmedLabel) {
                const legacyLookupKey = buildLegacyLookupKey(trimmedLabel, dataType);
                if (legacyLabelConflicts.has(legacyLookupKey)) {
                    stats.ambiguousLegacySkips++;
                } else {
                    const matchedUniqueKey = legacyLabelToUniqueKey.get(legacyLookupKey);
                    if (matchedUniqueKey) {
                        const matched = byUniqueKey.get(matchedUniqueKey);
                        if (matched) return { dataKey: matched, source: 'legacyLabel' };
                    }
                }

                const fallbackLookupKey = buildLegacyLookupKey(trimmedLabel);
                if (legacyLabelFallbackConflicts.has(fallbackLookupKey)) {
                    stats.ambiguousLegacySkips++;
                } else {
                    const matchedUniqueKey = legacyLabelFallbackToUniqueKey.get(fallbackLookupKey);
                    if (matchedUniqueKey) {
                        const matched = byUniqueKey.get(matchedUniqueKey);
                        if (matched) return { dataKey: matched, source: 'legacyLabel' };
                    }
                }
            }

            return {};
        };

        const trackMatchSource = (source?: MatchSource) => {
            if (source === 'uniqueKey') stats.matchedByUniqueKey++;
            if (source === 'legacyName') stats.matchedByLegacyName++;
            if (source === 'legacyLabel') stats.matchedByLegacyLabel++;
        };
        const getDataKeyOptional = (key?: DataKey) => !!(key?.metadata as Record<string, any> | undefined)?.optional;

        const usagesMap = new Map<string, AffectedUsage>();
        const addUsage = (usage: AffectedUsage) => {
            const dedupeKey = [
                usage.kind,
                usage.scriptId,
                usage.screenId || '',
                usage.diagnosisId || '',
                usage.id,
                usage.title,
            ].join('|');
            usagesMap.set(dedupeKey, usage);
        };

        const oldNamesArr = Array.from(oldNames);
        const oldLabelsArr = Array.from(oldLabels);

        const keyIdPatterns = changedUniqueKeys
            .filter(Boolean)
            .slice(0, 120)
            .flatMap(keyId => {
                const id = escapeLikePattern(keyId);
                return [
                    `%\"keyId\":\"${id}\"%`,
                    `%\"keyId\": \"${id}\"%`,
                    `%\"keyId\"%\"${id}\"%`,
                ];
            });
        const oldNamePatterns = oldNamesArr
            .filter(Boolean)
            .slice(0, 80)
            .flatMap(name => {
                const n = escapeLikePattern(name);
                return [
                    `%\"key\":\"${n}\"%`,
                    `%\"key\": \"${n}\"%`,
                    `%\"key\"%\"${n}\"%`,
                    `%\"id\":\"${n}\"%`,
                    `%\"id\": \"${n}\"%`,
                    `%\"id\"%\"${n}\"%`,
                    `%\"value\":\"${n}\"%`,
                    `%\"value\": \"${n}\"%`,
                    `%\"value\"%\"${n}\"%`,
                    `%\"refKey\":\"${n}\"%`,
                    `%\"refKey\": \"${n}\"%`,
                    `%\"refKey\"%\"${n}\"%`,
                ];
            });
        const oldLabelPatterns = oldLabelsArr
            .filter(Boolean)
            .slice(0, 80)
            .flatMap(label => {
                const l = escapeLikePattern(label);
                return [
                    `%\"label\":\"${l}\"%`,
                    `%\"label\": \"${l}\"%`,
                    `%\"label\"%\"${l}\"%`,
                    `%\"name\":\"${l}\"%`,
                    `%\"name\": \"${l}\"%`,
                    `%\"name\"%\"${l}\"%`,
                ];
            });
        const likePatterns = Array.from(new Set([
            ...keyIdPatterns,
            ...oldNamePatterns,
            ...oldLabelPatterns,
        ])).slice(0, 240);

        const candidateScripts = new Set<string>();

        if (changedUniqueKeys.length || oldNames.size || oldLabels.size || likePatterns.length) {
            const screensPublishedCandidates = await db
                .select({ scriptId: screens.scriptId })
                .from(screens)
                .where(and(
                    isNull(screens.deletedAt),
                    or(
                        changedUniqueKeys.length ? inArray(screens.keyId, changedUniqueKeys) : undefined,
                        changedUniqueKeys.length ? inArray(screens.refIdDataKey, changedUniqueKeys) : undefined,
                        oldNamesArr.length ? inArray(screens.key, oldNamesArr) : undefined,
                        oldLabelsArr.length ? inArray(screens.label, oldLabelsArr) : undefined,
                        oldNamesArr.length ? inArray(screens.refId, oldNamesArr) : undefined,
                        buildLikeClauses(sql`${screens.fields}`, likePatterns),
                        buildLikeClauses(sql`${screens.items}`, likePatterns),
                    ),
                ));

            screensPublishedCandidates.forEach(row => {
                if (row.scriptId) candidateScripts.add(row.scriptId);
            });

            const diagnosesPublishedCandidates = await db
                .select({ scriptId: diagnoses.scriptId })
                .from(diagnoses)
                .where(and(
                    isNull(diagnoses.deletedAt),
                    or(
                        changedUniqueKeys.length ? inArray(diagnoses.keyId, changedUniqueKeys) : undefined,
                        oldNamesArr.length ? inArray(diagnoses.key, oldNamesArr) : undefined,
                        oldLabelsArr.length ? inArray(diagnoses.name, oldLabelsArr) : undefined,
                        buildLikeClauses(sql`${diagnoses.symptoms}`, likePatterns),
                    ),
                ));

            diagnosesPublishedCandidates.forEach(row => {
                if (row.scriptId) candidateScripts.add(row.scriptId);
            });

            const problemsPublishedCandidates = await db
                .select({ scriptId: problems.scriptId })
                .from(problems)
                .where(and(
                    isNull(problems.deletedAt),
                    or(
                        changedUniqueKeys.length ? inArray(problems.keyId, changedUniqueKeys) : undefined,
                        oldNamesArr.length ? inArray(problems.key, oldNamesArr) : undefined,
                        oldLabelsArr.length ? inArray(problems.name, oldLabelsArr) : undefined,
                    ),
                ));

            problemsPublishedCandidates.forEach(row => {
                if (row.scriptId) candidateScripts.add(row.scriptId);
            });

            if (likePatterns.length) {
                const screensDraftCandidates = await db
                    .select({
                        scriptId: screensDrafts.scriptId,
                        scriptDraftId: screensDrafts.scriptDraftId,
                    })
                    .from(screensDrafts)
                    .where(buildLikeClauses(sql`${screensDrafts.data}`, likePatterns));

                screensDraftCandidates.forEach(row => {
                    if (row.scriptId) candidateScripts.add(row.scriptId);
                    if (row.scriptDraftId) candidateScripts.add(row.scriptDraftId);
                });

                const diagnosesDraftCandidates = await db
                    .select({
                        scriptId: diagnosesDrafts.scriptId,
                        scriptDraftId: diagnosesDrafts.scriptDraftId,
                    })
                    .from(diagnosesDrafts)
                    .where(buildLikeClauses(sql`${diagnosesDrafts.data}`, likePatterns));

                diagnosesDraftCandidates.forEach(row => {
                    if (row.scriptId) candidateScripts.add(row.scriptId);
                    if (row.scriptDraftId) candidateScripts.add(row.scriptDraftId);
                });

                const problemsDraftCandidates = await db
                    .select({
                        scriptId: problemsDrafts.scriptId,
                        scriptDraftId: problemsDrafts.scriptDraftId,
                    })
                    .from(problemsDrafts)
                    .where(buildLikeClauses(sql`${problemsDrafts.data}`, likePatterns));

                problemsDraftCandidates.forEach(row => {
                    if (row.scriptId) candidateScripts.add(row.scriptId);
                    if (row.scriptDraftId) candidateScripts.add(row.scriptDraftId);
                });
            }
        }

        stats.candidateScripts = candidateScripts.size;

        const shouldFallbackToFullScan = !candidateScripts.size && (
            changedUniqueKeys.length > 0 ||
            oldNamesArr.length > 0 ||
            oldLabelsArr.length > 0
        );

        const useFullScan = dryRun || shouldFallbackToFullScan;

        if (!candidateScripts.size && !useFullScan) {
            return {
                success: true,
                info: stats,
                affected: {
                    scripts: [],
                    screens: [],
                    diagnoses: [],
                    problems: [],
                    usages: [],
                },
            };
        }

        const scriptsIds = useFullScan ? undefined : Array.from(candidateScripts);
        const { data: screensArr, errors: screensGetErrors } = await _getScreens(
            scriptsIds?.length ? { scriptsIds } : undefined
        );
        const { data: diagnosesArr, errors: diagnosesGetErrors } = await _getDiagnoses(
            scriptsIds?.length ? { scriptsIds } : undefined
        );

        const { data: problemsArr, errors: problemsGetErrors } = await _getProblems(
            scriptsIds?.length ? { scriptsIds } : undefined
        );

        const prefetchErrors = [
            ...(screensGetErrors || []),
            ...(diagnosesGetErrors || []),
        ];
        if (prefetchErrors.length) {
            return { success: false, errors: prefetchErrors, info: stats };
        }

        stats.fetchedScreens = screensArr.length;
        stats.fetchedDiagnoses = diagnosesArr.length;
        stats.fetchedProblems = problemsArr.length;

        let screensUpdatedData: typeof screensArr = screensArr.map(s => {
            const { dataKey: refIdDataKey, source: refMatchSource } = getUpdatedDataKey({
                uniqueKey: s.refIdDataKey || s.refId,
                key: s.refId,
            });
            trackMatchSource(refMatchSource);

            const { dataKey: screenDataKey, source: screenMatchSource } = getUpdatedDataKey({
                uniqueKey: s.keyId,
                key: s.key,
                label: s.label,
                dataType: s.type || undefined,
            });
            trackMatchSource(screenMatchSource);

            if (screenDataKey) {
                addUsage({
                    id: s.screenId,
                    kind: 'screen',
                    title: s.title || s.label || s.refId || s.screenId,
                    location: 'Screen',
                    scriptId: s.scriptId,
                    scriptTitle: s.scriptTitle || undefined,
                    screenId: s.screenId,
                });
            }

            let updated = !!screenDataKey || !!refIdDataKey;

            const items = (s.items || []).map((item, itemIndex) => {
                const { dataKey: itemDataKey, source: itemMatchSource } = getUpdatedDataKey({
                    uniqueKey: item.keyId,
                    key: item.key || item.id,
                    label: item.label,
                    dataType: s.type === 'diagnosis' ? 'diagnosis' : 'option',
                });
                trackMatchSource(itemMatchSource);

                if (itemDataKey) {
                    updated = true;
                    addUsage({
                        id: item.itemId || `${s.screenId}:item:${itemIndex}`,
                        kind: 'screen_item',
                        title: item.label || item.key || item.id || `${itemIndex + 1}`,
                        location: s.title || s.label || s.refId || s.screenId,
                        scriptId: s.scriptId,
                        scriptTitle: s.scriptTitle || undefined,
                        screenId: s.screenId,
                        screenItemIndex: itemIndex,
                    });
                }
                return {
                    ...item,
                    ...(!itemDataKey ? {} : {
                        keyId: itemDataKey.uniqueKey,
                        label: itemDataKey.label,
                        confidential: !!itemDataKey.confidential,
                        ...(!(`${item.key || ''}`.length) ? {} : { key: itemDataKey.name, }),
                        ...(!(`${item.id || ''}`.length) ? {} : { id: itemDataKey.name, }),
                    }),
                };
            });

            const fields = (s.fields || []).map((field, fieldIndex) => {
                const { dataKey: fieldDataKey, source: fieldMatchSource } = getUpdatedDataKey({
                    uniqueKey: field.keyId,
                    key: field.key,
                    label: field.label,
                    dataType: field.type || undefined,
                });
                trackMatchSource(fieldMatchSource);

                const { dataKey: refKeyDataKey, source: refKeyMatchSource } = getUpdatedDataKey({
                    uniqueKey: field.refKeyId,
                    key: field.refKey,
                });
                trackMatchSource(refKeyMatchSource);

                const { dataKey: minDateKeyDataKey, source: minDateMatchSource } = getUpdatedDataKey({
                    uniqueKey: field.minDateKeyId,
                    key: field.minDateKey,
                });
                trackMatchSource(minDateMatchSource);

                const { dataKey: maxDateKeyDataKey, source: maxDateMatchSource } = getUpdatedDataKey({
                    uniqueKey: field.maxDateKeyId,
                    key: field.maxDateKey,
                });
                trackMatchSource(maxDateMatchSource);

                const { dataKey: minTimeKeyDataKey, source: minTimeMatchSource } = getUpdatedDataKey({
                    uniqueKey: field.minTimeKeyId,
                    key: field.minTimeKey,
                });
                trackMatchSource(minTimeMatchSource);

                const { dataKey: maxTimeKeyDataKey, source: maxTimeMatchSource } = getUpdatedDataKey({
                    uniqueKey: field.maxTimeKeyId,
                    key: field.maxTimeKey,
                });
                trackMatchSource(maxTimeMatchSource);

                if (fieldDataKey || refKeyDataKey || minDateKeyDataKey || maxDateKeyDataKey || minTimeKeyDataKey || maxTimeKeyDataKey) {
                    updated = true;
                }

                if (fieldDataKey) {
                    addUsage({
                        id: field.fieldId || `${s.screenId}:field:${fieldIndex}`,
                        kind: 'screen_field',
                        title: field.label || field.key || `${fieldIndex + 1}`,
                        location: s.title || s.label || s.refId || s.screenId,
                        scriptId: s.scriptId,
                        scriptTitle: s.scriptTitle || undefined,
                        screenId: s.screenId,
                        fieldIndex,
                    });
                }

                return {
                    ...field,
                    ...(!fieldDataKey ? {} : {
                        keyId: fieldDataKey.uniqueKey,
                        key: fieldDataKey.name,
                        label: fieldDataKey.label,
                        confidential: !!fieldDataKey.confidential,
                        optional: getDataKeyOptional(fieldDataKey),
                    }),
                    ...(!refKeyDataKey ? {} : {
                        refKeyId: refKeyDataKey.uniqueKey,
                        refKey: refKeyDataKey.name,
                    }),
                    ...(!minDateKeyDataKey ? {} : {
                        minDateKeyId: minDateKeyDataKey.uniqueKey,
                        minDateKey: minDateKeyDataKey.name,
                    }),
                    ...(!maxDateKeyDataKey ? {} : {
                        maxDateKeyId: maxDateKeyDataKey.uniqueKey,
                        maxDateKey: maxDateKeyDataKey.name,
                    }),
                    ...(!minTimeKeyDataKey ? {} : {
                        minTimeKeyId: minTimeKeyDataKey.uniqueKey,
                        minTimeKey: minTimeKeyDataKey.name,
                    }),
                    ...(!maxTimeKeyDataKey ? {} : {
                        maxTimeKeyId: maxTimeKeyDataKey.uniqueKey,
                        maxTimeKey: maxTimeKeyDataKey.name,
                    }),
                    items: (field.items || []).map((item, fieldItemIndex) => {
                        const { dataKey: fieldItemDataKey, source: fieldItemMatchSource } = getUpdatedDataKey({
                            uniqueKey: item.keyId,
                            key: `${item.value || ''}`,
                            label: `${item.label || ''}`,
                            dataType: 'option',
                        });
                        trackMatchSource(fieldItemMatchSource);

                        if (fieldItemDataKey) {
                            updated = true;
                            addUsage({
                                id: item.itemId || `${s.screenId}:field:${field.fieldId || fieldIndex}:item:${fieldItemIndex}`,
                                kind: 'screen_field_item',
                                title: `${item.label || item.value || (fieldItemIndex + 1)}`,
                                location: `${s.title || s.label || s.refId || s.screenId} > ${field.label || field.key || field.fieldId || fieldIndex}`,
                                scriptId: s.scriptId,
                                scriptTitle: s.scriptTitle || undefined,
                                screenId: s.screenId,
                                fieldIndex,
                                fieldItemIndex,
                            });
                        }
                        return {
                            ...item,
                            ...(!fieldItemDataKey ? {} : {
                                keyId: fieldItemDataKey.uniqueKey,
                                value: fieldItemDataKey.name,
                                label: fieldItemDataKey.label,
                            }),
                        };
                    }),
                };
            });

            return {
                ...s,
                updated,
                items,
                fields,
                ...(!screenDataKey ? {} : {
                    keyId: screenDataKey.uniqueKey,
                    key: screenDataKey.name,
                    label: screenDataKey.label,
                    confidential: !!screenDataKey.confidential,
                }),
                ...(!refIdDataKey ? {} : {
                    refId: refIdDataKey.name,
                    refIdDataKey: refIdDataKey.uniqueKey,
                }),
            };
        }).filter(s => !!s.updated).map(({ updated, ...s }) => s);

        let diagnosesUpdatedData: typeof diagnosesArr = diagnosesArr.map(d => {
            const name = d.key || d.name || '';
            const { dataKey: diagnosisDataKey, source: diagnosisMatchSource } = getUpdatedDataKey({
                uniqueKey: d.keyId,
                key: d.key,
                label: d.name,
                dataType: 'diagnosis',
            });
            trackMatchSource(diagnosisMatchSource);

            if (diagnosisDataKey) {
                addUsage({
                    id: d.diagnosisId,
                    kind: 'diagnosis',
                    title: d.name || d.key || d.diagnosisId,
                    location: 'Diagnosis',
                    scriptId: d.scriptId,
                    scriptTitle: d.scriptTitle || undefined,
                    diagnosisId: d.diagnosisId,
                });
            }

            let updated = !!diagnosisDataKey;

            const symptoms = (d.symptoms || []).map((item, symptomIndex) => {
                const { dataKey: symptomDataKey, source: symptomMatchSource } = getUpdatedDataKey({
                    uniqueKey: item.keyId,
                    key: item.key,
                    label: item.name,
                    dataType: `diagnosis_symptom_${item.type}`,
                });
                trackMatchSource(symptomMatchSource);

                if (symptomDataKey) {
                    updated = true;
                    addUsage({
                        id: item?.symptomId || `${d.diagnosisId}:symptom:${symptomIndex}`,
                        kind: 'diagnosis_symptom',
                        title: item.name || item.key || `${symptomIndex + 1}`,
                        location: d.name || d.key || d.diagnosisId,
                        scriptId: d.scriptId,
                        scriptTitle: d.scriptTitle || undefined,
                        diagnosisId: d.diagnosisId,
                        diagnosisSymptomIndex: symptomIndex,
                    });
                }
                return {
                    ...item,
                    ...(!symptomDataKey ? {} : {
                        keyId: symptomDataKey.uniqueKey,
                        key: symptomDataKey.name,
                        name: symptomDataKey.label,
                    }),
                };
            });

            return {
                ...d,
                key: name,
                symptoms,
                updated,
                ...(!diagnosisDataKey ? {} : {
                    keyId: diagnosisDataKey.uniqueKey,
                    key: diagnosisDataKey.name,
                    name: diagnosisDataKey.label,
                }),
            };
        }).filter(d => !!d.updated).map(({ updated, ...d }) => d);

        let problemsUpdatedData: typeof problemsArr = problemsArr.map(d => {
            const name = d.key || d.name || '';
            const { dataKey: problemDataKey, source: problemMatchSource } = getUpdatedDataKey({
                uniqueKey: d.keyId,
                key: d.key,
                label: d.name,
                dataType: 'problem',
            });
            trackMatchSource(problemMatchSource);

            if (problemDataKey) {
                addUsage({
                    id: d.problemId,
                    kind: 'problem',
                    title: d.name || d.key || d.problemId,
                    location: 'Problem',
                    scriptId: d.scriptId,
                    scriptTitle: d.scriptTitle || undefined,
                    diagnosisId: d.problemId,
                });
            }

            let updated = !!problemDataKey;

            return {
                ...d,
                key: name,
                updated,
                ...(!problemDataKey ? {} : {
                    keyId: problemDataKey.uniqueKey,
                    key: problemDataKey.name,
                    name: problemDataKey.label,
                }),
            };
        }).filter(d => !!d.updated).map(({ updated, ...d }) => d);

        stats.updatedScreens = screensUpdatedData.length;
        stats.updatedDiagnoses = diagnosesUpdatedData.length;
        stats.updatedProblems = problemsUpdatedData.length;

        const affectedScreens: AffectedEntity[] = screensUpdatedData.map(s => ({
            id: s.screenId,
            scriptId: s.scriptId,
            scriptTitle: s.scriptTitle || undefined,
            title: s.title || s.label || s.refId || s.screenId,
            type: 'screen',
        }));
        const affectedDiagnoses: AffectedEntity[] = diagnosesUpdatedData.map(d => ({
            id: d.diagnosisId,
            scriptId: d.scriptId,
            scriptTitle: d.scriptTitle || undefined,
            title: d.name || d.key || d.diagnosisId,
            type: 'diagnosis',
        }));
        const affectedProblems: AffectedEntity[] = problemsUpdatedData.map(d => ({
            id: d.problemId,
            scriptId: d.scriptId,
            scriptTitle: d.scriptTitle || undefined,
            title: d.name || d.key || d.problemId,
            type: 'problem',
        }));
        const affectedScriptsMap: { [key: string]: { scriptId: string; scriptTitle?: string; }; } = {};
        [...affectedScreens, ...affectedDiagnoses].forEach(entity => {
            if (!entity.scriptId) return;
            if (!affectedScriptsMap[entity.scriptId]) {
                affectedScriptsMap[entity.scriptId] = {
                    scriptId: entity.scriptId,
                    scriptTitle: entity.scriptTitle,
                };
            }
        });
        const affected = {
            scripts: Object.values(affectedScriptsMap),
            screens: affectedScreens,
            diagnoses: affectedDiagnoses,
            problems: affectedProblems,
            usages: Array.from(usagesMap.values()),
        };

        if (dryRun) {
            return {
                success: true,
                info: stats,
                affected,
            };
        }

        const saveErrors: string[] = [];

        const saveDiagnosesTask = async () => {
            for (const chunk of chunkArray(diagnosesUpdatedData, SAVE_CHUNK_SIZE)) {
                const res = await _saveDiagnoses({ data: chunk, userId, });
                if (res.errors?.length) {
                    stats.chunkRetries++;
                    await mapWithConcurrency(chunk, SAVE_RETRY_CONCURRENCY, async (diagnosis) => {
                        const singleRes = await _saveDiagnoses({ data: [diagnosis], userId, });
                        if (singleRes.errors?.length) {
                            saveErrors.push(...singleRes.errors.map(e => `[diagnosis:${diagnosis.diagnosisId}] ${e}`));
                        } else {
                            stats.savedDiagnoses++;
                        }
                    });
                } else {
                    stats.savedDiagnoses += chunk.length;
                }
            }
        };

        const saveProblemsTask = async () => {
            for (const chunk of chunkArray(problemsUpdatedData, SAVE_CHUNK_SIZE)) {
                const res = await _saveProblems({ data: chunk, userId, });
                if (res.errors?.length) {
                    stats.chunkRetries++;
                    await mapWithConcurrency(chunk, SAVE_RETRY_CONCURRENCY, async (problem) => {
                        const singleRes = await _saveDiagnoses({ data: [problem], userId, });
                        if (singleRes.errors?.length) {
                            saveErrors.push(...singleRes.errors.map(e => `[problem:${problem.problemId}] ${e}`));
                        } else {
                            stats.savedProblems++;
                        }
                    });
                } else {
                    stats.savedProblems += chunk.length;
                }
            }
        };

        const saveScreensTask = async () => {
            for (const chunk of chunkArray(screensUpdatedData, SAVE_CHUNK_SIZE)) {
                const res = await _saveScreens({ data: chunk, userId, });
                if (res.errors?.length) {
                    stats.chunkRetries++;
                    await mapWithConcurrency(chunk, SAVE_RETRY_CONCURRENCY, async (screen) => {
                        const singleRes = await _saveScreens({ data: [screen], userId, });
                        if (singleRes.errors?.length) {
                            saveErrors.push(...singleRes.errors.map(e => `[screen:${screen.screenId}] ${e}`));
                        } else {
                            stats.savedScreens++;
                        }
                    });
                } else {
                    stats.savedScreens += chunk.length;
                }
            }
        };

        await Promise.all([saveDiagnosesTask(), saveProblemsTask(), saveScreensTask()]);

        if (saveErrors.length) {
            return {
                success: false,
                errors: saveErrors,
                info: stats,
                affected,
            };
        }

        const saved = stats.savedDiagnoses + stats.savedProblems + stats.savedScreens;
        if (broadcastAction && saved) socket.emit('data_changed', 'save_scripts');

        return { success: true, info: stats, affected };
    } catch(e: any) {
        logger.error('_updateDataKeysRefs ERROR', e.message);
        return {
            success: false,
            errors: [e.message,]
        };
    }
}
