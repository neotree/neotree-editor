import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getSites, GetSitesParams } from "@/databases/queries/sites";

export async function GET(req: NextRequest) {
	try {
        logger.log(`[GET] /api/app/sites`);
        
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const env = req.nextUrl.searchParams.get('env');
        const type = req.nextUrl.searchParams.get('type');

        const sites = await _getSites({ 
            types: type ? [type] as GetSitesParams['types'] : undefined, 
            envs: env ? [env] as GetSitesParams['envs'] : undefined, 
        });

        return NextResponse.json({
            ...sites
        });
	} catch(e: any) {
		logger.error(`[GET_ERROR] /api/app/sites`, e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
