import { eq, inArray, isNotNull, or, sql,and } from "drizzle-orm";

import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import { diagnoses, diagnosesDrafts, diagnosesHistory, pendingDeletion } from "@/databases/pg/schema";
import { _saveDiagnosesHistory } from "./_diagnoses_history";
import {getChangedScripts} from "../script-lock/_script_lock_save"
import { v4 } from "uuid";

export async function _publishDiagnoses(opts?: {
    scriptsIds?: string[];
    diagnosesIds?: string[];
    broadcastAction?: boolean;
}) {
    const { scriptsIds, diagnosesIds, } = { ...opts, };

    const results: { success: boolean; errors?: string[]; } = { success: false };
    const errors: string[] = [];
    const myUpdatedScripts = await getChangedScripts()
    try {
        let updates: (typeof diagnosesDrafts.$inferSelect)[] = [];
        let inserts: (typeof diagnosesDrafts.$inferSelect)[] = [];
        if(myUpdatedScripts && myUpdatedScripts.length>0){
     
            const res = await db.query.diagnosesDrafts.findMany({
                where: or(
                   inArray(diagnosesDrafts.scriptId, myUpdatedScripts)   
                ),
            });

            updates = res.filter(s => s.diagnosisId);
            inserts = res.filter(s => !s.diagnosisId);
     
            if (updates.length) {
            // we'll use data before to compare changes
            let dataBefore: typeof diagnoses.$inferSelect[] = [];
            if (updates.filter(c => c.diagnosisId).length) {
                dataBefore = await db.query.diagnoses.findMany({
                    where: inArray(diagnoses.diagnosisId, updates.filter(c => c.diagnosisId).map(c => c.diagnosisId!))
                });
            }

            for(const { diagnosisId: _diagnosisId, data: c } of updates) {
                const diagnosisId = _diagnosisId!;

                const { diagnosisId: __diagnosisId, id, oldDiagnosisId, createdAt, updatedAt, deletedAt, ...payload } = c;

                const updates = {
                    ...payload,
                    publishDate: new Date(),
                };

                await db
                    .update(diagnoses)
                    .set(updates)
                    .where(eq(diagnoses.diagnosisId, diagnosisId))
                    .returning();
            }

            await _saveDiagnosesHistory({ drafts: updates, previous: dataBefore, });
        

        if (inserts.length) {
            // we'll use data before to compare changes
            let dataBefore: typeof diagnoses.$inferSelect[] = [];
            if (inserts.filter(c => c.diagnosisId).length) {
                dataBefore = await db.query.diagnoses.findMany({
                    where: inArray(diagnoses.diagnosisId, inserts.filter(c => c.diagnosisId).map(c => c.diagnosisId!))
                });
            }
            
            for(const { id, scriptId: _scriptId, scriptDraftId, data } of inserts) {
                const diagnosisId = data.diagnosisId || v4();
                const scriptId = (data.scriptId || _scriptId || scriptDraftId)!;
                const payload = { ...data, diagnosisId, scriptId };

                inserts = inserts.map(d => {
                    if (d.id === id) d.data.diagnosisId = diagnosisId;
                    return d;
                });

                await db.insert(diagnoses).values(payload);
            }

            await _saveDiagnosesHistory({ drafts: inserts, previous: dataBefore, });
        }

        await db.delete(diagnosesDrafts).where(or(inArray(diagnosesDrafts.scriptId,myUpdatedScripts),
        inArray(diagnosesDrafts.scriptId,myUpdatedScripts)
    ));

        let deleted = await db.query.pendingDeletion.findMany({
            where: isNotNull(pendingDeletion.diagnosisId),
            columns: { diagnosisId: true, },
            with: {
                diagnosis: {
                    columns: {
                        version: true,
                        scriptId: true,
                    },
                },
            },
        });

        deleted = deleted.filter(c => c.diagnosis);

        if (deleted.length) {
            const deletedAt = new Date();

            await db.update(diagnoses)
                .set({ deletedAt, })
                .where(inArray(diagnoses.diagnosisId, deleted.map(c => c.diagnosisId!)));

            await db.insert(diagnosesHistory).values(deleted.map(c => ({
                version: c.diagnosis!.version,
                diagnosisId: c.diagnosisId!,
                scriptId: c.diagnosis!.scriptId,
                changes: {
                    action: 'delete_diagnosis',
                    description: 'Delete diagnosis',
                    oldValues: [{ deletedAt: null, }],
                    newValues: [{ deletedAt, }],
                },
            })));
        }
      
        await db.delete(pendingDeletion).where(and(or(or(
            isNotNull(pendingDeletion.diagnosisId),
            isNotNull(pendingDeletion.diagnosisDraftId)),
            inArray(pendingDeletion.scriptId,myUpdatedScripts),
             inArray(pendingDeletion.scriptDraftId,myUpdatedScripts))
        ));
    

        const published = [
            // ...inserts.map(c => c.diagnosisId! || c.diagnosisDraftId),
            ...updates.map(c => c.diagnosisId!),
            ...deleted.map(c => c.diagnosisId!),
        ];

        if (published.length) {
            await db.update(diagnoses)
                .set({ version: sql`${diagnoses.version} + 1`, }).
                where(inArray(diagnoses.diagnosisId, published));
        }
    }
  }
     results.success = true;

    } catch(e: any) {
        results.success = false;
        results.errors = [e.message];
        logger.error('_publishDiagnoses ERROR', e);
    } finally {
        return results;
    }
}
