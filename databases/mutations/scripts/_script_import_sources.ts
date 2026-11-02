import { eq, inArray, isNotNull, or } from 'drizzle-orm';

import db from '@/databases/pg/drizzle';
import type { DbOrTransaction } from '@/databases/pg/db-client';
import {
    diagnosesDrafts,
    pendingDeletion,
    problemsDrafts,
    scriptImportSources,
    screensDrafts,
    scriptsDrafts,
    type ScriptImportSnapshot,
} from '@/databases/pg/schema';
import logger from '@/lib/logger';

export type ScriptImportSource = typeof scriptImportSources.$inferSelect;

export async function _getScriptImportSource(targetScriptId: string, client?: DbOrTransaction) {
    const executor = client || db;
    const row = await executor.query.scriptImportSources.findFirst({
        where: eq(scriptImportSources.targetScriptId, targetScriptId),
    });
    return row || null;
}

/**
 * The snapshot the next import into this script should merge against: the pending one while the last
 * import is still unpublished (the drafts were built from it), otherwise the published one.
 */
export function getImportBase(row: ScriptImportSource | null): ScriptImportSnapshot | null {
    if (!row) return null;
    return row.pendingSnapshot || row.baseSnapshot || null;
}

/**
 * Remember what an import brought in. When the import left drafts behind the snapshot stays pending
 * until they are published; when nothing needed saving the published state already matches it.
 */
export async function _recordScriptImport({
    targetScriptId,
    sourceSiteId,
    sourceSiteLink,
    snapshot,
    sourceFingerprint,
    userId,
    hasDrafts,
    client,
}: {
    targetScriptId: string;
    sourceSiteId?: string | null;
    sourceSiteLink?: string | null;
    snapshot: ScriptImportSnapshot;
    /** Fingerprint of the source's published script as the source editor computes it (content sync). */
    sourceFingerprint?: string | null;
    userId?: string | null;
    hasDrafts: boolean;
    client?: DbOrTransaction;
}) {
    const executor = client || db;
    const existing = await _getScriptImportSource(targetScriptId, executor);
    const values = {
        sourceSiteId: sourceSiteId || null,
        sourceSiteLink: sourceSiteLink || null,
        sourceScriptId: snapshot.sourceScriptId,
        ...(hasDrafts
            ? { pendingSnapshot: snapshot, pendingByUserId: userId || null, pendingSourceFingerprint: sourceFingerprint || null }
            : {
                baseSnapshot: snapshot,
                pendingSnapshot: null,
                pendingByUserId: null,
                pendingSourceFingerprint: null,
                // a new sync point; the target side is recorded once the caller's transaction commits
                sourceFingerprint: sourceFingerprint || null,
                targetFingerprint: null,
                syncedAt: null,
            }),
    };
    if (existing) {
        await executor.update(scriptImportSources).set(values).where(eq(scriptImportSources.targetScriptId, targetScriptId));
    } else {
        await executor.insert(scriptImportSources).values({ targetScriptId, ...values });
    }
}

/** Scripts (of the given ids) that still have drafts or queued deletions. */
export async function _getScriptsWithDrafts(scriptIds: string[], client?: DbOrTransaction) {
    const executor = client || db;
    if (!scriptIds.length) return new Set<string>();
    const rows = await Promise.all([
        executor.select({ a: scriptsDrafts.scriptId, b: scriptsDrafts.scriptDraftId }).from(scriptsDrafts)
            .where(or(inArray(scriptsDrafts.scriptId, scriptIds), inArray(scriptsDrafts.scriptDraftId, scriptIds))),
        executor.select({ a: screensDrafts.scriptId, b: screensDrafts.scriptDraftId }).from(screensDrafts)
            .where(or(inArray(screensDrafts.scriptId, scriptIds), inArray(screensDrafts.scriptDraftId, scriptIds))),
        executor.select({ a: diagnosesDrafts.scriptId, b: diagnosesDrafts.scriptDraftId }).from(diagnosesDrafts)
            .where(or(inArray(diagnosesDrafts.scriptId, scriptIds), inArray(diagnosesDrafts.scriptDraftId, scriptIds))),
        executor.select({ a: problemsDrafts.scriptId, b: problemsDrafts.scriptDraftId }).from(problemsDrafts)
            .where(or(inArray(problemsDrafts.scriptId, scriptIds), inArray(problemsDrafts.scriptDraftId, scriptIds))),
        executor.select({ a: pendingDeletion.screenScriptId, b: pendingDeletion.diagnosisScriptId, c: pendingDeletion.problemScriptId, d: pendingDeletion.scriptId })
            .from(pendingDeletion)
            .where(or(
                inArray(pendingDeletion.screenScriptId, scriptIds),
                inArray(pendingDeletion.diagnosisScriptId, scriptIds),
                inArray(pendingDeletion.problemScriptId, scriptIds),
                inArray(pendingDeletion.scriptId, scriptIds),
            )),
    ]);
    const out = new Set<string>();
    rows.flat().forEach((row: Record<string, string | null>) => Object.values(row).forEach((id) => { if (id) out.add(id); }));
    return out;
}

/**
 * After a publish: an import whose drafts are now all published becomes the base for the next import.
 * After a discard: an import whose drafts are all gone is forgotten (the previous base still applies).
 */
export async function _settlePendingScriptImports({
    outcome,
    client,
}: {
    outcome: 'published' | 'discarded';
    client?: DbOrTransaction;
}): Promise<{ success: boolean; errors?: string[]; promotedScriptIds?: string[] }> {
    const executor = client || db;
    try {
        const pending = await executor.query.scriptImportSources.findMany({
            where: isNotNull(scriptImportSources.pendingSnapshot),
        });
        if (!pending.length) return { success: true, promotedScriptIds: [] };
        const promotedScriptIds: string[] = [];

        const withDrafts = await _getScriptsWithDrafts(pending.map(p => p.targetScriptId), executor);

        for (const row of pending) {
            if (withDrafts.has(row.targetScriptId)) continue;
            await executor
                .update(scriptImportSources)
                .set(outcome === 'published'
                    ? {
                        baseSnapshot: row.pendingSnapshot,
                        pendingSnapshot: null,
                        pendingByUserId: null,
                        sourceFingerprint: row.pendingSourceFingerprint,
                        pendingSourceFingerprint: null,
                        targetFingerprint: null,
                        syncedAt: null,
                    }
                    : { pendingSnapshot: null, pendingByUserId: null, pendingSourceFingerprint: null })
                .where(eq(scriptImportSources.id, row.id));
            if (outcome === 'published') promotedScriptIds.push(row.targetScriptId);
        }
        return { success: true, promotedScriptIds };
    } catch (e: any) {
        logger.error('_settlePendingScriptImports ERROR', e.message);
        return { success: false, errors: [e.message] };
    }
}
