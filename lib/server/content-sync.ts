import { and, eq, inArray, isNull, sql } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { contentSyncHotfixes, scriptImportSources, users } from "@/databases/pg/schema";
import * as queries from "@/databases/queries/scripts";
import { _getEditorInfo } from "@/databases/queries/editor-info";
import { _getScriptsWithDrafts } from "@/databases/mutations/scripts/_script_import_sources";
import { getSiteAxiosClient } from "@/lib/server/axios";
import logger from "@/lib/logger";
import {
    getContentLockReason,
    normalizeContentSyncSettings,
    type ContentArea,
    type ContentSyncSettings,
    type ContentSyncState,
    type OpenHotfix,
} from "@/lib/content-sync";
import { computeScriptFingerprint } from "@/lib/content-sync-fingerprint";
import type { ScriptImportSnapshot } from "@/databases/pg/schema";

/**
 * Server side of content sync (see lib/content-sync.ts): settings, hotfixes, fingerprints of published
 * content, this editor's sync state, the editing guard, and calls to the linked editor.
 */

export async function getContentSyncSettings(): Promise<ContentSyncSettings> {
    const res = await _getEditorInfo();
    return normalizeContentSyncSettings((res.data as any)?.contentSync);
}

export async function getOpenHotfixes(scriptIds?: string[]): Promise<OpenHotfix[]> {
    const rows = await db
        .select({
            scriptId: contentSyncHotfixes.scriptId,
            reason: contentSyncHotfixes.reason,
            openedAt: contentSyncHotfixes.openedAt,
            openedByUserId: contentSyncHotfixes.openedByUserId,
            openedByName: users.displayName,
        })
        .from(contentSyncHotfixes)
        .leftJoin(users, eq(users.userId, contentSyncHotfixes.openedByUserId))
        .where(and(
            isNull(contentSyncHotfixes.closedAt),
            scriptIds?.length ? inArray(contentSyncHotfixes.scriptId, scriptIds) : undefined,
        ));
    return rows.map(r => ({
        scriptId: r.scriptId,
        reason: r.reason,
        openedAt: r.openedAt ? new Date(r.openedAt).toISOString() : null,
        openedByUserId: r.openedByUserId,
        openedByName: r.openedByName,
    }));
}

/**
 * Refuse a content change that the content-sync lock does not allow on this editor. Imports, the sync
 * of data keys into scripts, and server-to-server calls from another editor (API key) are not editor
 * changes and are always allowed.
 */
export async function assertContentEditable({
    area,
    scriptIds = [],
    userRole,
    viaApiKey,
    draftOrigin,
}: {
    area: ContentArea;
    scriptIds?: (string | null | undefined)[];
    userRole?: string | null;
    viaApiKey?: boolean;
    draftOrigin?: string | null;
}) {
    if (viaApiKey) return;
    if (draftOrigin && draftOrigin !== "editor") return;
    const settings = await getContentSyncSettings();
    if (settings.role !== "target" || !settings.lock[area]) return;
    const ids = Array.from(new Set(scriptIds.filter((id): id is string => !!id)));
    const hotfixes = await getOpenHotfixes(area === "scripts" ? ids : undefined);
    const reason = getContentLockReason({ settings, area, scriptIds: ids, hotfixes, userRole });
    if (reason) throw new Error(reason);
}

/** Load the published content of scripts (all when no ids), grouped per script. */
async function loadPublishedScripts(scriptIds?: string[]) {
    const params = { returnDraftsIfExist: false, includePendingDeletion: true, ...(scriptIds?.length ? { scriptsIds: scriptIds } : {}) };
    const [scriptsRes, screensRes, diagnosesRes, problemsRes] = await Promise.all([
        queries._getScripts(params),
        queries._getScreens(params),
        queries._getDiagnoses(params),
        queries._getProblems(params),
    ]);
    const errors = [...(scriptsRes.errors || []), ...(screensRes.errors || []), ...(diagnosesRes.errors || []), ...(problemsRes.errors || [])];
    if (errors.length) throw new Error(errors.join(", "));
    const group = <T extends { scriptId?: string | null }>(rows: T[]) => {
        const map = new Map<string, T[]>();
        rows.forEach(r => { if (r.scriptId) map.set(r.scriptId, [...(map.get(r.scriptId) || []), r]); });
        return map;
    };
    const screens = group(screensRes.data as any[]);
    const diagnoses = group(diagnosesRes.data as any[]);
    const problems = group(problemsRes.data as any[]);
    return scriptsRes.data.map(script => ({
        script,
        screens: screens.get(script.scriptId) || [],
        diagnoses: diagnoses.get(script.scriptId) || [],
        problems: problems.get(script.scriptId) || [],
    }));
}

/** Fingerprints of the published content of scripts on this editor. */
export async function getPublishedScriptFingerprints(scriptIds?: string[]) {
    const loaded = await loadPublishedScripts(scriptIds);
    return new Map(loaded.map(l => [l.script.scriptId, {
        title: l.script.title || "",
        fingerprint: computeScriptFingerprint({ script: l.script as any, screens: l.screens, diagnoses: l.diagnoses, problems: l.problems }),
    }]));
}

/**
 * What this editor reports to the linked editor (GET /api/content-sync/state). Everything is per script:
 * the published content of each script and the imports recorded for it. Without filters it covers all
 * scripts; `scriptIds` limits it to those scripts, `sourceScriptIds` adds the scripts here that were
 * imported from those scripts on the other editor.
 */
export async function getLocalContentSyncState(filter?: string[] | { scriptIds?: string[]; sourceScriptIds?: string[] }): Promise<ContentSyncState> {
    const { scriptIds: filterIds, sourceScriptIds } = Array.isArray(filter) ? { scriptIds: filter, sourceScriptIds: undefined } : { ...filter };
    const settings = await getContentSyncSettings();
    const linkedBySource = sourceScriptIds?.length
        ? await db.select({ targetScriptId: scriptImportSources.targetScriptId })
            .from(scriptImportSources)
            .where(inArray(scriptImportSources.sourceScriptId, sourceScriptIds))
        : [];
    const filtered = !!(filterIds?.length || sourceScriptIds?.length);
    const scriptIds = filtered ? Array.from(new Set([...(filterIds || []), ...linkedBySource.map(r => r.targetScriptId)])) : undefined;
    // a filter that matches nothing loads nothing (an empty filter would otherwise mean "all scripts")
    const fingerprints = filtered && !scriptIds?.length
        ? new Map<string, { title: string; fingerprint: string }>()
        : await getPublishedScriptFingerprints(scriptIds);
    const ids = Array.from(fingerprints.keys());
    const recordIds = scriptIds;
    const withDrafts = await _getScriptsWithDrafts(Array.from(new Set([...ids, ...(recordIds || [])])));
    const records = recordIds && !recordIds.length ? [] : await db
        .select({
            targetScriptId: scriptImportSources.targetScriptId,
            sourceScriptId: scriptImportSources.sourceScriptId,
            sourceFingerprint: scriptImportSources.sourceFingerprint,
            targetFingerprint: scriptImportSources.targetFingerprint,
            syncedAt: scriptImportSources.syncedAt,
            // computed in SQL, so the large snapshots are never loaded here
            hasPending: sql<boolean>`${scriptImportSources.pendingSnapshot} is not null`,
        })
        .from(scriptImportSources)
        .where(recordIds ? inArray(scriptImportSources.targetScriptId, recordIds) : undefined);
    const hotfixes = settings.role === "target" ? await getOpenHotfixes(recordIds) : [];
    return {
        role: settings.role,
        scripts: ids.map(id => ({
            scriptId: id,
            title: fingerprints.get(id)!.title,
            fingerprint: fingerprints.get(id)!.fingerprint,
            hasDrafts: withDrafts.has(id),
        })),
        records: records.map(r => ({
            targetScriptId: r.targetScriptId,
            sourceScriptId: r.sourceScriptId,
            sourceFingerprint: r.sourceFingerprint,
            targetFingerprint: r.targetFingerprint,
            syncedAt: r.syncedAt ? new Date(r.syncedAt).toISOString() : null,
            pending: !!r.hasPending && withDrafts.has(r.targetScriptId),
        })),
        hotfixes,
    };
}

/**
 * Record this editor's published fingerprint for scripts whose import was just published (the sync
 * point's target side). Called after the publish transaction commits.
 */
export async function recordTargetFingerprints(targetScriptIds: string[]) {
    const ids = Array.from(new Set(targetScriptIds.filter(Boolean)));
    if (!ids.length) return;
    try {
        const fingerprints = await getPublishedScriptFingerprints(ids);
        for (const id of ids) {
            const fp = fingerprints.get(id)?.fingerprint;
            if (!fp) continue;
            await db.update(scriptImportSources)
                .set({ targetFingerprint: fp, syncedAt: new Date() })
                .where(eq(scriptImportSources.targetScriptId, id));
        }
    } catch (e: any) {
        logger.error("recordTargetFingerprints ERROR", e.message);
    }
}

/* ------------------------------------------------------------------------------------------------ */
/* The linked editor                                                                                */
/* ------------------------------------------------------------------------------------------------ */

export async function fetchRemoteContentSyncState(siteId: string, scriptIds?: string[], sourceScriptIds?: string[]): Promise<ContentSyncState> {
    const client = await getSiteAxiosClient(siteId);
    const res = await client.get('/api/content-sync/state?data=' + encodeURIComponent(JSON.stringify({ scriptIds: scriptIds || [], sourceScriptIds: sourceScriptIds || [] })), { timeout: 120000 });
    if (res.data?.errors?.length) throw new Error(res.data.errors.join(", "));
    return res.data.data as ContentSyncState;
}

/**
 * The other editor's fingerprints of some of its scripts. Empty when it cannot tell (an older editor);
 * imports still work, they just leave no sync point.
 */
export async function fetchRemoteScriptFingerprints(siteId: string, scriptIds: string[]): Promise<Map<string, string>> {
    try {
        const state = await fetchRemoteContentSyncState(siteId, scriptIds);
        return new Map(state.scripts.map(s => [s.scriptId, s.fingerprint]));
    } catch (e: any) {
        logger.error("fetchRemoteScriptFingerprints ERROR", e.message);
        return new Map();
    }
}

/**
 * The other editor's last import of `localScriptId` into `remoteScriptId` (published base and id map),
 * used as the common ancestor when importing in the opposite direction (a back-port).
 */
export async function fetchRemoteImportBase(siteId: string, remoteScriptId: string, localScriptId: string): Promise<{
    baseSnapshot: ScriptImportSnapshot;
    syncedAt: string | null;
} | null> {
    try {
        const client = await getSiteAxiosClient(siteId);
        const res = await client.get('/api/content-sync/import-base?data=' + encodeURIComponent(JSON.stringify({
            targetScriptId: remoteScriptId,
            sourceScriptId: localScriptId,
        })), { timeout: 120000 });
        if (!res.data?.data?.baseSnapshot) return null;
        return res.data.data;
    } catch (e: any) {
        logger.error("fetchRemoteImportBase ERROR", e.message);
        return null;
    }
}
