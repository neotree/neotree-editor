import db from "@/databases/pg/drizzle";
import { scriptsDrafts, scripts, scriptsHistory } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export async function _saveScriptsHistory({ previous, drafts, }: {
    drafts: typeof scriptsDrafts.$inferSelect[];
    previous: typeof scripts.$inferSelect[];
}) {
    try {
        const insertData: typeof scriptsHistory.$inferInsert[] = [];

        for(const c of drafts) {
            const changeHistoryData: typeof scriptsHistory.$inferInsert = {
                version: c?.data?.version || 1,
                scriptId: c?.data?.scriptId!,
                changes: {},
            };

            if (c?.data?.version === 1) {
                changeHistoryData.changes = {
                    action: 'create_script',
                    description: 'Create script',
                    oldValues: [],
                    newValues: [],
                };
            } else {
                const prev = previous.filter(prevC => prevC.scriptId === c?.data?.scriptId)[0];

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
                    action: 'update_script',
                    description: 'Update script',
                    oldValues,
                    newValues,
                };
            }

            insertData.push(changeHistoryData);
        }

        await db.insert(scriptsHistory).values(insertData);
    } catch(e: any) {
        logger.error(e.message);
    }
}
