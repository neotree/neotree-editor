import { and, eq, count, inArray, or } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { devices } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { generateDeviceHash } from '@/lib/generate-device-hash';
import { DeviceDetails } from "@/types";

export async function _isDeviceHashUnique(hash: string) {
    const [{ count: exists }] = await db.select({ count: count(), }).from(devices).where(eq(devices.deviceHash, hash));
    return !exists;
} 

export async function _getUniqueDeviceHash(deviceId: string, length = 4) {
    let hash = generateDeviceHash(deviceId, length);
    const isUnique = await _isDeviceHashUnique(hash);
    if (isUnique) hash = await generateDeviceHash(deviceId, length);
    return hash;
} 

export type GetDevicesParams = {
    devicesHashKeys?: string[];
    devicesIds?: string[];
    ids?: number[];
};

export type GetDevicesResults = {
    data: (Omit<typeof devices.$inferSelect, 'details'> & {
        details: DeviceDetails;
    })[];
    errors?: string[];
};

export async function _getDevices(params?: GetDevicesParams): Promise<GetDevicesResults> {
    try {
        const {
            devicesIds = [],
            devicesHashKeys = [],
            ids = [],
        } = { ...params };

        const where = [
            ...(!devicesIds?.length ? [] : [inArray(devices.deviceId, devicesIds)]),
            ...(!devicesHashKeys?.length ? [] : [inArray(devices.deviceHash, devicesHashKeys)]),
            ...(!ids?.length ? [] : [inArray(devices.id, ids)]),
        ];

        const data = await db.query.devices.findMany({
            where: !where.length ? undefined : and(...where),
        });

        return  { 
            data: data.map(d => ({
                ...d,
                details: d.details as DeviceDetails,
            })),
        };
    } catch(e: any) {
        logger.error('_getDevices ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}

export type GetDeviceResults = {
    data: null | (Omit<typeof devices.$inferSelect, 'details'> & {
        details: DeviceDetails;
    });
    errors?: string[];
};

export async function _getDevice(params?: {
    deviceHash?: string;
    deviceId?: string;
    id?: number;
}): Promise<GetDeviceResults> {
    try {
        const {
            deviceHash,
            deviceId,
            id,
        } = { ...params };

        const where = [
            ...(deviceHash ? [eq(devices.deviceHash, deviceHash)] : []),
            ...(deviceId ? [eq(devices.deviceId, deviceId)] : []),
            ...(id ? [eq(devices.id, id)] : []),
        ];

        const data = !where.length ? null : await db.query.devices.findFirst({
            where: or(...where),
        });

        return  { 
            data: !data ? null : {
                ...data,
                details: data.details as DeviceDetails,
            }, 
        };
    } catch(e: any) {
        logger.error('_getDevices ERROR', e.message);
        return { data: null, errors: [e.message], };
    }
}
