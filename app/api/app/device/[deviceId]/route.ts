import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getDataDetails, getDevice } from "@/app/actions/app";

interface IParams {
    params: {
        deviceId: string;
    };
}

export async function GET(req: NextRequest, { params: { deviceId } }: IParams) {
	try {
        logger.log(`[GET]: ${req.url}`);
        
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const data = getDataDetails();
        const device = getDevice(deviceId);

        return NextResponse.json({
            device,
            data,
        });
	} catch(e: any) {
		logger.error(`[ERROR]: ${req.url}`, e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
