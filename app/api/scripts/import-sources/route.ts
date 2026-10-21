import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getImportSources } from "@/app/actions/scripts";

/** The source scripts the import dialog offers (GET ?data={"siteId","targetScriptId"}). */
export async function GET(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();
        if (!isAuthorised.yes) return NextResponse.json({ scripts: [], lastImport: null, errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}');
        const res = await getImportSources({ siteId: params.siteId, targetScriptId: params.targetScriptId || null, });
        return NextResponse.json(res);
    } catch (e: any) {
        logger.error('[GET] /api/scripts/import-sources', e.message);
        return NextResponse.json({ scripts: [], lastImport: null, errors: ['Internal Error'], });
    }
}
