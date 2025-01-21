import { eq, inArray, isNotNull, or, sql } from "drizzle-orm";

import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import { drugsLibrary, drugsLibraryDrafts, drugsLibraryHistory, pendingDeletion } from "@/databases/pg/schema";
import { _saveDrugsLibraryItemsHistory } from "./_drugs-library-history";
import { v4 } from "uuid";

export async function _publishDrugsLibraryItems(opts?: {
    broadcastAction?: boolean;
}) {
    const results: { success: boolean; errors?: string[]; } = { success: false };
    const errors: string[] = [];

    try {
        let updates: (typeof drugsLibraryDrafts.$inferSelect)[] = [];
        let inserts: (typeof drugsLibraryDrafts.$inferSelect)[] = [];

        const res = await db.query.drugsLibraryDrafts.findMany();

        updates = res.filter(s => s.itemId);
        inserts = res.filter(s => !s.itemId);

        if (updates.length) {
            // we'll use data before to compare changes
            let dataBefore: typeof drugsLibrary.$inferSelect[] = [];
            if (updates.filter(c => c.itemId).length) {
                dataBefore = await db.query.drugsLibrary.findMany({
                    where: inArray(drugsLibrary.itemId, updates.filter(c => c.itemId).map(c => c.itemId!))
                });
            }

            for(const { itemId: _itemId, data: c } of updates) {
                const itemId = _itemId!;

                const { itemId: __itemId, id, createdAt, updatedAt, deletedAt, ...payload } = c;

                const updates = {
                    ...payload,
                    publishDate: new Date(),
                };

                await db
                    .update(drugsLibrary)
                    .set(updates)
                    .where(eq(drugsLibrary.itemId, itemId))
                    .returning();
            }

            await _saveDrugsLibraryItemsHistory({ drafts: updates, previous: dataBefore, });
        }

        if (inserts.length) {
            // we'll use data before to compare changes
            let dataBefore: typeof drugsLibrary.$inferSelect[] = [];
            if (inserts.filter(c => c.itemId).length) {
                dataBefore = await db.query.drugsLibrary.findMany({
                    where: inArray(drugsLibrary.itemId, inserts.filter(c => c.itemId).map(c => c.itemId!))
                });
            }
            
            for(const { id, data } of inserts) {
                const itemId = data.itemId || v4();
                const payload = { ...data, itemId };

                inserts = inserts.map(d => {
                    if (d.id === id) d.data.itemId = itemId;
                    return d;
                });

                await db.insert(drugsLibrary).values(payload);
            }

            await _saveDrugsLibraryItemsHistory({ drafts: inserts, previous: dataBefore, });
        }

        await db.delete(drugsLibraryDrafts);

        let deleted = await db.query.pendingDeletion.findMany({
            where: isNotNull(pendingDeletion.drugsLibraryItemId),
            columns: { drugsLibraryItemId: true, },
            with: {
                drugsLibraryItem: {
                    columns: {
                        version: true,
                    },
                },
            },
        });

        deleted = deleted.filter(c => c.drugsLibraryItem);

        if (deleted.length) {
            const deletedAt = new Date();

            await db.update(drugsLibrary)
                .set({ deletedAt, })
                .where(inArray(drugsLibrary.itemId, deleted.map(c => c.drugsLibraryItemId!)));

            await db.insert(drugsLibraryHistory).values(deleted.map(c => ({
                version: c.drugsLibraryItem!.version,
                itemId: c.drugsLibraryItemId!,
                changes: {
                    action: 'delete_drugs_library_item',
                    description: 'Delete drugs library item',
                    oldValues: [{ deletedAt: null, }],
                    newValues: [{ deletedAt, }],
                },
            })));
        }

        await db.delete(pendingDeletion).where(or(
            isNotNull(pendingDeletion.drugsLibraryItemId),
            isNotNull(pendingDeletion.drugsLibraryItemDraftId),
        ));

        const published = [
            // ...inserts.map(c => c.itemId! || c.drugsLibraryItemDraftId),
            ...updates.map(c => c.itemId!),
            ...deleted.map(c => c.drugsLibraryItemId!),
        ];

        if (published.length) {
            await db.update(drugsLibrary)
                .set({ version: sql`${drugsLibrary.version} + 1`, }).
                where(inArray(drugsLibrary.itemId, published));
        }

        results.success = true;
    } catch(e: any) {
        results.success = false;
        results.errors = [e.message];
        logger.error('_publishDrugsLibraryItems ERROR', e.message);
    } finally {
        return results;
    }
}
