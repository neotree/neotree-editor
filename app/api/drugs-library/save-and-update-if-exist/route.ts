import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import { saveDrugsLibraryItemsUpdateIfExists } from "@/app/actions/drugs-library";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 200, });
            
        const body = await req.json();
        
        const res = await saveDrugsLibraryItemsUpdateIfExists({
            ...body,
        });

        return NextResponse.json(res);
    } catch(e: any) {
        logger.log('/api/data-keys/save-and-update-if-exist', e);
        return NextResponse.json({ success: false, errors: [e.message], });
    }
}
