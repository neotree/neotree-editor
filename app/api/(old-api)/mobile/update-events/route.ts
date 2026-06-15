import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { _saveDeviceUpdateEvents, _upsertDeviceRolloutStateFromEvent } from "@/databases/mutations/device-update-events";
import { authenticateMobileDevice } from "@/lib/mobile-device-auth";

export async function POST(req: NextRequest) {
    try {
        logger.log(`[POST] /api/mobile/update-events`);

        const rawBody = await req.text();
        const body = rawBody ? JSON.parse(rawBody) : {};

        const deviceId = body?.deviceId || "";
        const eventType = body?.eventType || "";

        if (!deviceId) return NextResponse.json({ errors: ["Missing deviceId"] }, { status: 400 });
        if (!eventType) return NextResponse.json({ errors: ["Missing eventType"] }, { status: 400 });
        const auth = await authenticateMobileDevice(req, deviceId, { body: rawBody });
        if (!auth.ok) return NextResponse.json({ errors: auth.errors, data: null }, { status: auth.status });

        const event = {
            eventId: body?.eventId || undefined,
            deviceId,
            eventType,
            status: body?.status || null,
            countryISO: body?.countryISO || body?.countryIso || null,
            appVersion: body?.appVersion || null,
            runtimeVersion: body?.runtimeVersion || null,
            apkReleaseId: body?.apkReleaseId || null,
            otaUpdateId: body?.otaUpdateId || null,
            otaChannel: body?.otaChannel || null,
            errorCode: body?.errorCode || null,
            errorMessage: body?.errorMessage || null,
            payload: body?.payload || {},
        };

        const res = await _saveDeviceUpdateEvents({
            returnSaved: true,
            data: [event],
        });

        if (res?.errors?.length) return NextResponse.json({ errors: res.errors, data: null }, { status: 500 });
        await _upsertDeviceRolloutStateFromEvent(event);

        return NextResponse.json({ data: res.inserted[0] || null, success: res.success });
    } catch (e: any) {
        logger.error("[POST_ERROR] /api/mobile/update-events", e.message);
        return NextResponse.json({ errors: ["Internal Error"], data: null }, { status: 500 });
    }
}
