import { NextRequest, NextResponse } from "next/server";

import { getSiteAxiosClient } from '@/lib/axios';
import { isAuthenticated } from "@/app/actions/is-authenticated";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
    let linkIsValid = true;

    try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 200, });
            
        const { link, apiKey, } = await req.json();

        const axiosClient = await getSiteAxiosClient({
            baseURL: link,
            apiKey,
        });

        try {
            const ping = await axiosClient.get('/api/ping');
            linkIsValid = ping.data?.data === 'pong';
        } catch(e: any) {
            logger.log(`[AXIOS] ${link}/api/ping`, e);
            linkIsValid = false;
        }

        return NextResponse.json({ linkIsValid });
    } catch(e: any) {
        logger.log('[POST] /api/sites/validate-link', e);
        return NextResponse.json({ errors: [e.message], });
    }
}
