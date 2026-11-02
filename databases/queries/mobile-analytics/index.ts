import { eq } from 'drizzle-orm';

import db from '@/databases/pg/drizzle';
import { mobileAnalyticsApiKey, mobileAnalyticsConfig } from '@/databases/pg/schema';
import { hashMobileAnalyticsKey } from '@/lib/mobile-analytics';

export async function _getMobileAnalyticsConfig() {
    const [row] = await db.select().from(mobileAnalyticsConfig).limit(1);
    return row || null;
}

/** Key metadata for the admin UI. Never includes the hash or plaintext. */
export async function _getMobileAnalyticsKeyInfo() {
    const [row] = await db
        .select({
            keyHint: mobileAnalyticsApiKey.keyHint,
            generatedAt: mobileAnalyticsApiKey.generatedAt,
            lastUsedAt: mobileAnalyticsApiKey.lastUsedAt,
        })
        .from(mobileAnalyticsApiKey)
        .limit(1);
    return row || null;
}

/** Looks the presented key up by hash (the stored hash is unique, so only the current key matches). */
export async function _validateMobileAnalyticsKey(key: string) {
    if (!key) return false;

    const [row] = await db
        .select({ id: mobileAnalyticsApiKey.id, lastUsedAt: mobileAnalyticsApiKey.lastUsedAt })
        .from(mobileAnalyticsApiKey)
        .where(eq(mobileAnalyticsApiKey.keyHash, hashMobileAnalyticsKey(key)))
        .limit(1);

    if (!row) return false;

    // Throttle last-used writes to once a minute.
    if (!row.lastUsedAt || Date.now() - row.lastUsedAt.getTime() > 60_000) {
        await db.update(mobileAnalyticsApiKey)
            .set({ lastUsedAt: new Date() })
            .where(eq(mobileAnalyticsApiKey.id, row.id))
            .catch(() => {});
    }

    return true;
}
