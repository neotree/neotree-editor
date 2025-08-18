import { isAllowed } from "./is-allowed";
import {_createNewLock,lockExists} from "@/databases/mutations/script-lock";
import logger from "@/lib/logger";


export const createLock: typeof _createNewLock = async (...args) => {
    try {
        await isAllowed();
        return await _createNewLock(...args);
    } catch (e: any) {
        logger.error('create lock ERROR', e.message);
    
    }
};

export const getLockStatus: typeof lockExists = async (...args) => {
    try {
        await isAllowed();
       
        
       
            return await lockExists(...args);
        
    } catch (e: any) {
        logger.error('getLocks Status ERROR', e.message);
        return false;
    }
};

