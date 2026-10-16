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
    /** New label for the kept key, when it is being changed. */
    survivorLabel: string | null;
    /**
     * Parents (other than the merged keys) that offer a merged key as an option:
     * they offer the kept key instead after the merge.
     */
    parentOptionRewrites: ParentOptionRewrite[];
};

export type ParentOptionRewrite = {
    parentId: string;
    parentUniqueKey: string;
    parentTitle: string;
    /** Merged keys this parent offers. */
    replaced: string[];
    /** The parent's options after the merge (merged keys -> kept key, no repeats). */
    nextOptions: string[];
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

/** Lowercase words of a label ("Hypertonia = 1" -> ["hypertonia", "1"]). */
const labelWords = (label?: string | null) => lower(label).split(/[^a-z0-9]+/).filter(Boolean);
const isNumberWord = (word: string) => /^\d+(\.\d+)?$/.test(word);

/**
 * A label's identity for duplicate matching: its words in any order, ignoring
 * case, spacing and punctuation — "1 = Poor" and "Poor = 1" are the same label.
 */
export function labelSignature(label?: string | null) {
    return Array.from(new Set(labelWords(label))).sort().join(' ');
}

/**
 * How alike two labels are (0..1): the share of the shorter label's words the
 * other label also has. Numbers are ignored — score options such as "0 = Alert"
 * and "0 = None" share a number, not a meaning.
 */
export function labelSimilarity(a?: string | null, b?: string | null) {
    if (labelSignature(a) === labelSignature(b)) return 1;
    const left = new Set(labelWords(a).filter((word) => !isNumberWord(word)));
    const right = new Set(labelWords(b).filter((word) => !isNumberWord(word)));
    if (!left.size || !right.size) return 0;
    let shared = 0;
    left.forEach((word) => { if (right.has(word)) shared++; });
    return shared / Math.min(left.size, right.size);
}

/** The name + type a key is matched on (its "key identity"). */
const nameTypeKey = (dataKey: MergeDataKey) => `${lower(dataKey.name)}::${normalizeDataKeyType(dataKey.dataType)}`;

const isCandidate = (dataKey: MergeDataKey) => !dataKey.isDeleted && !!norm(dataKey.uuid) && !!lower(dataKey.name);

/**
 * Keys that are the same key: identical name and data type — the deciding
 * variables — and the same label (same words, any case or order). Covers every
 * kind of key: parents, their options, and standalone keys. Each group has at
 * least two keys and is a candidate for a merge.
 */
export function findDuplicateKeyGroups<T extends MergeDataKey>(dataKeys: T[]): T[][] {
    const groups = new Map<string, T[]>();

    for (const dataKey of dataKeys) {
        if (!isCandidate(dataKey)) continue;
        const key = `${nameTypeKey(dataKey)}::${labelSignature(dataKey.label)}`;
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
        parentOptionRewrites: [],
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

    // Any kind of key can be merged — parents, options and standalone keys —
    // as long as the keys are the same type and not options of one another.
    const mergedKeySet = new Set(plan.merged.map((dataKey) => norm(dataKey.uniqueKey)));
    if ((survivor.options || []).some((option) => mergedKeySet.has(norm(option)))) {
        plan.errors.push(`A data key being merged is an option of "${getMergeKeyTitle(survivor)}" — a key cannot be merged into its own parent.`);
    }
    for (const dataKey of plan.merged) {
        if ((dataKey.options || []).map(norm).includes(norm(survivor.uniqueKey))) {
            plan.errors.push(`"${getMergeKeyTitle(survivor)}" is an option of "${getMergeKeyTitle(dataKey)}" — a key cannot be merged into one of its own options.`);
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

    // Parents that offer a merged key offer the kept key instead.
    const survivorKey = norm(survivor.uniqueKey);
    for (const parent of dataKeys) {
        if (parent.isDeleted || !isParent(parent)) continue;
        const parentKey = norm(parent.uniqueKey);
        if (parentKey === survivorKey || mergedKeySet.has(parentKey)) continue;
        const options = (parent.options || []).map(norm).filter(Boolean);
        const replaced = options.filter((option) => mergedKeySet.has(option));
        if (!replaced.length) continue;
        const nextOptions = Array.from(new Set(options.map((option) => mergedKeySet.has(option) ? survivorKey : option)));
        if (!options.includes(survivorKey)) {
            const optionsError = validateDataKeyOptionsAddition({
                dataKeys: dataKeys as Parameters<typeof validateDataKeyOptionsAddition>[0]['dataKeys'],
                parentUniqueKey: parentKey,
                previousOptions: options,
                nextOptions,
            });
            if (optionsError) plan.errors.push(`"${getMergeKeyTitle(parent)}": ${optionsError}`);
        }
        plan.parentOptionRewrites.push({
            parentId: norm(parent.uuid),
            parentUniqueKey: parentKey,
            parentTitle: getMergeKeyTitle(parent),
            replaced,
            nextOptions,
        });
    }

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

export type PossibleDuplicateReason = 'similar_label';

export type PossibleDuplicateGroup<T extends MergeDataKey> = {
    keys: T[];
    reason: PossibleDuplicateReason;
    /** The lowest label similarity between two keys of the group (0..1). */
    overlap: number;
};

/**
 * Keys that are probably the same key but need a review before merging: same
 * name and type — the deciding variables — with labels that say the same thing
 * in different words ("Traditional Birth Attendant (TBA)" ~ "Traditional birth
 * attendant", "Absent = 2" ~ "2 = Absent or with bites").
 *
 * Every pair in a group must be similar, so groups never chain unrelated keys
 * together. Same name and type with unrelated labels ("0 = Alert" vs "0 = None")
 * are different keys and are not suggested, and neither are different questions
 * that merely offer the same answers. Exact duplicate groups are not repeated.
 */
export function findPossibleDuplicateGroups<T extends MergeDataKey>(
    dataKeys: T[],
    { minLabelSimilarity = 0.75 }: { minLabelSimilarity?: number } = {},
): PossibleDuplicateGroup<T>[] {
    const candidates = dataKeys.filter(isCandidate);
    const exactKeys = new Set(findDuplicateKeyGroups(candidates).map(getDuplicateGroupKey));

    const buckets = new Map<string, T[]>();
    candidates.forEach((dataKey) => buckets.set(nameTypeKey(dataKey), [...(buckets.get(nameTypeKey(dataKey)) || []), dataKey]));

    const groups: PossibleDuplicateGroup<T>[] = [];
    buckets.forEach((keys) => {
        if (keys.length < 2) return;
        // Complete-link clustering: a key joins a cluster only when it is
        // similar to every key already in it.
        const clusters: T[][] = [];
        [...keys]
            .sort((a, b) => labelSignature(a.label).localeCompare(labelSignature(b.label)))
            .forEach((key) => {
                const home = clusters.find((cluster) => cluster.every((member) => labelSimilarity(member.label, key.label) >= minLabelSimilarity));
                if (home) home.push(key);
                else clusters.push([key]);
            });

        clusters
            .filter((cluster) => cluster.length > 1 && !exactKeys.has(getDuplicateGroupKey(cluster)))
            .forEach((cluster) => {
                let minimum = 1;
                for (let i = 0; i < cluster.length; i++) {
                    for (let j = i + 1; j < cluster.length; j++) minimum = Math.min(minimum, labelSimilarity(cluster[i].label, cluster[j].label));
                }
                groups.push({ keys: cluster, reason: 'similar_label', overlap: Math.round(minimum * 100) / 100 });
            });
    });

    return groups.sort((a, b) => getMergeKeyTitle(a.keys[0]).localeCompare(getMergeKeyTitle(b.keys[0])));
}
