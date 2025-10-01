import { NextRequest, NextResponse } from "next/server";
import queryString from "query-string";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { GetDataKeysParams, GetDataKeysResults, _getDataKeys } from "@/databases/queries/data-keys";
import { _deleteDataKeys } from "@/databases/mutations/data-keys";

export async function GET(req: NextRequest) {
	let res: GetDataKeysResults = { data: [], };
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = queryString.parse(req.nextUrl.searchParams.toString()) as GetDataKeysParams;

        res = await _getDataKeys(params);

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/data-keys', e.message);
		return NextResponse.json({ ...res, errors: ['Internal Error'] });
	}
}

export async function DELETE(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as Parameters<typeof _deleteDataKeys>[0];

        const res = await _deleteDataKeys({
            ...params,
            userId: isAuthorised.user?.userId,
        });

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[DELETE] /api/data-keys', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
