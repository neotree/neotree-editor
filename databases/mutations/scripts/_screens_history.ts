import db from "@/databases/pg/drizzle";
import logger from "@/lib/logger";
import { screensDrafts, screens, screensHistory } from "@/databases/pg/schema";

export async function _saveScreensHistory({ previous, drafts, }: {
    drafts: typeof screensDrafts.$inferSelect[];
    previous: typeof screens.$inferSelect[];
}) {
    try {
        const insertData: typeof screensHistory.$inferInsert[] = [];

        for(const c of drafts) {
            const changeHistoryData: typeof screensHistory.$inferInsert = {
                version: c?.data?.version || 1,
                screenId: c?.data?.screenId!,
                scriptId: c?.data?.scriptId,
                changes: {},
            };

            if (c?.data?.version === 1) {
                changeHistoryData.changes = {
                    action: 'create_screen',
                    descreenion: 'Create screen',
                    oldValues: [],
                    newValues: [],
                };
            } else {
                const prev = previous.filter(prevC => prevC.screenId === c?.data?.screenId)[0];

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
                    action: 'update_screen',
                    descreenion: 'Update screen',
                    oldValues,
                    newValues,
                };
            }

            insertData.push(changeHistoryData);
        }

        await db.insert(screensHistory).values(insertData);
    } catch(e: any) {
        logger.error(e.message);
    }
}
