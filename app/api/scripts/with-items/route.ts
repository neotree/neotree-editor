import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getScripts, _getScreens, _getDiagnoses } from "@/databases/queries/scripts";
import { parseJSON } from "@/lib/parse-json";
import { getScriptsWithItems, saveScriptsWithItems } from "@/app/actions/scripts";

export async function POST(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 200, });

        const body = await req.json();
        const scripts = body.data as Awaited<ReturnType<typeof getScriptsWithItems>>['data'];

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
        const scriptsIds = !scriptsIdsJSON ? [] : (parseJSON<string[]>(scriptsIdsJSON) || []);

        const { errors, data } = await getScriptsWithItems({ scriptsIds, });

        if (errors?.length) return NextResponse.json({ errors, }, { status: 200, });

		return NextResponse.json({ data, }, { status: 200, });
	} catch(e: any) {
		logger.error('[GET] /api/scripts/with-items', e.message);
		return NextResponse.json({ errors: ['Internal Error'] }, { status: 200, });
	}
}
