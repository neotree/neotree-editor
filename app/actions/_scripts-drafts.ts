'use server';

import { 
    _deleteScriptsDrafts, 
    _createScriptsDrafts,
    _updateScriptsDrafts,
} from '@/databases/mutations/scripts-drafts';
import { 
    _getFullScriptDraft, 
    _getScriptDraft, 
    _getScriptsDrafts, 
    _getScriptsDraftsDefaultResults, 
    GetScriptDraftParams, 
    _countScriptsDrafts,
} from "@/databases/queries/scripts-drafts";
import { _getLastScriptPosition } from '@/databases/queries/scripts';
import logger from "@/lib/logger";
import { _countConfigKeysDrafts } from '@/databases/queries/_config-keys-drafts';
import { isAllowed } from "./is-allowed";

export const countScriptsDrafts = _countScriptsDrafts;

export async function getScriptDraft(params: GetScriptDraftParams) {
    try {
        await isAllowed('get_scripts');

        const scriptDraft = await _getScriptDraft(params);
        return scriptDraft || null;
    } catch(e) {
        logger.error('getScriptDraft ERROR:', e);
        return null;
    }
}

export async function getFullScriptDraft(params: GetScriptDraftParams) {
    try {
        await isAllowed('get_scripts');

        const scriptDraft = await _getFullScriptDraft(params);
        return scriptDraft || null;
    } catch(e) {
        logger.error('getFullScriptDraft ERROR:', e);
        return null;
    }
}

export const getScriptDrafts: typeof _getScriptsDrafts = async (...args) => {
    try {
        await isAllowed('get_scripts');

        return await _getScriptsDrafts(...args);
    } catch(e: any) {
        return {
            ..._getScriptsDraftsDefaultResults,
            error: e.message,
        };
    }
};

export const searchScriptDrafts: typeof _getScriptsDrafts = async (...args) => {
    try {
        await isAllowed('search_scripts');

        return await _getScriptsDrafts(...args);
    } catch(e: any) {
        logger.error(e.message);
        return {
            ..._getScriptsDraftsDefaultResults,
            error: e.message,
        };
    }
};

export async function deleteScriptsDrafts(scriptDraftIds: string[]) {
    try {
        await isAllowed('delete_scripts');

        if (scriptDraftIds.length) {
            await _deleteScriptsDrafts(scriptDraftIds);
        }

        return true;
    } catch(e: any) {
        logger.error(e.message);
        throw e;
    }
}

export async function getScriptDraftPosition() {
    const lastPosition = await _getLastScriptPosition();
    const countScriptsDrafts = await _countConfigKeysDrafts();
    return lastPosition + countScriptsDrafts + 1;
}

export const createScriptsDrafts: typeof _createScriptsDrafts = async (...args) => {
    try {
        await isAllowed('create_scripts');

        let position = await getScriptDraftPosition();
        
        for (const s of args[0]) {
            if (s.data.version === 1) {
                s.data.position = position;
                position++;
            }
        }

        const res = await _createScriptsDrafts(...args);
        
        return res;
    } catch(e) {
        logger.error('createScriptDrafts ERROR', e);
        throw e;
    }
};

export const updateScriptsDrafts: typeof _updateScriptsDrafts = async (...args) => {
    try {
        await isAllowed('update_scripts');
        const res = await _updateScriptsDrafts(...args);
        return res;
    } catch(e) {
        logger.error('updateScriptDrafts ERROR', e);
        throw e;
    }
};
