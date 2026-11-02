import { NextRequest, NextResponse } from 'next/server';

import logger from '@/lib/logger';
import { _validateMobileAnalyticsKey, _getMobileAnalyticsConfig } from '@/databases/queries/mobile-analytics';
import { extractMobileAnalyticsKey, hashMobileAnalyticsKey, isMobileAnalyticsRateLimited } from '@/lib/mobile-analytics';

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0', 'Pragma': 'no-cache' };

function json(body: unknown, status = 200) {
    return NextResponse.json(body, { status, headers: NO_STORE });
}

/**
 * Shared gate for the mobile-analytics endpoints. Accepts ONLY the dedicated analytics key: general
 * API keys (nt_api_keys), auth tokens and user sessions are not consulted, and the dev "localhost"
 * key bypass does not apply. The key is read from x-api-key or Authorization: Bearer.
 */
export async function handleMobileAnalyticsRequest(
    req: NextRequest,
    label: string,
    respond: (config: NonNullable<Awaited<ReturnType<typeof _getMobileAnalyticsConfig>>>) => Record<string, unknown>,
) {
    try {
        const key = extractMobileAnalyticsKey(req.headers);
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const bucket = `${ip}:${key ? hashMobileAnalyticsKey(key).slice(0, 12) : 'none'}`;

        if (isMobileAnalyticsRateLimited(bucket)) {
            return NextResponse.json({ errors: ['Too many requests'] }, { status: 429, headers: { ...NO_STORE, 'Retry-After': '60' } });
        }

        if (!key || !(await _validateMobileAnalyticsKey(key))) return json({ errors: ['Unauthorised'] }, 401);

        const config = await _getMobileAnalyticsConfig();

        if (!config) return json({ errors: ['Mobile analytics is not configured'] }, 404);

        // Single read => version and settings can never disagree within a response.
        return json(respond(config));
    } catch(e: any) {
        logger.error(`[GET] ${label}`, e.message);
        return json({ errors: ['Internal Error'] }, 500);
    }
}

export function methodNotAllowed() {
    return NextResponse.json({ errors: ['Method not allowed'] }, { status: 405, headers: { ...NO_STORE, Allow: 'GET' } });
}
