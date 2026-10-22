import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getLocalScriptEntities } from "@/lib/server/content-sync";
import logger from "@/lib/logger";

/**
 * One script's published screens, diagnoses and problems on this editor, fingerprinted one by one, for
 * the linked editor to show which of them differ (GET ?data={"scriptId"}). See lib/content-sync.ts.
 */
export async function GET(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();
        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as { scriptId?: string };
        const data = await getLocalScriptEntities(`${params.scriptId || ''}`);
        return NextResponse.json({ data });
    } catch (e: any) {
        logger.error('[GET] /api/content-sync/entities', e.message);
        return NextResponse.json({ errors: [e.message], });
    }
}
