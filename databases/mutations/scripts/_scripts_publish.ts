import { and, asc, eq, inArray, isNotNull, isNull, notInArray, or } from "drizzle-orm";
import { v4 } from "uuid";

import socket  from '@/lib/socket';
import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import { scripts, screensDrafts, diagnosesDrafts } from "@/databases/pg/schema";
import { _saveScriptsHistory } from "./_scripts_history";
import { _publishScreens } from "./_screens_publish";
import { _publishDiagnoses } from "./_diagnoses_publish";

export async function _publishScripts() {
    const results: { success: boolean; errors?: string[]; } = { success: false, };

    try {
        const drafts = await db.query.scriptsDrafts.findMany();
        let inserts = drafts.filter(c => !c.scriptId).map(s => ({
            ...s,
            scriptId: s.data.scriptId || v4(),
            data: { ...s.data, scriptId: s.data.scriptId || v4(), },
        }));
        let updates = drafts.filter(c => c.scriptId);

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

            for(const { scriptId: _scriptId, data: c } of updates) {
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

            for(const { scriptId } of insertData) {
                processedScripts.push({ scriptId, });

                await db.update(screensDrafts).set({ scriptId }).where(or(
                    eq(screensDrafts.scriptId, scriptId),
                    eq(screensDrafts.scriptDraftId, scriptId)
                ));

                await db.update(diagnosesDrafts).set({ scriptId }).where(or(
                    eq(screensDrafts.scriptId, scriptId),
                    eq(screensDrafts.scriptDraftId, scriptId)
                ));
            }
        }

        if (processedScripts.length) {
            const publishScreens = await _publishScreens({ scriptsIds: processedScripts.map(s => s.scriptId) });
            if (publishScreens.errors) throw new Error(publishScreens.errors.join(', '));

            const publishDiagnoses = await _publishDiagnoses({ scriptsIds: processedScripts.map(s => s.scriptId) });
            if (publishDiagnoses.errors) throw new Error(publishDiagnoses.errors.join(', '));
        }

        results.success = true;
    } catch(e: any) {
        results.success = false;
        results.errors = [e.message];
        logger.error('_publishScripts ERROR', e.message);
    } finally {
        return results;
    }
}
