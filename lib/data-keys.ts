import { v4 as uuidV4 } from 'uuid';

import * as schema from '@/databases/pg/schema';
import { GetScreensResults, GetDiagnosesResults } from '@/databases/queries/scripts';
import { GetDrugsLibraryItemsResults } from '@/databases/queries/drugs-library';
import { dataKeyTypes } from "@/constants";

type DataKey = Partial<typeof schema.dataKeys.$inferSelect['children'][0]> & {
    children?: DataKey[];
};

const dataTypes = dataKeyTypes.map(t => t.value);

export function compareDataKeys(key1: DataKey, key2: DataKey) {
    const item1: DataKey = {
        dataType: key1.dataType!,
        name: key1.name,
        label: key1.label,
        defaults: { ... key1.defaults},
        children: key1.children || []
    };

    const item2: DataKey = {
        dataType: key2.dataType!,
        name: key2.name!,
        label: key2.label!,
        defaults: { ... key2.defaults},
        children: key2.children || []
    };

    return JSON.stringify(item1) === JSON.stringify(item2);
}

export function scrapDataKeys({
    screens,
    diagnoses,
    drugsLibrary,
}: {
    screens: GetScreensResults['data'];
    diagnoses: GetDiagnosesResults['data'];
    drugsLibrary: GetDrugsLibraryItemsResults['data'];
}) {
    type DataKey = Omit<typeof schema.dataKeys.$inferSelect['children'][0], 'uuid'>;
    type DataKeyChild = typeof schema.dataKeys.$inferSelect['children'][0];

    let keys: (DataKey & {
        children: DataKeyChild[];
    })[] = [];

    screens.forEach(s => {
        let name = s.key;
        let label = s.label;
        let type = s.type;

        if (dataTypes.filter(t => !t.includes('edliz')).includes(type)) {
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
                defaults: {},
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
                            defaults: {},
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
                defaults: {},
            });
        });

        const key: DataKey = {
            name,
            label,
            dataType: type,
            children,
            defaults: {},
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

    return keys;
}
