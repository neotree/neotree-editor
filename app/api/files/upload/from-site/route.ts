import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
// import { isAuthenticated } from "@/app/actions/is-authenticated";
import { uploadFileFromSite } from "@/app/actions/files";

export async function POST(req: NextRequest) {
	try {
        // const isAuthorised = await isAuthenticated();

        // if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params: Parameters<typeof uploadFileFromSite>[0] = await req.json();

        const res = await uploadFileFromSite(params);

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/files/upload/from-site', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
