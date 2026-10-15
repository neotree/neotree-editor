import { renameConditionReferences } from './conditional-expression/rename-references';

type AnyRecord = Record<string, any>;

const norm = (value: unknown) => `${value ?? ''}`.trim();
const lower = (value: unknown) => norm(value).toLowerCase();

export type MergeParentRef = {
    uniqueKey: string;
    name: string;
    /** Child uniqueKeys of this parent. */
    options: string[];
};

export type MergeChildRef = {
    uniqueKey: string;
    name: string;
    label: string;
};

/** Where an option item lives inside a screen. `fieldIndex === null` means the screen's own items. */
export type OptionItemLocation = {
    screenId: string;
    fieldIndex: number | null;
    fieldId: string | null;
    itemIndex: number;
    itemId: string | null;
};

export type LegacyOptionItem = OptionItemLocation & {
    scriptId: string;
    scriptTitle: string;
    /** "Screen > Field" */
    location: string;
    href: string;
    value: string;
    label: string;
    parentUniqueKey: string;
    /** A child of that parent whose name (then label) equals the item's value (label). */
    suggestedUniqueKey: string | null;
};

export type LegacyItemLink = OptionItemLocation & {
    /** The child of the owning parent the item is linked to. */
    uniqueKey: string;
};

/**
 * Option items under the merged parents that have no data key link (no keyId).
 * The merge cannot recognise them, so they are listed for an explicit,
 * user-confirmed link — names are never used to bind a key automatically.
 */
export function findLegacyOptionItems({
    screens,
    parents,
    children,
    scriptIds,
}: {
    screens: AnyRecord[];
    parents: MergeParentRef[];
    children: MergeChildRef[];
    /** Only these scripts (all when omitted). */
    scriptIds?: string[];
}): LegacyOptionItem[] {
    const parentsByKey = new Map(parents.map((parent) => [parent.uniqueKey, parent]));
    const childByKey = new Map(children.map((child) => [child.uniqueKey, child]));
    const allowed = scriptIds ? new Set(scriptIds) : null;
    const out: LegacyOptionItem[] = [];

    const suggest = (parent: MergeParentRef, value: string, label: string) => {
        const options = parent.options.map((key) => childByKey.get(key)).filter((child): child is MergeChildRef => !!child);
        return (lower(value) && options.find((child) => lower(child.name) === lower(value)))
            || (lower(label) && options.find((child) => lower(child.label) === lower(label)))
            || null;
    };

    for (const screen of screens) {
        if (allowed && !allowed.has(norm(screen.scriptId))) continue;
        const screenTitle = norm(screen.title) || norm(screen.label) || norm(screen.refId) || 'Screen';
        const screenHref = `/script/${screen.scriptId}/screen/${screen.screenId}`;

        const collect = (items: AnyRecord[], parent: MergeParentRef | undefined, base: Omit<OptionItemLocation, 'itemIndex' | 'itemId'>, location: string, href: string, valueKey: 'value' | 'id') => {
            if (!parent) return;
            items.forEach((item, itemIndex) => {
                if (norm(item?.keyId)) return;
                const value = norm(item?.[valueKey]) || norm(item?.key);
                const label = norm(item?.label);
                out.push({
                    ...base,
                    itemIndex,
                    itemId: norm(item?.itemId) || null,
                    scriptId: norm(screen.scriptId),
                    scriptTitle: norm(screen.scriptTitle) || norm(screen.scriptId),
                    location,
                    href,
                    value,
                    label,
                    parentUniqueKey: parent.uniqueKey,
                    suggestedUniqueKey: suggest(parent, value, label)?.uniqueKey || null,
                });
            });
        };

        collect(
            screen.items || [],
            parentsByKey.get(norm(screen.keyId)),
            { screenId: norm(screen.screenId), fieldIndex: null, fieldId: null },
            screenTitle,
            screenHref,
            'id',
        );

        (screen.fields || []).forEach((field: AnyRecord, fieldIndex: number) => {
            collect(
                field.items || [],
                parentsByKey.get(norm(field.keyId)),
                { screenId: norm(screen.screenId), fieldIndex, fieldId: norm(field.fieldId) || null },
                `${screenTitle} > ${norm(field.label) || norm(field.key) || `field ${fieldIndex + 1}`}`,
                `${screenHref}?field=${field.fieldId || fieldIndex}`,
                'value',
            );
        });
    }

    return out;
}

/**
 * Applies confirmed legacy links to one screen: sets `keyId` on the addressed
 * items, only when the item is still unlinked and the key is an option of the
 * item's owning parent. Returns the changed screen patch, or null.
 */
export function applyLegacyItemLinks(
    screen: AnyRecord,
    links: LegacyItemLink[],
    parentOptions: Map<string, Set<string>>,
): { screenId: string; scriptId: string; items?: AnyRecord[]; fields?: AnyRecord[] } | null {
    const mine = links.filter((link) => link.screenId === norm(screen.screenId));
    if (!mine.length) return null;

    const relink = (items: AnyRecord[], ownerKeyId: unknown, fieldIndex: number | null) => {
        let changed = false;
        const allowed = parentOptions.get(norm(ownerKeyId));
        const next = items.map((item, itemIndex) => {
            const link = mine.find((candidate) => candidate.fieldIndex === fieldIndex && (
                (candidate.itemId && candidate.itemId === norm(item?.itemId)) ||
                (!candidate.itemId && candidate.itemIndex === itemIndex)
            ));
            if (!link || norm(item?.keyId) || !allowed?.has(link.uniqueKey)) return item;
            changed = true;
            return { ...item, keyId: link.uniqueKey };
        });
        return changed ? next : null;
    };

    const patch: { screenId: string; scriptId: string; items?: AnyRecord[]; fields?: AnyRecord[] } = {
        screenId: norm(screen.screenId),
        scriptId: norm(screen.scriptId),
    };

    const items = relink(screen.items || [], screen.keyId, null);
    if (items) patch.items = items;

    let fieldsChanged = false;
    const fields = (screen.fields || []).map((field: AnyRecord, fieldIndex: number) => {
        const fieldItems = relink(field.items || [], field.keyId, fieldIndex);
        if (!fieldItems) return field;
        fieldsChanged = true;
        return { ...field, items: fieldItems };
    });
    if (fieldsChanged) patch.fields = fields;

    return patch.items || patch.fields ? patch : null;
}

export type OptionUsage = {
    /** Scripts where the option appears under one of the merged parents. */
    scripts: number;
    /** Conditions in those scripts that refer to the option by name. */
    conditions: number;
};

const conditionSources = (screens: AnyRecord[], diagnoses: AnyRecord[], problems: AnyRecord[]) => [
    ...screens.flatMap((screen) => [
        screen.condition,
        screen.skipToCondition,
        ...(screen.items || []).map((item: AnyRecord) => item.condition),
        ...(screen.fields || []).flatMap((field: AnyRecord) => [
            field.condition,
            field.calculation,
            ...(field.items || []).map((item: AnyRecord) => item.condition),
        ]),
    ]),
    ...[...diagnoses, ...problems].flatMap((entity) => [
        entity.expression,
        ...(entity.symptoms || []).map((symptom: AnyRecord) => symptom.expression),
    ]),
].map(norm).filter(Boolean);

/**
 * For each child of the merged parents: how many scripts show it under a
 * merged parent, and how many conditions in those scripts refer to it by name
 * (`$Parent = 'Child'`, `$Parent includes ('Child')`, or `$Child` for checklist
 * items). Helps decide which option choices matter.
 */
export function analyzeMergeOptionUsage({
    screens,
    diagnoses = [],
    problems = [],
    parents,
    children,
    scriptIds,
}: {
    screens: AnyRecord[];
    diagnoses?: AnyRecord[];
    problems?: AnyRecord[];
    parents: MergeParentRef[];
    children: MergeChildRef[];
    scriptIds?: string[];
}): Record<string, OptionUsage> {
    const parentKeys = new Set(parents.map((parent) => parent.uniqueKey));
    const allowed = scriptIds ? new Set(scriptIds) : null;
    const inScope = (entity: AnyRecord) => !allowed || allowed.has(norm(entity.scriptId));

    const scriptsByChild = new Map<string, Set<string>>();
    const parentVarsByScript = new Map<string, Set<string>>();

    for (const screen of screens.filter(inScope)) {
        const scriptId = norm(screen.scriptId);
        const record = (owner: AnyRecord, items: AnyRecord[]) => {
            if (!parentKeys.has(norm(owner.keyId))) return;
            const vars = parentVarsByScript.get(scriptId) || new Set<string>();
            if (norm(owner.key)) vars.add(norm(owner.key));
            parentVarsByScript.set(scriptId, vars);
            for (const item of items) {
                const keyId = norm(item?.keyId);
                if (!keyId) continue;
                const set = scriptsByChild.get(keyId) || new Set<string>();
                set.add(scriptId);
                scriptsByChild.set(keyId, set);
            }
        };
        record(screen, screen.items || []);
        (screen.fields || []).forEach((field: AnyRecord) => record(field, field.items || []));
    }

    const usage: Record<string, OptionUsage> = {};
    for (const child of children) {
        const scripts = scriptsByChild.get(child.uniqueKey) || new Set<string>();
        let conditions = 0;
        if (scripts.size && norm(child.name)) {
            for (const scriptId of scripts) {
                const parentVars = Array.from(parentVarsByScript.get(scriptId) || []);
                const sources = conditionSources(
                    screens.filter((entity) => norm(entity.scriptId) === scriptId),
                    diagnoses.filter((entity) => norm(entity.scriptId) === scriptId),
                    problems.filter((entity) => norm(entity.scriptId) === scriptId),
                );
                // A rename to a sentinel only changes text that refers to the child.
                const probe = { from: child.name, to: '__merge_probe__' };
                conditions += sources.filter((source) => renameConditionReferences(source, {
                    vars: [probe],
                    values: parentVars.length ? [{ ...probe, parents: parentVars }] : [],
                }).changed).length;
            }
        }
        usage[child.uniqueKey] = { scripts: scripts.size, conditions };
    }
    return usage;
}

/**
 * Where an option of the kept key shows after the merge:
 * - all: every script that uses the kept key;
 * - selected: exactly these scripts.
 * An option without a placement stays where it is.
 */
export type OptionPlacement =
    | { scope: 'all' }
    | { scope: 'selected'; scriptIds: string[] };

// Collections that list a parent's options as items (same types the refs sync owns).
const OPTION_SCREEN_TYPES = ['checklist', 'multi_select', 'single_select'];
const OPTION_FIELD_TYPES = ['dropdown', 'multi_select'];

export function ownsOptionCollection(kind: 'screen' | 'field', type: unknown) {
    return (kind === 'screen' ? OPTION_SCREEN_TYPES : OPTION_FIELD_TYPES).includes(lower(type));
}

export type OptionPresence = {
    /** Scripts that list the parent's options somewhere (the scripts a placement applies to). */
    scripts: { scriptId: string; scriptTitle: string }[];
    /** option uniqueKey -> scripts that show it */
    byOption: Record<string, string[]>;
};

/** Which scripts show each option of `parentUniqueKey`, read from the screens' option items. */
export function findOptionPresence({
    screens,
    parentUniqueKey,
    options,
}: {
    screens: AnyRecord[];
    parentUniqueKey: string;
    options: string[];
}): OptionPresence {
    const scripts = new Map<string, string>();
    const byOption = new Map<string, Set<string>>(options.map((option) => [option, new Set<string>()]));

    for (const screen of screens) {
        const scriptId = norm(screen.scriptId);
        const collections: AnyRecord[][] = [];
        if (norm(screen.keyId) === parentUniqueKey && ownsOptionCollection('screen', screen.type)) collections.push(screen.items || []);
        for (const field of (screen.fields || []) as AnyRecord[]) {
            if (norm(field.keyId) === parentUniqueKey && ownsOptionCollection('field', field.type)) collections.push(field.items || []);
        }
        if (!collections.length || !scriptId) continue;

        scripts.set(scriptId, norm(screen.scriptTitle) || scriptId);
        collections.flat().forEach((item) => byOption.get(norm(item?.keyId))?.add(scriptId));
    }

    return {
        scripts: Array.from(scripts.entries())
            .map(([scriptId, scriptTitle]) => ({ scriptId, scriptTitle }))
            .sort((a, b) => a.scriptTitle.localeCompare(b.scriptTitle)),
        byOption: Object.fromEntries(Array.from(byOption.entries()).map(([option, set]) => [option, Array.from(set)])),
    };
}

/** True when the option should show in `scriptId` under `placement`. */
export function isPlacedIn(placement: OptionPlacement, scriptId: string) {
    return placement.scope === 'all' || placement.scriptIds.includes(scriptId);
}

/**
 * Adds or removes the parent's option items in one screen so each placed
 * option shows exactly where its placement says. Existing items keep their
 * order and settings; an added item goes next to its neighbours in the pool
 * order. Returns the screen patch, or null when nothing changes.
 */
export function applyOptionPlacements(
    screen: AnyRecord,
    {
        parentUniqueKey,
        poolOrder,
        placements,
        buildScreenItem,
        buildFieldItem,
    }: {
        parentUniqueKey: string;
        poolOrder: string[];
        placements: Record<string, OptionPlacement>;
        buildScreenItem: (uniqueKey: string, screen: AnyRecord) => AnyRecord | null;
        buildFieldItem: (uniqueKey: string) => AnyRecord | null;
    },
): { screenId: string; scriptId: string; items?: AnyRecord[]; fields?: AnyRecord[] } | null {
    const scriptId = norm(screen.scriptId);
    const poolIndex = new Map(poolOrder.map((uniqueKey, index) => [uniqueKey, index]));
    const entries = Object.entries(placements).filter(([uniqueKey]) => poolIndex.has(uniqueKey));
    if (!entries.length) return null;

    const place = (items: AnyRecord[], build: (uniqueKey: string) => AnyRecord | null): AnyRecord[] | null => {
        let next = [...items];
        let changed = false;
        for (const [uniqueKey, placement] of entries) {
            const wanted = isPlacedIn(placement, scriptId);
            const present = next.some((item) => norm(item?.keyId) === uniqueKey);
            if (!wanted && present) {
                next = next.filter((item) => norm(item?.keyId) !== uniqueKey);
                changed = true;
            } else if (wanted && !present) {
                const item = build(uniqueKey);
                if (!item) continue;
                const index = poolIndex.get(uniqueKey)!;
                const before = next.findIndex((other) => (poolIndex.get(norm(other?.keyId)) ?? -1) > index);
                next.splice(before < 0 ? next.length : before, 0, item);
                changed = true;
            }
        }
        return changed ? next : null;
    };

    const patch: { screenId: string; scriptId: string; items?: AnyRecord[]; fields?: AnyRecord[] } = {
        screenId: norm(screen.screenId),
        scriptId,
    };

    if (norm(screen.keyId) === parentUniqueKey && ownsOptionCollection('screen', screen.type)) {
        const items = place(screen.items || [], (uniqueKey) => buildScreenItem(uniqueKey, screen));
        if (items) {
            // Screen items carry their position.
            patch.items = items.map((item, index) => ({ ...item, position: index + 1 }));
        }
    }

    let fieldsChanged = false;
    const fields = (screen.fields || []).map((field: AnyRecord) => {
        if (norm(field.keyId) !== parentUniqueKey || !ownsOptionCollection('field', field.type)) return field;
        const items = place(field.items || [], buildFieldItem);
        if (!items) return field;
        fieldsChanged = true;
        return { ...field, items };
    });
    if (fieldsChanged) patch.fields = fields;

    return patch.items || patch.fields ? patch : null;
}
