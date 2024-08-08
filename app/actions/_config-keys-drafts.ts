'use server';

import { 
    _deleteConfigKeysDrafts, 
    _createConfigKeysDrafts,
    _updateConfigKeysDrafts,
} from '@/databases/mutations/_config-keys-drafts';
import { 
    _getFullConfigKeyDraft, 
    _getConfigKeyDraft, 
    _getConfigKeysDrafts, 
    _getConfigKeysDraftsDefaultResults, 
    GetConfigKeyDraftParams,
    _countConfigKeysDrafts, 
} from "@/databases/queries/_config-keys-drafts";
import { _getLastConfigKeyPosition } from '@/databases/queries/_config-keys';
import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";

export const countConfigKeysDrafts = _countConfigKeysDrafts;

export async function getConfigKeyDraft(params: GetConfigKeyDraftParams) {
    try {
        await isAllowed('get_config_keys');

        const configKeyDraft = await _getConfigKeyDraft(params);
        return configKeyDraft || null;
    } catch(e) {
        logger.error('getConfigKeyDraft ERROR:', e);
        return null;
    }
}

export async function getFullConfigKeyDraft(params: GetConfigKeyDraftParams) {
    try {
        await isAllowed('get_config_keys');

        const configKeyDraft = await _getFullConfigKeyDraft(params);
        return configKeyDraft || null;
    } catch(e) {
        logger.error('getFullConfigKeyDraft ERROR:', e);
        return null;
    }
}

export const getConfigKeysDrafts: typeof _getConfigKeysDrafts = async (...args) => {
    try {
        await isAllowed('get_config_keys');

        return await _getConfigKeysDrafts(...args);
    } catch(e: any) {
        logger.error('getConfigKeysDrafts ERROR', e);
        return {
            ..._getConfigKeysDraftsDefaultResults,
            error: e.message,
        };
    }
};

export const searchConfigKeysDrafts: typeof _getConfigKeysDrafts = async (...args) => {
    try {
        await isAllowed('search_config_keys');

        return await _getConfigKeysDrafts(...args);
    } catch(e: any) {
        logger.error('searchConfigKeysDrafts ERROR', e.message);
        return {
            ..._getConfigKeysDraftsDefaultResults,
            error: e.message,
        };
    }
};

export async function deleteConfigKeysDrafts(configKeyDraftIds: string[]) {
    try {
        await isAllowed('delete_config_keys');

        if (configKeyDraftIds.length) {
            await _deleteConfigKeysDrafts(configKeyDraftIds);
            // revalidatePath('/configuration');
        }

        return true;
    } catch(e: any) {
        logger.error('deleteConfigKeysDrafts ERROR', e.message);
        throw e;
    }
}

export async function getConfigKeyDraftPosition() {
    const lastPosition = await _getLastConfigKeyPosition();
    const countFirstVersionsDraft = await _countConfigKeysDrafts();
    return lastPosition + countFirstVersionsDraft + 1;
}

export const createConfigKeysDrafts: typeof _createConfigKeysDrafts = async (...args) => {
    try {
        await isAllowed('create_config_keys');

        let position = await getConfigKeyDraftPosition();
        
        for (const c of args[0]) {
            if (c.data.version === 1) {
                c.data.position = position;
                position++;
            }
        }

        const res = await _createConfigKeysDrafts(...args);

        // revalidatePath('/configuration');

        return res;
    } catch(e) {
        logger.error('createConfigKeysDrafts ERROR', e);
        throw e;
    }
};

export const updateConfigKeysDrafts: typeof _updateConfigKeysDrafts = async (...args) => {
    try {
        await isAllowed('update_config_keys');
        const res = await _updateConfigKeysDrafts(...args);
        // revalidatePath('/configuration');
        return res;
    } catch(e) {
        logger.error('updateConfigKeysDrafts ERROR', e);
        throw e;
    }
};
