import { buildNormalizedDataKeyMatchKey, normalizeDataKeyType } from "@/lib/data-key-types";
import type { DataKey } from "@/databases/queries/data-keys";
import type { DiagnosisType, ScreenType } from "@/databases/queries/scripts";
import {
    applyOwnedOptionCollectionSync,
    resolveOwnedOptionDataKeys,
    rebuildFieldItemsFromDataKeyOptions,
    rebuildScreenItemsFromDataKeyOptions,
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
    | "diagnosis_symptom";

export type DataKeyIntegrityEntry = {
    status: DataKeyIntegrityStatus;
    kind: DataKeyIntegrityKind;
    reason: string;
    scriptId: string;
    scriptTitle?: string;
    screenId?: string;
    diagnosisId?: string;
    location: string;
    expectedDataType: string;
    currentUniqueKey?: string;
    currentKey?: string;
    currentLabel?: string;
    matchedUniqueKey?: string;
    matchedName?: string;
    matchedLabel?: string;
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

type CandidateMatch = {
    matched?: DataKey;
    candidates: DataKey[];
};

function isBlockingStatus(status: DataKeyIntegrityStatus) {
    return status === "missing" || status === "legacy_match" || status === "conflict";
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

function createEntry(base: Omit<DataKeyIntegrityEntry, "status" | "reason">, status: DataKeyIntegrityStatus, reason: string, matched?: DataKey): DataKeyIntegrityEntry {
    return {
        ...base,
        status,
        reason,
        matchedUniqueKey: matched?.uniqueKey,
        matchedName: matched?.name,
        matchedLabel: matched?.label,
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

    if (!candidates.candidates.length) {
        if (!currentUniqueKey && !requireLibraryLink) {
            return createEntry(base, "unmanaged", "Reference is script-local or legacy and is not explicitly linked to the data key library");
        }
        return createEntry(base, "missing", "Referenced data key does not exist in the library");
    }

    if (candidates.candidates.length > 1) {
        if (!currentUniqueKey && !requireLibraryLink) {
            return createEntry(base, "unmanaged", "Reference is script-local or legacy and multiple library candidates exist");
        }
        return createEntry(base, "conflict", "Multiple data keys could match this reference");
    }

    return createEntry(base, "legacy_match", "A matching data key exists, but this reference is not linked by unique key", candidates.matched);
}

function compareOwnedOptionCollection({
    currentItems,
    expectedOptions,
}: {
    currentItems: Array<{ keyId?: string; value?: string | number; label?: string | number; key?: string; id?: string }>;
    expectedOptions: DataKey[];
}) {
    if (!expectedOptions.length && !currentItems.length) return false;
    if (currentItems.length !== expectedOptions.length) return true;

    for (let index = 0; index < expectedOptions.length; index++) {
        const expected = expectedOptions[index];
        const current = currentItems[index];
        if (!current) return true;

        const currentName = `${current.value || current.key || current.id || ""}`.trim();
        const currentLabel = `${current.label || ""}`.trim();

        if ((current.keyId || "") !== expected.uniqueKey) return true;
        if (currentName !== `${expected.name || ""}`.trim()) return true;
        if (currentLabel !== `${expected.label || ""}`.trim()) return true;
    }

    return false;
}

export function scanDataKeyIntegrity({
    screens = [],
    diagnoses = [],
    dataKeys = [],
    onlyIssues = false,
}: {
    screens?: ScreenType[];
    diagnoses?: DiagnosisType[];
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

        if (screen.refId || screen.refIdDataKey) {
        pushEntry(evaluateReference({
            currentUniqueKey: screen.refIdDataKey || undefined,
            currentKey: screen.refId || undefined,
            expectedDataType: "",
            base: {
                ...screenBase,
                kind: "screen_ref",
                expectedDataType: "",
                currentUniqueKey: screen.refIdDataKey || undefined,
                currentKey: screen.refId || undefined,
            },
                byUniqueKey,
                legacyMaps,
                compareAgainstResolved: false,
            }));
        }

        const screenDataKey = screen.keyId ? byUniqueKey.get(screen.keyId) : undefined;
        const screenOwnedOptions = resolveOwnedOptions(screenDataKey, byUniqueKey);
        if (shouldSyncScreenOwnedOptions({
            screenType: screen.type,
            dataKey: screenDataKey,
            currentItemsCount: (screen.items || []).length,
        }) && compareOwnedOptionCollection({ currentItems: screen.items || [], expectedOptions: screenOwnedOptions })) {
            pushEntry(createEntry({
                ...screenBase,
                kind: "screen_option_collection",
                expectedDataType: screen.type || "",
                currentUniqueKey: screen.keyId || undefined,
                currentKey: screen.key || undefined,
                currentLabel: screen.label || undefined,
            }, "out_of_sync", "Screen options have drifted from the parent data key option list", screenDataKey));
        }

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
                    location: `${screenBase.location} > item ${itemIndex + 1}`,
                },
                byUniqueKey,
                legacyMaps,
            }));
        });

        (screen.fields || []).forEach((field, fieldIndex) => {
            const fieldBase = {
                ...screenBase,
                location: `${screenBase.location} > ${field.label || field.key || `field ${fieldIndex + 1}`}`,
                expectedDataType: field.type || "",
            };

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

            const fieldDataKey = field.keyId ? byUniqueKey.get(field.keyId) : undefined;
            const fieldOwnedOptions = resolveOwnedOptions(fieldDataKey, byUniqueKey);
            if (shouldSyncFieldOwnedOptions({
                fieldType: field.type,
                dataKey: fieldDataKey,
                currentItemsCount: (field.items || []).length,
            }) && compareOwnedOptionCollection({ currentItems: field.items || [], expectedOptions: fieldOwnedOptions })) {
                pushEntry(createEntry({
                    ...fieldBase,
                    kind: "field_option_collection",
                    currentUniqueKey: field.keyId || undefined,
                    currentKey: field.key || undefined,
                    currentLabel: field.label || undefined,
                }, "out_of_sync", "Field options have drifted from the parent data key option list", fieldDataKey));
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
                    location: `${diagnosisBase.location} > symptom ${symptomIndex + 1}`,
                },
                byUniqueKey,
                legacyMaps,
            }));
        });
    }

    const summary = {
        total: entries.length,
        resolved: entries.filter((entry) => entry.status === "resolved").length,
        out_of_sync: entries.filter((entry) => entry.status === "out_of_sync").length,
        missing: entries.filter((entry) => entry.status === "missing").length,
        legacy_match: entries.filter((entry) => entry.status === "legacy_match").length,
        conflict: entries.filter((entry) => entry.status === "conflict").length,
        unmanaged: entries.filter((entry) => entry.status === "unmanaged").length,
        blocking: entries.filter((entry) => isBlockingStatus(entry.status)).length,
    };

    return { entries, summary };
}

export function buildDataKeyIntegrityPublishErrors(report: DataKeyIntegrityReport) {
    const blocking = report.entries.filter((entry) => isBlockingStatus(entry.status));
    if (!blocking.length) return [];

    const grouped = new Map<string, DataKeyIntegrityEntry[]>();
    for (const entry of blocking) {
        const key = `${entry.scriptTitle || entry.scriptId}`;
        const current = grouped.get(key) || [];
        current.push(entry);
        grouped.set(key, current);
    }

    const errors = [
        `Publish blocked: ${blocking.length} unresolved data key integrity issue${blocking.length === 1 ? "" : "s"} found across ${grouped.size} script${grouped.size === 1 ? "" : "s"}.`,
    ];

    Array.from(grouped.entries()).slice(0, 8).forEach(([script, entries]) => {
        const statuses = entries.reduce((acc, entry) => {
            acc[entry.status] = (acc[entry.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const statusSummary = Object.entries(statuses)
            .map(([status, count]) => `${count} ${status.replace(/_/g, " ")}`)
            .join(", ");
        errors.push(`${script}: ${statusSummary}`);
    });

    if (grouped.size > 8) {
        errors.push(`Additional affected scripts: ${grouped.size - 8}`);
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
    dataKeys = [],
}: {
    screens?: ScreenType[];
    diagnoses?: DiagnosisType[];
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
        const refIdDataKey = resolveDataKeyMatch({
            currentUniqueKey: screen.refIdDataKey || undefined,
            currentKey: screen.refId || undefined,
            expectedDataType: "",
            byUniqueKey,
            legacyMaps,
        });

        const items = (screen.items || []).map((item) => {
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

        const rebuiltScreenItems = applyOwnedOptionCollectionSync(
            items,
            shouldSyncScreenOwnedOptions({
                screenType: screen.type,
                dataKey: screenDataKey,
                currentItemsCount: (screen.items || []).length,
            }),
            () => rebuildScreenItemsFromDataKeyOptions({
                currentItems: items,
                optionDataKeys: resolveOwnedOptionDataKeys(screenDataKey, byUniqueKey),
                screenType: screen.type,
            }),
        );
        if (rebuiltScreenItems.changed) changed = true;

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

            const rebuiltFieldItems = applyOwnedOptionCollectionSync(
                fieldItems,
                shouldSyncFieldOwnedOptions({
                    fieldType: field.type,
                    dataKey: fieldDataKey,
                    currentItemsCount: (field.items || []).length,
                }),
                () => rebuildFieldItemsFromDataKeyOptions({
                    currentItems: fieldItems,
                    optionDataKeys: resolveOwnedOptionDataKeys(fieldDataKey, byUniqueKey),
                }),
            );
            if (rebuiltFieldItems.changed) changed = true;

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
                items: rebuiltFieldItems.value,
            };
        });

        const syncedScreen = syncScreenEntityReference(screen, screenDataKey);
        const syncedRefScreen = syncKeyOnlyReference(syncedScreen.value, refIdDataKey, { id: "refIdDataKey", name: "refId" });
        if (syncedScreen.changed || syncedRefScreen.changed) changed = true;

        return {
            value: {
                ...syncedRefScreen.value,
                items: rebuiltScreenItems.value,
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

    return {
        screens: repairedScreens.filter((item) => item.changed).map((item) => item.value),
        diagnoses: repairedDiagnoses.filter((item) => item.changed).map((item) => item.value),
    };
}
