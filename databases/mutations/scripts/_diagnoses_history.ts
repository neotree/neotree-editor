import db from "@/databases/pg/drizzle";
import logger from "@/lib/logger";
import { diagnosesDrafts, diagnoses, diagnosesHistory } from "@/databases/pg/schema";
import { removeHexCharacters } from '../../utils'

export async function _saveDiagnosesHistory({ previous, drafts, }: {
    drafts: typeof diagnosesDrafts.$inferSelect[];
    previous: typeof diagnoses.$inferSelect[];
}) {
    try {
        const insertData: typeof diagnosesHistory.$inferInsert[] = [];

        for(const c of drafts) {
            const changeHistoryData: typeof diagnosesHistory.$inferInsert = {
                version: c?.data?.version || 1,
                diagnosisId: c?.data?.diagnosisId!,
                scriptId: c?.data?.scriptId,
                changes: {},
            };

            if (c?.data?.version === 1) {
                changeHistoryData.changes = {
                    action: 'create_diagnosis',
                    description: 'Create diagnosis',
                    oldValues: [],
                    newValues: [],
                };
            } else {
                const prev = previous.filter(prevC => prevC.diagnosisId === c?.data?.diagnosisId)[0];

                const oldValues: any[] = [];
                const newValues: any[] = [];

                Object.keys(({ ...c?.data }))
                    .filter(key => !['version', 'draft'].includes(key))
                    .forEach(_key => {
                        const key = _key as unknown as keyof typeof c.data;
                        const newValue = removeHexCharacters(c.data[key]);
                        const oldValue = ({ ...prev })[key as keyof typeof prev];
                        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                            oldValues.push({ [key]: oldValue, });
                            newValues.push({ [key]: newValue, });
                        }
                    });

                changeHistoryData.changes = {
                    action: 'update_diagnosis',
                    description: 'Update diagnosis',
                    oldValues,
                    newValues,
                };
            }

            insertData.push(changeHistoryData);
        }

        await db.insert(diagnosesHistory).values(insertData);
    } catch(e: any) {
        logger.error(e.message);
    }
}
