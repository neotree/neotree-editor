import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
    // request.geo was removed in Next 15 (it was only ever populated on Vercel, so these were always empty here).
    // Keep overwriting them so client-supplied x-geo-* headers can't reach the app.
    requestHeaders.set('x-geo-city', '');
    requestHeaders.set('x-geo-country', '');
    requestHeaders.set('x-geo-region', '');
    requestHeaders.set('x-geo-latitude', '');
    requestHeaders.set('x-geo-longitude', '');

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}
