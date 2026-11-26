import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { DEACTIVATED_ACCOUNT_MESSAGE, isUserDeactivated } from "@/lib/user-status";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getUser } from "@/databases/queries/users";

export async function POST(req: NextRequest) {
	try {
        logger.log(`[POST]: ${req.url}`);
        
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const body = await req.json();
        const { email, } = body;

        const user = await _getUser(email || '');

        if (!user) return NextResponse.json({ data: null, errors: ['Email address not registered, are you sure that address is typed correctly?'], });

        if (isUserDeactivated(user)) return NextResponse.json({ data: null, errors: [DEACTIVATED_ACCOUNT_MESSAGE], });

        return NextResponse.json({
            data: {
                userId: user?.userId || null,
                isActive: !!user?.password,
            },
        });
	} catch(e: any) {
		logger.error(`[POST_ERROR] /api/app/auth/verify-email: ${req.url}`, e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
