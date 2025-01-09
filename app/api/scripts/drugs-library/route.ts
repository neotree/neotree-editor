import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getScriptsDrugsLibrary, deleteScriptsDrugs, saveScriptsDrugs, } from "@/app/actions/scripts";

export async function GET(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as Parameters<typeof getScriptsDrugsLibrary>[0];
        const res = await getScriptsDrugsLibrary(params);

		return NextResponse.json(res);
	} catch(e: any) {
        console.log(e);
		logger.error(`[GET] /api/scripts/drugs-library`, e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}

export async function POST(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const body = await req.json();

        const res = await saveScriptsDrugs(body);

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error(`[GET] /api/scripts/drugs-library`, e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}

export async function DELETE(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as Parameters<typeof deleteScriptsDrugs>[0];

        const res = await deleteScriptsDrugs(params);

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error(`[DELETE] /api/scripts/drugs-library`, e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
