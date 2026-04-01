import { buildNormalizedDataKeyMatchKey, normalizeDataKeyMatchValue, normalizeDataKeyType } from "@/lib/data-key-types";
import type { DataKey } from "@/databases/queries/data-keys";
import type { DiagnosisType, ProblemType, ScreenType } from "@/databases/queries/scripts";
import {
    shouldSyncFieldOwnedOptions,
    shouldSyncScreenOwnedOptions,
    syncDiagnosisReference,
    syncFieldReference,
    syncKeyOnlyReference,
    syncScreenEntityReference,
    syncScreenReference,
} from "@/databases/mutations/data-keys/_update_data_keys_refs.helpers";

export type DataKeyIntegrityStatus =
    | "resolved"
    | "out_of_sync"
    | "missing"
    | "legacy_match"
    | "conflict"
    | "unmanaged";

export type DataKeyIntegrityKind =
    | "screen"
    | "screen_ref"
    | "screen_item"
    | "screen_option_collection"
    | "field"
    | "field_ref"
    | "field_min_date"
    | "field_max_date"
    | "field_min_time"
    | "field_max_time"
    | "field_item"
    | "field_option_collection"
    | "diagnosis"
    | "diagnosis_symptom"
    | "problem"
    | "duplicate_parent_data_key";

export type DataKeyIntegrityEntry = {
    status: DataKeyIntegrityStatus;
    kind: DataKeyIntegrityKind;
    reason: string;
    scriptId: string;
    scriptTitle?: string;
    screenId?: string;
    diagnosisId?: string;
    problemId?: string;
    fieldId?: string;
    fieldIndex?: number;
    screenItemId?: string;
    screenItemIndex?: number;
    fieldItemId?: string;
    fieldItemIndex?: number;
    symptomId?: string;
    symptomIndex?: number;
    location: string;
    expectedDataType: string;
    currentUniqueKey?: string;
    currentKey?: string;
    currentLabel?: string;
    matchedUniqueKey?: string;
    matchedName?: string;
    matchedLabel?: string;
    suggestedUniqueKeys?: string[];
};

export type DataKeyIntegrityReport = {
    entries: DataKeyIntegrityEntry[];
    summary: {
        total: number;
        resolved: number;
        out_of_sync: number;
        missing: number;
        legacy_match: number;
        conflict: number;
        unmanaged: number;
        blocking: number;
    };
};

export type DataKeyIntegrityPublishIssue = {
    scriptId: string;
    scriptTitle: string;
    ruleLabel: string;
    displayName: string;
    reason: string;
    location: string;
    usageHref: string;
    registryHref: string;
    scriptHref: string;
};

export type DataKeyIntegrityPublishScriptGroup = {
    scriptId: string;
    scriptTitle: string;
    totalIssues: number;
    issues: DataKeyIntegrityPublishIssue[];
    registryHref: string;
    scriptHref: string;
};

export type DataKeyIntegrityPublishDetails = {
    totalIssues: number;
    totalScripts: number;
    summary: string[];
    scripts: DataKeyIntegrityPublishScriptGroup[];
};

function matchesIntegrityEntry(target: DataKeyIntegrityEntry, candidate: Pick<DataKeyIntegrityEntry, "kind" | "scriptId" | "screenId" | "diagnosisId" | "problemId" | "location">) {
    return (
        target.kind === candidate.kind &&
        target.scriptId === candidate.scriptId &&
        (target.screenId || "") === (candidate.screenId || "") &&
        (target.diagnosisId || "") === (candidate.diagnosisId || "") &&
        (target.problemId || "") === (candidate.problemId || "") &&
        target.location === candidate.location
    );
}

type CandidateMatch = {
    matched?: DataKey;
    candidates: DataKey[];
};

function isBlockingEntry(entry: Pick<DataKeyIntegrityEntry, "status" | "kind">) {
    return (
        entry.status === "missing" ||
        entry.status === "legacy_match" ||
        entry.status === "unmanaged" ||
        entry.kind === "screen_option_collection" ||
        entry.kind === "field_option_collection" ||
        entry.kind === "duplicate_parent_data_key"
    );
}

function buildIntegrityEntryUsageHref(entry: DataKeyIntegrityEntry) {
    if (entry.problemId) {
        return `/script/${entry.scriptId}/problem/${entry.problemId}`;
    }

    if (entry.diagnosisId) {
        const params = new URLSearchParams();
        if (entry.kind === "diagnosis_symptom") {
            if (entry.symptomId) params.set("symptom", entry.symptomId);
            else if (Number.isInteger(entry.symptomIndex)) params.set("symptom", `${entry.symptomIndex}`);
        }
        const query = params.toString();
        return `/script/${entry.scriptId}/diagnosis/${entry.diagnosisId}${query ? `?${query}` : ""}`;
    }

    if (entry.screenId) {
        const params = new URLSearchParams();

        if (
            ["field", "field_ref", "field_min_date", "field_max_date", "field_min_time", "field_max_time", "field_option_collection", "field_item"].includes(entry.kind)
        ) {
            if (entry.fieldId) params.set("field", entry.fieldId);
            else if (Number.isInteger(entry.fieldIndex)) params.set("field", `${entry.fieldIndex}`);
        }

        if (entry.kind === "screen_item") {
            if (entry.screenItemId) params.set("item", entry.screenItemId);
            else if (Number.isInteger(entry.screenItemIndex)) params.set("item", `${entry.screenItemIndex}`);
        }

        if (entry.kind === "field_item") {
            if (entry.fieldItemId) params.set("fieldItem", entry.fieldItemId);
            else if (Number.isInteger(entry.fieldItemIndex)) params.set("fieldItem", `${entry.fieldItemIndex}`);
        }

        const query = params.toString();
        return `/script/${entry.scriptId}/screen/${entry.screenId}${query ? `?${query}` : ""}`;
    }

    return `/script/${entry.scriptId}`;
}

function buildLegacyMaps(dataKeys: DataKey[]) {
    const byTypedName = new Map<string, DataKey[]>();
    const byTypedLabel = new Map<string, DataKey[]>();

    const add = (map: Map<string, DataKey[]>, key: string, value: DataKey) => {
        const current = map.get(key) || [];
        if (!current.find((item) => item.uniqueKey === value.uniqueKey)) current.push(value);
        map.set(key, current);
    };

    for (const dataKey of dataKeys) {
        if (dataKey.name) add(byTypedName, buildNormalizedDataKeyMatchKey(dataKey.name, dataKey.dataType), dataKey);
        if (dataKey.label) add(byTypedLabel, buildNormalizedDataKeyMatchKey(dataKey.label, dataKey.dataType), dataKey);
    }

    return { byTypedName, byTypedLabel };
}

function getCandidateMatches({
    currentKey,
    currentLabel,
    expectedDataType,
    maps,
}: {
    currentKey?: string;
    currentLabel?: string;
    expectedDataType: string;
    maps: ReturnType<typeof buildLegacyMaps>;
}): CandidateMatch {
    const keys = new Set<string>();
    const candidates: DataKey[] = [];
    const addCandidates = (items: DataKey[]) => {
        for (const item of items) {
            if (keys.has(item.uniqueKey)) continue;
            keys.add(item.uniqueKey);
            candidates.push(item);
        }
    };

    const normalizedType = normalizeDataKeyType(expectedDataType);
    if (currentKey) addCandidates(maps.byTypedName.get(buildNormalizedDataKeyMatchKey(currentKey, normalizedType)) || []);
    if (currentLabel) addCandidates(maps.byTypedLabel.get(buildNormalizedDataKeyMatchKey(currentLabel, normalizedType)) || []);

    return {
        matched: candidates.length === 1 ? candidates[0] : undefined,
        candidates,
    };
}

function getStrictSuggestedCandidates({
    currentKey,
    currentLabel,
    expectedDataType,
    dataKeys,
}: {
    currentKey?: string;
    currentLabel?: string;
    expectedDataType: string;
    dataKeys: DataKey[];
}) {
    const normalizedExpectedType = normalizeDataKeyType(expectedDataType);
    const currentTexts = Array.from(new Set(
        [currentKey, currentLabel]
            .map((value) => normalizeDataKeyMatchValue(`${value || ""}`))
            .filter((value) => value.length >= 3)
    ));

    if (!currentTexts.length) return [];

    const scoreCandidate = (candidate: DataKey) => {
        const candidateTexts = Array.from(new Set(
            [candidate.name, candidate.label]
                .map((value) => normalizeDataKeyMatchValue(`${value || ""}`))
                .filter((value) => value.length >= 3)
        ));
        if (!candidateTexts.length) return 0;

        let score = 0;
        for (const currentText of currentTexts) {
            for (const candidateText of candidateTexts) {
                if (candidateText === currentText) return 100;
                if (candidateText.startsWith(currentText) || currentText.startsWith(candidateText)) {
                    score = Math.max(score, 75);
                } else if (candidateText.includes(currentText) || currentText.includes(candidateText)) {
                    score = Math.max(score, 60);
                }
            }
        }
        return score;
    };

    return dataKeys
        .filter((candidate) => normalizeDataKeyType(candidate.dataType) === normalizedExpectedType)
        .map((candidate) => ({ candidate, score: scoreCandidate(candidate) }))
        .filter((item) => item.score >= 60)
        .sort((a, b) => b.score - a.score || `${a.candidate.label || a.candidate.name || ""}`.localeCompare(`${b.candidate.label || b.candidate.name || ""}`))
        .map((item) => item.candidate)
        .slice(0, 5);
}

function resolveDataKeyMatch({
    currentUniqueKey,
    currentKey,
    currentLabel,
    expectedDataType,
    byUniqueKey,
    legacyMaps,
}: {
    currentUniqueKey?: string;
    currentKey?: string;
    currentLabel?: string;
    expectedDataType: string;
    byUniqueKey: Map<string, DataKey>;
    legacyMaps: ReturnType<typeof buildLegacyMaps>;
}) {
    const resolved = currentUniqueKey ? byUniqueKey.get(currentUniqueKey) : undefined;
    if (resolved) return resolved;
    return getCandidateMatches({ currentKey, currentLabel, expectedDataType, maps: legacyMaps }).matched;
}

function compareOptionalDataKeyText(current: string | undefined, expected: string | undefined) {
    const currentValue = `${current || ""}`.trim();
    const expectedValue = `${expected || ""}`.trim();
    if (!currentValue || !expectedValue) return false;
    return currentValue !== expectedValue;
}

function createEntry(
    base: Omit<DataKeyIntegrityEntry, "status" | "reason">,
    status: DataKeyIntegrityStatus,
    reason: string,
    matched?: DataKey,
    suggested?: DataKey[],
): DataKeyIntegrityEntry {
    return {
        ...base,
        status,
        reason,
        matchedUniqueKey: matched?.uniqueKey,
        matchedName: matched?.name,
        matchedLabel: matched?.label,
        suggestedUniqueKeys: suggested?.map((item) => item.uniqueKey).filter(Boolean),
    };
}

function evaluateReference({
    currentUniqueKey,
    currentKey,
    currentLabel,
    expectedDataType,
    base,
    byUniqueKey,
    legacyMaps,
    compareAgainstResolved = true,
    requireLibraryLink = false,
}: {
    currentUniqueKey?: string;
    currentKey?: string;
    currentLabel?: string;
    expectedDataType: string;
    base: Omit<DataKeyIntegrityEntry, "status" | "reason">;
    byUniqueKey: Map<string, DataKey>;
    legacyMaps: ReturnType<typeof buildLegacyMaps>;
    compareAgainstResolved?: boolean;
    requireLibraryLink?: boolean;
}) {
    const current = currentUniqueKey ? byUniqueKey.get(currentUniqueKey) : undefined;

    if (current) {
        const normalizedExpectedType = normalizeDataKeyType(expectedDataType);
        const normalizedResolvedType = normalizeDataKeyType(current.dataType);
        if (normalizedExpectedType && normalizedResolvedType && normalizedExpectedType !== normalizedResolvedType) {
            return createEntry(base, "conflict", `Expected ${expectedDataType} but resolved data key is ${current.dataType}`, current);
        }

        if (compareAgainstResolved) {
            const keyMismatch = compareOptionalDataKeyText(currentKey, current.name);
            const labelMismatch = compareOptionalDataKeyText(currentLabel, current.label);
            if (keyMismatch || labelMismatch) {
                return createEntry(base, "out_of_sync", "Script reference text is stale compared with the data key library", current);
            }
        }

        return createEntry(base, "resolved", "Reference is linked to an existing data key", current);
    }

    const candidates = getCandidateMatches({
        currentKey,
        currentLabel,
        expectedDataType,
        maps: legacyMaps,
    });
    const suggestedCandidates = candidates.candidates.length
        ? candidates.candidates
        : getStrictSuggestedCandidates({
            currentKey,
            currentLabel,
            expectedDataType,
            dataKeys: Array.from(byUniqueKey.values()),
        });

    if (!candidates.candidates.length) {
        if (!currentUniqueKey && !requireLibraryLink) {
            return createEntry(base, "unmanaged", "Reference is script-local or legacy and is not explicitly linked to the data key library", undefined, suggestedCandidates);
        }
        return createEntry(base, "missing", "Referenced data key does not exist in the library", undefined, suggestedCandidates);
    }

    if (candidates.candidates.length > 1) {
        if (!currentUniqueKey && !requireLibraryLink) {
            return createEntry(base, "unmanaged", "Reference is script-local or legacy and multiple library candidates exist", undefined, candidates.candidates);
        }
        return createEntry(base, "conflict", "Multiple data keys could match this reference", undefined, candidates.candidates);
    }

    return createEntry(base, "legacy_match", "A matching data key exists, but this reference is not linked by unique key", candidates.matched, candidates.candidates);
}

function compareOwnedOptionCollection({
    currentItems,
    expectedOptions,
}: {
    currentItems: Array<{ keyId?: string; value?: string | number; label?: string | number; key?: string; id?: string }>;
    expectedOptions: DataKey[];
}) {
    if (!currentItems.length) return false;

    const byUniqueKey = new Map(expectedOptions.map((item) => [item.uniqueKey, item]));
    return currentItems.some((current) => {
        const keyId = `${current.keyId || ""}`.trim();
        if (!keyId) return false;
        return !byUniqueKey.has(keyId);
    });
}

function hasReferenceIdentity(values: Array<string | undefined | null>) {
    return values.some((value) => `${value || ""}`.trim().length > 0);
}

function screenItemsUseDataKeys(screenType?: string | null) {
    return `${screenType || ""}`.trim().toLowerCase() !== "progress";
}

function createInvalidOptionCollectionReason(options: string[]) {
    const cleaned = Array.from(new Set(options.map((option) => `${option || ""}`.trim()).filter(Boolean)));
    if (!cleaned.length) {
        return "Script contains option(s) that no longer exist in the parent data key option pool";
    }
    return `Script contains option(s) that no longer exist in the parent data key option pool: ${cleaned.join(", ")}`;
}

function collectDuplicateParentEntries(entries: DataKeyIntegrityEntry[]) {
    const parentEntries = entries.filter((entry) => (
        (entry.kind === "screen" || entry.kind === "field") &&
        !!(entry.currentUniqueKey || entry.matchedUniqueKey)
    ));

    const grouped = new Map<string, DataKeyIntegrityEntry[]>();
    parentEntries.forEach((entry) => {
        const uniqueKey = entry.currentUniqueKey || entry.matchedUniqueKey;
        if (!uniqueKey) return;
        const key = `${entry.scriptId}::${uniqueKey}`;
        const current = grouped.get(key) || [];
        current.push(entry);
        grouped.set(key, current);
    });

    const duplicates: DataKeyIntegrityEntry[] = [];
    grouped.forEach((group) => {
        if (group.length < 2) return;

        const parentName = group[0]?.matchedName || group[0]?.currentKey || group[0]?.currentLabel || "Data key";
        const sharedUniqueKey = group[0]?.currentUniqueKey || group[0]?.matchedUniqueKey;

        group.forEach((entry) => {
            duplicates.push({
                ...entry,
                kind: "duplicate_parent_data_key",
                status: "conflict",
                reason: `Parent data key "${parentName}" is used more than once in this script`,
                matchedUniqueKey: entry.matchedUniqueKey || sharedUniqueKey,
                matchedName: entry.matchedName || parentName,
                matchedLabel: entry.matchedLabel || entry.currentLabel,
            });
        });
    });

    return duplicates;
}

export function scanDataKeyIntegrity({
    screens = [],
    diagnoses = [],
    problems = [],
    dataKeys = [],
    onlyIssues = false,
}: {
    screens?: ScreenType[];
    diagnoses?: DiagnosisType[];
    problems?: ProblemType[];
    dataKeys?: DataKey[];
    onlyIssues?: boolean;
}): DataKeyIntegrityReport {
    const byUniqueKey = new Map<string, DataKey>();
    dataKeys.forEach((dataKey) => {
        if (dataKey.uniqueKey) byUniqueKey.set(dataKey.uniqueKey, dataKey);
    });

    const legacyMaps = buildLegacyMaps(dataKeys);
    const entries: DataKeyIntegrityEntry[] = [];

    const pushEntry = (entry: DataKeyIntegrityEntry) => {
        if (onlyIssues && entry.status === "resolved") return;
        entries.push(entry);
    };

    for (const screen of screens) {
        const screenBase = {
            scriptId: screen.scriptId,
            scriptTitle: screen.scriptTitle || undefined,
            screenId: screen.screenId,
            location: screen.title || screen.label || screen.refId || screen.screenId,
        };

        if (hasReferenceIdentity([screen.keyId, screen.key])) {
            pushEntry(evaluateReference({
                currentUniqueKey: screen.keyId || undefined,
                currentKey: screen.key || undefined,
                currentLabel: screen.label || undefined,
                expectedDataType: screen.type || "",
                base: {
                    ...screenBase,
                    kind: "screen",
                    expectedDataType: screen.type || "",
                    currentUniqueKey: screen.keyId || undefined,
                    currentKey: screen.key || undefined,
                    currentLabel: screen.label || undefined,
                },
                byUniqueKey,
                legacyMaps,
            }));
        }

        const screenDataKey = screen.keyId ? byUniqueKey.get(screen.keyId) : undefined;
        const screenOwnedOptions = resolveOwnedOptions(screenDataKey, byUniqueKey);
        const ownsScreenOptionCollection = shouldSyncScreenOwnedOptions({
            screenType: screen.type,
            dataKey: screenDataKey,
            currentItemsCount: (screen.items || []).length,
        });
        if (ownsScreenOptionCollection && compareOwnedOptionCollection({ currentItems: screen.items || [], expectedOptions: screenOwnedOptions })) {
            const invalidOptions = (screen.items || [])
                .filter((item) => {
                    const keyId = `${item.keyId || ""}`.trim();
                    if (!keyId) return false;
                    return !screenOwnedOptions.find((option) => option.uniqueKey === keyId);
                })
                .map((item) => `${item.label || item.key || item.id || item.keyId || ""}`);
            pushEntry(createEntry({
                ...screenBase,
                kind: "screen_option_collection",
                expectedDataType: screen.type || "",
                currentUniqueKey: screen.keyId || undefined,
                currentKey: screen.key || undefined,
                currentLabel: screen.label || undefined,
            }, "out_of_sync", createInvalidOptionCollectionReason(invalidOptions), screenDataKey));
        }

        if (screenItemsUseDataKeys(screen.type)) {
            (screen.items || []).forEach((item, itemIndex) => {
                pushEntry(evaluateReference({
                    currentUniqueKey: item.keyId || undefined,
                    currentKey: item.key || item.id || undefined,
                    currentLabel: item.label || undefined,
                    expectedDataType: screen.type === "diagnosis" ? "diagnosis" : "option",
                    base: {
                        ...screenBase,
                        kind: "screen_item",
                    expectedDataType: screen.type === "diagnosis" ? "diagnosis" : "option",
                    currentUniqueKey: item.keyId || undefined,
                    currentKey: item.key || item.id || undefined,
                    currentLabel: item.label || undefined,
                    screenItemId: item.itemId || undefined,
                    screenItemIndex: itemIndex,
                    location: `${screenBase.location} > item ${itemIndex + 1}`,
                },
                    byUniqueKey,
                    legacyMaps,
                }));
            });
        }

        (screen.fields || []).forEach((field, fieldIndex) => {
            const fieldBase = {
                ...screenBase,
                fieldId: field.fieldId || undefined,
                fieldIndex,
                location: `${screenBase.location} > ${field.label || field.key || `field ${fieldIndex + 1}`}`,
                expectedDataType: field.type || "",
            };

            if (hasReferenceIdentity([field.keyId, field.key])) {
                pushEntry(evaluateReference({
                    currentUniqueKey: field.keyId || undefined,
                    currentKey: field.key || undefined,
                    currentLabel: field.label || undefined,
                    expectedDataType: field.type || "",
                    base: {
                        ...fieldBase,
                        kind: "field",
                        currentUniqueKey: field.keyId || undefined,
                        currentKey: field.key || undefined,
                        currentLabel: field.label || undefined,
                    },
                    byUniqueKey,
                    legacyMaps,
                }));
            }

            const fieldDataKey = field.keyId ? byUniqueKey.get(field.keyId) : undefined;
            const fieldOwnedOptions = resolveOwnedOptions(fieldDataKey, byUniqueKey);
            const ownsFieldOptionCollection = shouldSyncFieldOwnedOptions({
                fieldType: field.type,
                dataKey: fieldDataKey,
                currentItemsCount: (field.items || []).length,
            });
            if (ownsFieldOptionCollection && compareOwnedOptionCollection({ currentItems: field.items || [], expectedOptions: fieldOwnedOptions })) {
                const invalidOptions = (field.items || [])
                    .filter((item) => {
                        const keyId = `${item.keyId || ""}`.trim();
                        if (!keyId) return false;
                        return !fieldOwnedOptions.find((option) => option.uniqueKey === keyId);
                    })
                    .map((item) => `${item.label || item.value || item.keyId || ""}`);
                pushEntry(createEntry({
                    ...fieldBase,
                    kind: "field_option_collection",
                    currentUniqueKey: field.keyId || undefined,
                    currentKey: field.key || undefined,
                    currentLabel: field.label || undefined,
                }, "out_of_sync", createInvalidOptionCollectionReason(invalidOptions), fieldDataKey));
            }

            const keyOnlyRefs: Array<{
                kind: DataKeyIntegrityKind;
                uniqueKey?: string;
                key?: string;
                expectedDataType: string;
            }> = [
                { kind: "field_ref", uniqueKey: field.refKeyId || undefined, key: field.refKey || undefined, expectedDataType: "" },
                { kind: "field_min_date", uniqueKey: field.minDateKeyId || undefined, key: field.minDateKey || undefined, expectedDataType: "date" },
                { kind: "field_max_date", uniqueKey: field.maxDateKeyId || undefined, key: field.maxDateKey || undefined, expectedDataType: "date" },
                { kind: "field_min_time", uniqueKey: field.minTimeKeyId || undefined, key: field.minTimeKey || undefined, expectedDataType: "time" },
                { kind: "field_max_time", uniqueKey: field.maxTimeKeyId || undefined, key: field.maxTimeKey || undefined, expectedDataType: "time" },
            ];

            keyOnlyRefs.forEach((ref) => {
                if (!ref.uniqueKey && !ref.key) return;
                pushEntry(evaluateReference({
                    currentUniqueKey: ref.uniqueKey,
                    currentKey: ref.key,
                    expectedDataType: ref.expectedDataType,
                    base: {
                        ...fieldBase,
                        kind: ref.kind,
                        currentUniqueKey: ref.uniqueKey,
                        currentKey: ref.key,
                    },
                    byUniqueKey,
                    legacyMaps,
                    compareAgainstResolved: false,
                }));
            });

            (field.items || []).forEach((item, fieldItemIndex) => {
                pushEntry(evaluateReference({
                    currentUniqueKey: item.keyId || undefined,
                    currentKey: `${item.value || ""}` || undefined,
                    currentLabel: `${item.label || ""}` || undefined,
                    expectedDataType: "option",
                    base: {
                        ...fieldBase,
                        kind: "field_item",
                        expectedDataType: "option",
                        currentUniqueKey: item.keyId || undefined,
                        currentKey: `${item.value || ""}` || undefined,
                        currentLabel: `${item.label || ""}` || undefined,
                        fieldItemId: item.itemId || undefined,
                        fieldItemIndex: fieldItemIndex,
                        location: `${fieldBase.location} > option ${fieldItemIndex + 1}`,
                    },
                    byUniqueKey,
                    legacyMaps,
                }));
            });
        });
    }

    for (const diagnosis of diagnoses) {
        const diagnosisBase = {
            scriptId: diagnosis.scriptId,
            scriptTitle: diagnosis.scriptTitle || undefined,
            diagnosisId: diagnosis.diagnosisId,
            location: diagnosis.name || diagnosis.key || diagnosis.diagnosisId,
        };

        pushEntry(evaluateReference({
            currentUniqueKey: diagnosis.keyId || undefined,
            currentKey: diagnosis.key || undefined,
            currentLabel: diagnosis.name || undefined,
            expectedDataType: "diagnosis",
            base: {
                ...diagnosisBase,
                kind: "diagnosis",
                expectedDataType: "diagnosis",
                currentUniqueKey: diagnosis.keyId || undefined,
                currentKey: diagnosis.key || undefined,
                currentLabel: diagnosis.name || undefined,
            },
            byUniqueKey,
            legacyMaps,
        }));

        (diagnosis.symptoms || []).forEach((symptom, symptomIndex) => {
            pushEntry(evaluateReference({
                currentUniqueKey: symptom.keyId || undefined,
                currentKey: symptom.key || undefined,
                currentLabel: symptom.name || undefined,
                expectedDataType: `diagnosis_symptom_${symptom.type}`,
                base: {
                    ...diagnosisBase,
                    kind: "diagnosis_symptom",
                    expectedDataType: `diagnosis_symptom_${symptom.type}`,
                    currentUniqueKey: symptom.keyId || undefined,
                    currentKey: symptom.key || undefined,
                    currentLabel: symptom.name || undefined,
                    symptomId: symptom.symptomId || undefined,
                    symptomIndex,
                    location: `${diagnosisBase.location} > symptom ${symptomIndex + 1}`,
                },
                byUniqueKey,
                legacyMaps,
            }));
        });
    }

    for (const problem of problems) {
        pushEntry(evaluateReference({
            currentUniqueKey: problem.keyId || undefined,
            currentKey: problem.key || undefined,
            currentLabel: problem.name || undefined,
            expectedDataType: "problem",
            base: {
                scriptId: problem.scriptId,
                scriptTitle: problem.scriptTitle || undefined,
                problemId: problem.problemId,
                location: problem.name || problem.key || problem.problemId,
                kind: "problem",
                expectedDataType: "problem",
                currentUniqueKey: problem.keyId || undefined,
                currentKey: problem.key || undefined,
                currentLabel: problem.name || undefined,
            },
            byUniqueKey,
            legacyMaps,
        }));
    }

    const duplicateParentEntries = collectDuplicateParentEntries(entries);
    duplicateParentEntries.forEach((entry) => pushEntry(entry));

    const summary = {
        total: entries.length,
        resolved: entries.filter((entry) => entry.status === "resolved").length,
        out_of_sync: entries.filter((entry) => entry.status === "out_of_sync").length,
        missing: entries.filter((entry) => entry.status === "missing").length,
        legacy_match: entries.filter((entry) => entry.status === "legacy_match").length,
        conflict: entries.filter((entry) => entry.status === "conflict").length,
        unmanaged: entries.filter((entry) => entry.status === "unmanaged").length,
        blocking: entries.filter((entry) => isBlockingEntry(entry)).length,
    };

    return { entries, summary };
}

function getPublishEntryDisplayName(entry: DataKeyIntegrityEntry) {
    return `${entry.currentLabel || entry.matchedLabel || entry.currentKey || entry.matchedName || entry.location || "Data key"}`.trim();
}

function getPublishEntryRuleLabel(entry: DataKeyIntegrityEntry) {
    if (entry.kind === "duplicate_parent_data_key") return "duplicate parent datakey";
    if (entry.kind === "screen_option_collection" || entry.kind === "field_option_collection") {
        return "invalid script option";
    }
    if (entry.status === "missing") return "missing datakey";
    if (entry.status === "legacy_match") return "unlinked datakey";
    if (entry.status === "unmanaged") return "unmanaged datakey";
    return entry.status.replace(/_/g, " ");
}

export function buildDataKeyIntegrityPublishDetails(report: DataKeyIntegrityReport): DataKeyIntegrityPublishDetails | null {
    const blocking = report.entries.filter((entry) => isBlockingEntry(entry));
    if (!blocking.length) return null;

    const grouped = new Map<string, DataKeyIntegrityEntry[]>();
    for (const entry of blocking) {
        const key = `${entry.scriptId}::${entry.scriptTitle || entry.scriptId}`;
        const current = grouped.get(key) || [];
        current.push(entry);
        grouped.set(key, current);
    }

    const countsByRule = blocking.reduce((acc, entry) => {
        const bucket = getPublishEntryRuleLabel(entry);
        acc[bucket] = (acc[bucket] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const topLevelSummary = Object.entries(countsByRule)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([label, count]) => `${count} ${label}${count === 1 ? "" : "s"}`)
        .join(", ");

    return {
        totalIssues: blocking.length,
        totalScripts: grouped.size,
        summary: [
            `Publish blocked: ${blocking.length} data key validation issue${blocking.length === 1 ? "" : "s"} found across ${grouped.size} script${grouped.size === 1 ? "" : "s"}.`,
            `Blocking rules triggered: ${topLevelSummary}.`,
        ],
        scripts: Array.from(grouped.entries()).map(([groupKey, entries]) => {
            const [scriptId, scriptTitleRaw] = groupKey.split("::");
            const scriptTitle = scriptTitleRaw || scriptId;
            return {
                scriptId,
                scriptTitle,
                totalIssues: entries.length,
                registryHref: `/script/${scriptId}/data-keys`,
                scriptHref: `/script/${scriptId}`,
                issues: entries.map((entry) => ({
                    scriptId,
                    scriptTitle,
                    ruleLabel: getPublishEntryRuleLabel(entry),
                    displayName: getPublishEntryDisplayName(entry),
                    reason: entry.reason,
                    location: entry.location,
                    usageHref: buildIntegrityEntryUsageHref(entry),
                    registryHref: `/script/${scriptId}/data-keys`,
                    scriptHref: `/script/${scriptId}`,
                })),
            };
        }),
    };
}

export function buildDataKeyIntegrityPublishErrors(report: DataKeyIntegrityReport) {
    const details = buildDataKeyIntegrityPublishDetails(report);
    if (!details) return [];

    const errors = [...details.summary];
    details.scripts.slice(0, 8).forEach((script) => {
        const lines = script.issues.slice(0, 3).map((issue) => (
            `${issue.ruleLabel} "${issue.displayName}"${issue.reason ? ` (${issue.reason})` : ""}`
        ));
        errors.push(`${script.scriptTitle}: ${lines.join("; ")}`);
        if (script.totalIssues > 3) {
            errors.push(`${script.scriptTitle}: additional blocking issues ${script.totalIssues - 3}`);
        }
    });
    if (details.totalScripts > 8) {
        errors.push(`Additional affected scripts: ${details.totalScripts - 8}`);
    }
    return errors;
}

function resolveOwnedOptions(dataKey: DataKey | undefined, byUniqueKey: Map<string, DataKey>) {
    if (!dataKey?.options?.length) return [];
    return dataKey.options
        .map((uniqueKey) => byUniqueKey.get(uniqueKey))
        .filter((item): item is DataKey => !!item);
}

export function repairDataKeyIntegrityReferences({
    screens = [],
    diagnoses = [],
    problems = [],
    dataKeys = [],
}: {
    screens?: ScreenType[];
    diagnoses?: DiagnosisType[];
    problems?: ProblemType[];
    dataKeys?: DataKey[];
}) {
    const byUniqueKey = new Map<string, DataKey>();
    dataKeys.forEach((dataKey) => {
        if (dataKey.uniqueKey) byUniqueKey.set(dataKey.uniqueKey, dataKey);
    });
    const legacyMaps = buildLegacyMaps(dataKeys);

    const repairedScreens = screens.map((screen) => {
        let changed = false;

        const screenDataKey = resolveDataKeyMatch({
            currentUniqueKey: screen.keyId || undefined,
            currentKey: screen.key || undefined,
            currentLabel: screen.label || undefined,
            expectedDataType: screen.type || "",
            byUniqueKey,
            legacyMaps,
        });
        const items = !screenItemsUseDataKeys(screen.type)
            ? (screen.items || [])
            : (screen.items || []).map((item) => {
                const itemDataKey = resolveDataKeyMatch({
                    currentUniqueKey: item.keyId || undefined,
                    currentKey: item.key || item.id || undefined,
                    currentLabel: item.label || undefined,
                    expectedDataType: screen.type === "diagnosis" ? "diagnosis" : "option",
                    byUniqueKey,
                    legacyMaps,
                });
                const synced = syncScreenReference(item, itemDataKey);
                if (synced.changed) changed = true;
                return synced.value;
            });

        const fields = (screen.fields || []).map((field) => {
            const fieldDataKey = resolveDataKeyMatch({
                currentUniqueKey: field.keyId || undefined,
                currentKey: field.key || undefined,
                currentLabel: field.label || undefined,
                expectedDataType: field.type || "",
                byUniqueKey,
                legacyMaps,
            });
            const refKeyDataKey = resolveDataKeyMatch({
                currentUniqueKey: field.refKeyId || undefined,
                currentKey: field.refKey || undefined,
                expectedDataType: "",
                byUniqueKey,
                legacyMaps,
            });
            const minDateKeyDataKey = resolveDataKeyMatch({
                currentUniqueKey: field.minDateKeyId || undefined,
                currentKey: field.minDateKey || undefined,
                expectedDataType: "date",
                byUniqueKey,
                legacyMaps,
            });
            const maxDateKeyDataKey = resolveDataKeyMatch({
                currentUniqueKey: field.maxDateKeyId || undefined,
                currentKey: field.maxDateKey || undefined,
                expectedDataType: "date",
                byUniqueKey,
                legacyMaps,
            });
            const minTimeKeyDataKey = resolveDataKeyMatch({
                currentUniqueKey: field.minTimeKeyId || undefined,
                currentKey: field.minTimeKey || undefined,
                expectedDataType: "time",
                byUniqueKey,
                legacyMaps,
            });
            const maxTimeKeyDataKey = resolveDataKeyMatch({
                currentUniqueKey: field.maxTimeKeyId || undefined,
                currentKey: field.maxTimeKey || undefined,
                expectedDataType: "time",
                byUniqueKey,
                legacyMaps,
            });

            const fieldItems = (field.items || []).map((item) => {
                const fieldItemDataKey = resolveDataKeyMatch({
                    currentUniqueKey: item.keyId || undefined,
                    currentKey: `${item.value || ""}` || undefined,
                    currentLabel: `${item.label || ""}` || undefined,
                    expectedDataType: "option",
                    byUniqueKey,
                    legacyMaps,
                });
                const syncedFieldItem = syncKeyOnlyReference(item, fieldItemDataKey, {
                    id: "keyId",
                    name: "value",
                });
                const fieldItemValue = fieldItemDataKey ? {
                    ...syncedFieldItem.value,
                    label: fieldItemDataKey.label,
                } : item;
                if (JSON.stringify(fieldItemValue) !== JSON.stringify(item)) changed = true;
                return fieldItemValue;
            });

            const syncedField = syncFieldReference(field, fieldDataKey);
            const syncedRefField = syncKeyOnlyReference(syncedField.value, refKeyDataKey, { id: "refKeyId", name: "refKey" });
            const syncedMinDateField = syncKeyOnlyReference(syncedRefField.value, minDateKeyDataKey, { id: "minDateKeyId", name: "minDateKey" });
            const syncedMaxDateField = syncKeyOnlyReference(syncedMinDateField.value, maxDateKeyDataKey, { id: "maxDateKeyId", name: "maxDateKey" });
            const syncedMinTimeField = syncKeyOnlyReference(syncedMaxDateField.value, minTimeKeyDataKey, { id: "minTimeKeyId", name: "minTimeKey" });
            const syncedMaxTimeField = syncKeyOnlyReference(syncedMinTimeField.value, maxTimeKeyDataKey, { id: "maxTimeKeyId", name: "maxTimeKey" });

            if (
                syncedField.changed ||
                syncedRefField.changed ||
                syncedMinDateField.changed ||
                syncedMaxDateField.changed ||
                syncedMinTimeField.changed ||
                syncedMaxTimeField.changed
            ) changed = true;

            return {
                ...syncedMaxTimeField.value,
                items: fieldItems,
            };
        });

        const syncedScreen = syncScreenEntityReference(screen, screenDataKey);
        if (syncedScreen.changed) changed = true;

        return {
            value: {
                ...syncedScreen.value,
                items,
                fields,
            },
            changed,
        };
    });

    const repairedDiagnoses = diagnoses.map((diagnosis) => {
        let changed = false;
        const diagnosisDataKey = resolveDataKeyMatch({
            currentUniqueKey: diagnosis.keyId || undefined,
            currentKey: diagnosis.key || undefined,
            currentLabel: diagnosis.name || undefined,
            expectedDataType: "diagnosis",
            byUniqueKey,
            legacyMaps,
        });

        const symptoms = (diagnosis.symptoms || []).map((symptom) => {
            const symptomDataKey = resolveDataKeyMatch({
                currentUniqueKey: symptom.keyId || undefined,
                currentKey: symptom.key || undefined,
                currentLabel: symptom.name || undefined,
                expectedDataType: `diagnosis_symptom_${symptom.type}`,
                byUniqueKey,
                legacyMaps,
            });
            const syncedSymptom = syncDiagnosisReference(symptom, symptomDataKey);
            if (syncedSymptom.changed) changed = true;
            return syncedSymptom.value;
        });

        const syncedDiagnosis = syncDiagnosisReference({
            ...diagnosis,
            key: diagnosis.key || diagnosis.name || "",
        }, diagnosisDataKey);
        if (syncedDiagnosis.changed) changed = true;

        return {
            value: {
                ...syncedDiagnosis.value,
                symptoms,
            },
            changed,
        };
    });

    const repairedProblems = problems.map((problem) => {
        let changed = false;
        const problemDataKey = resolveDataKeyMatch({
            currentUniqueKey: problem.keyId || undefined,
            currentKey: problem.key || undefined,
            currentLabel: problem.name || undefined,
            expectedDataType: "problem",
            byUniqueKey,
            legacyMaps,
        });

        const syncedProblem = syncDiagnosisReference({
            ...problem,
            key: problem.key || problem.name || "",
        }, problemDataKey);
        if (syncedProblem.changed) changed = true;

        return {
            value: syncedProblem.value,
            changed,
        };
    });

    return {
        screens: repairedScreens.filter((item) => item.changed).map((item) => item.value),
        diagnoses: repairedDiagnoses.filter((item) => item.changed).map((item) => item.value),
        problems: repairedProblems.filter((item) => item.changed).map((item) => item.value),
    };
}

export function repairSingleDataKeyIntegrityReference({
    entry,
    screens = [],
    diagnoses = [],
    problems = [],
    dataKeys = [],
    overrideTargetUniqueKey,
}: {
    entry: DataKeyIntegrityEntry;
    screens?: ScreenType[];
    diagnoses?: DiagnosisType[];
    problems?: ProblemType[];
    dataKeys?: DataKey[];
    overrideTargetUniqueKey?: string;
}) {
    const byUniqueKey = new Map<string, DataKey>();
    dataKeys.forEach((dataKey) => {
        if (dataKey.uniqueKey) byUniqueKey.set(dataKey.uniqueKey, dataKey);
    });
    const legacyMaps = buildLegacyMaps(dataKeys);
    const overrideTarget = overrideTargetUniqueKey ? byUniqueKey.get(overrideTargetUniqueKey) : undefined;

    const repairedScreens = screens.map((screen) => {
        let changed = false;
        const screenBase = {
            scriptId: screen.scriptId,
            screenId: screen.screenId,
            location: screen.title || screen.label || screen.refId || screen.screenId,
        };

        let nextScreen = screen;

        if (matchesIntegrityEntry(entry, { ...screenBase, kind: "screen" })) {
            const screenDataKey = overrideTarget || resolveDataKeyMatch({
                currentUniqueKey: screen.keyId || undefined,
                currentKey: screen.key || undefined,
                currentLabel: screen.label || undefined,
                expectedDataType: screen.type || "",
                byUniqueKey,
                legacyMaps,
            });
            const syncedScreen = syncScreenEntityReference(nextScreen, screenDataKey);
            if (syncedScreen.changed) changed = true;
            nextScreen = syncedScreen.value;
        }

        let nextItems = nextScreen.items || [];
        nextItems = !screenItemsUseDataKeys(nextScreen.type) ? nextItems : nextItems.map((item, itemIndex) => {
                const itemLocation = `${screenBase.location} > item ${itemIndex + 1}`;
                if (!matchesIntegrityEntry(entry, { ...screenBase, kind: "screen_item", location: itemLocation })) return item;
                const itemDataKey = overrideTarget || resolveDataKeyMatch({
                    currentUniqueKey: item.keyId || undefined,
                    currentKey: item.key || item.id || undefined,
                    currentLabel: item.label || undefined,
                    expectedDataType: nextScreen.type === "diagnosis" ? "diagnosis" : "option",
                    byUniqueKey,
                    legacyMaps,
                });
                const synced = syncScreenReference(item, itemDataKey);
                if (synced.changed) changed = true;
                return synced.value;
            });

        const nextFields = (nextScreen.fields || []).map((field, fieldIndex) => {
            const fieldBase = {
                ...screenBase,
                location: `${screenBase.location} > ${field.label || field.key || `field ${fieldIndex + 1}`}`,
            };
            let nextField = field;

            if (matchesIntegrityEntry(entry, { ...fieldBase, kind: "field" })) {
                const fieldDataKey = overrideTarget || resolveDataKeyMatch({
                    currentUniqueKey: field.keyId || undefined,
                    currentKey: field.key || undefined,
                    currentLabel: field.label || undefined,
                    expectedDataType: field.type || "",
                    byUniqueKey,
                    legacyMaps,
                });
                const syncedField = syncFieldReference(nextField, fieldDataKey);
                if (syncedField.changed) changed = true;
                nextField = syncedField.value;
            }

            const keyOnlyRefSpecs: Array<{
                kind: DataKeyIntegrityKind;
                id: "refKeyId" | "minDateKeyId" | "maxDateKeyId" | "minTimeKeyId" | "maxTimeKeyId";
                name: "refKey" | "minDateKey" | "maxDateKey" | "minTimeKey" | "maxTimeKey";
                expectedDataType: string;
            }> = [
                { kind: "field_ref", id: "refKeyId", name: "refKey", expectedDataType: "" },
                { kind: "field_min_date", id: "minDateKeyId", name: "minDateKey", expectedDataType: "date" },
                { kind: "field_max_date", id: "maxDateKeyId", name: "maxDateKey", expectedDataType: "date" },
                { kind: "field_min_time", id: "minTimeKeyId", name: "minTimeKey", expectedDataType: "time" },
                { kind: "field_max_time", id: "maxTimeKeyId", name: "maxTimeKey", expectedDataType: "time" },
            ];

            keyOnlyRefSpecs.forEach((spec) => {
                if (!matchesIntegrityEntry(entry, { ...fieldBase, kind: spec.kind })) return;
                const matchedDataKey = overrideTarget || resolveDataKeyMatch({
                    currentUniqueKey: nextField[spec.id] || undefined,
                    currentKey: nextField[spec.name] || undefined,
                    expectedDataType: spec.expectedDataType,
                    byUniqueKey,
                    legacyMaps,
                });
                const syncedField = syncKeyOnlyReference(nextField, matchedDataKey, { id: spec.id, name: spec.name });
                if (syncedField.changed) changed = true;
                nextField = syncedField.value;
            });

            let nextFieldItems = nextField.items || [];
            nextFieldItems = nextFieldItems.map((item, fieldItemIndex) => {
                    const itemLocation = `${fieldBase.location} > option ${fieldItemIndex + 1}`;
                    if (!matchesIntegrityEntry(entry, { ...fieldBase, kind: "field_item", location: itemLocation })) return item;
                    const fieldItemDataKey = overrideTarget || resolveDataKeyMatch({
                        currentUniqueKey: item.keyId || undefined,
                        currentKey: `${item.value || ""}` || undefined,
                        currentLabel: `${item.label || ""}` || undefined,
                        expectedDataType: "option",
                        byUniqueKey,
                        legacyMaps,
                    });
                    const syncedFieldItem = syncKeyOnlyReference(item, fieldItemDataKey, {
                        id: "keyId",
                        name: "value",
                    });
                    const fieldItemValue = fieldItemDataKey ? {
                        ...syncedFieldItem.value,
                        label: fieldItemDataKey.label,
                    } : item;
                    if (JSON.stringify(fieldItemValue) !== JSON.stringify(item)) changed = true;
                    return fieldItemValue;
                });

            return {
                ...nextField,
                items: nextFieldItems,
            };
        });

        return {
            value: {
                ...nextScreen,
                items: nextItems,
                fields: nextFields,
            },
            changed,
        };
    });

    const repairedDiagnoses = diagnoses.map((diagnosis) => {
        let changed = false;
        const diagnosisBase = {
            scriptId: diagnosis.scriptId,
            diagnosisId: diagnosis.diagnosisId,
            location: diagnosis.name || diagnosis.key || diagnosis.diagnosisId,
        };

        let nextDiagnosis = diagnosis;

        if (matchesIntegrityEntry(entry, { ...diagnosisBase, kind: "diagnosis" })) {
            const diagnosisDataKey = overrideTarget || resolveDataKeyMatch({
                currentUniqueKey: diagnosis.keyId || undefined,
                currentKey: diagnosis.key || undefined,
                currentLabel: diagnosis.name || undefined,
                expectedDataType: "diagnosis",
                byUniqueKey,
                legacyMaps,
            });
            const syncedDiagnosis = syncDiagnosisReference({
                ...nextDiagnosis,
                key: nextDiagnosis.key || nextDiagnosis.name || "",
            }, diagnosisDataKey);
            if (syncedDiagnosis.changed) changed = true;
            nextDiagnosis = syncedDiagnosis.value;
        }

        const nextSymptoms = (nextDiagnosis.symptoms || []).map((symptom, symptomIndex) => {
            const symptomLocation = `${diagnosisBase.location} > symptom ${symptomIndex + 1}`;
            if (!matchesIntegrityEntry(entry, { ...diagnosisBase, kind: "diagnosis_symptom", location: symptomLocation })) return symptom;
            const symptomDataKey = overrideTarget || resolveDataKeyMatch({
                currentUniqueKey: symptom.keyId || undefined,
                currentKey: symptom.key || undefined,
                currentLabel: symptom.name || undefined,
                expectedDataType: `diagnosis_symptom_${symptom.type}`,
                byUniqueKey,
                legacyMaps,
            });
            const syncedSymptom = syncDiagnosisReference(symptom, symptomDataKey);
            if (syncedSymptom.changed) changed = true;
            return syncedSymptom.value;
        });

        return {
            value: {
                ...nextDiagnosis,
                symptoms: nextSymptoms,
            },
            changed,
        };
    });

    const repairedProblems = problems.map((problem) => {
        let changed = false;
        const problemBase = {
            scriptId: problem.scriptId,
            problemId: problem.problemId,
            location: problem.name || problem.key || problem.problemId,
        };

        let nextProblem = problem;

        if (matchesIntegrityEntry(entry, { ...problemBase, kind: "problem" })) {
            const problemDataKey = overrideTarget || resolveDataKeyMatch({
                currentUniqueKey: problem.keyId || undefined,
                currentKey: problem.key || undefined,
                currentLabel: problem.name || undefined,
                expectedDataType: "problem",
                byUniqueKey,
                legacyMaps,
            });
            const syncedProblem = syncDiagnosisReference({
                ...nextProblem,
                key: nextProblem.key || nextProblem.name || "",
            }, problemDataKey);
            if (syncedProblem.changed) changed = true;
            nextProblem = syncedProblem.value;
        }

        return {
            value: nextProblem,
            changed,
        };
    });

    return {
        screens: repairedScreens.filter((item) => item.changed).map((item) => item.value),
        diagnoses: repairedDiagnoses.filter((item) => item.changed).map((item) => item.value),
        problems: repairedProblems.filter((item) => item.changed).map((item) => item.value),
    };
}
