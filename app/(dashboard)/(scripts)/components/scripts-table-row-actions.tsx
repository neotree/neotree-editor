'use client';

import Link from "next/link";
import { 
    MoreVertical, 
    Trash, 
    Edit, 
    Copy, 
    CopyPlus, 
    Eye, 
    Upload, 
    ExternalLink,
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IScriptsContext } from "@/contexts/scripts";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Clipboard } from "@/components/clipboard";
import { LockStatus, type LockStatusProps } from "@/components/lock-status";
import { useIsLocked } from "@/hooks/use-is-locked";

export function ScriptsTableActions({ item, disabled, setScriptsIdsToExport, onDelete, onDuplicate }: {
    disabled: boolean;
    item: Awaited<ReturnType<IScriptsContext['getScripts']>>['data'][0];
    onDelete: () => void;
    onDuplicate: () => void;
    setScriptsIdsToExport: () => void;
}) {
    const [_, copyToClipboard] = useCopyToClipboard({ showValueOnToast: true, });

    const lockStatusParams: LockStatusProps = {
        isDraft: item.isDraft || !!item.hasChangedItems,
        userId: item.draftCreatedByUserId || item.itemsChangedByUserId,
        dataType: 'script',
    };

    const isLocked = useIsLocked(lockStatusParams);

    disabled = disabled || isLocked;

    if (!item) return null;

    return (
        <>
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
                            <Link
                                href={`/script/${item.scriptId}`}
                            >
                                <>
                                    {disabled ? (
                                        <>
                                            <Eye className="mr-2 h-4 w-4" /> View
                                        </>
                                    ) : (
                                        <>
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </>
                                    )}
                                </>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => setTimeout(() => onDuplicate(), 0)}
                        >
                            <CopyPlus className="mr-2 h-4 w-4" />
                            Duplicate
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => setTimeout(() => setScriptsIdsToExport(), 0)}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Export
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            asChild
                        >
                            <Clipboard showValueOnToast value={item.scriptId}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy ID
                            </Clipboard>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            asChild
                        >
                            <Link target="_blank" href={`/scripts/${item.scriptId}/metadata`}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View metadata
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            asChild
                        >
                            <Link target="_blank" href={`/script/${item.scriptId}/data-keys`}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View data keys
                            </Link>
                        </DropdownMenuItem>

                        {!disabled && (
                            <DropdownMenuItem
                                onClick={() => setTimeout(() => onDelete(), 0)}
                                className="text-danger focus:bg-danger focus:text-danger-foreground"
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
}
