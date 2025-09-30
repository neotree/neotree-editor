'use client';

import Link from "next/link";
import { useParams } from "next/navigation";
import { Edit, Eye, MoreVertical, Trash, Copy } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IScriptsContext } from "@/contexts/scripts";
import { LockStatus, type LockStatusProps } from "@/components/lock-status";
import { useIsLocked } from "@/hooks/use-is-locked";

type Props = {
    disabled: boolean;
    screen: Awaited<ReturnType<IScriptsContext['getScreens']>>['data'][0];
    onDelete: () => void;
    onCopy: () => void;
};

export function ScreensTableRowActions({ 
    disabled,
    screen: { screenId, isDraft, draftCreatedByUserId, },
    onDelete, 
    onCopy,
}: Props) {
    const { scriptId, } = useParams();

    const editHref = `/script/${scriptId}/screen/${screenId}`;

    const lockStatusParams: LockStatusProps = {
        isDraft,
        userId: draftCreatedByUserId,
        dataType: 'screen',
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
                        <Link
                            href={editHref}
                        >
                            {!disabled ? <><Edit className="mr-2 h-4 w-4" /> Edit</> : <><Eye className="mr-2 h-4 w-4" /> View</>}
                        </Link>
                    </DropdownMenuItem>

                    {!disabled && (
                        <>
                            <DropdownMenuItem 
                                onClick={() => setTimeout(() => onCopy(), 0)}
                            >
                                <Copy className="h-4 w-4 mr-2" /> Copy
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => setTimeout(() => onDelete(), 0)}
                                className="text-danger focus:bg-danger focus:text-danger-foreground"
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
