import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import { saveDataKeys } from "@/app/actions/data-keys";
import logger from "@/lib/logger";

/** Runs the save in a transaction that is rolled back, and returns what it would change in the scripts. */
export async function POST(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();
        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 200, });

        const body = await req.json();
        const res = await saveDataKeys({
            ...body,
            broadcastAction: false,
            dryRun: true,
        });

        return NextResponse.json(res);
    } catch(e: any) {
        logger.log('/api/data-keys/save/preview', e);
        return NextResponse.json({ success: false, errors: [e.message], });
    }
}
