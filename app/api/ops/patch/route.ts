import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import { publishData } from "@/app/actions/ops";
import logger from "@/lib/logger";
import { getScreens, saveScreens } from "@/app/actions/scripts";

export async function GET(req: NextRequest) {
    try {        
        const screens = await getScreens({ returnDraftsIfExist: true, });
        await saveScreens(screens);
        const data = await publishData();

        return NextResponse.json(data);
    } catch(e: any) {
        logger.log('/api/ops/publish-data', e);
        return NextResponse.json({ errors: [e.message], });
    }
}
