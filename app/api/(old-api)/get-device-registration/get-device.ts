import type { NextRequest } from "next/server";

import logger from "@/lib/logger";
import { _getDevice } from "@/databases/queries/devices";
import { _getDatesWhenUpdatesWereMade } from "@/databases/queries/ops";
import { _getEditorInfo } from "@/databases/queries/editor-info";
import { _saveDevices } from "@/databases/mutations/devices";
import { createDeviceAuthSecret, verifyDeviceSignature } from "@/lib/device-credentials";

/**
 * #2 — Device auth secret is issued ONCE on first enrollment. After a device
 * already holds a secret, we only hand it back to a caller that can prove
 * possession with a valid HMAC signature (re-fetch / recovery path). This stops
 * anyone holding the shared API key from harvesting every device's signing key
 * by iterating deviceIds.
 */
export async function getDevice(deviceId: string, opts?: { req?: NextRequest }) {
	try {
        if (!deviceId) throw new Error('Device ID not provided!');

        const info = await _getEditorInfo();
        if (info?.errors) throw new Error(info.errors.join(', '));

        let res = !deviceId ? { data: null, } : await _getDevice({ deviceId, });
        if (res?.errors) throw new Error(res.errors.join(', '));

        let device = res.data;
        // First enrollment, or legacy device that never got a secret: mint + reveal.
        let secretJustIssued = false;

        if (!device) {
            const res = await _saveDevices({
                data: [{
                    deviceId,
                    deviceAuthSecret: createDeviceAuthSecret(),
                    deviceAuthSecretRotatedAt: new Date(),
                    details: { scripts_count: 0, },
                }],
                returnSaved: true,
            });

            if (res?.errors) throw new Error(res.errors.join(', '));

            device = res.inserted[0];
            secretJustIssued = true;
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
            secretJustIssued = true;
        }

        // Decide whether to reveal the secret on this response.
        // - just issued (first enrollment) -> reveal so the device can store it.
        // - otherwise -> only reveal to a caller that signed the request with the
        //   secret it already holds (proves it is the legitimate device).
        let revealSecret = secretJustIssued;
        if (!revealSecret && device?.deviceAuthSecret && opts?.req) {
            const headerDeviceId = opts.req.headers.get("x-device-id");
            const deviceIdMatches = !headerDeviceId || headerDeviceId === deviceId;
            const signature = verifyDeviceSignature({
                req: opts.req,
                body: "",
                secret: device.deviceAuthSecret,
            });
            revealSecret = deviceIdMatches && signature.ok;
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
                device_auth_secret: revealSecret ? device?.deviceAuthSecret : undefined,
                device_auth_secret_rotated_at: revealSecret ? device?.deviceAuthSecretRotatedAt : undefined,
                device_auth_secret_set: !!device?.deviceAuthSecret,
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
