import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import { previewDataKeysRefsImpact } from "@/app/actions/data-keys";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 200, });

        const body = await req.json();
        const res = await previewDataKeysRefsImpact(body);

        return NextResponse.json(res);
    } catch(e: any) {
        logger.log('/api/data-keys/refs-preview', e);
        return NextResponse.json({ success: false, errors: [e.message], });
    }
}
