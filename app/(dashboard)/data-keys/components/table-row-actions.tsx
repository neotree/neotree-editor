'use client';

import { useState, useTransition } from 'react';
import { MoreVertical, EditIcon, EyeIcon, TrashIcon, ExternalLink } from 'lucide-react';
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
import { buildDeleteConfirmationFooterMessage, buildDeleteConfirmationMessage, fetchDataKeyDeleteImpact } from './delete-confirmation';

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
    const [isPreparingDelete, setIsPreparingDelete] = useState(false);

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
            {(isTransitionPending || isPreparingDelete) && <Loader overlay />}

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

                    <DropdownMenuItem asChild>
                        <Link target="_blank" href={`/data-keys/${dataKey.uuid}/metadata`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View metadata
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                        className={cn('text-destructive', disabled && 'hidden')}
                        onClick={() => setTimeout(async () => {
                            try {
                                setIsPreparingDelete(true);
                                const impact = await fetchDataKeyDeleteImpact([dataKey.uuid]);
                                confirm(() => deleteDataKeys([dataKey.uuid]), {
                                    title: 'Delete data key',
                                    message: buildDeleteConfirmationMessage(impact),
                                    footerMessage: buildDeleteConfirmationFooterMessage(impact),
                                    positiveLabel: 'Delete anyway',
                                    danger: true,
                                });
                            } finally {
                                setIsPreparingDelete(false);
                            }
                        }, 0)}
                    >
                        <TrashIcon className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
