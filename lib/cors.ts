export const CORS_ALLOWED_METHODS = 'GET, POST, PUT, DELETE, OPTIONS';
export const CORS_ALLOWED_HEADERS = 'Content-Type, Authorization';

function normalizeOrigin(origin: string) {
    return origin.trim().replace(/\/+$/, '').toLowerCase();
}

/**
 * Builds the set of origins allowed to call /api/* from a browser.
 *
 * `configured` is the comma-separated CORS_ALLOWED_ORIGINS value; `appUrl` is the
 * app's own origin, which is always allowed. An empty result is the safe outcome —
 * it means no cross-origin browser caller is permitted, which is what we want when
 * the deployment has not named any.
 */
export function parseAllowedOrigins(configured?: string | null, appUrl?: string | null) {
    const origins = (configured || '')
        .split(',')
        .map(normalizeOrigin)
        .filter(Boolean);

    const self = normalizeOrigin(appUrl || '');
    if (self) origins.push(self);

    return new Set(origins);
}

/**
 * Returns the value to echo in Access-Control-Allow-Origin, or null when the request
 * must not be granted cross-origin access.
 *
 * A missing Origin header is not a browser cross-origin request at all — native
 * clients and server-to-server callers land here, and CORS does not apply to them.
 * We return null so no CORS headers are added, which leaves those callers unaffected.
 */
export function resolveAllowedOrigin(requestOrigin: string | null | undefined, allowed: Set<string>) {
    if (!requestOrigin) return null;
    return allowed.has(normalizeOrigin(requestOrigin)) ? requestOrigin : null;
}

export function getCorsResponseHeaders(allowedOrigin: string) {
    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': CORS_ALLOWED_METHODS,
        'Access-Control-Allow-Headers': CORS_ALLOWED_HEADERS,
        // Without this a shared cache can hand one origin's allow header to another.
        'Vary': 'Origin',
    };
}

export function isApiPath(pathname: string) {
    return pathname === '/api' || pathname.startsWith('/api/');
}
