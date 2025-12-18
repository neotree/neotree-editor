import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _searchDrugsLibrary } from "@/databases/queries/drugs-library";

export async function GET(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();
        if (!isAuthorised.yes) {
            return NextResponse.json({ errors: ['Unauthorised'] });
        }

        const searchValue = req.nextUrl.searchParams.get('searchValue') || '';

        const res = await _searchDrugsLibrary({
            searchValue,
        });

        return NextResponse.json(res);
    } catch (error: any) {
        logger.error('[GET] /api/drugs-library/search', error.message);
        return NextResponse.json({ errors: ['Internal Error'] });
    }
}

