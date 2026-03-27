'use client';

import { useState } from 'react';
import { TrashIcon } from 'lucide-react';

import { useDataKeysCtx } from '@/contexts/data-keys';
import { Button } from '@/components/ui/button';
import { ActionsBar } from '@/components/actions-bar';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { ExportModal } from './export-modal';
import { buildDeleteConfirmationMessage, fetchDataKeyDeleteImpact } from './delete-confirmation';
import { Loader } from '@/components/loader';

export function DataKeysTableBottomActions({ disabled, }: {
    disabled: boolean;
}) {
    const [isPreparingDelete, setIsPreparingDelete] = useState(false);
    const { confirm } = useConfirmModal();
    const { selected, setSelected, deleteDataKeys } = useDataKeysCtx();

    if (disabled || !selected.length) return null;

    return (
        <>
            {isPreparingDelete && <Loader overlay />}
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
                            confirm(() => deleteDataKeys(uuids), {
                                title: 'Delete data keys',
                                message: buildDeleteConfirmationMessage(impact),
                                positiveLabel: 'Delete anyway',
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
