import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { deleteDrugsLibraryItems, getDrugsLibraryItems } from "@/app/actions/drugs-library";

export async function GET(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as Parameters<typeof getDrugsLibraryItems>[0];

        const res = await getDrugsLibraryItems(params);

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/drugs-library', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}

export async function DELETE(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as Parameters<typeof deleteDrugsLibraryItems>[0];

        const res = await deleteDrugsLibraryItems(params);

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/drugs-library', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
