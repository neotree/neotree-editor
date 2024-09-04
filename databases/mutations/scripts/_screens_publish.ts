import { eq, inArray, isNotNull, or } from "drizzle-orm";

import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import { screens, screensDrafts } from "@/databases/pg/schema";
import { _saveScreensHistory } from "./_screens_history";
import { v4 } from "uuid";

export async function _publishScreens(opts?: {
    scriptsIds?: string[];
    screensIds?: string[];
    broadcastAction?: boolean;
}) {
    const { scriptsIds, screensIds, } = { ...opts, };

    const results: { success: boolean; errors?: string[]; } = { success: false };
    const errors: string[] = [];

    try {
        let updates: (typeof screensDrafts.$inferSelect)[] = [];
        let inserts: (typeof screensDrafts.$inferSelect)[] = [];

        if (scriptsIds?.length || screensIds?.length) {
            const res = await db.query.screensDrafts.findMany({
                where: or(
                    !scriptsIds?.length ? undefined : inArray(screensDrafts.scriptId, scriptsIds),
                    !scriptsIds?.length ? undefined : inArray(screensDrafts.scriptDraftId, scriptsIds),
                    !screensIds?.length ? undefined : inArray(screensDrafts.screenId, screensIds),
                    !screensIds?.length ? undefined : inArray(screensDrafts.screenDraftId, screensIds),
                ),
            });

            updates = res.filter(s => s.screenId);
            inserts = res.filter(s => !s.screenId);
        } else {
            const _screensDrafts = await db.query.screensDrafts.findMany({
                where: isNotNull(screensDrafts.scriptId),
            });
            updates = _screensDrafts.filter(s => s.screenId);
            inserts = _screensDrafts.filter(s => !s.screenId);
        }

        if (updates.length) {
            // we'll use data before to compare changes
            let dataBefore: typeof screens.$inferSelect[] = [];
            if (updates.filter(c => c.screenId).length) {
                dataBefore = await db.query.screens.findMany({
                    where: inArray(screens.screenId, updates.filter(c => c.screenId).map(c => c.screenId!))
                });
            }

            for(const { screenId: _screenId, data: c } of updates) {
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
            
            for(const { id, scriptId: _scriptId, scriptDraftId, data } of inserts) {
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

        results.success = true;
    } catch(e: any) {
        results.success = false;
        results.errors = [e.message];
        logger.error('_publishScreens ERROR', e);
    } finally {
        return results;
    }
}
