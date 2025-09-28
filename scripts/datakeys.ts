import { and, eq, inArray, sql } from "drizzle-orm";
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuidV4, } from 'uuid';
import queryString from "query-string";

import '@/server/env';
import db from "@/databases/pg/drizzle";
import * as schema from "@/databases/pg/schema";
import { _getScreens } from '@/databases/queries/scripts';
import { getScriptsWithItems } from "@/app/actions/scripts";
import { getSiteAxiosClient } from "@/lib/server/axios";
import { dataKeyTypes } from "@/constants";

const dataTypes = dataKeyTypes.map(t => t.value);

type tKey = {
    uniqueKey: string;
    name: string;
    label: string;
    refId?: string;
    dataType?: string;
    children: tKey[];
    // children: {
    //     uniqueKey: string;
    //     name: string;
    //     label: string;
    //     refId?: string;
    //     dataType?: string;
    //     children: {
    //         uniqueKey: string;
    //         name: string;
    //         label: string;
    //         refId?: string;
    //         dataType?: string;
    //     }[];
    // }[];
};

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
};

main();

async function main() {
    try {
        const country: keyof typeof scripts = 'mwi';

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
                scriptsIds: JSON.stringify(scripts[country]),
            }));

            res.data.data.forEach(s => {
                screens = [...screens, ...s.screens];
                diagnoses = [...diagnoses, ...s.diagnoses];
                drugsLibrary = [...drugsLibrary, ...s.drugsLibrary];
            });
        }

        let keysMap: tKey[] = [];

        const screensKeys = screens.map(s => {
            const key: tKey = {
                uniqueKey: '',
                name: s.key || '',
                label: s.label || '',
                refId: s.refId || '',
                dataType: s.type,
                children: [],
            };

            if (dataTypes.filter(t => !t.includes('edliz')).includes(key.dataType!)) {
                key.label = key.label || s.title;
                key.name = key.name || key.label;
            }

            if (['diagnosis', 'checklist'].includes(s.type)) key.dataType = `${s.type}_screen`;

            s.items.forEach(item => {
                let dataType = `${s.type}_option`;
                if (s.type === 'diagnosis') dataType = s.type;
                const k: tKey = {
                    uniqueKey: '',
                    name: item.key || item.id || '',
                    label: item.label || '',
                    dataType,
                    children: [],
                };
                key.children.push(k);
            });

            s.fields.forEach(f => {
                key.children.push({
                    uniqueKey: '',
                    name: f.key || '',
                    label: f.label || '',
                    dataType: f.type,
                    children: (f.items || []).map(item => ({
                        uniqueKey: '',
                        name: (item.value || '') as string,
                        label: (item.label || '') as string,
                        children: [],
                        dataType: `${f.type}_option`,
                    })),
                });
            });

            keysMap.push(key);

            return {
                screenId: s.screenId,
                key,
            };
        });

        const diagnosesKeys = diagnoses.map(d => {
            const key: tKey = {
                uniqueKey: '',
                name: d.key || d.name || '',
                label: d.name || '',
                dataType: 'diagnosis',
                children: [],
            };

            (d.symptoms || []).forEach(item => {
                key.children.push({
                    uniqueKey: '',
                    name: item.name || '',
                    label: '',
                    dataType: `diagnosis_symptom_${item.type}`,
                    children: [],
                });
            });

            keysMap.push(key);

            return {
                screenId: d.diagnosisId,
                key,
            };
        });

        const dffKeys = drugsLibrary.map(d => {
            const key: tKey = {
                uniqueKey: '',
                name: d.key || '',
                label: d.drug || '',
                dataType: d.type,
                children: [],
            };

            keysMap.push(key);

            return {
                screenId: d.itemId,
                key,
            };
        });

        keysMap = keysMap.filter((k, i) => keysMap.map(k => JSON.stringify(k)).indexOf(JSON.stringify(k)) === i);
        
        keysMap = keysMap
            .reduce<tKey[]>((acc, { uniqueKey, ...k }) => {
                if (acc.map(({ uniqueKey, ...k }) => JSON.stringify(k)).includes(JSON.stringify(k))) return acc;

                k.children = k.children.map(({ uniqueKey, ...child }) => {
                    uniqueKey = acc.find(({ uniqueKey, ...k }) => JSON.stringify(k) === JSON.stringify(child))?.uniqueKey || uuidV4();
                    return {
                        ...child,
                        uniqueKey,
                        children: child.children.map(({ uniqueKey, ...child }) => {
                            uniqueKey = acc.find(({ uniqueKey, ...k }) => JSON.stringify(k) === JSON.stringify(child))?.uniqueKey || uuidV4();
                            return {
                                ...child,
                                uniqueKey,
                            };
                        }),
                    };
                });
                
                const children: tKey[] = [];

                k.children.forEach(child => {
                    children.push(child);
                    child.children.forEach(child2 => {
                        children.push({
                            ...child2,
                            children: [],
                        });
                    })
                });

                return [
                    ...acc,
                    { ...k, uniqueKey: uuidV4(), },
                    ...children,
                ];
            }, []);

        keysMap = keysMap.filter(({ uniqueKey, ...k }, i) => {
            return keysMap.map(({ uniqueKey, ...k }) => JSON.stringify(k)).indexOf(JSON.stringify(k)) === i;
        });

        let keys = keysMap.map(({ uniqueKey, ...k }) => {
            const key = { ...k, uniqueKey };

            k.children = k.children.map(({ uniqueKey, ...child }) => ({
                ...child,
                children: child.children.map(({ uniqueKey, ...child }) => ({
                    ...child,
                })),
            })) as typeof key.children;

            screensKeys.forEach(sk => {
                const { uniqueKey, ...skKey } = sk.key;
                skKey.children = skKey.children.map(({ uniqueKey, ...child }) => ({
                    ...child,
                    children: child.children.map(({ uniqueKey, ...child }) => ({
                        ...child,
                    })),
                })) as typeof key.children;
                if (JSON.stringify(skKey) === JSON.stringify(k)) {
                    sk.key = key;
                }
            });

            diagnosesKeys.forEach(dk => {
                const { uniqueKey, ...dkKey } = dk.key;
                dkKey.children = dkKey.children.map(({ uniqueKey, ...child }) => ({
                    ...child,
                    children: child.children.map(({ uniqueKey, ...child }) => ({
                        ...child,
                    })),
                })) as typeof key.children;
                if (JSON.stringify(dkKey) === JSON.stringify(k)) {
                    dk.key = key;
                }
            });

            dffKeys.forEach(dk => {
                const { uniqueKey, ...dkKey } = dk.key;
                dkKey.children = dkKey.children.map(({ uniqueKey, ...child }) => ({
                    ...child,
                    children: child.children.map(({ uniqueKey, ...child }) => ({
                        ...child,
                    })),
                })) as typeof key.children;
                if (JSON.stringify(dkKey) === JSON.stringify(k)) {
                    dk.key = key;
                }
            });

            return key;
        });

        keys = keys.reduce((acc, key) => {
            const dataType = key.dataType || '';
            const shouldSpreadChildren = (dataType === 'form') || dataType.includes('edliz') || dataType.includes('_screen');

            return [
                ...acc,
                ...(!shouldSpreadChildren ? [key] : (key.children as typeof keys)),
            ];
        }, [] as typeof keys);

        keys = keys
            .map(k => ({ ...k, label: k.label || k.name, }))
            .filter(k => k.label && k.name);

        keys = keys.filter((k, i) => keys.map(k => k.uniqueKey).indexOf(k.uniqueKey) === i);

        console.log('keys.length', keys.length);

        // await writeFile(path.resolve(__dirname, 'keys.json'), JSON.stringify(keys, null, 4));
        // await writeFile(path.resolve(__dirname, 'screensKeys.json'), JSON.stringify(screensKeys, null, 4));

        await db.insert(schema.dataKeysDrafts).values(
            keys.map(({ children, ...k }) => {
                return { 
                    uuid: uuidV4(),
                    name: k.name,
                    uniqueKey: k.uniqueKey,
                    data: {
                        ...k,
                        uuid: uuidV4(),
                        version: 1,
                        options: children.map(k => k.uniqueKey),
                        metadata: {},
                    },
                } satisfies typeof schema.dataKeysDrafts.$inferInsert;
            }),
        );
    } catch(e: any) {
        console.error('ERROR:');
        console.error(e);
    } finally {
        process.exit();
    }
}
