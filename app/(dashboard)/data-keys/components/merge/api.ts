'use client';

import axios from 'axios';

import type {
    MergeBatchItem,
    MergeBatchResult,
    MergeDataKeysParams,
    MergeDataKeysResponse,
} from '@/databases/mutations/data-keys';

type MergeRequest = Omit<MergeDataKeysParams, 'userId' | 'broadcastAction' | 'dryRun' | 'signal' | 'sources'>;

/** Runs the merge in a rolled-back transaction and returns what would change. */
export async function previewDataKeysMerge(params: MergeRequest, signal?: AbortSignal) {
    const res = await axios.post<MergeDataKeysResponse>('/api/data-keys/merge/preview', params, { signal });
    return res.data;
}

export async function mergeDataKeyGroups(groups: MergeBatchItem[], dryRun: boolean, signal?: AbortSignal) {
    const res = await axios.post<{ success: boolean; results: MergeBatchResult[]; errors?: string[] }>(
        '/api/data-keys/merge/batch',
        { groups, dryRun },
        { signal },
    );
    if (res.data.errors?.length) throw new Error(res.data.errors[0]);
    return res.data.results;
}

export async function revertDataKeysMerge(mergeId: string) {
    const res = await axios.post<{ success: boolean; errors?: string[] }>(`/api/data-keys/merge/${mergeId}/revert`);
    if (res.data.errors?.length) throw new Error(res.data.errors[0]);
}

export async function dismissDuplicateGroup(uniqueKeys: string[], reason: string) {
    const res = await axios.post<{ success: boolean; errors?: string[] }>('/api/data-keys/duplicates/dismissals', { uniqueKeys, reason });
    if (res.data.errors?.length) throw new Error(res.data.errors[0]);
}

export async function restoreDuplicateGroup(groupKey: string) {
    const res = await axios.delete<{ success: boolean; errors?: string[] }>(
        `/api/data-keys/duplicates/dismissals?groupKey=${encodeURIComponent(groupKey)}`,
    );
    if (res.data.errors?.length) throw new Error(res.data.errors[0]);
}
