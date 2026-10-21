'use client';

import { useEffect, useMemo, useState } from "react";

import { getContentSyncEntityDiff, type ContentSyncEntityDiffResult } from "@/app/actions/content-sync";
import { useAppContext } from "@/contexts/app";

// One request per script for everything on the page (banner and the three tables), reused for a short while.
const TTL_MS = 30 * 1000;
const cache = new Map<string, { at: number; promise: Promise<ContentSyncEntityDiffResult> }>();

function load(scriptId: string) {
    const hit = cache.get(scriptId);
    if (hit && Date.now() - hit.at < TTL_MS) return hit.promise;
    const promise = getContentSyncEntityDiff({ scriptId }).catch(() => ({ enabled: false, status: null, diff: null } as ContentSyncEntityDiffResult));
    cache.set(scriptId, { at: Date.now(), promise });
    return promise;
}

/**
 * Content sync: which screens, diagnoses and problems of a script differ from its counterpart on the
 * linked editor, listed by name on the script page. Empty sets when content sync is off,
 * the script is in sync, or the other editor can't tell.
 */
export function useContentSyncEntityDiff(scriptId?: string | null) {
    const { contentSync } = useAppContext();
    const settings = contentSync?.settings;
    const active = !!scriptId && !!settings && settings.role !== "off" && !!settings.linkedSiteId;
    const [result, setResult] = useState<ContentSyncEntityDiffResult | null>(null);

    useEffect(() => {
        if (!active || !scriptId) { setResult(null); return; }
        let cancelled = false;
        load(scriptId).then(r => { if (!cancelled) setResult(r); });
        return () => { cancelled = true; };
    }, [active, scriptId]);

    return useMemo(() => {
        const diff = result?.diff || null;
        const ids = (d?: { changed: string[]; onlyHere: string[] }) => new Set([...(d?.changed || []), ...(d?.onlyHere || [])]);
        return {
            active,
            result,
            diff,
            screens: ids(diff?.screens),
            diagnoses: ids(diff?.diagnoses),
            problems: ids(diff?.problems),
        };
    }, [active, result]);
}
