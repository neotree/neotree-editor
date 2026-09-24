import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import { copyScripts } from "@/app/actions/scripts";
import { startOrJoinImportJob, buildImportContentKey } from "@/lib/import-jobs";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const body = await req.json();

        const requestKey: string = body.requestKey || isAuthorised.user?.userId || '';
        if (!requestKey) return NextResponse.json({ errors: ['Missing requestKey'], });

        // Imports can take several minutes for large scripts (many DB writes +
        // remote file downloads). Rather than holding this request open the
        // whole time (which is what was hitting nginx's proxy_read_timeout),
        // kick the import off in the background and respond immediately; the
        // frontend gets the actual result over the socket channel already
        // used for progress (see lib/import-jobs.ts / lib/in-progress.ts).
        //
        // startOrJoinImportJob also makes retried/duplicated requests for the
        // same logical import (same user+site+scripts+overwrite target)
        // idempotent: a duplicate while one is already running joins the
        // in-flight job instead of starting a second import.
        const job = startOrJoinImportJob({
            requestKey,
            contentKey: buildImportContentKey({
                userId: isAuthorised.user?.userId,
                fromRemoteSiteId: body.fromRemoteSiteId,
                scriptsIds: body.scriptsIds,
                overWriteScriptWithId: body.overWriteScriptWithId,
            }),
            run: () => copyScripts({ ...body, requestKey, }),
        });

        if (job.status === 'pending') {
            return NextResponse.json({ success: true, started: true, requestKey, });
        }

        return NextResponse.json(job.result);
    } catch(e: any) {
        logger.log('/api/scripts/copy', e);
        return NextResponse.json({ errors: [e.message], });
    }
}
