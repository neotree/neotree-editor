import { and, asc, eq, inArray, isNotNull, isNull, notInArray, or } from "drizzle-orm";
import { v4 } from "uuid";

import socket  from '@/lib/socket';
import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import { scripts } from "@/databases/pg/schema";
import { _saveScriptsHistory } from "./_scripts_history";

export async function _publishScripts() {
    const results: { success: boolean; errors?: string[]; } = { success: false, };

    try {
        const drafts = await db.query.scriptsDrafts.findMany();
        let insertData = drafts.filter(c => !c.scriptId).map(s => ({
            ...s,
            scriptId: s.data.scriptId || v4(),
            data: { ...s.data, scriptId: s.data.scriptId || v4(), },
        }));
        let updateData = drafts.filter(c => c.scriptId);

        const errors: string[] = [];
        const processedScripts: { scriptId: string; errors?: string[]; }[] = []

        if (updateData.length) {
            // we'll use data before to compare changes
            let dataBefore: typeof scripts.$inferSelect[] = [];
            if (updateData.filter(c => c.scriptId).length) {
                dataBefore = await db.query.scripts.findMany({
                    where: inArray(scripts.scriptId, updateData.filter(c => c.scriptId).map(c => c.scriptId!))
                });
            }

            for(const { scriptId: _scriptId, data: c } of updateData) {
                const scriptId = _scriptId!;

                const { scriptId: __scriptId, id, oldScriptId, createdAt, updatedAt, deletedAt, ...payload } = c;

                const updates = {
                    ...payload,
                    publishDate: new Date(),
                };
                await db
                    .update(scripts)
                    .set(updates)
                    .where(eq(scripts.scriptId, scriptId));

                processedScripts.push({ scriptId, });
            }

            await _saveScriptsHistory({ drafts: insertData, previous: dataBefore, });
        }

        if (insertData.length) {
            let dataBefore: typeof scripts.$inferSelect[] = [];
            if (insertData.filter(c => c.scriptId).length) {
                dataBefore = await db.query.scripts.findMany({
                    where: inArray(scripts.scriptId, insertData.filter(c => c.scriptId).map(c => c.scriptId!))
                });
            }

            // await db.insert(scripts).values(insertData);

            // const inserted = await _getScripts({ scriptIds: insertData.map(c => c.scriptId!), });

            // for(const { scriptId } of inserted.data) {
            //     const draft = insertData.filter(s => s.data.scriptId === scriptId)[0];
            //     await db.update(screensDrafts).set({ scriptId }).where(eq(screensDrafts.scriptDraftId, draft.scriptDraftId));
            //     await db.update(diagnosesDrafts).set({ scriptId }).where(eq(diagnosesDrafts.scriptDraftId, draft.scriptDraftId));
            // }
        }

        // if (processedScripts.length) {
        //     const publishScreens = await _publishScreens({ scriptsIds: processedScripts.map(s => s.scriptId) });
        //     if (publishScreens.errors) throw new Error(publishScreens.errors.join(', '));

        //     const publishDiagnoses = await _publishDiagnoses({ scriptsIds: processedScripts.map(s => s.scriptId) });
        //     if (publishScreens.errors) throw new Error(publishDiagnoses.errors.join(', '));
        // }

        results.success = true;
    } catch(e: any) {
        results.success = false;
        results.errors = [e.message];
        logger.error('_publishScripts ERROR', e.message);
    } finally {
        return results;
    }
}
