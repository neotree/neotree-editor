'use client';

import axios from "axios";

import type { DeleteDataKeysParams, DeleteDataKeysResponse } from "@/databases/mutations/data-keys";

export type DeleteImpactItem = {
    dataKeyId: string;
    uniqueKey: string;
    name: string;
    label: string;
    dataType: string;
    options: string[];
    scripts: Array<{
        scriptId: string;
        scriptTitle: string;
        usages?: Array<{
            label: string;
            href: string;
        }>;
    }>;
};

export async function fetchDataKeyDeleteImpact(dataKeysIds: string[]) {
    // POST: the harmonise pages ask about hundreds of keys at once.
    const response = await axios.post<{
        success: boolean;
        data: DeleteImpactItem[];
        errors?: string[];
    }>('/api/data-keys/delete-impact', { dataKeysIds });

    if (response.data.errors?.length) {
        throw new Error(response.data.errors[0]);
    }

    return response.data.data || [];
}

/**
 * Impact of unlinking child keys from a parent data key: only usages of the
 * children as owned options of that parent (screens/fields bound to it).
 */
export async function fetchDataKeyUnlinkImpact(parentUniqueKey: string, childUniqueKeys: string[]) {
    const params = new URLSearchParams();
    params.set('uniqueKeys', JSON.stringify(childUniqueKeys));
    params.set('scopeParentUniqueKey', parentUniqueKey);

    const response = await axios.get<{
        success: boolean;
        data: DeleteImpactItem[];
        errors?: string[];
    }>(`/api/data-keys/delete-impact?${params.toString()}`);

    if (response.data.errors?.length) {
        throw new Error(response.data.errors[0]);
    }

    return response.data.data || [];
}

/** Dry run of a delete/replace: what it would change in each script, and any conflicts. */
export async function previewDataKeyDelete(params: Omit<DeleteDataKeysParams, 'userId' | 'broadcastAction' | 'dryRun'>) {
    const response = await axios.post<DeleteDataKeysResponse>('/api/data-keys/delete/preview', params);
    return { preview: response.data.preview, errors: response.data.errors };
}
