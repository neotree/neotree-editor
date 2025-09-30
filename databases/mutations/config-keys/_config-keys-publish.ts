import { and, eq, inArray, isNotNull, or, sql } from "drizzle-orm";

import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import { configKeys, configKeysDrafts, configKeysHistory, pendingDeletion } from "@/databases/pg/schema";
import { _saveConfigKeysHistory } from "./_config-keys-history";
import { v4 } from "uuid";

export async function _publishConfigKeys(opts?: {
    broadcastAction?: boolean;
    userId?: string | null;
}) {
    const results: { success: boolean; errors?: string[]; } = { success: false };
    const errors: string[] = [];

    try {
        let updates: (typeof configKeysDrafts.$inferSelect)[] = [];
        let inserts: (typeof configKeysDrafts.$inferSelect)[] = [];

        const res = await db.query.configKeysDrafts.findMany({
            where: !opts?.userId ? undefined : eq(configKeysDrafts.createdByUserId, opts?.userId),
        });

        updates = res.filter(s => s.configKeyId);
        inserts = res.filter(s => !s.configKeyId);

        if (updates.length) {
            // we'll use data before to compare changes
            let dataBefore: typeof configKeys.$inferSelect[] = [];
            if (updates.filter(c => c.configKeyId).length) {
                dataBefore = await db.query.configKeys.findMany({
                    where: inArray(configKeys.configKeyId, updates.filter(c => c.configKeyId).map(c => c.configKeyId!))
                });
            }

            for(const { configKeyId: _configKeyId, data: c } of updates) {
                const configKeyId = _configKeyId!;

                const { configKeyId: __configKeyId, id, oldConfigKeyId, createdAt, updatedAt, deletedAt, ...payload } = c;

                const updates = {
                    ...payload,
                    publishDate: new Date(),
                };

                await db
                    .update(configKeys)
                    .set(updates)
                    .where(eq(configKeys.configKeyId, configKeyId))
                    .returning();
            }

            await _saveConfigKeysHistory({ drafts: updates, previous: dataBefore, });
        }

        if (inserts.length) {
            // we'll use data before to compare changes
            let dataBefore: typeof configKeys.$inferSelect[] = [];
            if (inserts.filter(c => c.configKeyId).length) {
                dataBefore = await db.query.configKeys.findMany({
                    where: inArray(configKeys.configKeyId, inserts.filter(c => c.configKeyId).map(c => c.configKeyId!))
                });
            }
            
            for(const { id, data } of inserts) {
                const configKeyId = data.configKeyId || v4();
                const payload = { ...data, configKeyId };

                inserts = inserts.map(d => {
                    if (d.id === id) d.data.configKeyId = configKeyId;
                    return d;
                });

                await db.insert(configKeys).values(payload);
            }

            await _saveConfigKeysHistory({ drafts: inserts, previous: dataBefore, });
        }

        await db.delete(configKeysDrafts);

        let deleted = await db.query.pendingDeletion.findMany({
            where: and(
                isNotNull(pendingDeletion.configKeyId),
                !opts?.userId ? undefined : eq(pendingDeletion.createdByUserId, opts.userId),
            ),
            columns: { configKeyId: true, },
            with: {
                configKey: {
                    columns: {
                        version: true,
                    },
                },
            },
        });

        deleted = deleted.filter(c => c.configKey);

        if (deleted.length) {
            const deletedAt = new Date();

            await db.update(configKeys)
                .set({ deletedAt, })
                .where(inArray(configKeys.configKeyId, deleted.map(c => c.configKeyId!)));

            await db.insert(configKeysHistory).values(deleted.map(c => ({
                version: c.configKey!.version,
                configKeyId: c.configKeyId!,
                changes: {
                    action: 'delete_config_key',
                    description: 'Delete config key',
                    oldValues: [{ deletedAt: null, }],
                    newValues: [{ deletedAt, }],
                },
            })));
        }

        await db.delete(pendingDeletion).where(and(
            or(
                isNotNull(pendingDeletion.configKeyId),
                isNotNull(pendingDeletion.configKeyDraftId),
            ),
            !opts?.userId ? undefined : eq(pendingDeletion.createdByUserId, opts.userId),
        ));

        const published = [
            // ...inserts.map(c => c.configKeyId! || c.configKeyDraftId),
            ...updates.map(c => c.configKeyId!),
            ...deleted.map(c => c.configKeyId!),
        ];

        if (published.length) {
            await db.update(configKeys)
                .set({ version: sql`${configKeys.version} + 1`, }).
                where(inArray(configKeys.configKeyId, published));
        }

        results.success = true;
    } catch(e: any) {
        results.success = false;
        results.errors = [e.message];
        logger.error('_publishConfigKeys ERROR', e);
    } finally {
        return results;
    }
}
