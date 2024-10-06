import { NextRequest, NextResponse } from "next/server";

import db from "@/databases/pg/drizzle";
import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { diagnoses, diagnosesDrafts, screens, screensDrafts } from "@/databases/pg/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'] }, { status: 500, });

        const data = await Promise.all([
             db.query.screens.findMany(),
             db.query.screensDrafts.findMany(),
             db.query.diagnoses.findMany(),
             db.query.diagnosesDrafts.findMany(),
        ]);

        const matched = data.map(items => {
            return items
                .filter(item => {
                    return JSON.stringify(item).match(new RegExp('zim-dev-webeditor.neotree.org:10243', 'gi'));
                })
                .map(item => {
                    return JSON.parse(
                        JSON.stringify(item).replaceAll('zim-dev-webeditor.neotree.org:10243', 'zim-dev-webeditor.neotree.org'),
                    ) as any;
                })
                .map(({
                    publishDate,
                    createdAt,
                    updatedAt,
                    deletedAt,
                    ...item
                }) => {
                    return item;
                });
        });

        const [
            screensArr,
            screensDraftsArr,
            diagnosesArr,
            diagnosesDraftsArr,
        ] = matched;

        await Promise.all([
            ...screensArr.map((s: any) => db.update(screens).set(s).where(eq(screens.id, s.id))),
            ...screensDraftsArr.map((s: any) => db.update(screensDrafts).set(s).where(eq(screensDrafts.id, s.id))),
            ...diagnosesArr.map((s: any) => db.update(diagnoses).set(s).where(eq(diagnoses.id, s.id))),
            ...diagnosesDraftsArr.map((s: any) => db.update(diagnosesDrafts).set(s).where(eq(diagnosesDrafts.id, s.id))),
        ]);

		return NextResponse.json({ 
            updated: {
                screens: screensArr.length,
                screensDrafts: screensDraftsArr.length,
                diagnoses: diagnosesArr.length,
                diagnosesDrafts: diagnosesDraftsArr.length,
            },
            success: true, 
            z: matched[0],
        });
	} catch(e: any) {
		logger.error('[GET] /api/sandbox', e);
		return NextResponse.json({ errors: [e.message || 'Internal Error'], });
	}
}
