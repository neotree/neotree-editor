import { desc, eq } from 'drizzle-orm';
import * as uuid from 'uuid';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { screens, screensDrafts } from '@/databases/pg/schema';
import socket from '@/lib/socket';

export type SaveScreensData = Partial<typeof screens.$inferSelect & {
    
}>;

export type SaveScreensResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _saveScreens({ data, broadcastAction, }: {
    data: SaveScreensData[],
    broadcastAction?: boolean,
}) {
    const response: SaveScreensResponse = { success: false, };

    try {
        const errors = [];

        let index = 0;
        for (const { screenId: itemScreenId, ...item } of data) {
            try {
                index++;

                const screenId = itemScreenId || uuid.v4();

                if (!errors.length) {
                    const draft = !itemScreenId ? null : await db.query.screensDrafts.findFirst({
                        where: eq(screensDrafts.screenDraftId, screenId),
                    });

                    const published = (draft || !itemScreenId) ? null : await db.query.screens.findFirst({
                        where: eq(screens.screenId, screenId),
                    });

                    if (draft) {
                        const data = {
                            ...draft.data,
                            ...item,
                        } as typeof draft.data;
                        
                        await db
                            .update(screensDrafts)
                            .set({
                                data,
                                position: data.position,
                            }).where(eq(screensDrafts.screenDraftId, screenId));
                    } else {
                        let position = item.position || published?.position;
                        if (!position) {
                            const confKey = await db.query.screens.findFirst({
                                columns: { position: true, },
                                orderBy: desc(screens.position),
                            });

                            const confKeyDraft = await db.query.screensDrafts.findFirst({
                                columns: { position: true, },
                                orderBy: desc(screensDrafts.position),
                            });

                            position = Math.max(0, confKey?.position || 0, confKeyDraft?.position || 0) + 1;
                        }

                        const data = {
                            ...published,
                            ...item,
                            screenId,
                            version: published?.version ? (published.version + 1) : 1,
                            position,
                        } as typeof screensDrafts.$inferInsert['data'];

                        if (data.scriptId) {
                            const scriptDraft = await db.query.scriptsDrafts.findFirst({
                                where: eq(screensDrafts.scriptDraftId, data.scriptId),
                                columns: { scriptDraftId: true, },
                            });

                            await db.insert(screensDrafts).values({
                                data,
                                type: data.type,
                                scriptId: data.scriptId,
                                scriptDraftId: scriptDraft?.scriptDraftId,
                                screenDraftId: screenId,
                                position: data.position,
                                screenId: published?.screenId,
                            });
                        } else {
                            errors.push(`Could not save item ${index}: ${data.title}, because scriptId was not specified`);
                        }
                    }
                }
            } catch(e: any) {
                errors.push(e.message);
            }
        }

        if (errors.length) {
            response.errors = errors;
        } else {
            response.success = true;
        }
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_saveScreens ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction) socket.emit('data_changed', 'save_screens');
        return response;
    }
}
