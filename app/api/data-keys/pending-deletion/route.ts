import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getPendingDeletionDataKeys } from "@/app/actions/data-keys";
import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();
        if (!isAuthorised.yes) return NextResponse.json({ data: [], errors: ['Unauthorised'] }, { status: 200 });

        const res = await getPendingDeletionDataKeys();
        return NextResponse.json(res);
    } catch (e: any) {
        logger.log('/api/data-keys/pending-deletion', e);
        return NextResponse.json({ data: [], errors: [e.message] });
    }
}
