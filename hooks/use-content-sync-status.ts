'use client';

import { useCallback, useEffect, useMemo, useState } from "react";

import { getContentSyncStatus, type ContentSyncStatusResult } from "@/app/actions/content-sync";
import { useAppContext } from "@/contexts/app";
import type { ContentSyncPair } from "@/lib/content-sync";

/**
 * Content sync status of scripts between this editor and the linked one. With `scriptId` only that
 * script is compared (script pages); otherwise all scripts (cached on the server for a minute).
 * `pairsByLocalScriptId` finds the pair of a script on THIS editor.
 */
export function useContentSyncStatus(opts?: { enabled?: boolean; scriptId?: string | null }) {
    const { contentSync, sites } = useAppContext();
    const settings = contentSync?.settings;
    const active = (opts?.enabled ?? true) && !!settings && settings.role !== "off" && !!settings.linkedSiteId;
    // A status belongs to the settings it was computed with: turning sync off, or changing the role or the
    // linked editor, must not keep showing the old one (it used to stay until the page was re-rendered).
    const settingsKey = active ? `${settings?.role}|${settings?.linkedSiteId}|${settings?.showStatus}` : "";
    const [status, setStatus] = useState<ContentSyncStatusResult | null>(null);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async (refresh?: boolean) => {
        if (!settingsKey) return;
        setLoading(true);
        try {
            const next = await getContentSyncStatus({ refresh, scriptId: opts?.scriptId || undefined });
            setStatus(next.enabled ? next : null);
        } finally {
            setLoading(false);
        }
    }, [settingsKey, opts?.scriptId]);

    // (saving the settings clears the server's cached status, so a normal load is fresh after a change)
    useEffect(() => {
        setStatus(null);
        load();
    }, [load]);

    const pairsByLocalScriptId = useMemo(() => {
        const map = new Map<string, ContentSyncPair>();
        (active ? (status?.pairs || []) : []).forEach(p => {
            const localId = settings?.role === "target" ? p.targetScriptId : p.sourceScriptId;
            if (localId) map.set(localId, p);
        });
        return map;
    }, [active, status, settings?.role]);

    const linkedSite = sites.find(s => s.siteId === settings?.linkedSiteId) || null;
    // Name the editors as people know them: the linked site's name, and "this editor".
    const sourceName = settings?.role === "target" ? (linkedSite?.name || "Source") : "This editor";
    const targetName = settings?.role === "source" ? (linkedSite?.name || "Target") : "This editor";

    return { active, status: active ? status : null, loading, refresh: () => load(true), pairsByLocalScriptId, settings, linkedSite, sourceName, targetName };
}
