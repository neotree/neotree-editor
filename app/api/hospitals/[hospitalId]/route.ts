import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getHospital } from "@/app/actions/hospitals";
import logger from "@/lib/logger";

interface IParams {
    params: {
        hospitalId: string;
    };
}

export async function GET(req: NextRequest, { params: { hospitalId } }: IParams) {
    try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 200, });
        
        const data = await getHospital({ hospitalId });

        return NextResponse.json(data);
    } catch(e: any) {
        logger.log('/api/hospitals/'+hospitalId, e);
        return NextResponse.json({ errors: [e.message], });
    }
}
