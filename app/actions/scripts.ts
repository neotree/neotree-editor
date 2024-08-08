'use server';

import { 
    _saveScripts, 
    _deleteScripts,
    _importRemoteScripts, 
} from "@/databases/mutations/scripts";
import { 
    _getScript, 
    _getScripts, 
    _countScripts, 
    _defaultScriptsCount 
} from "@/databases/queries/scripts";
import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";

export const importRemoteScripts: typeof _importRemoteScripts = async (...args) => {
    try {
        await isAllowed();
        return await _importRemoteScripts(...args);
    } catch(e: any) {
        logger.error('importRemoteScripts ERROR', e.message);
        return { errors: [e.message], success: false, };
    }
};

export const deleteScripts: typeof _deleteScripts = async (...args) => {
    try {
        await isAllowed();
        return await _deleteScripts(...args);
    } catch(e: any) {
        logger.error('deleteScripts ERROR', e.message);
        return { errors: [e.message], success: false, };
    }
};

export const countScripts: typeof _countScripts = async (...args) => {
    try {
        await isAllowed();
        return await _countScripts(...args);
    } catch(e: any) {
        logger.error('countScripts ERROR', e.message);
        return { errors: [e.message], data: _defaultScriptsCount, };
    }
};

export const getScripts: typeof _getScripts = async (...args) => {
    try {
        await isAllowed();
        return await _getScripts(...args);
    } catch(e: any) {
        logger.error('getScripts ERROR', e.message);
        return { errors: [e.message], data: [], };
    }
};

export const getScript: typeof _getScript = async (...args) => {
    await isAllowed();
    return await _getScript(...args);
};

export const saveScripts: typeof _saveScripts = async (...args) => {
    try {
        await isAllowed();
        return await _saveScripts(...args);
    } catch(e: any) {
        logger.error('getSys ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};
