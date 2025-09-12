import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getScriptsWithItems, saveScriptsWithItems } from "@/app/actions/scripts";

export async function POST(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 200, });

        const body = await req.json();
        const { data: scripts, dataKeys, } = body.data as Parameters<typeof saveScriptsWithItems>[0];

        const res = await saveScriptsWithItems({ data: scripts, dataKeys, });

		return NextResponse.json(res, { status: 200, });
	} catch(e: any) {
		logger.error('[POST] /api/scripts/with-items', e.message);
		return NextResponse.json({ errors: ['Internal Error'] }, { status: 200, });
	}
}

export async function GET(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 200, });

        const scriptsIdsJSON = req.nextUrl.searchParams.get('scriptsIds');
        const scriptsIds = !scriptsIdsJSON ? undefined : JSON.parse(scriptsIdsJSON);

		const dataJSON = JSON.parse(req.nextUrl.searchParams.get('data') || '{}');

        const res = await getScriptsWithItems({ 
			...dataJSON, 
			scriptsIds: scriptsIds || dataJSON.scriptsIds, 
		});

		return NextResponse.json(res, { status: 200, });
	} catch(e: any) {
		logger.error('[GET] /api/scripts/with-items', e.message);
		return NextResponse.json({ errors: ['Internal Error'], data: [], dataKeys: [], }, { status: 200, });
	}
}
