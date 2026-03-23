import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getProblemsChangeHistory, type GetProblemsChangeHistoryParams } from "@/databases/queries/scripts";

export async function GET(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as GetProblemsChangeHistoryParams;

        const res = await _getProblemsChangeHistory(params);

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/problems/history', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
