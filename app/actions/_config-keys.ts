'use server';

import { revalidatePath } from 'next/cache';

import { 
    _deleteConfigKeys, 
    _createConfigKeys,
    _updateConfigKeys,
    _updateConfigKeysWithoutPublishing,
} from '@/databases/mutations/_config-keys';
import { 
    _getFullConfigKey, 
    _getConfigKey, 
    _getConfigKeyWithDraft,
    _getConfigKeys, 
    _getConfigKeysDefaultResults, 
    GetConfigKeyParams, 
} from "@/databases/queries/_config-keys";
import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";
import { _getConfigKeysDrafts } from '@/databases/queries/_config-keys-drafts';

export const updateConfigKeysWithoutPublishing: typeof _updateConfigKeysWithoutPublishing = async (...args) => {
    try {
        await isAllowed(['update_config_keys']);
        return await _updateConfigKeysWithoutPublishing(...args);
    } catch(e: any) {
        return { success: false, errors: [e.message], };
    }
};

export async function getConfigKey(params: GetConfigKeyParams) {
    try {
        await isAllowed('get_config_key');

        const configKey = await _getConfigKey(params);
        return configKey || null;
    } catch(e) {
        logger.error('getConfigKey ERROR:', e);
        return null;
    }
}

export async function getConfigKeyWithDraft(params: GetConfigKeyParams) {
    try {
        await isAllowed('get_config_key');

        const configKey = await _getConfigKeyWithDraft(params);
        return configKey || null!;
    } catch(e) {
        logger.error('getConfigKeyWithDraft ERROR:', e);
        return null!;
    }
}

export async function getFullConfigKey(params: GetConfigKeyParams) {
    try {
        await isAllowed('get_config_key');

        const configKey = await _getFullConfigKey(params);
        return configKey || null;
    } catch(e) {
        logger.error('getFullConfigKey ERROR:', e);
        return null;
    }
}

export const getConfigKeys: typeof _getConfigKeys = async (...args) => {
    try {
        await isAllowed('get_config_keys');

        return await _getConfigKeys(...args);
    } catch(e: any) {
        logger.error(e.message);
        return {
            ..._getConfigKeysDefaultResults,
            error: e.message,
        };
    }
};

export const searchConfigKeys: typeof _getConfigKeys = async (...args) => {
    try {
        await isAllowed('search_config_keys');

        return await _getConfigKeys(...args);
    } catch(e: any) {
        logger.error(e.message);
        return {
            ..._getConfigKeysDefaultResults,
            error: e.message,
        };
    }
};

export async function deleteConfigKeys(configKeyIds: string[]) {
    try {
        await isAllowed('delete_config_keys');

        if (configKeyIds.length) {
            await _deleteConfigKeys(configKeyIds);
            // revalidatePath('/configuration');
        }

        return true;
    } catch(e: any) {
        logger.error(e.message);
        throw e;
    }
}

export const createConfigKeys: typeof _createConfigKeys = async (...args) => {
    try {
        await isAllowed('create_config_keys');

        const res = await _createConfigKeys(...args);

        // revalidatePath('/configuration');

        return res;
    } catch(e) {
        logger.error('createConfigKeys ERROR', e);
        throw e;
    }
};

export const updateConfigKeys: typeof _updateConfigKeys = async (...args) => {
    try {
        await isAllowed('update_config_keys');
        const res = await _updateConfigKeys(...args);
        // revalidatePath('/configuration');
        return res;
    } catch(e) {
        logger.error('updateConfigKeys ERROR', e);
        throw e;
    }
};

export async function getConfigKeysTableData() {
    const results: {
        data: Awaited<ReturnType<typeof _getConfigKeys>>['data'];
        error?: string;
    } = {
        data: [],
    }
    
    try {
        const configKeys = await _getConfigKeys();
        const drafts = await _getConfigKeysDrafts();
        results.data = [
            ...configKeys.data.filter(c => !drafts.data.map(c => c.configKeyId).includes(c.configKeyId)),
            ...drafts.data as typeof configKeys.data,
        ].sort((a, b) => a.position - b.position);
    } catch(e: any) {
        results.error = e.message;
    } finally {
        return results;
    }
}
