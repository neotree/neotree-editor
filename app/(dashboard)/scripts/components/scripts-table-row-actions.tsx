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
import { IScriptsContext } from "@/contexts/scripts";
import { useAppContext } from "@/contexts/app";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

type Props = {
    script: Awaited<ReturnType<IScriptsContext['_getScripts']>>['data'][0];
    onDelete: () => void;
    onDuplicate: () => void;
};

export function ScriptsTableRowActions({ 
    script: { scriptDraftId, scriptId },
    onDelete, 
    onDuplicate,
}: Props) {
    const { viewOnly } = useAppContext();
    const [_, copyToClipboard] = useCopyToClipboard({ showValueOnToast: true, });

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
                            href={`/script/${scriptDraftId || scriptId}`}
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
                        onClick={() => copyToClipboard(scriptDraftId || scriptId)}
                    >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy ID
                    </DropdownMenuItem>

                    {!viewOnly && (
                        <DropdownMenuItem
                            onClick={onDelete}
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
