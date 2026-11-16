'use client';

import Link from 'next/link';
import { ArrowRightIcon, ExternalLinkIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { CHANGELOG_ACTION_BADGE_CLASSES } from '@/lib/changelog-utils';
import type { MergeChangeKind, MergeReport as MergeReportData } from '@/lib/data-key-merge-report';
import { cn } from '@/lib/utils';

import { pluralize, shortId } from './shared';

const KIND_BADGES: Record<MergeChangeKind, { label: string; className: string; }> = {
    relinked: { label: 'Re-linked', className: CHANGELOG_ACTION_BADGE_CLASSES.update },
    renamed: { label: 'Renamed', className: CHANGELOG_ACTION_BADGE_CLASSES.restore },
    condition: { label: 'Condition', className: CHANGELOG_ACTION_BADGE_CLASSES.publish },
    added: { label: 'Added', className: CHANGELOG_ACTION_BADGE_CLASSES.create },
    removed: { label: 'Removed', className: CHANGELOG_ACTION_BADGE_CLASSES.delete },
};

export function MergeChangeTotals({ totals }: { totals: MergeReportData['totals']; }) {
    const kinds = (Object.keys(KIND_BADGES) as MergeChangeKind[]).filter((kind) => totals[kind]);
    if (!kinds.length) return <span className="text-sm text-muted-foreground">No changes</span>;
    return (
        <div className="flex flex-wrap items-center gap-2">
            {kinds.map((kind) => (
                <Badge key={kind} variant="outline" className={cn('whitespace-nowrap font-normal', KIND_BADGES[kind].className)}>
                    {KIND_BADGES[kind].label} · {totals[kind]}
                </Badge>
            ))}
        </div>
    );
}

/**
 * What a merge changes (preview) or changed (history), one collapsible
 * section per script. Scripts that share a title show a short id.
 */
export function MergeReport({
    report,
    emptyMessage = 'Nothing changes in any script.',
    defaultOpen = false,
    integrityLinks = false,
}: {
    report: MergeReportData;
    emptyMessage?: string;
    defaultOpen?: boolean;
    /** Show a link to each script's data key integrity check. */
    integrityLinks?: boolean;
}) {
    if (!report.scripts.length) {
        return <div className="text-sm text-muted-foreground">{emptyMessage}</div>;
    }

    const titleCounts = new Map<string, number>();
    report.scripts.forEach((script) => titleCounts.set(script.scriptTitle, (titleCounts.get(script.scriptTitle) || 0) + 1));

    return (
        <div className="space-y-2">
            {report.scripts.map((script) => (
                <details
                    key={script.scriptId}
                    open={defaultOpen}
                    className="rounded-lg border border-border/70 bg-muted/20"
                >
                    <summary className="flex cursor-pointer flex-wrap items-center gap-2 px-4 py-3 text-sm">
                        <span className="font-medium">{script.scriptTitle}</span>
                        {(titleCounts.get(script.scriptTitle) || 0) > 1 && (
                            <span className="font-mono text-xs text-muted-foreground">{shortId(script.scriptId)}</span>
                        )}
                        <Badge variant="outline" className="bg-muted font-normal text-muted-foreground">
                            {pluralize(script.changes.length, 'change')}
                        </Badge>
                        {integrityLinks && (
                            <Link
                                href={`/script/${script.scriptId}/data-keys`}
                                className="ml-auto text-xs text-primary hover:underline"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Check data key integrity
                            </Link>
                        )}
                    </summary>
                    <ul className="divide-y divide-border/70 border-t border-border/70">
                        {script.changes.map((change, index) => (
                            <li key={`${change.location}-${index}`} className="grid grid-cols-1 gap-1 px-4 py-2 text-sm sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-3">
                                <div>
                                    <Badge variant="outline" className={cn('font-normal', KIND_BADGES[change.kind].className)}>
                                        {KIND_BADGES[change.kind].label}
                                    </Badge>
                                </div>
                                <div className="min-w-0 space-y-1">
                                    <a
                                        href={change.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex max-w-full items-center gap-x-1 text-muted-foreground hover:text-foreground"
                                    >
                                        <span className="truncate">{change.location}</span>
                                        <ExternalLinkIcon className="h-3 w-3 shrink-0 text-primary" />
                                    </a>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs">
                                        {change.before && <span className="break-all rounded bg-muted px-1.5 py-0.5 line-through decoration-muted-foreground/60">{change.before}</span>}
                                        {change.before && change.after && <ArrowRightIcon className="h-3 w-3 shrink-0 text-muted-foreground" />}
                                        {change.after && <span className="break-all rounded bg-muted px-1.5 py-0.5">{change.after}</span>}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </details>
            ))}
        </div>
    );
}
