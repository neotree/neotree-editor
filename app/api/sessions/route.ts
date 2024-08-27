import { NextRequest, NextResponse } from "next/server";
import queryString from "query-string";

import { _getSessions } from "@/databases/queries/sessions";
import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { parseJSON } from "@/lib/parse-json";

export async function GET(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'] }, { status: 500, });

       const reqQuery = queryString.parse(req.nextUrl.searchParams.toString());
        
        const res = await _getSessions({
            ...reqQuery,
            sort: parseJSON(reqQuery.sort as string) || undefined,
        });

        if (res.errors) return NextResponse.json({ errors: res.errors }, { status: 500, });

        const data = {
            ...res,
            data: res.data.map(s => ({
                uid: s.uid,
                ingested_at: s.ingested_at,
                scriptid: s.scriptid,
            })),
        };

		return NextResponse.json(data);
	} catch(e) {
		logger.error('[GET] /api/sessions', e);
		return NextResponse.json({ errors: ['Internal Error'], }, { status: 500, });
	}
}
