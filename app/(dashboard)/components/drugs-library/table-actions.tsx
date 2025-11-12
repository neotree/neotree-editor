'use client';

import Link from "next/link";
import { MoreVertical, Trash, Edit, Eye, CopyIcon, ExternalLink } from "lucide-react";

import { useConfirmModal } from "@/hooks/use-confirm-modal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useDrugsLibrary } from "@/hooks/use-drugs-library";
import { LockStatus, type LockStatusProps } from "@/components/lock-status";
import { useIsLocked } from "@/hooks/use-is-locked";

type Props = {
    disabled: boolean;
    item: ReturnType<typeof useDrugsLibrary>['drugs'][0];
    editLink: ReturnType<typeof useDrugsLibrary>['editLink'];
    copyDrugs: ReturnType<typeof useDrugsLibrary>['copyDrugs'];
    deleteDrugs: ReturnType<typeof useDrugsLibrary>['deleteDrugs'];
};

export function DrugsLibraryTableActions({
    item,
    disabled,
    copyDrugs,
    deleteDrugs,
    editLink,
}: Props) {
    const { confirm } = useConfirmModal();

    const lockStatusParams: LockStatusProps = {
        isDraft: !!item.isDraft,
        userId: item.draftCreatedByUserId,
        dataType: item.type,
    };

    const isLocked = useIsLocked(lockStatusParams);

    disabled = disabled || isLocked;

    return (
        <div className="flex gap-x-2">
            <LockStatus {...lockStatusParams} />
            
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="p-0 h-auto w-auto transition-colors rounded-full hover:text-primary hover:bg-transparent"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                    <DropdownMenuItem 
                        asChild
                    >
                        <Link href={editLink(`${item.itemId}`)}>
                            <>
                                {!disabled ? <><Edit className="mr-2 h-4 w-4" /> Edit</> : <><Eye className="mr-2 h-4 w-4" /> View</>}
                            </>
                        </Link>
                    </DropdownMenuItem>

                    {!disabled && (
                        <DropdownMenuItem 
                            onClick={() => setTimeout(() => {
                                confirm(() => copyDrugs([item.itemId!]), {
                                    title: 'Copy drug',
                                    message: `Are you sure you want to copy drug?<br /> <b>${item.drug}</b>`,
                                    positiveLabel: 'Yes, copy',
                                    negativeLabel: 'Cancel',
                                });
                            }, 0)}
                        >
                            <>
                                <CopyIcon className="mr-2 h-4 w-4" /> Copy
                            </>
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                        asChild
                    >
                        <Link target="_blank" href={`/drugs-fluids-and-feeds/${item.itemId}/metadata`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View metadata
                        </Link>
                    </DropdownMenuItem>

                    {!disabled && (
                        <DropdownMenuItem
                            onClick={() => setTimeout(() => {
                                confirm(() => deleteDrugs([item.itemId!]), {
                                    title: 'Delete drug',
                                    message: 'Are you sure you want to delete drug?',
                                    positiveLabel: 'Yes, delete',
                                    negativeLabel: 'Cancel',
                                    danger: true,
                                });
                            }, 0)}
                            className="text-danger focus:bg-danger focus:text-danger-foreground"
                        >
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
