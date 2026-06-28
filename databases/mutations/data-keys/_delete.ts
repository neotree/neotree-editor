import { eq, inArray } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { dataKeys, dataKeysDrafts, pendingDeletion, } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { type DataKey, _getDataKeys } from '@/databases/queries/data-keys';
import { _getDiagnoses, _getProblems, _getScreens } from '@/databases/queries/scripts';
import { buildDataKeysDeleteImpact, type DataKeyDeleteImpactItem } from '@/lib/data-key-delete-impact';
import { getDataKeyReplacementCompatibilityError } from '@/lib/data-key-option-compatibility';
import { _updateDataKeysRefs } from './_update_data_keys_refs';

export type DeleteDataKeysParams = {
    dataKeysIds: string[];
    broadcastAction?: boolean;
    userId?: string | null;
    replacements?: Record<string, string>;
};

export type DeleteDataKeysResponse = {
    success: boolean;
    errors?: string[];
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
    userId,
    client,
}: {
    targets: DataKey[];
    allDataKeys: DataKey[];
    impact: DataKeyDeleteImpactItem[];
    replacements: Record<string, string>;
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

    for (const target of usedTargets) {
        const replacementId = `${replacements?.[target.uuid] || ''}`.trim();
        const targetTitle = getDataKeyTitle(target);

        if (!replacementId) {
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
    }

    const replacementKeys = Array.from(replacementKeysById.values());
    if (!replacementKeys.length) return;

    // Only rewrite references that point at the deleted keys. Existing usages of
    // the replacement keys should not be touched by a delete-replace operation.
    const updateRes = await _updateDataKeysRefs({
        dataKeys: replacementKeys,
        userId: userId || undefined,
        draftOrigin: "data_key_sync",
        broadcastAction: false,
        matchUniqueKeysByDataKey: aliasesByReplacementUniqueKey,
        includePrimaryUniqueKeys: false,
        client,
    });

    if (updateRes.errors?.length) {
        throw new Error(updateRes.errors[0]);
    }
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
    { dataKeysIds: dataKeysIdsParam, broadcastAction, userId, replacements = {}, }: DeleteDataKeysParams,
) {
    const response: DeleteDataKeysResponse = { success: false, };

    try {
        const dataKeysIds = uniqueValues(dataKeysIdsParam);

        if (dataKeysIds.length) {
            const [dataKeysRes, screensRes, diagnosesRes, problemsRes] = await Promise.all([
                _getDataKeys({ returnDraftsIfExist: true }),
                _getScreens({ returnDraftsIfExist: true }),
                _getDiagnoses({ returnDraftsIfExist: true }),
                _getProblems({ returnDraftsIfExist: true }),
            ]);
            const loadErrors = [
                ...(dataKeysRes.errors || []),
                ...(screensRes.errors || []),
                ...(diagnosesRes.errors || []),
                ...(problemsRes.errors || []),
            ];
            if (loadErrors.length) throw new Error(loadErrors[0]);

            const targets = dataKeysRes.data.filter((dataKey) => dataKeysIds.includes(dataKey.uuid));
            const impact = buildDataKeysDeleteImpact({
                dataKeys: dataKeysRes.data,
                screens: screensRes.data,
                diagnoses: diagnosesRes.data,
                problems: problemsRes.data,
                dataKeysIds,
            });

            await db.transaction(async (tx) => {
                await applyRequiredDeletionReplacements({
                    targets,
                    allDataKeys: dataKeysRes.data,
                    impact,
                    replacements,
                    userId,
                    client: tx,
                });

                // delete drafts
                await tx.delete(dataKeysDrafts).where(inArray(dataKeysDrafts.uuid, dataKeysIds));

                // insert data keys into pendingDeletion, we'll delete them when data is published
                const dataKeysArr = await tx
                    .select({
                        dataKeyId: dataKeys.uuid,
                        pendingDeletion: pendingDeletion.dataKeyId,
                    })
                    .from(dataKeys)
                    .leftJoin(pendingDeletion, eq(pendingDeletion.dataKeyId, dataKeys.uuid))
                    .where(inArray(dataKeys.uuid, dataKeysIds));

                const pendingDeletionInsertData = dataKeysArr.filter(s => !s.pendingDeletion).map(s => ({
                    ...s,
                    createdByUserId: userId,
                }));

                if (pendingDeletionInsertData.length) await tx.insert(pendingDeletion).values(pendingDeletionInsertData);
            });
        }

        response.success = true;
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_deleteDataKeys ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction) socket.emit('data_changed', 'delete_data_keys');
        return response;
    }
}
