import logger from '@/lib/logger';
import type { DbOrTransaction } from '@/databases/pg/db-client';
import { _getDiagnoses, _getProblems, _getScreens } from '@/databases/queries/scripts';
import { syncScriptConditionReferences } from '@/lib/data-key-condition-sync';
import type { ConditionNameRename } from '@/lib/conditional-expression/rename-references';
import { _saveDiagnoses, _saveProblems, _saveScreens } from '../scripts';

export type SyncConditionRefsResponse = {
    success: boolean;
    errors?: string[];
    /** Number of expressions rewritten across all scripts. */
    rewritten: number;
};

/**
 * Brings conditional expressions along after a data key replacement rewrote the
 * references in `scriptIds`. Run it in the SAME transaction as the replacement,
 * after it and before any strip step, so it sees the replaced state and only
 * the scripts that actually received the replacement.
 */
export async function _syncConditionRefsAfterReplacement({
    renamesByScriptId,
    userId,
    client,
}: {
    /** scriptId -> old name -> new name, for the replacements applied in that script. */
    renamesByScriptId: Record<string, ConditionNameRename[]>;
    userId?: string;
    client?: DbOrTransaction;
}): Promise<SyncConditionRefsResponse> {
    try {
        const isValidRename = (rename: ConditionNameRename) => (
            !!`${rename.from || ''}`.trim() &&
            !!`${rename.to || ''}`.trim() &&
            `${rename.from}`.trim().toLowerCase() !== `${rename.to}`.trim().toLowerCase()
        );
        const renamesByScript = new Map(Object.entries(renamesByScriptId)
            .map(([scriptId, renames]) => [`${scriptId || ''}`.trim(), (renames || []).filter(isValidRename)] as const)
            .filter(([scriptId, renames]) => !!scriptId && !!renames.length));
        const scriptsIds = Array.from(renamesByScript.keys());
        if (!scriptsIds.length) return { success: true, rewritten: 0 };

        const screensRes = await _getScreens({ scriptsIds, returnDraftsIfExist: true, client });
        const diagnosesRes = await _getDiagnoses({ scriptsIds, returnDraftsIfExist: true, client });
        const problemsRes = await _getProblems({ scriptsIds, returnDraftsIfExist: true, client });
        const loadErrors = [
            ...(screensRes.errors || []),
            ...(diagnosesRes.errors || []),
            ...(problemsRes.errors || []),
        ];
        if (loadErrors.length) throw new Error(loadErrors[0]);

        const byScript = <T extends { scriptId?: string | null }>(rows: T[], scriptId: string) =>
            rows.filter((row) => `${row.scriptId || ''}` === scriptId);

        let rewritten = 0;
        const screenPatches = [];
        const diagnosisPatches = [];
        const problemPatches = [];

        // Evidence for each rename is per script, so plan one script at a time.
        for (const scriptId of scriptsIds) {
            const plan = syncScriptConditionReferences({
                screens: byScript(screensRes.data, scriptId),
                diagnoses: byScript(diagnosesRes.data, scriptId),
                problems: byScript(problemsRes.data, scriptId),
                renames: renamesByScript.get(scriptId) || [],
            });
            rewritten += plan.rewritten;
            screenPatches.push(...plan.screens);
            diagnosisPatches.push(...plan.diagnoses);
            problemPatches.push(...plan.problems);
        }

        if (screenPatches.length) {
            const res = await _saveScreens({
                userId,
                data: screenPatches as Parameters<typeof _saveScreens>[0]['data'],
                draftOrigin: 'data_key_sync',
                client,
            });
            if (res.errors?.length) throw new Error(res.errors[0]);
        }

        if (diagnosisPatches.length) {
            const res = await _saveDiagnoses({
                userId,
                data: diagnosisPatches as Parameters<typeof _saveDiagnoses>[0]['data'],
                draftOrigin: 'data_key_sync',
                client,
            });
            if (res.errors?.length) throw new Error(res.errors[0]);
        }

        if (problemPatches.length) {
            const res = await _saveProblems({
                userId,
                data: problemPatches as Parameters<typeof _saveProblems>[0]['data'],
                draftOrigin: 'data_key_sync',
                client,
            });
            if (res.errors?.length) throw new Error(res.errors[0]);
        }

        return { success: true, rewritten };
    } catch (e: any) {
        logger.error('_syncConditionRefsAfterReplacement ERROR', e.message);
        return { success: false, errors: [e.message], rewritten: 0 };
    }
}
