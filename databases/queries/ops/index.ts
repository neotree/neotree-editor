import { count } from 'drizzle-orm';

import logger from '@/lib/logger';
import { 
    configKeysDrafts,
    diagnosesDrafts,
    screensDrafts,
    scriptsDrafts ,
    pendingDeletion
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
    total: 0,
};

export async function _countDrafts(): Promise<{ 
    scripts: number;
    screens: number;
    diagnoses: number;
    configKeys: number;
    total: number;
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

        data.total = data.configKeys + data.diagnoses + data.screens + data.scripts;
        
        return { ...data, };
    } catch(e: any) {
        logger.error('_countDrafts ERROR', e.message);
        return { ...data, errors: [e.message], };
    }
}
