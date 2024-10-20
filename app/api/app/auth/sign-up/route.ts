import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getFullUser } from "@/databases/queries/users";
import { setPassword } from "@/app/actions/users";

export async function POST(req: NextRequest) {
	try {
        logger.log(`[POST]: ${req.url}`);
        
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const body = await req.json();
        const { email, password, passwordConfirm } = body;

        const { errors } = await setPassword({ email, password, passwordConfirm, });

        if (errors?.length) return NextResponse.json({ errors });

        let user = !email ? null : await _getFullUser(email);

        if (!user) return NextResponse.json({ errors: ['Something went wrong, try again!'], });

        const data = {
            id: user.id,
            displayName: user.displayName,
            userId: user.userId,
            email: user.email,
            role: user.role,
        };

        const bearerToken = await jwt.sign(data, process.env.JWT_SECRET);

		return NextResponse.json({ data: { bearerToken, user: data, }, });
	} catch(e: any) {
		logger.error('[POST] /api/sign-up', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
