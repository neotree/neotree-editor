import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { deleteConfigKeys, getConfigKeys } from "@/app/actions/config-keys";

export async function GET(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as Parameters<typeof getConfigKeys>[0];

        const res = await getConfigKeys(params);

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/config-keys', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}

export async function DELETE(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as Parameters<typeof deleteConfigKeys>[0];

        const res = await deleteConfigKeys(params);

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/config-keys', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
