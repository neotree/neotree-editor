import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getLockStatus,createLock,dropStaleLocks } from "@/app/actions/locks";

export async function GET(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });
        
        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}');
    
        const res = await getLockStatus(params);
      
        return NextResponse.json(res);
    } catch(e: any) {
        logger.error('[GET] /api/locks', e.message);
        return NextResponse.json({ errors: ['Internal Error'] });
    }
}

export async function POST(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });
        
        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}');
        const res = await createLock(params);
      
        return NextResponse.json(res);
    } catch(e: any) {
        logger.error('[POSTINGI] /api/locks', e.message);
        return NextResponse.json({ errors: ['Internal Error'] });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });
        
        const params = JSON.parse(req.nextUrl.searchParams.get('data') || '{}');
    
        await dropStaleLocks(params);
      
        return NextResponse.json({dropped: true});
    } catch(e: any) {
        logger.error('[DELETE] /api/locks', e.message);
        return NextResponse.json({ errors: ['Internal Error'] });
    }
}



