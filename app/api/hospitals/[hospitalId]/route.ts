import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getHospital } from "@/app/actions/hospitals";
import logger from "@/lib/logger";

interface IParams {
    params: Promise<{
        hospitalId: string;
    }>;
}

export async function GET(req: NextRequest, props: IParams) {
    const params = await props.params;

    const {
        hospitalId
    } = params;

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
