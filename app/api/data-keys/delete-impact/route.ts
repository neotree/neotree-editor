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
        const scopeParentUniqueKey = req.nextUrl.searchParams.get('scopeParentUniqueKey') || undefined;

        const res = await getDataKeysDeleteImpact({
            dataKeysIds,
            uniqueKeys,
            scopeParentUniqueKey,
        });
        return NextResponse.json(res);
    } catch (e: any) {
        logger.log('/api/data-keys/delete-impact', e);
        return NextResponse.json({ success: false, data: [], errors: [e.message] });
    }
}

/** Same as GET, with the ids in the body — usage for hundreds of keys does not fit in a URL. */
export async function POST(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();
        if (!isAuthorised.yes) return NextResponse.json({ success: false, data: [], errors: ['Unauthorised'] }, { status: 200 });

        const body = await req.json() as { dataKeysIds?: string[]; uniqueKeys?: string[]; scopeParentUniqueKey?: string; };
        const res = await getDataKeysDeleteImpact({
            dataKeysIds: body.dataKeysIds || [],
            uniqueKeys: body.uniqueKeys || [],
            scopeParentUniqueKey: body.scopeParentUniqueKey || undefined,
        });
        return NextResponse.json(res);
    } catch (e: any) {
        logger.log('[POST] /api/data-keys/delete-impact', e);
        return NextResponse.json({ success: false, data: [], errors: [e.message] });
    }
}
