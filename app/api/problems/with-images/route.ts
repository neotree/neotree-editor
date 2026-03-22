import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getProblems } from "@/app/actions/scripts";

export async function GET(req: NextRequest) {
	try {
        // const isAuthorised = await isAuthenticated();

        // if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as Parameters<typeof getProblems>[0];

        const res = await getProblems({
            withImagesOnly: true,
            ...params,
        });

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/problems/with-images', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
