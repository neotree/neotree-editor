'use client';

import Link from "next/link";
import { MoreVertical, Trash, Edit, Copy, CopyPlus, Eye } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IScriptsContext, useScriptsContext } from "@/contexts/scripts";
import { useAppContext } from "@/contexts/app";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

export function ScriptsTableActions({ item }: {
    item: Awaited<ReturnType<IScriptsContext['getScripts']>>['data'][0];
}) {
    const { 
        disabled,
        onDelete, 
        onDuplicate, 
    } = useScriptsContext();

    const { viewOnly } = useAppContext();
    const [_, copyToClipboard] = useCopyToClipboard({ showValueOnToast: true, });

    if (!item) return null;

    return (
        <>
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
                                {!viewOnly ? <><Edit className="mr-2 h-4 w-4" /> Edit</> : <><Eye className="mr-2 h-4 w-4" /> View</>}
                            </>
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => onDuplicate()}
                    >
                        <CopyPlus className="mr-2 h-4 w-4" />
                        Duplicate
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => copyToClipboard(item.scriptId)}
                    >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy ID
                    </DropdownMenuItem>

                    {!disabled && (
                        <DropdownMenuItem
                            onClick={() => onDelete([item.scriptId])}
                            className="text-danger focus:bg-danger focus:text-danger-foreground"
                        >
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
