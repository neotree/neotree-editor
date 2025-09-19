'use client';

import { UploadIcon } from 'lucide-react';

import { useDataKeysCtx } from '@/contexts/data-keys';
import { Button } from '@/components/ui/button';
import { ActionsBar } from '@/components/actions-bar';

export function DataKeysTableBottomActions({ disabled, }: {
    disabled: boolean;
}) {
    const { selected, dataKeys } = useDataKeysCtx();

    if (disabled || !selected.length) return null;

    return (
        <>
            <ActionsBar>
                <Button>
                    <UploadIcon className="w-4 h-4 mr-2" /> 
                    Export{selected.length > 1 ? ` ${selected.length} keys` : ''}
                </Button>
            </ActionsBar>
        </>
    );
}
