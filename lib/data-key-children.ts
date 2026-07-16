import { normalizeDataKeyType } from './data-key-types';

export type DataKeyParentRef = {
    uuid: string;
    uniqueKey: string;
    name: string;
    label: string;
    dataType: string;
};

type DataKeyLike = {
    uuid?: string | null;
    uniqueKey?: string | null;
    name?: string | null;
    label?: string | null;
    dataType?: string | null;
    options?: string[] | null;
};

function normalizeKey(value?: string | null) {
    return `${value || ''}`.trim();
}

export function getDataKeyParentTitle(parent: Pick<DataKeyParentRef, 'name' | 'label' | 'uniqueKey'>) {
    return parent.name || parent.label || parent.uniqueKey || 'Data key';
}

/**
 * Maps each child uniqueKey to the parent data keys whose `options` reference it.
 * A key with an entry here is a "child key" and must not be deleted from the
 * library while a parent still links it.
 */
export function buildDataKeyParentIndex(dataKeys: DataKeyLike[]) {
    const index = new Map<string, DataKeyParentRef[]>();

    for (const dataKey of dataKeys) {
        const parentUniqueKey = normalizeKey(dataKey.uniqueKey);
        const options = (dataKey.options || []).map(normalizeKey).filter(Boolean);
        if (!options.length) continue;

        const parent: DataKeyParentRef = {
            uuid: normalizeKey(dataKey.uuid),
            uniqueKey: parentUniqueKey,
            name: `${dataKey.name || ''}`,
            label: `${dataKey.label || ''}`,
            dataType: `${dataKey.dataType || ''}`,
        };

        for (const childUniqueKey of options) {
            if (childUniqueKey === parentUniqueKey) continue;
            const parents = index.get(childUniqueKey) || [];
            if (!parents.some((item) => item.uniqueKey === parent.uniqueKey)) {
                parents.push(parent);
            }
            index.set(childUniqueKey, parents);
        }
    }

    return index;
}

/**
 * True when linking `childUniqueKey` under `parentUniqueKey` would create a
 * cycle in the options graph (including self-links). Cycles make every
 * recursive walk over options (exports, extraction, sync) loop forever.
 */
export function wouldCreateDataKeyCycle({
    dataKeys,
    parentUniqueKey,
    childUniqueKey,
}: {
    dataKeys: DataKeyLike[];
    parentUniqueKey: string;
    childUniqueKey: string;
}) {
    const parent = normalizeKey(parentUniqueKey);
    const child = normalizeKey(childUniqueKey);
    if (!parent || !child) return false;
    if (parent === child) return true;

    const optionsByUniqueKey = new Map(dataKeys
        .map((dataKey) => [normalizeKey(dataKey.uniqueKey), (dataKey.options || []).map(normalizeKey).filter(Boolean)] as const)
        .filter(([uniqueKey]) => !!uniqueKey));

    // Does `parent` appear anywhere in `child`'s descendant options?
    const visited = new Set<string>();
    const stack = [child];
    while (stack.length) {
        const current = stack.pop()!;
        if (current === parent) return true;
        if (visited.has(current)) continue;
        visited.add(current);
        stack.push(...(optionsByUniqueKey.get(current) || []));
    }

    return false;
}

/**
 * Validates newly-added options of a data key. Pre-existing options are never
 * re-validated (legacy pools may violate these rules); only additions must:
 * exist in the library, not self-link or create a cycle, and keep the option
 * pool single-typed (matching the existing children's shared type, or agreeing
 * with each other when the pool starts empty).
 */
export function validateDataKeyOptionsAddition({
    dataKeys,
    parentUniqueKey,
    previousOptions,
    nextOptions,
}: {
    dataKeys: DataKeyLike[];
    parentUniqueKey: string;
    previousOptions: string[];
    nextOptions: string[];
}): string | null {
    const previous = new Set(previousOptions.map(normalizeKey).filter(Boolean));
    const added = Array.from(new Set(nextOptions.map(normalizeKey).filter(Boolean)))
        .filter((option) => !previous.has(option));
    if (!added.length) return null;

    const byUniqueKey = new Map(dataKeys.map((dataKey) => [normalizeKey(dataKey.uniqueKey), dataKey]));
    const parent = normalizeKey(parentUniqueKey);

    const keptTypes = new Set(nextOptions
        .map(normalizeKey)
        .filter((option) => option && previous.has(option))
        .map((option) => normalizeDataKeyType(byUniqueKey.get(option)?.dataType))
        .filter(Boolean));
    const requiredType = keptTypes.size === 1 ? Array.from(keptTypes)[0] : null;

    const addedTypes = new Set<string>();

    for (const option of added) {
        const child = byUniqueKey.get(option);
        if (!child) {
            return `Option "${option}" does not exist in the data keys library.`;
        }

        const childTitle = child.name || child.label || option;

        if (parent && option === parent) {
            return `"${childTitle}" cannot be an option of itself.`;
        }
        if (parent && wouldCreateDataKeyCycle({ dataKeys, parentUniqueKey: parent, childUniqueKey: option })) {
            return `"${childTitle}" cannot be added because it would create a circular option reference.`;
        }

        const childType = normalizeDataKeyType(child.dataType);
        if (requiredType && childType !== requiredType) {
            return `"${childTitle}" cannot be added because its data type does not match the existing options.`;
        }
        if (childType) addedTypes.add(childType);
    }

    if (!requiredType && keptTypes.size === 0 && addedTypes.size > 1) {
        return 'All options of a data key must share the same data type.';
    }

    return null;
}

export type BlockedChildDeletion = {
    dataKeyId: string;
    uniqueKey: string;
    name: string;
    label: string;
    parents: DataKeyParentRef[];
};

/**
 * Returns the deletion targets that are still linked as children of parents
 * OUTSIDE the deletion batch. Deleting a parent together with its children in
 * one batch is allowed; deleting a child while a surviving parent links it is not.
 */
export function getBlockedChildDeletions({
    dataKeys,
    targets,
}: {
    dataKeys: DataKeyLike[];
    targets: DataKeyLike[];
}): BlockedChildDeletion[] {
    const targetIds = new Set(targets.map((target) => normalizeKey(target.uuid)).filter(Boolean));
    const parentIndex = buildDataKeyParentIndex(dataKeys);

    return targets
        .map((target) => {
            const uniqueKey = normalizeKey(target.uniqueKey);
            if (!uniqueKey) return null;

            const survivingParents = (parentIndex.get(uniqueKey) || [])
                .filter((parent) => !targetIds.has(parent.uuid));
            if (!survivingParents.length) return null;

            return {
                dataKeyId: normalizeKey(target.uuid),
                uniqueKey,
                name: `${target.name || ''}`,
                label: `${target.label || ''}`,
                parents: survivingParents,
            } satisfies BlockedChildDeletion;
        })
        .filter((item): item is BlockedChildDeletion => !!item);
}
