import logger from "@/lib/logger";
import { _getDevice } from "@/databases/queries/devices";
import { _getDatesWhenUpdatesWereMade } from "@/databases/queries/ops";
import { _getEditorInfo } from "@/databases/queries/editor-info";
import { _saveDevices } from "@/databases/mutations/devices";
import { createDeviceAuthSecret } from "@/lib/device-credentials";

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
        } else if (!device.deviceAuthSecret) {
            const rotated = await _saveDevices({
                data: [{
                    deviceId,
                    deviceAuthSecret: createDeviceAuthSecret(),
                    deviceAuthSecretRotatedAt: new Date(),
                }],
                returnSaved: true,
            });

            if (rotated?.errors) throw new Error(rotated.errors.join(', '));
            device = rotated.inserted[0] || device;
        }

        const lastUpdates = await _getDatesWhenUpdatesWereMade();
        
        const dates = Object.values(lastUpdates.data).filter(d => d).map(d => new Date(d!).getTime());

        let last_backup_date = info.data?.lastPublishDate;

        if (dates.length) last_backup_date = new Date(Math.max(...dates));

		return { 
            device: {
                id: device?.id,
                details: device?.details,
                device_id: device?.deviceId,
                device_hash: device?.deviceHash,
                device_auth_secret: device?.deviceAuthSecret,
                device_auth_secret_rotated_at: device?.deviceAuthSecretRotatedAt,
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
