import * as schema from '@/databases/pg/schema';

type DataKey = Partial<typeof schema.dataKeys.$inferSelect['children'][0]> & {
    children?: DataKey[];
};

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
