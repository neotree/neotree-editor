'use client';

import { MoreVertical, EditIcon, EyeIcon, TrashIcon } from 'lucide-react';

import { useDataKeysCtx } from '@/contexts/data-keys';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';


export function DataKeysTableRowActions({ 
    rowIndex, 
    disabled, 
    setCurrentDataKeyUuid,
}: {
    rowIndex: number;
    disabled: boolean;
    setCurrentDataKeyUuid: (uuid: string) => void;
}) {
    const { dataKeys, } = useDataKeysCtx();

    const dataKey = dataKeys[rowIndex];

    if (!dataKey) return null;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                    {!!disabled && (
                        <DropdownMenuItem 
                            onClick={() => setTimeout(() => setCurrentDataKeyUuid(dataKey.uuid), 0)}
                        >
                            <EyeIcon className="h-4 w-4 mr-2" /> View
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem 
                        className={cn(disabled && 'hidden')}
                        onClick={() => setTimeout(() => setCurrentDataKeyUuid(dataKey.uuid), 0)}
                    >
                        <EditIcon className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem className={cn('text-destructive', disabled && 'hidden')}>
                        <TrashIcon className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
