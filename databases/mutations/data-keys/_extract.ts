import { count, eq, inArray, sql } from "drizzle-orm";

import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import * as schema from "@/databases/pg/schema";
import { DataKey } from "@/databases/queries/data-keys";

export type ExtractDataKeysResponse = {
    data: DataKey[];
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
                const dataKey: DataKey = { name: s.key, label: s.label || '', dataType: null, };
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
                        name: key,
                        label: item.label || '',
                        dataType: null,
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

            s.fields.forEach(f => {
                const dataKey: DataKey = {
                    name: f.key,
                    label: f.label || '',
                    dataType: f.type,
                };
                extractedKeys.push(dataKey);

                switch(f.type) {
                    case 'dropdown':
                        (f.values || '').split('\n')
                            .map((v = '') => v.trim())
                            .filter((v: any) => v)
                            .forEach((v: any) => {
                                v = v.split(',');
                                extractedKeys.push({ name: v[0], label: v[1], dataType: 'dropdown_option', });
                            });
                        break;
                    default:
                        //
                }
            });
        });

        diagnoses.forEach(d => {
            if (d.key) extractedKeys.push({ name: d.key, label: d.name, dataType: 'diagnosis', });
            
            // d.symptoms.forEach(s => {
            //     if (s.name) data.push(s.name);
            // });
        });

        drugsLibrary.forEach(d => {
            if (d.key) extractedKeys.push({ name: d.key, label: d.drug, dataType: d.type, });
        });

        extractedKeys = extractedKeys
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
            const res = await db
                .select({ name: schema.dataKeys.name, })
                .from(schema.dataKeys)
                .where(inArray(sql`lower(${schema.dataKeys.name})`, extractedKeys.map(key => key.name.toLowerCase())));

            extractedKeys = extractedKeys.filter(key => {
                return !res.map(k => k.name.toLowerCase()).includes(key.name.toLowerCase());
            });

            if (extractedKeys.length) await db.insert(schema.dataKeys).values(extractedKeys);
        }

        return { data: extractedKeys, };
    } catch(e: any) {
        logger.log('db_extract_data_keys', e.message);
        return {
            data: [],
            errors: [e.message],
        };
    }
}
