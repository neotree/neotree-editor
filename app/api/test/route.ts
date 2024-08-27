import { NextRequest, NextResponse } from "next/server";
import queryString from "query-string";

import logger from "@/lib/logger";
import { _getUser } from "@/databases/queries/users";

export async function GET(req: NextRequest) {
	try {
        const reqQuery = queryString.parse(req.nextUrl.searchParams.toString());

        let data: any = {
            NODE_ENV: process.env.NODE_ENV,
            NEOTREE_SERVER_TYPE: process.env.NEOTREE_SERVER_TYPE,
            NEOTREE_ENV: process.env.NEOTREE_ENV,
            HOSTNAME: process.env.HOSTNAME,
            PORT: process.env.PORT,
            DEBUG: process.env.DEBUG,
            POSTGRES_DB_URL: process.env.POSTGRES_DB_URL,
            SESSIONS_DB_URL: process.env.SESSIONS_DB_URL,
            MAIL_MAILER: process.env.MAIL_MAILER,
            MAIL_HOST: process.env.MAIL_HOST,
            MAIL_PORT: process.env.MAIL_PORT,
            MAIL_USERNAME: process.env.MAIL_USERNAME,
            MAIL_PASSWORD: process.env.MAIL_PASSWORD,
            MAIL_ENCRYPTION: process.env.MAIL_ENCRYPTION,
            MAIL_FROM_ADDRESS: process.env.MAIL_FROM_ADDRESS,
            MAIL_FROM_NAME: process.env.MAIL_FROM_NAME,
            NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
            NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
            NEXTAUTH_URL: process.env.NEXTAUTH_URL,
            NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        };

        if (reqQuery.email) {
            const user = await _getUser(reqQuery.email as string);
            data = { user  };
        }

		return NextResponse.json({ status: 'ok', data, });
	} catch(e: any) {
		logger.error('[GET] /api/test', e);
		return NextResponse.json({ errors: [e.message || 'Internal Error'], }, { status: 500, });
	}
}
