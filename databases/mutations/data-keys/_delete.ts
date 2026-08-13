import { and, eq, inArray, isNull } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { dataKeys, dataKeysDrafts, pendingDeletion, scripts, scriptsDrafts, } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { type DataKey, _getDataKeys } from '@/databases/queries/data-keys';
import { _getDiagnoses, _getProblems, _getScreens } from '@/databases/queries/scripts';
import { buildDataKeysDeleteImpact, type DataKeyDeleteImpactItem } from '@/lib/data-key-delete-impact';
import { getDataKeyReplacementCompatibilityError } from '@/lib/data-key-option-compatibility';
import { isNuidManagedDataKey } from '@/lib/nuid-search';
import { _deleteReferencedDataKeyOptions } from './_delete-referenced-options';
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

/**
 * The set of key identifiers (uniqueKey, uuid, and name) currently referenced by
 * NUID Search on any enabled script — published or draft — including the option
 * children of every referenced dropdown. A NUID-managed key is only locked while
 * it appears here; once no enabled script uses it, it can be released/deleted.
 */
async function getReferencedNuidKeyIdentifiers(allDataKeys: DataKey[]): Promise<Set<string>> {
    const referenced = new Set<string>();

    const published = await db
        .select({ fields: scripts.nuidSearchFields })
        .from(scripts)
        .where(and(isNull(scripts.deletedAt), eq(scripts.nuidSearchEnabled, true)));

    const draftRows = await db.query.scriptsDrafts.findMany();

    const fieldSets: any[][] = [
        ...published.map((s) => (s.fields || []) as any[]),
        ...draftRows
            .filter((d) => (d.data as any)?.nuidSearchEnabled)
            .map((d) => ((d.data as any)?.nuidSearchFields || []) as any[]),
    ];

    for (const fields of fieldSets) {
        for (const f of fields) {
            if (f?.keyId) referenced.add(`${f.keyId}`);
            if (f?.key) referenced.add(`${f.key}`);
        }
    }

    // Option children of any referenced dropdown are in use as well.
    for (const dk of allDataKeys) {
        const isReferenced =
            referenced.has(`${dk.uniqueKey || ''}`) ||
            referenced.has(`${dk.uuid || ''}`) ||
            referenced.has(`${dk.name || ''}`);
        if (isReferenced) {
            for (const childId of (((dk as any).options || []) as string[])) referenced.add(`${childId}`);
        }
    }

    return referenced;
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

            const managedTargets = targets.filter((dataKey) => isNuidManagedDataKey(dataKey as any));
            if (managedTargets.length) {
                let referenced: Set<string>;
                try {
                    referenced = await getReferencedNuidKeyIdentifiers(dataKeysRes.data);
                } catch (e: any) {
                    logger.error('getReferencedNuidKeyIdentifiers ERROR', e?.message);
                    throw new Error('Could not verify NUID Search usage for the managed data key(s) — please try again.');
                }

                const stillUsed = managedTargets.filter((dataKey) =>
                    referenced.has(`${dataKey.uniqueKey || ''}`) ||
                    referenced.has(`${dataKey.uuid || ''}`) ||
                    referenced.has(`${dataKey.name || ''}`)
                );
                if (stillUsed.length) {
                    const names = stillUsed.map((dataKey) => dataKey.name || dataKey.uniqueKey).join(', ');
                    throw new Error(
                        `Cannot delete NUID Search data key${stillUsed.length > 1 ? 's' : ''}: ${names}. ` +
                        `Still used by NUID Search on one or more scripts — disable NUID Search (or remove the field) on those scripts first.`,
                    );
                }
                
            }

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
