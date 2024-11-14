import { NextRequest, NextResponse } from "next/server";
import { isNotNull, or } from "drizzle-orm";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import { screens as screensTable } from "@/databases/pg/schema";
import { _saveFile } from "@/databases/mutations/files";

export async function GET(req: NextRequest) {
	try {
        // const isAuthorised = await isAuthenticated();

        // if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

		const screens = await db.query.screens.findMany({
            where: or(
                isNotNull(screensTable.image1),
                isNotNull(screensTable.image2),
                isNotNull(screensTable.image3)
            ),
        });

		return NextResponse.json({ data: screens, });
	} catch(e: any) {
		logger.error('[GET] /api/screens/with-images', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}

