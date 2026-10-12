import { validateDataKeyOptionsAddition } from './data-key-children';
import { normalizeDataKeyType } from './data-key-types';

export type MergeDataKey = {
    uuid: string;
    uniqueKey: string;
    name?: string | null;
    label?: string | null;
    dataType?: string | null;
    options?: string[] | null;
    isDeleted?: boolean | null;
};

/**
 * What happens to one child of a parent being merged into the kept parent:
 * - keep: the kept parent already offers this exact child — nothing to swap.
 * - match: swap it for an existing child of the kept parent (`to` = uniqueKey).
 * - add: add it to the kept parent's options.
 * - drop: remove it from the merged parents' screens.
 */
export type ChildMergeAction =
    | { action: 'keep' }
    | { action: 'match'; to: string }
    | { action: 'add' }
    | { action: 'drop' };

/** Why a match was suggested, strongest first. */
export type ChildMatchReason = 'same' | 'name' | 'label' | 'similar';

export type DataKeyMergeChildRow = {
    uniqueKey: string;
    name: string;
    label: string;
    dataType: string;
    /** uniqueKeys of the merged parents that offer this child. */
    parents: string[];
    action: ChildMergeAction;
    /** True when `action` came from the suggestion rather than the caller. */
    suggested: boolean;
    /** The suggestion for this child (independent of the chosen action). */
    suggestion: ChildMergeAction;
    suggestionReason: ChildMatchReason | null;
};

export type DataKeyMergePlan = {
    errors: string[];
    survivor: MergeDataKey | null;
    merged: MergeDataKey[];
    children: DataKeyMergeChildRow[];
    /** The kept parent's options after the merge. */
    nextSurvivorOptions: string[];
    /** Children added to the kept parent (subset of nextSurvivorOptions). */
    addedOptions: string[];
    /** merged child uniqueKey -> kept parent's child uniqueKey */
    childReplacements: Record<string, string>;
    droppedChildren: string[];
    /** New label for the kept parent, when it is being changed. */
    survivorLabel: string | null;
};

const norm = (value?: string | null) => `${value || ''}`.trim();
const lower = (value?: string | null) => norm(value).toLowerCase();
const isParent = (dataKey?: MergeDataKey | null) => !!(dataKey?.options || []).some((option) => !!norm(option));
/** Letters and digits only: "Bulging / Tense" ~ "bulgingtense". */
const loose = (value?: string | null) => lower(value).replace(/[^a-z0-9]/g, '');

/** Stable identity of a group of keys (sorted uniqueKeys). */
export function getDuplicateGroupKey(dataKeys: Pick<MergeDataKey, 'uniqueKey'>[]) {
    return dataKeys.map((dataKey) => norm(dataKey.uniqueKey)).filter(Boolean).sort().join('|');
}

export function getMergeKeyTitle(dataKey?: Pick<MergeDataKey, 'name' | 'label' | 'uniqueKey'> | null) {
    return norm(dataKey?.name) || norm(dataKey?.label) || norm(dataKey?.uniqueKey) || 'Data key';
}

/**
 * Parent keys that look like the same key: identical name, label and data type
 * (case-insensitive). Each group has at least two parents and is a candidate
 * for a merge.
 */
export function findDuplicateParentGroups<T extends MergeDataKey>(dataKeys: T[]): T[][] {
    const groups = new Map<string, T[]>();

    for (const dataKey of dataKeys) {
        if (dataKey.isDeleted || !isParent(dataKey) || !norm(dataKey.uuid)) continue;
        const key = [lower(dataKey.name), lower(dataKey.label), normalizeDataKeyType(dataKey.dataType)].join('::');
        if (key === '::::' || !lower(dataKey.name)) continue;
        groups.set(key, [...(groups.get(key) || []), dataKey]);
    }

    return Array.from(groups.values())
        .filter((group) => group.length > 1)
        .sort((a, b) => getMergeKeyTitle(a[0]).localeCompare(getMergeKeyTitle(b[0])));
}

export type ChildMergeSuggestion = { action: ChildMergeAction; reason: ChildMatchReason | null; };

/**
 * Default action for every child of the merged parents: keep when the kept
 * parent already offers it, otherwise match a same-type child of the kept
 * parent by name, then label, then a looser comparison that ignores case,
 * spacing and punctuation; otherwise add it.
 */
export function suggestChildMergeActionsWithReasons({
    dataKeys,
    survivor,
    merged,
}: {
    dataKeys: MergeDataKey[];
    survivor: MergeDataKey;
    merged: MergeDataKey[];
}): Record<string, ChildMergeSuggestion> {
    const byUniqueKey = new Map(dataKeys.map((dataKey) => [norm(dataKey.uniqueKey), dataKey]));
    const survivorOptions = (survivor.options || []).map(norm).filter(Boolean);
    const survivorChildren = survivorOptions
        .map((uniqueKey) => byUniqueKey.get(uniqueKey))
        .filter((child): child is MergeDataKey => !!child);

    const suggestions: Record<string, ChildMergeSuggestion> = {};

    for (const parent of merged) {
        for (const childKey of (parent.options || []).map(norm).filter(Boolean)) {
            if (suggestions[childKey]) continue;

            if (survivorOptions.includes(childKey)) {
                suggestions[childKey] = { action: { action: 'keep' }, reason: 'same' };
                continue;
            }

            const child = byUniqueKey.get(childKey);
            const childType = normalizeDataKeyType(child?.dataType);
            const sameType = survivorChildren.filter((candidate) => normalizeDataKeyType(candidate.dataType) === childType);

            const tiers: Array<[ChildMatchReason, (candidate: MergeDataKey) => boolean]> = [
                ['name', (candidate) => !!lower(child?.name) && lower(candidate.name) === lower(child?.name)],
                ['label', (candidate) => !!lower(child?.label) && lower(candidate.label) === lower(child?.label)],
                ['similar', (candidate) => (
                    (!!loose(child?.name) && loose(candidate.name) === loose(child?.name)) ||
                    (!!loose(child?.label) && loose(candidate.label) === loose(child?.label))
                )],
            ];

            let suggestion: ChildMergeSuggestion = { action: { action: 'add' }, reason: null };
            if (child) {
                for (const [reason, test] of tiers) {
                    const match = sameType.find(test);
                    if (match) {
                        suggestion = { action: { action: 'match', to: norm(match.uniqueKey) }, reason };
                        break;
                    }
                }
            }
            suggestions[childKey] = suggestion;
        }
    }

    return suggestions;
}

/** Suggested action per child (see suggestChildMergeActionsWithReasons). */
export function suggestChildMergeActions(params: Parameters<typeof suggestChildMergeActionsWithReasons>[0]): Record<string, ChildMergeAction> {
    return Object.fromEntries(Object.entries(suggestChildMergeActionsWithReasons(params))
        .map(([childKey, suggestion]) => [childKey, suggestion.action]));
}

/**
 * Validates a merge and resolves it into the concrete changes: the kept
 * parent's new option pool, which merged children are swapped for which kept
 * children, and which are dropped. Children without an explicit action use the
 * suggestion, so a partial `childActions` is fine.
 */
export function buildDataKeysMergePlan({
    dataKeys,
    survivorId,
    mergedIds,
    childActions = {},
    survivorOptionOrder,
    survivorLabel,
}: {
    dataKeys: MergeDataKey[];
    survivorId: string;
    mergedIds: string[];
    childActions?: Record<string, ChildMergeAction>;
    /** The kept parent's options in the order to save them (a permutation of the result). */
    survivorOptionOrder?: string[];
    /** New label for the kept parent. */
    survivorLabel?: string | null;
}): DataKeyMergePlan {
    const plan: DataKeyMergePlan = {
        errors: [],
        survivor: null,
        merged: [],
        children: [],
        nextSurvivorOptions: [],
        addedOptions: [],
        childReplacements: {},
        droppedChildren: [],
        survivorLabel: null,
    };

    const byId = new Map(dataKeys.map((dataKey) => [norm(dataKey.uuid), dataKey]));
    const byUniqueKey = new Map(dataKeys.map((dataKey) => [norm(dataKey.uniqueKey), dataKey]));

    const survivor = byId.get(norm(survivorId));
    if (!survivor || survivor.isDeleted) {
        plan.errors.push('Choose the data key to keep.');
        return plan;
    }
    plan.survivor = survivor;

    const ids = Array.from(new Set(mergedIds.map(norm).filter(Boolean))).filter((id) => id !== norm(survivor.uuid));
    plan.merged = ids.map((id) => byId.get(id)).filter((dataKey): dataKey is MergeDataKey => !!dataKey && !dataKey.isDeleted);
    if (!plan.merged.length || plan.merged.length !== ids.length) {
        plan.errors.push(!ids.length
            ? 'Choose at least one other data key to merge into the one you keep.'
            : 'Some of the data keys to merge could not be found.');
        return plan;
    }

    for (const dataKey of [survivor, ...plan.merged]) {
        if (!isParent(dataKey)) {
            plan.errors.push(`"${getMergeKeyTitle(dataKey)}" has no options. Merging is for parent data keys; use Delete with a replacement for other keys.`);
        }
    }
    const survivorType = normalizeDataKeyType(survivor.dataType);
    for (const dataKey of plan.merged) {
        if (normalizeDataKeyType(dataKey.dataType) !== survivorType) {
            plan.errors.push(`"${getMergeKeyTitle(dataKey)}" uses a different data type from "${getMergeKeyTitle(survivor)}".`);
        }
    }
    if (plan.errors.length) return plan;

    const survivorOptions = (survivor.options || []).map(norm).filter(Boolean);
    const mergedKeys = new Set(plan.merged.map((dataKey) => norm(dataKey.uniqueKey)));
    const suggestions = suggestChildMergeActionsWithReasons({ dataKeys, survivor, merged: plan.merged });

    const rows = new Map<string, DataKeyMergeChildRow>();
    for (const parent of plan.merged) {
        for (const childKey of (parent.options || []).map(norm).filter(Boolean)) {
            const existing = rows.get(childKey);
            if (existing) {
                existing.parents.push(norm(parent.uniqueKey));
                continue;
            }
            const child = byUniqueKey.get(childKey);
            const explicit = childActions[childKey];
            const suggestion = suggestions[childKey] || { action: { action: 'add' }, reason: null };
            rows.set(childKey, {
                uniqueKey: childKey,
                name: norm(child?.name),
                label: norm(child?.label),
                dataType: norm(child?.dataType),
                parents: [norm(parent.uniqueKey)],
                action: explicit || suggestion.action,
                suggested: !explicit,
                suggestion: suggestion.action,
                suggestionReason: suggestion.reason,
            });
        }
    }
    plan.children = Array.from(rows.values());

    const added: string[] = [];
    for (const row of plan.children) {
        const title = row.name || row.label || row.uniqueKey;
        const { action } = row;

        if (mergedKeys.has(row.uniqueKey) || row.uniqueKey === norm(survivor.uniqueKey)) {
            plan.errors.push(`"${title}" is one of the parents being merged and cannot also be an option.`);
            continue;
        }

        switch (action.action) {
            case 'keep':
                if (!survivorOptions.includes(row.uniqueKey)) {
                    plan.errors.push(`"${getMergeKeyTitle(survivor)}" does not offer "${title}" — match, add or drop it instead.`);
                }
                break;
            case 'match': {
                const target = byUniqueKey.get(norm(action.to));
                if (!target || !survivorOptions.includes(norm(action.to))) {
                    plan.errors.push(`"${title}" must be matched to an option of "${getMergeKeyTitle(survivor)}".`);
                } else if (normalizeDataKeyType(target.dataType) !== normalizeDataKeyType(row.dataType)) {
                    plan.errors.push(`"${title}" cannot be matched to "${getMergeKeyTitle(target)}" because their data types differ.`);
                } else if (norm(action.to) !== row.uniqueKey) {
                    plan.childReplacements[row.uniqueKey] = norm(action.to);
                }
                break;
            }
            case 'add':
                if (!survivorOptions.includes(row.uniqueKey)) added.push(row.uniqueKey);
                break;
            case 'drop':
                plan.droppedChildren.push(row.uniqueKey);
                break;
        }
    }

    plan.addedOptions = added;
    plan.nextSurvivorOptions = [...survivorOptions, ...added];

    if (survivorOptionOrder?.length) {
        const order = survivorOptionOrder.map(norm).filter(Boolean);
        const expected = new Set(plan.nextSurvivorOptions);
        const isPermutation = order.length === expected.size && new Set(order).size === order.length && order.every((key) => expected.has(key));
        if (isPermutation) {
            plan.nextSurvivorOptions = order;
        } else {
            // The option set changed since the order was chosen: keep the
            // chosen order for what is still there, then append the rest.
            const kept = order.filter((key) => expected.has(key));
            plan.nextSurvivorOptions = [...new Set([...kept, ...plan.nextSurvivorOptions])];
        }
    }

    const label = norm(survivorLabel);
    if (survivorLabel !== undefined && survivorLabel !== null) {
        if (!label) plan.errors.push('The kept data key needs a label.');
        else if (label !== norm(survivor.label)) plan.survivorLabel = label;
    }

    if (added.length) {
        const optionsError = validateDataKeyOptionsAddition({
            dataKeys: dataKeys as Parameters<typeof validateDataKeyOptionsAddition>[0]['dataKeys'],
            parentUniqueKey: norm(survivor.uniqueKey),
            previousOptions: survivorOptions,
            nextOptions: plan.nextSurvivorOptions,
        });
        if (optionsError) plan.errors.push(optionsError);
    }

    return plan;
}

export type PossibleDuplicateReason = 'same_name' | 'shared_options';

export type PossibleDuplicateGroup<T extends MergeDataKey> = {
    keys: T[];
    reason: PossibleDuplicateReason;
    /** Share of options the keys have in common (0..1), by option name. */
    overlap: number;
};

/**
 * Parents that are probably the same key but not exact duplicates:
 * - same name and type, different label;
 * - same type and at least `minOverlap` of their options in common (by option
 *   name), whatever their names.
 * Exact duplicate groups are not repeated here.
 */
export function findPossibleDuplicateGroups<T extends MergeDataKey>(
    dataKeys: T[],
    { minOverlap = 0.7 }: { minOverlap?: number } = {},
): PossibleDuplicateGroup<T>[] {
    const byUniqueKey = new Map(dataKeys.map((dataKey) => [norm(dataKey.uniqueKey), dataKey]));
    const parents = dataKeys.filter((dataKey) => !dataKey.isDeleted && isParent(dataKey) && norm(dataKey.uuid));
    const exactKeys = new Set(findDuplicateParentGroups(parents).map(getDuplicateGroupKey));

    const optionNames = new Map(parents.map((parent) => [parent.uuid, new Set((parent.options || [])
        .map((option) => lower(byUniqueKey.get(norm(option))?.name) || norm(option))
        .filter(Boolean))]));
    const overlapOf = (a: T, b: T) => {
        const left = optionNames.get(a.uuid)!;
        const right = optionNames.get(b.uuid)!;
        if (!left.size || !right.size) return 0;
        let shared = 0;
        left.forEach((name) => { if (right.has(name)) shared++; });
        return shared / Math.max(left.size, right.size);
    };

    // Union-find over "probably the same" pairs.
    const parentOf = new Map(parents.map((parent) => [parent.uuid, parent.uuid]));
    const find = (id: string): string => {
        const next = parentOf.get(id)!;
        if (next === id) return id;
        const root = find(next);
        parentOf.set(id, root);
        return root;
    };
    const union = (a: string, b: string) => parentOf.set(find(a), find(b));

    const sameNamePairs = new Set<string>();
    for (let i = 0; i < parents.length; i++) {
        for (let j = i + 1; j < parents.length; j++) {
            const a = parents[i];
            const b = parents[j];
            if (normalizeDataKeyType(a.dataType) !== normalizeDataKeyType(b.dataType)) continue;
            const sameName = !!lower(a.name) && lower(a.name) === lower(b.name);
            if (sameName || overlapOf(a, b) >= minOverlap) {
                union(a.uuid, b.uuid);
                if (sameName) sameNamePairs.add([a.uuid, b.uuid].sort().join('|'));
            }
        }
    }

    const groups = new Map<string, T[]>();
    parents.forEach((parent) => {
        const root = find(parent.uuid);
        groups.set(root, [...(groups.get(root) || []), parent]);
    });

    return Array.from(groups.values())
        .filter((keys) => keys.length > 1 && !exactKeys.has(getDuplicateGroupKey(keys)))
        .map((keys) => {
            let minimum = 1;
            for (let i = 0; i < keys.length; i++) {
                for (let j = i + 1; j < keys.length; j++) minimum = Math.min(minimum, overlapOf(keys[i], keys[j]));
            }
            const allSameName = keys.every((key) => lower(key.name) === lower(keys[0].name));
            return {
                keys,
                reason: (allSameName ? 'same_name' : 'shared_options') as PossibleDuplicateReason,
                overlap: Math.round(minimum * 100) / 100,
            };
        })
        .sort((a, b) => getMergeKeyTitle(a.keys[0]).localeCompare(getMergeKeyTitle(b.keys[0])));
}
