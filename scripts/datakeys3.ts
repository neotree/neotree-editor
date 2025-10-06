import '@/server/env';
import db from '@/databases/pg/drizzle';
import * as schema from '@/databases/pg/schema';
import { _getDiagnoses, _getScreens } from '@/databases/queries/scripts';
import { _getDataKeys } from "@/databases/queries/data-keys";
import { _saveDiagnoses, _saveScreens, } from "@/databases/mutations/scripts";
import { _saveDataKeys, } from '@/databases/mutations/data-keys';

main();

async function main() {
    try {
        const { data: screens, } = await _getScreens();

        const checklistScreens = screens.filter(s => s.refIdDataKey).filter(s => s.type === 'checklist');

        const { data: checkListDataKeys, } = await _getDataKeys({
            uniqueKeys: checklistScreens.map(s => s.refIdDataKey),
        });

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
