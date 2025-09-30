'use server';

import { _saveConfigKeys, _deleteConfigKeys } from "@/databases/mutations/config-keys";
import { _getConfigKey, _getConfigKeys, _countConfigKeys, _defaultConfigKeysCount } from "@/databases/queries/config-keys";
import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";

export const deleteConfigKeys: typeof _deleteConfigKeys = async (...args) => {
    try {
        await isAllowed();
        return await _deleteConfigKeys(...args);
    } catch(e: any) {
        logger.error('deleteConfigKeys ERROR', e.message);
        return { errors: [e.message], success: false, };
    }
};

export const countConfigKeys: typeof _countConfigKeys = async (...args) => {
    try {
        await isAllowed();
        return await _countConfigKeys(...args);
    } catch(e: any) {
        logger.error('countConfigKeys ERROR', e.message);
        return { errors: [e.message], data: _defaultConfigKeysCount, };
    }
};

export const getConfigKeys: typeof _getConfigKeys = async (...args) => {
    try {
        await isAllowed();
        return await _getConfigKeys(...args);
    } catch(e: any) {
        logger.error('getConfigKeys ERROR', e.message);
        return { errors: [e.message], data: [], };
    }
};

export const getConfigKey: typeof _getConfigKey = async (...args) => {
    await isAllowed();
    return await _getConfigKey(...args);
};

export const saveConfigKeys: typeof _saveConfigKeys = async (params) => {
    try {
        const session = await isAllowed();
        return await _saveConfigKeys({
            ...params,
            userId: session.user?.userId,
        });
    } catch(e: any) {
        logger.error('getSys ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};
