'use server';

import queryString from 'query-string';

import { _fetch } from '@/lib/fetch';
import { GetDataKeysParams, GetDataKeysResponse } from '@/databases/queries/data-keys';
import { _createDataKeys, _updateDataKeys, _saveDataKeys } from '@/databases/mutations/data-keys';

export const createDataKeys = _createDataKeys;

export const updateDataKeys = _updateDataKeys;

export const saveDataKeys = _saveDataKeys;

export const fetchDataKeys = async (params?: GetDataKeysParams) => {
    const res = await _fetch<GetDataKeysResponse>(`/api/data-keys?${queryString.stringify({ ...params })}`, {
        cache: 'no-cache',
    });
    return res;
}
