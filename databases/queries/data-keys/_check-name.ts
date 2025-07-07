import { and, eq, inArray, isNull, notInArray, or, sql } from 'drizzle-orm';

import db from '@/databases/pg/drizzle';
import { dataKeys, dataKeysDrafts, pendingDeletion } from '@/databases/pg/schema';

export async function checkDataKeyName(
    names: string | string[],
    opts?: { uuidNot: string | string[]; },
): Promise<{ errors?: string[]; data: { drafts: Record<string, string>; published: Record<string, string>; } }> {
    const _names = Array.isArray(names) ? names : [names];
    const uuids = !opts ? [] : (Array.isArray(opts.uuidNot) ? opts.uuidNot : [opts.uuidNot]);

    try {
        if (!_names.length) return { data: { drafts: {}, published: {}, }, };

        const existingDrafts = !names.length ? [] : await db.query.dataKeysDrafts.findMany({
            where: and(
                inArray(dataKeysDrafts.name, _names),
                !uuids.length ? undefined : notInArray(dataKeysDrafts.uuid, uuids),
            ),
            columns: { name: true, uuid: true, },
        });

        const existingPublished = !names.length ? [] : await db
            .select({ 
                name: dataKeys.name, 
                uuid: dataKeys.uuid, 
                pendingDeletion,
            })
            .from(dataKeys)
            .leftJoin(pendingDeletion, eq(pendingDeletion.dataKeyId, dataKeys.uuid))
            .where(and(
                inArray(sql`lower(${dataKeys.name})`, _names.map(n => n.toLowerCase())),
                !uuids.length ? undefined : notInArray(dataKeys.uuid, uuids),
                isNull(pendingDeletion)
            ));

        const drafts = existingDrafts.reduce((acc, d) => ({
            ...acc,
            [d.name]: d.uuid,
        }), {} as Record<string, string>);

        const published = existingPublished.reduce((acc, d) => ({
            ...acc,
            [d.name]: d.uuid,
        }), {} as Record<string, string>);

        return { data: { drafts, published, }, };
    } catch(e: any) {
        return { errors: [e.message], data: { drafts: {}, published: {}, }, };
    }
}
