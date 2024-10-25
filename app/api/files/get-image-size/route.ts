import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import logger from "@/lib/logger";
import { getRemoteImageSize } from "@/lib/image-size";

export async function POST(req: NextRequest) {
    try {
        // const isAuthorised = await isAuthenticated();

        // if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 200, });
            
        const { imageURL } = await req.json();
        
        const data = await getRemoteImageSize(imageURL);

        return NextResponse.json({ data });
    } catch(e: any) {
        logger.log('/api/files/get-image-size', e);
        return NextResponse.json({ errors: [e.message], });
    }
}
