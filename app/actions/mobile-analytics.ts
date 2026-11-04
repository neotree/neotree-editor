'use server';

import { revalidatePath } from 'next/cache';

import logger from '@/lib/logger';
import { _saveMobileAnalyticsConfig, _regenerateMobileAnalyticsKey } from '@/databases/mutations/mobile-analytics';
import { _getMobileAnalyticsConfig, _getMobileAnalyticsKeyInfo } from '@/databases/queries/mobile-analytics';
import {
    checkSupersetReachability,
    validateInactivityTimeout,
    validateSupersetUrl,
    type ReachabilityResult,
} from '@/lib/mobile-analytics';
import { isAllowed } from './is-allowed';

// Only administrators may view or change reporting configuration. Deliberately session-based:
// an x-api-key (of any kind) must not be able to manage this.
async function requireAdmin() {
    const { user } = await isAllowed();

    if (!user || (user.role !== 'admin' && user.role !== 'super_user')) {
        throw new Error('Forbidden: only administrators can manage reporting configurations');
    }

    return user;
}

export async function getMobileAnalyticsSettings() {
    try {
        await requireAdmin();

        const [config, key] = await Promise.all([_getMobileAnalyticsConfig(), _getMobileAnalyticsKeyInfo()]);

        return {
            success: true as const,
            config: config ? {
                supersetUrl: config.supersetUrl,
                inactivityTimeoutMinutes: config.inactivityTimeoutMinutes,
                versionNumber: config.versionNumber,
                updatedAt: config.updatedAt.toISOString(),
            } : null,
            key: key ? {
                keyHint: key.keyHint,
                generatedAt: key.generatedAt.toISOString(),
                lastUsedAt: key.lastUsedAt?.toISOString() || null,
            } : null,
        };
    } catch(e: any) {
        logger.error('getMobileAnalyticsSettings ERROR', e.message);
        return { success: false as const, errors: [e.message] };
    }
}

export async function saveMobileAnalyticsConfig(input: { supersetUrl: string; inactivityTimeoutMinutes: number | string; }) {
    try {
        const user = await requireAdmin();

        const url = validateSupersetUrl(input?.supersetUrl);
        const timeout = validateInactivityTimeout(input?.inactivityTimeoutMinutes);
        const errors = [url.error, timeout.error].filter(Boolean) as string[];

        if (errors.length) return { success: false as const, errors };

        const res = await _saveMobileAnalyticsConfig({
            supersetUrl: url.url!,
            inactivityTimeoutMinutes: timeout.minutes!,
            userId: user.userId,
        });

        revalidatePath('/reporting-configurations');

        return {
            success: true as const,
            changed: res.changed,
            config: {
                supersetUrl: res.config.supersetUrl,
                inactivityTimeoutMinutes: res.config.inactivityTimeoutMinutes,
                versionNumber: res.config.versionNumber,
                updatedAt: res.config.updatedAt.toISOString(),
            },
        };
    } catch(e: any) {
        logger.error('saveMobileAnalyticsConfig ERROR', e.message);
        return { success: false as const, errors: [e.message] };
    }
}

/** Returns the plaintext key exactly once; the previous key stops working immediately. */
export async function regenerateMobileAnalyticsKey() {
    try {
        const user = await requireAdmin();

        const res = await _regenerateMobileAnalyticsKey({ userId: user.userId });

        revalidatePath('/reporting-configurations');

        return { success: true as const, key: res.key, keyHint: res.keyHint, generatedAt: res.generatedAt.toISOString() };
    } catch(e: any) {
        logger.error('regenerateMobileAnalyticsKey ERROR', e.message);
        return { success: false as const, errors: [e.message] };
    }
}

/** Reachability only (no login). Tests the URL as typed, so it works before saving. */
export async function testSupersetReachability(supersetUrl: string): Promise<{ success: boolean; errors?: string[]; result?: ReachabilityResult; }> {
    try {
        await requireAdmin();

        const url = validateSupersetUrl(supersetUrl);
        if (url.error) return { success: false, errors: [url.error] };

        return { success: true, result: await checkSupersetReachability(url.url!) };
    } catch(e: any) {
        logger.error('testSupersetReachability ERROR', e.message);
        return { success: false, errors: [e.message] };
    }
}
