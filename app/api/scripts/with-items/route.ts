import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getScriptsWithItems } from "@/databases/queries/scripts";
import { parseJSON } from "@/lib/parse-json";

export async function GET(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return new NextResponse('Unauthorised', { status: 500, });

        const scriptsIdsJSON = req.nextUrl.searchParams.get('scriptsIds');
        const scriptsIds = !scriptsIdsJSON ? [] : (parseJSON<string[]>(scriptsIdsJSON) || []);

        const data = await _getScriptsWithItems({
            scriptsIds,
        });

		return NextResponse.json(data);
	} catch(e) {
		logger.error('[GET] /api/scripts/with-items', e);
		return new NextResponse('Internal Error', { status: 500, });
	}
}
