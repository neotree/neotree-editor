'use client';

import { useEffect, useState } from 'react';

import type { DataKey } from '@/contexts/data-keys';
import { buildDataKeysMergePlan } from '@/lib/data-key-merge-plan';

import { fetchDataKeyDeleteImpact } from '../delete-confirmation';
import { groupScriptsByTitle } from '../delete-replacement-dialog';

/** uuid -> number of scripts (by title) using the key; null while loading. */
export function useScriptUsage(dataKeyIds: string[]) {
    const [usage, setUsage] = useState<Map<string, number> | null>(null);
    const [error, setError] = useState('');
    const idsKey = [...dataKeyIds].sort().join(',');

    useEffect(() => {
        if (!dataKeyIds.length) {
            setUsage(new Map());
            return;
        }
        let cancelled = false;
        setError('');
        fetchDataKeyDeleteImpact(dataKeyIds)
            .then((items) => {
                if (!cancelled) setUsage(new Map(items.map((item) => [item.dataKeyId, groupScriptsByTitle(item.scripts).length])));
            })
            .catch((e: any) => !cancelled && setError(e.message || 'Could not load usage.'));
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idsKey]);

    return { usage, error };
}

/** The key a merge keeps by default: the most used one (first on a tie). */
export function getDefaultSurvivor<T extends DataKey>(group: T[], usage: Map<string, number> | null) {
    return [...group].sort((a, b) => (usage?.get(b.uuid) || 0) - (usage?.get(a.uuid) || 0))[0];
}

/**
 * A group is "clean" when merging it into its default survivor needs no
 * decisions: every option is already shared or matches automatically by name
 * or label — nothing is added, removed or only loosely matched.
 */
export function isCleanGroup(group: DataKey[], dataKeys: DataKey[], usage: Map<string, number> | null) {
    const survivor = getDefaultSurvivor(group, usage);
    const plan = buildDataKeysMergePlan({
        dataKeys,
        survivorId: survivor.uuid,
        mergedIds: group.filter((dataKey) => dataKey.uuid !== survivor.uuid).map((dataKey) => dataKey.uuid),
    });
    return !plan.errors.length
        && !plan.addedOptions.length
        && !plan.droppedChildren.length
        && plan.children.every((row) => row.suggestionReason !== 'similar');
}
