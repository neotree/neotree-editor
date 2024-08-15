import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getFullUser } from "@/databases/queries/users";

export async function GET(req: NextRequest) {
	try {
        logger.log(`[GET]: ${req.url}`);
        
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const email = req.nextUrl.searchParams.get('email');

        const res = !email ? null : await _getFullUser(email);

        if (!res) return NextResponse.json({ errors: ['Email address not registered.'], });

        const data = {
            userId: res.id,
            activated: !!res.password,
            email: res.email,
        };

		return NextResponse.json(data);
	} catch(e: any) {
		logger.error('[GET] /api/check-email-registration', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
