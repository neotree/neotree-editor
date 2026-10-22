'use client';

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CONTENT_SYNC_STATUS_LABELS, type ContentSyncStatus } from "@/lib/content-sync";

// Same palette as the changelog badges.
const STATUS_CLASSES: Record<ContentSyncStatus, string> = {
    in_sync: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    source_ahead: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400",
    target_ahead: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    diverged: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
    pending: "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    never_synced: "bg-muted text-muted-foreground",
    only_on_source: "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
    only_on_target: "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
    cannot_compare: "bg-muted text-muted-foreground",
};

/**
 * Sync status of a script pair. Labels name the editors by role on this editor: on the target, the
 * source is "DEV"-like ("Source ahead"); the caller can pass the linked editor's name to be specific.
 */
export function ContentSyncStatusBadge({
    status,
    sourceName,
    targetName,
    className,
}: {
    status: ContentSyncStatus;
    sourceName?: string;
    targetName?: string;
    className?: string;
}) {
    let label = CONTENT_SYNC_STATUS_LABELS[status];
    if (status === "source_ahead" && sourceName) label = `${sourceName} ahead`;
    if (status === "target_ahead" && targetName) label = `${targetName} ahead`;
    const inSentence = (name: string) => (name === "This editor" ? "this editor" : name);
    if (status === "only_on_source" && sourceName) label = `Only on ${inSentence(sourceName)}`;
    if (status === "only_on_target" && targetName) label = `Only on ${inSentence(targetName)}`;
    return (
        <Badge variant="outline" className={cn("whitespace-nowrap", STATUS_CLASSES[status], className)}>
            {label}
        </Badge>
    );
}
