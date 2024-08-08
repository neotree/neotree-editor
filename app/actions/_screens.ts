'use server';

import { 
    _deleteScreens, 
    _createScreens,
    _updateScreens,
    _updateScreensWithoutPublishing,
    _copyScreens,
} from '@/databases/mutations/screens';
import { 
    _getFullScreen, 
    _getScreen, 
    _getScreenWithDraft,
    _getScreens, 
    _getScreensDefaultResults, 
    GetScreenParams, 
} from "@/databases/queries/screens";
import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";
import { _getScreensDrafts } from '@/databases/queries/screens-drafts';

export async function getScreen(params: GetScreenParams) {
    try {
        await isAllowed('get_screen');

        const screen = await _getScreen(params);
        return screen || null;
    } catch(e) {
        logger.error('getScreen ERROR:', e);
        return null;
    }
}

export async function getScreenWithDraft(params: GetScreenParams) {
    try {
        await isAllowed('get_screen');

        const screen = await _getScreenWithDraft(params);
        return screen || null!;
    } catch(e) {
        logger.error('getScreenWithDraft ERROR:', e);
        return null!;
    }
}

export async function getFullScreen(params: GetScreenParams) {
    try {
        await isAllowed('get_screen');

        const screen = await _getFullScreen(params);
        return screen || null;
    } catch(e) {
        logger.error('getFullScreen ERROR:', e);
        return null;
    }
}

export const getEmptyScreens: typeof _getScreens = async () => {
    return _getScreensDefaultResults;
};

export const getScreens: typeof _getScreens = async (...args) => {
    try {
        await isAllowed('get_screens');

        return await _getScreens(...args);
    } catch(e: any) {
        logger.error(e.message);
        return {
            ..._getScreensDefaultResults,
            error: e.message,
        };
    }
};

export const searchScreens: typeof _getScreens = async (...args) => {
    try {
        await isAllowed('search_screens');

        return await _getScreens(...args);
    } catch(e: any) {
        logger.error(e.message);
        return {
            ..._getScreensDefaultResults,
            error: e.message,
        };
    }
};

export async function deleteScreens(screenIds: string[]) {
    try {
        await isAllowed('delete_screens');
        if (screenIds.length) {
            await _deleteScreens(screenIds);
        }

        return true;
    } catch(e: any) {
        logger.error('deleteScreens ERROR', e.message);
        throw e;
    }
}

export const createScreens: typeof _createScreens = async (...args) => {
    try {
        await isAllowed('create_screens');
        const res = await _createScreens(...args);
        return res;
    } catch(e) {
        logger.error('createScreens ERROR', e);
        throw e;
    }
};

export const updateScreens: typeof _updateScreens = async (...args) => {
    try {
        await isAllowed('update_screens');
        const res = await _updateScreens(...args);
        return res;
    } catch(e) {
        logger.error('updateScreens ERROR', e);
        throw e;
    }
};

export const updateScreensWithoutPublishing: typeof _updateScreensWithoutPublishing = async (...args) => {
    try {
        await isAllowed('update_screens');
        const res = await _updateScreensWithoutPublishing(...args);
        return res;
    } catch(e) {
        logger.error('updateScreensWithoutPublishing ERROR', e);
        throw e;
    }
}

export const copyScreens: typeof _copyScreens = async (...args) => {
    try {
        await isAllowed('create_screens');
        const res = await _copyScreens(...args);
        return res;
    } catch(e) {
        logger.error('copyScreens ERROR', e);
        throw e;
    }
}

export async function getScreensTableData({ scriptsIds = [], scriptsDraftsIds = [], }: {
    scriptsIds?: string[];
    scriptsDraftsIds?: string[];
}) {
    const results: {
        data: Awaited<ReturnType<typeof _getScreens>>['data'];
        error?: string;
    } = {
        data: [],
    }
    
    try {
        const screens = scriptsIds?.length ? await _getScreens({ scriptsIds, }) : { data: [], };
        const drafts = (scriptsDraftsIds?.length || scriptsIds?.length) ? await _getScreensDrafts({ scriptsDraftsIds, scriptsIds, }) : { data: [], };
        results.data = [
            ...screens.data.filter(s => !drafts.data.map(s => s.screenId).includes(s.screenId)).map(s => ({
                ...s,
            })),
            ...(drafts.data as typeof screens.data).map(s => ({
                ...s,
            })),
        ].sort((a, b) => a.position - b.position);
    } catch(e: any) {
        results.error = e.message;
    } finally {
        return results;
    }
}
