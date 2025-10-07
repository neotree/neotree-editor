import readline from "node:readline";
import { and, eq, inArray, } from "drizzle-orm";
import queryString from "query-string";

import '@/server/env';
import db from '@/databases/pg/drizzle';
import * as schema from '@/databases/pg/schema';
import { _getDiagnoses, _getScreens } from '@/databases/queries/scripts';
import { _getDataKeys } from "@/databases/queries/data-keys";
import { _saveDiagnoses, _saveScreens, } from "@/databases/mutations/scripts";
import { _saveDataKeys, } from '@/databases/mutations/data-keys';
import { getScriptsWithItems } from "@/app/actions/scripts";
import { getSiteAxiosClient } from "@/lib/server/axios";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const scripts = {
    mwi: [
        'c04f628d-3d1a-46f1-8d9a-14c203a45463',
        'e6b6c37c-7583-440b-8f7e-eea62cd951df',
        '1a911540-24ad-4220-8745-1fdb83246427',
        '1a911540-24ad-4220-8745-1fdb83246427',
        '0dd4ab66-b693-49b1-8363-5a4d5beeee8c',
        'c06d63a4-0da4-463e-9024-422a10a5d19b',
        '2173593d-8ac3-4c67-a880-8390728279bb',
        '0acf7627-ef74-4dc0-8c74-f51fc5b9a4ad',
    ],
    zw: [
        'c021e05a-a562-48b0-b495-34529ee51d0a',
        '3b953d22-8a46-45bc-8234-9521334221a3',
        '21940a83-8d97-41d1-a0ec-5dad7fb2f3db',
        '7c4f5b8f-ed1f-4e6e-8bce-bf3978e410a6',
        'fea2c220-f9dc-4363-a35f-13b2b4bfed26',
        'afa5984e-c07d-4025-8150-de25bb37144a',
        '0cbb1921-c1b3-4a4c-a516-45397e01a801',
        '488c51f9-9f75-4dcf-a527-aed0ae16e9b6',
        'e06666f2-2147-4391-86a2-160d86d3b72b',
        '910a2d2f-df69-4917-b0cf-d275d511bb3e',
        '678cbcfd-37df-42c3-96bf-c290dfa3ec69',
        '5e72aa19-79d3-4676-9435-c5759d762e5a',
        '7ff273e5-b9b5-4a8f-9df9-d198bf0af13b',
        '9dabc437-635e-431f-bded-6eee128e0249',
        '5bb6430c-eb0e-4afe-a44d-1aae3b00f7b3',
    ],
    demo: [],
};

main();

async function main() {
    try {
        const country = await askQuestion<keyof typeof scripts>('Country:\n> ');

        if (!scripts[country]) {
            console.error(`Invalid country. Expecting ${Object.keys(scripts).join(' or ')}`);
            return;
        }

        const actions = {
            1: {
                prompt: '[1]: processDataKeysRefs',
                fn: () => processDataKeysRefs(),
            },
            2: {
                prompt: '[2]: processDatakeysOptions',
                fn: () => processDatakeysOptions(),
            },
            3: {
                prompt: '[3]: processChecklistDatakeys',
                fn: () => processChecklistDatakeys(country),
            },
        };

        const action = await askQuestion<keyof typeof actions>(Object.values(actions).map(a => a.prompt).join('\n') + '\n> ');

        if (!actions[action]) {
            console.error(`Invalid country. Expecting ${Object.keys(actions).join(' or ')}`);
            return;
        }

        await actions[action].fn();
    } catch(e: any) {
        console.error('ERROR:');
        console.error(e);
    } finally {
        process.exit();
    }
}

function askQuestion<T = string>(question: string) {
    return new Promise<T>((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer as T);
        });
    });
}

async function loadData(country: keyof typeof scripts) {
    console.log(`Fetching ${country} sites`);
    const sites = await db.query.sites.findMany({
        where: and(
            eq(schema.sites.countryISO, country),
            eq(schema.sites.type, 'webeditor'),
        ),
    });

    console.log(`Found ${sites.length} sites. Fetching data...`);
    let screens: Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0]['screens'] = [];
    let diagnoses: Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0]['diagnoses'] = [];
    let drugsLibrary: Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0]['drugsLibrary'] = [];

    for (const site of sites) {
        // if (site.link === 'https://zim-webeditor.neotree.org:10243') continue;

        const axiosClient = await getSiteAxiosClient(site.siteId);

        const res = await axiosClient.get<Awaited<ReturnType<typeof getScriptsWithItems>>>('/api/scripts/with-items?' + queryString.stringify({
            scriptsIds: !scripts[country].length ? undefined : JSON.stringify(scripts[country]),
        }));

        res.data.data.forEach(s => {
            screens = [...screens, ...s.screens];
            diagnoses = [...diagnoses, ...s.diagnoses];
            drugsLibrary = [...drugsLibrary, ...s.drugsLibrary];
        });
    }

    return {
        screens,
        diagnoses,
        drugsLibrary,
    };
}

async function processChecklistDatakeys(country: keyof typeof scripts) {
    try {
        const { screens, } = await loadData(country);

        const checklistScreens = screens.filter(s => s.refIdDataKey).filter(s => s.type === 'checklist');

        const checklistRefIdDataKeys = checklistScreens.map(s => s.refIdDataKey).filter(s => s);

        const { data: checkListDataKeys, } = !checklistRefIdDataKeys.length ? { data: [], } : await _getDataKeys({
            uniqueKeys: checklistRefIdDataKeys,
        });

        console.log('checklist datakeys...');
        if (checkListDataKeys.length) {
            await db.insert(schema.dataKeysDrafts).values(checkListDataKeys.map(k => {
                let options: string[] = [];

                checklistScreens.forEach(s => {
                    if (s.refIdDataKey === k.uniqueKey) {
                        (s.items || []).filter(item => item.keyId).forEach(item => options.push(item.keyId!));
                    }
                });

                options = options.filter((o, i) => options.indexOf(o) === i);

                return {
                    data: {
                        ...k,
                        dataType: 'checklist',
                        options,
                    },
                    uuid: k.uuid,
                    dataKeyId: k.uuid,
                    name: k.name,
                    uniqueKey: k.uniqueKey,
                };
            }));
        }

        console.log('checklist screens...');
        if (checklistScreens.length) {
            await db.insert(schema.screensDrafts).values(checklistScreens
                .filter(s => checkListDataKeys.find(k => k.uniqueKey === s.refIdDataKey))
                .map(s => {
                    const dataKey = checkListDataKeys.find(k => k.uniqueKey === s.refIdDataKey)!;
                    return {
                        data: {
                            ...s,
                            key: dataKey.name,
                            label: dataKey.label,
                            keyId: dataKey.uniqueKey,
                        },
                        type: s.type,
                        scriptId: s.scriptId,
                        screenId: s.screenId,
                        screenDraftId: s.screenId,
                        title: s.title,
                        position: s.position,
                    };
                }));
        }
    } catch(e: any) {
        console.error('ERROR:');
        console.error(e);
    } finally {
        process.exit();
    }
}

async function processDatakeysOptions() {
    try {
        const { data: screens, } = await _getScreens();

        const { data: dataKeysArr, } = await _getDataKeys();

        let dataKeys: (typeof dataKeysArr[0] & { updated?: boolean; opts?: string[]; })[] = dataKeysArr;

        screens.forEach(s => {
            const dataKeyIndex = !s.keyId ? -1 : dataKeys.map(k => k.uniqueKey).indexOf(s.keyId);

            if (dataKeys[dataKeyIndex]) {
                if (!dataKeys[dataKeyIndex].opts) dataKeys[dataKeyIndex].opts = [...dataKeys[dataKeyIndex].options];
                dataKeys[dataKeyIndex].updated = true;
                dataKeys[dataKeyIndex].options = [
                    ...dataKeys[dataKeyIndex].options,
                    ...s.items.filter(item => item.keyId).map(item => item.keyId!),
                    ...s.fields.filter(item => item.keyId).map(item => item.keyId!),
                ];
            }

            s.fields.map(item => {
                const dataKeyIndex = !item.keyId ? -1 : dataKeys.map(k => k.uniqueKey).indexOf(item.keyId);

                if (dataKeys[dataKeyIndex]) {
                    if (!dataKeys[dataKeyIndex].opts) dataKeys[dataKeyIndex].opts = [...dataKeys[dataKeyIndex].options];
                    dataKeys[dataKeyIndex].updated = true;
                    dataKeys[dataKeyIndex].options = [
                        ...dataKeys[dataKeyIndex].options,
                        ...(item.items || []).filter(item => item.keyId).map(item => item.keyId!),
                    ];
                } 
            });
        });

        dataKeys = dataKeys
            .filter(k => !!k.options.length)
            .filter(k => JSON.stringify(k.opts || []) !== JSON.stringify(k.options || []))
            .filter(k => k.updated).map(({ updated, ...k }) => ({
                ...k,
                options: k.options.filter((o, i) => k.options.indexOf(o) === i),
            }));

        console.log('datakeys options...');
        if (dataKeys.length) {
            await db.insert(schema.dataKeysDrafts).values(dataKeys.map(k => ({
                data: k,
                uuid: k.uuid,
                dataKeyId: k.uuid,
                name: k.name,
                uniqueKey: k.uniqueKey,
            })));
        }
    } catch(e: any) {
        console.error('ERROR:');
        console.error(e);
    } finally {
        process.exit();
    }
}

async function processDataKeysRefs() {
    try {
        const dataKeysRes = await _getDataKeys();

        let dataKeys = dataKeysRes.data;

        const getDataKeyUniqueKey = (data: {
            name: string;
            label: string;
            dataType: string;
        }) => {
            const uniqueKey = dataKeys.find(k => JSON.stringify({
                name: `${k.name || ''}`.trim(),
                label: `${k.label || ''}`.trim(),
                dataType: `${k.dataType || ''}`,
            }).toLowerCase() === JSON.stringify({
                name: `${data.name || ''}`.trim(),
                label: `${data.label || ''}`.trim(),
                dataType: `${data.dataType || ''}`,
            }).toLowerCase())?.uniqueKey;

            // console.log(uniqueKey, data);

            return uniqueKey;
        };

        const keysMap: Record<string, typeof dataKeys[0]> = {};
        const duplicates: Record<string, string> = {};

        dataKeys.forEach(k => {
            const key = JSON.stringify({
                name: `${k.name || ''}`.trim(),
                label: `${k.label || ''}`.trim(),
                dataType: `${k.dataType || ''}`,
            }).toLowerCase();

            if (keysMap[key]) {
                duplicates[k.uniqueKey] = keysMap[key].uniqueKey;
                k.options.forEach(o => {
                    if (!keysMap[key].options.includes(o)) {
                        keysMap[key].options.push(o);
                    }
                })
            }

            keysMap[key] = k;
        });

        dataKeys = Object.values(keysMap);

        const deleteUniqueKeys = Object.keys(duplicates);

        const updates = dataKeys.filter(k => k.options.find(o => duplicates[o]))
            .map(k => {
                let options = k.options.map(o => duplicates[o] || o);
                options = options.filter((o, i) => options.indexOf(o) === i);
                return {
                    ...k,
                    options,
                };
            });

        console.log({
            updates: updates.length,
            deletes: deleteUniqueKeys.length,
            withDuplicates: dataKeysRes.data.length,
            noDuplicates: dataKeys.length,
        });

        if (updates.length) await _saveDataKeys({ data: updates, });

        if (deleteUniqueKeys.length) await db.delete(schema.dataKeys).where(inArray(schema.dataKeys.uniqueKey, deleteUniqueKeys));

        const res = await getScriptsWithItems({});

        let scripts = res.data;

        console.log('scripts.length', scripts.length);

        // scripts = scripts.map(({ screens, diagnoses, ...script }) => {
        //     return {
        //         ...script,

        //         diagnoses: diagnoses.map(d => {
        //             const name = d.key || d.name || '';
        //             const keyId = getDataKeyUniqueKey({
        //                 name,
        //                 label: d.name || '',
        //                 dataType: 'diagnosis',
        //             });

        //             return {
        //                 ...d,
        //                 key: name,
        //                 keyId: keyId || '',
        //                 symptoms: (d.symptoms || []).map(item => {
        //                     const keyId = getDataKeyUniqueKey({
        //                         name: item.name || '',
        //                         label: item.name || '',
        //                         dataType: `diagnosis_symptom_${item.type}`,
        //                     });
        //                     return {
        //                         ...item,
        //                         keyId: keyId,
        //                     };
        //                 }),
        //             };
        //         }),

        //         screens: screens.map(s => {
        //             const refIdDataKey = !s.refId ? undefined : getDataKeyUniqueKey({
        //                 name: s.refId || '',
        //                 label: s.refId || '',
        //                 dataType: 'ref_id',
        //             });

        //             const keyId = getDataKeyUniqueKey({
        //                 name: s.key || '',
        //                 label: s.label || '',
        //                 dataType: 'diagnosis',
        //             });

        //             return {
        //                 ...s,
        //                 refIdDataKey: refIdDataKey || '',
        //                 keyId: keyId || '',
        //                 items: s.items.map(f => {
        //                     let dataType = `${s.type}_option`;
        //                     if (['diagnosis'].includes(s.type)) dataType = s.type;

        //                     const keyId = getDataKeyUniqueKey({
        //                         name: f.key || f.id,
        //                         label: f.label || '',
        //                         dataType: dataType,
        //                     });

        //                     return {
        //                         ...f,
        //                         keyId: keyId || '',
        //                     };
        //                 }),

        //                 fields: s.fields.map(f => {
        //                     let dataType = `${f.type}`;

        //                     const keyId = getDataKeyUniqueKey({
        //                         name: f.key,
        //                         label: f.label || '',
        //                         dataType: dataType,
        //                     });
                            
        //                     return {
        //                         ...f,
        //                         keyId: keyId || '',
        //                         items: (f.items || []).map(f => {
        //                             const keyId = getDataKeyUniqueKey({
        //                                 name: f.value as string,
        //                                 label: `${f.label || ''}`,
        //                                 dataType: `${dataType}_option`,
        //                             });

        //                             return {
        //                                 ...f,
        //                                 keyId: keyId || '',
        //                             };
        //                         }),
        //                     };
        //                 }),
        //             };
        //         }),
        //     };
        // });

        for (const s of scripts) {
            console.log('Saving script: ' + s.title + '...');

            const diagnoses = s.diagnoses.map(d => {
                const name = d.key || d.name || '';
                const keyId = getDataKeyUniqueKey({
                    name,
                    label: d.name || '',
                    dataType: 'diagnosis',
                });

                return {
                    ...d,
                    key: name,
                    keyId: keyId || '',
                    symptoms: (d.symptoms || []).map(item => {
                        const keyId = getDataKeyUniqueKey({
                            name: item.name || '',
                            label: item.name || '',
                            dataType: `diagnosis_symptom_${item.type}`,
                        });
                        return {
                            ...item,
                            keyId: keyId,
                        };
                    }),
                };
            });

            const screens = s.screens.map(s => {
                const refIdDataKey = !s.refId ? undefined : getDataKeyUniqueKey({
                    name: s.refId || '',
                    label: s.refId || '',
                    dataType: 'ref_id',
                });

                const keyId = getDataKeyUniqueKey({
                    name: s.key || '',
                    label: s.label || '',
                    dataType: s.type,
                });

                return {
                    ...s,
                    refIdDataKey: refIdDataKey || '',
                    keyId: keyId || '',
                    items: s.items.map(f => {
                        let dataType = `${s.type}_option`;
                        if (['diagnosis'].includes(s.type)) dataType = s.type;

                        const keyId = getDataKeyUniqueKey({
                            name: f.key || f.id,
                            label: f.label || '',
                            dataType: dataType,
                        });

                        return {
                            ...f,
                            keyId: keyId || '',
                        };
                    }),

                    fields: s.fields.map(f => {
                        let dataType = `${f.type}`;

                        const keyId = getDataKeyUniqueKey({
                            name: f.key,
                            label: f.label || '',
                            dataType: dataType,
                        });
                        
                        return {
                            ...f,
                            keyId: keyId || '',
                            items: (f.items || []).map(f => {
                                const keyId = getDataKeyUniqueKey({
                                    name: f.value as string,
                                    label: `${f.label || ''}`,
                                    dataType: `${dataType}_option`,
                                });

                                return {
                                    ...f,
                                    keyId: keyId || '',
                                };
                            }),
                        };
                    }),
                };
            });
            
            await _saveDiagnoses({ data: diagnoses, });
            await _saveScreens({ data: screens, });
        }
    } catch(e: any) {
        console.error('ERROR:');
        console.error(e);
    } finally {
        process.exit();
    }
}
