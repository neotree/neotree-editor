import db from "@/databases/pg/drizzle";
import logger from "@/lib/logger";
import { drugsLibraryDrafts, drugsLibrary, drugsLibraryHistory } from "@/databases/pg/schema";

export async function _saveDrugsLibraryItemsHistory({ previous, drafts, }: {
    drafts: typeof drugsLibraryDrafts.$inferSelect[];
    previous: typeof drugsLibrary.$inferSelect[];
}) {
    try {
        const insertData: typeof drugsLibraryHistory.$inferInsert[] = [];

        for(const c of drafts) {
            const changeHistoryData: typeof drugsLibraryHistory.$inferInsert = {
                version: c?.data?.version || 1,
                itemId: c?.data?.itemId!,
                changes: {},
            };

            if (c?.data?.version === 1) {
                changeHistoryData.changes = {
                    action: 'create_drugs_library_item',
                    description: 'Create drugs library item',
                    oldValues: [],
                    newValues: [],
                };
            } else {
                const prev = previous.filter(prevC => prevC.itemId === c?.data?.itemId)[0];

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
                    action: 'update_drugs_library_item',
                    description: 'Update drugs library item',
                    oldValues,
                    newValues,
                };
            }

            insertData.push(changeHistoryData);
        }

        await db.insert(drugsLibraryHistory).values(insertData);
    } catch(e: any) {
        logger.error(e.message);
    }
}
