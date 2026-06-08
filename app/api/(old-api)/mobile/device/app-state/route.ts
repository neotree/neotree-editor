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

        if (!deviceId) return NextResponse.json({ errors: ["Missing deviceId"] });
        if (!appVersion) return NextResponse.json({ errors: ["Missing appVersion"] });
        if (!runtimeVersion) return NextResponse.json({ errors: ["Missing runtimeVersion"] });
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
                deviceCapabilities: body?.deviceCapabilities || {},
                otaUpdateId: body?.otaUpdateId || null,
                otaChannel: body?.otaChannel || null,
                apkReleaseId: body?.apkReleaseId || null,
                lastPolicySeenVersion: Number.isFinite(Number(body?.lastPolicySeenVersion)) ? Number(body.lastPolicySeenVersion) : null,
                lastPolicySeenAt: body?.lastPolicySeenAt ? new Date(body.lastPolicySeenAt) : null,
                reportedAt: new Date(),
                lastSeenAt: new Date(),
            }],
        });

        if (res?.errors?.length) return NextResponse.json({ errors: res.errors, data: null });

        return NextResponse.json({ data: res.inserted[0] || null, success: res.success });
    } catch (e: any) {
        logger.error("[POST_ERROR] /api/mobile/device/app-state", e.message);
        return NextResponse.json({ errors: ["Internal Error"], data: null });
    }
}
