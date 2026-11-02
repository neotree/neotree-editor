'use server';

import { and, eq, isNull } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { adminAuditLogs, contentSyncHotfixes, editorInfo, sites } from "@/databases/pg/schema";
import { _getEditorInfo } from "@/databases/queries/editor-info";
import logger from "@/lib/logger";
import socket from "@/lib/socket";
import {
    computeContentSyncPairs,
    diffScriptEntities,
    normalizeContentSyncSettings,
    type ScriptEntitiesDiff,
    type ContentSyncPair,
    type ContentSyncSettings,
    type ContentSyncState,
    type OpenHotfix,
} from "@/lib/content-sync";
import {
    fetchRemoteContentSyncState,
    getContentSyncSettings,
    getLocalContentSyncState,
    getOpenHotfixes,
    clearContentSyncStatusCache,
    fetchRemoteScriptEntities,
    getLocalScriptEntities,
} from "@/lib/server/content-sync";
import { isAllowed } from "./is-allowed";

const isAdminRole = (role?: string | null) => role === "admin" || role === "super_user";

async function auditLog(action: string, actorUserId: string | null | undefined, beforeState: any, afterState: any, metadata?: any) {
    await db.insert(adminAuditLogs).values({
        area: "content_sync",
        action,
        actorUserId: actorUserId || null,
        beforeState: beforeState || {},
        afterState: afterState || {},
        metadata: metadata || {},
    });
}

/** Settings, plus what the settings page needs. */
export async function getContentSyncSettingsForEditor(): Promise<{
    settings: ContentSyncSettings;
    sites: { siteId: string; name: string; link: string; env: string | null }[];
    canManage: boolean;
    errors?: string[];
}> {
    try {
        const session = await isAllowed();
        const settings = await getContentSyncSettings();
        const rows = await db.query.sites.findMany({
            where: and(eq(sites.type, "webeditor"), isNull(sites.deletedAt)),
            columns: { siteId: true, name: true, link: true, env: true },
        });
        return {
            settings,
            sites: rows.map(r => ({ siteId: r.siteId, name: r.name, link: r.link, env: (r.env as string) || null })),
            canManage: session.user?.role === "super_user",
        };
    } catch (e: any) {
        return { settings: normalizeContentSyncSettings(null), sites: [], canManage: false, errors: [e.message] };
    }
}

export async function saveContentSyncSettings(input: Partial<ContentSyncSettings>): Promise<{ success: boolean; settings?: ContentSyncSettings; errors?: string[] }> {
    try {
        const session = await isAllowed();
        if (session.user?.role !== "super_user") throw new Error("Only super users can change content sync settings");

        const before = await getContentSyncSettings();
        const next = normalizeContentSyncSettings({
            ...before,
            ...input,
            lock: { ...before.lock, ...(input.lock || {}) },
            hotfixes: { ...before.hotfixes, ...(input.hotfixes || {}) },
        });

        if (next.role !== "off") {
            if (!next.linkedSiteId) throw new Error("Choose the editor this one syncs with.");
            const site = await db.query.sites.findFirst({ where: and(eq(sites.siteId, next.linkedSiteId), isNull(sites.deletedAt)) });
            if (!site) throw new Error("The linked editor was not found in Sites.");
        }

        const info = await db.query.editorInfo.findFirst({ columns: { id: true } });
        if (!info) throw new Error("Editor info not found");

        await db.transaction(async (tx) => {
            await tx.update(editorInfo).set({ contentSync: next }).where(eq(editorInfo.id, info.id));
            await tx.insert(adminAuditLogs).values({
                area: "content_sync",
                action: "settings_updated",
                actorUserId: session.user?.userId || null,
                beforeState: before,
                afterState: next,
                metadata: {},
            });
        });

        clearStatusCache();
        socket.emit("data_changed", "content_sync_settings");
        return { success: true, settings: next };
    } catch (e: any) {
        logger.error("saveContentSyncSettings ERROR", e.message);
        return { success: false, errors: [e.message] };
    }
}

export async function getOpenContentSyncHotfixes(): Promise<{ data: OpenHotfix[]; errors?: string[] }> {
    try {
        await isAllowed();
        return { data: await getOpenHotfixes() };
    } catch (e: any) {
        return { data: [], errors: [e.message] };
    }
}

/** An admin opens a hotfix on one script of a target editor, so it can be edited here for now. */
export async function openContentSyncHotfix({ scriptId, reason }: { scriptId: string; reason: string }): Promise<{ success: boolean; errors?: string[] }> {
    try {
        const session = await isAllowed();
        if (!isAdminRole(session.user?.role)) throw new Error("Only admins can open a hotfix");
        const settings = await getContentSyncSettings();
        if (settings.role !== "target") throw new Error("Hotfixes are only needed on an editor that receives its content from a source editor.");
        if (!settings.hotfixes.enabled) throw new Error("Hotfixes are turned off in Settings > Content sync.");
        if (!scriptId) throw new Error("Missing script");
        const trimmed = `${reason || ""}`.trim();
        if (!trimmed) throw new Error("Say why the hotfix is needed.");

        const open = await getOpenHotfixes([scriptId]);
        if (open.length) return { success: true };

        await db.insert(contentSyncHotfixes).values({ scriptId, reason: trimmed, openedByUserId: session.user?.userId || null });
        await auditLog("hotfix_opened", session.user?.userId, {}, { scriptId, reason: trimmed });
        clearStatusCache();
        socket.emit("data_changed", "content_sync_hotfix");
        return { success: true };
    } catch (e: any) {
        logger.error("openContentSyncHotfix ERROR", e.message);
        return { success: false, errors: [e.message] };
    }
}

export async function closeContentSyncHotfix({ scriptId, note }: { scriptId: string; note?: string }): Promise<{ success: boolean; errors?: string[] }> {
    try {
        const session = await isAllowed();
        if (!isAdminRole(session.user?.role)) throw new Error("Only admins can close a hotfix");
        await db.update(contentSyncHotfixes)
            .set({ closedAt: new Date(), closedByUserId: session.user?.userId || null, closeNote: `${note || ""}`.trim() || null })
            .where(and(eq(contentSyncHotfixes.scriptId, scriptId), isNull(contentSyncHotfixes.closedAt)));
        await auditLog("hotfix_closed", session.user?.userId, { scriptId }, {}, { note: note || null });
        clearStatusCache();
        socket.emit("data_changed", "content_sync_hotfix");
        return { success: true };
    } catch (e: any) {
        logger.error("closeContentSyncHotfix ERROR", e.message);
        return { success: false, errors: [e.message] };
    }
}

/* ------------------------------------------------------------------------------------------------ */
/* Status                                                                                           */
/* ------------------------------------------------------------------------------------------------ */

export type ContentSyncStatusResult = {
    enabled: boolean;
    role: ContentSyncSettings["role"];
    showStatus: boolean;
    linkedSite: { siteId: string; name: string; link: string } | null;
    pairs: ContentSyncPair[];
    checkedAt: string | null;
    errors?: string[];
};

const STATUS_TTL_MS = 60 * 1000;

function clearStatusCache() {
    clearContentSyncStatusCache();
}

/**
 * How scripts stand between this editor and the linked one. Every script is compared on its own with its
 * counterpart: its published content here against the counterpart's published content there. Editor-wide
 * things (data versions, how often either editor publishes, other scripts) play no part.
 *
 * With `scriptId`, only that script and its counterpart are read (script pages). Without it every script
 * is compared; that result is cached for a minute and `refresh` recomputes it.
 */
export async function getContentSyncStatus(opts?: { refresh?: boolean; scriptId?: string }): Promise<ContentSyncStatusResult> {
    const empty = (settings: ContentSyncSettings, extra?: Partial<ContentSyncStatusResult>): ContentSyncStatusResult => ({
        enabled: settings.role !== "off",
        role: settings.role,
        showStatus: settings.showStatus,
        linkedSite: null,
        pairs: [],
        checkedAt: null,
        ...extra,
    });
    let settings = normalizeContentSyncSettings(null);
    try {
        await isAllowed();
        settings = await getContentSyncSettings();
        if (settings.role === "off" || !settings.linkedSiteId) return empty(settings);

        if (opts?.scriptId) {
            const single = await getScriptPairStatus(settings, opts.scriptId);
            if (single) return single;
            // the counterpart can only be found by title: compare the full lists (cached)
            const all = await getContentSyncStatus({ refresh: opts.refresh });
            return {
                ...all,
                pairs: all.pairs.filter(p => (settings.role === "target" ? p.targetScriptId : p.sourceScriptId) === opts.scriptId),
            };
        }

        const cached = globalThis.contentSyncStatusCache as { at: number; value: ContentSyncStatusResult } | undefined;
        if (!opts?.refresh && cached && Date.now() - cached.at < STATUS_TTL_MS && cached.value.role === settings.role) return cached.value;

        const site = await db.query.sites.findFirst({
            where: eq(sites.siteId, settings.linkedSiteId),
            columns: { siteId: true, name: true, link: true },
        });
        const local = await getLocalContentSyncState();
        let remote: ContentSyncState;
        try {
            remote = await fetchRemoteContentSyncState(settings.linkedSiteId);
        } catch (e: any) {
            return empty(settings, {
                linkedSite: site || null,
                errors: [`Could not reach ${site?.name || "the linked editor"}: ${e.message}`],
            });
        }
        const pairs = settings.role === "target"
            ? computeContentSyncPairs({ source: remote, target: local })
            : computeContentSyncPairs({ source: local, target: remote });
        const value: ContentSyncStatusResult = {
            enabled: true,
            role: settings.role,
            showStatus: settings.showStatus,
            linkedSite: site || null,
            pairs,
            checkedAt: new Date().toISOString(),
        };
        globalThis.contentSyncStatusCache = { at: Date.now(), value };
        return value;
    } catch (e: any) {
        logger.error("getContentSyncStatus ERROR", e.message);
        return empty(settings, { errors: [e.message] });
    }
}

/**
 * One script and its counterpart on the linked editor, found through the imports recorded on either
 * editor or an identical id. Null when neither applies (the full comparison can still pair by title).
 */
async function getScriptPairStatus(settings: ContentSyncSettings, scriptId: string): Promise<ContentSyncStatusResult | null> {
    const site = await db.query.sites.findFirst({
        where: eq(sites.siteId, settings.linkedSiteId!),
        columns: { siteId: true, name: true, link: true },
    });
    const local = await getLocalContentSyncState({ scriptIds: [scriptId], sourceScriptIds: [scriptId] });
    const counterpartIds = Array.from(new Set([
        scriptId,
        ...local.records.filter(r => r.targetScriptId === scriptId).map(r => r.sourceScriptId),
    ]));
    let remote: ContentSyncState;
    try {
        remote = await fetchRemoteContentSyncState(settings.linkedSiteId!, counterpartIds, [scriptId]);
    } catch (e: any) {
        return {
            enabled: true,
            role: settings.role,
            showStatus: settings.showStatus,
            linkedSite: site || null,
            pairs: [],
            checkedAt: null,
            errors: [`Could not reach ${site?.name || "the linked editor"}: ${e.message}`],
        };
    }
    const pairs = settings.role === "target"
        ? computeContentSyncPairs({ source: remote, target: local })
        : computeContentSyncPairs({ source: local, target: remote });
    const pair = pairs.find(p => (settings.role === "target" ? p.targetScriptId : p.sourceScriptId) === scriptId);
    if (!pair || pair.linkedBy === "none" || pair.linkedBy === "same_title") return null;
    return {
        enabled: true,
        role: settings.role,
        showStatus: settings.showStatus,
        linkedSite: site || null,
        pairs: [pair],
        checkedAt: new Date().toISOString(),
    };
}

export type ContentSyncEntityDiffResult = {
    /** Content sync is on and this script has a counterpart to compare with. */
    enabled: boolean;
    status: ContentSyncPair["status"] | null;
    /** Which screens, diagnoses and problems differ; null when the script is in sync or can't be compared. */
    diff: ScriptEntitiesDiff | null;
    errors?: string[];
};

/**
 * Which screens, diagnoses and problems of a script differ from its counterpart on the linked editor
 * (published content on both sides). The script page lists them by name.
 */
export async function getContentSyncEntityDiff({ scriptId }: { scriptId: string; }): Promise<ContentSyncEntityDiffResult> {
    const none = (extra?: Partial<ContentSyncEntityDiffResult>): ContentSyncEntityDiffResult => ({ enabled: false, status: null, diff: null, ...extra });
    try {
        const settings = await getContentSyncSettings();
        if (settings.role === "off" || !settings.linkedSiteId || !scriptId) return none();
        const status = await getContentSyncStatus({ scriptId });
        const pair = status.pairs[0];
        if (!pair) return none({ errors: status.errors });
        const counterpartId = settings.role === "target" ? pair.sourceScriptId : pair.targetScriptId;
        if (!counterpartId) return none({ enabled: true, status: pair.status });
        if (pair.status === "in_sync") return { enabled: true, status: pair.status, diff: null };

        const [local, remote] = await Promise.all([
            getLocalScriptEntities(scriptId),
            fetchRemoteScriptEntities(settings.linkedSiteId, counterpartId),
        ]);
        if (!local || !remote) return { enabled: true, status: pair.status, diff: null };
        return { enabled: true, status: pair.status, diff: diffScriptEntities({ local, remote }) };
    } catch (e: any) {
        logger.error("getContentSyncEntityDiff ERROR", e.message);
        return none({ errors: [e.message] });
    }
}
