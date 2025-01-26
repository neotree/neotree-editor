import { and, eq, inArray, isNotNull, isNull, notInArray, or, sql } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { scripts, scriptsDrafts, pendingDeletion, hospitals, } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { ScriptField, Preferences, PrintSection } from "@/types";
import { _getScripts, GetScriptsParams } from "./_scripts_get";
import { _getDrugsLibraryItems } from "../drugs-library";
import { _getScreens } from "./_screens_get";

export type GetScriptsDrugsLibraryParams = GetScriptsParams & {
    
};

export async function _getScriptsDrugsLibrary(
    params?: GetScriptsParams
): Promise<Awaited<ReturnType<typeof _getDrugsLibraryItems>>> {
    try {
        const scripts = await _getScripts(params);

        const screens = await _getScreens({
            types: ['drugs', 'feeds', 'fluids'],
            scriptsIds: scripts.data.map(s => s.scriptId),
            returnDraftsIfExist: params?.returnDraftsIfExist,
            withDeleted: params?.withDeleted,
        });

        const keys = Object.keys(
            screens.data.reduce((acc, s) => {
                const items = [...s.drugs, ...s.fluids, ...s.feeds];
                items.forEach(d => {
                    acc[d.key] = d.key;
                });
                return acc;
            }, {} as { [key: string]: string; })
        );

        return await _getDrugsLibraryItems({ 
            keys,
            returnDraftsIfExist: params?.returnDraftsIfExist,
            withDeleted: params?.withDeleted,
        });
    } catch(e: any) {
        logger.error('_getScriptsDrugsLibrary ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}
