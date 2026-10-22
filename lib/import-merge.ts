/**
 * Three-way merge used when a script is imported from another editor (e.g. DEV) into an existing
 * script on this editor (e.g. LIVE).
 *
 *   source = the incoming copy (what DEV has published now)
 *   target = this editor's current copy (published state, or the importer's own drafts)
 *   base   = the source copy as it was at the last import into this target (null on the first import)
 *
 * Rules, applied to every list (screens, fields, options, symptoms, drugs) and every property:
 *  - a change made only on the source is applied;
 *  - a change made only on the target is kept;
 *  - when both changed, the source wins and a conflict is reported;
 *  - something present only on the target is kept, unless the base shows it came from the source and
 *    the source has since removed it (and the target did not change it);
 *  - without a base (first import) nothing that exists only on the target is removed from a list.
 *
 * Everything here is pure (no database access) so it can be unit-tested.
 */

import { fileRefIdentity } from './file-ref';

const VOLATILE_KEYS = new Set([
    'id',
    'createdAt',
    'updatedAt',
    'publishDate',
    'deletedAt',
    'isDraft',
    'isDeleted',
    'version',
    'draftCreatedByUserId',
    'scriptTitle',
    'hospitalName',
    'position',
]);

export function stableStringify(value: unknown): string {
    if (value === undefined) return 'undefined';
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(v => stableStringify(v)).join(',')}]`;
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).filter(k => obj[k] !== undefined).sort();
    return `{${keys.map(k => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}

export function sameValue(a: unknown, b: unknown) {
    return stableStringify(normalizeEmpty(a)) === stableStringify(normalizeEmpty(b));
}

// File references point at the same file through different URLs on each editor; compare by file id.
const FILE_KEYS = new Set(['image1', 'image2', 'image3', 'contentTextImage']);

function normalizeFileRef(value: any) {
    if (!value || typeof value !== 'object') return value;
    // the copy on the other editor has its own id and URL: the same file is the same name and size
    return { file: fileRefIdentity(value) };
}

/** sameValue for one property, treating file references as equal when they name the same file. */
function samePropValue(key: string, a: unknown, b: unknown) {
    if (FILE_KEYS.has(key)) return sameValue(normalizeFileRef(a), normalizeFileRef(b));
    return sameValue(a, b);
}

function normalizeEmpty(value: unknown) {
    // Treat null, undefined and '' as the same "empty" value so that cosmetic differences between
    // editors do not register as changes.
    if (value === null || value === undefined || value === '') return null;
    return value;
}

export function withoutVolatile<T extends Record<string, any>>(entity: T, extraIgnored: string[] = []): Partial<T> {
    const ignored = new Set([...Array.from(VOLATILE_KEYS), ...extraIgnored]);
    const out: Record<string, any> = {};
    for (const key of Object.keys(entity || {})) {
        if (!ignored.has(key)) out[key] = (entity as any)[key];
    }
    return out as Partial<T>;
}

export type MergeEventKind =
    | 'added_from_source'
    | 'removed_by_source'
    | 'kept_target_only'
    | 'kept_target_removal'
    | 'conflict_source_wins'
    | 'conflict_kept_target'
    /** First import (no shared history): a value here differs from the source and takes the source's. */
    | 'replaced_without_history';

export type MergeEvent = {
    kind: MergeEventKind;
    path: string;
    identity: string;
    label?: string;
    /** Properties concerned (replaced_without_history). */
    props?: string[];
};

export type MergeReport = {
    events: MergeEvent[];
};

export function createMergeReport(): MergeReport {
    return { events: [] };
}

export type ListSpec = {
    /** Ways to tell that two items are "the same", tried in order (first unused match wins). */
    identities: ((item: any) => string | null | undefined)[];
    /** Property that holds the item's own id; the target's id is kept for matched items. */
    idField?: string;
    /** Nested lists inside each item, merged with their own spec. */
    children?: Record<string, ListSpec>;
    /** Human-readable label for reports. */
    label?: (item: any) => string;
    /** Properties ignored when deciding whether an item changed. */
    ignore?: string[];
};

type Pairing = Map<number, number>;

function pairLists(left: any[], right: any[], identities: ListSpec['identities']): Pairing {
    const pairs: Pairing = new Map();
    const usedRight = new Set<number>();
    for (const identity of identities) {
        const buckets = new Map<string, number[]>();
        right.forEach((item, index) => {
            if (usedRight.has(index)) return;
            const key = identity(item);
            if (key === null || key === undefined || key === '') return;
            const list = buckets.get(key) || [];
            list.push(index);
            buckets.set(key, list);
        });
        left.forEach((item, index) => {
            if (pairs.has(index)) return;
            const key = identity(item);
            if (key === null || key === undefined || key === '') return;
            const candidates = buckets.get(key);
            const next = candidates?.find(i => !usedRight.has(i));
            if (next === undefined) return;
            pairs.set(index, next);
            usedRight.add(next);
        });
    }
    return pairs;
}

function invert(pairs: Pairing): Pairing {
    const out: Pairing = new Map();
    pairs.forEach((r, l) => out.set(r, l));
    return out;
}

function itemLabel(spec: ListSpec, item: any) {
    if (spec.label) return spec.label(item);
    return `${item?.label ?? item?.title ?? item?.name ?? item?.value ?? item?.key ?? item?.id ?? ''}`;
}

function itemIdentity(spec: ListSpec, item: any) {
    for (const identity of spec.identities) {
        const key = identity(item);
        if (key) return key;
    }
    return '';
}

// Ids that differ between editors for the same content; they never count as a content change.
const ID_KEYS = new Set([
    'itemId',
    'fieldId',
    'screenId',
    'diagnosisId',
    'problemId',
    'scriptId',
    'oldScriptId',
    'oldScreenId',
    'oldDiagnosisId',
    'scriptDraftId',
    'screenDraftId',
    'diagnosisDraftId',
    'problemDraftId',
]);

function normalizeForCompare(value: any, ignore: Set<string>): any {
    if (Array.isArray(value)) return value.map(v => normalizeForCompare(v, ignore));
    if (value && typeof value === 'object') {
        const out: Record<string, any> = {};
        for (const key of Object.keys(value)) {
            if (VOLATILE_KEYS.has(key) || ID_KEYS.has(key) || ignore.has(key)) continue;
            out[key] = FILE_KEYS.has(key) ? normalizeFileRef(value[key]) : normalizeForCompare(value[key], ignore);
        }
        return out;
    }
    return value;
}

function changed(a: any, b: any, spec?: ListSpec) {
    const ignore = new Set(spec?.ignore || []);
    return !sameValue(normalizeForCompare(a || {}, ignore), normalizeForCompare(b || {}, ignore));
}

/** True when the two entities differ in content (ids, timestamps and versions are ignored). */
export function contentChanged(a: any, b: any) {
    return changed(a, b);
}

/**
 * Merge the properties of one entity (screen, field, option...). Nested lists are merged with mergeList.
 * `idMap` collects source id -> result id for matched items so references (forbidWith) can be remapped.
 */
export function mergeEntity(
    source: any,
    target: any,
    base: any | null | undefined,
    spec: ListSpec,
    path: string,
    report: MergeReport,
    idMap?: Map<string, string>,
): any {
    const result: Record<string, any> = {};
    const keys = new Set([...Object.keys(source || {}), ...Object.keys(target || {})]);
    const children = spec.children || {};
    let conflict = false;
    // Without a base it can't be told which side changed a value; the source's is used, and listed.
    const replacedWithoutHistory: string[] = [];

    keys.forEach((key) => {
        if (children[key]) {
            result[key] = mergeList(
                Array.isArray(source?.[key]) ? source[key] : [],
                Array.isArray(target?.[key]) ? target[key] : [],
                base ? (Array.isArray(base?.[key]) ? base[key] : []) : null,
                children[key],
                `${path} > ${key}`,
                report,
            );
            return;
        }
        if (spec.idField && key === spec.idField) {
            result[key] = target?.[key] ?? source?.[key];
            return;
        }
        const s = source?.[key];
        const t = target?.[key];
        if (samePropValue(key, s, t)) {
            // Same content: keep the target's copy of file references (its own URLs), the source's otherwise.
            result[key] = FILE_KEYS.has(key) ? (t === undefined ? s : t) : (s === undefined ? t : s);
            return;
        }
        if (base && samePropValue(key, s, base?.[key]) && !samePropValue(key, t, base?.[key])) {
            // only the target changed this property
            result[key] = t;
            return;
        }
        if (base && !samePropValue(key, t, base?.[key]) && !samePropValue(key, s, base?.[key]) && !VOLATILE_KEYS.has(key)) {
            conflict = true;
        }
        if (!base && target && s !== undefined && t !== undefined && !VOLATILE_KEYS.has(key) && !ID_KEYS.has(key)) {
            replacedWithoutHistory.push(key);
        }
        result[key] = s === undefined ? t : s;
    });

    if (conflict) {
        report.events.push({ kind: 'conflict_source_wins', path, identity: itemIdentity(spec, source), label: itemLabel(spec, source) });
    }
    if (replacedWithoutHistory.length) {
        report.events.push({ kind: 'replaced_without_history', path, identity: itemIdentity(spec, source), label: itemLabel(spec, source), props: replacedWithoutHistory });
    }

    if (idMap && spec.idField && source?.[spec.idField] && result[spec.idField]) {
        idMap.set(`${source[spec.idField]}`, `${result[spec.idField]}`);
    }

    return result;
}

/** Three-way merge of a list. Source order wins; target-only items stay next to their target neighbours. */
export function mergeList(
    source: any[],
    target: any[],
    base: any[] | null,
    spec: ListSpec,
    path: string,
    report: MergeReport,
): any[] {
    const sourceToTarget = pairLists(source, target, spec.identities);
    const targetToSource = invert(sourceToTarget);
    const sourceToBase = base ? pairLists(source, base, spec.identities) : new Map<number, number>();
    const targetToBase = base ? pairLists(target, base, spec.identities) : new Map<number, number>();

    const idMap = new Map<string, string>();
    const result: { item: any; targetIndex?: number }[] = [];

    source.forEach((sItem, sIndex) => {
        const tIndex = sourceToTarget.get(sIndex);
        const bIndex = sourceToBase.get(sIndex);
        const bItem = bIndex === undefined ? undefined : base![bIndex];
        const identity = itemIdentity(spec, sItem);

        if (tIndex === undefined) {
            if (bItem !== undefined && !changed(sItem, bItem, spec)) {
                // The target removed it since the last import and the source did not change it: keep the removal.
                report.events.push({ kind: 'kept_target_removal', path, identity, label: itemLabel(spec, sItem) });
                return;
            }
            if (bItem !== undefined) {
                report.events.push({ kind: 'conflict_source_wins', path, identity, label: itemLabel(spec, sItem) });
            } else {
                report.events.push({ kind: 'added_from_source', path, identity, label: itemLabel(spec, sItem) });
            }
            result.push({ item: sItem });
            return;
        }

        const tItem = target[tIndex];
        const merged = mergeEntity(sItem, tItem, bItem, spec, `${path} > ${itemLabel(spec, sItem) || identity}`, report, idMap);
        result.push({ item: merged, targetIndex: tIndex });
    });

    // Items that only exist on the target.
    target.forEach((tItem, tIndex) => {
        if (targetToSource.has(tIndex)) return;
        const bIndex = targetToBase.get(tIndex);
        const bItem = bIndex === undefined ? undefined : base![bIndex];
        const identity = itemIdentity(spec, tItem);

        if (bItem !== undefined) {
            if (!changed(tItem, bItem, spec)) {
                report.events.push({ kind: 'removed_by_source', path, identity, label: itemLabel(spec, tItem) });
                return;
            }
            report.events.push({ kind: 'conflict_kept_target', path, identity, label: itemLabel(spec, tItem) });
        } else {
            report.events.push({ kind: 'kept_target_only', path, identity, label: itemLabel(spec, tItem) });
        }

        // Insert after the closest preceding target item that is already in the result.
        let insertAt = 0;
        for (let i = tIndex - 1; i >= 0; i--) {
            const pos = result.findIndex(r => r.targetIndex === i);
            if (pos >= 0) { insertAt = pos + 1; break; }
        }
        result.splice(insertAt, 0, { item: tItem, targetIndex: tIndex });
    });

    let items = result.map(r => r.item);

    // Items that carry their own 1-based position (screen items, drugs) are renumbered in merged order.
    if (items.some(item => typeof item?.position === 'number')) {
        items = items.map((item, index) => (typeof item?.position === 'number' ? { ...item, position: index + 1 } : item));
    }

    // Keep selection-rule references pointing at the ids that survive the merge.
    if (spec.idField && idMap.size) {
        items = items.map((item) => {
            if (!Array.isArray(item?.forbidWith)) return item;
            const forbidWith = Array.from(new Set(item.forbidWith.map((id: string) => idMap.get(`${id}`) || id)));
            return { ...item, forbidWith };
        });
    }

    return items;
}

/* ------------------------------------------------------------------------------------------------ */
/* Specs for the script entities                                                                    */
/* ------------------------------------------------------------------------------------------------ */

const str = (v: unknown) => (v === null || v === undefined || v === '' ? undefined : `${v}`);

export const OPTION_ITEM_SPEC: ListSpec = {
    identities: [i => str(i?.itemId), i => str(i?.value), i => str(i?.id), i => str(i?.key)],
    idField: 'itemId',
    label: i => `${i?.label ?? i?.value ?? ''}`,
};

export const SCREEN_ITEM_SPEC: ListSpec = {
    identities: [i => str(i?.itemId), i => str(i?.id ?? i?.key), i => str(i?.label)],
    idField: 'itemId',
    label: i => `${i?.label ?? i?.id ?? i?.key ?? ''}`,
};

export const FIELD_SPEC: ListSpec = {
    identities: [f => str(f?.fieldId), f => str(f?.key), f => str(f?.label)],
    idField: 'fieldId',
    label: f => `${f?.label ?? f?.key ?? ''}`,
    children: { items: OPTION_ITEM_SPEC },
};

const DRUG_SPEC: ListSpec = {
    identities: [d => str(d?.key), d => str(d?.id)],
    label: d => `${d?.key ?? ''}`,
};

export const SCREEN_SPEC: ListSpec = {
    identities: [],
    idField: 'screenId',
    label: s => `${s?.title || s?.label || s?.refId || ''}`,
    children: {
        items: SCREEN_ITEM_SPEC,
        fields: FIELD_SPEC,
        drugs: DRUG_SPEC,
        fluids: DRUG_SPEC,
        feeds: DRUG_SPEC,
    },
};

const SYMPTOM_SPEC: ListSpec = {
    identities: [s => str(s?.key), s => str(s?.name)],
    label: s => `${s?.name ?? s?.key ?? ''}`,
};

export const DIAGNOSIS_SPEC: ListSpec = {
    identities: [],
    idField: 'diagnosisId',
    label: d => `${d?.name ?? d?.key ?? ''}`,
    children: { symptoms: SYMPTOM_SPEC },
};

export const PROBLEM_SPEC: ListSpec = {
    identities: [],
    idField: 'problemId',
    label: p => `${p?.name ?? p?.key ?? ''}`,
    children: { symptoms: SYMPTOM_SPEC },
};

const NUID_FIELD_SPEC: ListSpec = {
    identities: [f => str(f?.fieldId), f => str(f?.key)],
    idField: 'fieldId',
    label: f => `${f?.label ?? f?.key ?? ''}`,
};

export const SCRIPT_SPEC: ListSpec = {
    identities: [],
    idField: 'scriptId',
    label: s => `${s?.title ?? ''}`,
    children: { nuidSearchFields: NUID_FIELD_SPEC },
};

/* ------------------------------------------------------------------------------------------------ */
/* Matching whole entities (screens, diagnoses, problems) between source and target                */
/* ------------------------------------------------------------------------------------------------ */

export type EntityKind = 'screens' | 'diagnoses' | 'problems';

export const ENTITY_ID_FIELD: Record<EntityKind, 'screenId' | 'diagnosisId' | 'problemId'> = {
    screens: 'screenId',
    diagnoses: 'diagnosisId',
    problems: 'problemId',
};

const ENTITY_SPEC: Record<EntityKind, ListSpec> = {
    screens: SCREEN_SPEC,
    diagnoses: DIAGNOSIS_SPEC,
    problems: PROBLEM_SPEC,
};

function entityHeuristics(kind: EntityKind): ((e: any) => string | undefined)[] {
    if (kind === 'screens') {
        return [
            s => `${s?.type || ''}|${s?.refId || s?.key || ''}|${(s?.title || '').trim().toLowerCase()}`,
            s => (s?.refId || s?.key) ? `${s?.type || ''}|${s?.refId || s?.key}` : undefined,
        ];
    }
    return [
        d => str(d?.key) ? `${d.key}` : undefined,
        d => str(d?.name) ? `${(d.name || '').trim().toLowerCase()}` : undefined,
    ];
}

export type EntityMergePlan = {
    /** Entities to save on the target, in final order. `targetId` is set when an existing target entity is reused. */
    save: { entity: any; targetId?: string; sourceId: string; isNew: boolean }[];
    /** Target entity ids to delete (removed on the source since the last import, or unmatched on a first import). */
    remove: { targetId: string; entity: any; reason: 'removed_by_source' | 'not_in_source' }[];
    /** Target-only entities that are kept as they are. */
    keep: { targetId: string; entity: any }[];
    /** source id -> target id for every source entity in `save`. */
    idMap: Record<string, string>;
};

/**
 * Plan how source entities map onto target entities.
 * Matching order: stored id map from earlier imports, identical ids, then (type, key, title) heuristics.
 */
export function planEntityMerge({
    kind,
    source,
    target,
    base,
    storedIdMap,
    keepTargetOnly,
    newId,
    report,
}: {
    kind: EntityKind;
    source: any[];
    target: any[];
    base: any[] | null;
    storedIdMap: Record<string, string>;
    keepTargetOnly: boolean;
    /** Id for a source entity that has no match on the target (called with the source id). */
    newId: (sourceId: string) => string;
    report: MergeReport;
}): EntityMergePlan {
    const idField = ENTITY_ID_FIELD[kind];
    const spec = ENTITY_SPEC[kind];
    const targetById = new Map(target.map(t => [`${t[idField]}`, t]));
    const baseBySourceId = new Map((base || []).map(b => [`${b[idField]}`, b]));
    const mappedTargetIds = new Set(Object.values(storedIdMap));

    const pairs = new Map<number, string>();
    const usedTargets = new Set<string>();

    // 1. stored mapping from earlier imports, 2. identical ids
    source.forEach((s, index) => {
        const sid = `${s[idField]}`;
        const viaMap = storedIdMap[sid];
        if (viaMap && targetById.has(viaMap) && !usedTargets.has(viaMap)) {
            pairs.set(index, viaMap);
            usedTargets.add(viaMap);
        }
    });
    source.forEach((s, index) => {
        if (pairs.has(index)) return;
        const sid = `${s[idField]}`;
        if (targetById.has(sid) && !usedTargets.has(sid)) {
            pairs.set(index, sid);
            usedTargets.add(sid);
        }
    });
    // 3. heuristics, only against target entities that are not already known to come from another source entity
    for (const heuristic of entityHeuristics(kind)) {
        const buckets = new Map<string, string[]>();
        target.forEach((t) => {
            const tid = `${t[idField]}`;
            if (usedTargets.has(tid)) return;
            const key = heuristic(t);
            if (!key) return;
            const list = buckets.get(key) || [];
            list.push(tid);
            buckets.set(key, list);
        });
        source.forEach((s, index) => {
            if (pairs.has(index)) return;
            const key = heuristic(s);
            if (!key) return;
            const candidate = buckets.get(key)?.find(tid => !usedTargets.has(tid));
            if (!candidate) return;
            pairs.set(index, candidate);
            usedTargets.add(candidate);
        });
    }

    const plan: EntityMergePlan = { save: [], remove: [], keep: [], idMap: {} };

    source.forEach((s, index) => {
        const sid = `${s[idField]}`;
        const baseEntity = baseBySourceId.get(sid);
        const targetId = pairs.get(index);
        if (targetId) {
            const merged = mergeEntity(s, targetById.get(targetId), baseEntity ?? null, spec, spec.label!(s), report);
            merged[idField] = targetId;
            plan.save.push({ entity: merged, targetId, sourceId: sid, isNew: false });
            plan.idMap[sid] = targetId;
            return;
        }
        const previouslyMapped = storedIdMap[sid];
        if (baseEntity && previouslyMapped && !targetById.has(previouslyMapped) && !changed(s, baseEntity, spec)) {
            // Deleted on the target since the last import, unchanged on the source: keep the deletion.
            report.events.push({ kind: 'kept_target_removal', path: spec.label!(s), identity: sid, label: spec.label!(s) });
            return;
        }
        const id = newId(sid);
        plan.save.push({ entity: { ...s, [idField]: id }, sourceId: sid, isNew: true });
        plan.idMap[sid] = id;
        report.events.push({ kind: 'added_from_source', path: kind, identity: sid, label: spec.label!(s) });
    });

    target.forEach((t) => {
        const tid = `${t[idField]}`;
        if (usedTargets.has(tid)) return;
        const cameFromSource = mappedTargetIds.has(tid);
        if (cameFromSource && base) {
            const sourceId = Object.keys(storedIdMap).find(k => storedIdMap[k] === tid)!;
            const baseEntity = baseBySourceId.get(sourceId);
            if (baseEntity && !changed(t, baseEntity, spec)) {
                plan.remove.push({ targetId: tid, entity: t, reason: 'removed_by_source' });
                report.events.push({ kind: 'removed_by_source', path: kind, identity: tid, label: spec.label!(t) });
                return;
            }
            plan.keep.push({ targetId: tid, entity: t });
            report.events.push({ kind: 'conflict_kept_target', path: kind, identity: tid, label: spec.label!(t) });
            return;
        }
        if (!base && !keepTargetOnly) {
            plan.remove.push({ targetId: tid, entity: t, reason: 'not_in_source' });
            report.events.push({ kind: 'removed_by_source', path: kind, identity: tid, label: spec.label!(t) });
            return;
        }
        plan.keep.push({ targetId: tid, entity: t });
        report.events.push({ kind: 'kept_target_only', path: kind, identity: tid, label: spec.label!(t) });
    });

    return plan;
}

/**
 * Order the saved and kept entities: source order first; kept target-only entities go after the target
 * entity that preceded them on the target.
 */
export function orderMergedEntities(
    kind: EntityKind,
    plan: EntityMergePlan,
    target: any[],
): { entity: any; targetId?: string; isNew: boolean; kept: boolean }[] {
    const idField = ENTITY_ID_FIELD[kind];
    const ordered: { entity: any; targetId?: string; isNew: boolean; kept: boolean }[] =
        plan.save.map(s => ({ entity: s.entity, targetId: s.targetId, isNew: s.isNew, kept: false }));
    const targetOrder = [...target].sort((a, b) => (a.position || 0) - (b.position || 0)).map(t => `${t[idField]}`);
    for (const kept of plan.keep) {
        const index = targetOrder.indexOf(kept.targetId);
        let insertAt = 0;
        for (let i = index - 1; i >= 0; i--) {
            const pos = ordered.findIndex(o => (o.targetId || o.entity[idField]) === targetOrder[i]);
            if (pos >= 0) { insertAt = pos + 1; break; }
        }
        ordered.splice(insertAt, 0, { entity: kept.entity, targetId: kept.targetId, isNew: false, kept: true });
    }
    return ordered;
}

/**
 * Positions for the merged entities of one script. Positions only order a script's own entities, but
 * they are drawn from one global sequence, so:
 *  - entities that already exist keep their position when the merged order allows it;
 *  - new entities go into the gap between their neighbours (or after the last one);
 *  - when the order changed or a gap is too small, the whole script is renumbered from `nextFreePosition`.
 */
export function assignMergedPositions(
    ordered: { id: string; currentPosition?: number | null }[],
    nextFreePosition: number,
): { positions: Record<string, number>; renumbered: boolean } {
    const renumber = () => ({
        positions: Object.fromEntries(ordered.map((o, i) => [o.id, nextFreePosition + i])),
        renumbered: true,
    });

    const existing = ordered.filter(o => typeof o.currentPosition === 'number');
    for (let i = 1; i < existing.length; i++) {
        if ((existing[i].currentPosition as number) <= (existing[i - 1].currentPosition as number)) return renumber();
    }

    const positions: Record<string, number> = {};
    let i = 0;
    let previous: number | null = null;
    while (i < ordered.length) {
        const item = ordered[i];
        if (typeof item.currentPosition === 'number') {
            positions[item.id] = item.currentPosition;
            previous = item.currentPosition;
            i++;
            continue;
        }
        // a run of new entities
        let j = i;
        while (j < ordered.length && typeof ordered[j].currentPosition !== 'number') j++;
        const runLength = j - i;
        const next = j < ordered.length ? (ordered[j].currentPosition as number) : null;
        let start: number;
        if (previous === null && next === null) {
            start = nextFreePosition;
        } else if (next === null) {
            start = Math.max(previous as number, nextFreePosition - 1) + 1;
        } else if (previous === null) {
            start = next - runLength;
            if (start < 1) return renumber();
        } else {
            if (next - previous - 1 < runLength) return renumber();
            start = previous + 1;
        }
        for (let k = 0; k < runLength; k++) positions[ordered[i + k].id] = start + k;
        previous = start + runLength - 1;
        i = j;
    }
    return { positions, renumbered: false };
}

/* ------------------------------------------------------------------------------------------------ */
/* Data-key option lists                                                                            */
/* ------------------------------------------------------------------------------------------------ */

/**
 * Merge a data key's option list (uniqueKeys).
 *  - additive: only append source options the target does not have (used when "Overwrite datakeys" is off
 *    and for new-copy imports);
 *  - otherwise three-way: source additions are added, target-only options are kept, and options the source
 *    removed since the base are removed (only if the base is known).
 */
export function mergeOptionKeys({
    source,
    target,
    base,
    additiveOnly,
}: {
    source: string[];
    target: string[];
    base: string[] | null;
    additiveOnly: boolean;
}): { options: string[]; added: string[]; removed: string[] } {
    const unique = (list: string[]) => list.filter((o, i) => !!o && list.indexOf(o) === i);
    source = unique(source);
    target = unique(target);
    const targetSet = new Set(target);
    const sourceSet = new Set(source);
    const added = source.filter(o => !targetSet.has(o));
    if (additiveOnly || !base) {
        return { options: [...target, ...added], added, removed: [] };
    }
    const baseSet = new Set(base);
    const removed = target.filter(o => baseSet.has(o) && !sourceSet.has(o));
    const removedSet = new Set(removed);
    // Source order first; options that only the target has stay after their previous target neighbour.
    const result = [...source];
    target.forEach((o, index) => {
        if (sourceSet.has(o) || removedSet.has(o)) return;
        let insertAt = 0;
        for (let i = index - 1; i >= 0; i--) {
            const pos = result.indexOf(target[i]);
            if (pos >= 0) { insertAt = pos + 1; break; }
        }
        result.splice(insertAt, 0, o);
    });
    return { options: result, added, removed };
}

/** Summarise merge events for the import preview. */
export function summariseMergeReport(report: MergeReport) {
    const by = (kind: MergeEventKind) => report.events.filter(e => e.kind === kind);
    return {
        added: by('added_from_source'),
        removedBySource: by('removed_by_source'),
        keptTargetOnly: by('kept_target_only'),
        keptTargetRemovals: by('kept_target_removal'),
        conflicts: [...by('conflict_source_wins'), ...by('conflict_kept_target')],
        replacedWithoutHistory: by('replaced_without_history'),
    };
}

/* ------------------------------------------------------------------------------------------------ */
/* Importing back the other way (back-ports)                                                        */
/* ------------------------------------------------------------------------------------------------ */

type SnapshotLike = {
    sourceScriptId: string;
    script: Record<string, any>;
    screens: Record<string, any>[];
    diagnoses: Record<string, any>[];
    problems: Record<string, any>[];
    idMap: { screens: Record<string, string>; diagnoses: Record<string, string>; problems: Record<string, string> };
    [key: string]: any;
};

/**
 * The other editor recorded its last import of OUR script into ITS script: the base is our content at
 * that time (in our ids) with a map our id -> its id. To import its script back into ours with that base,
 * the base has to be expressed in the ids of what we now import from (its ids), with the map reversed.
 */
export function invertImportSnapshot<T extends SnapshotLike>(snapshot: T, remoteScriptId: string): T {
    const toRemote = (map: Record<string, string>, id: any) => (id && map[`${id}`]) || id;
    const invert = (map: Record<string, string>) => Object.fromEntries(Object.entries(map || {}).map(([ours, theirs]) => [theirs, ours]));
    const screensMap = snapshot.idMap?.screens || {};
    const diagnosesMap = snapshot.idMap?.diagnoses || {};
    const problemsMap = snapshot.idMap?.problems || {};

    return {
        ...snapshot,
        sourceScriptId: remoteScriptId,
        script: {
            ...snapshot.script,
            printSections: (snapshot.script?.printSections || []).map((p: any) => ({
                ...p,
                screensIds: (p.screensIds || []).map((id: string) => toRemote(screensMap, id)),
            })),
            reviewConfigurations: (snapshot.script?.reviewConfigurations || []).map((c: any) => ({
                ...c,
                screen: toRemote(screensMap, c.screen),
            })),
        },
        screens: (snapshot.screens || []).map(s => ({
            ...s,
            screenId: toRemote(screensMap, s.screenId),
            skipToScreenId: s.skipToScreenId ? toRemote(screensMap, s.skipToScreenId) : s.skipToScreenId,
        })),
        diagnoses: (snapshot.diagnoses || []).map(d => ({ ...d, diagnosisId: toRemote(diagnosesMap, d.diagnosisId) })),
        problems: (snapshot.problems || []).map(p => ({ ...p, problemId: toRemote(problemsMap, p.problemId) })),
        idMap: {
            screens: invert(screensMap),
            diagnoses: invert(diagnosesMap),
            problems: invert(problemsMap),
        },
    };
}
