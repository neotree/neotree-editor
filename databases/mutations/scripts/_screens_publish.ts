import { eq, inArray, isNotNull, or, sql,and } from "drizzle-orm";

import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import { pendingDeletion, screens, screensDrafts, screensHistory } from "@/databases/pg/schema";
import { _saveScreensHistory } from "./_screens_history";
import { v4 } from "uuid";
import { _generateScreenAliases } from "../aliases/_aliases_save";
import {getChangedScripts} from "../script-lock/_script_lock_save"

export async function _publishScreens(opts?: {
    scriptsIds?: string[];
    screensIds?: string[];
    broadcastAction?: boolean;
}) {
    const { scriptsIds, screensIds, } = { ...opts, };

    // GENERATE ALIASES FOR ALL UPDATED SCREENS


    const results: { success: boolean; errors?: string[]; } = { success: false };
    const errors: string[] = [];

 const myUpdatedScripts = await getChangedScripts()
    try {
        if(myUpdatedScripts && myUpdatedScripts.length>0){
        let updates: (typeof screensDrafts.$inferSelect)[] = [];
        let inserts: (typeof screensDrafts.$inferSelect)[] = [];

        const res = await db.query.screensDrafts.findMany({
                where:(
                    inArray(screensDrafts.scriptId, myUpdatedScripts)
                ),
        });
        updates = res.filter(s => s.screenId);
        inserts = res.filter(s => !s.screenId);
      

        if (updates.length) {
            // we'll use data before to compare changes
            let dataBefore: typeof screens.$inferSelect[] = [];
            if (updates.filter(c => c.screenId).length) {
                dataBefore = await db.query.screens.findMany({
                    where: inArray(screens.screenId, updates.filter(c => c.screenId).map(c => c.screenId!))
                });
            }

            for (const { screenId: _screenId, data: c } of updates) {
                const screenId = _screenId!;
                const { screenId: __screenId, id, oldScreenId, createdAt, updatedAt, deletedAt, ...payload } = c;

                const updates = {
                    ...payload,
                    publishDate: new Date(),
                };


                await db
                    .update(screens)
                    .set(updates)
                    .where(eq(screens.screenId, screenId))
                    .returning();
            }

            await _saveScreensHistory({ drafts: updates, previous: dataBefore, });
        }

        if (inserts.length) {
            // we'll use data before to compare changes
            let dataBefore: typeof screens.$inferSelect[] = [];
            if (inserts.filter(c => c.screenId).length) {
                dataBefore = await db.query.screens.findMany({
                    where: inArray(screens.screenId, inserts.filter(c => c.screenId).map(c => c.screenId!))
                });
            }

            for (const { id, scriptId: _scriptId, scriptDraftId, data } of inserts) {
                const screenId = data.screenId || v4();
                const scriptId = (data.scriptId || _scriptId || scriptDraftId)!;
                const payload = { ...data, screenId, scriptId };

                inserts = inserts.map(d => {
                    if (d.id === id) d.data.screenId = screenId;
                    return d;
                });

                await db.insert(screens).values(payload);
            }

            await _saveScreensHistory({ drafts: inserts, previous: dataBefore, });
        }

        await db.delete(screensDrafts)
        .where(or(inArray(screensDrafts.scriptId,myUpdatedScripts),
        inArray(screensDrafts.scriptDraftId,myUpdatedScripts)));

        let deleted = await db.query.pendingDeletion.findMany({
            where: isNotNull(pendingDeletion.screenId),
            columns: { screenId: true, },
            with: {
                screen: {
                    columns: {
                        version: true,
                        scriptId: true,
                    },
                },
            },
        });

        deleted = deleted.filter(c => c.screen);

        if (deleted.length) {
            const deletedAt = new Date();

            await db.update(screens)
                .set({ deletedAt, })
                .where(inArray(screens.screenId, deleted.map(c => c.screenId!)));

            await db.insert(screensHistory).values(deleted.map(c => ({
                version: c.screen!.version,
                screenId: c.screenId!,
                scriptId: c.screen!.scriptId,
                changes: {
                    action: 'delete_screen',
                    description: 'Delete screen',
                    oldValues: [{ deletedAt: null, }],
                    newValues: [{ deletedAt, }],
                },
            })));
        }
     
        await db.delete(pendingDeletion).where(and(or(or(
            isNotNull(pendingDeletion.screenId),
            isNotNull(pendingDeletion.screenDraftId)),
            inArray(pendingDeletion.scriptId,myUpdatedScripts),
            inArray(pendingDeletion.scriptDraftId,myUpdatedScripts))
            
        ));

        const published = [
            // ...inserts.map(c => c.screenId! || c.screenDraftId),
            ...updates.map(c => c.screenId!),
            ...deleted.map(c => c.screenId!),
        ];

        const updatedScripts = Array.from(
            new Set(
                (updates ?? [])
                    .map(ud => ud.scriptId)
                    .filter((id): id is string => Boolean(id))
            )
        );
        if (updatedScripts.length) {
            await _generateScreenAliases(updatedScripts)
        }

        if (published.length) {
            await db.update(screens)
                .set({ version: sql`${screens.version} + 1`, }).
                where(inArray(screens.screenId, published));
        }
    }

        results.success = true;
    } catch (e: any) {
        results.success = false;
        results.errors = [e.message];
        logger.error('_publishScreens ERROR', e);
    } finally {
        return results;
    }
}