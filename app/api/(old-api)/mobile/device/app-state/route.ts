import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _saveDeviceAppStates } from "@/databases/mutations/device-app-states";

export async function POST(req: NextRequest) {
    try {
        logger.log(`[POST] /api/mobile/device/app-state`);

        const isAuthorised = await isAuthenticated();
        if (!isAuthorised.yes) return NextResponse.json({ errors: ["Unauthorised"] });

        const body = await req.json();

        const deviceId = body?.deviceId || "";
        const appVersion = body?.appVersion || "";
        const runtimeVersion = body?.runtimeVersion || "";

        if (!deviceId) return NextResponse.json({ errors: ["Missing deviceId"] });
        if (!appVersion) return NextResponse.json({ errors: ["Missing appVersion"] });
        if (!runtimeVersion) return NextResponse.json({ errors: ["Missing runtimeVersion"] });

        const res = await _saveDeviceAppStates({
            returnSaved: true,
            data: [{
                deviceId,
                appVersion,
                runtimeVersion,
                otaUpdateId: body?.otaUpdateId || null,
                otaChannel: body?.otaChannel || null,
                apkReleaseId: body?.apkReleaseId || null,
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
