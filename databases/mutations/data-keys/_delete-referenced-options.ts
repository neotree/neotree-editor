import logger from '@/lib/logger';
import { _getDataKeysRefs } from '@/databases/queries/data-keys';
import { _saveScreens, _saveDiagnoses, _saveProblems, } from '../scripts';
import type { DbOrTransaction } from '@/databases/pg/db-client';

export type UnlinkReplacementDataKey = {
    uniqueKey: string;
    name: string;
    label: string;
    confidential?: boolean | null;
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
}: {
    uniqueKeys: string[];
    userId?: string;
    client?: DbOrTransaction;
    scope?: DeleteReferencedDataKeyOptionsScope;
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
            const referencesDeletedKey = (keyId?: string | null) =>
                uniqueKeys.includes(`${keyId || ''}`.trim());

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
            const syncOwnedItems = <T extends { keyId?: string | null }>(
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
                    let changed = false;
                    const markChanged = () => { changed = true; };

                    const items = !isOwnedByScope(screen?.keyId)
                        ? (screen?.items || [])
                        : syncOwnedItems(
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
                            const clearedField = scope ? field : clearScalarRefs(field, [
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

                    const clearedScreen = scope ? screen : clearScalarRefs(screen, [
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

            // Diagnosis/problem symptoms reference keys directly, not through a
            // parent's option pool. An unlink leaves the child in the library, so
            // those references stay valid and must not be stripped.
            if (!scope) {
                const saveDiagnosesData = refs.data
                    .filter(d => d.refType === 'diagnosis')
                    .map(d => {
                        const diagnosis: Parameters<typeof _saveDiagnoses>[0]['data'][0] = d.data;
                        let changed = false;
                        const markChanged = () => { changed = true; };

                        const symptoms = (diagnosis?.symptoms || []).filter(symptom => {
                            const keep = !referencesDeletedKey(symptom.keyId);
                            if (!keep) changed = true;
                            return keep;
                        });

                        const clearedDiagnosis = clearScalarRefs(diagnosis, [{ id: 'keyId' }], markChanged);

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
                        let changed = false;
                        const markChanged = () => { changed = true; };

                        const symptoms = (problem?.symptoms || []).filter(symptom => {
                            const keep = !referencesDeletedKey(symptom.keyId);
                            if (!keep) changed = true;
                            return keep;
                        });

                        const clearedProblem = clearScalarRefs(problem, [{ id: 'keyId' }], markChanged);

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
