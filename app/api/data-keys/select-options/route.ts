import { NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getDataKeysSelectOptions } from "@/databases/queries/data-keys";
import { _deleteDataKeys } from "@/databases/mutations/data-keys";

export async function GET() {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const res = await _getDataKeysSelectOptions();

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/data-keys', e.message);
		return NextResponse.json({ data: [], errors: ['Internal Error'] });
	}
}
