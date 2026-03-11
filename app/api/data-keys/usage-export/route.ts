import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getDataKeysUsageExportRows } from "@/app/actions/data-keys";
import logger from "@/lib/logger";

export async function POST(_req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();
        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'] }, { status: 200 });

        const res = await getDataKeysUsageExportRows();
        return NextResponse.json(res);
    } catch (e: any) {
        logger.log('/api/data-keys/usage-export', e);
        return NextResponse.json({ success: false, data: [], errors: [e.message] });
    }
}

