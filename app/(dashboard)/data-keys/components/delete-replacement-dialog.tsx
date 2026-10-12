'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLinkIcon } from 'lucide-react';

import type { DataKey } from '@/contexts/data-keys';
import { SelectModal, type SelectModalOption } from '@/components/select-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { isDataKeyReplacementCompatible } from '@/lib/data-key-option-compatibility';
import { cn } from '@/lib/utils';

import type { DeleteImpactItem } from './delete-confirmation';

type ReplacementMap = Record<string, string>;

export type DataKeyDeleteSelection = {
    /** target uuid -> replacement uuid (the default action per key) */
    replacements: ReplacementMap;
    /** target uuid -> scriptIds whose references are removed instead of replaced */
    scriptRemovals: Record<string, string[]>;
    /** "Selected scripts only": target uuid -> scriptIds the change applies to */
    scriptSelections: Record<string, string[]>;
};

type DeleteScope = 'library' | 'scripts';

type DataKeyDeleteReplacementDialogProps = {
    dataKeys: DataKey[];
    impact: DeleteImpactItem[];
    open: boolean;
    deleting?: boolean;
    /** True while usage is still being checked — the dialog shows a skeleton so it can open instantly. */
    loading?: boolean;
    /**
     * 'delete': removal from the library — every used key must get a replacement,
     * and the action is blocked when no compatible replacement exists.
     * 'unlink': removal from a parent's options — replacements come from fellow
     * child keys, and a key without a compatible sibling may proceed (its option
     * items are removed from screens owned by the parent).
     */
    mode?: 'delete' | 'unlink';
    title?: string;
    description?: string;
    confirmLabel?: string;
    onOpenChange: (open: boolean) => void;
    onConfirm: (selection: DataKeyDeleteSelection) => Promise<boolean | void> | boolean | void;
    /**
     * Delete mode only: enables "Delete anyway" — delete without replacing every
     * used key. Replacements the user selected are still applied; the rest have
     * their references removed from the affected scripts. Guarded by the
     * confirmation step before this is called.
     */
    onDeleteAnyway?: (selection: DataKeyDeleteSelection) => Promise<boolean | void> | boolean | void;
    /**
     * Delete mode only: enables "Selected scripts only" — replace or remove the
     * keys in the scripts the user picks, keeping them in the library.
     */
    onApplyToScripts?: (selection: DataKeyDeleteSelection) => Promise<boolean | void> | boolean | void;
};

function normalizeType(value?: string | null) {
    return `${value || ''}`.trim().toLowerCase();
}


type ImpactScript = DeleteImpactItem['scripts'][number];

export type ScriptGroup = {
    key: string;
    title: string;
    scriptIds: string[];
    usages: Array<{ label: string; href: string }>;
};

// Scripts are listed by title: separate scripts can share a title (e.g. copies
// for different sites), and repeating the same name reads as a duplicate. The
// group still carries every scriptId, so actions apply to each of them.
export function groupScriptsByTitle(scripts: ImpactScript[]): ScriptGroup[] {
    const groups = new Map<string, ScriptGroup>();
    for (const script of scripts) {
        const title = `${script.scriptTitle || script.scriptId}`.trim();
        const key = title.toLowerCase();
        const group = groups.get(key) || { key, title, scriptIds: [], usages: [] };
        group.scriptIds.push(script.scriptId);
        const usages = script.usages?.length ? script.usages : [{ label: title, href: `/script/${script.scriptId}` }];
        for (const usage of usages) {
            if (!group.usages.some((existing) => existing.href === usage.href && existing.label === usage.label)) {
                group.usages.push(usage);
            }
        }
        groups.set(key, group);
    }
    return Array.from(groups.values());
}

function countScriptTitles(scripts: ImpactScript[]) {
    return new Set(scripts.map((script) => `${script.scriptTitle || script.scriptId}`.trim().toLowerCase())).size;
}

function pluralizeScripts(count: number) {
    return `${count} script${count === 1 ? '' : 's'}`;
}

function getImpactTitle(item: DeleteImpactItem) {
    return item.label || item.name || item.uniqueKey || 'Untitled data key';
}

// Parent keys (keys with child options) are never replaced — a valid
// replacement would need a superset option pool. They only warn and proceed
// via "delete anyway"; the server enforces the same rule.
function isParentItem(item: DeleteImpactItem) {
    return !!(item.options || []).length;
}

function getReplacementOptionKey(item: Pick<DataKey, 'name' | 'label' | 'uniqueKey'>) {
    return item.name || item.uniqueKey || item.label || 'Untitled data key';
}

function getReplacementOptionLabel(item: Pick<DataKey, 'name' | 'label'>) {
    return item.label && item.label !== item.name ? item.label : undefined;
}

function SearchableReplacementSelect({
    candidates,
    dataTypeLabel,
    pickerDescription,
    disabled,
    excludedDataKeyId,
    value,
    onChange,
}: {
    candidates: DataKey[];
    dataTypeLabel: string;
    pickerDescription: string;
    disabled?: boolean;
    excludedDataKeyId: string;
    value: string;
    onChange: (replacementId: string) => void;
}) {
    const options = useMemo(() => candidates
        .filter((candidate) => candidate.uuid && candidate.uuid !== excludedDataKeyId)
        .map((candidate) => ({
            value: candidate.uuid,
            label: getReplacementOptionKey(candidate),
            caption: candidate.dataType || '',
            description: getReplacementOptionLabel(candidate),
        } satisfies SelectModalOption)), [candidates, excludedDataKeyId]);

    return (
        <SelectModal
            modal
            selected={value}
            disabled={disabled}
            placeholder={`Select a ${dataTypeLabel} replacement`}
            search={{ placeholder: 'Search data keys' }}
            description={pickerDescription}
            options={options}
            onSelect={(selected) => {
                // Keep replacements UUID-backed; legacy libraries can contain duplicate key text.
                const replacementId = `${selected[0]?.value || ''}`;
                if (!replacementId || replacementId === excludedDataKeyId) return;
                onChange(replacementId);
            }}
        />
    );
}

export function DataKeyDeleteReplacementDialog({
    dataKeys,
    impact,
    open,
    deleting,
    loading,
    mode = 'delete',
    title,
    description,
    confirmLabel,
    onOpenChange,
    onConfirm,
    onDeleteAnyway,
    onApplyToScripts,
}: DataKeyDeleteReplacementDialogProps) {
    const isUnlink = mode === 'unlink';
    const [confirmingDeleteAnyway, setConfirmingDeleteAnyway] = useState(false);
    const [scope, setScope] = useState<DeleteScope>('library');
    const scriptsOnly = !isUnlink && !!onApplyToScripts && scope === 'scripts';

    // Keep keyboard/screen-reader users oriented across the two steps: focus
    // lands on the safe action when entering the confirm step, and back on
    // Cancel when returning.
    const goBackRef = useRef<HTMLButtonElement>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);
    const wasConfirming = useRef(false);
    useEffect(() => {
        if (confirmingDeleteAnyway) {
            wasConfirming.current = true;
            goBackRef.current?.focus();
        } else if (wasConfirming.current) {
            wasConfirming.current = false;
            cancelRef.current?.focus();
        }
    }, [confirmingDeleteAnyway]);
    const usedItems = useMemo(
        () => impact.filter((item) => item.scripts.length > 0),
        [impact],
    );
    const deletedIds = useMemo(
        () => new Set(impact.map((item) => item.dataKeyId).filter(Boolean)),
        [impact],
    );
    const [replacements, setReplacements] = useState<ReplacementMap>({});
    // Per-script exceptions: scripts where the key's references are removed
    // instead of replaced. Only meaningful once a replacement is chosen.
    const [scriptRemovals, setScriptRemovals] = useState<Record<string, string[]>>({});

    const isScriptRemoved = (dataKeyId: string, scriptId: string) =>
        (scriptRemovals[dataKeyId] || []).includes(scriptId);

    // Scripts-only mode: the scripts each key's change applies to. Nothing is
    // preselected so every affected script is an explicit choice.
    const [scriptSelections, setScriptSelections] = useState<Record<string, string[]>>({});

    const isScriptSelected = (dataKeyId: string, scriptId: string) =>
        (scriptSelections[dataKeyId] || []).includes(scriptId);

    const setScriptSelected = (dataKeyId: string, scriptIds: string[], selected: boolean) => {
        setScriptSelections((current) => {
            const existing = current[dataKeyId] || [];
            const next = selected
                ? Array.from(new Set([...existing, ...scriptIds]))
                : existing.filter((id) => !scriptIds.includes(id));
            return { ...current, [dataKeyId]: next };
        });
    };

    const setScriptAction = (dataKeyId: string, scriptIds: string[], remove: boolean) => {
        setScriptRemovals((current) => {
            const existing = current[dataKeyId] || [];
            const next = remove
                ? Array.from(new Set([...existing, ...scriptIds]))
                : existing.filter((id) => !scriptIds.includes(id));
            return { ...current, [dataKeyId]: next };
        });
    };

    const selection: DataKeyDeleteSelection = { replacements, scriptRemovals, scriptSelections };

    const resetSelection = () => {
        setReplacements({});
        setScriptRemovals({});
        setScriptSelections({});
        setScope('library');
    };

    const candidatesByDataKeyId = useMemo(() => {
        return new Map(usedItems.map((item) => {
            const itemType = normalizeType(item.dataType);
            const candidates = dataKeys
                .filter((dataKey) => {
                    const dataKeyId = `${dataKey.uuid || ''}`.trim();
                    return (
                        !!dataKeyId &&
                        dataKeyId !== item.dataKeyId &&
                        !deletedIds.has(dataKeyId) &&
                        normalizeType(dataKey.dataType) === itemType &&
                        !dataKey.isDeleted &&
                        isDataKeyReplacementCompatible({
                            target: item,
                            replacement: dataKey,
                        })
                    );
                })
                .sort((a, b) => getReplacementOptionKey(a).localeCompare(getReplacementOptionKey(b)));

            return [item.dataKeyId, candidates];
        }));
    }, [dataKeys, deletedIds, usedItems]);

    // Parent keys never take part in replacement — only warn.
    const replaceableItems = usedItems.filter((item) => !isParentItem(item));
    const unusedCount = impact.length - usedItems.length;

    // Nothing is used in scripts: the dialog doubles as the plain delete
    // confirmation, so the whole flow lives in one consistent surface.
    const allUnused = !isUnlink && !loading && !!impact.length && !usedItems.length;

    // In unlink mode a key without a compatible sibling may proceed (its owned
    // option items are removed); in delete mode it blocks the whole action.
    const missingReplacement = replaceableItems.some((item) => (
        !replacements[item.dataKeyId] &&
        (!isUnlink || !!(candidatesByDataKeyId.get(item.dataKeyId) || []).length)
    ));
    const hasCandidateGap = !isUnlink && replaceableItems.some((item) => !(candidatesByDataKeyId.get(item.dataKeyId) || []).length);

    // Which scripts lose the key's references instead of getting the
    // replacement: everything for parents and unreplaced keys, only the
    // excepted scripts for replaced keys.
    const getSelectedScriptsForItem = (item: DeleteImpactItem) => !scriptsOnly
        ? item.scripts
        : item.scripts.filter((script) => isScriptSelected(item.dataKeyId, script.scriptId));

    const getRemovedScriptsForItem = (item: DeleteImpactItem) => {
        if (isUnlink) return replacements[item.dataKeyId] ? [] : item.scripts;
        if (scriptsOnly) {
            const selectedScripts = getSelectedScriptsForItem(item);
            if (isParentItem(item) || !replacements[item.dataKeyId]) return selectedScripts;
            return selectedScripts.filter((script) => isScriptRemoved(item.dataKeyId, script.scriptId));
        }
        if (isParentItem(item) || !replacements[item.dataKeyId]) return item.scripts;
        return item.scripts.filter((script) => isScriptRemoved(item.dataKeyId, script.scriptId));
    };

    // Keys with at least one script losing references (shown on the receipt).
    const strippedItems = usedItems.filter((item) => !!getRemovedScriptsForItem(item).length);
    const unreplacedReplaceableItems = replaceableItems.filter((item) => !replacements[item.dataKeyId]);

    // Anything destructive goes through the receipt step before executing.
    const removalsExist = !isUnlink && !!strippedItems.length;

    const selectedScriptCount = usedItems.reduce((sum, item) => sum + getSelectedScriptsForItem(item).length, 0);
    const showScopeSwitch = !isUnlink && !!onApplyToScripts && !loading && !!usedItems.length;

    // With no replaceable keys at all (all parents), "Delete anyway" IS the
    // primary action; otherwise it sits beside the primary button.
    const showReplaceButton = !allUnused && (isUnlink || !!replaceableItems.length);
    const showDeleteAnywaySecondary = !isUnlink && !!onDeleteAnyway && showReplaceButton && !!unreplacedReplaceableItems.length;
    const showDeleteAnywayPrimary = !isUnlink && !!onDeleteAnyway && !showReplaceButton && !!usedItems.length;

    const executeConfirm = async () => {
        const success = await onConfirm(selection);
        if (success !== false) {
            resetSelection();
            setConfirmingDeleteAnyway(false);
        }
    };

    const handleConfirm = async () => {
        if (missingReplacement || hasCandidateGap) return;

        // Fully-replaced deletes execute directly; anything that removes
        // references pauses on the receipt step first.
        if (removalsExist && !confirmingDeleteAnyway) {
            setConfirmingDeleteAnyway(true);
            return;
        }

        await executeConfirm();
    };

    const handleDeleteAnyway = async () => {
        if (!onDeleteAnyway) return;
        const success = await onDeleteAnyway(selection);
        if (success !== false) {
            resetSelection();
            setConfirmingDeleteAnyway(false);
        }
    };

    // Receipt confirm: unreplaced keys need the explicit "delete anyway"
    // permission; a fully-replaced-with-exceptions batch does not.
    const handleReceiptConfirm = async () => {
        if (unreplacedReplaceableItems.length || (!replaceableItems.length && usedItems.length)) {
            await handleDeleteAnyway();
        } else {
            await executeConfirm();
        }
    };

    const handleApplyToScripts = async () => {
        if (!onApplyToScripts) return;
        const success = await onApplyToScripts(selection);
        if (success !== false) {
            resetSelection();
            setConfirmingDeleteAnyway(false);
        }
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            resetSelection();
            setConfirmingDeleteAnyway(false);
        }
        onOpenChange(nextOpen);
    };

    const getReplacementTitle = (item: DeleteImpactItem) => {
        const replacementId = replacements[item.dataKeyId];
        if (!replacementId) return '';
        const replacement = dataKeys.find((dataKey) => dataKey.uuid === replacementId);
        return replacement ? getReplacementOptionKey(replacement) : '';
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {loading
                            ? 'Delete data keys'
                            : confirmingDeleteAnyway
                                ? (scriptsOnly ? 'Confirm script changes' : 'Confirm delete')
                                : scriptsOnly
                                    ? 'Replace or remove in selected scripts'
                                    : allUnused
                                    ? 'Delete data keys'
                                    : (title || (!isUnlink && !replaceableItems.length
                                        ? 'Data keys in use'
                                        : 'Choose replacement data keys'))}
                    </DialogTitle>
                    <DialogDescription>
                        {loading
                            ? 'Checking where the selected keys are used…'
                            : confirmingDeleteAnyway
                                ? (scriptsOnly
                                    ? 'Review what happens in each selected script, then confirm. The data keys stay in the library.'
                                    : 'Review what happens to each data key, then confirm.')
                                : scriptsOnly
                                    ? 'Choose the scripts to change. In each one the key is replaced, or removed if there is no replacement. Other scripts and the library are not changed.'
                                    : allUnused
                                    ? 'None of the selected keys are used in any script.'
                                    : (description || (isUnlink
                                        ? 'These options are used in scripts through this data key. Choose a fellow child key to take their place, or continue to remove them from the linked screens.'
                                        : (!replaceableItems.length
                                            ? 'These data keys are used in the scripts below. Parent data keys cannot be replaced — deleting removes their references from the scripts.'
                                            : (onDeleteAnyway
                                                ? 'These data keys are used in the scripts below. Choose a same-type replacement, or delete anyway to remove their references from the scripts.'
                                                : 'These data keys are used in scripts. Choose a same-type replacement before deleting them.'))))}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div role="status" aria-live="polite" className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
                        <span className="sr-only">Checking where the selected data keys are used…</span>
                        {[0, 1].map((index) => (
                            <div key={index} className="space-y-3 rounded-lg border border-border bg-card p-4">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-2/5" />
                                    <Skeleton className="h-5 w-16" />
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-28" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                                <Skeleton className="h-9 w-full" />
                            </div>
                        ))}
                    </div>
                ) : confirmingDeleteAnyway ? (
                    <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
                        {scriptsOnly && !strippedItems.length ? (
                            <div role="status" className="rounded-md border border-border bg-muted/50 p-3 text-sm">
                                <span className="font-semibold">References will be replaced in the selected scripts.</span>{' '}
                                The data keys stay in the library.
                            </div>
                        ) : (
                        <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
                            <span className="font-semibold">
                                {strippedItems.length === usedItems.length
                                    ? 'References will be removed, not replaced.'
                                    : 'Some references will be removed, not replaced.'}
                            </span>{' '}
                            Fields and options using the removed keys will be deleted or unlinked in the
                            {scriptsOnly ? ' selected' : ' affected'} scripts.
                            {scriptsOnly && ' The data keys stay in the library.'}
                        </div>
                        )}

                        <div className="space-y-1">
                            {usedItems.map((item) => {
                                const replacementTitle = getReplacementTitle(item);
                                const selectedScripts = getSelectedScriptsForItem(item);
                                const removedScripts = getRemovedScriptsForItem(item);
                                const removedIds = new Set(removedScripts.map((script) => script.scriptId));
                                const replacedCount = countScriptTitles(selectedScripts.filter((script) => !removedIds.has(script.scriptId)));
                                const removedCount = countScriptTitles(removedScripts);
                                const selectedIds = new Set(selectedScripts.map((script) => script.scriptId));
                                const unchangedCount = countScriptTitles(item.scripts.filter((script) => !selectedIds.has(script.scriptId)));

                                return (
                                    <div
                                        key={item.dataKeyId}
                                        className="rounded border border-border px-3 py-2 text-sm"
                                    >
                                        <div className="flex items-center justify-between gap-x-2">
                                            <div className="min-w-0 truncate font-medium">{getImpactTitle(item)}</div>
                                            <div className={cn(
                                                'shrink-0 text-xs',
                                                removedScripts.length ? 'text-destructive' : 'text-muted-foreground',
                                            )}>
                                                {replacementTitle && replacedCount > 0 && (
                                                    <span className="text-muted-foreground">
                                                        replaced by <span className="font-medium text-foreground">{replacementTitle}</span>
                                                        {removedScripts.length ? ` in ${pluralizeScripts(replacedCount)}` : ''}
                                                    </span>
                                                )}
                                                {replacementTitle && replacedCount > 0 && !!removedScripts.length && ' · '}
                                                {!!removedScripts.length && `removed in ${pluralizeScripts(removedCount)}`}
                                                {scriptsOnly && !selectedScripts.length && (
                                                    <span className="text-muted-foreground">no changes</span>
                                                )}
                                            </div>
                                        </div>

                                        {scriptsOnly && unchangedCount > 0 && !!selectedScripts.length && (
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                Not changed in {unchangedCount} other {unchangedCount === 1 ? 'script' : 'scripts'}.
                                            </div>
                                        )}

                                        {!!removedScripts.length && removedScripts.length < item.scripts.length && (
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                Removed in: {groupScriptsByTitle(removedScripts).map((group) => group.title).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {!isUnlink && !scriptsOnly && unusedCount > 0 && (
                            <p className="px-1 text-xs text-muted-foreground">
                                {unusedCount} more selected data key{unusedCount === 1 ? ' is' : 's are'} not used in
                                any script and will be deleted as well.
                            </p>
                        )}

                        <p className="px-1 text-xs text-muted-foreground">
                            Screens that lose a key are flagged by the data key integrity checks and may need
                            repair before the next publish.
                        </p>
                    </div>
                ) : allUnused ? (
                    <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
                        {impact.map((item) => (
                            <div
                                key={item.dataKeyId}
                                className="flex items-center gap-2 rounded border border-border px-3 py-2 text-sm"
                            >
                                <div className="min-w-0 truncate font-medium">{getImpactTitle(item)}</div>
                                <Badge variant="secondary" className="font-normal">{item.dataType || 'unknown type'}</Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
                    {showScopeSwitch && (
                        <div
                            role="radiogroup"
                            aria-label="Where to apply"
                            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                        >
                            {([
                                {
                                    value: 'library',
                                    title: 'Delete from library',
                                    caption: 'Applies to every script using the key.',
                                },
                                {
                                    value: 'scripts',
                                    title: 'Selected scripts only',
                                    caption: 'The key stays in the library.',
                                },
                            ] as const).map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={scope === option.value}
                                    disabled={deleting}
                                    onClick={() => setScope(option.value)}
                                    className={cn(
                                        'rounded-md border px-3 py-2 text-left text-sm transition-colors',
                                        scope === option.value
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:bg-accent/50',
                                    )}
                                >
                                    <div className="font-medium">{option.title}</div>
                                    <div className="text-xs text-muted-foreground">{option.caption}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {usedItems.map((item) => {
                        const candidates = candidatesByDataKeyId.get(item.dataKeyId) || [];
                        const selectedReplacementId = replacements[item.dataKeyId] || '';
                        const dataTypeLabel = item.dataType || 'unknown type';
                        const parent = isParentItem(item);

                        const selectedScripts = getSelectedScriptsForItem(item);
                        const removedScriptCount = !selectedReplacementId ? 0 : (scriptRemovals[item.dataKeyId] || [])
                            .filter((scriptId) => selectedScripts.some((script) => script.scriptId === scriptId))
                            .length;
                        const allScriptsSelected = selectedScripts.length === item.scripts.length;
                        const scriptGroups = groupScriptsByTitle(item.scripts);
                        const selectedGroupCount = scriptGroups
                            .filter((group) => group.scriptIds.every((scriptId) => isScriptSelected(item.dataKeyId, scriptId)))
                            .length;
                        const replacingGroupCount = countScriptTitles(selectedScripts.filter((script) => !isScriptRemoved(item.dataKeyId, script.scriptId)));
                        const removingGroupCount = countScriptTitles(selectedScripts.filter((script) => isScriptRemoved(item.dataKeyId, script.scriptId)));

                        return (
                            <div
                                key={item.dataKeyId}
                                className="rounded-lg border border-border bg-card p-4"
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="font-semibold">{getImpactTitle(item)}</div>
                                    <Badge variant="secondary" className="font-normal">{dataTypeLabel}</Badge>
                                    {parent && <Badge variant="outline" className="font-normal">parent key</Badge>}
                                    <div className="ml-auto flex items-center gap-x-2 text-xs text-muted-foreground">
                                        {scriptsOnly && `${selectedGroupCount} of `}
                                        {pluralizeScripts(scriptGroups.length)}
                                        {scriptsOnly && (
                                            <button
                                                type="button"
                                                disabled={deleting}
                                                className="text-primary hover:underline"
                                                onClick={() => setScriptSelected(
                                                    item.dataKeyId,
                                                    item.scripts.map((script) => script.scriptId),
                                                    !allScriptsSelected,
                                                )}
                                            >
                                                {allScriptsSelected ? 'Clear' : 'Select all'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {!!item.scripts.length && (
                                    <ul className="mt-3 max-h-40 space-y-0.5 overflow-y-auto rounded-md border border-border p-1">
                                        {scriptGroups.map((group) => {
                                            // Per-script action toggle appears once a
                                            // replacement is chosen; before that every
                                            // script would be removed anyway.
                                            const groupSelected = !scriptsOnly || group.scriptIds.every((scriptId) => isScriptSelected(item.dataKeyId, scriptId));
                                            const showToggle = !isUnlink && !parent && !!selectedReplacementId && groupSelected;
                                            const removed = showToggle && group.scriptIds.every((scriptId) => isScriptRemoved(item.dataKeyId, scriptId));

                                            return (
                                                <li
                                                    key={group.key}
                                                    className="rounded px-2 py-1 text-xs hover:bg-accent/50"
                                                >
                                                    <div className="flex items-center gap-x-2">
                                                        {scriptsOnly && (
                                                            <input
                                                                type="checkbox"
                                                                className="h-3.5 w-3.5 shrink-0 accent-primary"
                                                                aria-label={`Apply to ${group.title}`}
                                                                checked={groupSelected}
                                                                disabled={deleting}
                                                                onChange={(e) => setScriptSelected(item.dataKeyId, group.scriptIds, e.target.checked)}
                                                            />
                                                        )}
                                                        <span className="min-w-0 flex-1 truncate font-medium">
                                                            {group.title}
                                                            {group.scriptIds.length > 1 && (
                                                                <span className="ml-1.5 font-normal text-muted-foreground">
                                                                    ({group.scriptIds.length} scripts with this title)
                                                                </span>
                                                            )}
                                                        </span>

                                                        {showToggle && (
                                                            <div
                                                                role="group"
                                                                aria-label={`Action for ${group.title}`}
                                                                className="flex shrink-0 overflow-hidden rounded border border-border text-[10px] leading-none"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    aria-pressed={!removed}
                                                                    disabled={deleting}
                                                                    className={cn(
                                                                        'px-1.5 py-1 transition-colors',
                                                                        !removed
                                                                            ? 'bg-primary text-primary-foreground'
                                                                            : 'text-muted-foreground hover:bg-accent',
                                                                    )}
                                                                    onClick={() => setScriptAction(item.dataKeyId, group.scriptIds, false)}
                                                                >
                                                                    Replace
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    aria-pressed={removed}
                                                                    disabled={deleting}
                                                                    className={cn(
                                                                        'px-1.5 py-1 transition-colors',
                                                                        removed
                                                                            ? 'bg-destructive text-destructive-foreground'
                                                                            : 'text-muted-foreground hover:bg-accent',
                                                                    )}
                                                                    onClick={() => setScriptAction(item.dataKeyId, group.scriptIds, true)}
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <ul className={cn('mt-0.5 space-y-0.5', scriptsOnly && 'pl-5')}>
                                                        {group.usages.map((usage) => (
                                                            <li key={`${usage.href}::${usage.label}`}>
                                                                <a
                                                                    href={usage.href}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex min-w-0 items-center gap-x-1 text-muted-foreground hover:text-foreground"
                                                                >
                                                                    <span className="min-w-0 truncate">{usage.label}</span>
                                                                    <ExternalLinkIcon className="h-3 w-3 shrink-0 text-primary" />
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}

                                {parent ? (
                                    <p className="mt-3 text-xs text-destructive">
                                        {isUnlink
                                            ? 'This option is a parent data key — it cannot be replaced. Unlinking removes it from screens linked to this data key.'
                                            : (scriptsOnly
                                                ? 'Parent data keys cannot be replaced. Its fields and options are removed from the selected scripts; its child keys stay in the library.'
                                                : 'Parent data keys cannot be replaced. Deleting removes its fields and options from the scripts above.')}
                                    </p>
                                ) : (
                                    <div className="mt-3">
                                        <SearchableReplacementSelect
                                            candidates={candidates}
                                            dataTypeLabel={dataTypeLabel}
                                            pickerDescription={isUnlink
                                                ? 'Only fellow child keys of the same type are listed.'
                                                : 'Only same-type data keys with compatible options are listed.'}
                                            excludedDataKeyId={item.dataKeyId}
                                            value={selectedReplacementId}
                                            onChange={(replacementId) => {
                                                setReplacements((current) => ({
                                                    ...current,
                                                    [item.dataKeyId]: replacementId,
                                                }));
                                            }}
                                            disabled={!candidates.length || deleting}
                                        />
                                        {!candidates.length && (
                                            <p className={isUnlink ? 'mt-2 text-xs text-amber-600' : 'mt-2 text-xs text-destructive'}>
                                                {isUnlink
                                                    ? 'No compatible fellow child key was found. This option will be removed from screens linked to this data key.'
                                                    : (scriptsOnly
                                                        ? `No compatible ${dataTypeLabel} replacement exists. It will be removed from the selected scripts.`
                                                        : `No compatible ${dataTypeLabel} replacement exists.${onDeleteAnyway ? ' You can still delete anyway to remove its references.' : ''}`)}
                                            </p>
                                        )}
                                        {removedScriptCount > 0 && (
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                Replacing in {pluralizeScripts(replacingGroupCount)}
                                                {' '}· <span className="text-destructive">removing in {removingGroupCount}</span>
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {!isUnlink && unusedCount > 0 && (
                        <p className="px-1 text-xs text-muted-foreground">
                            {unusedCount} more selected data key{unusedCount === 1 ? ' is' : 's are'} not used in
                            any script and will {scriptsOnly ? 'not be changed' : 'be deleted as well'}.
                        </p>
                    )}

                    {Object.values(replacements).some(Boolean) && (
                        <p className="px-1 text-xs text-muted-foreground">
                            Conditions that refer to a replaced key or option by name are updated in the
                            scripts where it is replaced.
                        </p>
                    )}
                </div>
                )}

                <DialogFooter>
                    {confirmingDeleteAnyway ? (
                        <div className="flex w-full justify-end gap-x-2">
                            <Button
                                ref={goBackRef}
                                type="button"
                                variant="outline"
                                disabled={deleting}
                                onClick={() => setConfirmingDeleteAnyway(false)}
                            >
                                Go back
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={deleting}
                                onClick={scriptsOnly ? handleApplyToScripts : handleReceiptConfirm}
                            >
                                {scriptsOnly ? 'Apply to scripts' : 'Delete'}
                            </Button>
                        </div>
                    ) : scriptsOnly ? (
                        <div className="flex w-full flex-col gap-y-2">
                            {!selectedScriptCount && (
                                <p className="text-xs text-muted-foreground sm:text-right">
                                    Select at least one script to continue.
                                </p>
                            )}
                            <div className="flex justify-end gap-x-2">
                                <Button
                                    ref={cancelRef}
                                    type="button"
                                    variant="outline"
                                    disabled={deleting}
                                    onClick={() => handleOpenChange(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    disabled={deleting || !selectedScriptCount}
                                    onClick={() => setConfirmingDeleteAnyway(true)}
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex w-full flex-col gap-y-2">
                            {showReplaceButton && !isUnlink && !!unreplacedReplaceableItems.length && (
                                <p className="text-xs text-muted-foreground sm:text-right">
                                    Choose {unreplacedReplaceableItems.length === replaceableItems.length ? '' : 'the remaining '}
                                    replacement{unreplacedReplaceableItems.length === 1 ? '' : 's'} to enable “Replace and delete”.
                                </p>
                            )}
                            <div className="flex justify-end gap-x-2">
                                <Button
                                    ref={cancelRef}
                                    type="button"
                                    variant="outline"
                                    disabled={deleting}
                                    onClick={() => handleOpenChange(false)}
                                >
                                    Cancel
                                </Button>
                                {allUnused && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        disabled={deleting}
                                        onClick={handleConfirm}
                                    >
                                        Delete
                                    </Button>
                                )}
                                {showDeleteAnywaySecondary && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="text-destructive hover:text-destructive"
                                        disabled={deleting}
                                        onClick={() => setConfirmingDeleteAnyway(true)}
                                    >
                                        Delete anyway
                                    </Button>
                                )}
                                {showReplaceButton && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        disabled={deleting || missingReplacement || hasCandidateGap}
                                        onClick={handleConfirm}
                                    >
                                        {confirmLabel || (isUnlink
                                            ? 'Replace and unlink'
                                            : (removalsExist ? 'Continue' : 'Replace and delete'))}
                                    </Button>
                                )}
                                {showDeleteAnywayPrimary && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        disabled={deleting}
                                        onClick={() => setConfirmingDeleteAnyway(true)}
                                    >
                                        Delete anyway
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
