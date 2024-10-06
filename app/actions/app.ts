'use server';

import { _getDevice } from "@/databases/queries/devices";
import { _getDatesWhenUpdatesWereMade } from "@/databases/queries/ops";
import { _getEditorInfo } from "@/databases/queries/editor-info";
import { _saveDevices } from "@/databases/mutations/devices";

export async function getDataDetails() {
    const editorInfo = await _getEditorInfo();
    if (editorInfo?.errors) throw new Error(editorInfo.errors.join(', '));

    const lastUpdates = await _getDatesWhenUpdatesWereMade();
        
    const dates = Object.values(lastUpdates.data).filter(d => d).map(d => new Date(d!).getTime());

    const data = {
        version: editorInfo.data?.dataVersion,
        lastPublishDate: editorInfo.data?.lastPublishDate,
        lastUpdatedDate: dates.length ? new Date(Math.max(...dates)) : editorInfo.data?.lastPublishDate,
    };

    return data;
}

export async function getDevice(deviceId: string) {
    if (!deviceId) throw new Error('Device ID not provided!');

    const editorInfo = await _getEditorInfo();
    if (editorInfo?.errors) throw new Error(editorInfo.errors.join(', '));

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

    return device;
}
