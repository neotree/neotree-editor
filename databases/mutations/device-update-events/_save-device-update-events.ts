import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import { deviceUpdateEvents } from "@/databases/pg/schema";

export type SaveDeviceUpdateEventsData = typeof deviceUpdateEvents.$inferInsert;

export type SaveDeviceUpdateEventsResponse = {
    success: boolean;
    inserted: (typeof deviceUpdateEvents.$inferSelect)[];
    errors?: string[];
};

export async function _saveDeviceUpdateEvents({ data, returnSaved }: {
    data: SaveDeviceUpdateEventsData[];
    returnSaved?: boolean;
}): Promise<SaveDeviceUpdateEventsResponse> {
    const response: SaveDeviceUpdateEventsResponse = { success: false, inserted: [] };

    try {
        const q = db.insert(deviceUpdateEvents).values(data);

        if (returnSaved) {
            const inserted = await q.returning();
            response.inserted = inserted;
        } else {
            await q.execute();
        }

        response.success = true;
    } catch (e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_saveDeviceUpdateEvents ERROR', e.message);
    }

    return response;
}
