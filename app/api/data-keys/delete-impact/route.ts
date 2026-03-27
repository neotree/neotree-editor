import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getDataKeysDeleteImpact } from "@/app/actions/data-keys";
import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();
        if (!isAuthorised.yes) return NextResponse.json({ success: false, data: [], errors: ['Unauthorised'] }, { status: 200 });

        const dataKeysIds = JSON.parse(req.nextUrl.searchParams.get('dataKeysIds') || '[]') as string[];
        const uniqueKeys = JSON.parse(req.nextUrl.searchParams.get('uniqueKeys') || '[]') as string[];

        const res = await getDataKeysDeleteImpact({
            dataKeysIds,
            uniqueKeys,
        });
        return NextResponse.json(res);
    } catch (e: any) {
        logger.log('/api/data-keys/delete-impact', e);
        return NextResponse.json({ success: false, data: [], errors: [e.message] });
    }
}
