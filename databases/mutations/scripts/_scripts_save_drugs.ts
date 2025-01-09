import { and, eq, inArray, isNull, or } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { drugsLibrary, scripts, scriptsDrafts } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { _getScriptsDrugsLibrary, DrugsLibraryItem } from "@/databases/queries/scripts";

export type SaveScriptsDrugsLibraryParams = {
    data: (Omit<typeof drugsLibrary.$inferInsert, 'scriptId' | 'scriptDraftId'> & {
        scriptId: string;
    })[];
    returnSaved?: boolean;
};

export type SaveScriptsDrugsLibraryResults = {
    data: DrugsLibraryItem[];
    errors?: string[];
};

export async function _saveScriptsDrugs(
    { data, returnSaved, }: SaveScriptsDrugsLibraryParams
): Promise<SaveScriptsDrugsLibraryResults> {
    try {
        data = data.map(item => ({
            ...item,
            itemId: item.itemId || uuid.v4(),
        }));

        const publishedScripts = await db.query.scripts.findMany({
            where: inArray(scripts.scriptId, data.map(s => s.scriptId)),
            columns: { scriptId: true, },
        });
        const publishedScriptsIds = publishedScripts.map(s => s.scriptId);

        const unPublishedScripts = await db.query.scriptsDrafts.findMany({
            where: and(
                isNull(scriptsDrafts.scriptId),
                inArray(scriptsDrafts.scriptDraftId, data.map(s => s.scriptId)),
            ),
            columns: { scriptId: true, },
        });
        const unPublishedScriptsIds = unPublishedScripts.map(s => s.scriptId);

        const payload = data.map(item => {
            let scriptId = null;
            let scriptDraftId = null;

            if (publishedScriptsIds.includes(item.scriptId)) scriptId = item.scriptId;
            if (unPublishedScriptsIds.includes(item.scriptId)) scriptDraftId = item.scriptId;

            return {
                ...item,
                scriptId,
                scriptDraftId,
                itemId: item.itemId!,
            };
        });

        const savedItems = await db.query.drugsLibrary.findMany({
            where: inArray(drugsLibrary.itemId, payload.map(s => s.itemId)),
            columns: { itemId: true, },
        });

        const inserts = payload.filter(s => !savedItems.map(item => item.itemId).includes(s.itemId));
        const updates = payload.filter(s => savedItems.map(item => item.itemId).includes(s.itemId));

        await db.insert(drugsLibrary).values(inserts);

        for (const { itemId, ...item } of updates) {
            await db.update(drugsLibrary).set(item).where(eq(drugsLibrary.itemId, itemId));
        }

        let saved: DrugsLibraryItem[] = [];

        if (returnSaved) {
            const res = await _getScriptsDrugsLibrary({ itemsIds: payload.map(s => s.itemId), });
            saved = res.data;
        }

        return  { 
            data: saved,
        };
    } catch(e: any) {
        logger.error('_saveScriptsDrugs ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}
