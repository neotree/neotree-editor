'use client';

import { useState } from 'react';
import { TrashIcon } from 'lucide-react';

import { useDataKeysCtx } from '@/contexts/data-keys';
import { Button } from '@/components/ui/button';
import { ActionsBar } from '@/components/actions-bar';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { ExportModal } from './export-modal';
import { buildDeleteConfirmationFooterMessage, buildDeleteConfirmationMessage, fetchDataKeyDeleteImpact, type DeleteImpactItem } from './delete-confirmation';
import { Loader } from '@/components/loader';
import { DataKeyDeleteReplacementDialog } from './delete-replacement-dialog';

export function DataKeysTableBottomActions({ disabled, }: {
    disabled: boolean;
}) {
    const [isPreparingDelete, setIsPreparingDelete] = useState(false);
    const [replacementImpact, setReplacementImpact] = useState<DeleteImpactItem[]>([]);
    const [showReplacementDialog, setShowReplacementDialog] = useState(false);
    const { confirm } = useConfirmModal();
    const { selected, setSelected, deleteDataKeys, allDataKeys, deleting } = useDataKeysCtx();

    if (disabled || !selected.length) return null;

    return (
        <>
            {isPreparingDelete && <Loader overlay />}
            <DataKeyDeleteReplacementDialog
                open={showReplacementDialog}
                onOpenChange={setShowReplacementDialog}
                impact={replacementImpact}
                dataKeys={allDataKeys}
                deleting={deleting}
                onConfirm={async (replacements) => {
                    const success = await deleteDataKeys(selected.map(s => s.uuid), replacements);
                    if (success) setShowReplacementDialog(false);
                    return success;
                }}
            />
            <ActionsBar>
                <Button
                    variant="ghost"
                    onClick={() => setSelected([])}
                >
                    Cancel
                </Button>

                <ExportModal
                    uuids={selected.map(s => s.uuid)}
                />

                <Button
                    variant="destructive"
                    onClick={() => setTimeout(async () => {
                        try {
                            setIsPreparingDelete(true);
                            const uuids = selected.map(s => s.uuid);
                            const impact = await fetchDataKeyDeleteImpact(uuids);
                            if (impact.some((item) => item.scripts.length > 0)) {
                                setReplacementImpact(impact);
                                setShowReplacementDialog(true);
                                return;
                            }

                            confirm(() => deleteDataKeys(uuids), {
                                title: 'Delete data keys',
                                message: buildDeleteConfirmationMessage(impact),
                                footerMessage: buildDeleteConfirmationFooterMessage(impact),
                                positiveLabel: 'Delete',
                                danger: true,
                            });
                        } finally {
                            setIsPreparingDelete(false);
                        }
                    }, 0)}
                >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete{selected.length > 1 ? ` ${selected.length} keys` : ''}
                </Button>
            </ActionsBar>
        </>
    );
}
