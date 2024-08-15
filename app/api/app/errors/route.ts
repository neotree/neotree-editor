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

        logger.appError(body);

		return NextResponse.json({ success: true, });
	} catch(e: any) {
		logger.error('[POST] /app/errors', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
