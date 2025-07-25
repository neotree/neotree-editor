import db from "@/databases/pg/drizzle";
import logger from "@/lib/logger";
import { dataKeysDrafts, dataKeys, dataKeysHistory } from "@/databases/pg/schema";

export async function _saveDataKeysHistory({ previous, drafts, }: {
    drafts: typeof dataKeysDrafts.$inferSelect[];
    previous: typeof dataKeys.$inferSelect[];
}) {
    try {
        const insertData: typeof dataKeysHistory.$inferInsert[] = [];

        for(const c of drafts) {
            const changeHistoryData: typeof dataKeysHistory.$inferInsert = {
                version: c?.data?.version || 1,
                dataKeyId: c?.data?.uuid!,
                changes: {},
            };

            if (c?.data?.version === 1) {
                changeHistoryData.changes = {
                    action: 'create_data_key',
                    description: 'Create data key',
                    oldValues: [],
                    newValues: [],
                };
            } else {
                const prev = previous.filter(prevC => prevC.uuid === c?.data?.uuid)[0];

                const oldValues: any[] = [];
                const newValues: any[] = [];

                Object.keys(({ ...c?.data }))
                    .filter(key => !['version', 'draft'].includes(key))
                    .forEach(_key => {
                        const key = _key as unknown as keyof typeof c.data;
                        const newValue = c.data[key];
                        const oldValue = ({ ...prev })[key as keyof typeof prev];
                        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                            oldValues.push({ [key]: oldValue, });
                            newValues.push({ [key]: newValue, });
                        }
                    });

                changeHistoryData.changes = {
                    action: 'update_data_key',
                    description: 'Update data key',
                    oldValues,
                    newValues,
                };
            }

            insertData.push(changeHistoryData);
        }

        await db.insert(dataKeysHistory).values(insertData);
    } catch(e: any) {
        logger.error(e.message);
    }
}
