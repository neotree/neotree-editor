'use server';

import { 
    _deleteScreensDrafts, 
    _createScreensDrafts,
    _updateScreensDrafts,
} from '@/databases/mutations/screens-drafts';
import { 
    _countScreensDrafts,
    _getFullScreenDraft, 
    _getScreenDraft, 
    _getScreensDrafts, 
    _getScreensDraftsDefaultResults, 
    GetScreenDraftParams, 
} from "@/databases/queries/screens-drafts";
import { _getLastScreenPosition } from '@/databases/queries/screens';
import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";

export const countScreensDrafts = _countScreensDrafts;

export async function getScreenDraft(params: GetScreenDraftParams) {
    try {
        await isAllowed('get_screens');

        const screenDraft = await _getScreenDraft(params);
        return screenDraft || null;
    } catch(e) {
        logger.error('getScreenDraft ERROR:', e);
        return null;
    }
}

export async function getFullScreenDraft(params: GetScreenDraftParams) {
    try {
        await isAllowed('get_screens');

        const screenDraft = await _getFullScreenDraft(params);
        return screenDraft || null;
    } catch(e) {
        logger.error('getFullScreenDraft ERROR:', e);
        return null;
    }
}

export const getScreensDrafts: typeof _getScreensDrafts = async (...args) => {
    try {
        await isAllowed('get_screens');

        return await _getScreensDrafts(...args);
    } catch(e: any) {
        return {
            ..._getScreensDraftsDefaultResults,
            error: e.message,
        };
    }
};

export const searchScreensDrafts: typeof _getScreensDrafts = async (...args) => {
    try {
        await isAllowed('search_screens');

        return await _getScreensDrafts(...args);
    } catch(e: any) {
        logger.error(e.message);
        return {
            ..._getScreensDraftsDefaultResults,
            error: e.message,
        };
    }
};

export async function deleteScreensDrafts(screenDraftIds: string[]) {
    try {
        await isAllowed('delete_screens');

        if (screenDraftIds.length) {
            await _deleteScreensDrafts(screenDraftIds);
        }
        return true;
    } catch(e: any) {
        logger.error('deleteScreensDrafts ERROR', e.message);
        throw e;
    }
}

export async function getScreenDraftPosition() {
    const lastPosition = await _getLastScreenPosition();
    const countScreensDrafts = await _countScreensDrafts();
    return lastPosition + countScreensDrafts + 1;
}

export const createScreensDrafts: typeof _createScreensDrafts = async (...args) => {
    try {
        await isAllowed('create_screens');

        const res = await _createScreensDrafts(...args);
        return res;
    } catch(e) {
        logger.error('createScreensDrafts ERROR', e);
        throw e;
    }
};

export const updateScreensDrafts: typeof _updateScreensDrafts = async (...args) => {
    try {
        await isAllowed('update_screens');
        const res = await _updateScreensDrafts(...args);
        return res;
    } catch(e) {
        logger.error('updateScreensDrafts ERROR', e);
        throw e;
    }
};
