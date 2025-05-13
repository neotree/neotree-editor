import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _syncDataKeys, syncedEmptyResponseData } from "@/databases/mutations/data-keys";

export async function POST(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const res = await _syncDataKeys();

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/data-keys/sync', e.message);
		return NextResponse.json({ 
			data: syncedEmptyResponseData,
			errors: ['Internal Error'] 
		});
	}
}
