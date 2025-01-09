import { and, eq, inArray, isNull, or } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { drugsLibrary, scripts, scriptsDrafts } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { _getScriptsDrugsLibrary, DrugsLibraryItem } from "@/databases/queries/scripts";

export type DeleteScriptsDrugsParams = {
    scriptsIds?: string[];
    itemsIds?: string[];
};

export type DeleteScriptsDrugsResults = {
    data: { success: boolean; };
    errors?: string[];
};

export async function _deleteScriptsDrugs(
    params?: DeleteScriptsDrugsParams
): Promise<DeleteScriptsDrugsResults> {
    try {
        const { scriptsIds, itemsIds, } = { ...params };

        const where = [
            !itemsIds?.length ? undefined : inArray(drugsLibrary.itemId, itemsIds),
            or(
                !scriptsIds?.length ? undefined : inArray(drugsLibrary.scriptId, scriptsIds),
                !scriptsIds?.length ? undefined : inArray(drugsLibrary.scriptDraftId, scriptsIds),
            ),
        ];

        await db.delete(drugsLibrary).where(and(...where));

        return  { 
            data: { success: true, },
        };
    } catch(e: any) {
        logger.error('_deleteScriptsDrugs ERROR', e.message);
        return { data: { success: false, }, errors: [e.message], };
    }
}
