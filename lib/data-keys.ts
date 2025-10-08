import { v4 as uuidV4 } from "uuid";

import { _getScreens, _getDiagnoses } from "@/databases/queries/scripts";
import { _getDrugsLibraryItems } from "@/databases/queries/drugs-library";
import { _getDataKeys, DataKey } from "@/databases/queries/data-keys";
import { diagnoses } from "@/databases/pg/schema";

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
};

export async function scrapDataKeys({
    screens = [],
    diagnoses = [],
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
    const scrappedKeys = removeDuplicateDataKeys(mergedKeys).filter(k => k.name) as typeof mergedKeys;

    return linkScrappedKeysToDataKeys({ scrappedKeys, });
}

export async function linkScrappedKeysToDataKeys({ scrappedKeys, importedDataKeys = [], }: {
    scrappedKeys: KeyWithOptions[];
    importedDataKeys?: ScrapDataKeysParams['importedDataKeys'];
}) {
    const { data: dataKeys, } = await _getDataKeys({ keys: scrappedKeys.map(({ options, ...o }) => o), });

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

export function mergeScrappedKeys(...scrappedKeys: Scrapped[][]): KeyWithOptions[] {
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
    }, [] as (KeyWithoutOptions & {
        options: KeyWithoutOptions[];
    })[]);
}
