import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import { uploadFile } from "@/app/actions/files";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 200, });
            
        const formData = await req.formData();
        
        const data = await uploadFile(formData);

        // const data: Awaited<ReturnType<typeof uploadFile>> = { success: false, file: null!, errors: ['Testing'] };

        return NextResponse.json(data);
    } catch(e: any) {
        logger.log('/api/files/upload', e);
        return NextResponse.json({ errors: [e.message], });
    }
}
