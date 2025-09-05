import { and, eq, inArray, sql } from "drizzle-orm";
import { v4 } from "uuid";
import queryString from "query-string";

import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import * as schema from "@/databases/pg/schema";
import { _saveDataKeys } from "./_save";
import { getScriptsWithItems } from "@/app/actions/scripts";
import { getSiteAxiosClient } from "@/lib/server/axios";

type DataKey = typeof schema.dataKeys.$inferInsert;

export type RemoteExtractDataKeysResponse = {
    data: { extracted: number; };
    errors?: string[];
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
    ],
};

export type RemoteExtractDataKeysParams = {
    country: keyof typeof scripts,
};

export async function _remoteExtractDataKeys(opts: RemoteExtractDataKeysParams): Promise<RemoteExtractDataKeysResponse> {
    try {
        console.log(`Fetching ${opts.country} sites`);
        const sites = await db.query.sites.findMany({
            where: and(
                eq(schema.sites.countryISO, opts.country),
                eq(schema.sites.type, 'webeditor'),
            ),
        });

        console.log(`Found ${sites.length} sites. Fetching data...`);
        let screens: Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0]['screens'] = [];
        let diagnoses: Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0]['diagnoses'] = [];

        for (const site of sites) {
            // if (site.link === 'https://zim-webeditor.neotree.org:10243') continue;

            const axiosClient = await getSiteAxiosClient(site.siteId);

            const res = await axiosClient.get<Awaited<ReturnType<typeof getScriptsWithItems>>>('/api/scripts/with-items?' + queryString.stringify({
                scriptsIds: JSON.stringify(scripts[opts.country]),
            }));

            res.data.data.forEach(s => {
                screens = [...screens, ...s.screens];
                diagnoses = [...diagnoses, ...s.diagnoses];
            });
        }

        console.log(`Found: ${screens.length} screens, ${diagnoses.length} diagnoses`);

        console.log('Fetching drugsLibrary...');
        const drugsLibrary = await db.query.drugsLibrary.findMany();
        console.log('Fetching drugsLibrary... DONE');

        let extractedKeys: DataKey[] = [];

        console.log('Extacting screens keys...');
        screens.forEach(s => {
            if (s.key) {
                const dataKey: DataKey = { 
                    id: undefined,
                    uuid: v4(),
                    name: s.key, 
                    label: s.label || '', 
                    dataType: null, 
                    parentKeys: [], 
                    version: 1,
                };
                switch(s.type) {
                    case 'timer':
                        dataKey.dataType = 'timer';
                        break;
                    case 'yesno':
                        dataKey.dataType = 'yesno';
                        break;
                    case 'single_select':
                        dataKey.dataType = 'single_select';
                        break;
                    case 'multi_select':
                        dataKey.dataType = 'multi_select';
                        break;
                    default:
                        //
                }

                extractedKeys.push(dataKey);
            }

            s.items.forEach(item => {
                const key = item.id || item.key;
                if (key) {
                    const dataKey: DataKey = {
                        id: undefined,
                        uuid: v4(),
                        name: key,
                        label: item.label || '',
                        dataType: null,
                        parentKeys: !s.key ? [] : [s.key],
                        version: 1,
                        defaults: { 
                            dataType: item.subType || undefined, 
                            severity_order: item.severity_order || undefined, 
                            score: item.score || undefined, 
                        },
                    };

                    switch(s.type) {
                        case 'single_select':
                            dataKey.dataType = 'single_select_option';
                            break;
                        case 'multi_select':
                            dataKey.dataType = 'multi_select_option';
                            break;
                        case 'diagnosis':
                            dataKey.dataType = 'diagnosis';
                            break;
                        case 'checklist':
                            dataKey.name = item.key || item.id;
                            dataKey.dataType = 'checklist_option';
                            break;
                        case 'zw_edliz_summary_table':
                            dataKey.dataType = 'zw_edliz_summary_table_option';
                            break;
                        case 'mwi_edliz_summary_table':
                            dataKey.dataType = 'mwi_edliz_summary_table_option';
                            break;
                        case 'edliz_summary_table':
                            dataKey.dataType = 'edliz_summary_table_option';
                            break;
                        default:
                            //
                    }

                    extractedKeys.push(dataKey);
                }
            });

            s.fields.forEach((f, i) => {
                const dataKey: DataKey = {
                    id: undefined,
                    uuid: v4(),
                    name: f.key,
                    label: f.label || '',
                    dataType: f.type,
                    parentKeys: !s.key ? [] : [s.key],
                    version: 1,
                    defaults: { dataType: f.dataType || undefined, },
                };
                extractedKeys.push(dataKey);

                switch(f.type) {
                    case 'dropdown':
                        (f.values || '').split('\n')
                            .map((v = '') => v.trim())
                            .filter((v: any) => v)
                            .forEach((v: any) => {
                                v = v.split(',');
                                extractedKeys.push({ 
                                    uuid: v4(),
                                    id: undefined,
                                    name: v[0], 
                                    label: v[1], 
                                    dataType: 'dropdown_option', 
                                    parentKeys: !f.key ? [] : [f.key],
                                    version: 1,
                                });
                            });
                        break;
                    default:
                        //
                }
            });
        });

        console.log('Extacting diagnoses keys...');
        diagnoses.forEach(d => {
            if (d.key) {
                extractedKeys.push({ 
                    id: undefined,
                    uuid: v4(),
                    name: d.key, 
                    label: d.name, 
                    dataType: 'diagnosis', 
                    parentKeys: [],
                    version: 1,
                });
            }
            
            // d.symptoms.forEach(s => {
            //     if (s.name) data.push(s.name);
            // });
        });

        console.log('Extacting drugsLibrary keys...');
        drugsLibrary.forEach(d => {
            if (d.key) {
                extractedKeys.push({
                    id: undefined,
                    uuid: v4(), 
                    name: d.key, 
                    label: d.drug, 
                    dataType: d.type, 
                    parentKeys: [],
                    version: 1,
                });
            }
        });

        console.log(`Processing extracted keys (${extractedKeys.length}) ...`);
        for (const key of extractedKeys) {
            let parentKeys = key.parentKeys || [];
            extractedKeys
                .filter(k => {
                    const isMatch = k.name && key.name && (k.name.toLowerCase() === key.name.toLowerCase());
                    return isMatch;
                })
                .forEach(k => {
                    // console.log(k.name);
                    parentKeys = [...parentKeys, ...k.parentKeys!];
                });
        }
        console.log('Processing extracted keys... DONE');

        extractedKeys = extractedKeys
            .map(key => {
                let parentKeys = key.parentKeys || [];

                extractedKeys
                    .filter(k => {
                        const isMatch = k.name && key.name && (k.name.toLowerCase() === key.name.toLowerCase());
                        return isMatch;
                    })
                    .forEach(k => {
                        parentKeys = [...parentKeys, ...k.parentKeys!];
                    });

                return {
                    ...key,
                    parentKeys: parentKeys.filter((key, i) => {
                        return (parentKeys.map(key => key.toLowerCase()).indexOf(key.toLowerCase()) === i);
                    }),
                };
            })
            .map(key => {
                if (key.name === 'EDLIZSummaryTableScore') key.dataType = key.dataType || 'number';
                return {
                    ...key,
                    label: key.label || '',
                };
            })
            .filter((key, i) => {
                return (extractedKeys.map(key => key.name.toLowerCase()).indexOf(key.name.toLowerCase()) === i);
            });

        console.log(`Extracted ${extractedKeys.length} keys...`);

        if (extractedKeys.length) {
            console.log(`Saving ${extractedKeys.length} keys...`);

            const published = await db
                .select({ name: schema.dataKeys.name, })
                .from(schema.dataKeys)
                .where(inArray(sql`lower(${schema.dataKeys.name})`, extractedKeys.map(key => key.name.toLowerCase())));

            const drafts = await db
                .select({ name: schema.dataKeysDrafts.name, })
                .from(schema.dataKeysDrafts)
                .where(inArray(sql`lower(${schema.dataKeysDrafts.name})`, extractedKeys.map(key => key.name.toLowerCase())));

            const existing = [...published, ...drafts];

            extractedKeys = extractedKeys.filter(key => {
                return !existing.map(k => k.name.toLowerCase()).includes(key.name.toLowerCase());
            });

            if (extractedKeys.length) await _saveDataKeys({ data: extractedKeys, });
        }

        return { data: { extracted: extractedKeys.length, }, };
    } catch(e: any) {
        logger.log('db_extract_data_keys', e.message);
        return {
            data: { extracted: 0, },
            errors: [e.message],
        };
    }
}
