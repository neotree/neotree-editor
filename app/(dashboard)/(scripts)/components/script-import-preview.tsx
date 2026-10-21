'use client';

import { ErrorCard } from "@/components/error-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ScriptImportChange, ScriptImportEntityCounts, ScriptImportPreview } from "@/lib/script-import-preview";

const CHANGE_LABELS: Record<ScriptImportChange['kind'], string> = {
    added_from_source: 'Added from source',
    removed_by_source: 'Removed (source removed it)',
    kept_target_only: 'Kept (only on this editor)',
    kept_target_removal: 'Stays removed (removed here)',
    conflict_source_wins: 'Changed on both: source version used',
    conflict_kept_target: 'Changed here, removed on source: kept',
};

const CHANGE_CLASSES: Record<ScriptImportChange['kind'], string> = {
    added_from_source: 'text-green-700',
    removed_by_source: 'text-destructive',
    kept_target_only: 'text-muted-foreground',
    kept_target_removal: 'text-muted-foreground',
    conflict_source_wins: 'text-amber-700',
    conflict_kept_target: 'text-amber-700',
};

function countsLine(label: string, counts: ScriptImportEntityCounts) {
    const parts = [
        counts.added && `${counts.added} new`,
        counts.updated && `${counts.updated} updated`,
        counts.removed && `${counts.removed} removed`,
        counts.kept && `${counts.kept} kept (only here)`,
        counts.moved && `${counts.moved} moved`,
        counts.unchanged && `${counts.unchanged} unchanged`,
    ].filter(Boolean);
    if (!parts.length) return null;
    return (
        <div className="text-sm">
            <span className="font-medium">{label}:</span> {parts.join(', ')}
        </div>
    );
}

export function ScriptImportPreviewSummary({ preview }: { preview: ScriptImportPreview }) {
    const { dataKeys } = preview;

    return (
        <div className="flex flex-col gap-y-3">
            <div className="text-sm">
                <span className="font-medium">Source:</span> {preview.sourceScript.title || preview.sourceScript.scriptId}
                {!!preview.targetScript && (
                    <>
                        {' '}&rarr; <span className="font-medium">this script:</span> {preview.targetScript.title || preview.targetScript.scriptId}
                    </>
                )}
            </div>

            {preview.upToDate ? (
                <div className="rounded-md border px-3 py-2 text-sm">This script is already up to date with the source. Nothing will change.</div>
            ) : (
                <div className="rounded-md border px-3 py-2 flex flex-col gap-y-1">
                    {!!preview.scriptChanges?.length && (
                        <div className="text-sm">
                            <span className="font-medium">Script settings:</span> {preview.scriptChanges.join(', ')}
                        </div>
                    )}
                    {countsLine('Screens', preview.screens)}
                    {countsLine('Diagnoses', preview.diagnoses)}
                    {countsLine('Problems', preview.problems)}
                    {preview.mode === 'merge' && (
                        <div className="text-sm">
                            <span className="font-medium">Options:</span>{' '}
                            {preview.options.added} added, {preview.options.removedBySource} removed by the source,{' '}
                            {preview.options.keptTargetOnly} kept that only exist here
                            {!!preview.options.conflicts && `, ${preview.options.conflicts} changed on both editors`}
                        </div>
                    )}
                    {(!!dataKeys.created || !!dataKeys.updated) && (
                        <div className="text-sm">
                            <span className="font-medium">Data keys:</span>{' '}
                            {dataKeys.created} new, {dataKeys.updated} updated
                            {' '}({dataKeys.optionsAdded} option{dataKeys.optionsAdded === 1 ? '' : 's'} added
                            {!!dataKeys.optionsRemoved && `, ${dataKeys.optionsRemoved} removed`})
                        </div>
                    )}
                </div>
            )}

            {preview.mode === 'merge' && preview.firstImport && !preview.upToDate && (
                <div className="text-xs text-muted-foreground">
                    This is the first import into this script, so nothing that only exists here will be removed.
                    Later imports also apply what the source removes.
                </div>
            )}

            {!!dataKeys.details.length && (
                <details className="rounded-md border px-3 py-2 text-sm">
                    <summary className="cursor-pointer font-medium">Data key changes ({dataKeys.details.length})</summary>
                    <div className="mt-2 flex flex-col gap-y-1">
                        {dataKeys.details.slice(0, 100).map((k, i) => (
                            <div key={`${k.label}-${i}`} className="text-xs">
                                <span className="font-medium">{k.label}</span>{' '}
                                <span className="text-muted-foreground">
                                    {k.isNew ? 'new key' : [
                                        k.added && `${k.added} option${k.added === 1 ? '' : 's'} added`,
                                        k.removed && `${k.removed} option${k.removed === 1 ? '' : 's'} removed`,
                                        k.changed?.length && `${k.changed.join(', ')} changed`,
                                    ].filter(Boolean).join(', ')}
                                </span>
                            </div>
                        ))}
                        {dataKeys.details.length > 100 && <div className="text-xs text-muted-foreground">&hellip;and {dataKeys.details.length - 100} more</div>}
                    </div>
                </details>
            )}

            {!!preview.removedEntities.length && (
                <ErrorCard>
                    <div className="p-2 text-sm">
                        <div className="font-medium mb-1">Will be removed from this script:</div>
                        {preview.removedEntities.slice(0, 30).map((e, i) => (
                            <div key={`${e.kind}-${e.title}-${i}`}>{e.kind}: {e.title || '(untitled)'} &mdash; {e.reason}</div>
                        ))}
                        {preview.removedEntities.length > 30 && <div>&hellip;and {preview.removedEntities.length - 30} more</div>}
                    </div>
                </ErrorCard>
            )}

            {!!preview.warnings.length && (
                <ErrorCard color="warning">
                    <div className="p-2 text-sm flex flex-col gap-y-1">
                        {preview.warnings.slice(0, 20).map((w, i) => <div key={`${w}-${i}`}>{w}</div>)}
                        {preview.warnings.length > 20 && <div>&hellip;and {preview.warnings.length - 20} more</div>}
                    </div>
                </ErrorCard>
            )}

            {!!preview.changes.length && (
                <ScrollArea className="h-[220px] rounded-md border p-3">
                    <div className="flex flex-col gap-y-1">
                        {preview.changes.map((c, i) => (
                            <div key={`${c.path}-${i}`} className="text-xs">
                                <span className={CHANGE_CLASSES[c.kind]}>{CHANGE_LABELS[c.kind]}</span>
                                {': '}
                                <span className="font-medium">{c.label || '(no label)'}</span>
                                <span className="text-muted-foreground"> &mdash; {c.path}</span>
                            </div>
                        ))}
                        {!!preview.changesTruncated && (
                            <div className="text-xs text-muted-foreground">&hellip;and {preview.changesTruncated} more changes</div>
                        )}
                    </div>
                </ScrollArea>
            )}
        </div>
    );
}
