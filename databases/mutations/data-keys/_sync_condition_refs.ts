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
    refuseOthersDrafts,
}: {
    /** scriptId -> old name -> new name, for the replacements applied in that script. */
    renamesByScriptId: Record<string, ConditionNameRename[]>;
    userId?: string;
    client?: DbOrTransaction;
    /**
     * An editor save never writes into another user's (or an ownerless)
     * unpublished draft: refuse instead, like the references update does.
     * Merges and deletes check every script they touch for such drafts first.
     */
    refuseOthersDrafts?: boolean;
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

        if (refuseOthersDrafts) {
            type Owned = { isDraft?: boolean | null; draftCreatedByUserId?: string | null; scriptTitle?: string | null; };
            const othersDraft = (entity?: Owned) => !!entity?.isDraft && (entity.draftCreatedByUserId || null) !== (userId || null);
            const screensById = new Map(screensRes.data.map((screen) => [screen.screenId, screen]));
            const diagnosesById = new Map(diagnosesRes.data.map((diagnosis) => [diagnosis.diagnosisId, diagnosis]));
            const problemsById = new Map(problemsRes.data.map((problem) => [problem.problemId, problem]));
            const blocked = [
                ...screenPatches.map((patch: any) => screensById.get(patch.screenId)).filter(othersDraft)
                    .map((screen: any) => `“${screen.title || screen.label || screen.refId || screen.screenId}”${screen.scriptTitle ? ` (${screen.scriptTitle})` : ''}`),
                ...diagnosisPatches.map((patch: any) => diagnosesById.get(patch.diagnosisId)).filter(othersDraft)
                    .map((diagnosis: any) => `“${diagnosis.name || diagnosis.diagnosisId}”${diagnosis.scriptTitle ? ` (${diagnosis.scriptTitle})` : ''}`),
                ...problemPatches.map((patch: any) => problemsById.get(patch.problemId)).filter(othersDraft)
                    .map((problem: any) => `“${problem.name || problem.problemId}”${problem.scriptTitle ? ` (${problem.scriptTitle})` : ''}`),
            ];
            if (blocked.length) {
                throw new Error(
                    `Not saved: the new name would also be written into the conditions of ${blocked.length === 1 ? 'a question' : `${blocked.length} questions`} that another user is still editing (unpublished): ` +
                    blocked.slice(0, 5).join(', ') + (blocked.length > 5 ? ` and ${blocked.length - 5} more` : '') +
                    '. Ask them to publish or discard their changes first (an admin can take over drafts that have no owner).',
                );
            }
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
