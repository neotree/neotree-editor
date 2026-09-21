import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import {
    getCorsResponseHeaders,
    isApiPath,
    parseAllowedOrigins,
    resolveAllowedOrigin,
} from '@/lib/cors'

function applyCorsHeaders(headers: Headers, allowedOrigin: string) {
    const corsHeaders = getCorsResponseHeaders(allowedOrigin);
    Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
}

export async function middleware(request: NextRequest) {
    const requestHeaders = new Headers(request.headers);

    requestHeaders.set('x-url', request.url);
    requestHeaders.set('x-next-url-host', request.nextUrl.host);
    requestHeaders.set('x-next-url-href', request.nextUrl.href);
    requestHeaders.set('x-next-url-port', request.nextUrl.port);
    requestHeaders.set('x-next-url-hostname', request.nextUrl.hostname);
    requestHeaders.set('x-next-url-pathname', request.nextUrl.pathname);
    requestHeaders.set('x-next-url-search', request.nextUrl.search);
    requestHeaders.set('x-next-url-protocol', request.nextUrl.protocol);
    requestHeaders.set('x-next-url-username', request.nextUrl.username);
    requestHeaders.set('x-next-url-locale', request.nextUrl.locale);
    requestHeaders.set('x-next-url-origin', request.nextUrl.origin);
    requestHeaders.set('x-geo-city', request.geo?.city || '');
    requestHeaders.set('x-geo-country', request.geo?.country || '');
    requestHeaders.set('x-geo-region', request.geo?.region || '');
    requestHeaders.set('x-geo-latitude', request.geo?.latitude || '');
    requestHeaders.set('x-geo-longitude', request.geo?.longitude || '');

    const isApi = isApiPath(request.nextUrl.pathname);
    const allowedOrigin = !isApi ? null : resolveAllowedOrigin(
        request.headers.get('origin'),
        parseAllowedOrigins(process.env.CORS_ALLOWED_ORIGINS, process.env.NEXT_PUBLIC_APP_URL),
    );

    // Answer the preflight here so a disallowed origin never reaches a route handler.
    if (isApi && request.method === 'OPTIONS') {
        const preflight = new NextResponse(null, { status: 204 });
        if (allowedOrigin) applyCorsHeaders(preflight.headers, allowedOrigin);
        return preflight;
    }

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    if (allowedOrigin) applyCorsHeaders(response.headers, allowedOrigin);

    return response;
}
