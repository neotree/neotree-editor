import '@/server/env';
import { eq, inArray, isNotNull, or, sql } from "drizzle-orm";

import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import { dataKeys, dataKeysDrafts, dataKeysHistory, pendingDeletion } from "@/databases/pg/schema";
import { _saveDataKeysHistory } from "./_history";
import { v4 } from "uuid";

(async () => {
    try {
        await _publishDataKeys();
    } finally {
        process.exit();
    }
})();

export async function _publishDataKeys(opts?: {
    broadcastAction?: boolean;
}) {
    const results: { success: boolean; errors?: string[]; } = { success: false };
    const errors: string[] = [];

    try {
        let updates: (typeof dataKeysDrafts.$inferSelect)[] = [];
        let inserts: (typeof dataKeysDrafts.$inferSelect)[] = [];

        const res = await db.query.dataKeysDrafts.findMany();

        updates = res.filter(s => s.dataKeyId);
        inserts = res.filter(s => !s.dataKeyId);

        if (updates.length) {
            // we'll use data before to compare changes
            let dataBefore: typeof dataKeys.$inferSelect[] = [];
            if (updates.filter(c => c.dataKeyId).length) {
                dataBefore = await db.query.dataKeys.findMany({
                    where: inArray(dataKeys.uuid, updates.filter(c => c.dataKeyId).map(c => c.dataKeyId!))
                });
            }

            for(const { dataKeyId: _dataKeyId, data: c } of updates) {
                const dataKeyId = _dataKeyId!;

                const { uuid: __uuid, id, createdAt, updatedAt, deletedAt, ...payload } = c;

                const updates = {
                    ...payload,
                    publishDate: new Date(),
                };

                await db
                    .update(dataKeys)
                    .set(updates)
                    .where(eq(dataKeys.uuid, dataKeyId))
                    .returning();
            }

            await _saveDataKeysHistory({ drafts: updates, previous: dataBefore, });
        }

        if (inserts.length) {
            // we'll use data before to compare changes
            let dataBefore: typeof dataKeys.$inferSelect[] = [];
            if (inserts.filter(c => c.dataKeyId).length) {
                dataBefore = await db.query.dataKeys.findMany({
                    where: inArray(dataKeys.uuid, inserts.filter(c => c.dataKeyId).map(c => c.dataKeyId!))
                });
            }
            
            for(const { id, data } of inserts) {
                const dataKeyUuid = data.uuid || v4();
                const payload = { ...data, uuid: dataKeyUuid };

                inserts = inserts.map(d => {
                    if (d.id === id) d.data.uuid = dataKeyUuid;
                    return d;
                });

                await db.insert(dataKeys).values(payload);
            }

            await _saveDataKeysHistory({ drafts: inserts, previous: dataBefore, });
        }

        await db.delete(dataKeysDrafts);

        let deleted = await db.query.pendingDeletion.findMany({
            where: isNotNull(pendingDeletion.dataKeyId),
            columns: { dataKeyId: true, },
            with: {
                dataKey: {
                    columns: {
                        version: true,
                    },
                },
            },
        });

        deleted = deleted.filter(c => c.dataKey);

        if (deleted.length) {
            const deletedAt = new Date();

            await db.update(dataKeys)
                .set({ deletedAt, })
                .where(inArray(dataKeys.uuid, deleted.map(c => c.dataKeyId!)));

            await db.insert(dataKeysHistory).values(deleted.map(c => ({
                version: c.dataKey!.version,
                dataKeyId: c.dataKeyId!,
                changes: {
                    action: 'delete_data_key',
                    description: 'Delete data key',
                    oldValues: [{ deletedAt: null, }],
                    newValues: [{ deletedAt, }],
                },
            })));
        }

        await db.delete(pendingDeletion).where(or(
            isNotNull(pendingDeletion.dataKeyId),
            isNotNull(pendingDeletion.dataKeyDraftId),
        ));

        const published = [
            // ...inserts.map(c => c.dataKeyId! || c.dataKeyDraftId),
            ...updates.map(c => c.dataKeyId!),
            ...deleted.map(c => c.dataKeyId!),
        ];

        if (published.length) {
            await db.update(dataKeys)
                .set({ version: sql`${dataKeys.version} + 1`, }).
                where(inArray(dataKeys.uuid, published));
        }

        results.success = true;
    } catch(e: any) {
        results.success = false;
        results.errors = [e.message];
        logger.error('_publishDataKeys ERROR', e);
    } finally {
        return results;
    }
}
