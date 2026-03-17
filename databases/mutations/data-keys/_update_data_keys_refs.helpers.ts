import { randomUUID } from "crypto";

import { buildNormalizedDataKeyMatchKey } from "@/lib/data-key-types";
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

function inferScreenItemDataType(screenType?: string) {
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

    return optionDataKeys.map((item) => {
        const existing = maps.byUniqueKey.get(item.uniqueKey) || maps.byLegacyKey.get(item.uniqueKey);
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

    return optionDataKeys.map((item, index) => {
        const existing = maps.byUniqueKey.get(item.uniqueKey) || maps.byLegacyKey.get(item.uniqueKey);
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
