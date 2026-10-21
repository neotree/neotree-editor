import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getLocalContentSyncState } from "@/lib/server/content-sync";
import logger from "@/lib/logger";

/**
 * This editor's content-sync state for the linked editor: fingerprints of published scripts, the imports
 * recorded here (sync points) and open hotfixes. See lib/content-sync.ts.
 */
export async function GET(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();
        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as { scriptIds?: string[]; sourceScriptIds?: string[] };
        const scriptIds = Array.isArray(params.scriptIds) ? params.scriptIds.filter(Boolean) : [];
        const sourceScriptIds = Array.isArray(params.sourceScriptIds) ? params.sourceScriptIds.filter(Boolean) : [];
        const data = await getLocalContentSyncState(scriptIds.length || sourceScriptIds.length ? { scriptIds, sourceScriptIds } : undefined);

        return NextResponse.json({ data });
    } catch (e: any) {
        logger.error('[GET] /api/content-sync/state', e.message);
        return NextResponse.json({ errors: [e.message], });
    }
}
