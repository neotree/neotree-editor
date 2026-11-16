'use client';

import { useContentLock } from "@/hooks/use-content-lock";
import { useAppContext } from "@/contexts/app";
import type { ContentArea } from "@/lib/content-sync";

/** Explains why a library page is read-only on an editor that receives its content (content sync). */
export function ContentLockNotice({ area, className }: { area: ContentArea; className?: string }) {
    const { viewOnly } = useAppContext();
    const lock = useContentLock(area, null);
    if (!lock.locked || viewOnly) return null;
    return (
        <div className={`rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-3 text-sm text-blue-900 dark:text-blue-100 ${className || ''}`}>
            {lock.reason}
        </div>
    );
}
