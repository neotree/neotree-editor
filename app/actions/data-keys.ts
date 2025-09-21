'use server';

import { GetDataKeysParams, _getDataKeys, _getDataKeysSelectOptions } from '@/databases/queries/data-keys';
import { _saveDataKeys, _saveDataKeysIfNotExist, _saveDataKeysUpdateIfExist, } from '@/databases/mutations/data-keys';
import { getSiteAxiosClient } from "@/lib/server/axios";

export const saveDataKeys = _saveDataKeys;

export const saveDataKeysIfNotExist = _saveDataKeysIfNotExist;

export const saveDataKeysUpdateIfExist = _saveDataKeysUpdateIfExist;

export const getDataKeysSelectOptions = _getDataKeysSelectOptions;

export const getDataKeys = async (params?: GetDataKeysParams) => {
    const res = await _getDataKeys(params);
    return res;
}

export const exportDataKeys = async ({
    uuids,
    siteId,
    overwriteExisting,
}: {
    uuids: string[];
    siteId: string;
    overwriteExisting?: boolean;
}): Promise<{
    success: boolean;
    errors?: string[];
}> => {
    try {
        const axiosClient = await getSiteAxiosClient(siteId);
        
        const dataKeys = await _getDataKeys({
            dataKeysIds: uuids,
            returnDraftsIfExist: true,
        });

        if (dataKeys.errors?.length) {
            return {
                success: false,
                errors: dataKeys.errors,
            };
        }

        let errors: string[] = [];

        if (dataKeys.data.length) {
            if (overwriteExisting) {
                const res = await axiosClient.post<Awaited<ReturnType<typeof saveDataKeysUpdateIfExist>>>('/api/data-keys/save-and-update-if-exist', {
                    data: dataKeys.data,
                    broadcastAction: true,
                } satisfies Parameters<typeof saveDataKeysUpdateIfExist>[0]);

                if (res.data.errors) errors = res.data.errors;
            } else {
                const res = await axiosClient.post<Awaited<ReturnType<typeof saveDataKeysIfNotExist>>>('/api/data-keys/save-if-not-exist', {
                    data: dataKeys.data,
                    broadcastAction: true,
                } satisfies Parameters<typeof saveDataKeysIfNotExist>[0]);

                if (res.data.errors) errors = res.data.errors;
            }
        }

        return {
            success: !errors.length,
            errors: errors.length ? errors : undefined,
        };
    } catch(e: any) {
        return {
            success: false,
            errors: [e.message],
        };
    }
}
