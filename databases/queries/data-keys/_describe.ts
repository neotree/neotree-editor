import { and, inArray, isNotNull, or, sql } from 'drizzle-orm';

import db from '@/databases/pg/drizzle';
import { dataKeys, dataKeysDrafts } from '@/databases/pg/schema';
import logger from '@/lib/logger';

// Publishing a deletion appends "_<uuid>" to the unique key so it can be reused.
const DELETED_SUFFIX_LENGTH = 37;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const describe = (row: { name?: string | null; label?: string | null; }, uniqueKey: string) => {
    const name = `${row.name || ''}`.trim();
    const label = `${row.label || ''}`.trim();
    const title = name && label && label !== name ? `${name} — ${label}` : (name || label);
    return `${title || 'Data key'} [${uniqueKey.slice(0, 8)}]`;
};

/**
 * Readable names for data key uniqueKeys, for changelog diffs: drafts first
 * (pending changes), then published keys, including ones deleted since.
 */
export async function _describeDataKeys(uniqueKeys: string[]): Promise<Map<string, string>> {
    const names = new Map<string, string>();
    const keys = Array.from(new Set(uniqueKeys.map((key) => `${key || ''}`.trim()).filter(Boolean)));
    if (!keys.length) return names;

    try {
        const published = await db
            .select({ uniqueKey: dataKeys.uniqueKey, name: dataKeys.name, label: dataKeys.label })
            .from(dataKeys)
            .where(or(
                inArray(dataKeys.uniqueKey, keys),
                and(
                    isNotNull(dataKeys.deletedAt),
                    inArray(sql`left(${dataKeys.uniqueKey}, greatest(length(${dataKeys.uniqueKey}) - ${DELETED_SUFFIX_LENGTH}, 0))`, keys),
                ),
            ));
        for (const row of published) {
            const uniqueKey = keys.includes(row.uniqueKey) ? row.uniqueKey : row.uniqueKey.slice(0, -DELETED_SUFFIX_LENGTH);
            names.set(uniqueKey, describe(row, uniqueKey));
        }

        // The drafts column is a uuid: a legacy non-uuid key would fail the whole query.
        const uuidKeys = keys.filter((key) => UUID.test(key));
        const drafts = !uuidKeys.length ? [] : await db
            .select({ uniqueKey: dataKeysDrafts.uniqueKey, data: dataKeysDrafts.data })
            .from(dataKeysDrafts)
            .where(inArray(dataKeysDrafts.uniqueKey, uuidKeys));
        for (const row of drafts) {
            const data = (typeof row.data === 'string' ? JSON.parse(row.data) : row.data) as { name?: string; label?: string; } | null;
            names.set(`${row.uniqueKey}`, describe(data || {}, `${row.uniqueKey}`));
        }
    } catch (e: any) {
        logger.error('_describeDataKeys ERROR', e.message);
    }

    return names;
}
