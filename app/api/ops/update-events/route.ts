import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getDeviceUpdateEvents } from "@/databases/queries/device-update-events";

export async function GET(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();
        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'] });

        const deviceId = req.nextUrl.searchParams.get('deviceId') || undefined;
        const eventType = req.nextUrl.searchParams.get('eventType') || undefined;
        const limit = Number(req.nextUrl.searchParams.get('limit') || 100);
        const offset = Number(req.nextUrl.searchParams.get('offset') || 0);

        const res = await _getDeviceUpdateEvents({ deviceId, eventType, limit, offset });
        if (res.errors?.length) return NextResponse.json({ errors: res.errors });

        return NextResponse.json({ data: res.data });
    } catch (e: any) {
        logger.error('[GET] /api/ops/update-events', e.message);
        return NextResponse.json({ errors: ['Internal Error'] });
    }
}
