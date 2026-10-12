import { NextRequest, NextResponse } from "next/server";

import { _mergeDataKeysBatch, type MergeBatchItem } from "@/databases/mutations/data-keys";
import logger from "@/lib/logger";
import { authoriseDataKeyMerge } from "../_auth";

export async function POST(req: NextRequest) {
    try {
        const { error, userId } = await authoriseDataKeyMerge();
        if (error) return error;

        const params = await req.json() as { groups?: MergeBatchItem[]; dryRun?: boolean; };
        const res = await _mergeDataKeysBatch({
            groups: params.groups || [],
            dryRun: !!params.dryRun,
            broadcastAction: true,
            userId,
        });

        return NextResponse.json(res);
    } catch (e: any) {
        logger.error('[POST] /api/data-keys/merge/batch', e.message);
        return NextResponse.json({ success: false, results: [], errors: ['Internal Error'] });
    }
}
