import { desc, eq } from 'drizzle-orm';
import * as uuid from 'uuid';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { scripts, scriptsDrafts } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { ScriptType } from '../../queries/scripts/_scripts_get';

export type SaveScriptsData = Partial<ScriptType>;

export type SaveScriptsResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _saveScripts({ data, broadcastAction, }: {
    data: SaveScriptsData[],
    broadcastAction?: boolean,
}) {
    const response: SaveScriptsResponse = { success: false, };

    try {
        const errors = [];

        let index = 0;
        for (const { scriptId: itemScriptId, ...item } of data) {
            try {
                index++;

                const scriptId = itemScriptId || uuid.v4();

                if (!errors.length) {
                    const draft = !itemScriptId ? null : await db.query.scriptsDrafts.findFirst({
                        where: eq(scriptsDrafts.scriptDraftId, scriptId),
                    });

                    const published = (draft || !itemScriptId) ? null : await db.query.scripts.findFirst({
                        where: eq(scripts.scriptId, scriptId),
                    });

                    if (draft) {
                        const data = {
                            ...draft.data,
                            ...item,
                        } as typeof draft.data;
                        
                        await db
                            .update(scriptsDrafts)
                            .set({
                                data,
                                position: data.position,
                                hospitalId: data.hospitalId,
                            }).where(eq(scriptsDrafts.scriptDraftId, scriptId));
                    } else {
                        let position = item.position || published?.position;
                        if (!position) {
                            const script = await db.query.scripts.findFirst({
                                columns: { position: true, },
                                orderBy: desc(scripts.position),
                            });

                            const scriptDraft = await db.query.scriptsDrafts.findFirst({
                                columns: { position: true, },
                                orderBy: desc(scriptsDrafts.position),
                            });

                            position = Math.max(0, script?.position || 0, scriptDraft?.position || 0) + 1;
                        }

                        const data = {
                            ...published,
                            ...item,
                            scriptId,
                            version: published?.version ? (published.version + 1) : 1,
                            position,
                        } as typeof scriptsDrafts.$inferInsert['data'];

                        await db.insert(scriptsDrafts).values({
                            data,
                            scriptDraftId: scriptId,
                            position: data.position,
                            hospitalId: data.hospitalId,
                            scriptId: published?.scriptId,
                        });
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
        logger.error('_saveScripts ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction) socket.emit('data_changed', 'save_scripts');
        return response;
    }
}
