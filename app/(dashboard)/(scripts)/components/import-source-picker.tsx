'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { RefreshCw, Search } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorCard } from "@/components/error-card";
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

    const row = (s: ImportSourceScript) => {
        const selected = value.includes(s.scriptId);
        const isLastSource = lastImport?.sourceScriptId === s.scriptId;
        return (
            <label
                key={s.scriptId}
                htmlFor={`import-source-${s.scriptId}`}
                className={cn(
                    "flex items-start gap-x-3 rounded-md border px-3 py-2 cursor-pointer transition-colors",
                    selected ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                    disabled && "cursor-not-allowed opacity-60",
                )}
            >
                {multiple ? (
                    <Checkbox id={`import-source-${s.scriptId}`} checked={selected} disabled={disabled} onCheckedChange={() => toggle(s.scriptId)} className="mt-0.5" />
                ) : (
                    <RadioGroupItem id={`import-source-${s.scriptId}`} value={s.scriptId} disabled={disabled} className="mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{s.title || '(untitled)'}</span>
                        {!!s.type && <Badge variant="outline" className="text-[10px] capitalize">{s.type.replace(/_/g, ' ')}</Badge>}
                        {isLastSource && <Badge variant="outline" className="text-[10px] border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Imported from last time</Badge>}
                        {!isLastSource && !!targetScriptId && s.scriptId === targetScriptId && <Badge variant="outline" className="text-[10px]">Same script</Badge>}
                    </div>
                    {(!!s.hospitalName || !!s.description) && (
                        <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                            {[s.hospitalName, s.description].filter(Boolean).join(' · ')}
                        </div>
                    )}
                    {multiple && !!s.importedInto.length && (
                        <div className="mt-1 text-xs text-amber-700">
                            Already imported here as {s.importedInto.map(t => `“${t.title || t.scriptId}”`).join(', ')}. To update it, open that script and import into it instead of making another copy.
                        </div>
                    )}
                </div>
            </label>
        );
    };

    const list = (
        <div className="flex flex-col gap-y-2">
            {filtered.map(row)}
            {!filtered.length && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                    {search ? 'No script matches your search.' : 'This editor has no published scripts.'}
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col gap-y-3">
            <div>
                <Label htmlFor="import-site">Import from *</Label>
                <Select
                    name="siteId"
                    disabled={disabled}
                    value={siteId || undefined}
                    onValueChange={(v) => { onSiteChange(v); onChange([]); setSearch(''); }}
                >
                    <SelectTrigger id="import-site">
                        <SelectValue placeholder="Choose an editor" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Editors</SelectLabel>
                            {sites.map(s => <SelectItem key={s.siteId} value={s.siteId}>{s.name}</SelectItem>)}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            {!!siteId && (
                <div className="flex flex-col gap-y-2">
                    <div className="flex items-center justify-between gap-x-2">
                        <Label>{multiple ? 'Scripts to import *' : 'Script to import *'}</Label>
                        {multiple && !!value.length && <span className="text-xs text-muted-foreground">{value.length} selected</span>}
                    </div>

                    {!!targetScriptId && !loading && (
                        <div className="text-xs text-muted-foreground">
                            {lastImport ? (
                                <>
                                    &ldquo;{targetTitle || 'This script'}&rdquo; was last imported from{' '}
                                    <span className="font-medium text-foreground">{lastSource?.title || lastImport.sourceScriptId}</span>
                                    {lastImport.importedAt && <> on {format(new Date(lastImport.importedAt), 'PP p')}</>}
                                    {lastImport.pending && ' (not published yet)'}.
                                    {!lastSource && ' That script is not published on this editor any more.'}
                                </>
                            ) : (
                                <>This script has not been imported before: the first import keeps everything that only exists here.</>
                            )}
                        </div>
                    )}

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search scripts by title, type or hospital"
                            className="pl-9"
                            disabled={disabled || loading}
                        />
                    </div>

                    {loading ? (
                        <div className="flex flex-col gap-y-2">
                            {[0, 1, 2].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : result?.errors?.length ? (
                        <ErrorCard>
                            <div className="flex items-center justify-between gap-x-3 p-2 text-sm">
                                <span>Could not load the scripts: {result.errors.join(', ')}</span>
                                <Button size="sm" variant="outline" onClick={() => setReloadKey(k => k + 1)}>
                                    <RefreshCw className="mr-1 h-3 w-3" /> Try again
                                </Button>
                            </div>
                        </ErrorCard>
                    ) : (
                        <ScrollArea className="h-[260px] rounded-md border p-2">
                            {multiple ? list : (
                                <RadioGroup value={value[0] || ''} onValueChange={(v) => onChange([v])} disabled={disabled}>
                                    {list}
                                </RadioGroup>
                            )}
                        </ScrollArea>
                    )}

                    {!!unknownSelected.length && !loading && !!scripts.length && (
                        <div className="text-xs text-amber-700">
                            Selected by id, not in this editor&apos;s published scripts: {unknownSelected.join(', ')}
                        </div>
                    )}

                    <div>
                        <button
                            type="button"
                            className="text-xs text-muted-foreground underline"
                            onClick={() => setShowManual(v => !v)}
                            disabled={disabled}
                        >
                            {showManual ? 'Hide' : 'Can’t find it? Enter a script id'}
                        </button>
                        {showManual && (
                            <div className="mt-2 flex gap-x-2">
                                <Input value={manualId} onChange={(e) => setManualId(e.target.value)} placeholder="Script id" disabled={disabled} />
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
