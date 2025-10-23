import readline from "node:readline";
import { and, eq, inArray, } from "drizzle-orm";
import queryString from "query-string";
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import '@/server/env';
import db from '@/databases/pg/drizzle';
import * as schema from '@/databases/pg/schema';
import { _getDiagnoses, _getScreens } from '@/databases/queries/scripts';
import { _getDataKeys } from "@/databases/queries/data-keys";
import { _saveDiagnoses, _saveScreens, } from "@/databases/mutations/scripts";
import { _saveDataKeys, } from '@/databases/mutations/data-keys';
import { getScriptsWithItems } from "@/app/actions/scripts";
import { getSiteAxiosClient } from "@/lib/server/axios";
import { _getDrugsLibraryItems } from "@/databases/queries/drugs-library";
import { pickDataKey, removeDuplicateDataKeys, scrapDataKeys } from "@/lib/data-keys";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const scripts = {
    mwi: [
        "c04f628d-3d1a-46f1-8d9a-14c203a45463",
        "e6b6c37c-7583-440b-8f7e-eea62cd951df",
        "1a911540-24ad-4220-8745-1fdb83246427",
        "1a911540-24ad-4220-8745-1fdb83246427",
        "eab27110-4dc2-40e7-b727-c1ce89ea309e",
        "465d856a-848f-4026-aff5-f1bdea5c2425",
        "0dd4ab66-b693-49b1-8363-5a4d5beeee8c",
        "c06d63a4-0da4-463e-9024-422a10a5d19b",
        "2173593d-8ac3-4c67-a880-8390728279bb",
        "8069ef0c-3a82-4e7d-a6ec-65e1c3c61613",
        "114f7783-17f9-421c-8b25-8f7b561326f7",
        "a5085256-3514-4be3-bf40-56074cd92e3f",
        "e3229f44-97b5-44c0-9076-5eafa8faa41a",
        "d2e60f94-65d9-4327-9c18-a6e851dd3982",
        "4edb44c1-6668-4c45-9b85-80dd74ccf6b7",
    ],
    zw: [
        "c021e05a-a562-48b0-b495-34529ee51d0a",
        "3b953d22-8a46-45bc-8234-9521334221a3",
        "fea2c220-f9dc-4363-a35f-13b2b4bfed26",
        "b1087e17-2ca7-4fe7-a236-885170cdc494",
        "afa5984e-c07d-4025-8150-de25bb37144a",
        "0cbb1921-c1b3-4a4c-a516-45397e01a801",
        "488c51f9-9f75-4dcf-a527-aed0ae16e9b6",
        "e06666f2-2147-4391-86a2-160d86d3b72b",
        "910a2d2f-df69-4917-b0cf-d275d511bb3e",
        "14c6ad83-7acf-43c8-9896-8d4d6909496b",
        "678cbcfd-37df-42c3-96bf-c290dfa3ec69",
        "5e72aa19-79d3-4676-9435-c5759d762e5a",
        "7ff273e5-b9b5-4a8f-9df9-d198bf0af13b",
        "9dabc437-635e-431f-bded-6eee128e0249",
        "f715e123-3cd0-49ac-8e45-45ab5db72942",
        "df3b51f5-b0a2-4992-92c4-adcab0455e99",
        "7c4f5b8f-ed1f-4e6e-8bce-bf3978e410a6",
        "2255bdb2-8eba-466c-991f-c02c1f5ed719",
    ],
    demo: [],
};

main();

async function main() {
    try {
        const action = await promptAction();
        await action?.fn();
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

async function promptCountry() {
    const selectedCountry = await askQuestion(
        'Select country: \n' +
        Object.keys(scripts).map((c, i) => `[${i + 1}]: ${c}`).join('\n') + '\n> '
    );

    const country = Object.keys(scripts)[Number(selectedCountry) - 1] as keyof typeof scripts;

    if (!scripts[country]) {
        console.error(`Invalid country. Expecting ${Object.keys(scripts).join(' or ')}`);
        process.exit(0);
    }

    return country;
}

async function promptSource() {
    const sources = {
        '1': '[1]: Local',
        '2': '[2]: Remote',
    };

    const source = await askQuestion<keyof typeof sources>(Object.values(sources).map((s) => s).join('\n') + '\n> ');

    if (!sources[source]) {
        console.error(`Invalid source. Expecting ${Object.keys(sources).join(' or ')}`);
        process.exit(0);
    }

    return source;
}

async function promptAction() {
    const actions = {
        '1': {
            prompt: '[1]: processDataKeysRefs',
            fn: () => processDataKeysRefs(),
        },
        '2': {
            prompt: '[2]: processDatakeysOptions',
            fn: () => processDatakeysOptions(),
        },
        '3': {
            prompt: '[3]: resetDataKeys',
            fn: () => resetDataKeys(),
        },
        '4': {
            prompt: '[4]: sanitizeDataKeys',
            fn: () => sanitizeDataKeys(),
        },
        '5': {
            prompt: '[5]: initialiseDataKeys',
            fn: () => initialiseDataKeys(),
        },

        '6': {
            prompt: '[6]: resetProdDataKeys',
            fn: () => resetProdDataKeys(),
        },
    };

    const action = await askQuestion<keyof typeof actions>(Object.values(actions).map(a => a.prompt).join('\n') + '\n> ');

    if (!actions[action]) {
        console.error(`Invalid action. Expecting ${Object.keys(actions).join(' or ')}`);
        process.exit(0);
    }

    return actions[action];
}

async function loadData(opts?: {
    env?: typeof schema.sites.$inferSelect['env'];
    country?: Awaited<ReturnType<typeof promptCountry>>;
    exclude?: ('screens' | 'diagnoses' | 'dff' | 'data-keys')[];
}) {
    const exclude = opts?.exclude || [];
    const country = opts?.country || await promptCountry();
    const source = await promptSource();

    let screens: Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0]['screens'] = [];
    let diagnoses: Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0]['diagnoses'] = [];
    let drugsLibrary: Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0]['drugsLibrary'] = [];
    let dataKeys: Awaited<ReturnType<typeof _getDataKeys>>['data'] = [];

    if (source === '1') {
         const { data: screensData, } = exclude.includes('screens') ? { data: [], } : await _getScreens();
         const { data: diagnosesData, } = exclude.includes('diagnoses') ? { data: [], } : await _getDiagnoses();
         const { data: drugsLibraryData, } = exclude.includes('dff') ? { data: [], } : await _getDrugsLibraryItems();
         const { data: dataKeysData, } = exclude.includes('data-keys') ? { data: [], } : await _getDataKeys();

        screens = screensData;
        diagnoses = diagnosesData;
        drugsLibrary = drugsLibraryData;
        dataKeys = dataKeysData;
    } 
    
    if (source === '2') {
        console.log(`Fetching ${country} sites`);
        const sites = await db.query.sites.findMany({
            where: and(
                eq(schema.sites.countryISO, country),
                eq(schema.sites.type, 'webeditor'),
                !opts?.env ? undefined : eq(schema.sites.env, opts?.env),
            ),
        });

        console.log(`Found ${sites.length} sites. Fetching data...`);

        for (const site of sites) {
            // if (site.link === 'https://zim-webeditor.neotree.org:10243') continue;

            const axiosClient = await getSiteAxiosClient(site.siteId);

            const { data: dataKeysRes, } = exclude.includes('data-keys') ? 
                { data: { data: [], }, } 
                :
                await axiosClient.get<Awaited<ReturnType<typeof _getDataKeys>>>('/api/data-keys');
            dataKeys = dataKeysRes.data;

            const res = (
                exclude.includes('screens') ||
                exclude.includes('diagnoses') ||
                exclude.includes('dff')
            ) ? 
                { data: { data: [], }, } 
                : 
                await axiosClient.get<Awaited<ReturnType<typeof getScriptsWithItems>>>('/api/scripts/with-items?' + queryString.stringify({
                    scriptsIds: !scripts[country].length ? undefined : JSON.stringify(scripts[country]),
                }));

            res.data.data.forEach(s => {
                screens = [...screens, ...s.screens];
                diagnoses = [...diagnoses, ...s.diagnoses];
                drugsLibrary = [...drugsLibrary, ...s.drugsLibrary];
            });
        }
    }

    return {
        country,
        screens,
        diagnoses,
        drugsLibrary,
        dataKeys,
    };
}

async function resetDataKeys() {
    try {
        const { screens, diagnoses, drugsLibrary, dataKeys, } = await loadData();

        let scrappedKeys = await scrapDataKeys({
            dataKeys,
            screens,
            diagnoses,
            drugsLibrary,
        });

        scrappedKeys = removeDuplicateDataKeys([
            ...scrappedKeys,
            // ...(dataKeys.map(k => ({
            //     uuid: k.uuid,
            //     uniqueKey: k.uniqueKey,
            //     name: k.name,
            //     label: k.label,
            //     options: k.options,
            //     dataType: k.dataType,
            // })) satisfies typeof scrappedKeys),
        ]) as typeof scrappedKeys;

        await db.delete(schema.dataKeysHistory);
        await db.delete(schema.dataKeysDrafts);
        await db.delete(schema.dataKeys);

        await _saveDataKeys({
            updateRefs: false,
            data: scrappedKeys,
        });
    } catch(e: any) {
        console.error('ERROR:');
        console.error(e);
    } finally {
        process.exit();
    }
}

async function resetProdDataKeys() {
    const { dataKeys, } = await loadData({ env: 'stage', });

    await db.delete(schema.dataKeysHistory);
    await db.delete(schema.dataKeysDrafts);
    await db.delete(schema.dataKeys);

    await _saveDataKeys({
        updateRefs: false,
        data: dataKeys.map(k => ({
            uuid: k.uuid,
            uniqueKey: k.uniqueKey,
            name: k.name,
            label: k.label,
            options: k.options,
            dataType: k.dataType,
        })),
    });

    await processDataKeysRefs();
}

async function initialiseDataKeys() {
    try {
        const { diagnoses, screens, drugsLibrary, country, } = await loadData();

        let dataKeys: Awaited<ReturnType<typeof loadData>>['dataKeys'] = [];

        if (country !== 'zw') dataKeys = (await loadData({ country: 'zw', env: 'stage', exclude: ['screens', 'diagnoses', 'dff'], })).dataKeys;

        if (country === 'demo') {
            const mwiDataKeys = (await loadData({ country: 'mwi', env: 'stage', exclude: ['screens', 'diagnoses', 'dff'], })).dataKeys;
            dataKeys = [...dataKeys, ...mwiDataKeys];
        }

        const scrappedKeys = await scrapDataKeys({
            screens,
            diagnoses,
            dataKeys,
            drugsLibrary,
        });

        await db.delete(schema.dataKeysHistory);
        await db.delete(schema.dataKeysDrafts);
        await db.delete(schema.dataKeys);

        await _saveDataKeys({
            updateRefs: false,
            data: scrappedKeys.map(k => ({
                ...k,
                uniqueKey: k.uniqueKey || k.uuid,
            })),
        });

        await processDataKeysRefs();
    } catch(e: any) {
        console.error('ERROR:');
        console.error(e);
    } finally {
        process.exit();
    }
}

async function processDatakeysOptions() {
    try {
        const { screens, dataKeys: dataKeysArr, } = await loadData();
        // const { data: screens, } = await _getScreens();

        // const { data: dataKeysArr, } = await _getDataKeys();

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

async function sanitizeDataKeys() {
    console.log('loading data...');
    const { data: dataKeys, } = await _getDataKeys();
    const { data: screens } = await _getScreens();
    const { data: diagnoses, } = await _getDiagnoses();

    console.log('sanitising...');

    const parsedDataKeys = dataKeys.map(k => {
        return {
            ...k,
            name: `${k.name || ''}`.trim(),
            label: `${k.label || ''}`.trim(),
            options: k.options.filter(o => dataKeys.find(k => k.uniqueKey === o)),
        };
    });

    const parsedDiagnoses = diagnoses.map(diagnosis => {
        const name = `${diagnosis.key || diagnosis.name || ''}`.trim();
        const k = {
            label: `${diagnosis.name || ''}`,
            name,
            dataType: 'diagnosis',
        }; 
        const keyId = pickDataKey(dataKeys, k)?.uniqueKey;
        return {
            ...diagnosis,
            keyId,
            name: (diagnosis.name || '').trim(),
            key: (diagnosis.key || '').trim(),
            symptoms: (diagnosis.symptoms || []).map(f => {
                const name = `${f.key || f.name || ''}`.trim();
                const k = {
                    label: `${f.name || ''}`.trim(),
                    name,
                    dataType: `diagnosis_symptom_${f.type}`,
                };
                const keyId = pickDataKey(dataKeys, k)?.uniqueKey;
                return {
                    ...f,
                    keyId,
                }
            }),
        };
    });

    const parsedScreens = screens.map(screen => {
        const k = {
            label: screen.label,
            name: screen.key,
            dataType: screen.type,
        }; 
        const keyId = pickDataKey(dataKeys, k)?.uniqueKey || '';
        return {
            ...screen,
            label: `${screen.label || ''}`.trim(),
            key: `${screen.key || ''}`.trim(),
            keyId,
            fields: (screen.fields || []).map(f => {
                const dataType = f.type;
                const k = {
                    label: f.label,
                    name: f.key,
                    dataType,
                };
                const keyId = pickDataKey(dataKeys, k)?.uniqueKey;
                return {
                    ...f,
                    label: `${f.label || ''}`.trim(),
                    key: `${f.key || ''}`.trim(),
                    keyId,
                    items: (f.items || []).map(item => {
                        const k = {
                            label: item.label as string,
                            name: item.value as string,
                            dataType: `${dataType}_option`,
                        };
                        const keyId = pickDataKey(dataKeys, k)?.uniqueKey;
                        return {
                            ...item,
                            label: `${item.label || ''}`.trim(),
                            value: `${item.value || ''}`.trim(),
                            keyId,
                        };
                    }),
                };
            }),
            items: (screen.items || []).map(f => {
                const name = f.key || f.id;
                let dataType = `${screen.type}_option`;
                if (screen.type === 'diagnosis') dataType = 'diagnosis';
                const k = {
                    label: f.label,
                    name,
                    dataType,
                };
                const keyId = pickDataKey(dataKeys, k)?.uniqueKey;
                return {
                    ...f,
                    label: `${f.label || ''}`.trim(),
                    key: `${f.key || ''}`.trim(),
                    id: `${f.id || ''}`.trim(),
                    keyId,
                };
            }),
        };
    });

    console.log('dataKeys...');
    await _saveDataKeys({ data: parsedDataKeys, updateRefs: false, });

    console.log('screens...');
    await _saveScreens({ data: parsedScreens as unknown as Parameters<typeof _saveScreens>[0]['data'], });

    console.log('diagnoses...');
    await _saveDiagnoses({ data: parsedDiagnoses as unknown as Parameters<typeof _saveDiagnoses>[0]['data'], });
}
