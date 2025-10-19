import { v4 as uuidV4 } from "uuid";

import { _getScreens, _getDiagnoses } from "@/databases/queries/scripts";
import { _getDrugsLibraryItems } from "@/databases/queries/drugs-library";
import { _getDataKeys, DataKey } from "@/databases/queries/data-keys";
import { diagnoses, drugsLibrary } from "@/databases/pg/schema";

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
    type: 'dff' | 'diagnosis' | 'screen';
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
    let json = JSON.stringify(getDataKeysQueryFields([key])[0]);
    if (lowerCase) json = json.toLowerCase();
    return json;
}

export function removeDuplicateDataKeys(keys: KeyWithoutOptions[]) {
    return keys
        .filter((k, i) => keys.map(k => dataKeyToJSON(k)).indexOf(dataKeyToJSON(k)) === i);
}

export function pickDataKey(keys: (KeyWithoutOptions & { options: string[]; })[], key: KeyWithoutOptions) {
    const found = keys.find(k => dataKeyToJSON(k) === dataKeyToJSON(key));
    return found;
}

type ScrapDataKeysParams = {
    screens?: Awaited<ReturnType<typeof _getScreens>>['data'];
    diagnoses?: Awaited<ReturnType<typeof _getDiagnoses>>['data'];
    drugsLibrary?: Awaited<ReturnType<typeof _getDrugsLibraryItems>>['data'];
    importedDataKeys?: Awaited<ReturnType<typeof _getDataKeys>>['data'];
    dataKeys?: Awaited<ReturnType<typeof _getDataKeys>>['data'];
    linkScrappedToDataKeys?: boolean;
};

export async function scrapDataKeys({
    screens = [],
    diagnoses = [],
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

    let screensKeys: Scrapped[] = screens.map(s => {
        let dataType = s.type;

        return {
            id: s.screenId,
            type: 'screen',
            key: {
                name: s.key,
                label: s.label,
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
                                    dataType: `${dataType}_option`,
                                };
                            }),
                        };
                    }),

                    ...(s.items || []).map(f => {
                        const name = f.key || f.id;

                        let _dataType = `${dataType}_option`;

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

    const mergedKeys = mergeScrappedKeys(diagnosesKeys, screensKeys);
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

    return scrappedKeys.map(k => {
        const imported = pickDataKey(importedDataKeys, k) as DataKey;

        if (imported) console.log(imported.name);

        const options = imported?.options || k.options
            .map(o => {
                const { uniqueKey, uuid, } = { ...scrappedKeys.find(k => dataKeyToJSON(k) === dataKeyToJSON(o)), };
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
    importedDrugsLibraryItems = [],
}: {
    localDataKeys: Awaited<ReturnType<typeof _getDataKeys>>['data'];
    importedDataKeys: DataKey[];
    importedScrappedKeys: Awaited<ReturnType<typeof scrapDataKeys>>;
    importedScreens?: Awaited<ReturnType<typeof _getScreens>>['data'];
    importedDiagnoses?: Awaited<ReturnType<typeof _getDiagnoses>>['data'];
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
                                dataType: `${dataType}_option`,
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
                    let dataType = `${s.type}_option`;
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
    const scrapped = scrappedKeys.reduce((acc, keys) => [...acc, ...keys], [] as Scrapped[]);

    return scrapped.reduce((acc, { key: { children, ...k }, }) => {
        let nested2: typeof acc = [];
    
        const nested1: typeof acc = children.filter(k => isDataKeyValid(k)).map(({ children, ...k }) => {
            children.forEach(k => {
                if (isDataKeyValid(k)) {
                    nested2.push({
                        ...k,
                        options: [],
                    });
                }
            });

            return {
                ...k,
                options: nested2,
            };
        });

        return [
            ...acc,
            ...(!isDataKeyValid(k) ? [] : [{
                ...k,
                options: nested1,
            }]),
            ...nested1,
            ...nested2,
        ];
    }, [] as (KeyWithoutOptions & {
        options: KeyWithoutOptions[];
    })[]);
}
