import { NextRequest, NextResponse } from "next/server";

import { _mergeDataKeys, type MergeDataKeysParams } from "@/databases/mutations/data-keys";
import logger from "@/lib/logger";
import { authoriseDataKeyMerge } from "./_auth";

export async function POST(req: NextRequest) {
    try {
        const { error, userId } = await authoriseDataKeyMerge();
        if (error) return error;

        const params = await req.json() as MergeDataKeysParams;
        const res = await _mergeDataKeys({
            survivorId: params.survivorId,
            mergedIds: params.mergedIds || [],
            childActions: params.childActions,
            scriptIds: params.scriptIds,
            deleteUnusedChildren: params.deleteUnusedChildren,
            survivorOptionOrder: params.survivorOptionOrder,
            survivorLabel: params.survivorLabel,
            legacyLinks: params.legacyLinks,
            dryRun: false,
            broadcastAction: true,
            userId,
        });

        return NextResponse.json(res);
    } catch (e: any) {
        logger.error('[POST] /api/data-keys/merge', e.message);
        return NextResponse.json({ success: false, errors: ['Internal Error'] });
    }
}
