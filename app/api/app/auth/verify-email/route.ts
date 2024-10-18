import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getUser } from "@/databases/queries/users";

export async function GET(req: NextRequest) {
	try {
        logger.log(`[GET]: ${req.url}`);
        
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const email = req.nextUrl.searchParams.get('email');

        const user = await _getUser(email!);

        return NextResponse.json({
            userId: user?.userId,
            isActive: !!user?.password,
        });
	} catch(e: any) {
		logger.error(`[POST_ERROR] /api/app/auth/verify-email: ${req.url}`, e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
