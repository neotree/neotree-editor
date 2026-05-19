import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getReferencedFiles } from "@/databases/queries/files";

export async function GET(_: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const res = await _getReferencedFiles();

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/files/references', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
