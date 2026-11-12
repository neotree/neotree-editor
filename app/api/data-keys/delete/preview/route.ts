import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _deleteDataKeys, type DeleteDataKeysParams } from "@/databases/mutations/data-keys";
import logger from "@/lib/logger";

/** Runs the delete/replace in a transaction that is rolled back, and returns what it would change. */
export async function POST(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();
        if (!isAuthorised.yes) return NextResponse.json({ success: false, errors: ['Unauthorised'], });
        if (!['admin', 'super_user'].includes(isAuthorised.user?.role || '')) {
            return NextResponse.json({ success: false, errors: ['Forbidden'] }, { status: 403 });
        }

        const params = await req.json() as DeleteDataKeysParams;
        const res = await _deleteDataKeys({
            ...params,
            broadcastAction: false,
            dryRun: true,
            userId: isAuthorised.user?.userId,
        });

        return NextResponse.json(res);
    } catch(e: any) {
        logger.error('[POST] /api/data-keys/delete/preview', e.message);
        return NextResponse.json({ success: false, errors: ['Internal Error'] });
    }
}
