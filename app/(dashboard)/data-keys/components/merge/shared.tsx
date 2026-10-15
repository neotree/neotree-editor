'use client';

import { useAppContext } from '@/contexts/app';
import { Badge } from '@/components/ui/badge';
import { CHANGELOG_ACTION_BADGE_CLASSES, CHANGELOG_DEFAULT_ACTION_BADGE_CLASS } from '@/lib/changelog-utils';
import type { ChildMatchReason, ChildMergeAction } from '@/lib/data-key-merge-plan';
import { cn } from '@/lib/utils';

export type KeyLike = {
    name?: string | null;
    label?: string | null;
    uniqueKey?: string | null;
};

/** "Name — Label" when the label adds information, otherwise just the name. */
export function describeKey(dataKey?: KeyLike | null) {
    if (!dataKey) return '';
    const name = `${dataKey.name || ''}`.trim();
    const label = `${dataKey.label || ''}`.trim();
    if (name && label && label.toLowerCase() !== name.toLowerCase()) return `${name} — ${label}`;
    return name || label || `${dataKey.uniqueKey || ''}`;
}

export function shortId(value?: string | null) {
    return `${value || ''}`.slice(0, 8);
}

export function pluralize(count: number, noun: string, plural = `${noun}s`) {
    return `${count} ${count === 1 ? noun : plural}`;
}

export function encodeAction(action: ChildMergeAction) {
    return action.action === 'match' ? `match:${action.to}` : action.action;
}

export function decodeAction(value: string): ChildMergeAction {
    if (value.startsWith('match:')) return { action: 'match', to: value.slice('match:'.length) };
    return { action: value as 'keep' | 'add' | 'drop' };
}

// Same colours as the changelog action badges, so results read the same everywhere.
const ACTION_BADGES: Record<ChildMergeAction['action'], { label: string; className: string; }> = {
    keep: { label: 'Same option', className: CHANGELOG_DEFAULT_ACTION_BADGE_CLASS },
    match: { label: 'Matched', className: CHANGELOG_ACTION_BADGE_CLASSES.update },
    add: { label: 'New option', className: CHANGELOG_ACTION_BADGE_CLASSES.create },
    drop: { label: 'Removed', className: CHANGELOG_ACTION_BADGE_CLASSES.delete },
};

export function ActionBadge({ action, className }: { action: ChildMergeAction['action']; className?: string; }) {
    const badge = ACTION_BADGES[action];
    return <Badge variant="outline" className={cn('whitespace-nowrap font-normal', badge.className, className)}>{badge.label}</Badge>;
}

// Each kind of recorded change, with the changelog colour it reads as.
const OPERATION_KIND_BADGES: Record<string, { label: string; className: string; }> = {
    merge: { label: 'Merge', className: CHANGELOG_ACTION_BADGE_CLASSES.merge },
    delete: { label: 'Delete', className: CHANGELOG_ACTION_BADGE_CLASSES.delete },
    scripts: { label: 'Selected scripts', className: CHANGELOG_ACTION_BADGE_CLASSES.update },
    unlink: { label: 'Unlink', className: CHANGELOG_ACTION_BADGE_CLASSES.restore },
};

export function OperationKindBadge({ kind }: { kind: string; }) {
    const badge = OPERATION_KIND_BADGES[kind] || OPERATION_KIND_BADGES.merge;
    return <Badge variant="outline" className={cn('whitespace-nowrap font-normal', badge.className)}>{badge.label}</Badge>;
}

/** A history entry's title; merges recorded before titles existed fall back to the kept key. */
export function operationTitle(entry: { kind?: string; title?: string; survivorName: string; }) {
    return entry.title || `Merge into “${entry.survivorName}”`;
}

export const MATCH_REASON_LABELS: Record<ChildMatchReason, string> = {
    same: 'same option',
    name: 'same name',
    label: 'same label',
    similar: 'similar name',
};

export function MergeStatusBadge({ status, kind = 'merge' }: { status: 'applied' | 'reverted'; kind?: string; }) {
    return (
        <Badge
            variant="outline"
            className={cn('font-normal', status === 'reverted' ? CHANGELOG_ACTION_BADGE_CLASSES.rollback : CHANGELOG_ACTION_BADGE_CLASSES.merge)}
        >
            {status === 'reverted' ? 'Reverted' : (kind === 'merge' ? 'Merged' : 'Applied')}
        </Badge>
    );
}

/** Section heading used on every merge page. */
export function SectionTitle({ title, description, aside, id }: {
    title: string;
    description?: React.ReactNode;
    aside?: React.ReactNode;
    id?: string;
}) {
    return (
        <div id={id} className="flex scroll-mt-4 flex-wrap items-start gap-x-4 gap-y-2">
            <div className="min-w-0 flex-1">
                <div className="text-lg">{title}</div>
                {!!description && <div className="text-sm text-muted-foreground">{description}</div>}
            </div>
            {aside}
        </div>
    );
}

export function Callout({ variant, children, className }: {
    variant: 'warning' | 'error' | 'info';
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            role={variant === 'error' ? 'alert' : 'status'}
            className={cn(
                'rounded-md border p-3 text-sm',
                variant === 'error' && 'border-destructive/30 bg-destructive/10 text-destructive',
                variant === 'warning' && 'border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200',
                variant === 'info' && 'border-border bg-muted/40 text-muted-foreground',
                className,
            )}
        >
            {children}
        </div>
    );
}

/**
 * Merging follows the portal's edit rules: admins only, and only in
 * development mode. In view mode everything stays reviewable.
 */
export function useMergePermission(canMerge: boolean) {
    const { viewOnly } = useAppContext();
    const editable = canMerge && !viewOnly;
    const notice = !canMerge
        ? 'You can review this, but only admins can merge data keys.'
        : viewOnly
            ? 'You’re in view mode. Switch to development mode to merge, revert or dismiss.'
            : '';
    return { editable, notice };
}
