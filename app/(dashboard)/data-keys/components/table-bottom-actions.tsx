'use client';

import { TrashIcon } from 'lucide-react';

import { useDataKeysCtx } from '@/contexts/data-keys';
import { Button } from '@/components/ui/button';
import { ActionsBar } from '@/components/actions-bar';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { ExportModal } from './export-modal';

export function DataKeysTableBottomActions({ disabled, }: {
    disabled: boolean;
}) {
    const { confirm } = useConfirmModal();
    const { selected, setSelected, deleteDataKeys } = useDataKeysCtx();

    if (disabled || !selected.length) return null;

    return (
        <>
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
                    onClick={() => setTimeout(() => {
                        confirm(() => deleteDataKeys(selected.map(s => s.uuid)), {
                            title: 'Delete data keys',
                            message: 'Are you sure?',
                        });
                    }, 0)}
                >
                    <TrashIcon className="w-4 h-4 mr-2" /> 
                    Delete{selected.length > 1 ? ` ${selected.length} keys` : ''}
                </Button>
            </ActionsBar>
        </>
    );
}
