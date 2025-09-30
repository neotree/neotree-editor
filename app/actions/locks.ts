import { isAllowed } from "./is-allowed";
import {_createNewLock,isLocked,isAvailableForUpdate,dropLocks} from "@/databases/mutations/script-lock";
import logger from "@/lib/logger";


export const createLock: typeof _createNewLock = async (...args) => {
        await isAllowed();
        return await _createNewLock(...args);
    
};

export const getLockStatus: typeof isLocked = async (...args) => {
    try {
        await isAllowed();
       
            return await isLocked(...args);
        
    } catch (e: any) {
        logger.error('getLocks Status ERROR', e.message);
        return false;
    }
};

export const dropStaleLocks: typeof dropLocks = async (...args) => {
    try {
        await isAllowed();
       
            return await dropLocks(...args);
        
    } catch (e: any) {
        logger.error('getLocks Status ERROR', e.message);
    }
};

export const getUpdateAvailability: typeof isAvailableForUpdate = async (...args) => {
    try {
        await isAllowed();
       
            return await isAvailableForUpdate(...args);
        
    } catch (e: any) {
        logger.error('getLocks Status ERROR', e.message);
        return false;
    }
};

