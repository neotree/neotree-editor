import { NextRequest, NextResponse } from "next/server";
import { isNotNull, or } from "drizzle-orm";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import { diagnoses as diagnosesTable } from "@/databases/pg/schema";
import { _saveFile } from "@/databases/mutations/files";

export async function GET(req: NextRequest) {
	try {
        // const isAuthorised = await isAuthenticated();

        // if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

		const diagnoses = await db.query.diagnoses.findMany({
            where: or(
                isNotNull(diagnosesTable.image1),
                isNotNull(diagnosesTable.image2),
                isNotNull(diagnosesTable.image3)
            ),
        });

		return NextResponse.json({ data: diagnoses, });
	} catch(e: any) {
		logger.error('[GET] /api/diagnoses/with-images', e.message);
		return NextResponse.json({ errors: ['Internal Error'], info: e.message, });
	}
}

