import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getDataKeysRefs, type GetDataKeysRefsParams, defaultRes } from "@/databases/queries/data-keys";

export async function GET(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();
        
        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as GetDataKeysRefsParams;

        const res = await _getDataKeysRefs(params);

        return NextResponse.json(res);
    } catch(e: any) {
        logger.error('[GET] /api/data-keys/refs', e.message);
        return NextResponse.json({ ...defaultRes, errors: [e.message] }); 
    }
}
