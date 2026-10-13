import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import { exportDataKeys } from "@/app/actions/data-keys";
import logger from "@/lib/logger";
import { startOrJoinImportJob, buildImportContentKey } from "@/lib/import-jobs";

export async function POST(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 200, });

        const body = await req.json();

        const user = isAuthorised.user;

        const requestKey: string = body.requestKey || '';
        if (!requestKey) return NextResponse.json({ errors: ['Missing requestKey'], });

        const job = startOrJoinImportJob({
            requestKey,
            contentKey: buildImportContentKey({
                requestKey,
                userId: user?.userId,
                fromRemoteSiteId: body.fromRemoteSiteId,
                scriptsIds: body.scriptsIds,
                overWriteScriptWithId: body.overWriteScriptWithId,
            }),
            run: () => exportDataKeys({ ...body, requestKey, }),
        });

        if (job.status === 'pending') {
            return NextResponse.json({ 
                success: true, 
                started: true, 
                requestKey,
            });
        }

        return NextResponse.json(job.result);
    } catch(e: any) {
        logger.log('/api/data-keys/export', e);
        return NextResponse.json({ success: false, errors: [e.message], });
    }
}
