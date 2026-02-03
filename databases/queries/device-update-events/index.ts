import { and, desc, eq } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { deviceUpdateEvents } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type GetDeviceUpdateEventsParams = {
    deviceId?: string;
    eventType?: string;
    limit?: number;
    offset?: number;
};

export type GetDeviceUpdateEventsResult = {
    data: (typeof deviceUpdateEvents.$inferSelect)[];
    errors?: string[];
    total?: number;
};

export async function _getDeviceUpdateEvents(params?: GetDeviceUpdateEventsParams): Promise<GetDeviceUpdateEventsResult> {
    try {
        const { deviceId, eventType, limit = 100, offset = 0 } = { ...params };

        const where = [
            ...(deviceId ? [eq(deviceUpdateEvents.deviceId, deviceId)] : []),
            ...(eventType ? [eq(deviceUpdateEvents.eventType, eventType)] : []),
        ];

        const data = await db.query.deviceUpdateEvents.findMany({
            where: !where.length ? undefined : and(...where),
            orderBy: [desc(deviceUpdateEvents.createdAt)],
            limit,
            offset,
        });

        return { data };
    } catch (e: any) {
        logger.error("_getDeviceUpdateEvents ERROR", e.message);
        return { data: [], errors: [e.message] };
    }
}
