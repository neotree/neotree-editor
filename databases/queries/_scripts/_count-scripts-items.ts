import { and, count, eq, inArray, isNull, or, sql } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { 
    diagnoses,
    diagnosesDrafts,
    screens, 
    screensDrafts, 
    scripts, 
    scriptsDrafts 
} from '@/databases/pg/schema';

export async function _countScriptsItems(
    itemsType: 'screens' | 'diagnoses',
    { scriptsIds, itemsTypes }: {
        scriptsIds: string[];
        itemsTypes?: typeof screens.$inferInsert['type'][];
    }
) {
    const response: { 
        data: {
            scriptId: string,
            total: number;
            drafts: number;
            published: number;
        }[]; 
        errors?: string[]; 
    } = { data: [], };

    try {
        for(const scriptId of scriptsIds) {
            if (itemsType === 'screens') {
                const whereScreensTypes = !itemsTypes?.length ? undefined : inArray(screens.type, itemsTypes);
                const whereScreensDraftsTypes = !itemsTypes?.length ? undefined : inArray(screensDrafts.type, itemsTypes);

                const countScriptsItems = await db
                    .select({
                        drafts: count(screensDrafts.id),
                        published: count(screens.id),
                    })
                    .from(scripts)
                    .leftJoin(screens, and(
                        eq(screens.scriptId, scripts.scriptId),
                        whereScreensTypes
                    ))
                    .leftJoin(screensDrafts, and(
                        eq(screensDrafts.scriptDraftId, scripts.scriptId),
                        whereScreensDraftsTypes,
                    ))
                    .where(eq(scripts.scriptId, scriptId));

                const countScriptsDraftsItems = await db
                    .select({
                        drafts: count(screensDrafts.id),
                        published: count(screens.id),
                    })
                    .from(scriptsDrafts)
                    .leftJoin(screens, and(
                        eq(screens.scriptId, scriptsDrafts.scriptDraftId),
                        whereScreensTypes,
                    ))
                    .leftJoin(screensDrafts, and(
                        eq(screensDrafts.scriptDraftId, scriptsDrafts.scriptDraftId),
                        whereScreensDraftsTypes
                    ))
                    .where(eq(scriptsDrafts.scriptDraftId, scriptId));

                const scripts_screensDraftsCount = countScriptsItems[0]?.drafts || 0;
                const scripts_screensCount = countScriptsItems[0]?.published || 0;

                const scriptsDrafts_screensDraftsCount = countScriptsDraftsItems[0]?.drafts || 0;
                const scriptsDrafts_screensCount = countScriptsDraftsItems[0]?.published || 0;

                const drafts = scripts_screensDraftsCount + scriptsDrafts_screensDraftsCount;
                const published = scripts_screensCount + scriptsDrafts_screensCount;

                response.data.push({
                    scriptId,
                    drafts,
                    published,
                    total: drafts + published,
                });
            } else if (itemsType === 'diagnoses') {
                const countScriptsItems = await db
                    .select({
                        drafts: count(diagnosesDrafts.id),
                        published: count(diagnoses.id),
                    })
                    .from(scripts)
                    .leftJoin(diagnoses, eq(diagnoses.scriptId, scripts.scriptId))
                    .leftJoin(diagnosesDrafts, eq(diagnosesDrafts.scriptDraftId, scripts.scriptId))
                    .where(eq(scripts.scriptId, scriptId));

                const countScriptsDraftsItems = await db
                    .select({
                        drafts: count(diagnosesDrafts.id),
                        published: count(diagnoses.id),
                    })
                    .from(scriptsDrafts)
                    .leftJoin(diagnoses, eq(diagnoses.scriptId, scriptsDrafts.scriptDraftId))
                    .leftJoin(diagnosesDrafts, eq(diagnosesDrafts.scriptDraftId, scriptsDrafts.scriptDraftId))
                    .where(eq(scriptsDrafts.scriptDraftId, scriptId));

                const scripts_diagnosesDraftsCount = countScriptsItems[0]?.drafts || 0;
                const scripts_diagnosesCount = countScriptsItems[0]?.published || 0;

                const scriptsDrafts_diagnosesDraftsCount = countScriptsDraftsItems[0]?.drafts || 0;
                const scriptsDrafts_diagnosesCount = countScriptsDraftsItems[0]?.published || 0;

                const drafts = scripts_diagnosesDraftsCount + scriptsDrafts_diagnosesDraftsCount;
                const published = scripts_diagnosesCount + scriptsDrafts_diagnosesCount;

                response.data.push({
                    scriptId,
                    drafts,
                    published,
                    total: drafts + published,
                });
            }
        }
    } catch(e: any) {
        response.errors = [e.message];
        logger.error('_countScriptsItems ERROR', e.message);
    } finally {
        return response;
    }
}
