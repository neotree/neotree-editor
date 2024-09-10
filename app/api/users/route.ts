import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { deleteUsers, getUsers } from "@/app/actions/users";

export async function GET(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as Parameters<typeof getUsers>[0];

        const res = await getUsers(params);

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/users', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}

export async function DELETE(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as Parameters<typeof deleteUsers>[0];

        const res = await deleteUsers(params);

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/users', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
