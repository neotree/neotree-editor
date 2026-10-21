'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { format } from "date-fns";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ErrorCard } from "@/components/error-card";
import { DataTable } from "@/components/data-table";
import { CHANGELOG_ACTION_BADGE_CLASSES } from "@/lib/changelog-utils";
import { cn } from "@/lib/utils";
import type { ImportSourcesResult, ImportSourceScript } from "@/app/actions/scripts";

type Site = { siteId: string; name: string; };

/**
 * Step 1 of the import: which editor and which of its scripts. Lists the other editor's published scripts
 * instead of asking for an id, and pre-selects the script this one was imported from last time.
 */
export function ImportSourcePicker({
    sites,
    siteId,
    onSiteChange,
    targetScriptId,
    targetTitle,
    multiple,
    value,
    onChange,
    disabled,
    onLoaded,
}: {
    sites: Site[];
    siteId: string;
    onSiteChange: (siteId: string) => void;
    /** Importing into this existing script (merge); empty when importing new copies. */
    targetScriptId?: string;
    targetTitle?: string;
    /** New copies can be imported several at a time. */
    multiple?: boolean;
    value: string[];
    onChange: (scriptIds: string[]) => void;
    disabled?: boolean;
    onLoaded?: (result: ImportSourcesResult) => void;
}) {
    const [result, setResult] = useState<ImportSourcesResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const [showManual, setShowManual] = useState(false);
    const [manualId, setManualId] = useState('');
    const onLoadedRef = useRef(onLoaded);
    onLoadedRef.current = onLoaded;

    useEffect(() => {
        if (!siteId) { setResult(null); return; }
        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const res = await axios.get<ImportSourcesResult>('/api/scripts/import-sources?data=' + encodeURIComponent(JSON.stringify({ siteId, targetScriptId: targetScriptId || null })));
                if (!cancelled) { setResult(res.data); onLoadedRef.current?.(res.data); }
            } catch (e: any) {
                if (!cancelled) setResult({ scripts: [], lastImport: null, errors: [e.message] });
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [siteId, targetScriptId, reloadKey]);

    const scripts = useMemo(() => result?.scripts || [], [result]);
    const lastImport = result?.lastImport && (!result.lastImport.sourceSiteId || result.lastImport.sourceSiteId === siteId) ? result.lastImport : null;
    const lastSource = lastImport ? scripts.find(s => s.scriptId === lastImport.sourceScriptId) : null;
    const sameIdSource = targetScriptId ? scripts.find(s => s.scriptId === targetScriptId) : null;

    // Pre-select the script this one came from last time (or the one with the same id), and keep it, the
    // remembered source and anything already selected at the top of the list so the choice is in view.
    const [pinnedIds, setPinnedIds] = useState<string[]>([]);
    useEffect(() => {
        if (!scripts.length) return;
        const suggested = !multiple && !value.length ? (lastSource || sameIdSource) : null;
        if (suggested) onChange([suggested.scriptId]);
        setPinnedIds(Array.from(new Set([...value, ...(suggested ? [suggested.scriptId] : []), ...(lastImport ? [lastImport.sourceScriptId] : [])])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [result]);

    // (rows don't jump around while clicking: the pinned set is fixed when the list loads)
    const filtered = useMemo(() => {
        const pinned = new Set(pinnedIds);
        const q = search.trim().toLowerCase();
        const matching = !q ? scripts : scripts.filter(s => [s.title, s.printTitle, s.description, s.type, s.hospitalName, s.scriptId].some(v => `${v || ''}`.toLowerCase().includes(q)));
        return [...matching.filter(s => pinned.has(s.scriptId)), ...matching.filter(s => !pinned.has(s.scriptId))];
    }, [scripts, search, pinnedIds]);

    const unknownSelected = value.filter(id => !scripts.some(s => s.scriptId === id));

    const toggle = (scriptId: string) => {
        if (!multiple) return onChange([scriptId]);
        onChange(value.includes(scriptId) ? value.filter(id => id !== scriptId) : [...value, scriptId]);
    };

    const noteFor = (s: ImportSourceScript) => {
        if (lastImport?.sourceScriptId === s.scriptId) return <Badge variant="outline" className={CHANGELOG_ACTION_BADGE_CLASSES.create}>Last source</Badge>;
        if (!!targetScriptId && s.scriptId === targetScriptId) return <Badge variant="outline">Same script</Badge>;
        if (multiple && s.importedInto.length) return <span className="text-xs text-amber-700">Already imported as {s.importedInto.map(t => `“${t.title || t.scriptId}”`).join(', ')}</span>;
        return null;
    };

    const table = (
        <DataTable
            loading={loading}
            noDataMessage={search ? 'No script matches your search.' : 'This editor has no published scripts.'}
            search={{
                inputPlaceholder: 'Search scripts by title, type or hospital',
                value: search,
                setValue: setSearch,
                filterRows: false,
            }}
            selectable={multiple && !disabled}
            selectedIndexes={multiple ? filtered.map((s, i) => (value.includes(s.scriptId) ? i : -1)).filter(i => i >= 0) : undefined}
            onSelect={multiple ? (indexes) => {
                const visible = new Set(filtered.map(s => s.scriptId));
                // keep selections hidden by the search, replace the visible ones
                onChange([...value.filter(id => !visible.has(id)), ...indexes.map(i => filtered[i]?.scriptId).filter(Boolean)]);
            } : undefined}
            getRowOptions={({ rowIndex }) => ({
                className: cn('cursor-pointer', !multiple && value[0] === filtered[rowIndex]?.scriptId && 'bg-muted/50'),
                onClick: (e) => {
                    if ((e.target as HTMLElement).closest('button, [role="checkbox"]')) return;
                    if (!disabled && filtered[rowIndex]) toggle(filtered[rowIndex].scriptId);
                },
            })}
            columns={[
                ...(!multiple ? [{
                    name: '',
                    thClassName: 'w-10',
                    cellRenderer: ({ rowIndex }: { rowIndex: number; }) => (
                        <RadioGroupItem
                            id={`import-source-${filtered[rowIndex]?.scriptId}`}
                            value={filtered[rowIndex]?.scriptId || ''}
                            disabled={disabled}
                        />
                    ),
                }] : []),
                {
                    name: 'Title',
                    cellRenderer: ({ rowIndex }) => {
                        const s = filtered[rowIndex];
                        return (
                            <div>
                                <div>{s?.title || '(untitled)'}</div>
                                {!!s?.description && <div className="text-xs text-muted-foreground line-clamp-1">{s.description}</div>}
                            </div>
                        );
                    },
                },
                { name: 'Type', cellRenderer: ({ rowIndex }) => <span className="capitalize">{`${filtered[rowIndex]?.type || ''}`.replace(/_/g, ' ')}</span> },
                { name: 'Hospital' },
                { name: '', align: 'right', cellRenderer: ({ rowIndex }) => filtered[rowIndex] ? noteFor(filtered[rowIndex]) : null },
            ]}
            data={filtered.map(s => [
                ...(!multiple ? [''] : []),
                s.title || '',
                s.type || '',
                s.hospitalName || '',
                '',
            ])}
        />
    );

    return (
        <div className="flex flex-col gap-y-4">
            <div>
                <Label secondary htmlFor="import-site">Import from *</Label>
                <Select
                    name="siteId"
                    disabled={disabled}
                    value={siteId || undefined}
                    onValueChange={(v) => { onSiteChange(v); onChange([]); setSearch(''); }}
                >
                    <SelectTrigger id="import-site">
                        <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Sites</SelectLabel>
                            {sites.map(s => <SelectItem key={s.siteId} value={s.siteId}>{s.name}</SelectItem>)}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            {!!siteId && (
                <div className="flex flex-col gap-y-2">
                    <div className="flex items-center justify-between gap-x-2">
                        <Label secondary>{multiple ? 'Scripts to import *' : 'Script to import *'}</Label>
                        {multiple && !!value.length && <span className="text-xs text-muted-foreground">{value.length} selected</span>}
                    </div>

                    {!!targetScriptId && !loading && !result?.errors?.length && (
                        <p className="text-xs text-muted-foreground">
                            {lastImport ? (
                                <>
                                    Last imported from <span className="text-foreground">{lastSource?.title || lastImport.sourceScriptId}</span>
                                    {lastImport.importedAt && <> on {format(new Date(lastImport.importedAt), 'PP p')}</>}
                                    {lastImport.pending && ' (not published yet)'}.
                                    {!lastSource && ' That script is not published on this editor any more.'}
                                </>
                            ) : (
                                <>Not imported before: the first import keeps everything that only exists here.</>
                            )}
                        </p>
                    )}

                    {result?.errors?.length ? (
                        <ErrorCard>
                            <div className="flex items-center justify-between gap-x-3 p-2 text-sm">
                                <span>Could not load the scripts: {result.errors.join(', ')}</span>
                                <Button size="sm" variant="outline" onClick={() => setReloadKey(k => k + 1)}>Try again</Button>
                            </div>
                        </ErrorCard>
                    ) : (
                        <div className="max-h-[320px] overflow-y-auto rounded-md border">
                            {multiple ? table : (
                                <RadioGroup value={value[0] || ''} onValueChange={(v) => onChange([v])} disabled={disabled}>
                                    {table}
                                </RadioGroup>
                            )}
                        </div>
                    )}

                    {!!unknownSelected.length && !loading && !!scripts.length && (
                        <p className="text-xs text-amber-700">
                            Selected by id, not in this editor&apos;s published scripts: {unknownSelected.join(', ')}
                        </p>
                    )}

                    <div>
                        <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-xs text-muted-foreground"
                            onClick={() => setShowManual(v => !v)}
                            disabled={disabled}
                        >
                            {showManual ? 'Hide' : 'Can\u2019t find it? Enter a script id'}
                        </Button>
                        {showManual && (
                            <div className="mt-2 flex gap-x-2">
                                <Input value={manualId} onChange={(e) => setManualId(e.target.value)} placeholder="Script ID" disabled={disabled} />
                                <Button
                                    variant="outline"
                                    disabled={disabled || !manualId.trim()}
                                    onClick={() => { const id = manualId.trim(); onChange(multiple ? Array.from(new Set([...value, id])) : [id]); setManualId(''); }}
                                >
                                    Use
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
