import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getScriptImportSource } from "@/databases/mutations/scripts/_script_import_sources";
import logger from "@/lib/logger";

/**
 * The published base of this editor's last import of `sourceScriptId` (a script on the asking editor)
 * into `targetScriptId` (a script here). The asking editor uses it, with ids turned around, as the common
 * ancestor when it imports this script back (a back-port).
 */
export async function GET(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();
        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const { targetScriptId, sourceScriptId } = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as {
            targetScriptId?: string;
            sourceScriptId?: string;
        };
        if (!targetScriptId || !sourceScriptId) return NextResponse.json({ data: null });

        const row = await _getScriptImportSource(targetScriptId);
        if (!row?.baseSnapshot || row.sourceScriptId !== sourceScriptId) return NextResponse.json({ data: null });

        return NextResponse.json({
            data: {
                baseSnapshot: row.baseSnapshot,
                syncedAt: row.syncedAt ? new Date(row.syncedAt).toISOString() : (row.baseSnapshot.importedAt || null),
            },
        });
    } catch (e: any) {
        logger.error('[GET] /api/content-sync/import-base', e.message);
        return NextResponse.json({ errors: [e.message], });
    }
}
