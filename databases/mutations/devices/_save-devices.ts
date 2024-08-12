import { count, eq, inArray, or, } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { devices } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { _getUniqueDeviceHash } from '@/databases/queries/devices';

export type SaveDevicesData = Omit<typeof devices.$inferInsert, 'deviceHash'> & {
    deviceHash?: string;
};

export type SaveDevicesResponse = { 
    success: boolean;
    inserted: typeof devices.$inferSelect[];
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
                const q = db.update(devices).set(item).where(or(
                    eq(devices.deviceId, deviceId)
                ));
                if (returnSaved) {
                    response.inserted = await q.returning();
                } else {
                    await q.execute();
                }
            } catch(e: any) {
                errors.push(e.message);
            }
        }

        if (insertData.length) {
            const _insertData: typeof devices.$inferInsert[] = [];

            for(const d of insertData) {
                const deviceHash = await _getUniqueDeviceHash(d.deviceId);
                _insertData.push({ ...d, deviceHash, });
            }

            const q = db.insert(devices).values(_insertData);
            if (returnSaved) {
                response.inserted = await q.returning();
            } else {
                await q.execute();
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
