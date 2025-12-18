import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getDrugsLibraryMetadata } from "@/app/actions/drugs-library";
import { GetDrugsLibraryMetadataParams } from "@/databases/queries/drugs-library/_get-drugs-library-metadata";

export async function GET(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'] });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as GetDrugsLibraryMetadataParams;
        const res = await getDrugsLibraryMetadata(params);

        return NextResponse.json(res);
    } catch (e: any) {
        logger.error('[GET] /api/drugs-library/metadata', e.message);
        return NextResponse.json({ errors: ['Internal Error'] });
    }
}
