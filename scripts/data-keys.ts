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

type DataKey = Omit<typeof schema.dataKeys.$inferSelect['children'][0], 'uuid'>;
type DataKeyChild = typeof schema.dataKeys.$inferSelect['children'][0];

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
        const country: keyof typeof scripts = 'zw';

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

        let keys: (DataKey & {
            children: DataKeyChild[];
        })[] = [];

        screens.forEach(s => {
            let name = s.key;
            let label = s.label;
            let type = s.type;

            if (dataTypes.filter(t => t.includes('edliz')).includes(type)) {
                label = label || s.title;
                name = name || label;
            }

            const children: typeof keys[0]['children'] = [];

            s.items.forEach(item => {
                const key = {
                    uuid: "",
                    label: item.label,
                    name: item.key || item.id,
                    dataType: `${s.type}_option`,
                    children: [],
                    defaults: { 
                        type: item.type || undefined, 
                        subType: item.subType || undefined, 
                        dataType: item.dataType || undefined, 
                        severity_order: item.severity_order || undefined, 
                        score: item.score || undefined, 
                        exclusive: item.exclusive || undefined,
                        enterValueManually: item.enterValueManually || undefined,
                    },
                };

                if (s.type.includes('edliz')) {
                    keys.push(key);
                } else {
                    children.push(key);
                }
            });

            s.fields.forEach(item => {
                const itemChildren: DataKeyChild[] = (() => {
                    switch(item.type) {
                        case 'multi_select':
                        case 'dropdown':
                            // const values = `${item.values || ''}`
                            //     .split('\n')
                            //     .map(v => {
                            //         const [key, label] = `${v || ''}`.trim().split(',').map(v => v.trim());
                            //         return {
                            //             uuid: "",
                            //             label,
                            //             name: key,
                            //             dataType: `${item.type}_option`,
                            //             children: [],
                            //             defaults: {
                            //                 valuesOptions: item.valuesOptions?.length || [],
                            //             },
                            //         };
                            //     });

                            // return values;
                            return (item.items || []).map(v => ({
                                uuid: "",
                                label: v.label as string,
                                name: v.value as string,
                                dataType: `${item.type}_option`,
                                children: [],
                                defaults: {
                                    label2: v.label2 || undefined,
                                    enterValueManually: v.enterValueManually,
                                    exclusive: v.exclusive,
                                },
                            }));
                        default:
                            return []
                    }
                })();

                keys.push({
                    label: item.label,
                    name: item.key,
                    dataType: item.type,
                    children: itemChildren,
                    defaults: { 
                        dataType: item.dataType && (item.dataType !== item.type) ? item.dataType : undefined, 
                    },
                });
            });

            const key: DataKey = {
                name,
                label,
                dataType: type,
                children,
                defaults: {
                    positiveLabel: s.positiveLabel,
                    negativeLabel: s.negativeLabel,
                },
            };

            keys.push(key);
        });

        diagnoses.forEach(d => {
            if (d.key) {
                keys.push({ 
                    name: d.key, 
                    label: d.name, 
                    dataType: 'diagnosis', 
                    children: [],
                    defaults: {},
                });
            }
        });

        drugsLibrary.forEach(d => {
            if (d.key) {
                keys.push({
                    name: d.key, 
                    label: d.drug, 
                    dataType: d.type, 
                    children: [],
                    defaults: {},
                });
            }
        });

        keys = keys.filter(k => k.name && k.label);

        keys = keys
            .filter((k, i) => keys.map(k => JSON.stringify(k)).indexOf(JSON.stringify(k)) === i)
            .map(k => ({
                ...k,
                children: k.children.map(k => ({ ...k, uuid: uuidV4(), })),
            }));

        // await writeFile(path.resolve(__dirname, 'data-keys.json'), JSON.stringify(keys, null, 4));

        await db.insert(schema.dataKeysDrafts).values(
            keys.map(k => {
                const uuid = uuidV4();
                return { 
                    uuid,
                    name: k.name,
                    data: { 
                        ...k, 
                        uuid,
                        version: 1,
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
