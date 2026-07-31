import { eq, or } from 'drizzle-orm';

import socket  from '@/lib/socket';
import db from '@/databases/pg/drizzle';
import * as schema from '@/databases/pg/schema';

export type DeleteAndReplaceFiles = {
    broadcastAction?: boolean;
    items: {
        deleteId: string;
        replaceWithId?: string;
    }[];
};

export type DeleteAndReplaceFilesResponse = {
    errors?: string[];
    success: boolean;
};

export async function _deleteAndReplaceFiles({
    broadcastAction,
    items,
}: DeleteAndReplaceFiles): Promise<DeleteAndReplaceFilesResponse> {
    try {
        const processedItems: typeof items = [];

        for (const { deleteId, replaceWithId, } of items) {
            if (deleteId) {
                await db.update(schema.files).set({ deletedAt: new Date(), }).where(eq(schema.files.fileId, deleteId));
            }

            if (replaceWithId) {
                await db.update(schema.filesAliases)
                    .set({ fileId: replaceWithId, })
                    .where(or(
                        eq(schema.filesAliases.fileId, deleteId),
                        eq(schema.filesAliases.alias, deleteId)
                    ));

                const alias = await db.query.filesAliases.findFirst({
                    where: eq(schema.filesAliases.alias, deleteId),
                });

                if (!alias) {
                    await db.insert(schema.filesAliases).values({
                        fileId: replaceWithId,
                        alias: deleteId,
                    });
                }
            }

            processedItems.push({ deleteId, replaceWithId, });
        }

        if (broadcastAction) socket.emit('files_deleted', '');

        return {
            success: true,
        };
    } catch(e: any) {
        return {
            errors: [e.message],
            success: false,
        };
    }
}
