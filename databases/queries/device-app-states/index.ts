import { and, eq, inArray } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { deviceAppStates } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type GetDeviceAppStatesParams = {
    deviceIds?: string[];
};

export type GetDeviceAppStatesResult = {
    data: (typeof deviceAppStates.$inferSelect)[];
    errors?: string[];
};

export async function _getDeviceAppStates(params?: GetDeviceAppStatesParams): Promise<GetDeviceAppStatesResult> {
    try {
        const { deviceIds = [] } = { ...params };

        const where = [
            ...(!deviceIds.length ? [] : [inArray(deviceAppStates.deviceId, deviceIds)]),
        ];

        const data = await db.query.deviceAppStates.findMany({
            where: !where.length ? undefined : and(...where),
        });

        return { data };
    } catch (e: any) {
        logger.error("_getDeviceAppStates ERROR", e.message);
        return { data: [], errors: [e.message] };
    }
}

export type GetDeviceAppStateResult = {
    data: (typeof deviceAppStates.$inferSelect) | null;
    errors?: string[];
};

export async function _getDeviceAppState(params: { deviceId: string }): Promise<GetDeviceAppStateResult> {
    try {
        const data = await db.query.deviceAppStates.findFirst({
            where: eq(deviceAppStates.deviceId, params.deviceId),
        });
        return { data: data || null };
    } catch (e: any) {
        logger.error("_getDeviceAppState ERROR", e.message);
        return { data: null, errors: [e.message] };
    }
}
