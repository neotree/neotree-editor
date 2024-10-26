import db from "@/databases/pg/drizzle";
import logger from "@/lib/logger";
import { configKeysDrafts, configKeys, configKeysHistory } from "@/databases/pg/schema";

export async function _saveConfigKeysHistory({ previous, drafts, }: {
    drafts: typeof configKeysDrafts.$inferSelect[];
    previous: typeof configKeys.$inferSelect[];
}) {
    try {
        const insertData: typeof configKeysHistory.$inferInsert[] = [];

        for(const c of drafts) {
            const changeHistoryData: typeof configKeysHistory.$inferInsert = {
                version: c?.data?.version || 1,
                configKeyId: c?.data?.configKeyId!,
                changes: {},
            };

            if (c?.data?.version === 1) {
                changeHistoryData.changes = {
                    action: 'create_config_key',
                    deconfigKeyion: 'Create config key',
                    oldValues: [],
                    newValues: [],
                };
            } else {
                const prev = previous.filter(prevC => prevC.configKeyId === c?.data?.configKeyId)[0];

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
                    action: 'update_config_key',
                    description: 'Update config key',
                    oldValues,
                    newValues,
                };
            }

            insertData.push(changeHistoryData);
        }

        await db.insert(configKeysHistory).values(insertData);
    } catch(e: any) {
        logger.error(e.message);
    }
}
