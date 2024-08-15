import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getHospitals } from "@/databases/queries/hospitals";

export async function GET(req: NextRequest) {
	try {
        logger.log(`[GET]: ${req.url}`);

        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const { data, errors } = await _getHospitals();

        if (errors) return NextResponse.json({ errors, });

        const hospitals = data.map(h => ({
            id: h.id,
            hospital_id: h.oldHospitalId || h.hospitalId,
            name: h.name,
            country: h.country,
            createdAt: h.createdAt,
            updatedAt: h.updatedAt,
            deletedAt: h.deletedAt,
        }));

		return NextResponse.json({ hospitals, });
	} catch(e: any) {
		logger.error('[GET] /api/get-hospitals', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
