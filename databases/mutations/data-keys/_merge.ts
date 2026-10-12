import { inArray } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import socket from '@/lib/socket';
import type { DbOrTransaction } from '@/databases/pg/db-client';
import { dataKeyMerges, users } from '@/databases/pg/schema';
import { _getDataKeys, _getDataKeysRefs } from '@/databases/queries/data-keys';
import { _getDiagnoses, _getProblems, _getScreens, _getScripts } from '@/databases/queries/scripts';
import { buildDataKeysDeleteImpact } from '@/lib/data-key-delete-impact';
import { buildDataKeyParentIndex, getBlockedChildDeletions, getDataKeyParentTitle } from '@/lib/data-key-children';
import { buildDataKeysMergePlan, getMergeKeyTitle, type ChildMergeAction } from '@/lib/data-key-merge-plan';
import {
    analyzeMergeOptionUsage,
    applyLegacyItemLinks,
    findLegacyOptionItems,
    type LegacyItemLink,
    type LegacyOptionItem,
    type OptionUsage,
} from '@/lib/data-key-merge-analysis';
import { buildMergeReport, type MergeReport } from '@/lib/data-key-merge-report';
import { isNuidManagedDataKey } from '@/lib/nuid-search';
import { _saveScreens } from '../scripts';
import { _saveDataKeys } from './_save';
import { _updateDataKeysRefs } from './_update_data_keys_refs';
import { _deleteReferencedDataKeyOptions, type UnlinkReplacementDataKey } from './_delete-referenced-options';
import { _syncConditionRefsAfterReplacement } from './_sync_condition_refs';
import { queueDataKeysDeletion } from './_delete';
import { captureMergeDraftRows, type MergeDraftRows, type MergeSnapshotScope } from './_merge-snapshot';

export type MergeDataKeysParams = {
    /** The parent data key that is kept. */
    survivorId: string;
    /** Parent data keys merged into the kept one. */
    mergedIds: string[];
    /** merged child uniqueKey -> action; children left out use the suggestion. */
    childActions?: Record<string, ChildMergeAction>;
    /**
     * Selected scripts only: the merge is applied in these scripts and the
     * merged parents stay in the library. Omit to merge everywhere and queue
     * the merged parents for deletion.
     */
    scriptIds?: string[];
    /** Library merge only: also delete children that end up with no parent and no usage. */
    deleteUnusedChildren?: boolean;
    /** The kept parent's options in the order to save them. */
    survivorOptionOrder?: string[];
    /** New label for the kept parent. */
    survivorLabel?: string | null;
    /** Confirmed links for legacy option items that have no data key. */
    legacyLinks?: LegacyItemLink[];
    /** Run everything, report what would change, then roll back. */
    dryRun?: boolean;
    userId?: string | null;
    broadcastAction?: boolean;
};

export type MergeConflict = {
    kind: 'data_key' | 'script';
    title: string;
    userName: string;
};

export type MergePreview = {
    report: MergeReport;
    conflicts: MergeConflict[];
    legacyItems: LegacyOptionItem[];
    optionUsage: Record<string, OptionUsage>;
    scriptsChanged: number;
    addedOptions: string[];
    deletedDataKeyIds: string[];
};

export type MergeDataKeysResponse = {
    success: boolean;
    errors?: string[];
    /** The recorded merge (real runs only). */
    mergeId?: string;
    preview?: MergePreview;
};

const uniqueValues = (values: string[]) => Array.from(new Set(values.map((value) => `${value || ''}`.trim()).filter(Boolean)));

/** Thrown inside the transaction to roll a dry run back while keeping its result. */
class DryRunRollback extends Error {
    constructor(public preview: MergePreview) {
        super('dry run');
    }
}

async function describeConflicts({
    client,
    rows,
    userId,
    scriptIds,
    dataKeyIds,
    titles,
}: {
    client: DbOrTransaction;
    rows: MergeDraftRows;
    userId?: string | null;
    scriptIds: Set<string>;
    dataKeyIds: Set<string>;
    titles: { script: (id: string) => string; dataKey: (id: string) => string };
}): Promise<MergeConflict[]> {
    const others = (row: Record<string, any>) => !!row.createdByUserId && row.createdByUserId !== userId;
    const found: { kind: MergeConflict['kind']; title: string; userId: string }[] = [];

    const scriptRows = [...rows.scriptsDrafts, ...rows.screensDrafts, ...rows.diagnosesDrafts, ...rows.problemsDrafts]
        .filter((row) => others(row) && (scriptIds.has(row.scriptId) || scriptIds.has(row.scriptDraftId)));
    const seenScripts = new Set<string>();
    for (const row of scriptRows) {
        const scriptId = scriptIds.has(row.scriptId) ? row.scriptId : row.scriptDraftId;
        const key = `${scriptId}:${row.createdByUserId}`;
        if (seenScripts.has(key)) continue;
        seenScripts.add(key);
        found.push({ kind: 'script', title: titles.script(scriptId), userId: row.createdByUserId });
    }

    for (const row of rows.dataKeysDrafts) {
        const keyId = row.dataKeyId || row.uuid;
        if (!others(row) || !dataKeyIds.has(keyId)) continue;
        found.push({ kind: 'data_key', title: titles.dataKey(keyId), userId: row.createdByUserId });
    }

    if (!found.length) return [];
    const people = await client
        .select({ userId: users.userId, displayName: users.displayName })
        .from(users)
        .where(inArray(users.userId, uniqueValues(found.map((item) => item.userId))));
    const nameOf = new Map(people.map((person) => [person.userId, person.displayName]));

    return found.map((item) => ({ kind: item.kind, title: item.title, userName: nameOf.get(item.userId) || 'another user' }));
}

export async function _mergeDataKeys({
    survivorId,
    mergedIds: mergedIdsParam,
    childActions = {},
    scriptIds,
    deleteUnusedChildren,
    survivorOptionOrder,
    survivorLabel,
    legacyLinks = [],
    dryRun,
    userId,
    broadcastAction,
}: MergeDataKeysParams): Promise<MergeDataKeysResponse> {
    const response: MergeDataKeysResponse = { success: false };
    const scriptsOnly = Array.isArray(scriptIds);

    try {
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

        const allDataKeys = dataKeysRes.data;
        const plan = buildDataKeysMergePlan({
            dataKeys: allDataKeys,
            survivorId,
            mergedIds: mergedIdsParam,
            childActions,
            survivorOptionOrder,
            survivorLabel,
        });
        if (plan.errors.length || !plan.survivor) throw new Error(plan.errors[0] || 'Invalid merge.');

        const survivor = plan.survivor;
        const merged = plan.merged;
        const mergedIds = merged.map((dataKey) => dataKey.uuid);
        const mergedUniqueKeys = merged.map((dataKey) => dataKey.uniqueKey);
        const byUniqueKey = new Map(allDataKeys.map((dataKey) => [dataKey.uniqueKey, dataKey]));
        const byId = new Map(allDataKeys.map((dataKey) => [dataKey.uuid, dataKey]));

        const managed = [survivor, ...merged].filter((dataKey) => isNuidManagedDataKey(dataKey as any));
        if (managed.length) {
            throw new Error(`NUID Search data keys cannot be merged: ${managed.map(getMergeKeyTitle).join(', ')}.`);
        }

        // A merged parent that is itself an option of another parent would leave
        // that parent with a dangling option once it is deleted.
        if (!scriptsOnly) {
            const blocked = getBlockedChildDeletions({
                dataKeys: allDataKeys,
                targets: allDataKeys.filter((dataKey) => mergedIds.includes(dataKey.uuid)),
            });
            if (blocked.length) {
                const item = blocked[0];
                throw new Error(
                    `"${item.name || item.label || item.uniqueKey}" is an option of ${item.parents.map((parent) => `"${getDataKeyParentTitle(parent)}"`).join(', ')}. ` +
                    'Unlink it there first, or merge in selected scripts only.',
                );
            }
        }

        const impact = buildDataKeysDeleteImpact({
            dataKeys: allDataKeys,
            screens: screensRes.data,
            diagnoses: diagnosesRes.data,
            problems: problemsRes.data,
            scripts: scriptsRes.data,
            dataKeysIds: [survivor.uuid, ...mergedIds],
        });
        const mergedImpact = impact.filter((item) => mergedIds.includes(item.dataKeyId));
        const survivorScriptIds = impact.find((item) => item.dataKeyId === survivor.uuid)?.scripts.map((script) => script.scriptId) || [];

        const requestedScripts = new Set(uniqueValues(scriptIds || []));
        const isApplied = (scriptId: string) => !scriptsOnly || requestedScripts.has(scriptId);
        const appliedScriptIds = uniqueValues(mergedImpact.flatMap((item) => item.scripts.map((script) => script.scriptId)))
            .filter(isApplied);

        if (scriptsOnly && !appliedScriptIds.length) {
            throw new Error('Select at least one script that uses the data keys being merged.');
        }

        // Unselected scripts keep their references to the merged parents.
        const excludeScriptIdsByAlias: Record<string, string[]> = {};
        if (scriptsOnly) {
            for (const item of mergedImpact) {
                const excluded = item.scripts.map((script) => script.scriptId).filter((scriptId) => !isApplied(scriptId));
                if (excluded.length) excludeScriptIdsByAlias[item.uniqueKey] = excluded;
            }
        }

        // What the merge can touch: the applied scripts, and — when the kept
        // key itself changes (options or label) — the scripts already using it.
        const survivorChanges = !!plan.addedOptions.length || !!plan.survivorLabel
            || plan.nextSurvivorOptions.join(',') !== (survivor.options || []).join(',');
        const scopeScriptIds = uniqueValues([...appliedScriptIds, ...(survivorChanges ? survivorScriptIds : [])]);
        const involvedKeys = uniqueValues([
            survivor.uniqueKey,
            ...mergedUniqueKeys,
            ...plan.nextSurvivorOptions,
            ...merged.flatMap((dataKey) => dataKey.options || []),
        ]);
        const snapshotScope: MergeSnapshotScope = {
            scriptIds: scopeScriptIds,
            dataKeyIds: involvedKeys.map((uniqueKey) => byUniqueKey.get(uniqueKey)?.uuid || '').filter(Boolean),
            dataKeyUniqueKeys: involvedKeys,
        };

        const parentRefs = merged.map((dataKey) => ({
            uniqueKey: dataKey.uniqueKey,
            name: dataKey.name || '',
            options: dataKey.options || [],
        }));
        const childRefs = uniqueValues(merged.flatMap((dataKey) => dataKey.options || []))
            .map((uniqueKey) => byUniqueKey.get(uniqueKey))
            .filter((dataKey): dataKey is NonNullable<typeof dataKey> => !!dataKey)
            .map((dataKey) => ({ uniqueKey: dataKey.uniqueKey, name: dataKey.name || '', label: dataKey.label || '' }));
        const appliedScreens = screensRes.data.filter((screen) => appliedScriptIds.includes(screen.scriptId));
        const legacyItems = findLegacyOptionItems({ screens: appliedScreens, parents: parentRefs, children: childRefs });
        const optionUsage = analyzeMergeOptionUsage({
            screens: appliedScreens,
            diagnoses: diagnosesRes.data.filter((entity) => appliedScriptIds.includes(entity.scriptId)),
            problems: problemsRes.data.filter((entity) => appliedScriptIds.includes(entity.scriptId)),
            parents: parentRefs,
            children: childRefs,
        });

        const scriptTitles = new Map<string, string>();
        [...screensRes.data, ...diagnosesRes.data, ...problemsRes.data].forEach((entity) => {
            if (entity.scriptId && entity.scriptTitle) scriptTitles.set(entity.scriptId, entity.scriptTitle);
        });

        let mergeId: string | undefined;
        let preview: MergePreview | undefined;

        try {
            await db.transaction(async (tx) => {
                const loadScripts = async () => {
                    const [screens, diagnoses, problems] = [
                        await _getScreens({ scriptsIds: scopeScriptIds, returnDraftsIfExist: true, client: tx }),
                        await _getDiagnoses({ scriptsIds: scopeScriptIds, returnDraftsIfExist: true, client: tx }),
                        await _getProblems({ scriptsIds: scopeScriptIds, returnDraftsIfExist: true, client: tx }),
                    ];
                    const errors = [...(screens.errors || []), ...(diagnoses.errors || []), ...(problems.errors || [])];
                    if (errors.length) throw new Error(errors[0]);
                    return { screens: screens.data, diagnoses: diagnoses.data, problems: problems.data };
                };

                const rowsBefore = await captureMergeDraftRows(tx, snapshotScope);
                const conflicts = await describeConflicts({
                    client: tx,
                    rows: rowsBefore,
                    userId,
                    scriptIds: new Set(scopeScriptIds),
                    dataKeyIds: new Set(snapshotScope.dataKeyIds),
                    titles: {
                        script: (id) => scriptTitles.get(id) || 'a script',
                        dataKey: (id) => getMergeKeyTitle(byId.get(id)),
                    },
                });
                if (conflicts.length && !dryRun) {
                    const first = conflicts[0];
                    throw new Error(
                        `${first.userName} has unpublished changes to ${first.kind === 'script' ? 'the script' : 'the data key'} "${first.title}"` +
                        `${conflicts.length > 1 ? ` (and ${conflicts.length - 1} more)` : ''}. ` +
                        'Merge after those changes are published or discarded.',
                    );
                }

                const before = scopeScriptIds.length ? await loadScripts() : { screens: [], diagnoses: [], problems: [] };

                // 0. Confirmed links for legacy option items without a data key.
                if (legacyLinks.length) {
                    const parentOptions = new Map(merged.map((dataKey) => [dataKey.uniqueKey, new Set(dataKey.options || [])]));
                    const patches = before.screens
                        .filter((screen) => appliedScriptIds.includes(screen.scriptId))
                        .map((screen) => applyLegacyItemLinks(screen, legacyLinks, parentOptions))
                        .filter((patch): patch is NonNullable<typeof patch> => !!patch);
                    if (patches.length) {
                        const res = await _saveScreens({
                            userId: userId || undefined,
                            data: patches as Parameters<typeof _saveScreens>[0]['data'],
                            draftOrigin: 'data_key_sync',
                            client: tx,
                        });
                        if (res.errors?.length) throw new Error(res.errors[0]);
                    }
                }

                // 1. The kept parent's option pool (and order, and label). Scripts
                // keep the option items they already show.
                if (survivorChanges) {
                    const saveRes = await _saveDataKeys({
                        data: [{
                            uuid: survivor.uuid,
                            options: plan.nextSurvivorOptions,
                            ...(plan.survivorLabel ? { label: plan.survivorLabel } : {}),
                        }],
                        userId: userId || undefined,
                        client: tx,
                    });
                    if (saveRes.errors?.length) throw new Error(saveRes.errors[0]);
                }

                // 2. Inside the merged parents' screens, swap matched children for
                // the kept parent's children and drop the dropped ones — before the
                // parent swap, so per-option settings carry over by key.
                const swappedChildren = uniqueValues([...Object.keys(plan.childReplacements), ...plan.droppedChildren]);
                if (swappedChildren.length) {
                    const replacements: Record<string, UnlinkReplacementDataKey> = {};
                    for (const [childKey, targetKey] of Object.entries(plan.childReplacements)) {
                        const target = byUniqueKey.get(targetKey);
                        if (!target) throw new Error(`Option "${targetKey}" could not be found.`);
                        replacements[childKey] = {
                            uniqueKey: target.uniqueKey,
                            name: target.name || '',
                            label: target.label || '',
                            confidential: target.confidential,
                            replacedName: byUniqueKey.get(childKey)?.name || '',
                        };
                    }

                    const swapRes = await _deleteReferencedDataKeyOptions({
                        userId: userId || undefined,
                        uniqueKeys: swappedChildren,
                        scope: { parentUniqueKeys: mergedUniqueKeys, replacements },
                        scriptIdsByUniqueKey: scriptsOnly
                            ? Object.fromEntries(swappedChildren.map((childKey) => [childKey, appliedScriptIds]))
                            : undefined,
                        client: tx,
                    });
                    if (swapRes.errors?.length) throw new Error(swapRes.errors[0]);
                }

                // 3. Point every reference to a merged parent at the kept parent.
                // Existing option items are re-keyed, not rebuilt, so each script
                // keeps exactly the options it showed.
                const fresh = await _getDataKeys({ uniqueKeys: [survivor.uniqueKey], client: tx });
                if (fresh.errors?.length) throw new Error(fresh.errors[0]);
                const survivorNow = fresh.data.find((dataKey) => dataKey.uniqueKey === survivor.uniqueKey);
                if (!survivorNow) throw new Error(`"${getMergeKeyTitle(survivor)}" could not be loaded.`);

                const refsRes = await _updateDataKeysRefs({
                    dataKeys: [survivorNow],
                    userId: userId || undefined,
                    draftOrigin: 'data_key_sync',
                    broadcastAction: false,
                    matchUniqueKeysByDataKey: { [survivorNow.uniqueKey]: mergedUniqueKeys },
                    includePrimaryUniqueKeys: false,
                    excludeScriptIdsByAlias,
                    client: tx,
                });
                if (refsRes.errors?.length) throw new Error(refsRes.errors[0]);

                // 4. Conditions that name a merged parent (when its name differs).
                const renamesByScriptId: Record<string, { from: string; to: string }[]> = {};
                for (const item of mergedImpact) {
                    const mergedKey = byUniqueKey.get(item.uniqueKey);
                    for (const { scriptId } of item.scripts) {
                        if (!isApplied(scriptId)) continue;
                        (renamesByScriptId[scriptId] ||= []).push({ from: mergedKey?.name || '', to: survivorNow.name || '' });
                    }
                }
                const conditionsRes = await _syncConditionRefsAfterReplacement({
                    renamesByScriptId,
                    userId: userId || undefined,
                    client: tx,
                });
                if (conditionsRes.errors?.length) throw new Error(conditionsRes.errors[0]);

                const deletedDataKeyIds: string[] = [];

                if (!scriptsOnly) {
                    // 5. Library merge: clear anything left pointing at the merged
                    // parents and queue them for deletion.
                    const stripRes = await _deleteReferencedDataKeyOptions({
                        userId: userId || undefined,
                        uniqueKeys: mergedUniqueKeys,
                        client: tx,
                    });
                    if (stripRes.errors?.length) throw new Error(stripRes.errors[0]);

                    await queueDataKeysDeletion({ dataKeysIds: mergedIds, userId, client: tx });
                    deletedDataKeyIds.push(...mergedIds);

                    // 6. Optionally delete swapped/dropped children that no other
                    // parent offers and nothing references any more.
                    if (deleteUnusedChildren && swappedChildren.length) {
                        const parentIndex = buildDataKeyParentIndex(allDataKeys.filter((dataKey) => !mergedIds.includes(dataKey.uuid)));
                        const candidates = swappedChildren.filter((childKey) => {
                            const child = byUniqueKey.get(childKey);
                            return !!child && !child.isDeleted && !isNuidManagedDataKey(child as any) && !(parentIndex.get(childKey) || []).length;
                        });

                        if (candidates.length) {
                            const refs = await _getDataKeysRefs({ uniqueKeys: candidates, client: tx });
                            if (refs.errors?.length) throw new Error(refs.errors[0]);
                            const used = new Set(refs.data.flatMap((ref) => ref.dataKeys.map((item) => item.dataKey)));
                            const unusedIds = candidates
                                .filter((childKey) => !used.has(childKey))
                                .map((childKey) => byUniqueKey.get(childKey)!.uuid);

                            await queueDataKeysDeletion({ dataKeysIds: unusedIds, userId, client: tx });
                            deletedDataKeyIds.push(...unusedIds);
                        }
                    }
                }

                const after = scopeScriptIds.length ? await loadScripts() : { screens: [], diagnoses: [], problems: [] };
                const report = buildMergeReport({
                    before,
                    after,
                    describeKey: (uniqueKey) => {
                        const dataKey = byUniqueKey.get(uniqueKey);
                        // Duplicates share a name, so the short key tells them apart.
                        const name = dataKey ? `${dataKey.name}${dataKey.label && dataKey.label !== dataKey.name ? ` — ${dataKey.label}` : ''}` : '';
                        return name ? `${name} [${uniqueKey.slice(0, 8)}]` : uniqueKey;
                    },
                });

                preview = {
                    report,
                    conflicts,
                    legacyItems,
                    optionUsage,
                    scriptsChanged: report.scripts.length,
                    addedOptions: plan.addedOptions,
                    deletedDataKeyIds,
                };

                if (dryRun) throw new DryRunRollback(preview);

                const rowsAfter = await captureMergeDraftRows(tx, snapshotScope);
                const [record] = await tx.insert(dataKeyMerges).values({
                    scope: scriptsOnly ? 'scripts' : 'library',
                    survivorUniqueKey: survivor.uniqueKey,
                    survivorName: getMergeKeyTitle(survivor),
                    mergedUniqueKeys,
                    scriptIds: appliedScriptIds,
                    request: {
                        survivorId: survivor.uuid,
                        mergedIds,
                        childActions: Object.fromEntries(plan.children.map((row) => [row.uniqueKey, row.action])),
                        scriptIds: scriptsOnly ? appliedScriptIds : undefined,
                        deleteUnusedChildren: !!deleteUnusedChildren,
                        survivorOptionOrder: plan.nextSurvivorOptions,
                        survivorLabel: plan.survivorLabel,
                        legacyLinks,
                        mergedKeys: merged.map((dataKey) => ({ uniqueKey: dataKey.uniqueKey, name: dataKey.name, label: dataKey.label })),
                    },
                    report: { ...report, addedOptions: plan.addedOptions, deletedDataKeyIds },
                    snapshot: { scope: snapshotScope, before: rowsBefore, after: rowsAfter },
                    createdByUserId: userId || null,
                }).returning({ mergeId: dataKeyMerges.mergeId });
                mergeId = record.mergeId;
            });
        } catch (e) {
            if (!(e instanceof DryRunRollback)) throw e;
        }

        response.success = true;
        response.preview = preview;
        response.mergeId = mergeId;

        if (!dryRun && broadcastAction) {
            socket.emit('data_changed', 'save_data_keys');
            socket.emit('data_changed', 'save_scripts');
        }
    } catch (e: any) {
        logger.error('_mergeDataKeys ERROR', e.message);
        response.success = false;
        response.errors = [e.message];
    }

    return response;
}

export type MergeBatchItem = {
    survivorId: string;
    mergedIds: string[];
};

export type MergeBatchResult = MergeBatchItem & MergeDataKeysResponse;

/**
 * Merges several groups one after another with their suggested option
 * matches, each in its own transaction (and its own revertable record). A
 * failing group does not stop the others.
 */
export async function _mergeDataKeysBatch({
    groups,
    dryRun,
    userId,
    broadcastAction,
}: {
    groups: MergeBatchItem[];
    dryRun?: boolean;
    userId?: string | null;
    broadcastAction?: boolean;
}): Promise<{ success: boolean; results: MergeBatchResult[] }> {
    const results: MergeBatchResult[] = [];
    for (const group of groups) {
        const res = await _mergeDataKeys({
            survivorId: group.survivorId,
            mergedIds: group.mergedIds,
            dryRun,
            userId,
            broadcastAction: false,
        });
        results.push({ ...group, ...res });
    }

    if (!dryRun && broadcastAction && results.some((result) => result.success)) {
        socket.emit('data_changed', 'save_data_keys');
        socket.emit('data_changed', 'save_scripts');
    }

    return { success: results.every((result) => result.success), results };
}
