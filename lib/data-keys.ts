import { v4 as uuidV4 } from "uuid";

import { _getScreens, _getDiagnoses, _getProblems, _getScripts } from "@/databases/queries/scripts";
import { _getDrugsLibraryItems } from "@/databases/queries/drugs-library";
import { _getDataKeys, DataKey } from "@/databases/queries/data-keys";
import { diagnoses, drugsLibrary } from "@/databases/pg/schema";
import { normalizeDataKeyType } from "@/lib/data-key-types";
import { getOutcomeCollectionForScreenType } from "@/lib/conditional-expression/script-outcomes";

type KeyWithoutOptions = {
    name: string;
    label: string;
    dataType: string;
    uuid?: string;
    uniqueKey?: string;
};

type KeyWithOptions = KeyWithoutOptions & {
    options: KeyWithoutOptions[];
};

type Scrapped = {
    key: KeyWithoutOptions & {
        children: (KeyWithoutOptions & {
            children: KeyWithoutOptions[];
        })[];
    };
    type: 'dff' | 'diagnosis' | 'screen' | 'problem' | 'nuidSearchField';
    id: string;
};

export function isDataKeyValid(key: KeyWithoutOptions) {
    // return true;
    return !!(
        key.label && 
        key.name && 
        key.dataType
    );
}

export function getDataKeysQueryFields(keys: KeyWithoutOptions[]) {
    return keys.map(key => ({
        name: (key.name || '').trim(),
        label: (key.label || '').trim(),
        dataType: (key.dataType || '').trim(),
    }));
}

export function dataKeyToJSON(key: KeyWithoutOptions, opts?: {
    lowerCase?: boolean;
}) {
    const lowerCase = opts?.lowerCase !== false;
    let json = JSON.stringify({
        ...getDataKeysQueryFields([key])[0],
        dataType: normalizeDataKeyType(key.dataType),
    });
    if (lowerCase) json = json.toLowerCase();
    return json;
}

/**
 * Drops keys that serialise identically, keeping the first of each.
 *
 * This used to re-serialise the whole list once per element — quadratic, and on
 * a large script the single biggest cost in scrapping it. One pass with a set
 * gives the same result.
 */
export function removeDuplicateDataKeys<T extends KeyWithoutOptions>(keys: T[]): T[] {
    const seen = new Set<string>();
    const unique: T[] = [];
    for (const key of keys) {
        const json = dataKeyToJSON(key);
        if (seen.has(json)) continue;
        seen.add(json);
        unique.push(key);
    }
    return unique;
}

/**
 * JSON -> key index for a candidate list, cached against the array itself.
 *
 * Every lookup used to be a linear scan that re-serialised each candidate, so
 * scrapping one script against a 3000-key library ran into millions of
 * JSON.stringify calls — measured at 2.7s for a 144-screen script, which was
 * the bulk of every CE recompute. Serialising each candidate once turns that
 * into a hash lookup.
 *
 * The cache is keyed on the array reference and invalidated when its length
 * changes, so callers that build a fresh array (or grow one) get a fresh index.
 * First match wins, matching the Array.find it replaces.
 */
const dataKeyJSONIndexCache = new WeakMap<object, { size: number; index: Map<string, any> }>();

export function indexDataKeysByJSON<T extends KeyWithoutOptions>(keys: T[]): Map<string, T> {
    const cached = dataKeyJSONIndexCache.get(keys);
    if (cached && cached.size === keys.length) return cached.index as Map<string, T>;

    const index = new Map<string, T>();
    for (const key of keys) {
        const json = dataKeyToJSON(key);
        if (!index.has(json)) index.set(json, key);
    }
    dataKeyJSONIndexCache.set(keys, { size: keys.length, index });
    return index;
}

export function pickDataKey(keys: (KeyWithoutOptions & { options: string[]; })[], key: KeyWithoutOptions) {
    if (!keys?.length) return undefined;
    return indexDataKeysByJSON(keys).get(dataKeyToJSON(key));
}

type ScrapDataKeysParams = {
    scripts?: Awaited<ReturnType<typeof _getScripts>>['data'];
    screens?: Awaited<ReturnType<typeof _getScreens>>['data'];
    diagnoses?: Awaited<ReturnType<typeof _getDiagnoses>>['data'];
    problems?: Awaited<ReturnType<typeof _getProblems>>['data'];
    drugsLibrary?: Awaited<ReturnType<typeof _getDrugsLibraryItems>>['data'];
    importedDataKeys?: Awaited<ReturnType<typeof _getDataKeys>>['data'];
    dataKeys?: Awaited<ReturnType<typeof _getDataKeys>>['data'];
    linkScrappedToDataKeys?: boolean;
};

export async function scrapDataKeys({
    scripts = [],
    screens = [],
    diagnoses = [],
    problems = [],
    dataKeys: dataKeysParam,
    linkScrappedToDataKeys = true,
}: ScrapDataKeysParams) {
    let scriptsKeys: Scrapped[] = scripts.reduce((acc, s) => {
        const nuidSearchFields = s.nuidSearchFields;

        nuidSearchFields.forEach(f => {
            acc.push({
                id: f.fieldId,
                type: 'nuidSearchField',
                key: {
                    name: f.key,
                    label: f.label,
                    children: [],
                    dataType: 'field',
                    uniqueKey: f.keyId,
                },
            })
        });

        return acc;
    }, [] as Scrapped[]);

    let diagnosesKeys: Scrapped[] = diagnoses.map(s => {
        const name = s.key || s.name;
        return {
            id: s.diagnosisId,
            type: 'diagnosis',
            key: {
                label: s.name,
                name,
                dataType: 'diagnosis',
                children: (s.symptoms || []).map(f => {
                    const name = f.key || f.name;
                    return {
                        label: f.name,
                        name,
                        dataType: `diagnosis_symptom_${f.type}`,
                        children: [],
                    };
                }),
            },
        };
    });

    let problemsKeys: Scrapped[] = problems.map(s => {
        const name = s.key || s.name;
        return {
            id: s.problemId,
            type: 'problem',
            key: {
                label: s.name,
                name,
                dataType: 'problem',
                children: [],
            },
        };
    });

    let screensKeys: Scrapped[] = screens.map(s => {
        let dataType = s.type;
        const outcomeCollection = getOutcomeCollectionForScreenType(s.type);

        return {
            id: s.screenId,
            type: 'screen',
            key: {
                // The collection itself is virtual and must not be linked to
                // the global data-key registry. Its CDS children remain normal
                // script keys and are collected below.
                name: outcomeCollection ? '' : s.key,
                label: outcomeCollection ? '' : s.label,
                dataType,
                children: [
                    ...(s.fields || []).map(f => {
                        const name = f.key;
                        let dataType = f.type;
                        
                        return {
                            label: f.label,
                            name,
                            dataType,
                            children: (f.items || []).map(s => {
                                const name = s.value as string;
                                return {
                                    label: s.label as string,
                                    name,
                                    dataType: 'option',
                                };
                            }),
                        };
                    }),

                    ...(s.items || []).map(f => {
                        const name = f.key || f.id;

                        let _dataType = 'option';

                        if (s.type === 'diagnosis') _dataType = 'diagnosis';

                        return {
                            label: f.label,
                            name,
                            dataType: _dataType,
                            children: [],
                        };
                    }),
                ],
            },
        };
    });

    const mergedKeys = mergeScrappedKeys(diagnosesKeys, problemsKeys, screensKeys, scriptsKeys);
    let scrappedKeys = removeDuplicateDataKeys(mergedKeys).filter(k => k.name) as typeof mergedKeys;

    const { data: dataKeys, } = dataKeysParam ? { data: dataKeysParam, } : (
        !linkScrappedToDataKeys ? { data: [], } : await _getDataKeys({ keys: scrappedKeys.map(({ options, ...o }) => o), })
    );

    let keys = await linkScrappedKeysToDataKeys({ scrappedKeys, dataKeys, });

    keys = keys.map(k => ({
        ...k,
        options: k.options.filter((o, i) => k.options.indexOf(o) === i),
    }))

    return keys;
}

export async function linkScrappedKeysToDataKeys({ scrappedKeys, importedDataKeys = [], dataKeys, }: {
    scrappedKeys: KeyWithOptions[];
    importedDataKeys?: ScrapDataKeysParams['importedDataKeys'];
    dataKeys: DataKey[];
}) {
    scrappedKeys = scrappedKeys.map(k => {
        const { uniqueKey, uuid, } = { ...pickDataKey(dataKeys, k) };
        return {
            ...k,
            uniqueKey,
            uuid: uuid || uuidV4(),
        };
    });

    const scrappedIndex = indexDataKeysByJSON(scrappedKeys);

    return scrappedKeys.map(k => {
        const imported = pickDataKey(importedDataKeys, k) as DataKey;

        const options = imported?.options || k.options
            .map(o => {
                const { uniqueKey, uuid, } = { ...scrappedIndex.get(dataKeyToJSON(o)), };
                return uniqueKey || uuid!;
            })
            .filter(o => o);

        return {
            ...k,
            options,
        };
    });
}

export type ImportedDataKeysMode =
    /** Only add what the target is missing: new keys, and new options on existing keys. Nothing is removed or relabelled. */
    | 'additive'
    /**
     * "Overwrite datakeys": the source's changes are applied. With a base (the source keys as they were at the
     * last import) this is a three-way merge: options the source removed since then are removed, options only
     * the target has are kept. Without a base nothing is removed.
     */
    | 'three_way';

export type ImportedDataKeyBase = {
    name: string;
    label: string;
    dataType: string;
    options: string[];
    confidential?: boolean;
    confidentialLabelOnly?: boolean;
};

const DATA_KEY_IMPORT_MERGED_PROPS = ['name', 'label', 'dataType', 'refId', 'confidential', 'confidentialLabelOnly', 'metadata'] as const;

/** Properties that hold another data key's uniqueKey inside a screen, field or item. */
const KEY_REFERENCE_PROPS = ['keyId', 'refKeyId', 'minDateKeyId', 'maxDateKeyId', 'minTimeKeyId', 'maxTimeKeyId', 'refIdDataKey'] as const;

function sameImportValue(a: unknown, b: unknown) {
    const norm = (v: unknown) => (v === undefined || v === null || v === '' ? null : v);
    return JSON.stringify(norm(a)) === JSON.stringify(norm(b));
}

/**
 * Prepare data keys and script items from another editor for saving on this one.
 *
 * Keys are matched to this editor's keys by uniqueKey first (keys keep their uniqueKey when they travel
 * between editors), then by an exact, unambiguous name + label + type match. Every key reference in the
 * imported screens, diagnoses and problems is rewritten through that map. A reference is never cleared
 * because a label differs: that used to drop the link (keyId undefined) whenever the two editors had
 * worded a key differently.
 *
 * Option lists are merged, never replaced (see ImportedDataKeysMode). Only keys the imported scripts
 * actually use are saved.
 */
export async function parseImportedDataKeys({ 
    localDataKeys = [],
    importedScrappedKeys = [], 
    importedDataKeys = [], 
    importedScreens = [],
    importedDiagnoses = [],
    importedProblems = [],
    importedDrugsLibraryItems = [],
    importedNuidSearchFields = [],
    mode = 'additive',
    baseDataKeys = null,
    takenUniqueKeys = new Set<string>(),
    isOptionUsedOutsideImport,
}: {
    localDataKeys: Awaited<ReturnType<typeof _getDataKeys>>['data'];
    importedDataKeys: DataKey[];
    importedScrappedKeys: Awaited<ReturnType<typeof scrapDataKeys>>;
    importedScreens?: Awaited<ReturnType<typeof _getScreens>>['data'];
    importedDiagnoses?: Awaited<ReturnType<typeof _getDiagnoses>>['data'];
    importedProblems?: Awaited<ReturnType<typeof _getProblems>>['data'];
    importedDrugsLibraryItems?: Awaited<ReturnType<typeof _getDrugsLibraryItems>>['data'];
    importedNuidSearchFields?: { keyId?: string; key?: string; label?: string; [key: string]: any }[];
    mode?: ImportedDataKeysMode;
    /** This editor's uniqueKey -> the source key as it was at the last import (three-way mode). */
    baseDataKeys?: Record<string, ImportedDataKeyBase> | null;
    /** uniqueKeys that exist on this editor but are not in localDataKeys (e.g. deleted keys). */
    takenUniqueKeys?: Set<string>;
    /** True when screens outside the imported scripts still use this option under this parent key. */
    isOptionUsedOutsideImport?: (parentUniqueKey: string, optionUniqueKey: string) => boolean;
}) {
    const warnings: string[] = [];

    const localByUniqueKey = new Map(localDataKeys.map(k => [k.uniqueKey, k]));
    const localByJSON = new Map<string, DataKey[]>();
    localDataKeys.forEach(k => {
        const json = dataKeyToJSON(k);
        localByJSON.set(json, [...(localByJSON.get(json) || []), k]);
    });

    const importedByUniqueKey = new Map(importedDataKeys.map(k => [k.uniqueKey, k]));

    // source uniqueKey -> this editor's uniqueKey (and the local key when there is one)
    const identity = new Map<string, { uniqueKey: string; local?: DataKey }>();
    const usedLocal = new Set<string>();
    importedDataKeys.forEach(k => {
        const sameUniqueKey = localByUniqueKey.get(k.uniqueKey);
        if (sameUniqueKey) {
            identity.set(k.uniqueKey, { uniqueKey: sameUniqueKey.uniqueKey, local: sameUniqueKey });
            usedLocal.add(sameUniqueKey.uniqueKey);
        }
    });
    importedDataKeys.forEach(k => {
        if (identity.has(k.uniqueKey)) return;
        const candidates = (localByJSON.get(dataKeyToJSON(k)) || []).filter(l => !usedLocal.has(l.uniqueKey) && !importedByUniqueKey.has(l.uniqueKey));
        if (candidates.length === 1) {
            identity.set(k.uniqueKey, { uniqueKey: candidates[0].uniqueKey, local: candidates[0] });
            usedLocal.add(candidates[0].uniqueKey);
            return;
        }
        // New on this editor. Keep the source uniqueKey so the two editors stay linked, unless this editor
        // already used it for a key that was deleted here (the unique constraint would reject it).
        const uniqueKey = takenUniqueKeys.has(k.uniqueKey) ? uuidV4() : (k.uniqueKey || uuidV4());
        identity.set(k.uniqueKey, { uniqueKey });
    });

    const mapUniqueKey = (sourceUniqueKey?: string | null) => {
        if (!sourceUniqueKey) return undefined;
        return identity.get(sourceUniqueKey)?.uniqueKey;
    };

    // Keys the imported items refer to, directly or as options of a referenced key.
    const referenced = new Set<string>();
    const reference = (uk?: string | null) => { if (uk && importedByUniqueKey.has(uk)) referenced.add(uk); };
    const collectRefs = (obj: Record<string, any> | null | undefined) => {
        if (!obj) return;
        KEY_REFERENCE_PROPS.forEach(p => reference(obj[p]));
    };
    importedScreens.forEach(s => {
        collectRefs(s as any);
        (s.items || []).forEach(i => collectRefs(i as any));
        (s.fields || []).forEach(f => {
            collectRefs(f as any);
            (f.items || []).forEach(i => collectRefs(i as any));
        });
    });
    importedDiagnoses.forEach(d => {
        collectRefs(d as any);
        (d.symptoms || []).forEach(sy => collectRefs(sy as any));
    });
    importedProblems.forEach(p => collectRefs(p as any));
    importedNuidSearchFields.forEach(f => collectRefs(f));
    // Items without a keyId are still matched the old way (by name + label + type).
    importedScrappedKeys.forEach(sk => {
        if (sk.uniqueKey && importedByUniqueKey.has(sk.uniqueKey)) referenced.add(sk.uniqueKey);
    });
    Array.from(referenced).forEach(uk => (importedByUniqueKey.get(uk)?.options || []).forEach(o => reference(o)));

    let parsed = importedDataKeys.map(k => {
        const { uniqueKey, local } = identity.get(k.uniqueKey)!;
        const sourceOptions = (k.options || [])
            .filter(o => importedByUniqueKey.has(o))
            .map(o => mapUniqueKey(o)!)
            .filter(Boolean);

        const {
            id: _sourceId,
            uuid: _sourceUuid,
            createdAt: _createdAt,
            updatedAt: _updatedAt,
            publishDate: _publishDate,
            deletedAt: _deletedAt,
            version: _version,
            isDraft: _isDraft,
            isDeleted: _isDeleted,
            draftCreatedByUserId: _draftCreatedByUserId,
            ...sourceProps
        } = k as DataKey & Record<string, any>;

        // What the source has, in this editor's ids: stored as the base for the next import.
        const sourceSnapshot: ImportedDataKeyBase = {
            name: k.name,
            label: k.label,
            dataType: k.dataType,
            options: sourceOptions,
            confidential: k.confidential,
            confidentialLabelOnly: k.confidentialLabelOnly,
        };

        let addedOptions: string[] = [];
        let removedOptions: string[] = [];
        let keptRemovals: string[] = [];
        let next: Record<string, any>;

        if (!local) {
            next = { ...sourceProps, uniqueKey, options: sourceOptions };
            addedOptions = sourceOptions;
        } else {
            const base = baseDataKeys?.[uniqueKey] || null;
            const mergeOptions = (baseOptions: string[] | null) => mergeImportedOptionKeys({
                source: sourceOptions,
                target: local.options || [],
                base: baseOptions,
                additiveOnly: mode === 'additive',
            });
            let merged = mergeOptions(base?.options || null);
            // An option the source removed stays when screens outside this import still use it.
            keptRemovals = merged.removed.filter(o => !!isOptionUsedOutsideImport?.(uniqueKey, o));
            if (keptRemovals.length) merged = mergeOptions((base?.options || []).filter(o => !keptRemovals.includes(o)));
            addedOptions = merged.added;
            removedOptions = merged.removed;

            next = { ...local, options: merged.options };
            if (mode === 'three_way') {
                DATA_KEY_IMPORT_MERGED_PROPS.forEach(prop => {
                    // confidentiality is handled below: an import never lowers it
                    if (prop === 'confidential' || prop === 'confidentialLabelOnly') return;
                    const s = (k as any)[prop];
                    const t = (local as any)[prop];
                    const b = (base as any)?.[prop];
                    if (sameImportValue(s, t)) return;
                    if (s === undefined) return;
                    // Only the target changed it since the last import: keep the target's value.
                    if (base && b !== undefined && sameImportValue(s, b) && !sameImportValue(t, b)) return;
                    next[prop] = s;
                });
            }
            if (mode === 'three_way') {
                // An import can make a key more confidential, never less: lowering it would expose data
                // (and publishing refuses an unconfirmed downgrade anyway).
                const rank = (k: any) => (k?.confidential ? 2 : k?.confidentialLabelOnly ? 1 : 0);
                const sourceRank = rank(k);
                const localRank = rank(local);
                const finalRank = Math.max(sourceRank, localRank);
                next.confidential = finalRank === 2;
                next.confidentialLabelOnly = finalRank === 1;
                if (sourceRank < localRank) {
                    warnings.push(`Data key "${local.label || local.name}": kept it ${localRank === 2 ? 'confidential' : 'confidential (label only)'} here; the source has it less confidential.`);
                }
            }
            if (keptRemovals.length) {
                warnings.push(`Data key "${local.label || local.name}": kept ${keptRemovals.length} option${keptRemovals.length === 1 ? '' : 's'} the source removed, because other scripts still use them.`);
            }
        }

        const changedProps = !local ? [] : DATA_KEY_IMPORT_MERGED_PROPS.filter(prop => !sameImportValue((local as any)[prop], next[prop]));

        const isDifferentFromLocal = !local || (
            dataKeyToJSON(local) !== dataKeyToJSON(next as KeyWithoutOptions) ||
            !sameImportValue(local.options || [], next.options || []) ||
            DATA_KEY_IMPORT_MERGED_PROPS.some(prop => !sameImportValue((local as any)[prop], next[prop]))
        );

        return {
            ...(next as DataKey),
            id: local?.id,
            uuid: local?.uuid || uuidV4(),
            uniqueKey,
            sourceUniqueKey: k.uniqueKey,
            sourceSnapshot,
            addedOptions,
            removedOptions,
            changedProps: changedProps as string[],
            isNew: !local,
            isDifferentFromLocal,
            isReferenced: referenced.has(k.uniqueKey),
            canSave: false,
        };
    });

    parsed = parsed.map(k => ({ ...k, canSave: k.isReferenced && k.isDifferentFromLocal }));

    const parsedByLocalUniqueKey = new Map(parsed.map(k => [k.uniqueKey, k]));

    // Resolve one reference: through the key map, then (for items without a usable keyId) by name +
    // label + type, then keep a keyId this editor already knows. Never invent a dangling id.
    const resolveKeyId = (keyId: string | undefined | null, k?: KeyWithoutOptions) => {
        const mapped = mapUniqueKey(keyId);
        if (mapped) return mapped;
        const byJSON = k ? pickDataKey(parsed, k)?.uniqueKey : undefined;
        if (byJSON) return byJSON;
        if (keyId && (localByUniqueKey.has(keyId) || parsedByLocalUniqueKey.has(keyId))) return keyId;
        if (keyId) warnings.push(`Reference "${k?.label || k?.name || keyId}" points to a data key the source editor does not have; it was imported without a link.`);
        return undefined;
    };
    const remapRefs = <T extends Record<string, any>>(obj: T): T => {
        const out: Record<string, any> = { ...obj };
        KEY_REFERENCE_PROPS.forEach(p => {
            if (p === 'keyId') return;
            if (out[p]) out[p] = mapUniqueKey(out[p]) || out[p];
        });
        return out as T;
    };

    return {
        dataKeys: parsed,

        warnings: Array.from(new Set(warnings)),

        drugsLibrary: importedDrugsLibraryItems,

        nuidSearchFields: importedNuidSearchFields.map(f => remapRefs({
            ...f,
            keyId: resolveKeyId(f.keyId, { label: f.label || '', name: f.key || '', dataType: 'field' }) ?? f.keyId,
        })),

        diagnoses: importedDiagnoses.map(s => {
            const name = s.key || s.name;
            const keyId = resolveKeyId(s.keyId, { label: s.name, name, dataType: 'diagnosis' });
            return {
                ...s,
                keyId,
                symptoms: (s.symptoms || []).map(f => {
                    const name = f.key || f.name;
                    const keyId = resolveKeyId((f as any).keyId, { label: f.name, name, dataType: `diagnosis_symptom_${f.type}` });
                    return {
                        ...f,
                        keyId,
                    }
                }),
            };
        }),

        problems: importedProblems.map(s => {
            const name = s.key || s.name;
            const keyId = resolveKeyId(s.keyId, { label: s.name, name, dataType: 'problem' });
            return {
                ...s,
                keyId,
            };
        }),

        screens: importedScreens.map(s => {
            const keyId = resolveKeyId(s.keyId, { label: s.label, name: s.key, dataType: s.type }) || '';
            return remapRefs({
                ...s,
                keyId,
                fields: (s.fields || []).map(f => {
                    const keyId = resolveKeyId(f.keyId, { label: f.label, name: f.key, dataType: f.type });
                    return remapRefs({
                        ...f,
                        keyId,
                        items: (f.items || []).map(item => {
                            const keyId = resolveKeyId(item.keyId, {
                                label: item.label as string,
                                name: item.value as string,
                                dataType: 'option',
                            });
                            return {
                                ...item,
                                keyId,
                            };
                        }),
                    });
                }),
                items: (s.items || []).map(f => {
                    const name = f.key || f.id;
                    let dataType = 'option';
                    if (s.type === 'diagnosis') dataType = 'diagnosis';
                    const keyId = resolveKeyId(f.keyId, { label: f.label, name, dataType });
                    return remapRefs({
                        ...f,
                        keyId,
                    });
                }),
            });
        }),
    };
}

/** Same rules as mergeOptionKeys in lib/import-merge.ts (kept here to avoid a dependency cycle). */
function mergeImportedOptionKeys({
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
    if (additiveOnly || !base) return { options: [...target, ...added], added, removed: [] };
    const baseSet = new Set(base);
    const removed = target.filter(o => baseSet.has(o) && !sourceSet.has(o));
    const removedSet = new Set(removed);
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

export function mergeScrappedKeys(...scrappedKeys: Scrapped[][]): KeyWithOptions[] {
    // Flat pushes rather than spread-accumulating reduces: the same three
    // levels, without copying the whole accumulator once per element.
    const _scrapped: Scrapped[] = [];
    for (const keys of scrappedKeys) for (const key of keys) _scrapped.push(key);

    const parents: any[] = [];
    const children: any[] = [];
    const grandChildren: any[] = [];
    for (const entry of _scrapped) {
        if (isDataKeyValid(entry.key)) parents.push(entry.key);
        for (const child of entry.key.children || []) {
            if (isDataKeyValid(child)) children.push(child);
            for (const grandChild of child.children || []) {
                if (isDataKeyValid(grandChild)) grandChildren.push(grandChild);
            }
        }
    }

    let scrapped = [...parents, ...children, ...grandChildren] as unknown as (KeyWithoutOptions & {
        children: KeyWithoutOptions[];
    })[];

    // Every entry's options are the children of every entry that serialises the
    // same way. Grouping once replaces a full scan (with a serialisation on both
    // sides) per entry — the second-largest cost in scrapping a script.
    const childrenByJSON = new Map<string, KeyWithoutOptions[]>();
    const jsonByIndex: string[] = [];
    scrapped.forEach((k, index) => {
        const json = dataKeyToJSON(k);
        jsonByIndex[index] = json;
        const list = childrenByJSON.get(json);
        if (list) list.push(...(k.children || []));
        else childrenByJSON.set(json, [...(k.children || [])]);
    });

    const merged: (KeyWithoutOptions & {
        options: KeyWithoutOptions[];
    })[] = scrapped.map((k, index) => ({
        ...k,
        options: removeDuplicateDataKeys(childrenByJSON.get(jsonByIndex[index]) || []),
    }));

    return merged;
}
