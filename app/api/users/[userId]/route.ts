import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getUser } from "@/app/actions/users";

interface IParams {
    params: Promise<{
        userId: string;
    }>;
}

export async function GET(_: NextRequest, props: IParams) {
    const params = await props.params;

    const {
        userId
    } = params;

    try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const res = await getUser(userId);

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/users', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
