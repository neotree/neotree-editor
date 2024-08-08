import { and, eq, inArray, or } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { emailTemplates } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type GetEmailTemplatesParams = {
    names?: string[];
    templatesIds?: string[];
    ids?: number[];
    active?: boolean;
};

export type EmailTemplateDataBlock = {
    paragraph?: {
        text: string;
    },
    image?: {
        src: string;
        alt: string;
    },
    button?: {
        text: string;
    },
    title?: {
        text: string;
    },
    link?: {
        text: string;
    },
};

export type GetEmailTemplatesResults = {
    data: (typeof emailTemplates.$inferSelect & {
        data: EmailTemplateDataBlock[];
    })[];
    errors?: string[];
};

export async function _getEmailTemplates(params?: GetEmailTemplatesParams): Promise<GetEmailTemplatesResults> {
    try {
        const where = [
            ...(!params?.names?.length ? [] : [inArray(emailTemplates.name, params.names)]),
            ...(!params?.templatesIds?.length ? [] : [inArray(emailTemplates.templateId, params.templatesIds)]),
            ...(!params?.ids?.length ? [] : [inArray(emailTemplates.id, params.ids)]),
        ];

        const data = await db.query.emailTemplates.findMany({
            where: !where.length ? undefined : and(...where),
        });

        return  { 
            data: data.map(t => ({
                ...t,
                data: t.data as EmailTemplateDataBlock[],
            })),
        };
    } catch(e: any) {
        logger.error('_getEmailTemplates ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}

export type GetEmailTemplateResults = {
    data: null | typeof emailTemplates.$inferSelect;
    errors?: string[];
};

export async function _getEmailTemplate(nameOrId: number | string): Promise<GetEmailTemplateResults> {
    try {
        const name = typeof nameOrId === 'string' ? nameOrId : '';
        let id = typeof nameOrId === 'number' ? nameOrId : null;
        if (!id && name && !isNaN(Number(name))) id = Number(name);

        let whereName = name ? eq(emailTemplates.name, name) : undefined;
        if (!id && name && !isNaN(Number(name))) {
            whereName = or(
                eq(emailTemplates.name, name),
                eq(emailTemplates.id, Number(name)),
            );
        }

        const where = [
            whereName,
            id ? eq(emailTemplates.id, id) : undefined,
        ];

        const data = await db.query.emailTemplates.findFirst({
            where: !where.length ? undefined : and(...where),
        });

        return  { data: data || null, };
    } catch(e: any) {
        logger.error('_getEmailTemplate ERROR', e.message);
        return { data: null, errors: [e.message], };
    }
} 
