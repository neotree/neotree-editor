'use client';

import { useMemo } from "react";
import { useParams } from "next/navigation";

import { useAppContext } from "@/contexts/app";
import { getContentLockReason, type ContentArea } from "@/lib/content-sync";

/**
 * Content sync lock for the current user (see lib/content-sync.ts). On an editor that receives its
 * content from a source editor, scripts / data keys / the drugs library are read-only unless a hotfix is
 * open. The script defaults to the one in the route (/script/[scriptId]/...).
 */
export function useContentLock(area: ContentArea, scriptId?: string | null) {
    const { contentSync, authenticatedUser } = useAppContext();
    const params = useParams();
    const routeScriptId = typeof params?.scriptId === "string" ? params.scriptId : undefined;
    const id = scriptId === undefined ? routeScriptId : (scriptId || undefined);

    return useMemo(() => {
        const settings = contentSync?.settings;
        const hotfixes = contentSync?.hotfixes || [];
        if (!settings) return { locked: false, reason: null as string | null, hotfix: null };
        const reason = getContentLockReason({
            settings,
            area,
            scriptIds: id ? [id] : [],
            hotfixes,
            userRole: authenticatedUser?.role,
        });
        return {
            locked: !!reason,
            reason,
            hotfix: id ? hotfixes.find(h => h.scriptId === id) || null : null,
        };
    }, [contentSync, area, id, authenticatedUser?.role]);
}

/** View-only mode, or locked by content sync. */
export function useContentViewOnly(area: ContentArea, scriptId?: string | null) {
    const { viewOnly } = useAppContext();
    const { locked } = useContentLock(area, scriptId);
    return viewOnly || locked;
}
