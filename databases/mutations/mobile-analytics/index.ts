import { eq } from 'drizzle-orm';

import db from '@/databases/pg/drizzle';
import { adminAuditLogs, mobileAnalyticsApiKey, mobileAnalyticsConfig } from '@/databases/pg/schema';
import {
    generateMobileAnalyticsKey,
    getMobileAnalyticsKeyHint,
    hashMobileAnalyticsKey,
} from '@/lib/mobile-analytics';

export const MOBILE_ANALYTICS_AUDIT_AREA = 'mobile_analytics';

/**
 * Creates or updates the single config row. The row is locked (SELECT ... FOR UPDATE) so concurrent
 * edits serialise, and versionNumber is only bumped when the URL or timeout really changes.
 */
export async function _saveMobileAnalyticsConfig(params: {
    supersetUrl: string;
    inactivityTimeoutMinutes: number;
    userId?: string | null;
}) {
    const { supersetUrl, inactivityTimeoutMinutes, userId } = params;

    return db.transaction(async tx => {
        const inserted = await tx.insert(mobileAnalyticsConfig)
            .values({ supersetUrl, inactivityTimeoutMinutes, versionNumber: 1, updatedByUserId: userId || null })
            .onConflictDoNothing({ target: mobileAnalyticsConfig.singleton })
            .returning({ id: mobileAnalyticsConfig.id });
        const justCreated = inserted.length > 0;

        const [current] = await tx.select().from(mobileAnalyticsConfig).for('update').limit(1);

        const changed = current.supersetUrl !== supersetUrl
            || current.inactivityTimeoutMinutes !== inactivityTimeoutMinutes;

        if (!changed) {
            if (justCreated) {
                await tx.insert(adminAuditLogs).values({
                    area: MOBILE_ANALYTICS_AUDIT_AREA,
                    action: 'config_created',
                    actorUserId: userId || null,
                    afterState: { supersetUrl, inactivityTimeoutMinutes, versionNumber: current.versionNumber },
                });
            }
            return { changed: justCreated, config: current };
        }

        const [updated] = await tx.update(mobileAnalyticsConfig)
            .set({
                supersetUrl,
                inactivityTimeoutMinutes,
                versionNumber: current.versionNumber + 1,
                updatedByUserId: userId || null,
                updatedAt: new Date(),
            })
            .where(eq(mobileAnalyticsConfig.id, current.id))
            .returning();

        await tx.insert(adminAuditLogs).values({
            area: MOBILE_ANALYTICS_AUDIT_AREA,
            action: 'config_updated',
            actorUserId: userId || null,
            beforeState: {
                supersetUrl: current.supersetUrl,
                inactivityTimeoutMinutes: current.inactivityTimeoutMinutes,
                versionNumber: current.versionNumber,
            },
            afterState: { supersetUrl, inactivityTimeoutMinutes, versionNumber: updated.versionNumber },
        });

        return { changed: true, config: updated };
    });
}

/**
 * Generates the analytics key, or replaces it. Replacing overwrites the stored hash in one atomic
 * upsert, so the previous key stops working the instant this commits. The plaintext is returned
 * once and never stored.
 */
export async function _regenerateMobileAnalyticsKey(params: { userId?: string | null; }) {
    const key = generateMobileAnalyticsKey();
    const keyHash = hashMobileAnalyticsKey(key);
    const keyHint = getMobileAnalyticsKeyHint(key);
    const generatedAt = new Date();

    return db.transaction(async tx => {
        const [existing] = await tx.select({ id: mobileAnalyticsApiKey.id }).from(mobileAnalyticsApiKey).limit(1);

        await tx.insert(mobileAnalyticsApiKey)
            .values({ keyHash, keyHint, generatedByUserId: params.userId || null, generatedAt })
            .onConflictDoUpdate({
                target: mobileAnalyticsApiKey.singleton,
                set: { keyHash, keyHint, generatedByUserId: params.userId || null, generatedAt, lastUsedAt: null },
            });

        await tx.insert(adminAuditLogs).values({
            area: MOBILE_ANALYTICS_AUDIT_AREA,
            action: existing ? 'api_key_regenerated' : 'api_key_generated',
            actorUserId: params.userId || null,
            afterState: { keyHint },
        });

        return { key, keyHint, generatedAt };
    });
}
