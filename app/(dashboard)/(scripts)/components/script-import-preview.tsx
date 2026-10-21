'use client';

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Info, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorCard } from "@/components/error-card";
import { CHANGELOG_ACTION_BADGE_CLASSES, CHANGELOG_DEFAULT_ACTION_BADGE_CLASS } from "@/lib/changelog-utils";
import { cn } from "@/lib/utils";
import type { ScriptImportChange, ScriptImportEntityCounts, ScriptImportPreview } from "@/lib/script-import-preview";

const CHANGE_LABELS: Record<ScriptImportChange['kind'], string> = {
    added_from_source: 'Added',
    removed_by_source: 'Removed (the source removed it)',
    kept_target_only: 'Kept (only on this editor)',
    kept_target_removal: 'Stays removed (removed here)',
    conflict_source_wins: 'Changed on both: source version used',
    conflict_kept_target: 'Changed here, removed on source: kept',
    replaced_without_history: 'Differs here: source version used (first import)',
};

// Same palette as the changelogs: added = create, removed = delete, conflicts/differences = restore (amber).
const KIND_BADGE: Record<ScriptImportChange['kind'], string> = {
    added_from_source: CHANGELOG_ACTION_BADGE_CLASSES.create,
    removed_by_source: CHANGELOG_ACTION_BADGE_CLASSES.delete,
    kept_target_only: CHANGELOG_DEFAULT_ACTION_BADGE_CLASS,
    kept_target_removal: CHANGELOG_DEFAULT_ACTION_BADGE_CLASS,
    conflict_source_wins: CHANGELOG_ACTION_BADGE_CLASSES.restore,
    conflict_kept_target: CHANGELOG_ACTION_BADGE_CLASSES.restore,
    replaced_without_history: CHANGELOG_ACTION_BADGE_CLASSES.restore,
};

type Filter = 'all' | 'added' | 'removed' | 'attention' | 'kept';
const FILTER_KINDS: Record<Exclude<Filter, 'all'>, ScriptImportChange['kind'][]> = {
    added: ['added_from_source'],
    removed: ['removed_by_source'],
    attention: ['conflict_source_wins', 'conflict_kept_target', 'replaced_without_history'],
    kept: ['kept_target_only', 'kept_target_removal'],
};

function Chip({ className, children }: { className?: string; children: React.ReactNode; }) {
    return <Badge variant="outline" className={cn("font-normal", className)}>{children}</Badge>;
}

function CountsRow({ label, counts }: { label: string; counts: ScriptImportEntityCounts; }) {
    const chips = [
        counts.added ? <Chip key="a" className={CHANGELOG_ACTION_BADGE_CLASSES.create}>{counts.added} new</Chip> : null,
        counts.updated ? <Chip key="u" className={CHANGELOG_ACTION_BADGE_CLASSES.update}>{counts.updated} updated</Chip> : null,
        counts.removed ? <Chip key="r" className={CHANGELOG_ACTION_BADGE_CLASSES.delete}>{counts.removed} removed</Chip> : null,
        counts.kept ? <Chip key="k">{counts.kept} kept (only here)</Chip> : null,
        counts.moved ? <Chip key="m" className={CHANGELOG_ACTION_BADGE_CLASSES.merge}>{counts.moved} moved</Chip> : null,
    ].filter(Boolean);
    if (!chips.length && !counts.unchanged) return null;
    return (
        <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="w-24 shrink-0 font-medium">{label}</span>
            {chips}
            {!!counts.unchanged && <span className="text-xs text-muted-foreground">{counts.unchanged} unchanged</span>}
        </div>
    );
}

/** What an import would do (or did), from the server's dry run. Used by the import and export dialogs. */
export function ScriptImportPreviewSummary({ preview }: { preview: ScriptImportPreview }) {
    const { dataKeys } = preview;
    const [filter, setFilter] = useState<Filter>('all');
    const [search, setSearch] = useState('');

    const counts = useMemo(() => {
        const of = (kinds: ScriptImportChange['kind'][]) => preview.changes.filter(c => kinds.includes(c.kind)).length;
        return {
            all: preview.changes.length,
            added: of(FILTER_KINDS.added),
            removed: of(FILTER_KINDS.removed),
            attention: of(FILTER_KINDS.attention),
            kept: of(FILTER_KINDS.kept),
        };
    }, [preview.changes]);

    const changes = useMemo(() => {
        const q = search.trim().toLowerCase();
        return preview.changes
            .filter(c => filter === 'all' || FILTER_KINDS[filter].includes(c.kind))
            .filter(c => !q || `${c.label || ''} ${c.path}`.toLowerCase().includes(q));
    }, [preview.changes, filter, search]);

    const optionChips = preview.mode === 'merge' ? [
        preview.options.added ? <Chip key="a" className={CHANGELOG_ACTION_BADGE_CLASSES.create}>{preview.options.added} added</Chip> : null,
        preview.options.removedBySource ? <Chip key="r" className={CHANGELOG_ACTION_BADGE_CLASSES.delete}>{preview.options.removedBySource} removed</Chip> : null,
        preview.options.keptTargetOnly ? <Chip key="k">{preview.options.keptTargetOnly} kept (only here)</Chip> : null,
        preview.options.conflicts ? <Chip key="c" className={CHANGELOG_ACTION_BADGE_CLASSES.restore}>{preview.options.conflicts} changed on both</Chip> : null,
    ].filter(Boolean) : [];

    return (
        <div className="flex flex-col gap-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{preview.sourceScript.title || preview.sourceScript.scriptId}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{preview.targetScript ? (preview.targetScript.title || 'this script') : 'new script on this editor'}</span>
                <Chip className={preview.mode === 'merge' ? CHANGELOG_ACTION_BADGE_CLASSES.merge : CHANGELOG_ACTION_BADGE_CLASSES.create}>
                    {preview.mode === 'merge' ? (preview.firstImport ? 'First import (merge)' : 'Merge') : 'New copy'}
                </Chip>
            </div>

            {preview.upToDate ? (
                <div className="flex items-center gap-x-2 rounded-md border px-3 py-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Already up to date with the source. Importing would not change anything.
                </div>
            ) : (
                <div className="flex flex-col gap-y-2 rounded-md border px-3 py-3">
                    {!!preview.scriptChanges?.length && (
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="w-24 shrink-0 font-medium">Settings</span>
                            <span className="text-muted-foreground">{preview.scriptChanges.join(', ')}</span>
                        </div>
                    )}
                    <CountsRow label="Screens" counts={preview.screens} />
                    <CountsRow label="Diagnoses" counts={preview.diagnoses} />
                    <CountsRow label="Problems" counts={preview.problems} />
                    {!!optionChips.length && (
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="w-24 shrink-0 font-medium">Options</span>
                            {optionChips}
                        </div>
                    )}
                    {(!!dataKeys.created || !!dataKeys.updated) && (
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="w-24 shrink-0 font-medium">Data keys</span>
                            {!!dataKeys.created && <Chip className={CHANGELOG_ACTION_BADGE_CLASSES.create}>{dataKeys.created} new</Chip>}
                            {!!dataKeys.updated && <Chip className={CHANGELOG_ACTION_BADGE_CLASSES.update}>{dataKeys.updated} updated</Chip>}
                            <span className="text-xs text-muted-foreground">
                                {dataKeys.optionsAdded} option{dataKeys.optionsAdded === 1 ? '' : 's'} added
                                {!!dataKeys.optionsRemoved && `, ${dataKeys.optionsRemoved} removed`}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {!!preview.removedEntities.length && (
                <ErrorCard>
                    <div className="p-2 text-sm">
                        <div className="mb-1 font-medium">
                            {preview.removedEntities.length} {preview.removedEntities.length === 1 ? 'item' : 'items'} will be removed from this script
                        </div>
                        {preview.removedEntities.slice(0, 30).map((e, i) => (
                            <div key={`${e.kind}-${e.title}-${i}`}>
                                <span className="capitalize">{e.kind}</span>: {e.title || '(untitled)'} <span className="opacity-80">&mdash; {e.reason}</span>
                            </div>
                        ))}
                        {preview.removedEntities.length > 30 && <div>&hellip;and {preview.removedEntities.length - 30} more</div>}
                    </div>
                </ErrorCard>
            )}

            {preview.mode === 'merge' && preview.firstImport && !preview.upToDate && (
                <div className="flex gap-x-2 rounded-md border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-xs text-blue-800 dark:text-blue-300">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                        First import into this script: nothing that only exists here is removed. Later imports also apply what the source removes.
                        {!!preview.replacedWithoutHistory && (
                            <> {preview.replacedWithoutHistory === 1 ? '1 screen, field or option here differs' : `${preview.replacedWithoutHistory} screens, fields or options here differ`} from the source and will take the source&apos;s wording or settings &mdash; see &ldquo;Needs a look&rdquo; below.</>
                        )}
                    </span>
                </div>
            )}

            {!!preview.warnings.length && (
                <ErrorCard color="warning">
                    <ul className="list-disc space-y-1 py-2 pl-5 text-sm">
                        {preview.warnings.slice(0, 20).map((w, i) => <li key={`${w}-${i}`}>{w}</li>)}
                        {preview.warnings.length > 20 && <li>&hellip;and {preview.warnings.length - 20} more</li>}
                    </ul>
                </ErrorCard>
            )}

            {!!dataKeys.details.length && (
                <details className="rounded-md border px-3 py-2 text-sm">
                    <summary className="cursor-pointer font-medium">Data key changes ({dataKeys.details.length})</summary>
                    <div className="mt-2 flex flex-col gap-y-1">
                        {dataKeys.details.slice(0, 100).map((k, i) => (
                            <div key={`${k.label}-${i}`} className="flex flex-wrap items-center gap-x-2 text-xs">
                                <span className="font-medium">{k.label}</span>
                                {k.isNew ? <Chip className={CHANGELOG_ACTION_BADGE_CLASSES.create}>new key</Chip> : (
                                    <span className="text-muted-foreground">
                                        {[
                                            k.added && `${k.added} option${k.added === 1 ? '' : 's'} added`,
                                            k.removed && `${k.removed} option${k.removed === 1 ? '' : 's'} removed`,
                                            k.changed?.length && `${k.changed.join(', ')} changed`,
                                        ].filter(Boolean).join(', ')}
                                    </span>
                                )}
                            </div>
                        ))}
                        {dataKeys.details.length > 100 && <div className="text-xs text-muted-foreground">&hellip;and {dataKeys.details.length - 100} more</div>}
                    </div>
                </details>
            )}

            {!!preview.changes.length && (
                <div className="flex flex-col gap-y-2 rounded-md border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
                            <TabsList className="h-8">
                                <TabsTrigger value="all" className="text-xs">All ({counts.all})</TabsTrigger>
                                {!!counts.added && <TabsTrigger value="added" className="text-xs">Added ({counts.added})</TabsTrigger>}
                                {!!counts.removed && <TabsTrigger value="removed" className="text-xs">Removed ({counts.removed})</TabsTrigger>}
                                {!!counts.attention && <TabsTrigger value="attention" className="text-xs">Needs a look ({counts.attention})</TabsTrigger>}
                                {!!counts.kept && <TabsTrigger value="kept" className="text-xs">Kept ({counts.kept})</TabsTrigger>}
                            </TabsList>
                        </Tabs>
                        <div className="relative w-full sm:w-56">
                            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search changes" className="h-8 pl-7 text-xs" />
                        </div>
                    </div>
                    <ScrollArea className={cn(changes.length > 8 ? "h-[240px]" : "max-h-[240px]")}>
                        <div className="flex flex-col divide-y">
                            {changes.map((c, i) => (
                                <div key={`${c.path}-${i}`} className="flex flex-col gap-y-0.5 py-1.5 pr-3 text-xs">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Chip className={cn("text-[10px]", KIND_BADGE[c.kind])}>{CHANGE_LABELS[c.kind]}</Chip>
                                        <span className="font-medium">{c.label || '(no label)'}</span>
                                        {!!c.props?.length && <span className="text-muted-foreground">({c.props.join(', ')})</span>}
                                    </div>
                                    <span className="text-muted-foreground">{c.path}</span>
                                </div>
                            ))}
                            {!changes.length && <div className="py-4 text-center text-xs text-muted-foreground">No changes match.</div>}
                        </div>
                    </ScrollArea>
                    {!!preview.changesTruncated && (
                        <div className="text-xs text-muted-foreground">&hellip;and {preview.changesTruncated} more changes not listed</div>
                    )}
                </div>
            )}
        </div>
    );
}
