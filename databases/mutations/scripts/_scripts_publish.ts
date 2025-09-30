import { eq, inArray, isNotNull, or, sql, and } from "drizzle-orm";
import { v4 } from "uuid";

import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import { scripts, screensDrafts, diagnosesDrafts, pendingDeletion, scriptsHistory, scriptsDrafts, ntScriptLock } from "@/databases/pg/schema";
import {getChangedScripts} from "../script-lock/_script_lock_save"
import { _saveScriptsHistory } from "./_scripts_history";
import { _publishScreens } from "./_screens_publish";
import { _publishDiagnoses } from "./_diagnoses_publish";

export async function _publishScripts() {
    const results: { success: boolean; errors?: string[]; } = { success: false, };

    try {
         const myUpdatedScripts = await getChangedScripts()
         if(myUpdatedScripts && myUpdatedScripts.length>0){
        const drafts = (await db.query.scriptsDrafts.findMany()).filter(s=>myUpdatedScripts.includes(s.scriptId||s.scriptDraftId));
        let inserts = drafts.
        filter(c => !c.scriptId)
        .map(s => ({
            ...s,
            scriptId: s.scriptId||s.data.scriptId || v4(),
            data: { ...s.data, scriptId: s.scriptId||s.data.scriptId || v4(), },
        }));
         console.log("---INSERTS..",inserts)
        let updates = drafts.filter(c => c.scriptId);

        const scriptsIdsAndScriptsDraftsIds = [
            ...inserts.map(s => s.scriptId!),
            ...updates.map(s => s.scriptId!),
        ];

        const errors: string[] = [];
        const processedScripts: { scriptId: string; errors?: string[]; }[] = []

        if (updates.length) {
            // we'll use data before to compare changes
            let dataBefore: typeof scripts.$inferSelect[] = [];
            if (updates.filter(c => c.scriptId).length) {
                dataBefore = await db.query.scripts.findMany({
                    where: inArray(scripts.scriptId, updates.filter(c => c.scriptId).map(c => c.scriptId!))
                });
            }

            for (const { scriptId: _scriptId, data: c } of updates) {
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

            await _saveScriptsHistory({ drafts: updates, previous: dataBefore, });
        }

        if (inserts.length) {
            let dataBefore: typeof scripts.$inferSelect[] = [];
            if (inserts.filter(c => c.scriptId).length) {
                dataBefore = await db.query.scripts.findMany({
                    where: inArray(scripts.scriptId, inserts.filter(c => c.scriptId).map(c => c.scriptId!))
                });
            }

            const insertData = inserts.map(s => ({
                ...s.data,
                scriptId: s.scriptDraftId,
            }));

            await db.insert(scripts).values(insertData);

            for (const { scriptId } of insertData) {
                processedScripts.push({ scriptId, });

                await db.update(screensDrafts).set({ scriptId }).where(or(
                    eq(screensDrafts.scriptId, scriptId),
                    eq(screensDrafts.scriptDraftId, scriptId)
                ));

                await db.update(diagnosesDrafts).set({ scriptId }).where(or(
                    eq(diagnosesDrafts.scriptId, scriptId),
                    eq(diagnosesDrafts.scriptDraftId, scriptId)
                ));
            }
        }
        if (processedScripts.length) {
            const publishScreens = await _publishScreens({ scriptsIds: processedScripts.map(s => s.scriptId) });
            if (publishScreens.errors) throw new Error(publishScreens.errors.join(', '));

            const publishDiagnoses = await _publishDiagnoses({ scriptsIds: processedScripts.map(s => s.scriptId) });
            if (publishDiagnoses.errors) throw new Error(publishDiagnoses.errors.join(', '));
        }

        let deleted = await db.query.pendingDeletion.findMany({
            where: isNotNull(pendingDeletion.scriptId),
            columns: { scriptId: true, },
            with: {
                script: {
                    columns: {
                        version: true,
                    },
                },
            },
        });
      
        await db.delete(scriptsDrafts).where(or(inArray(scriptsDrafts.scriptId,myUpdatedScripts),
        inArray(scriptsDrafts.scriptDraftId,myUpdatedScripts)));
        

        deleted = deleted.filter(c => c.script && myUpdatedScripts.includes(c.scriptId||''));

        if (deleted.length) {
            const deletedAt = new Date();

            await db.update(scripts)
                .set({ deletedAt, })
                .where(inArray(scripts.scriptId, deleted.map(c => c.scriptId!)));

            await db.insert(scriptsHistory).values(deleted.map(c => ({
                version: c.script!.version,
                scriptId: c.scriptId!,
                changes: {
                    action: 'delete_config_key',
                    description: 'Delete config key',
                    oldValues: [{ deletedAt: null, }],
                    newValues: [{ deletedAt, }],
                },
            })));
        }

        await db.delete(pendingDeletion).where(and(or(
            isNotNull(pendingDeletion.scriptId),
            isNotNull(pendingDeletion.scriptDraftId)),
            inArray(pendingDeletion.scriptId,myUpdatedScripts)));

        const published = [
            // ...inserts.map(c => c.scriptId! || c.scriptDraftId),
            ...updates.map(c => c.scriptId!),
            ...deleted.map(c => c.scriptId!),
        ];

        if (published.length) {
            await db.update(scripts)
                .set({ version: sql`${scripts.version} + 1`, }).
                where(inArray(scripts.scriptId, published));
        }
         }
        results.success = true;
    } catch (e: any) {
        results.success = false;
        results.errors = [e.message];
        logger.error('_publishScripts ERROR', e.message);
    } finally {
        return results;
    }
}
