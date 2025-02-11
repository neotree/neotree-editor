import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { deleteDiagnoses, getDiagnoses } from "@/app/actions/scripts";

export async function GET(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as Parameters<typeof getDiagnoses>[0];

        const res = await getDiagnoses(params);

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/diagnoses', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}

export async function DELETE(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}') as Parameters<typeof deleteDiagnoses>[0];

        const res = await deleteDiagnoses(params);

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/diagnoses', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
