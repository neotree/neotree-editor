'use server';

import queryString from 'query-string';

import { _fetch } from '@/lib/fetch';
import { GetDataKeysParams, GetDataKeysResponse } from '@/databases/queries/data-keys';

export const fetchDataKeys = async (params?: GetDataKeysParams) => {
    const res = await _fetch<GetDataKeysResponse>(`/api/data-keys?${queryString.stringify({ ...params })}`, {
        cache: 'no-cache',
    });
    return res;
}
