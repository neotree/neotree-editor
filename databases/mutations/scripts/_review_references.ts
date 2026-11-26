import { eq } from 'drizzle-orm';

import db from '@/databases/pg/drizzle';
import type { DbOrTransaction } from '@/databases/pg/db-client';
import { scripts, scriptsDrafts } from '@/databases/pg/schema';
import { removeScreenReferences } from '@/lib/review-configurations';

/**
 * Removes deleted screens from every script's "Screen review" list, so the tablet's review page never
 * lists a screen that no longer exists.
 *
 * `removedIds` are every id the screens were known by (screenId, oldScreenId, a draft's id). Drafts are
 * always cleaned, so the editor shows the right list straight away. The published scripts are cleaned
 * only with `includePublished`, which is when the deletion itself is published: a published script
 * changes at publish, not before.
 *
 * Only rows whose list really changes are written. Run it inside the caller's transaction (`client`) so
 * the deletion and the cleanup succeed or fail together.
 */
export async function _removeScreenReferencesFromReviews(params: {
    removedIds: string[];
    includePublished?: boolean;
    client?: DbOrTransaction;
}): Promise<{ drafts: number; published: number; }> {
    const removedIds = [...new Set((params.removedIds || []).map(id => `${id || ''}`.trim()).filter(Boolean))];
    const result = { drafts: 0, published: 0 };
    if (!removedIds.length) return result;

    const executor = params.client || db;

    // Every script is looked at, with no SQL filter on the list: an older save wrote some lists as JSON text
    // inside a JSON string, which looks like a scalar to Postgres (so a "is it a non-empty array" test would
    // skip exactly those rows), while the database layer hands back the real list. There are only a few
    // dozen scripts, and rows whose list doesn't change are never written.
    const draftRows = await executor
        .select({ id: scriptsDrafts.scriptDraftId, data: scriptsDrafts.data })
        .from(scriptsDrafts);

    for (const row of draftRows) {
        const { entries, changed } = removeScreenReferences((row.data as any)?.reviewConfigurations, removedIds);
        if (!changed) continue;
        await executor.update(scriptsDrafts)
            .set({ data: { ...row.data, reviewConfigurations: entries } as typeof row.data })
            .where(eq(scriptsDrafts.scriptDraftId, row.id));
        result.drafts++;
    }

    if (params.includePublished) {
        const publishedRows = await executor
            .select({ scriptId: scripts.scriptId, reviewConfigurations: scripts.reviewConfigurations })
            .from(scripts);

        for (const row of publishedRows) {
            const { entries, changed } = removeScreenReferences(row.reviewConfigurations as any, removedIds);
            if (!changed) continue;
            await executor.update(scripts)
                .set({ reviewConfigurations: entries })
                .where(eq(scripts.scriptId, row.scriptId));
            result.published++;
        }
    }

    return result;
}
