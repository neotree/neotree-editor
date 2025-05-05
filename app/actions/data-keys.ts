'use server';

import { GetDataKeysParams, _getDataKeys } from '@/databases/queries/data-keys';
import { _saveDataKeys } from '@/databases/mutations/data-keys';

export const saveDataKeys = _saveDataKeys;

export const getDataKeys = async (params?: GetDataKeysParams) => {
    const res = await _getDataKeys(params);
    return res;
}
