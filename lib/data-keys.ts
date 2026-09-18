import { v4 as uuidV4 } from "uuid";

import { _getScreens, _getDiagnoses, _getProblems } from "@/databases/queries/scripts";
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
    type: 'dff' | 'diagnosis' | 'screen' | 'problem';
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
    screens?: Awaited<ReturnType<typeof _getScreens>>['data'];
    diagnoses?: Awaited<ReturnType<typeof _getDiagnoses>>['data'];
    problems?: Awaited<ReturnType<typeof _getProblems>>['data'];
    drugsLibrary?: Awaited<ReturnType<typeof _getDrugsLibraryItems>>['data'];
    importedDataKeys?: Awaited<ReturnType<typeof _getDataKeys>>['data'];
    dataKeys?: Awaited<ReturnType<typeof _getDataKeys>>['data'];
    linkScrappedToDataKeys?: boolean;
};

export async function scrapDataKeys({
    screens = [],
    diagnoses = [],
    problems = [],
    dataKeys: dataKeysParam,
    linkScrappedToDataKeys = true,
}: ScrapDataKeysParams) {
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

    const mergedKeys = mergeScrappedKeys(diagnosesKeys, problemsKeys, screensKeys);
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

        if (imported) console.log(imported.name);

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

export async function parseImportedDataKeys({ 
    localDataKeys = [],
    importedScrappedKeys = [], 
    importedDataKeys = [], 
    importedScreens = [],
    importedDiagnoses = [],
    importedProblems = [],
    importedDrugsLibraryItems = [],
}: {
    localDataKeys: Awaited<ReturnType<typeof _getDataKeys>>['data'];
    importedDataKeys: DataKey[];
    importedScrappedKeys: Awaited<ReturnType<typeof scrapDataKeys>>;
    importedScreens?: Awaited<ReturnType<typeof _getScreens>>['data'];
    importedDiagnoses?: Awaited<ReturnType<typeof _getDiagnoses>>['data'];
    importedProblems?: Awaited<ReturnType<typeof _getProblems>>['data'];
    importedDrugsLibraryItems?: Awaited<ReturnType<typeof _getDrugsLibraryItems>>['data'];
}) {
    const importedUniqueIdDataKeyMap: Record<string, DataKey> = {};
    const importedUniqueIdNewIdsMap: Record<string, {
        id?: number;
        uuid: string;
        uniqueKey: string;
    }> = {};
    
    importedDataKeys.forEach(k => {
        const localDataKey = localDataKeys.find(lk => lk.uniqueKey === k.uniqueKey);
        importedUniqueIdDataKeyMap[k.uniqueKey] = k;
        importedUniqueIdNewIdsMap[k.uniqueKey] = {
            id: localDataKey?.id,
            uniqueKey: localDataKey?.uniqueKey || k.uniqueKey || uuidV4(), // TODO: Deleted keys might cause duplicate issue!!!
            uuid: localDataKey?.uuid || uuidV4(),
        };
    });

    localDataKeys = localDataKeys.map(k => ({
        ...k,
        options: k.options.filter(o => importedUniqueIdDataKeyMap[o]),
    }));

    let parsed = importedDataKeys.map(k => {
        const key = importedUniqueIdNewIdsMap[k.uniqueKey];
        const localDataKey = localDataKeys.find(lk => lk.uniqueKey === k.uniqueKey);
        return {
            ...k,
            id: key.id,
            uniqueKey: key.uniqueKey,
            uuid: key.uuid,
            isDifferentFromLocal: false,
            canSave: false,
            isNew: !localDataKey,
            options: k.options.filter(o => importedUniqueIdDataKeyMap[o]).map(o => {
                const key = importedUniqueIdDataKeyMap[o];
                return importedUniqueIdNewIdsMap[key.uniqueKey].uniqueKey;
            }),
        };
    });

    parsed = parsed.map(k => {
        const localDataKey = localDataKeys.find(lk => lk.uniqueKey === k.uniqueKey);

        const isDifferentFromLocal = !localDataKey || (
            localDataKey &&
            (
                (dataKeyToJSON(localDataKey) !== dataKeyToJSON(k)) ||
                (localDataKey.options.length !== k.options.length) ||
                !!localDataKey.options.find((o, i) => k.options.indexOf(o) !== i)
            )
        );

        let isScrapped = !!importedScrappedKeys.find(sk => dataKeyToJSON(sk) === dataKeyToJSON(k));

        return {
            ...k,
            isDifferentFromLocal,
            canSave: isScrapped && isDifferentFromLocal,
        };
    });

    parsed = parsed.map(k => {
        let canSave = k.canSave;
        if (k.isDifferentFromLocal) {
            parsed.forEach(k2 => {
                if (k2.canSave) {
                    canSave = canSave || k2.options.includes(k.uniqueKey);
                }
            });
        }
        return {
            ...k,
            canSave,
        };
    });

    return {
        dataKeys: parsed,

        drugsLibrary: importedDrugsLibraryItems,

        diagnoses: importedDiagnoses.map(s => {
            const name = s.key || s.name;
            const k = {
                label: s.name,
                name,
                dataType: 'diagnosis',
            }; 
            const keyId = pickDataKey(parsed, k)?.uniqueKey;
            return {
                ...s,
                keyId,
                symptoms: (s.symptoms || []).map(f => {
                    const name = f.key || f.name;
                    const k = {
                        label: f.name,
                        name,
                        dataType: `diagnosis_symptom_${f.type}`,
                    };
                    const keyId = pickDataKey(parsed, k)?.uniqueKey;
                    return {
                        ...f,
                        keyId,
                    }
                }),
            };
        }),

        problems: importedProblems.map(s => {
            const name = s.key || s.name;
            const k = {
                label: s.name,
                name,
                dataType: 'problem',
            }; 
            const keyId = pickDataKey(parsed, k)?.uniqueKey;
            return {
                ...s,
                keyId,
            };
        }),

        screens: importedScreens.map(s => {
            const k = {
                label: s.label,
                name: s.key,
                dataType: s.type,
            }; 
            const keyId = pickDataKey(parsed, k)?.uniqueKey || '';
            return {
                ...s,
                keyId,
                fields: (s.fields || []).map(f => {
                    const dataType = f.type;
                    const k = {
                        label: f.label,
                        name: f.key,
                        dataType,
                    };
                    const keyId = pickDataKey(parsed, k)?.uniqueKey;
                    return {
                        ...f,
                        keyId,
                        items: (f.items || []).map(item => {
                            const k = {
                                label: item.label as string,
                                name: item.value as string,
                                dataType: 'option',
                            };
                            const keyId = pickDataKey(parsed, k)?.uniqueKey;
                            return {
                                ...item,
                                keyId,
                            };
                        }),
                    };
                }),
                items: (s.items || []).map(f => {
                    const name = f.key || f.id;
                    let dataType = 'option';
                    if (s.type === 'diagnosis') dataType = 'diagnosis';
                    const k = {
                        label: f.label,
                        name,
                        dataType,
                    };
                    const keyId = pickDataKey(parsed, k)?.uniqueKey;
                    return {
                        ...f,
                        keyId,
                    };
                }),
            };
        }),
    };
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
