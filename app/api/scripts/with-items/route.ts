import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getScriptsWithItems, saveScriptsWithItems } from "@/app/actions/scripts";

export async function POST(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 200, });

        const body = await req.json();
        // Callers send { data: [...scripts] }; older code read body.data.data, which is undefined for
        // that shape ("a is not iterable"), so every export through this route failed.
        const scripts = (Array.isArray(body?.data) ? body.data : body?.data?.data) as Parameters<typeof saveScriptsWithItems>[0]['data'];
        if (!Array.isArray(scripts)) return NextResponse.json({ success: false, errors: ['Missing scripts'], }, { status: 200, });

        const res = await saveScriptsWithItems({ data: scripts, });

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
