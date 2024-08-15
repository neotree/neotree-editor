import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getDevice } from "@/databases/queries/devices";
import { _getEditorInfo } from "@/databases/queries/editor-info";
import { _saveDevices } from "@/databases/mutations/devices";
import { getDevice } from "./get-device";

export async function GET(req: NextRequest) {
	try {
        logger.log(`[GET]: ${req.url}`);
        
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const deviceId = req.nextUrl.searchParams.get('deviceId');

        const res = await getDevice(deviceId!);

        if (res.errors?.length) return NextResponse.json({ errors: res.errors, });

        return NextResponse.json({ ...res });
	} catch(e: any) {
		logger.error('[GET] /api/get-device-registration', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
