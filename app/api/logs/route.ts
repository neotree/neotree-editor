import { NextRequest, NextResponse } from "next/server";
import queryString from "query-string";

import { _getSessions } from "@/databases/queries/sessions";
import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getLogs } from "@/app/actions/logs";

export async function GET(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'] }, { status: 500, });

       const reqQuery = queryString.parse(req.nextUrl.searchParams.toString());
        
        const res = await getLogs(reqQuery as any);

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/logs', e);
		return NextResponse.json({ errors: [e.message || 'Internal Error'], });
	}
}
