import { desc } from 'drizzle-orm';

import logger from '@/lib/logger';
import { 
    configKeys, 
    diagnoses,
    screens, 
    scripts,
    configKeysDrafts,
    diagnosesDrafts,
    screensDrafts,
    scriptsDrafts ,
    pendingDeletion
} from '@/databases/pg/schema';
import db from '../../pg/drizzle';

export const defaultChangesDates = {
    configKeys: null as null | Date, 
    diagnoses: null as null | Date,
    screens: null as null | Date, 
    scripts: null as null | Date,
    configKeysDrafts: null as null | Date,
    diagnosesDrafts: null as null | Date,
    screensDrafts: null as null | Date,
    scriptsDrafts: null as null | Date ,
    pendingDeletion: null as null | Date,
    lastPublished: null as null | Date,
    latestChangesDate: null as null | Date,
};

export async function _getDatesWhenUpdatesWereMade(): Promise<{ data: typeof defaultChangesDates; errors?: string[]; }> {
    try {
        const editorInfo = await db.query.editorInfo.findFirst();
        const { lastPublishDate } = { ...editorInfo };

        const configKeysDraftsRes = await db
            .select({ configKeysDrafts: configKeysDrafts.updatedAt, })
            .from(configKeysDrafts).orderBy(desc(configKeysDrafts.updatedAt))
            .limit(1);

        const diagnosesDraftsRes = await db
            .select({ diagnosesDrafts: diagnosesDrafts.updatedAt, })
            .from(diagnosesDrafts).orderBy(desc(diagnosesDrafts.updatedAt))
            .limit(1);

        const screensDraftsRes = await db
            .select({ screensDrafts: screensDrafts.updatedAt, })
            .from(screensDrafts).orderBy(desc(screensDrafts.updatedAt))
            .limit(1);

        const scriptsDraftsRes = await db
            .select({ scriptsDrafts: scriptsDrafts.updatedAt, })
            .from(scriptsDrafts).orderBy(desc(scriptsDrafts.updatedAt))
            .limit(1);

        const configKeysRes = await db
            .select({ configKeys: configKeys.updatedAt, })
            .from(configKeys).orderBy(desc(configKeys.updatedAt))
            .limit(1);

        const diagnosesRes = await db
            .select({ diagnoses: diagnoses.updatedAt, })
            .from(diagnoses).orderBy(desc(diagnoses.updatedAt))
            .limit(1);

        const screensRes = await db
            .select({ screens: screens.updatedAt, })
            .from(screens).orderBy(desc(screens.updatedAt))
            .limit(1);

        const scriptsRes = await db
            .select({ scripts: scripts.updatedAt, })
            .from(scripts).orderBy(desc(scripts.updatedAt))
            .limit(1);

        const pendingDeletionRes = await db
            .select({ pendingDeletion: pendingDeletion.createdAt, })
            .from(pendingDeletion).orderBy(desc(pendingDeletion.createdAt))
            .limit(1);

        const data = {
            ...defaultChangesDates,
            ...configKeysDraftsRes[0],
            ...diagnosesDraftsRes[0],
            ...screensDraftsRes[0],
            ...scriptsDraftsRes[0],
            ...configKeysRes[0],
            ...diagnosesRes[0],
            ...screensRes[0],
            ...scriptsRes[0],
            ...pendingDeletionRes[0],
            lastPublished: lastPublishDate || null,
        };

        const dates = [
            lastPublishDate ? new Date(lastPublishDate).getTime() : null!,
            ...Object.values(data).filter(d => d).map(d => new Date(d!).getTime()),
        ].filter(d => d);

        let latestChangesDate = lastPublishDate!;
        if (dates.length) latestChangesDate = new Date(Math.max(...dates));

        return { 
            data: {
                ...data,
                latestChangesDate,
            }, 
        };
    } catch(e: any) {
        logger.error('_getDatesWhenUpdatesWereMade ERROR', e.message);
        return { data: defaultChangesDates, errors: [e.message], };
    }
}
