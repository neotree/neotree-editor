import { count } from 'drizzle-orm';

import logger from '@/lib/logger';
import { 
    configKeysDrafts,
    hospitalsDrafts,
    diagnosesDrafts,
    screensDrafts,
    scriptsDrafts ,
    pendingDeletion,
    drugsLibraryDrafts,
    dataKeysDrafts,
} from '@/databases/pg/schema';
import db from '../../pg/drizzle';

export * from './_get-last-changes-dates';

export async function _countPendingDeletion(): Promise<{ errors?: string[]; total: number; }> {
    try {
        const res = await db.select({ count: count(), }).from(pendingDeletion);
        return { total: res[0]?.count || 0, };
    } catch(e: any) {
        logger.error('_countPendingDeletion ERROR', e.message);
        return { total: 0, errors: [e.message], };
    }
}

export const defaultCountDraftsData = {
    scripts: 0,
    screens: 0,
    diagnoses: 0,
    configKeys: 0,
    hospitals: 0,
    drugsLibraryItems: 0,
    total: 0,
    dataKeys: 0,
};

export async function _countDrafts(): Promise<typeof defaultCountDraftsData & { 
    errors?: string[];
}> {
    const data = { ...defaultCountDraftsData, };

    try {
        const scripts = await db.select({ count: count(), }).from(scriptsDrafts);
        data.scripts = scripts[0]?.count || 0;

        const screens = await db.select({ count: count(), }).from(screensDrafts);
        data.screens = screens[0]?.count || 0;

        const diagnoses = await db.select({ count: count(), }).from(diagnosesDrafts);
        data.diagnoses = diagnoses[0]?.count || 0;

        const configKeys = await db.select({ count: count(), }).from(configKeysDrafts);
        data.configKeys = configKeys[0]?.count || 0;

        const hospitals = await db.select({ count: count(), }).from(hospitalsDrafts);
        data.hospitals = hospitals[0]?.count || 0;

        const drugsLibraryItems = await db.select({ count: count(), }).from(drugsLibraryDrafts);
        data.drugsLibraryItems = drugsLibraryItems[0]?.count || 0;

        const dataKeys = await db.select({ count: count(), }).from(dataKeysDrafts);
        data.dataKeys = dataKeys[0]?.count || 0;

        data.total = Object.values(data).reduce((acc, n) => acc + n, 0);
        
        return { ...data, };
    } catch(e: any) {
        logger.error('_countDrafts ERROR', e.message);
        return { ...data, errors: [e.message], };
    }
}
