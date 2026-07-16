'use client';

import axios from "axios";

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
    const params = new URLSearchParams();
    params.set('dataKeysIds', JSON.stringify(dataKeysIds));

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
