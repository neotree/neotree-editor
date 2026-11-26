import { count, eq, inArray, or, } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { devices } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { _getUniqueDeviceHash } from '@/databases/queries/devices';

async function deviceIdExists(deviceId: string) {
    const [{ n }] = await db.select({ n: count() }).from(devices).where(eq(devices.deviceId, deviceId));
    return !!n;
}
import { DeviceDetails } from '@/types';
import { describeError } from '@/lib/server/db-errors';
import { mergeDeviceDetails } from '@/lib/device-uid';

/** A unique-constraint violation (Postgres 23505), however deep the driver nests it. */
const isUniqueViolation = (e: any): boolean => {
    for (let c = e, depth = 0; c && depth < 5; c = c.cause, depth++) if (c.code === '23505') return true;
    return false;
};

export type SaveDevicesData = Omit<typeof devices.$inferInsert, 'deviceHash'> & {
    deviceHash?: string;
};

export type SaveDevicesResponse = { 
    success: boolean;
    inserted: (Omit<typeof devices.$inferSelect, 'details'> & {
        details: DeviceDetails;
    })[];
    errors?: string[]; 
};

export async function _saveDevices({ data, returnSaved, }: {
    data: SaveDevicesData[],
    returnSaved?: boolean;
}) {
    const response: SaveDevicesResponse = { success: false, inserted: [], };

    try {
        const devicesIds = data.map(d => d.deviceId).filter(s => s);

        const existing = !devicesIds.length ? [] : await db.query.devices.findMany({
            where: inArray(devices.deviceId, devicesIds),
            columns: { deviceId: true, deviceHash: true, id: true, },
        });

        const updateData = data.filter(d => existing.map(d => d.deviceId).includes(d.deviceId));
        const insertData = data.filter(d => !updateData.map(d => d.deviceId).includes(d.deviceId))

        const errors = [];

        for (const { deviceId, ...item } of updateData) {
            try {
                // Merge details and never lower the session count: the row is locked so two tablets'
                // uploads (or a stale one arriving late) cannot overwrite each other.
                const updated = await db.transaction(async tx => {
                    const [current] = await tx.select({ details: devices.details }).from(devices).where(eq(devices.deviceId, deviceId)).for('update');
                    const set = item.details === undefined ? item : { ...item, details: mergeDeviceDetails(current?.details as DeviceDetails, item.details as DeviceDetails) };
                    return tx.update(devices).set(set).where(eq(devices.deviceId, deviceId)).returning();
                });

                if (returnSaved) {
                    response.inserted.push(...updated.map(d => ({
                        ...d,
                        details: d.details as DeviceDetails,
                    })));
                }
            } catch(e: any) {
                errors.push(describeError(e));
            }
        }

        for (const d of insertData) {
            // Two tablets registering at once can pick the same free hash; the unique constraint
            // rejects the second, which then simply picks again.
            for (let attempt = 1; ; attempt++) {
                try {
                    const deviceHash = await _getUniqueDeviceHash(d.deviceId);
                    const inserted = await db.insert(devices).values({ ...d, deviceHash, }).returning();
                    if (returnSaved) {
                        response.inserted.push(...inserted.map(r => ({
                            ...r,
                            details: r.details as DeviceDetails,
                        })));
                    }
                    break;
                } catch(e: any) {
                    if (attempt < 5 && isUniqueViolation(e) && !(await deviceIdExists(d.deviceId))) continue;
                    throw e;
                }
            }
        }

        if (errors.length) {
            response.errors = errors;
        } else {
            response.success = true;
        }
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_saveDevices ERROR', e.message);
    } finally {
        if (!response?.errors?.length) socket.emit('data_changed', 'save_devices');
        return response;
    }
}
