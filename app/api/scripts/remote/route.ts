import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { loadRemoteScriptsWithItems } from "@/app/actions/remote";

export async function GET(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 200, });

        const scriptsIdsJSON = req.nextUrl.searchParams.get('scriptsIds');
        const scriptsIds = !scriptsIdsJSON ? undefined : JSON.parse(scriptsIdsJSON);

		const dataJSON = JSON.parse(req.nextUrl.searchParams.get('data') || '{}');

        const res = await loadRemoteScriptsWithItems({ 
			...dataJSON, 
			scriptsIds: scriptsIds || dataJSON.scriptsIds, 
		});

		return NextResponse.json(res, { status: 200, });
	} catch(e: any) {
		logger.error('[GET] /api/scripts/remote', e.message);
		return NextResponse.json({ errors: ['Internal Error'], data: [], dataKeys: [], }, { status: 200, });
	}
}
