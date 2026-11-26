import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getUserAccessHistory } from "@/databases/queries/users";

export async function GET(req: NextRequest) {
	try {
        const auth = await isAuthenticated();

        if (!auth.yes || auth.user?.role === 'user') return NextResponse.json({ errors: ['Unauthorised'], });

        const userId = req.nextUrl.searchParams.get('userId') || '';

        return NextResponse.json({ data: await _getUserAccessHistory(userId), });
	} catch(e: any) {
		logger.error('[GET] /api/users/access-history', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
