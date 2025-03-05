import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getScreensChangeHistory, type GetScreensChangeHistoryParams } from "@/databases/queries/scripts";

export async function GET(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as GetScreensChangeHistoryParams;

        const res = await _getScreensChangeHistory(params);

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/screens/history', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
