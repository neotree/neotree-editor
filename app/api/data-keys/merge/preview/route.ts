import { NextRequest, NextResponse } from "next/server";

import { _mergeDataKeys, type MergeDataKeysParams } from "@/databases/mutations/data-keys";
import logger from "@/lib/logger";
import { authoriseDataKeyMerge } from "../_auth";

/** Runs the merge in a transaction that is rolled back, and returns what would change. */
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
            optionPlacements: params.optionPlacements,
            dryRun: true,
            userId,
            // A newer preview replaced this one: stop working on it.
            signal: req.signal,
        });

        return NextResponse.json(res);
    } catch (e: any) {
        logger.error('[POST] /api/data-keys/merge/preview', e.message);
        return NextResponse.json({ success: false, errors: ['Internal Error'] });
    }
}
