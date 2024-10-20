import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getFullUser } from "@/databases/queries/users";

export async function POST(req: NextRequest) {
	try {
        logger.log(`[POST]: /api/app/auth/sign-in`);
        
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const body = await req.json();
        const { email, password, } = body;

        let user = !email ? null : await _getFullUser(email);

        if (!user) return NextResponse.json({ errors: ['Invalid credentials'], });

        const isCorrectPassword = await bcrypt.compare(password, `${user.password}`);

        if (!isCorrectPassword) return NextResponse.json({ errors: ['Invalid credentials'], });

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
		logger.error('[POST] /api/app/auth/sign-in', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
