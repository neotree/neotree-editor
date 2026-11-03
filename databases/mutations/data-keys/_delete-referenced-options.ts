import logger from '@/lib/logger';
import { _getDataKeysRefs } from '@/databases/queries/data-keys';
import { _saveScreens, _saveDiagnoses, _saveProblems, _saveScripts, } from '../scripts';
import type { DbOrTransaction } from '@/databases/pg/db-client';

type RefRow = Awaited<ReturnType<typeof _getDataKeysRefs>>['data'][0];

/**
 * Remove data-key options from the screens, diagnoses and problems that use them.
 *
 * With `parentUniqueKey` (an option was removed from one key's option list) only that key's own
 * questions lose the option: dropdown / multi-select fields and select screens whose keyId is the parent,
 * and symptoms of diagnoses keyed by the parent. Options are shared between keys ("Yes", "No", ...), so
 * removing one from every field that used it wiped it from unrelated questions in every script.
 *
 * Without `parentUniqueKey` (the keys themselves were deleted) every reference is removed, as before.
 *
 * Drafts owned by another user are never rewritten; they are reported in `skipped` instead.
 */
export async function _deleteReferencedDataKeyOptions({
    uniqueKeys,
    parentUniqueKey,
    userId,
    client,
}: {
    uniqueKeys: string[];
    parentUniqueKey?: string | null;
    userId?: string;
    client?: DbOrTransaction;
}): Promise<{
    errors?: string[];
    success: boolean;
    skipped?: { refType: string; refId: string; title: string; draftOwnerId: string | null }[];
}> {
    try {
        const errors: string[] = [];
        const skipped: NonNullable<Awaited<ReturnType<typeof _deleteReferencedDataKeyOptions>>['skipped']> = [];
        const removed = new Set(uniqueKeys.filter(Boolean));

        if (removed.size) {
            const refs = await _getDataKeysRefs({ uniqueKeys: Array.from(removed), client, });
            if (refs.errors?.length) throw new Error(refs.errors[0]);

            const isRemoved = (keyId?: string | null) => !!keyId && removed.has(keyId);
            const ownsQuestion = (keyId?: string | null) => !parentUniqueKey || keyId === parentUniqueKey;
            const writable = (ref: RefRow, title: string) => {
                if (!ref.isDraft || ref.draftOwnerId === (userId || null)) return true;
                skipped.push({ refType: ref.refType, refId: ref.refId, title, draftOwnerId: ref.draftOwnerId ?? null });
                return false;
            };

            const saveScreensData = refs.data
                .filter(d => d.refType === 'screen')
                .map(d => {
                    const screen: Parameters<typeof _saveScreens>[0]['data'][0] = d.data;
                    const items = screen?.items || [];
                    const fields = screen?.fields || [];

                    const nextItems = ownsQuestion(screen?.keyId) ? items.filter(i => !isRemoved(i.keyId)) : items;
                    const nextFields = fields
                        // whole fields are only removed when the deleted key IS the field's key
                        .filter(f => parentUniqueKey ? true : !isRemoved(f.keyId))
                        .map(f => (ownsQuestion(f.keyId) ? {
                            ...f,
                            items: (f.items || []).filter(i => !isRemoved(i.keyId)),
                        } : f));

                    const changed = JSON.stringify(nextItems) !== JSON.stringify(items) ||
                        JSON.stringify(nextFields) !== JSON.stringify(fields);
                    if (!changed || !writable(d, screen?.title || screen?.label || d.refId)) return null;

                    // Only the lists change; everything else is already in the stored row.
                    return {
                        screenId: screen.screenId,
                        scriptId: screen.scriptId,
                        items: nextItems,
                        fields: nextFields,
                    };
                })
                .filter((s): s is NonNullable<typeof s> => !!s);

            if (saveScreensData.length) {
                const res = await _saveScreens({
                    userId: userId || undefined,
                    data: saveScreensData as any,
                    draftOrigin: 'data_key_sync',
                    client,
                });
                res.errors?.forEach(e => errors.push(e));
            }

            const symptomsUpdates = (refType: 'diagnosis' | 'problem') => refs.data
                .filter(d => d.refType === refType)
                .map(d => {
                    const entity = d.data;
                    const symptoms: any[] = entity?.symptoms || [];
                    const next = ownsQuestion(entity?.keyId) ? symptoms.filter(s => !isRemoved(s.keyId)) : symptoms;
                    if (next.length === symptoms.length || !writable(d, entity?.name || d.refId)) return null;
                    return refType === 'diagnosis'
                        ? { diagnosisId: entity.diagnosisId, scriptId: entity.scriptId, symptoms: next }
                        : { problemId: entity.problemId, scriptId: entity.scriptId, symptoms: next };
                })
                .filter((s): s is NonNullable<typeof s> => !!s);

            const saveDiagnosesData = symptomsUpdates('diagnosis');
            if (saveDiagnosesData.length) {
                const res = await _saveDiagnoses({
                    userId: userId || undefined,
                    data: saveDiagnosesData as any,
                    draftOrigin: 'data_key_sync',
                    client,
                });
                res.errors?.forEach(e => errors.push(e));
            }

            const saveProblemsData = symptomsUpdates('problem');
            if (saveProblemsData.length) {
                const res = await _saveProblems({
                    userId: userId || undefined,
                    data: saveProblemsData as any,
                    draftOrigin: 'data_key_sync',
                    client,
                });
                res.errors?.forEach(e => errors.push(e));
            }

            // NUID search fields are keys, not options: only touched when the keys themselves are deleted.
            if (!parentUniqueKey) {
                const saveScriptsData = refs.data
                    .filter(d => d.refType === 'script')
                    .map(d => {
                        const script: Parameters<typeof _saveScripts>[0]['data'][0] = d.data;
                        const nuidSearchFields = script?.nuidSearchFields || [];
                        const next = nuidSearchFields.filter(f => !isRemoved(f.keyId));
                        if (next.length === nuidSearchFields.length || !writable(d, script?.title || d.refId)) return null;
                        return {
                            scriptId: script.scriptId,
                            nuidSearchFields: next,
                        };
                    })
                    .filter((s): s is NonNullable<typeof s> => !!s);

                if (saveScriptsData.length) {
                    const res = await _saveScripts({
                        userId: userId || undefined,
                        data: saveScriptsData,
                        draftOrigin: 'data_key_sync',
                        client,
                    });
                    res.errors?.forEach(e => errors.push(e));
                }
            }
        }

        if (errors.length) return { success: false, errors, skipped };

        return {
            success: true,
            skipped,
        };
    } catch(e: any) {
        logger.error('_deleteReferencedDataKeyOptions ERROR', e.message);
        return {
            success: false,
            errors: [e.message],
        };
    }
}
