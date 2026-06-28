'use client';

import { useMemo, useState } from 'react';

import type { DataKey } from '@/contexts/data-keys';
import { SelectModal, type SelectModalOption } from '@/components/select-modal';
import { Button } from '@/components/ui/button';
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

type DataKeyDeleteReplacementDialogProps = {
    dataKeys: DataKey[];
    impact: DeleteImpactItem[];
    open: boolean;
    deleting?: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (replacements: ReplacementMap) => Promise<boolean | void> | boolean | void;
};

function normalizeType(value?: string | null) {
    return `${value || ''}`.trim().toLowerCase();
}


function getImpactTitle(item: DeleteImpactItem) {
    return item.label || item.name || item.uniqueKey || 'Untitled data key';
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
    disabled,
    error,
    excludedDataKeyId,
    value,
    onChange,
}: {
    candidates: DataKey[];
    dataTypeLabel: string;
    disabled?: boolean;
    error?: boolean;
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
            error={error}
            placeholder={`Select a ${dataTypeLabel} data key`}
            search={{ placeholder: 'Search data keys' }}
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
    onOpenChange,
    onConfirm,
}: DataKeyDeleteReplacementDialogProps) {
    const usedItems = useMemo(
        () => impact.filter((item) => item.scripts.length > 0),
        [impact],
    );
    const deletedIds = useMemo(
        () => new Set(impact.map((item) => item.dataKeyId).filter(Boolean)),
        [impact],
    );
    const [replacements, setReplacements] = useState<ReplacementMap>({});

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

    const missingReplacement = usedItems.some((item) => !replacements[item.dataKeyId]);
    const hasCandidateGap = usedItems.some((item) => !(candidatesByDataKeyId.get(item.dataKeyId) || []).length);

    const handleConfirm = async () => {
        if (missingReplacement || hasCandidateGap) return;
        const success = await onConfirm(replacements);
        if (success !== false) setReplacements({});
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) setReplacements({});
        onOpenChange(nextOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Choose replacement data keys</DialogTitle>
                    <DialogDescription>
                        These data keys are used in scripts. Choose a same-type replacement before deleting them.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
                    {usedItems.map((item) => {
                        const candidates = candidatesByDataKeyId.get(item.dataKeyId) || [];
                        const selectedReplacementId = replacements[item.dataKeyId] || '';
                        const dataTypeLabel = item.dataType || 'Unknown type';

                        return (
                            <div
                                key={item.dataKeyId}
                                className="rounded-lg border border-slate-200 bg-white p-4"
                            >
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <div className="font-semibold text-slate-950">
                                            {getImpactTitle(item)}
                                        </div>
                                        <div className="mt-1 text-sm text-slate-500">
                                            {dataTypeLabel} - {item.scripts.length} affected script{item.scripts.length === 1 ? '' : 's'}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                        Replacement
                                    </label>
                                    <SearchableReplacementSelect
                                        candidates={candidates}
                                        dataTypeLabel={dataTypeLabel}
                                        excludedDataKeyId={item.dataKeyId}
                                        value={selectedReplacementId}
                                        onChange={(replacementId) => {
                                            setReplacements((current) => ({
                                                ...current,
                                                [item.dataKeyId]: replacementId,
                                            }));
                                        }}
                                        disabled={!candidates.length || deleting}
                                        error={!selectedReplacementId && !!candidates.length}
                                    />
                                    <p className={cn(
                                        "mt-2 text-xs",
                                        candidates.length ? "text-slate-500" : "text-destructive",
                                    )}>
                                        {candidates.length
                                            ? 'Only same-type data keys with compatible options are listed.'
                                            : `No available ${dataTypeLabel} replacement with compatible options was found.`}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <DialogFooter>
                    <Button
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
                        disabled={deleting || missingReplacement || hasCandidateGap}
                        onClick={handleConfirm}
                    >
                        Replace and delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
