import { _getScreens, _getDiagnoses } from "@/databases/queries/scripts";
import { _getDrugsLibraryItems } from "@/databases/queries/drugs-library";
import { _getDataKeys, DataKey } from "@/databases/queries/data-keys";
import { diagnoses } from "@/databases/pg/schema";

type Key = {
    name: string;
    label: string;
    dataType: string;
    uniqueKey?: string;
};

type Scrapped = {
    key: Key & {
        children: (Key & {
            children: Key[];
        })[];
    };
    type: 'dff' | 'diagnosis' | 'screen';
    id: string;
};

export function dataKeyToJSON(key: Key, opts?: {
    lowerCase?: boolean;
}) {
    const lowerCase = opts?.lowerCase !== false;

    let json = JSON.stringify({
        name: (key.name || '').trim(),
        label: (key.label || '').trim(),
        dataType: (key.dataType || '').trim(),
    });

    if (lowerCase) json = json.toLowerCase();

    return json;
}

export function removeDuplicateDataKeys(keys: Key[]) {
    return keys
        .filter((k, i) => keys.map(k => dataKeyToJSON(k)).indexOf(dataKeyToJSON(k)) === i);
}

export function pickDataKey(keys: Key[], key: Key) {
    const found = keys.find(k => dataKeyToJSON(k) === dataKeyToJSON(key));
    return found;
}

export async function scrapDataKeys({
    withoutUniqueKeys,
    screens = [],
    diagnoses = [],
    // drugsLibrary = [],
}: {
    withoutUniqueKeys?: boolean;
    screens?: Awaited<ReturnType<typeof _getScreens>>['data'];
    diagnoses?: Awaited<ReturnType<typeof _getDiagnoses>>['data'];
    drugsLibrary?: Awaited<ReturnType<typeof _getDrugsLibraryItems>>['data'];
}) {
    // let dffKeys: Scrapped[] = drugsLibrary.map(s => {
    //     return {
    //         id: s.itemId,
    //         type: 'dff',
    //         key: {
    //             label: s.drug,
    //             name: s.key,
    //             dataType: s.type,
    //             children: [],
    //         },
    //     }
    // });

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
                        const dataType = f.type;
                        
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
    const allKeys = removeDuplicateDataKeys(mergedKeys).filter(k => k.name) as typeof mergedKeys;

    const { data: dataKeys } = withoutUniqueKeys ? { data: [], } : await _getDataKeys({ keys: allKeys.map(({ options, ...o }) => o), });

    return {
        dataKeys,
        allKeys: allKeys.map(k => {
            const uniqueKey = pickDataKey(dataKeys as Key[], k)?.uniqueKey;
            return {
                ...k,
                uniqueKey,
                options: k.options.map(o => {
                    return {
                        ...o,
                    };
                })
            };
        }),
        // dffKeys,
        screens: linkScrappedKeysToDataKeys(dataKeys, screensKeys),
        diagnoses: linkScrappedKeysToDataKeys(dataKeys, diagnosesKeys),
    };
}

export function mergeScrappedKeys(...scrappedKeys: Scrapped[][]) {
    const scrapped = scrappedKeys.reduce((acc, keys) => [...acc, ...keys], [] as Scrapped[]);

    return scrapped.reduce((acc, { key: { children, ...k }, }) => {
        let nested2: typeof acc = [];
    
        const nested1: typeof acc = children.map(({ children, ...k }) => {
            children.forEach(k => nested2.push({
                ...k,
                options: [],
            }));

            return {
                ...k,
                options: nested2,
            };
        });

        return [
            ...acc,
            {
                ...k,
                options: nested1,
            },
            ...nested1,
            ...nested2,
        ];
    }, [] as (Key & {
        options: Key[];
    })[]);
}

export function linkScrappedKeysToDataKeys(dataKeys: DataKey[], scrappedKeys: Scrapped[]) {
    return scrappedKeys.map(k => {
        const uniqueKey = pickDataKey(dataKeys as Key[], k.key)?.uniqueKey;

        return {
            ...k,
            key: {
                ...k.key,
                uniqueKey,
                children: k.key.children.map(k => {
                    const uniqueKey = pickDataKey(dataKeys as Key[], k)?.uniqueKey;
                    return {
                        ...k,
                        uniqueKey,
                        children: k.children.map(k => {
                            const uniqueKey = pickDataKey(dataKeys as Key[], k)?.uniqueKey;
                            return {
                                ...k,
                                uniqueKey,
                            };
                        }),
                    };
                }),
            },
        };
    });
}
