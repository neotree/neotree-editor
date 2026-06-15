import { eq } from "drizzle-orm";

import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import { deviceAppStates } from "@/databases/pg/schema";
import socket from "@/lib/socket";

export type SaveDeviceAppStatesData = typeof deviceAppStates.$inferInsert;

export type SaveDeviceAppStatesResponse = {
    success: boolean;
    inserted: (typeof deviceAppStates.$inferSelect)[];
    errors?: string[];
};

export async function _saveDeviceAppStates({ data, returnSaved, broadcastAction = true }: {
    data: SaveDeviceAppStatesData[];
    returnSaved?: boolean;
    broadcastAction?: boolean;
}): Promise<SaveDeviceAppStatesResponse> {
    const response: SaveDeviceAppStatesResponse = { success: false, inserted: [] };

    try {
        const errors: string[] = [];

        for (const item of data) {
            try {
                if (!item.deviceId) {
                    errors.push("Missing deviceId");
                    continue;
                }

                const existing = await db.query.deviceAppStates.findFirst({
                    where: eq(deviceAppStates.deviceId, item.deviceId),
                    columns: { id: true },
                });

                const now = new Date();
                const payload = {
                    ...item,
                    reportedAt: item.reportedAt || now,
                    lastSeenAt: item.lastSeenAt || now,
                } as typeof deviceAppStates.$inferInsert;

                if (existing) {
                    const q = db.update(deviceAppStates).set(payload).where(eq(deviceAppStates.deviceId, item.deviceId));

                    if (returnSaved) {
                        const inserted = await q.returning();
                        response.inserted.push(...inserted);
                    } else {
                        await q.execute();
                    }
                } else {
                    const q = db.insert(deviceAppStates).values(payload);

                    if (returnSaved) {
                        const inserted = await q.returning();
                        response.inserted.push(...inserted);
                    } else {
                        await q.execute();
                    }
                }
            } catch (e: any) {
                errors.push(e.message);
            }
        }

        if (errors.length) {
            response.errors = errors;
        } else {
            response.success = true;
        }
    } catch (e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error("_saveDeviceAppStates ERROR", e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction) socket.emit("data_changed", "save_device_app_states");
        return response;
    }
}
