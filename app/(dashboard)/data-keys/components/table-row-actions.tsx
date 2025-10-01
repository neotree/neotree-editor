'use client';

import { useTransition } from 'react';
import { MoreVertical, EditIcon, EyeIcon, TrashIcon } from 'lucide-react';
import Link from 'next/link';

import { useDataKeysCtx } from '@/contexts/data-keys';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { Loader } from '@/components/loader';
import { LockStatus, type LockStatusProps } from "@/components/lock-status";
import { useIsLocked } from "@/hooks/use-is-locked";

export function DataKeysTableRowActions({ 
    rowIndex, 
    disabled, 
    setCurrentDataKeyUuid,
}: {
    rowIndex: number;
    disabled: boolean;
    setCurrentDataKeyUuid: (uuid: string) => void;
}) {
    const [isTransitionPending, startTransition] = useTransition();

    const { dataKeys, deleteDataKeys, } = useDataKeysCtx();
    const { confirm } = useConfirmModal();

    const dataKey = dataKeys[rowIndex];

    const lockStatusParams: LockStatusProps = {
        isDraft: dataKey?.isDraft,
        userId: dataKey?.draftCreatedByUserId,
        dataType: 'data key',
    };

    const isLocked = useIsLocked(lockStatusParams);

    disabled = disabled || isLocked;

    if (!dataKey) return null;

    return (
        <div className="flex gap-x-2">
            {isTransitionPending && <Loader overlay />}

            <LockStatus {...lockStatusParams} />

            <DropdownMenu>
                <DropdownMenuTrigger>
                    <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                    <DropdownMenuItem 
                        asChild
                        onClick={() => setTimeout(() => startTransition(() => {}), 0)}
                    >
                        <Link href={`/data-keys/edit/${dataKey.uuid}`}>
                            {disabled ? (
                                <>
                                    <EyeIcon className="h-4 w-4 mr-2" /> View
                                </>
                            ) : (
                                <>
                                    <EditIcon className="h-4 w-4 mr-2" /> Edit
                                </>
                            )}
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                        className={cn('text-destructive', disabled && 'hidden')}
                        onClick={() => setTimeout(() => {
                            confirm(() => deleteDataKeys([dataKey.uuid]), {
                                title: 'Delete data key',
                                message: 'Are you sure?',
                            });
                        }, 0)}
                    >
                        <TrashIcon className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
