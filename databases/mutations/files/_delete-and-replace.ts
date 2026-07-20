import { eq } from 'drizzle-orm';

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
    items,
}: DeleteAndReplaceFiles): Promise<DeleteAndReplaceFilesResponse> {
    try {
        const processedItems: typeof items = [];

        for (const { deleteId, replaceWithId, } of items) {
            if (deleteId) {
                await db.update(schema.files).set({ deletedAt: new Date(), }).where(eq(schema.files.fileId, deleteId));
            }

            if (replaceWithId) {
                const alias = await db.query.filesAliases.findFirst({
                    where: eq(schema.filesAliases.fileId, deleteId),
                });

                if (alias) {
                    await db.update(schema.filesAliases).set({ alias: replaceWithId, }).where(eq(schema.filesAliases.id, alias.id)); 
                } else {
                    await db.insert(schema.filesAliases).values({
                        fileId: deleteId,
                        alias: replaceWithId,
                    });
                }
            }

            processedItems.push({ deleteId, replaceWithId, });
        }

        if (processedItems.length) socket.emit('files_deleted');

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
