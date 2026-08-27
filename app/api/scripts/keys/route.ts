import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getScriptsConditionKeys } from "@/app/actions/scripts";

export async function GET(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 200, });

		const dataJSON = JSON.parse(req.nextUrl.searchParams.get('data') || '{}');

		const { errors, data: scripts, } = await getScriptsConditionKeys(dataJSON?.scriptsIds || []);

        if (errors?.length) return NextResponse.json({ errors, data: [], }, { status: 200, });

		const data = scripts.map(s => ({
			scriptId: s.scriptId,
			dataKeys: s.dataKeys,
			conditionKeys: s.conditionKeys,
			conditionScreens: s.conditionScreens,
		}));

		return NextResponse.json({ data, }, { status: 200, });
	} catch(e: any) {
		logger.error('[GET] /api/scripts/keys', e.message);
		return NextResponse.json({ errors: ['Internal Error'] }, { status: 200, });
	}
}
