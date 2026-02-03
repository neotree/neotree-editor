import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _saveDeviceUpdateEvents } from "@/databases/mutations/device-update-events";

export async function POST(req: NextRequest) {
    try {
        logger.log(`[POST] /api/mobile/update-events`);

        const isAuthorised = await isAuthenticated();
        if (!isAuthorised.yes) return NextResponse.json({ errors: ["Unauthorised"] });

        const body = await req.json();

        const deviceId = body?.deviceId || "";
        const eventType = body?.eventType || "";

        if (!deviceId) return NextResponse.json({ errors: ["Missing deviceId"] });
        if (!eventType) return NextResponse.json({ errors: ["Missing eventType"] });

        const res = await _saveDeviceUpdateEvents({
            returnSaved: true,
            data: [{
                deviceId,
                eventType,
                appVersion: body?.appVersion || null,
                runtimeVersion: body?.runtimeVersion || null,
                otaUpdateId: body?.otaUpdateId || null,
                otaChannel: body?.otaChannel || null,
                payload: body?.payload || {},
            }],
        });

        if (res?.errors?.length) return NextResponse.json({ errors: res.errors, data: null });

        return NextResponse.json({ data: res.inserted[0] || null, success: res.success });
    } catch (e: any) {
        logger.error("[POST_ERROR] /api/mobile/update-events", e.message);
        return NextResponse.json({ errors: ["Internal Error"], data: null });
    }
}
