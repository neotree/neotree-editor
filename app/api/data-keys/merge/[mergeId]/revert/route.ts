import { NextRequest, NextResponse } from "next/server";

import { _revertDataKeyMerge } from "@/databases/mutations/data-keys";
import logger from "@/lib/logger";
import { sweepAllScriptsConditionErrors } from "@/lib/server/condition-errors-sweep";
import { authoriseDataKeyMerge } from "../../_auth";

export async function POST(_req: NextRequest, props: { params: Promise<{ mergeId: string; }>; }) {
    try {
        const { error, userId } = await authoriseDataKeyMerge();
        if (error) return error;

        const { mergeId } = await props.params;
        const res = await _revertDataKeyMerge({ mergeId, userId, broadcastAction: true });
        if (res.success) void sweepAllScriptsConditionErrors(res.scriptIds);
        return NextResponse.json(res);
    } catch (e: any) {
        logger.error('[POST] /api/data-keys/merge/[mergeId]/revert', e.message);
        return NextResponse.json({ success: false, errors: ['Internal Error'] });
    }
}
