import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { _saveDeviceAppStates } from "@/databases/mutations/device-app-states";
import { authenticateMobileDevice } from "@/lib/mobile-device-auth";

export async function POST(req: NextRequest) {
    try {
        logger.log(`[POST] /api/mobile/device/app-state`);

        const rawBody = await req.text();
        const body = rawBody ? JSON.parse(rawBody) : {};

        const deviceId = body?.deviceId || "";
        const appVersion = body?.appVersion || "";
        const runtimeVersion = body?.runtimeVersion || "";
        const deviceCapabilities = {
            ...(body?.deviceCapabilities || {}),
            deviceId,
            deviceHash: body?.deviceHash || body?.deviceCapabilities?.deviceHash || null,
            androidId: body?.androidId || body?.deviceCapabilities?.androidId || null,
            identifiers: {
                ...(body?.deviceCapabilities?.identifiers || {}),
                deviceId,
                deviceHash: body?.deviceHash || body?.deviceCapabilities?.identifiers?.deviceHash || body?.deviceCapabilities?.deviceHash || null,
                androidId: body?.androidId || body?.deviceCapabilities?.identifiers?.androidId || body?.deviceCapabilities?.androidId || null,
            },
        };

        if (!deviceId) return NextResponse.json({ errors: ["Missing deviceId"] }, { status: 400 });
        if (!appVersion) return NextResponse.json({ errors: ["Missing appVersion"] }, { status: 400 });
        if (!runtimeVersion) return NextResponse.json({ errors: ["Missing runtimeVersion"] }, { status: 400 });
        const auth = await authenticateMobileDevice(req, deviceId, { body: rawBody });
        if (!auth.ok) return NextResponse.json({ errors: auth.errors, data: null }, { status: auth.status });

        const res = await _saveDeviceAppStates({
            returnSaved: true,
            data: [{
                deviceId,
                appVersion,
                runtimeVersion,
                countryISO: body?.countryISO || body?.countryIso || null,
                androidVersion: body?.androidVersion || null,
                androidSdk: Number.isFinite(Number(body?.androidSdk)) ? Number(body.androidSdk) : null,
                manufacturer: body?.manufacturer || null,
                model: body?.model || null,
                deviceCapabilities,
                otaUpdateId: body?.otaUpdateId || null,
                otaChannel: body?.otaChannel || null,
                apkReleaseId: body?.apkReleaseId || null,
                lastPolicySeenVersion: Number.isFinite(Number(body?.lastPolicySeenVersion)) ? Number(body.lastPolicySeenVersion) : null,
                lastPolicySeenAt: body?.lastPolicySeenAt ? new Date(body.lastPolicySeenAt) : null,
                reportedAt: new Date(),
                lastSeenAt: new Date(),
            }],
        });

        if (res?.errors?.length) return NextResponse.json({ errors: res.errors, data: null }, { status: 500 });

        return NextResponse.json({ data: res.inserted[0] || null, success: res.success });
    } catch (e: any) {
        logger.error("[POST_ERROR] /api/mobile/device/app-state", e.message);
        return NextResponse.json({ errors: ["Internal Error"], data: null }, { status: 500 });
    }
}
