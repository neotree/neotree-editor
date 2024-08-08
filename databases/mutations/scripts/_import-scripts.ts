import { io } from 'socket.io-client';

import db from "@/databases/pg/drizzle";
import { 
    screensDrafts as screensDraftsTable, 
    diagnosesDrafts as diagnosesDraftsTable, 
    scriptsDrafts as scriptsDraftsTable,
    scripts as scriptsTable, 
} from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { _getScriptsWithItems, _listScripts } from '@/databases/queries/scripts';
import { screenToDraftInsertData, scriptToDraftInsertData, diagnosisToDraftInsertData } from '@/databases/utils';
import { _createScreensDrafts } from '../screens-drafts';
import { _createDiagnosesDrafts } from '../diagnoses-drafts';
import { _deleteDiagnoses } from './_delete-diagnoses';

import { eq } from 'drizzle-orm';
import { _deleteScreens } from './_delete-screens';

const socket = io(process.env.NEXT_PUBLIC_APP_URL);

export async function _importScripts(
    data: {
        scriptId: string;
        overWriteExistingScriptWithId?: string;
    }[],
    opts?: {
        broadcastAction?: boolean;
    }
) {
    const response: { success: boolean; errors?: string[]; } = { success: false, };
    try {
        for(const { scriptId, overWriteExistingScriptWithId } of data) {
            const { data: scripts, errors } = await _getScriptsWithItems({ scriptsIds: [scriptId], });
            if (errors) {
                response.success = false;
                response.errors = [...(response.errors || []), ...errors];
            } else {
                const res = await __importScripts(
                    scripts.map(s => ({
                        ...s,
                        scriptId: overWriteExistingScriptWithId || s.scriptId,
                    })), 
                    { overWriteScriptId: !overWriteExistingScriptWithId }
                );
                if (res.errors) {
                    response.success = false;
                    response.errors = [...(response.errors || []), ...res.errors];
                }
            }
        }

        if (!response.errors?.length) {
            response.success = true;
            if (opts?.broadcastAction) socket.emit('data_changed', 'create_scripts_drafts');
        }
    } catch(e: any) {
        const message = e.response?.data?.message || e.response?.data || e.message;
        response.success = false;
        response.errors = [message];
        logger.error('importScripts ERROR', message);
    } finally {
        return response;
    }
}

export async function __importScripts(
    scripts: Awaited<ReturnType<typeof _getScriptsWithItems>>['data'],
    opts?: {
        broadcastAction?: boolean;
        overWriteScriptId?: boolean;
    }
) {
    const response: { success: boolean; errors?: string[]; } = { success: false, };
    try {
        const overWriteScriptId = opts?.overWriteScriptId === undefined ? true : opts.overWriteScriptId;

        const scriptsList = await _listScripts();
                const lastPosition = scriptsList.data.length ? Math.max(...scriptsList.data.map(s => s.position)) : 0;
                let position = lastPosition + 1; 

        for (const { screens = [], diagnoses = [], ...s } of scripts) {
            try {
                const updateScript = await (overWriteScriptId ? null : db.query.scripts.findFirst({
                    where: eq(scriptsTable.scriptId, s.scriptId),
                    with: { draft: true, },
                }));

                const updateScriptDraft = await (overWriteScriptId ? null : updateScript?.draft || db.query.scriptsDrafts.findFirst({
                    where: eq(scriptsDraftsTable.scriptDraftId, s.scriptId),
                }));

                let scriptDraftData = { ...scriptToDraftInsertData(s), position, };
                position++;
                scriptDraftData.scriptId = updateScriptDraft?.scriptDraftId || updateScript?.scriptId || scriptDraftData.scriptId;
                scriptDraftData.position = updateScriptDraft?.data?.position || updateScript?.position || position;
                scriptDraftData.version = updateScriptDraft?.data?.version || (updateScript?.version ? (updateScript.version + 1) : scriptDraftData.version);

                if (updateScriptDraft) {
                    await db.update(scriptsDraftsTable).set({
                        data: scriptDraftData,
                    }).where(eq(scriptsDraftsTable.scriptDraftId, updateScriptDraft.scriptDraftId));
                } else {     
                    await db.insert(scriptsDraftsTable).values([{
                        data: scriptDraftData,
                        scriptDraftId: scriptDraftData.scriptId!,
                        scriptId: updateScript?.scriptId,
                        position: scriptDraftData.position,
                    }]);
                }

                if (updateScriptDraft || updateScript) {
                    await _deleteScreens({ scriptsIds: [scriptDraftData.scriptId!], restoreKey: `script_draft_${scriptDraftData.scriptId}`, });
                    await db.delete(screensDraftsTable).where(eq(screensDraftsTable.scriptDraftId, scriptDraftData.scriptId!));
                }

                for (const screen of screens) {
                    const screenDraftData = screenToDraftInsertData(screen);
                    
                    try {
                        await db.insert(screensDraftsTable).values([{
                            data: screenDraftData,
                            position: screenDraftData.position,
                            screenDraftId: screenDraftData.screenId!,
                            scriptDraftId: scriptDraftData.scriptId!,
                            type: screenDraftData.type,
                        }]);
                    } catch(e: any) {
                        response.success = false;
                        response.errors = response.errors || [];
                        response.errors.push(`Failed to save script: ${s.title} (${e.message})`);
                    }
                }

                if (updateScriptDraft || updateScript) {
                    await _deleteDiagnoses({ scriptsIds: [scriptDraftData.scriptId!], restoreKey: `script_draft_${scriptDraftData.scriptId}`, });
                    await db.delete(diagnosesDraftsTable).where(eq(diagnosesDraftsTable.scriptDraftId, scriptDraftData.scriptId!));
                }

                for (const diagnosis of diagnoses) {
                    const diagnosisDraftData = diagnosisToDraftInsertData(diagnosis);
                    
                    try {
                        await db.insert(diagnosesDraftsTable).values([{
                            data: diagnosisDraftData,
                            position: diagnosisDraftData.position,
                            diagnosisDraftId: diagnosisDraftData.diagnosisId!,
                            scriptDraftId: scriptDraftData.scriptId!,
                        }]);
                    } catch(e: any) {
                        response.success = false;
                        response.errors = response.errors || [];
                        response.errors.push(`Failed to save script: ${s.title} (${e.message})`);
                    }
                }
            } catch(e: any) {
                response.success = false;
                response.errors = response.errors || [];
                response.errors.push(`Failed to save script: ${s.title} (${e.message})`);
            }
        }

        if (!response.errors?.length) {
            response.success = true;
            if (opts?.broadcastAction) socket.emit('data_changed', 'create_scripts_drafts');
        }
    } catch(e: any) {
        const message = e.response?.data?.message || e.response?.data || e.message;
        response.success = false;
        response.errors = [message];
        logger.error('importScripts ERROR', message);
    } finally {
        return response;
    }
}
