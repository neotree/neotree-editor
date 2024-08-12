import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getFullUser } from "@/databases/queries/users";
import { _saveDevices } from "@/databases/mutations/devices";

export async function POST(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const body = await req.json();

        const res = await _saveDevices({
            data: [body],
            returnSaved: true,
        });

        if (res.errors?.length) return NextResponse.json({ errors: res.errors });

		return NextResponse.json({ device: res.inserted[0], });
	} catch(e: any) {
		logger.error('[POST] /api/update-device-registration', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
