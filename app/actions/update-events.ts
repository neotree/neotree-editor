'use server';

import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";
import { _getDeviceUpdateEvents } from "@/databases/queries/device-update-events";

export const getDeviceUpdateEvents: typeof _getDeviceUpdateEvents = async (...args) => {
    try {
        await isAllowed();
        return await _getDeviceUpdateEvents(...args);
    } catch (e: any) {
        logger.error("getDeviceUpdateEvents ERROR", e.message);
        return { data: [], errors: [e.message] };
    }
};
