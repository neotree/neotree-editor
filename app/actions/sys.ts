'use server';

import { _updateSys, UpdateSysResponse } from "@/databases/mutations/sys";
import { _getSys } from "@/databases/queries/sys";
import logger from "@/lib/logger";

export const getSys: typeof _getSys = async (...args) => {
    return await _getSys(...args);
};

export const updateSys: typeof _updateSys = async (...args) => {
    let response: UpdateSysResponse = { success: false, };
    try {
        response = await _updateSys(...args);
    } catch(e: any) {
        response.errors = [e.message];
        logger.error('getSys ERROR', e.message);
    } finally {
        return response;
    }
};
