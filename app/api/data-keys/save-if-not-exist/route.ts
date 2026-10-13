import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import { saveDataKeysIfNotExist } from "@/app/actions/data-keys";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        let user: null | Awaited<ReturnType<typeof isAuthenticated>>['user'] = body.user || null;

        if (!body.user) {
            const isAuthorised = await isAuthenticated();
            user = isAuthorised.user;
            if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 200, });
        }
        
        const res = await saveDataKeysIfNotExist({
            ...body,
            user,
        });

        return NextResponse.json(res);
    } catch(e: any) {
        logger.log('/api/data-keys/save-if-not-exist', e);
        return NextResponse.json({ success: false, errors: [e.message], });
    }
}
