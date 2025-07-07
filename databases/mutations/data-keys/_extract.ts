import { count, eq, inArray, sql } from "drizzle-orm";
import { v4 } from "uuid";

import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import * as schema from "@/databases/pg/schema";
import { _saveDataKeys } from "./_save";

type DataKey = typeof schema.dataKeys.$inferInsert;

export type ExtractDataKeysResponse = {
    data: { extracted: number; };
    errors?: string[];
};

export async function _extractDataKeys(): Promise<ExtractDataKeysResponse> {
    try {
        const screens = await db.query.screens.findMany();
        const diagnoses = await db.query.diagnoses.findMany();
        const drugsLibrary = await db.query.drugsLibrary.findMany();

        let extractedKeys: DataKey[] = [];

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

        diagnoses.forEach(d => {
            if (d.key) extractedKeys.push({ 
                id: undefined,
                uuid: v4(),
                name: d.key, 
                label: d.name, 
                dataType: 'diagnosis', 
                parentKeys: [],
                version: 1,
            });
            
            // d.symptoms.forEach(s => {
            //     if (s.name) data.push(s.name);
            // });
        });

        drugsLibrary.forEach(d => {
            if (d.key) extractedKeys.push({
                id: undefined,
                uuid: v4(), 
                name: d.key, 
                label: d.drug, 
                dataType: d.type, 
                parentKeys: [],
                version: 1,
            });
        });

        for (const key of extractedKeys) {
            let parentKeys = key.parentKeys || [];
            extractedKeys
                .filter(k => {
                    const isMatch = k.name && key.name && (k.name.toLowerCase() === key.name.toLowerCase());
                    return isMatch;
                })
                .forEach(k => {
                    parentKeys = [...parentKeys, ...k.parentKeys!];
                });
        }

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

        if (extractedKeys.length) {
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
