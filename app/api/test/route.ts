import { NextRequest, NextResponse } from "next/server";
import queryString from "query-string";

import logger from "@/lib/logger";
import { _getUser } from "@/databases/queries/users";

export async function GET(req: NextRequest) {
	try {
        const reqQuery = queryString.parse(req.nextUrl.searchParams.toString());

        let data: any = undefined;

        if (reqQuery.email) {
            const user = await _getUser(reqQuery.email as string);
            data = { user  };
        }

		return NextResponse.json({ status: 'ok', data, });
	} catch(e: any) {
		logger.error('[GET] /api/test', e);
		return NextResponse.json({ errors: [e.message || 'Internal Error'], }, { status: 500, });
	}
}
