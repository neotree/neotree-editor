import { NextRequest, NextResponse } from "next/server";

import { _dismissDuplicateGroup, _restoreDuplicateGroup } from "@/databases/mutations/data-keys";
import logger from "@/lib/logger";
import { authoriseDataKeyMerge } from "../../merge/_auth";

export async function POST(req: NextRequest) {
    try {
        const { error, userId } = await authoriseDataKeyMerge();
        if (error) return error;

        const params = await req.json() as { uniqueKeys?: string[]; reason?: string; };
        return NextResponse.json(await _dismissDuplicateGroup({
            uniqueKeys: params.uniqueKeys || [],
            reason: params.reason,
            userId,
        }));
    } catch (e: any) {
        logger.error('[POST] /api/data-keys/duplicates/dismissals', e.message);
        return NextResponse.json({ success: false, errors: ['Internal Error'] });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { error } = await authoriseDataKeyMerge();
        if (error) return error;

        const groupKey = req.nextUrl.searchParams.get('groupKey') || '';
        return NextResponse.json(await _restoreDuplicateGroup({ groupKey }));
    } catch (e: any) {
        logger.error('[DELETE] /api/data-keys/duplicates/dismissals', e.message);
        return NextResponse.json({ success: false, errors: ['Internal Error'] });
    }
}
