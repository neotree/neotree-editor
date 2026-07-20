import { count, eq } from 'drizzle-orm';

import logger from '@/lib/logger';
import { 
    configKeysDrafts,
    hospitalsDrafts,
    diagnosesDrafts,
    problemsDrafts,
    screensDrafts,
    scriptsDrafts ,
    pendingDeletion,
    drugsLibraryDrafts,
    dataKeysDrafts,
} from '@/databases/pg/schema';
import db from '../../pg/drizzle';

export * from './_get-last-changes-dates';

export async function _countPendingDeletion(userId?: string | null): Promise<{ errors?: string[]; total: number; }> {
    try {
        const query = db.select({ count: count(), }).from(pendingDeletion);
        const res = userId
            ? await query.where(eq(pendingDeletion.createdByUserId, userId))
            : await query;
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
    problems: 0,
    configKeys: 0,
    hospitals: 0,
    drugsLibraryItems: 0,
    total: 0,
    dataKeys: 0,
};

export async function _countDrafts(userId?: string | null): Promise<typeof defaultCountDraftsData & { 
    errors?: string[];
}> {
    const data = { ...defaultCountDraftsData, };
    const countRows = async <TTable, TColumn>(table: TTable, column: TColumn) => {
        const query = db.select({ count: count(), }).from(table as any);
        const rows = userId
            ? await query.where(eq(column as any, userId))
            : await query;
        return rows[0]?.count || 0;
    };

    try {
        data.scripts = await countRows(scriptsDrafts, scriptsDrafts.createdByUserId);
        data.screens = await countRows(screensDrafts, screensDrafts.createdByUserId);
        data.diagnoses = await countRows(diagnosesDrafts, diagnosesDrafts.createdByUserId);
        data.problems = await countRows(problemsDrafts, problemsDrafts.createdByUserId);
        data.configKeys = await countRows(configKeysDrafts, configKeysDrafts.createdByUserId);
        data.hospitals = await countRows(hospitalsDrafts, hospitalsDrafts.createdByUserId);
        data.drugsLibraryItems = await countRows(drugsLibraryDrafts, drugsLibraryDrafts.createdByUserId);
        data.dataKeys = await countRows(dataKeysDrafts, dataKeysDrafts.createdByUserId);

        data.total = Object.values(data).reduce((acc, n) => acc + n, 0);
        
        return { ...data, };
    } catch(e: any) {
        logger.error('_countDrafts ERROR', e.message);
        return { ...data, errors: [e.message], };
    }
}
