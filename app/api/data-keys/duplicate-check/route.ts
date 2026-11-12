import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import { checkDataKeyDuplicatesEverywhere } from "@/lib/server/data-key-duplicate-check";
import logger from "@/lib/logger";

/** Same key / same label as an existing data key, here and in the linked editor (see lib/data-key-duplicate-check). */
export async function POST(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();
        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'] });

        const body = await req.json() as { name?: string; label?: string; uuid?: string; };
        const report = await checkDataKeyDuplicatesEverywhere({ name: body.name, label: body.label, excludeUuid: body.uuid });
        return NextResponse.json({ data: report });
    } catch (e: any) {
        logger.error('[POST] /api/data-keys/duplicate-check', e.message);
        return NextResponse.json({ errors: [e.message] });
    }
}
