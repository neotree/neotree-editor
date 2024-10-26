import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { deleteHospitals, getHospitals } from "@/app/actions/hospitals";

export async function GET(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as Parameters<typeof getHospitals>[0];

        const res = await getHospitals(params);

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/hospitals', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}

export async function DELETE(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as Parameters<typeof deleteHospitals>[0];

        const res = await deleteHospitals(params);

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/hospitals', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
