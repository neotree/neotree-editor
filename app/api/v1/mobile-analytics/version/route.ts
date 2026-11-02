import { NextRequest } from 'next/server';

import { handleMobileAnalyticsRequest, methodNotAllowed } from '../_auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    return handleMobileAnalyticsRequest(req, '/api/v1/mobile-analytics/version', config => ({
        versionNumber: config.versionNumber,
    }));
}

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
