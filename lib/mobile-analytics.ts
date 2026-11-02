import crypto from 'node:crypto';

import { MAX_INACTIVITY_TIMEOUT_MINUTES, MIN_INACTIVITY_TIMEOUT_MINUTES } from './mobile-analytics-constants';

export const MOBILE_ANALYTICS_KEY_PREFIX = 'nta_';

export function generateMobileAnalyticsKey() {
    return `${MOBILE_ANALYTICS_KEY_PREFIX}${crypto.randomBytes(32).toString('base64url')}`;
}

export function hashMobileAnalyticsKey(key: string) {
    return crypto.createHash('sha256').update(key).digest('hex');
}

export function getMobileAnalyticsKeyHint(key: string) {
    return `${MOBILE_ANALYTICS_KEY_PREFIX}…${key.slice(-4)}`;
}

/** Returns the normalised URL (no trailing slash) or an error message. */
export function validateSupersetUrl(value: unknown): { url?: string; error?: string; } {
    const raw = typeof value === 'string' ? value.trim() : '';

    if (!raw) return { error: 'Superset URL is required' };

    let parsed: URL;
    try {
        parsed = new URL(raw);
    } catch {
        return { error: 'Superset URL is not a valid URL' };
    }

    if (parsed.protocol !== 'https:') return { error: 'Superset URL must use HTTPS' };
    if (parsed.username || parsed.password) return { error: 'Superset URL must not contain credentials' };
    if (parsed.search || parsed.hash) return { error: 'Superset URL must not contain a query string or fragment' };

    return { url: `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, '') };
}

export function validateInactivityTimeout(value: unknown): { minutes?: number; error?: string; } {
    const minutes = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;

    if (typeof minutes !== 'number' || !Number.isInteger(minutes)) {
        return { error: 'Inactivity timeout must be a whole number of minutes' };
    }

    if (minutes < MIN_INACTIVITY_TIMEOUT_MINUTES || minutes > MAX_INACTIVITY_TIMEOUT_MINUTES) {
        return { error: `Inactivity timeout must be between ${MIN_INACTIVITY_TIMEOUT_MINUTES} and ${MAX_INACTIVITY_TIMEOUT_MINUTES} minutes` };
    }

    return { minutes };
}

/** Extracts the analytics key from `x-api-key` or `Authorization: Bearer`. */
export function extractMobileAnalyticsKey(headers: Headers) {
    const direct = headers.get('x-api-key')?.trim();
    if (direct) return direct;

    const auth = headers.get('authorization')?.trim();
    const match = auth?.match(/^Bearer\s+(.+)$/i);
    return match?.[1]?.trim() || null;
}

// Per-process fixed-window limiter. Good enough to blunt key guessing / hammering; a
// multi-instance deployment should additionally rate limit at the proxy.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 120;
const rateBuckets = new Map<string, { count: number; resetAt: number; }>();

export function isMobileAnalyticsRateLimited(bucketKey: string, now = Date.now()) {
    if (rateBuckets.size > 5000) {
        rateBuckets.forEach((bucket, k) => { if (bucket.resetAt <= now) rateBuckets.delete(k); });
    }

    const bucket = rateBuckets.get(bucketKey);

    if (!bucket || bucket.resetAt <= now) {
        rateBuckets.set(bucketKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return false;
    }

    bucket.count += 1;
    return bucket.count > RATE_LIMIT_MAX_REQUESTS;
}

export type ReachabilityResult = {
    reachable: boolean;
    status?: number;
    durationMs?: number;
    error?: string;
};

/**
 * Reachability only: any HTTP response (even 401/403/404/5xx) proves the host answered.
 * Does not log in, follow redirects, send credentials or return the response body.
 */
export async function checkSupersetReachability(url: string, timeoutMs = 8000): Promise<ReachabilityResult> {
    const startedAt = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(url, {
            method: 'GET',
            redirect: 'manual',
            cache: 'no-store',
            signal: controller.signal,
            headers: { 'user-agent': 'neotree-editor-reachability-check' },
        });

        res.body?.cancel().catch(() => {});

        return { reachable: true, status: res.status, durationMs: Date.now() - startedAt };
    } catch (e: any) {
        const timedOut = e?.name === 'AbortError';
        const code = e?.cause?.code as string | undefined;
        return {
            reachable: false,
            durationMs: Date.now() - startedAt,
            error: timedOut ? `No response within ${timeoutMs / 1000}s` : (code ? `Connection failed (${code})` : 'Connection failed'),
        };
    } finally {
        clearTimeout(timer);
    }
}
