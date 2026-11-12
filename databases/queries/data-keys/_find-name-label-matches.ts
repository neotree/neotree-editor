import { sql } from 'drizzle-orm';

import db from '@/databases/pg/drizzle';
import logger from '@/lib/logger';
import { compactDataKeyName, meaningfulLabelWords, type ExistingDataKey } from '@/lib/data-key-duplicate-check';
import { escapeLikePattern } from '@/lib/sql-like';

/**
 * Keys in this library whose name or label could match (see
 * lib/data-key-duplicate-check, which decides): the same name in any casing or
 * apart from separators, or a label sharing any of the label's meaningful words. Unpublished drafts count —
 * they will be published — and a draft stands for its published row. Keys
 * whose deletion is already queued don't.
 */
export async function _findDataKeyNameLabelMatches({ name, label }: { name?: string | null; label?: string | null; }): Promise<{ data: ExistingDataKey[]; errors?: string[]; }> {
    const wantedName = `${name || ''}`.trim().toLowerCase();
    const wantedLabel = `${label || ''}`.trim().toLowerCase();
    if (!wantedName && !wantedLabel) return { data: [] };
    const wantedCompact = compactDataKeyName(name);
    // The longest words narrow it most; the rest is decided by the caller.
    const labelWords = meaningfulLabelWords(label).sort((a, b) => b.length - a.length).slice(0, 6);
    const labelWordMatch = !labelWords.length ? sql`false` : sql.join(
        labelWords.map((word) => sql`lower(coalesce(label, '')) like ${`%${escapeLikePattern(word)}%`}`),
        sql` or `,
    );

    try {
        // Older drafts hold the JSON as a string.
        const rows = await db.execute<{ uuid: string; unique_key: string; name: string; label: string | null; data_type: string | null; is_draft: boolean; }>(sql`
            with drafts as (
                select d.data_key_id, d.unique_key,
                       case jsonb_typeof(d.data) when 'string' then (d.data #>> '{}')::jsonb else d.data end as data
                from nt_data_keys_drafts d
            ),
            candidates as (
                select coalesce(data->>'uuid', '') as uuid, unique_key::text as unique_key, coalesce(data->>'name', '') as name,
                       data->>'label' as label, data->>'dataType' as data_type, true as is_draft
                from drafts
                union all
                select k.uuid::text, k.unique_key, k.name, k.label, k.data_type, false
                from nt_data_keys k
                where k.deleted_at is null
                  and not exists (select 1 from nt_pending_deletion p where p.data_key_id = k.uuid)
                  and not exists (select 1 from drafts d where d.data_key_id = k.uuid)
            )
            select * from candidates
            where (${wantedName} <> '' and lower(trim(name)) = ${wantedName})
               or (${wantedCompact} <> '' and regexp_replace(lower(name), '[[:space:]_.-]+', '', 'g') = ${wantedCompact})
               or (${wantedLabel} <> '' and lower(trim(coalesce(label, ''))) = ${wantedLabel})
               or (${labelWordMatch})
            -- strongest matches first, so a common label word can't crowd out the same name
            order by (lower(trim(name)) = ${wantedName}) desc,
                     (regexp_replace(lower(name), '[[:space:]_.-]+', '', 'g') = ${wantedCompact}) desc,
                     (lower(trim(coalesce(label, ''))) = ${wantedLabel}) desc
            limit 500
        `);
        const data = (rows as unknown as any[]).map((row) => ({
            uuid: row.uuid,
            uniqueKey: row.unique_key,
            name: row.name,
            label: row.label,
            dataType: row.data_type,
            isDraft: !!row.is_draft,
        }));
        return { data };
    } catch (e: any) {
        logger.error('_findDataKeyNameLabelMatches ERROR', e.message);
        return { data: [], errors: [e.message] };
    }
}
