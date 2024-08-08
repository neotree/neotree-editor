import { count, eq, inArray } from "drizzle-orm";
import { v4 } from "uuid";
import { io } from 'socket.io-client';

import db from "../pg/drizzle";
import { configKeysDrafts } from "../pg/schema";
import { _countConfigKeysDrafts, _getConfigKeyDraft, _getConfigKeysDrafts } from '../queries/_config-keys-drafts';
import { _listConfigKeys } from "../queries/_config-keys";

const socket = io(process.env.NEXT_PUBLIC_APP_URL);

export async function _deleteConfigKeysDrafts(
    configKeysDraftsIds: string[],
    opts?: {
        broadcastAction?: boolean;
    }
) {
    if (configKeysDraftsIds.length) {
        await db.delete(configKeysDrafts).where(inArray(configKeysDrafts.configKeyDraftId, configKeysDraftsIds));
        if (opts?.broadcastAction) socket.emit('data_changed', 'delete_screens_drafts');
    }
    return true;
}

export async function _deleteAllConfigKeysDrafts(
    opts?: {
        broadcastAction?: boolean;
    }
) {
    const res = await db.delete(configKeysDrafts);
    if (opts?.broadcastAction) socket.emit('data_changed', 'delete_screens_drafts');
    return res;
}

export async function _createConfigKeysDrafts(
    data: (typeof configKeysDrafts.$inferInsert & {
        configKeyDraftId: string;
        data: Exclude<(typeof configKeysDrafts.$inferInsert)['data'], 'version'>;
    })[], 
    opts?: {
        returnInserted?: boolean;
        broadcastAction?: boolean;
    },
) {
    let results: {
        success: boolean;
        error?: string;
        inserted: Awaited<ReturnType<typeof _getConfigKeysDrafts>>['data'];
    } = { inserted: [], success: false, };

    try {
        const configKeysList = await _listConfigKeys();
        const lastPosition = configKeysList.data.length ? Math.max(...configKeysList.data.map(s => s.position)) : 0;
        let position = lastPosition + 1;

        const insertData: typeof configKeysDrafts.$inferInsert[] = [];

        for(const c of data) {
            const configKeyDraftId = c.configKeyId;
            const existing = !configKeyDraftId ? null : await db.query.configKeysDrafts.findFirst({
                where: eq(configKeysDrafts.configKeyDraftId, configKeyDraftId),
            });

            if (!existing) {
                insertData.push({
                    ...c,
                    data: {
                        ...c.data,
                        position: c.configKeyId ? c.data.position : position,
                    },
                    configKeyDraftId: configKeyDraftId || v4(),
                });
                if (!c.configKeyId) position++;
            }
        }

        if (insertData.length) await db.insert(configKeysDrafts).values(insertData);
        
        if (opts?.returnInserted) {
            const inserted = await _getConfigKeysDrafts({ configKeyDraftIds: insertData.map(u => u.configKeyDraftId!), });
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

export async function _updateConfigKeysDrafts(
    data: ({
        configKeyDraftId: string;
        data: Partial<typeof configKeysDrafts.$inferSelect>['data'];
    })[], 
    opts?: {
        returnUpdated?: boolean;
        broadcastAction?: boolean;
    }
) {
    const results: ({ 
        configKeyDraftId: string;
        configKeyDraft?: Awaited<ReturnType<typeof _getConfigKeyDraft>>;
        error?: string; 
    })[] = [];

    for(const { configKeyDraftId, data: draft,  } of data) {
        try {
            const existing = await db.query.configKeysDrafts.findFirst({
                where: eq(configKeysDrafts.configKeyDraftId, configKeyDraftId),
            });
            const draftData = { ...existing?.data, ...draft, } as typeof draft;
            await db.update(configKeysDrafts).set({ data: draftData, }).where(eq(configKeysDrafts.configKeyDraftId, configKeyDraftId));
            const configKeyDraft = !opts?.returnUpdated ? undefined : await _getConfigKeyDraft(configKeyDraftId);
            results.push({ configKeyDraftId, configKeyDraft, });
            if (opts?.broadcastAction) socket.emit('data_changed', 'create_screens_drafts');
        } catch(e: any) {
            results.push({ configKeyDraftId, error: e.message, });
        }
    }

    return results;
}
