import { desc, eq, Query } from 'drizzle-orm';
import * as uuid from 'uuid';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { screens, screensDrafts, scripts, scriptsDrafts } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { ScreenType } from '../../queries/scripts/_screens_get';
import { removeHexCharacters } from '../../utils'
import { validateSelectionRules } from '@/lib/selection-rules';


export type SaveScreensData = Partial<ScreenType>;

export type SaveScreensResponse = { 
    success: boolean; 
    errors?: string[]; 
    info?: { query?: Query; };
};

export async function _saveScreens({ data, broadcastAction, userId, }: {
    data: SaveScreensData[],
    broadcastAction?: boolean;
    userId?: string;
}) {
    const response: SaveScreensResponse = { success: false, };
    data = removeHexCharacters(data)
    const errors = [];
    const info: SaveScreensResponse['info'] = {};
    
    try {
        let index = 0;
        for (const { screenId: itemScreenId, ...item } of data) {
            try {
                index++;

                const screenId = itemScreenId || uuid.v4();

                const screenLabel = item.title || item.label || itemScreenId || `screen ${index}`;
                const validationErrors = [
                    ...validateSelectionRules(item.items || [], `Screen "${screenLabel}" items`),
                    ...(item.fields || []).flatMap((field, fieldIndex) =>
                        validateSelectionRules(
                            field.items || [],
                            `Screen "${screenLabel}" field "${field.label || field.key || fieldIndex}" items`
                        )
                    ),
                ];

                if (validationErrors.length) {
                    errors.push(...validationErrors);
                }

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
                        
                        const q = db
                            .update(screensDrafts)
                            .set({
                                data,
                                position: data.position,
                            }).where(eq(screensDrafts.screenDraftId, screenId));

                        info.query = q.toSQL();

                        await q.execute();
                    } else {
                        let position = item.position || published?.position;
                        if (!position) {
                            const screen = await db.query.screens.findFirst({
                                columns: { position: true, },
                                orderBy: desc(screens.position),
                            });

                            const screenDraft = await db.query.screensDrafts.findFirst({
                                columns: { position: true, },
                                orderBy: desc(screensDrafts.position),
                            });

                            position = Math.max(0, screen?.position || 0, screenDraft?.position || 0) + 1;
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
                                where: eq(scriptsDrafts.scriptDraftId, data.scriptId),
                                columns: { scriptDraftId: true, },
                            });

                            const publishedScript = await db.query.scripts.findFirst({
                                where: eq(scripts.scriptId, data.scriptId),
                                columns: { scriptId: true, },
                            });

                            if (scriptDraft || publishedScript) {
                                const q = db.insert(screensDrafts).values({
                                    data,
                                    type: data.type,
                                    scriptId: publishedScript?.scriptId,
                                    scriptDraftId: scriptDraft?.scriptDraftId,
                                    screenDraftId: screenId,
                                    position: data.position,
                                    screenId: published?.screenId,
                                    createdByUserId: userId,
                                });

                                info.query = q.toSQL();

                                await q.execute();
                            } else {
                                errors.push(`Could not save screen ${index}: ${data.title}, because script was not found`);
                            }
                        } else {
                            errors.push(`Could not save screen ${index}: ${data.title}, because scriptId was not specified`);
                        }
                    }
                }
            } catch(e: any) {
                errors.push(e.message);
            }
        }

        if (errors.length) {
            response.errors = errors;
            response.info = info;
        } else {
            response.success = true;
        }
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        response.info = info;
        logger.error('_saveScreens ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction) socket.emit('data_changed', 'save_screens');
        return response;
    }
}
