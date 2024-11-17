import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getDiagnoses } from "@/app/actions/scripts";

export async function GET(req: NextRequest) {
	try {
        // const isAuthorised = await isAuthenticated();

        // if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as Parameters<typeof getDiagnoses>[0];

        const res = await getDiagnoses({
            withImagesOnly: true,
            ...params,
        });

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/diagnoses/with-images', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
