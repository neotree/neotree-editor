'use server';

import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";
import { _getDeviceAppState, _getDeviceAppStates } from "@/databases/queries/device-app-states";

export const getDeviceAppStates: typeof _getDeviceAppStates = async (...args) => {
    try {
        await isAllowed();
        return await _getDeviceAppStates(...args);
    } catch (e: any) {
        logger.error("getDeviceAppStates ERROR", e.message);
        return { data: [], errors: [e.message] };
    }
};

export const getDeviceAppState: typeof _getDeviceAppState = async (...args) => {
    try {
        await isAllowed();
        return await _getDeviceAppState(...args);
    } catch (e: any) {
        logger.error("getDeviceAppState ERROR", e.message);
        return { data: null, errors: [e.message] };
    }
};
