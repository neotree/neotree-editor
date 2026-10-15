import logger from '@/lib/logger';
import { _getDataKeysRefs } from '@/databases/queries/data-keys';
import { _saveScreens, _saveDiagnoses, _saveProblems, _saveScripts, } from '../scripts';
import type { DbOrTransaction } from '@/databases/pg/db-client';
import { _syncConditionRefsAfterReplacement } from './_sync_condition_refs';

export type UnlinkReplacementDataKey = {
    uniqueKey: string;
    name: string;
    label: string;
    confidential?: boolean | null;
    /** Name of the unlinked key being replaced, used to update conditions. */
    replacedName?: string;
};

export type DeleteReferencedDataKeyOptionsScope = {
    /**
     * Restricts the operation to collections OWNED by these parent data keys:
     * screen items on screens whose keyId is a parent, field items on fields
     * whose keyId is a parent. Binding is strictly by keyId/uniqueKey — names
     * and labels are NOT unique and must never identify a data key. Used when
     * unlinking a child from a parent — the child still exists in the library,
     * so its other usages (standalone fields, other parents, diagnosis/problem
     * symptoms) must not be touched.
     */
    parentUniqueKeys: string[];
    /** Removed child uniqueKey -> fellow child that takes its place. Unmapped keys are removed. */
    replacements?: Record<string, UnlinkReplacementDataKey>;
};

export async function _deleteReferencedDataKeyOptions({
    uniqueKeys,
    userId,
    client,
    scope,
    scriptIdsByUniqueKey,
}: {
    uniqueKeys: string[];
    userId?: string;
    client?: DbOrTransaction;
    scope?: DeleteReferencedDataKeyOptionsScope;
    /**
     * "Selected scripts only": a key's references are removed only inside
     * these scripts (deleted uniqueKey -> scriptIds); a key missing from the
     * map is left alone everywhere. Omit for a full library delete.
     */
    scriptIdsByUniqueKey?: Record<string, string[]>;
}): Promise<{
    errors?: string[];
    success: boolean;
}> {
    try {
        if (uniqueKeys.length) {
            const refs = await _getDataKeysRefs({ uniqueKeys, client, });
            if (refs.errors?.length) throw new Error(refs.errors[0]);

            // Matching is strictly exact on keyId/uniqueKey — names and labels are
            // NOT unique across the library and must never identify a data key.
            // The refs query above is only a substring-based candidate filter.
            // Save an entity only when a reference was actually removed, so
            // unrelated drafts are never touched.
            const allowedScriptsByKey = !scriptIdsByUniqueKey ? null : new Map(Object.entries(scriptIdsByUniqueKey)
                .map(([key, scriptIds]) => [
                    `${key || ''}`.trim(),
                    new Set((scriptIds || []).map((scriptId) => `${scriptId || ''}`.trim()).filter(Boolean)),
                ] as const));
            const getEntityScriptId = (entity?: { scriptId?: string | null; scriptDraftId?: string | null } | null) =>
                `${entity?.scriptId || entity?.scriptDraftId || ''}`.trim();

            // Bound to one entity's script, so a script restriction applies to
            // every reference inside that entity.
            const referencesDeletedKeyIn = (scriptId: string) => (keyId?: string | null) => {
                const key = `${keyId || ''}`.trim();
                if (!uniqueKeys.includes(key)) return false;
                if (!allowedScriptsByKey) return true;
                return !!scriptId && !!allowedScriptsByKey.get(key)?.has(scriptId);
            };

            const scopeParents = new Set((scope?.parentUniqueKeys || [])
                .map((key) => `${key || ''}`.trim())
                .filter(Boolean));
            const isOwnedByScope = (ownerKeyId?: string | null) =>
                !scope || scopeParents.has(`${ownerKeyId || ''}`.trim());

            /**
             * Replace-or-remove within one owned option collection. An item whose
             * replacement is already present as a sibling is removed instead of
             * duplicated.
             */
            // scriptId -> replacements that landed there (for the conditions sync).
            const appliedReplacementsByScript = new Map<string, Set<UnlinkReplacementDataKey>>();

            const syncOwnedItems = <T extends { keyId?: string | null }>(
                referencesDeletedKey: (keyId?: string | null) => boolean,
                scriptId: string,
                items: T[],
                rebuildItem: (item: T, replacement: UnlinkReplacementDataKey) => T,
                onChange: () => void,
            ): T[] => {
                const presentKeyIds = new Set(items.map((item) => `${item.keyId || ''}`.trim()).filter(Boolean));

                return items
                    .map((item) => {
                        if (!referencesDeletedKey(item.keyId)) return item;
                        onChange();

                        const replacement = scope?.replacements?.[`${item.keyId || ''}`.trim()];
                        if (!replacement || presentKeyIds.has(replacement.uniqueKey)) return null;

                        presentKeyIds.add(replacement.uniqueKey);
                        if (scriptId) {
                            const applied = appliedReplacementsByScript.get(scriptId) || new Set();
                            applied.add(replacement);
                            appliedReplacementsByScript.set(scriptId, applied);
                        }
                        return rebuildItem(item, replacement);
                    })
                    .filter((item): item is T => !!item);
            };

            /**
             * Library deletes (unscoped) must also clear scalar references —
             * screen/diagnosis/problem keyIds, ref-ID keys, and field date/time
             * bound keys — otherwise "delete anyway" would leave dangling
             * references that the publish fence rightly refuses to release.
             * Each id field is cleared together with its paired display field.
             */
            const clearScalarRefs = <T extends Record<string, any>>(
                referencesDeletedKey: (keyId?: string | null) => boolean,
                entity: T,
                pairs: Array<{ id: string; name?: string }>,
                onChange: () => void,
            ): T => {
                let value = entity;
                for (const pair of pairs) {
                    if (!referencesDeletedKey(value?.[pair.id])) continue;
                    onChange();
                    value = {
                        ...value,
                        [pair.id]: '',
                        ...(pair.name ? { [pair.name]: '' } : {}),
                    };
                }
                return value;
            };

            const saveScreensData = refs.data
                .filter(d => d.refType === 'screen')
                .map(d => {
                    const screen: Parameters<typeof _saveScreens>[0]['data'][0] = d.data;
                    const screenScriptId = getEntityScriptId(screen as any);
                    const referencesDeletedKey = referencesDeletedKeyIn(screenScriptId);
                    let changed = false;
                    const markChanged = () => { changed = true; };

                    const items = !isOwnedByScope(screen?.keyId)
                        ? (screen?.items || [])
                        : syncOwnedItems(
                            referencesDeletedKey,
                            screenScriptId,
                            screen?.items || [],
                            (item, replacement) => ({
                                ...item,
                                id: replacement.name,
                                key: replacement.name,
                                label: replacement.label,
                                keyId: replacement.uniqueKey,
                                confidential: !!replacement.confidential,
                            }),
                            markChanged,
                        );

                    const fields = (screen?.fields || [])
                        .filter(field => {
                            // A field bound to the removed key is usage of the key
                            // itself, not of a parent option — only a full library
                            // delete (unscoped) removes it.
                            if (scope) return true;
                            const keep = !referencesDeletedKey(field.keyId);
                            if (!keep) changed = true;
                            return keep;
                        })
                        .map(field => {
                            const clearedField = scope ? field : clearScalarRefs(referencesDeletedKey, field, [
                                { id: 'refKeyId', name: 'refKey' },
                                { id: 'minDateKeyId', name: 'minDateKey' },
                                { id: 'maxDateKeyId', name: 'maxDateKey' },
                                { id: 'minTimeKeyId', name: 'minTimeKey' },
                                { id: 'maxTimeKeyId', name: 'maxTimeKey' },
                            ], markChanged);

                            return {
                                ...clearedField,
                                items: !isOwnedByScope(field.keyId)
                                    ? (field.items || [])
                                    : syncOwnedItems(
                                        referencesDeletedKey,
                                        screenScriptId,
                                        field.items || [],
                                        (item, replacement) => ({
                                            ...item,
                                            value: replacement.name,
                                            label: replacement.label,
                                            keyId: replacement.uniqueKey,
                                        }),
                                        markChanged,
                                    ),
                            };
                        });

                    const clearedScreen = scope ? screen : clearScalarRefs(referencesDeletedKey, screen, [
                        { id: 'keyId' },
                        { id: 'refIdDataKey' },
                    ], markChanged);

                    return changed ? { ...clearedScreen, items, fields } : null;
                })
                .filter((screen): screen is NonNullable<typeof screen> => !!screen);

            if (saveScreensData.length) {
                const res = await _saveScreens({
                    userId: userId || undefined,
                    data: saveScreensData,
                    draftOrigin: 'data_key_sync',
                    client,
                });
                if (res.errors?.length) throw new Error(res.errors[0]);
            }

            // Replacing an option changes its value text, so conditions such as
            // `$Parent = 'Old'` (and `$Old` for checklist items) follow it.
            if (appliedReplacementsByScript.size) {
                const conditionsRes = await _syncConditionRefsAfterReplacement({
                    renamesByScriptId: Object.fromEntries(Array.from(appliedReplacementsByScript.entries())
                        .map(([scriptId, replacements]) => [
                            scriptId,
                            Array.from(replacements).map((replacement) => ({
                                from: replacement.replacedName || '',
                                to: replacement.name,
                            })),
                        ])),
                    userId: userId || undefined,
                    client,
                });
                if (conditionsRes.errors?.length) throw new Error(conditionsRes.errors[0]);
            }

            // Diagnosis/problem symptoms reference keys directly, not through a
            // parent's option pool. An unlink leaves the child in the library, so
            // those references stay valid and must not be stripped.
            if (!scope) {
                const saveDiagnosesData = refs.data
                    .filter(d => d.refType === 'diagnosis')
                    .map(d => {
                        const diagnosis: Parameters<typeof _saveDiagnoses>[0]['data'][0] = d.data;
                        const referencesDeletedKey = referencesDeletedKeyIn(getEntityScriptId(diagnosis as any));
                        let changed = false;
                        const markChanged = () => { changed = true; };

                        const symptoms = (diagnosis?.symptoms || []).filter(symptom => {
                            const keep = !referencesDeletedKey(symptom.keyId);
                            if (!keep) changed = true;
                            return keep;
                        });

                        const clearedDiagnosis = clearScalarRefs(referencesDeletedKey, diagnosis, [{ id: 'keyId' }], markChanged);

                        return changed ? { ...clearedDiagnosis, symptoms } : null;
                    })
                    .filter((diagnosis): diagnosis is NonNullable<typeof diagnosis> => !!diagnosis);

                if (saveDiagnosesData.length) {
                    const res = await _saveDiagnoses({
                        userId: userId || undefined,
                        data: saveDiagnosesData,
                        draftOrigin: 'data_key_sync',
                        client,
                    });
                    if (res.errors?.length) throw new Error(res.errors[0]);
                }

                const saveProblemsData = refs.data
                    .filter(d => d.refType === 'problem')
                    .map(d => {
                        const problem: Parameters<typeof _saveProblems>[0]['data'][0] = d.data;
                        const referencesDeletedKey = referencesDeletedKeyIn(getEntityScriptId(problem as any));
                        let changed = false;
                        const markChanged = () => { changed = true; };

                        const symptoms = (problem?.symptoms || []).filter(symptom => {
                            const keep = !referencesDeletedKey(symptom.keyId);
                            if (!keep) changed = true;
                            return keep;
                        });

                        const clearedProblem = clearScalarRefs(referencesDeletedKey, problem, [{ id: 'keyId' }], markChanged);

                        return changed ? { ...clearedProblem, symptoms } : null;
                    })
                    .filter((problem): problem is NonNullable<typeof problem> => !!problem);

                if (saveProblemsData.length) {
                    const res = await _saveProblems({
                        userId: userId || undefined,
                        data: saveProblemsData,
                        draftOrigin: 'data_key_sync',
                        client,
                    });
                    if (res.errors?.length) throw new Error(res.errors[0]);
                }
            }

            const saveScriptsData = refs.data
                .filter(d => d.refType === 'script')
                .map(d => {
                    const script: Parameters<typeof _saveScripts>[0]['data'][0] = d.data;
                    const referencesDeletedKey = referencesDeletedKeyIn(getEntityScriptId(script as any));

                    const nuidSearchFields = script?.nuidSearchFields || [];
                    const keptFields = nuidSearchFields.filter(f => !referencesDeletedKey(f.keyId));
                    if (keptFields.length === nuidSearchFields.length) return null;

                    return {
                        scriptId: script.scriptId,
                        nuidSearchFields: keptFields,
                    };
                })
                .filter((script): script is NonNullable<typeof script> => !!script);

            if (saveScriptsData.length) {
                await _saveScripts({
                    userId: userId || undefined,
                    data: saveScriptsData,
                    draftOrigin: 'data_key_sync',
                    client,
                });
            }
        }

        return {
            success: true,
        };
    } catch(e: any) {
        logger.error('_deleteReferencedDataKeyOptions ERROR', e.message);
        return {
            success: false,
            errors: [e.message],
        };
    }
}
