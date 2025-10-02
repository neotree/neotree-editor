import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _searchScripts } from "@/databases/queries/scripts";

export async function GET(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const searchValue = req.nextUrl.searchParams.get('searchValue') || '';

        const res = await _searchScripts({
			searchValue,
		});

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/scripts/search', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
