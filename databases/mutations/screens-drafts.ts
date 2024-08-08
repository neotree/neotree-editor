import { eq, inArray } from "drizzle-orm";
import { v4 } from "uuid";
import { io } from 'socket.io-client';

import db from "../pg/drizzle";
import { screensDrafts } from "../pg/schema";
import { _getScreenDraft, _getScreensDrafts } from '../queries/screens-drafts';
import { _listScreens } from "../queries/screens";

const socket = io(process.env.NEXT_PUBLIC_APP_URL);

export async function _deleteScreensDrafts(
    screensDraftsIds: string[],
    opts?: {
        broadcastAction?: boolean;
    }
) {
    if (screensDraftsIds.length) {
        await db.delete(screensDrafts).where(inArray(screensDrafts.screenDraftId, screensDraftsIds));
        // if (opts?.broadcastAction) socket.emit('data_changed', { action: 'delete_screens_drafts', data: screensDraftsIds, });
        if (opts?.broadcastAction) socket.emit('data_changed', 'delete_screens_drafts');
    }
    return true;
}

export async function _deleteAllScreensDrafts(
    opts?: {
        broadcastAction?: boolean;
    }
) {
    const res = await db.delete(screensDrafts);
    if (opts?.broadcastAction) socket.emit('data_changed', 'delete_screens_drafts');
    return res;
}

export async function _createScreensDrafts(
    data: (typeof screensDrafts.$inferInsert & {
        scriptId?: string;
        scriptDraftId?: string;
        screenDraftId: string;
        data: Exclude<(typeof screensDrafts.$inferInsert)['data'], 'version'>;
    })[], 
    opts?: {
        returnInserted?: boolean;
        broadcastAction?: boolean;
    }
) {
    let results: {
        success: boolean;
        error?: string;
        inserted: Awaited<ReturnType<typeof _getScreensDrafts>>['data'];
    } = { inserted: [], success: false, };

    try {
        const missingScriptsReferences = data.filter(s => !s.scriptDraftId && !s.scriptId);

        if (missingScriptsReferences.length) throw new Error('Missing scripts references');

        const screensList = await _listScreens({ scriptsReferences: data.map(s => s.scriptId! || s.scriptDraftId!), });
        const lastPosition = screensList.data.length ? Math.max(...screensList.data.map(s => s.position)) : 0;
        let position = lastPosition + 1;

        const insertData: typeof screensDrafts.$inferInsert[] = [];
        
        for(const s of data) {
            let screenDraftId = s.screenId || s.data.screenId;
            const existing = !screenDraftId ? null : await db.query.screensDrafts.findFirst({
                where: eq(screensDrafts.screenDraftId, screenDraftId),
            });

            if (!existing) {
                insertData.push({
                    ...s,
                    data: {
                        ...s.data,
                        position: s.screenId ? s.data.position : position,
                    },
                    screenDraftId: screenDraftId || v4(),
                    scriptId: s.scriptId,
                    scriptDraftId: s.scriptDraftId,
                });
                if (!s.screenId) position++;
            }
        }

        if (insertData.length) await db.insert(screensDrafts).values(insertData);
        
        if (opts?.returnInserted) {
            const inserted = await _getScreensDrafts({ screenDraftIds: insertData.map(u => u.screenDraftId!), });
            results.inserted = inserted.data;
        }
        results.success = true;
        if (opts?.broadcastAction) socket.emit('data_changed', 'create_screens_drafts');
    } catch(e: any) {
        results.error = e.message;
    } finally {
        return results;
    }
}

export async function _updateScreensDrafts(
    data: ({
        screenDraftId: string;
        data: Partial<typeof screensDrafts.$inferSelect>['data'];
    })[], 
    opts?: {
        returnUpdated?: boolean;
        broadcastAction?: boolean;
    }
) {
    const results: ({ 
        screenDraftId: string;
        screenDraft?: Awaited<ReturnType<typeof _getScreenDraft>>;
        error?: string; 
    })[] = [];

    for(const { screenDraftId, data: draft,  } of data) {
        try {
            const existing = await db.query.screensDrafts.findFirst({
                where: eq(screensDrafts.screenDraftId, screenDraftId),
            });
            const draftData = { ...existing?.data, ...draft, } as typeof draft;
            await db.update(screensDrafts).set({ data: draftData, }).where(eq(screensDrafts.screenDraftId, screenDraftId));
            const screenDraft = !opts?.returnUpdated ? undefined : await _getScreenDraft(screenDraftId);
            results.push({ screenDraftId, screenDraft, });
            // if (opts?.broadcastAction) socket.emit('data_changed', { action: 'update_screens_drafts', data: data.map(u => u.screenDraftId), });
            if (opts?.broadcastAction) socket.emit('data_changed', 'create_screens_drafts');
        } catch(e: any) {
            results.push({ screenDraftId, error: e.message, });
        }
    }

    return results;
}
