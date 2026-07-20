import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getUnusedDataKeys, type GetUnusedDataKeys } from "@/databases/queries/data-keys";

export async function GET(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();
        
        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as GetUnusedDataKeys;

        const res = await _getUnusedDataKeys(params);

        return NextResponse.json(res);
    } catch(e: any) {
        logger.error('[GET] /api/data-keys/unused', e.message);
        return NextResponse.json({ data: [], errors: [e.message] }); 
    }
}
