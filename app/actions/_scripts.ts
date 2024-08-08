'use server';

import { 
    _deleteScripts, 
    _createScripts,
    _updateScripts,
    _updateScriptsWithoutPublishing,
    _importScripts,
} from '@/databases/mutations/scripts';
import { 
    _listScripts,
    _getFullScript, 
    _getScript, 
    _getScriptWithDraft,
    _getScripts, 
    _getScriptsDefaultResults, 
    GetScriptParams, 
    _countScriptsItems,
} from "@/databases/queries/scripts";
import logger from "@/lib/logger";
import { _getScriptsDrafts } from '@/databases/queries/scripts-drafts';
import { isAllowed } from "./is-allowed";

export const countScriptsItems: typeof _countScriptsItems = async (...args) => {
    try {
        await isAllowed(['create_scripts']);
        return await _countScriptsItems(...args);
    } catch(e: any) {
        logger.error('countScriptsItems ERROR:', e);
        return { data: [], errors: [e.message], };
    }
}

export const importScripts: typeof _importScripts = async (...args) => {
    try {
        await isAllowed(['create_scripts']);
        return await _importScripts(...args);
    } catch(e: any) {
        logger.error('_importScripts ERROR:', e);
        return { success: false, errors: [e.message], };
    }
}

export const listScripts: typeof _listScripts = async (...args) => {
    try {
        await isAllowed('get_scripts');
        return await _listScripts(...args);
    } catch(e: any) {
        logger.error('listScripts ERROR:', e);
        return { data: [], error: e.message, };
    }
}

export const updateScriptsWithoutPublishing: typeof _updateScriptsWithoutPublishing = async (...args) => {
    try {
        await isAllowed('update_scripts');
        const res = await _updateScriptsWithoutPublishing(...args);
        return res;
    } catch(e) {
        logger.error('updateScriptsWithoutPublishing ERROR', e);
        throw e;
    }
}

export async function getScript(params: GetScriptParams) {
    try {
        await isAllowed('get_script');

        const script = await _getScript(params);
        return script || null;
    } catch(e) {
        logger.error('getScript ERROR:', e);
        return null;
    }
}

export async function getScriptWithDraft(params: GetScriptParams) {
    try {
        await isAllowed('get_script');

        const script = await _getScriptWithDraft(params);
        return script || null!;
    } catch(e) {
        logger.error('getScriptWithDraft ERROR:', e);
        return null!;
    }
}

export async function getFullScript(params: GetScriptParams) {
    try {
        await isAllowed('get_script');

        const script = await _getFullScript(params);
        return script || null;
    } catch(e) {
        logger.error('getFullScript ERROR:', e);
        return null;
    }
}

export const getEmptyScripts: typeof _getScripts = async () => {
    return _getScriptsDefaultResults;
};

export const getScripts: typeof _getScripts = async (...args) => {
    try {
        await isAllowed('get_scripts');

        return await _getScripts(...args);
    } catch(e: any) {
        logger.error(e.message);
        return {
            ..._getScriptsDefaultResults,
            error: e.message,
        };
    }
};

export const searchScripts: typeof _getScripts = async (...args) => {
    try {
        await isAllowed('search_scripts');

        return await _getScripts(...args);
    } catch(e: any) {
        logger.error(e.message);
        return {
            ..._getScriptsDefaultResults,
            error: e.message,
        };
    }
};

export async function deleteScripts(scriptIds: string[]) {
    try {
        await isAllowed('delete_scripts');

        if (scriptIds.length) {
            await _deleteScripts(scriptIds);
        }

        return true;
    } catch(e: any) {
        logger.error(e.message);
        throw e;
    }
}

export const createScripts: typeof _createScripts = async (...args) => {
    try {
        await isAllowed('create_scripts');

        const res = await _createScripts(...args);
        return res;
    } catch(e) {
        logger.error('createScripts ERROR', e);
        throw e;
    }
};

export const updateScripts: typeof _updateScripts = async (...args) => {
    try {
        await isAllowed('update_scripts');
        const res = await _updateScripts(...args);
        return res;
    } catch(e) {
        logger.error('updateScripts ERROR', e);
        throw e;
    }
};

export async function getScriptsTableData() {
    const results: {
        data: Awaited<ReturnType<typeof _getScripts>>['data'];
        error?: string;
    } = {
        data: [],
    }
    
    try {
        const scripts = await _getScripts();
        const drafts = await _getScriptsDrafts();
        results.data = [
            ...scripts.data.filter(s => !drafts.data.map(s => s.scriptId).includes(s.scriptId)),
            ...drafts.data as typeof scripts.data,
        ].sort((a, b) => a.position - b.position);
    } catch(e: any) {
        results.error = e.message;
    } finally {
        return results;
    }
}
