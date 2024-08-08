import { and, eq, gte, inArray, isNull, notInArray, or } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { 
    scripts as scriptsTable,
    scriptsDrafts as  scriptsDraftsTable,
    screens as screensTable, 
    screensDrafts as screensDraftsTable, 
    diagnoses as diagnosesTable, 
    diagnosesDrafts as diagnosesDraftsTable, 
} from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type GetScriptsParams = {
    scriptsIds?: string[];
    published?: boolean;
};

export type GetScriptsResults = {
    data: (typeof scriptsTable.$inferSelect & {
        isDraft: boolean;
        publishedVersion: null | number;
        screens: (typeof screensTable.$inferSelect & {
            isDraft: boolean;
            publishedVersion: null | number;
        })[];
        diagnoses: (typeof diagnosesTable.$inferSelect & {
            isDraft: boolean;
            publishedVersion: null | number;
        })[];
    })[];
    errors?: string[];
};

export async function _getScriptsWithItems(params?: GetScriptsParams): Promise<GetScriptsResults> {
    try {
        const whereScriptsDrafts = [
            isNull(scriptsDraftsTable.scriptId),
            ...(!params?.scriptsIds?.length ? [] : [or(
                inArray(scriptsDraftsTable.scriptId, params.scriptsIds),
                inArray(scriptsDraftsTable.scriptDraftId, params.scriptsIds)
            )]),
        ];

        const scriptsDrafts = params?.published ? [] : await db.query.scriptsDrafts.findMany({
            where: !whereScriptsDrafts.length ? undefined : and(...whereScriptsDrafts),
            with: {
                screensDrafts: {
                    where: isNull(screensDraftsTable.scriptId),
                },
                diagnosesDrafts: {
                    where: isNull(scriptsDraftsTable.scriptId),
                },
            },
        });

        let whereScriptsIdsInArray = params?.scriptsIds || [];
        const whereScriptsIdsNotInArray: string[] = [];

        scriptsDrafts.forEach(s => {
            if (s.scriptId) {
                whereScriptsIdsInArray = whereScriptsIdsInArray.filter(id => id !== s.scriptId);
                whereScriptsIdsNotInArray.push(s.scriptId);
            }
        });

        const whereScripts = [
            isNull(scriptsTable.deletedAt),
            ...(!whereScriptsIdsInArray.length ? [] : [inArray(scriptsTable.scriptId, whereScriptsIdsInArray)]),
            ...(!whereScriptsIdsNotInArray.length ? [] : [notInArray(scriptsTable.scriptId, whereScriptsIdsNotInArray)]),
        ];

        let publishedScripts = await db.query.scripts.findMany({
            where: !whereScripts.length ? undefined : and(...whereScripts),
            with: {
                screens: true,
                screensDrafts: params?.published ? undefined : true,
                diagnoses: true,
                diagnosesDrafts: params?.published ? undefined : true,
            },
        });

        publishedScripts = publishedScripts.map(s => ({
            ...s,
            screensDrafts: s.screensDrafts || [],
            diagnosesDrafts: s.diagnosesDrafts || [],
        }));

        let data = publishedScripts
            .reduce((acc, { screens, screensDrafts, ...s }) => {
                return {
                    ...acc,
                    [s.scriptId]: {
                        ...s,
                        screens: [],
                        diagnoses: [],
                        isDraft: false,
                        publishedVersion: s.version,
                    },
                };
            }, {} as { [key: string]: GetScriptsResults['data'][0] });

        data = scriptsDrafts
            .reduce((acc, { screensDrafts, ...s }) => {
                return {
                    ...acc,
                    [s.scriptDraftId]: {
                        ...s.data as typeof scriptsTable.$inferSelect,
                        screens: [],
                        diagnoses: [],
                        isDraft: true,
                        publishedVersion: !s.scriptId ? null : Math.max(1, s.data.version - 1),
                    },
                };
            }, data);

        scriptsDrafts.forEach(s => s.screensDrafts.map(screenDraft => {
            data[s.scriptDraftId].screens.push({
                ...screenDraft.data as typeof screensTable.$inferSelect,
                isDraft: true,
                publishedVersion: !screenDraft.screenId ? null : Math.max(1, s.data.version - 1),
            });
        }));

        publishedScripts.forEach(s => s.screensDrafts.forEach(screenDraft => {
            if (screenDraft.screenId && !data[s.scriptId].screens.map(s => s.screenId).includes(screenDraft.screenId)) {
                data[s.scriptId].screens.push({
                    ...screenDraft.data as typeof screensTable.$inferSelect,
                    isDraft: true,
                    publishedVersion: !screenDraft.screenId ? null : Math.max(1, s.version - 1),
                });
            }
        }));

        publishedScripts.forEach(s => s.screens.forEach(screen => {
            if (screen.screenId && !data[s.scriptId].screens.map(s => s.screenId).includes(screen.screenId)) {
                data[s.scriptId].screens.push({
                    ...screen,
                    isDraft: true,
                    publishedVersion: s.version,
                });
            }
        }));

        const response =  {
            data: Object.values(data).sort((a, b) => a.position - b.position).map(s => ({
                ...s,
                screens: s.screens.sort((a, b) => a.position - b.position),
                // diagnoses: s.diagnoses.sort((a, b) => a.position - b.position),
            })),
        };
        
        return response;
    } catch(e: any) {
        logger.error('_getScriptsWithItems ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}
