import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _extractDataKeys } from "@/databases/mutations/data-keys";

export async function GET(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const res = await _extractDataKeys();

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/data-keys/extract', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
