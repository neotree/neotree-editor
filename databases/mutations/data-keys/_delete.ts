import { eq, inArray } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { dataKeys, dataKeysDrafts, pendingDeletion, } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { type DataKey, _getDataKeys } from '@/databases/queries/data-keys';
import { _getDiagnoses, _getProblems, _getScreens, _getScripts } from '@/databases/queries/scripts';
import { buildDataKeysDeleteImpact, type DataKeyDeleteImpactItem } from '@/lib/data-key-delete-impact';
import { getDataKeyReplacementCompatibilityError } from '@/lib/data-key-option-compatibility';
import { getBlockedChildDeletions, getDataKeyParentTitle } from '@/lib/data-key-children';
import { resolveScriptRemovalExclusions, resolveScriptsOnlyPlan } from '@/lib/data-key-script-removals';
import { isNuidManagedDataKey } from '@/lib/nuid-search';
import { _deleteReferencedDataKeyOptions } from './_delete-referenced-options';
import { _updateDataKeysRefs } from './_update_data_keys_refs';
import { reportKeyDescriber, runRecordedDataKeyOperation, type OperationPreview } from './_recorded-operation';
import { _syncConditionRefsAfterReplacement } from './_sync_condition_refs';

export type DeleteDataKeysParams = {
    dataKeysIds: string[];
    broadcastAction?: boolean;
    userId?: string | null;
    replacements?: Record<string, string>;
    /**
     * "Delete anyway": permits deleting used keys without a replacement. Any
     * replacements provided are still applied; the remaining references are
     * removed/cleared from the affected scripts. Never the default — the UI
     * sets this only after an explicit user confirmation.
     */
    allowMissingReplacements?: boolean;
    /**
     * Per-script exceptions to a chosen replacement: target uuid -> scriptIds
     * whose references are REMOVED instead of replaced. Validated against the
     * freshly computed impact; unknown script ids fall back to the default
     * action (replace).
     */
    scriptRemovals?: Record<string, string[]>;
    /**
     * "Selected scripts only": target uuid -> scriptIds the operation applies
     * to. When set, the keys STAY in the library — only the selected scripts
     * change (replaced, or removed where there is no replacement / the script
     * is in `scriptRemovals`). Unselected scripts are never touched.
     */
    scriptsOnly?: Record<string, string[]>;
    /** Run everything, report what would change, then roll back. */
    dryRun?: boolean;
};

export type DeleteDataKeysResponse = {
    success: boolean;
    errors?: string[];
    /** What changes (dry run) or changed (real run) in each script. */
    preview?: OperationPreview & { deletedDataKeyIds: string[] };
    /** The recorded operation, for its report and revert (real runs only). */
    operationId?: string;
};

function getDataKeyTitle(dataKey?: Pick<DataKey, 'name' | 'label' | 'uniqueKey'> | null) {
    return dataKey?.name || dataKey?.label || dataKey?.uniqueKey || 'Data key';
}

function uniqueValues(values: string[]) {
    return Array.from(new Set(values.map((value) => `${value || ''}`.trim()).filter(Boolean)));
}

async function applyRequiredDeletionReplacements({
    targets,
    allDataKeys,
    impact,
    replacements,
    allowMissingReplacements,
    scriptRemovals,
    excludeScriptIdsByAlias: excludeScriptIdsByAliasParam,
    userId,
    client,
}: {
    targets: DataKey[];
    allDataKeys: DataKey[];
    impact: DataKeyDeleteImpactItem[];
    replacements: Record<string, string>;
    allowMissingReplacements?: boolean;
    scriptRemovals?: Record<string, string[]>;
    /** Overrides the exclusions derived from `scriptRemovals` (scripts-only mode). */
    excludeScriptIdsByAlias?: Record<string, string[]>;
    userId?: string | null;
    client: Parameters<typeof _updateDataKeysRefs>[0]["client"];
}) {
    const usedTargetIds = new Set(impact.filter((item) => item.scripts.length > 0).map((item) => item.dataKeyId));
    const usedTargets = targets.filter((target) => usedTargetIds.has(target.uuid));
    if (!usedTargets.length) return;

    const replacementIds = uniqueValues(Object.values(replacements || {}));
    const targetsById = new Map(targets.map((target) => [target.uuid, target]));
    const replacementById = new Map(allDataKeys
        .filter((dataKey) => replacementIds.includes(dataKey.uuid))
        .map((replacement) => [replacement.uuid, replacement]));
    const deletedIds = new Set(targets.map((target) => target.uuid));
    const aliasesByReplacementUniqueKey: Record<string, string[]> = {};
    const replacementKeysById = new Map<string, DataKey>();
    const appliedReplacements: { target: DataKey; replacement: DataKey }[] = [];

    for (const target of usedTargets) {
        const replacementId = `${replacements?.[target.uuid] || ''}`.trim();
        const targetTitle = getDataKeyTitle(target);

        // Parent keys (keys with child options) are never replaced — a valid
        // replacement would need a superset option pool, which is practically
        // unsatisfiable. Their references are removed instead; the UI warns
        // with the affected scripts before allowing it.
        if ((target.options || []).length) {
            if (replacementId) {
                throw new Error(`"${targetTitle}" is a parent data key and cannot be replaced. Delete it without a replacement instead.`);
            }
            continue;
        }

        if (!replacementId) {
            // "Delete anyway": the user explicitly accepted that this key's
            // references get removed instead of replaced.
            if (allowMissingReplacements) continue;
            throw new Error(`Choose a replacement before deleting "${targetTitle}" because it is used in scripts.`);
        }

        if (!targetsById.has(target.uuid)) {
            throw new Error(`Could not validate "${targetTitle}" for deletion.`);
        }

        const replacement = replacementById.get(replacementId);
        if (!replacement) {
            throw new Error(`The replacement selected for "${targetTitle}" could not be found.`);
        }

        if (deletedIds.has(replacement.uuid)) {
            throw new Error(`"${getDataKeyTitle(replacement)}" cannot replace "${targetTitle}" because it is also being deleted.`);
        }

        const compatibilityError = getDataKeyReplacementCompatibilityError({
            target,
            replacement,
        });
        if (compatibilityError) {
            throw new Error(`"${getDataKeyTitle(replacement)}" cannot replace "${targetTitle}". ${compatibilityError}`);
        }

        if (!target.uniqueKey || !replacement.uniqueKey) {
            throw new Error(`"${targetTitle}" cannot be safely replaced because it is missing a unique key.`);
        }

        const aliases = aliasesByReplacementUniqueKey[replacement.uniqueKey] || [];
        aliasesByReplacementUniqueKey[replacement.uniqueKey] = uniqueValues([...aliases, target.uniqueKey]);

        replacementKeysById.set(replacement.uuid, replacement);
        appliedReplacements.push({ target, replacement });
    }

    const replacementKeys = Array.from(replacementKeysById.values());
    if (!replacementKeys.length) return;

    // Per-script exceptions: references in these scripts are left for the strip
    // step to remove instead of being rewritten to the replacement. Unknown or
    // stale script ids are dropped so new usage gets the default action.
    const excludeScriptIdsByAlias = excludeScriptIdsByAliasParam || resolveScriptRemovalExclusions({
        impact,
        replacements: replacements || {},
        scriptRemovals: scriptRemovals || {},
    });

    // Only rewrite references that point at the deleted keys. Existing usages of
    // the replacement keys should not be touched by a delete-replace operation.
    const updateRes = await _updateDataKeysRefs({
        dataKeys: replacementKeys,
        userId: userId || undefined,
        draftOrigin: "data_key_sync",
        broadcastAction: false,
        matchUniqueKeysByDataKey: aliasesByReplacementUniqueKey,
        includePrimaryUniqueKeys: false,
        excludeScriptIdsByAlias,
        client,
    });

    if (updateRes.errors?.length) {
        throw new Error(updateRes.errors[0]);
    }

    // Conditions refer to keys by name, so a replacement with a different name
    // would leave `$Old` behind. Rewrite them in the scripts that received it.
    const renamesByScriptId: Record<string, { from: string; to: string }[]> = {};
    for (const { target, replacement } of appliedReplacements) {
        const excluded = new Set(excludeScriptIdsByAlias[target.uniqueKey] || []);
        const scripts = impact.find((item) => item.dataKeyId === target.uuid)?.scripts || [];
        for (const { scriptId } of scripts) {
            if (excluded.has(scriptId)) continue;
            (renamesByScriptId[scriptId] ||= []).push({ from: target.name || '', to: replacement.name || '' });
        }
    }

    const conditionsRes = await _syncConditionRefsAfterReplacement({
        renamesByScriptId,
        userId: userId || undefined,
        client,
    });
    if (conditionsRes.errors?.length) {
        throw new Error(conditionsRes.errors[0]);
    }
}

/**
 * Drops the keys' drafts and queues the published rows for deletion on the
 * next publish. Callers must already have cleared or replaced their references.
 */
export async function queueDataKeysDeletion({
    dataKeysIds,
    userId,
    client,
}: {
    dataKeysIds: string[];
    userId?: string | null;
    client: NonNullable<Parameters<typeof _updateDataKeysRefs>[0]["client"]>;
}) {
    if (!dataKeysIds.length) return;

    await client.delete(dataKeysDrafts).where(inArray(dataKeysDrafts.uuid, dataKeysIds));

    const dataKeysArr = await client
        .select({
            dataKeyId: dataKeys.uuid,
            pendingDeletion: pendingDeletion.dataKeyId,
        })
        .from(dataKeys)
        .leftJoin(pendingDeletion, eq(pendingDeletion.dataKeyId, dataKeys.uuid))
        .where(inArray(dataKeys.uuid, dataKeysIds));

    const pendingDeletionInsertData = dataKeysArr.filter(s => !s.pendingDeletion).map(s => ({
        dataKeyId: s.dataKeyId,
        createdByUserId: userId,
    }));

    if (pendingDeletionInsertData.length) await client.insert(pendingDeletion).values(pendingDeletionInsertData);
}

export async function _deleteAllDataKeysDrafts(opts?: {
    userId?: string | null;
}): Promise<boolean> {
    try {
        await db.delete(dataKeysDrafts).where(!opts?.userId ? undefined : eq(dataKeysDrafts.createdByUserId, opts.userId));
        return true;
    } catch(e: any) {
        throw e;
    }
}

export async function _deleteDataKeys(
    { dataKeysIds: dataKeysIdsParam, broadcastAction, userId, replacements = {}, allowMissingReplacements, scriptRemovals = {}, scriptsOnly, dryRun, }: DeleteDataKeysParams,
) {
    const response: DeleteDataKeysResponse = { success: false, };

    try {
        const dataKeysIds = uniqueValues(dataKeysIdsParam);

        if (dataKeysIds.length) {
            const [dataKeysRes, screensRes, diagnosesRes, problemsRes, scriptsRes] = await Promise.all([
                _getDataKeys({ returnDraftsIfExist: true }),
                _getScreens({ returnDraftsIfExist: true }),
                _getDiagnoses({ returnDraftsIfExist: true }),
                _getProblems({ returnDraftsIfExist: true }),
                _getScripts({ returnDraftsIfExist: true }),
            ]);
            const loadErrors = [
                ...(dataKeysRes.errors || []),
                ...(screensRes.errors || []),
                ...(diagnosesRes.errors || []),
                ...(problemsRes.errors || []),
                ...(scriptsRes.errors || []),
            ];
            if (loadErrors.length) throw new Error(loadErrors[0]);

            const targets = dataKeysRes.data.filter((dataKey) => dataKeysIds.includes(dataKey.uuid));

            const managedTargets = targets.filter((dataKey) => isNuidManagedDataKey(dataKey as any));
            if (managedTargets.length) {
                const names = managedTargets.map((dataKey) => dataKey.name || dataKey.uniqueKey).join(', ');
                throw new Error(
                    `Cannot delete NUID Search data key${managedTargets.length > 1 ? 's' : ''}: ${names}. ` +
                    `These are managed by NUID Search and are permanent — they can't be deleted.`,
                );
            }

            // Child keys stay deletable only when every parent that links them is
            // part of the same deletion batch; otherwise the parent would keep a
            // dangling option reference.
            const blockedChildDeletions = getBlockedChildDeletions({
                dataKeys: dataKeysRes.data,
                targets,
            });
            if (blockedChildDeletions.length) {
                const blocked = blockedChildDeletions[0];
                const parentTitles = blocked.parents.map((parent) => `"${getDataKeyParentTitle(parent)}"`).join(', ');
                throw new Error(
                    `Cannot delete "${blocked.name || blocked.label || blocked.uniqueKey}" because it is a child option of ${parentTitles}. ` +
                    `Unlink it from the parent data key${blocked.parents.length === 1 ? '' : 's'} first.`,
                );
            }

            const impact = buildDataKeysDeleteImpact({
                dataKeys: dataKeysRes.data,
                screens: screensRes.data,
                diagnoses: diagnosesRes.data,
                problems: problemsRes.data,
                scripts: scriptsRes.data,
                dataKeysIds,
            });

            const byUniqueKey = new Map(dataKeysRes.data.map((dataKey) => [dataKey.uniqueKey, dataKey]));
            const byId = new Map(dataKeysRes.data.map((dataKey) => [dataKey.uuid, dataKey]));
            const scriptTitles = new Map<string, string>();
            impact.forEach((item) => item.scripts.forEach((script) => scriptTitles.set(script.scriptId, script.scriptTitle)));
            const replacementIds = uniqueValues(Object.values(replacements || {}));
            const replacementKeys = dataKeysRes.data.filter((dataKey) => replacementIds.includes(dataKey.uuid));
            const titleOf = (dataKey?: DataKey) => getDataKeyTitle(dataKey);
            const subject = targets.length === 1 ? `“${titleOf(targets[0])}”` : `${targets.length} data keys`;
            const operationParams = {
                dryRun,
                userId,
                titles: {
                    script: (id: string) => scriptTitles.get(id) || 'a script',
                    dataKey: (id: string) => titleOf(byId.get(id)),
                },
                describeKey: reportKeyDescriber(byUniqueKey),
            };

            if (scriptsOnly) {
                const plan = resolveScriptsOnlyPlan({
                    impact,
                    replacements,
                    scriptSelections: scriptsOnly,
                    scriptRemovals,
                });
                if (!plan.selectedCount) {
                    throw new Error('Select at least one script to apply this change to.');
                }

                // Only keys that change somewhere take part; the rest stay as they are.
                const selectedKeys = new Set(Object.keys(plan.stripScriptIdsByUniqueKey));
                const selectedTargets = targets.filter((target) => selectedKeys.has(target.uniqueKey));
                const selectedReplacements = Object.fromEntries(Object.entries(replacements)
                    .filter(([targetId]) => selectedTargets.some((target) => target.uuid === targetId)));
                const selectedScriptIds = uniqueValues(Object.values(plan.stripScriptIdsByUniqueKey).flat());

                const outcome = await runRecordedDataKeyOperation({
                    ...operationParams,
                    snapshotScope: {
                        scriptIds: selectedScriptIds,
                        dataKeyIds: uniqueValues([...selectedTargets.map((key) => key.uuid), ...replacementIds]),
                        dataKeyUniqueKeys: uniqueValues([...selectedTargets.map((key) => key.uniqueKey), ...replacementKeys.map((key) => key.uniqueKey)]),
                    },
                    run: async (tx) => {
                        await applyRequiredDeletionReplacements({
                            targets: selectedTargets,
                            allDataKeys: dataKeysRes.data,
                            impact,
                            replacements: selectedReplacements,
                            // Removal is the explicit choice for keys without a replacement.
                            allowMissingReplacements: true,
                            excludeScriptIdsByAlias: plan.replaceExclusionsByUniqueKey,
                            userId,
                            client: tx,
                        });

                        const res = await _deleteReferencedDataKeyOptions({
                            userId: userId || undefined,
                            uniqueKeys: Array.from(selectedKeys),
                            scriptIdsByUniqueKey: plan.stripScriptIdsByUniqueKey,
                            client: tx,
                        });
                        if (res.errors?.length) throw new Error(res.errors[0]);
                    },
                    record: () => ({
                        kind: 'scripts',
                        title: `${Object.keys(selectedReplacements).length ? 'Replace or remove' : 'Remove'} ${subject} in selected scripts`,
                        scope: 'scripts',
                        subjectUniqueKey: selectedTargets[0]?.uniqueKey || '',
                        subjectName: titleOf(selectedTargets[0]),
                        affectedUniqueKeys: selectedTargets.map((key) => key.uniqueKey),
                        scriptIds: selectedScriptIds,
                        request: {
                            dataKeysIds,
                            replacements: selectedReplacements,
                            scriptRemovals,
                            scriptsOnly,
                            replacementKeys: replacementKeys.map((key) => ({ uuid: key.uuid, uniqueKey: key.uniqueKey, name: key.name, label: key.label })),
                            targetKeys: selectedTargets.map((key) => ({ uuid: key.uuid, uniqueKey: key.uniqueKey, name: key.name, label: key.label })),
                        },
                        reportExtras: { deletedDataKeyIds: [] },
                    }),
                });

                response.preview = { ...outcome.preview, deletedDataKeyIds: [] };
                response.operationId = outcome.operationId;
                response.success = true;
                return response;
            }

            const impactedScriptIds = uniqueValues(impact.flatMap((item) => item.scripts.map((script) => script.scriptId)));
            const outcome = await runRecordedDataKeyOperation({
                ...operationParams,
                snapshotScope: {
                    scriptIds: impactedScriptIds,
                    dataKeyIds: uniqueValues([...dataKeysIds, ...replacementIds]),
                    dataKeyUniqueKeys: uniqueValues([...targets.map((key) => key.uniqueKey), ...replacementKeys.map((key) => key.uniqueKey)]),
                },
                run: async (tx) => {
                    await applyRequiredDeletionReplacements({
                        targets,
                        allDataKeys: dataKeysRes.data,
                        impact,
                        replacements,
                        allowMissingReplacements,
                        scriptRemovals,
                        userId,
                        client: tx,
                    });

                    const deletedUniqueKeys = uniqueValues(targets.map((dataKey) => dataKey.uniqueKey || ''));
                    if (deletedUniqueKeys.length) {
                        const deleteReferencedOptionsRes = await _deleteReferencedDataKeyOptions({
                            userId: userId || undefined,
                            uniqueKeys: deletedUniqueKeys,
                            client: tx,
                        });

                        if (deleteReferencedOptionsRes.errors?.length) {
                            throw new Error(deleteReferencedOptionsRes.errors[0]);
                        }
                    }

                    await queueDataKeysDeletion({ dataKeysIds, userId, client: tx });
                },
                record: () => ({
                    kind: 'delete',
                    title: `${replacementIds.length ? 'Replace and delete' : 'Delete'} ${subject}`,
                    scope: 'library',
                    subjectUniqueKey: targets[0]?.uniqueKey || '',
                    subjectName: titleOf(targets[0]),
                    affectedUniqueKeys: targets.map((key) => key.uniqueKey),
                    scriptIds: impactedScriptIds,
                    request: {
                        dataKeysIds,
                        replacements,
                        allowMissingReplacements: !!allowMissingReplacements,
                        scriptRemovals,
                        replacementKeys: replacementKeys.map((key) => ({ uuid: key.uuid, uniqueKey: key.uniqueKey, name: key.name, label: key.label })),
                        targetKeys: targets.map((key) => ({ uuid: key.uuid, uniqueKey: key.uniqueKey, name: key.name, label: key.label })),
                    },
                    reportExtras: { deletedDataKeyIds: dataKeysIds },
                }),
            });

            response.preview = { ...outcome.preview, deletedDataKeyIds: dataKeysIds };
            response.operationId = outcome.operationId;
        }

        response.success = true;
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_deleteDataKeys ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction && !dryRun) {
            socket.emit('data_changed', scriptsOnly ? 'save_scripts' : 'delete_data_keys');
        }
        return response;
    }
}
