import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getDiagnosesChangeHistory, type GetDiagnosesChangeHistoryParams } from "@/databases/queries/scripts";

export async function GET(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as GetDiagnosesChangeHistoryParams;

        const res = await _getDiagnosesChangeHistory(params);

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/diagnoses/history', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
