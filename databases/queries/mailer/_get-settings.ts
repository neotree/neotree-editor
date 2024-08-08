import { and, eq, inArray } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { mailerSettings } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { isEmpty } from "@/lib/isEmpty";

export type GetMailerSettingsParams = {
    names?: string[];
    ids?: number[];
    settingsIds?: string[];
    active?: boolean;
};

export type GetMailerSettingsResults = {
    data: typeof mailerSettings.$inferSelect[];
    errors?: string[];
};

export async function _getMailerSettings(params?: GetMailerSettingsParams): Promise<GetMailerSettingsResults> {
    try {
        const where = [
            ...(!params?.names?.length ? [] : [inArray(mailerSettings.name, params.names)]),
            ...(!params?.settingsIds?.length ? [] : [inArray(mailerSettings.settingId, params.settingsIds)]),
            ...(!params?.ids?.length ? [] : [inArray(mailerSettings.id, params.ids)]),
            ...(isEmpty(params?.active) ? [] : [eq(mailerSettings.isActive, params?.active!)]),
        ];

        const data = await db.query.mailerSettings.findMany({
            where: !where.length ? undefined : and(...where),
        });

        return  { 
            data: data.sort((a, b) => Number(b.isActive!) - Number(a.isActive!))  
        };
    } catch(e: any) {
        logger.error('_getMailerSettings ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}

export type GetActiveMailerSettingsResults = {
    data: null | typeof mailerSettings.$inferSelect;
    errors?: string[];
};

export async function _getActiveMailerSettings(): Promise<GetActiveMailerSettingsResults> {
    try {
        const where = [
            eq(mailerSettings.isActive, true),
        ];

        const data = await db.query.mailerSettings.findFirst({
            where: !where.length ? undefined : and(...where),
        });

        return  { data: data || null, };
    } catch(e: any) {
        logger.error('_getActiveMailerSettings ERROR', e.message);
        return { data: null, errors: [e.message], };
    }
} 
