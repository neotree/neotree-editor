'use server';

import { 
    _saveDrugsLibraryItems, 
    _deleteDrugsLibraryItems,
    _copyDrugsLibraryItems 
} from "@/databases/mutations/drugs-library";
import { 
    _getDrugsLibraryItem, 
    _getDrugsLibraryItems, 
    _countDrugsLibraryItems, 
    _defaultDrugsLibraryItemsCount 
} from "@/databases/queries/drugs-library";
import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";

export const copyDrugsLibraryItems: typeof _copyDrugsLibraryItems = async (...args) => {
    try {
        await isAllowed();
        return await _copyDrugsLibraryItems(...args);
    } catch(e: any) {
        logger.error('copyDrugsLibraryItems ERROR', e.message);
        return { errors: [e.message], success: false, };
    }
};

export const deleteDrugsLibraryItems: typeof _deleteDrugsLibraryItems = async (...args) => {
    try {
        await isAllowed();
        return await _deleteDrugsLibraryItems(...args);
    } catch(e: any) {
        logger.error('deleteDrugsLibraryItems ERROR', e.message);
        return { errors: [e.message], success: false, };
    }
};

export const countDrugsLibraryItems: typeof _countDrugsLibraryItems = async (...args) => {
    try {
        await isAllowed();
        return await _countDrugsLibraryItems(...args);
    } catch(e: any) {
        logger.error('countDrugsLibraryItems ERROR', e.message);
        return { errors: [e.message], data: _defaultDrugsLibraryItemsCount, };
    }
};

export const getDrugsLibraryItems: typeof _getDrugsLibraryItems = async (...args) => {
    try {
        await isAllowed();
        return await _getDrugsLibraryItems(...args);
    } catch(e: any) {
        logger.error('getDrugsLibraryItems ERROR', e.message);
        return { errors: [e.message], data: [], };
    }
};

export const getDrugsLibraryItem: typeof _getDrugsLibraryItem = async (...args) => {
    await isAllowed();
    return await _getDrugsLibraryItem(...args);
};

export const saveDrugsLibraryItems: typeof _saveDrugsLibraryItems = async (...args) => {
    try {
        await isAllowed();
        return await _saveDrugsLibraryItems(...args);
    } catch(e: any) {
        logger.error('getSys ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};
