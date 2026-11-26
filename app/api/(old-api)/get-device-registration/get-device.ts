import logger from "@/lib/logger";
import { _getDevice } from "@/databases/queries/devices";
import { _getDatesWhenUpdatesWereMade } from "@/databases/queries/ops";
import { _getEditorInfo } from "@/databases/queries/editor-info";
import { _saveDevices } from "@/databases/mutations/devices";
import { getUidCounterFloor } from "@/lib/device-uid";

export async function getDevice(deviceId: string) {
	try {
        if (!deviceId) throw new Error('Device ID not provided!');

        const info = await _getEditorInfo();
        if (info?.errors) throw new Error(info.errors.join(', '));

        let res = !deviceId ? { data: null, } : await _getDevice({ deviceId, });
        if (res?.errors) throw new Error(res.errors.join(', '));

        let device = res.data;

        if (!device) {
            const res = await _saveDevices({
                data: [{
                    deviceId,
                    details: { scripts_count: 0, },
                }],
                returnSaved: true,
            });

            if (res?.errors) throw new Error(res.errors.join(', '));

            device = res.inserted[0];
        }

        const lastUpdates = await _getDatesWhenUpdatesWereMade({ publishedOnly: true, });
        
        const dates = Object.values(lastUpdates.data).filter(d => d).map(d => new Date(d!).getTime());

        let last_backup_date = info.data?.lastPublishDate;

        if (dates.length) last_backup_date = new Date(Math.max(...dates));

		return { 
            device: {
                id: device?.id,
                details: device?.details,
                device_id: device?.deviceId,
                device_hash: device?.deviceHash,
                // Where a tablet whose own session counter is behind this device's reported count must
                // resume so no UID number is reused (0 = nothing reported yet).
                uid_counter_floor: getUidCounterFloor((device?.details as any)?.scripts_count),
                deletedAt: device?.deletedAt,
                createdAt: device?.createdAt,
                updatedAt: device?.updatedAt,
            }, 
            info: {
                id: info.data?.id,
                version: info.data?.dataVersion,
                should_track_usage: false,
                last_backup_date,
            }, 
        };
	} catch(e: any) {
		logger.error('getDevice ERROR', e.message);
		return { errors: [e.message] as string[] };
	}
}
