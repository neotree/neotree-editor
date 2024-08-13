import { eq, inArray } from "drizzle-orm";
import { v4 } from "uuid";

import socket  from '@/lib/socket';
import db from "../pg/drizzle";
import { scriptsDrafts, screensHistory } from "../pg/schema";
import { _getScriptDraft, _getScriptsDrafts, } from '../queries/scripts-drafts';
import { _listScripts } from "../queries/_scripts";
import { _restoreScreens } from "./_scripts/_restore-screens";

export async function _deleteScriptsDrafts(
    scriptsDraftsIds: string[],
    opts?: {
        broadcastAction?: boolean;
    }
) {
    if (scriptsDraftsIds.length) {
        await db.delete(scriptsDrafts).where(inArray(scriptsDrafts.scriptDraftId, scriptsDraftsIds));
        // if (opts?.broadcastAction) socket.emit('data_changed', { action: 'delete_scripts_drafts', data: scriptsDraftsIds, });
        if (opts?.broadcastAction) socket.emit('data_changed', 'delete_scripts_drafts');
        if (scriptsDraftsIds.length) {
            await _restoreScreens({ restoreKeys: scriptsDraftsIds.map(id => `script_draft_${id}`), });
            await db.update(screensHistory).set({ restoreKey: null, }).where(inArray(screensHistory.restoreKey, scriptsDraftsIds.map(sId => `script_draft_${sId}`)));
        }
    }
    return true;
}

export async function _deleteAllScriptsDrafts(
    opts?: {
        broadcastAction?: boolean;
    }
) {
    const drafts = await db.query.scriptsDrafts.findMany({
        columns: {
            scriptDraftId: true,
            scriptId: true,
        },
    });
    const res = await db.delete(scriptsDrafts);
    if (drafts.length) {
        await _restoreScreens({ restoreKeys: drafts.map(d => `script_draft_${d.scriptDraftId}`), });
        await db.update(screensHistory).set({ restoreKey: null, }).where(inArray(screensHistory.restoreKey, drafts.map(s => `script_draft_${s.scriptDraftId}`)));
    }
    if (opts?.broadcastAction) socket.emit('data_changed', 'delete_scripts_drafts');
    return res;
}

export type CreateScriptsDraftsParams = (typeof scriptsDrafts.$inferInsert & {
    scriptDraftId: string;
    data: Exclude<(typeof scriptsDrafts.$inferInsert)['data'], 'version'>;
})[];


export async function _createScriptsDrafts(
    data: CreateScriptsDraftsParams, 
    opts?: {
        returnInserted?: boolean;
        broadcastAction?: boolean;
    }
) {
    let results: {
        success: boolean;
        error?: string;
        inserted: Awaited<ReturnType<typeof _getScriptsDrafts>>['data'];
    } = { inserted: [], success: false, };

    try {
        const insertData: typeof scriptsDrafts.$inferInsert[] = [];

        const scriptsList = await _listScripts();
        const lastPosition = scriptsList.data.length ? Math.max(...scriptsList.data.map(s => s.position)) : 0;
        let position = lastPosition + 1;
        
        for(const c of data) {
            let scriptDraftId = c.scriptId || c.data.scriptId;
            const existing = !scriptDraftId ? null : await db.query.scriptsDrafts.findFirst({
                where: eq(scriptsDrafts.scriptDraftId, scriptDraftId),
            });

            if (!existing) {
                insertData.push({
                    ...c,
                    data: {
                        ...c.data,
                        position: c.scriptId ? c.data.position : position,
                    },
                    scriptDraftId: scriptDraftId || v4(),
                });
                if (!c.scriptId) position++;
            }
        }

        if (insertData.length)  await db.insert(scriptsDrafts).values(insertData);
        
        if (opts?.returnInserted) {
            const inserted = await _getScriptsDrafts({ scriptDraftIds: insertData.map(u => u.scriptDraftId!), });
            results.inserted = inserted.data;
        }
        results.success = true;
        // if (opts?.broadcastAction) socket.emit('data_changed', { action: 'create_scripts_drafts', data: insertData.map(u => u.scriptDraftId), });
        if (opts?.broadcastAction) socket.emit('data_changed', 'create_scripts_drafts');
    } catch(e: any) {
        results.error = e.message;
    } finally {
        return results;
    }
}

export async function _updateScriptsDrafts(
    data: ({
        scriptDraftId: string;
        data: Partial<typeof scriptsDrafts.$inferSelect>['data'];
    })[], 
    opts?: {
        returnUpdated?: boolean;
        broadcastAction?: boolean;
    }
) {
    const results: ({ 
        scriptDraftId: string;
        scriptDraft?: Awaited<ReturnType<typeof _getScriptDraft>>;
        error?: string; 
    })[] = [];

    for(const { scriptDraftId, data: draft,  } of data) {
        try {
            const existing = await db.query.scriptsDrafts.findFirst({
                where: eq(scriptsDrafts.scriptDraftId, scriptDraftId),
            });
            const draftData = { ...existing?.data, ...draft, } as typeof draft;
            await db.update(scriptsDrafts).set({ data: draftData, }).where(eq(scriptsDrafts.scriptDraftId, scriptDraftId));
            const scriptDraft = !opts?.returnUpdated ? undefined : await _getScriptDraft(scriptDraftId);
            results.push({ scriptDraftId, scriptDraft, });
            // if (opts?.broadcastAction) socket.emit('data_changed', { action: 'update_scripts_drafts', data: data.map(u => u.scriptDraftId), });
            if (opts?.broadcastAction) socket.emit('data_changed', 'update_scripts_drafts');
        } catch(e: any) {
            results.push({ scriptDraftId, error: e.message, });
        }
    }

    return results;
}
