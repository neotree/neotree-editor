'use client';

import { Edit, Eye, MoreVertical, Trash } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IConfigKeysContext, useConfigKeysContext } from "@/contexts/config-keys";
import { LockStatus, type LockStatusProps } from "@/components/lock-status";
import { useIsLocked } from "@/hooks/use-is-locked";

export function ConfigKeysTableActions({ item }: {
    item: Awaited<ReturnType<IConfigKeysContext['getConfigKeys']>>['data'][0];
}) {
    const { 
        disabled: _disabled,
        onDelete, 
        setActiveItemId, 
    } = useConfigKeysContext();

    const lockStatusParams: LockStatusProps = {
        isDraft: item.isDraft,
        userId: item.draftCreatedByUserId,
        dataType: 'config key',
    };

    const isLocked = useIsLocked(lockStatusParams);

    const disabled = _disabled || isLocked;

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
                        onClick={() => setActiveItemId(item.configKeyId)}
                    >
                        {!disabled ? <><Edit className="mr-2 h-4 w-4" /> Edit</> : <><Eye className="mr-2 h-4 w-4" /> View</>}
                    </DropdownMenuItem>

                    {!disabled && (
                        <DropdownMenuItem
                            onClick={() => setTimeout(() => onDelete([item.configKeyId]), 0)}
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
