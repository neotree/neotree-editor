import { randomUUID } from "crypto";

import { buildNormalizedDataKeyMatchKey } from "@/lib/data-key-types";
import type { DataKey } from "@/databases/queries/data-keys";
import type { ScriptItem, ScriptField } from "@/types";

type OptionDataKey = {
    uniqueKey: string;
    name: string;
    label: string;
    confidential?: boolean | null;
    dataType?: string | null;
};

type ExistingFieldItem = NonNullable<ScriptField["items"]>[number];
type ExistingScreenItem = ScriptItem;
type SyncableObject = Record<string, unknown>;
type SyncPatch<T> = Partial<T>;
type SyncPatchBuilder<T extends SyncableObject> = (dataKey: DataKey, current: T) => SyncPatch<T>;

function buildExistingOptionMaps<T extends { keyId?: string; label?: unknown }>(
    items: T[],
    currentOptions: OptionDataKey[],
    getKeys: (item: T) => string[],
) {
    const byUniqueKey = new Map<string, T>();
    const byLegacyKey = new Map<string, T>();

    for (const item of items) {
        if (item.keyId) byUniqueKey.set(item.keyId, item);

        for (const raw of getKeys(item)) {
            const value = `${raw || ""}`.trim();
            if (!value) continue;

            for (const option of currentOptions) {
                const nameKey = buildNormalizedDataKeyMatchKey(option.name, option.dataType);
                const labelKey = buildNormalizedDataKeyMatchKey(option.label, option.dataType);
                const candidateKey = buildNormalizedDataKeyMatchKey(value, option.dataType);
                if (candidateKey === nameKey || candidateKey === labelKey) {
                    if (!byLegacyKey.has(option.uniqueKey)) byLegacyKey.set(option.uniqueKey, item);
                }
            }
        }
    }

    return { byUniqueKey, byLegacyKey };
}

function takeUnusedExisting<T>(used: Set<T>, ...candidates: Array<T | undefined>) {
    for (const candidate of candidates) {
        if (!candidate) continue;
        if (used.has(candidate)) continue;
        used.add(candidate);
        return candidate;
    }
    return undefined;
}

function inferScreenItemDataType(screenType?: string | null) {
    switch (`${screenType || ""}`) {
        case "checklist":
            return "boolean";
        case "single_select":
            return "id";
        case "diagnosis":
            return "diagnosis";
        default:
            return null;
    }
}

export function shouldSyncScreenOwnedOptions({
    screenType,
    dataKey,
    currentItemsCount,
}: {
    screenType?: string | null;
    dataKey?: DataKey;
    currentItemsCount: number;
}) {
    const type = `${screenType || ""}`.trim().toLowerCase();
    const ownsChildren = ["checklist", "multi_select", "single_select"].includes(type);
    if (!ownsChildren) return false;
    return !!dataKey && (!!(dataKey.options || []).length || currentItemsCount > 0);
}

export function shouldSyncFieldOwnedOptions({
    fieldType,
    dataKey,
    currentItemsCount,
}: {
    fieldType?: string | null;
    dataKey?: DataKey;
    currentItemsCount: number;
}) {
    const type = `${fieldType || ""}`.trim().toLowerCase();
    const ownsChildren = ["dropdown", "multi_select"].includes(type);
    if (!ownsChildren) return false;
    return !!dataKey && (!!(dataKey.options || []).length || currentItemsCount > 0);
}

export function applyDataKeySync<T extends SyncableObject>(
    current: T,
    dataKey: DataKey | undefined,
    buildPatch: SyncPatchBuilder<T>,
) {
    if (!dataKey) {
        return { value: current, changed: false };
    }

    const patch = buildPatch(dataKey, current);
    const value = {
        ...current,
        ...patch,
    };

    return {
        value,
        changed: JSON.stringify(value) !== JSON.stringify(current),
    };
}

export function applyOwnedOptionCollectionSync<T>(
    currentItems: T[],
    ownsChildren: boolean,
    rebuild: () => T[],
) {
    if (!ownsChildren) {
        return { value: currentItems, changed: false };
    }

    const value = rebuild();
    return {
        value,
        changed: JSON.stringify(value) !== JSON.stringify(currentItems),
    };
}

export function resolveOwnedOptionDataKeys(
    dataKey: DataKey | undefined,
    byUniqueKey: Map<string, DataKey>,
) {
    if (!dataKey) return [];
    return (dataKey.options || [])
        .map(uniqueKey => byUniqueKey.get(uniqueKey))
        .filter((item): item is DataKey => !!item);
}

export function syncScreenReference(current: ExistingScreenItem, dataKey?: DataKey) {
    return applyDataKeySync(current, dataKey, (item, existing) => ({
        keyId: item.uniqueKey,
        label: item.label,
        confidential: !!item.confidential,
        ...(!(`${existing.key || ""}`.length) ? {} : { key: item.name }),
        ...(!(`${existing.id || ""}`.length) ? {} : { id: item.name }),
    }));
}

export function syncFieldReference(current: ScriptField, dataKey?: DataKey) {
    return applyDataKeySync(current, dataKey, (item) => ({
        keyId: item.uniqueKey,
        key: item.name,
        label: item.label,
        confidential: !!item.confidential,
        optional: !!(item.metadata as Record<string, unknown> | undefined)?.optional,
    }));
}

export function syncScreenEntityReference<T extends { key?: string; keyId?: string; label?: string; confidential?: boolean }>(
    current: T,
    dataKey?: DataKey,
) {
    return applyDataKeySync(current as SyncableObject as T, dataKey, (item) => ({
        keyId: item.uniqueKey,
        key: item.name,
        label: item.label,
        confidential: !!item.confidential,
    } as SyncPatch<T>));
}

export function syncDiagnosisReference<T extends { key?: string; keyId?: string; name?: string }>(current: T, dataKey?: DataKey) {
    return applyDataKeySync(current as SyncableObject as T, dataKey, (item) => ({
        keyId: item.uniqueKey,
        key: item.name,
        name: item.label,
    } as SyncPatch<T>));
}

export function syncKeyOnlyReference<T extends SyncableObject>(
    current: T,
    dataKey: DataKey | undefined,
    fields: {
        id: keyof T;
        name: keyof T;
    },
) {
    return applyDataKeySync(current, dataKey, (item) => ({
        [fields.id]: item.uniqueKey,
        [fields.name]: item.name,
    } as SyncPatch<T>));
}

export function rebuildFieldItemsFromDataKeyOptions({
    currentItems = [],
    optionDataKeys = [],
}: {
    currentItems?: ExistingFieldItem[];
    optionDataKeys?: OptionDataKey[];
}): ExistingFieldItem[] {
    const maps = buildExistingOptionMaps(
        currentItems,
        optionDataKeys,
        (item) => [`${item.value || ""}`, `${item.label || ""}`],
    );
    const usedExisting = new Set<ExistingFieldItem>();

    return optionDataKeys.map((item) => {
        const existing = takeUnusedExisting(
            usedExisting,
            maps.byUniqueKey.get(item.uniqueKey),
            maps.byLegacyKey.get(item.uniqueKey),
        );
        return {
            ...existing,
            itemId: `${existing?.itemId || ""}` || randomUUID(),
            value: item.name,
            label: item.label,
            keyId: item.uniqueKey,
        };
    });
}

export function rebuildScreenItemsFromDataKeyOptions({
    currentItems = [],
    optionDataKeys = [],
    screenType,
}: {
    currentItems?: ExistingScreenItem[];
    optionDataKeys?: OptionDataKey[];
    screenType?: string | null;
}): ExistingScreenItem[] {
    const maps = buildExistingOptionMaps(
        currentItems,
        optionDataKeys,
        (item) => [`${item.id || ""}`, `${item.key || ""}`, `${item.label || ""}`],
    );
    const usedExisting = new Set<ExistingScreenItem>();

    return optionDataKeys.map((item, index) => {
        const existing = takeUnusedExisting(
            usedExisting,
            maps.byUniqueKey.get(item.uniqueKey),
            maps.byLegacyKey.get(item.uniqueKey),
        );
        return {
            ...existing,
            itemId: `${existing?.itemId || ""}` || randomUUID(),
            id: item.name,
            key: item.name,
            label: item.label,
            keyId: item.uniqueKey,
            confidential: !!item.confidential,
            position: index + 1,
            subType: `${existing?.subType || ""}`,
            type: `${existing?.type || screenType || ""}`,
            exclusive: !!existing?.exclusive,
            exclusiveGroup: `${existing?.exclusiveGroup || ""}`,
            forbidWith: Array.isArray(existing?.forbidWith) ? existing.forbidWith : [],
            checked: !!existing?.checked,
            enterValueManually: !!existing?.enterValueManually,
            enterValueManuallyLabel: `${existing?.enterValueManuallyLabel || ""}`,
            severity_order: `${existing?.severity_order || ""}`,
            summary: `${existing?.summary || ""}`,
            dataType: existing?.dataType ?? inferScreenItemDataType(screenType),
            score: typeof existing?.score === "number" ? existing.score : null,
            printDisplayColumns: existing?.printDisplayColumns === 1 ? 1 as const : 2 as const,
        };
    });
}
