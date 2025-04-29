'use server';

import queryString from 'query-string';

import { _fetch } from '@/lib/fetch';
import { GetDataKeysParams, GetDataKeysResults } from '@/databases/queries/data-keys';
import { _saveDataKeys } from '@/databases/mutations/data-keys';

export const saveDataKeys = _saveDataKeys;

export const fetchDataKeys = async (params?: GetDataKeysParams) => {
    const res = await _fetch<GetDataKeysResults>(`/api/data-keys?${queryString.stringify({ ...params })}`, {
        cache: 'no-cache',
    });
    return res;
}
