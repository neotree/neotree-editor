import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { deactivateUsers } from "@/app/actions/users";

export async function POST(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

		const { usersIds } = await req.json();

        const res = await deactivateUsers(usersIds || []);

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[POST] /api/users/deactivate', e.message);
		return NextResponse.json({ errors: [e.message || 'Internal Error'] });
	}
}
