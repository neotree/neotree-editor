import { and, inArray, or } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { drugsLibrary } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type GetScriptsDrugsLibraryParams = {
    scriptsIds?: string[];
    itemsIds?: string[];
};

export type DrugsLibraryItem = typeof drugsLibrary.$inferSelect;

export type GetScriptsDrugsLibraryResults = {
    data: DrugsLibraryItem[];
    errors?: string[];
};

export async function _getScriptsDrugsLibrary(
    params?: GetScriptsDrugsLibraryParams
): Promise<GetScriptsDrugsLibraryResults> {
    try {
        let { 
            scriptsIds = [], 
            itemsIds = [],
        } = { ...params };

        scriptsIds = scriptsIds.filter(s => uuid.validate(s));
        itemsIds = itemsIds.filter(s => uuid.validate(s));

        const items = await db
            .select({
                item: drugsLibrary,
            })
            .from(drugsLibrary)
            .where(and(
                !itemsIds.length ? undefined : inArray(drugsLibrary.itemId, itemsIds),
                or(
                    !scriptsIds.length ? undefined : inArray(drugsLibrary.scriptId, scriptsIds),
                    !scriptsIds.length ? undefined : inArray(drugsLibrary.scriptDraftId, scriptsIds),
                ),
            ));

        return  { 
            data: items.map(s => s.item),
        };
    } catch(e: any) {
        logger.error('_getScriptsDrugsLibrary ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}
