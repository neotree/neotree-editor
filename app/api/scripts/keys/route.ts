import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getScriptsDataKeys } from "@/app/actions/scripts";

export async function GET(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 200, });

        const scriptsIdsJSON = req.nextUrl.searchParams.get('scriptsIds');
        const scriptsIds = !scriptsIdsJSON ? undefined : JSON.parse(scriptsIdsJSON);

		const dataJSON = JSON.parse(req.nextUrl.searchParams.get('data') || '{}');

        const { errors, data } = await getScriptsDataKeys({ 
			...dataJSON, 
			scriptsIds: scriptsIds || dataJSON.scriptsIds, 
		});

        if (errors?.length) return NextResponse.json({ errors, }, { status: 200, });
		
		return NextResponse.json({ data, }, { status: 200, });
	} catch(e: any) {
		logger.error('[GET] /api/scripts/keys', e.message);
		return NextResponse.json({ errors: ['Internal Error'] }, { status: 200, });
	}
}
