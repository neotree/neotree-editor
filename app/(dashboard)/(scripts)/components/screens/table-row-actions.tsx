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
import { useAppContext } from "@/contexts/app";
import { IScriptsContext } from "@/contexts/scripts";

type Props = {
    screen: Awaited<ReturnType<IScriptsContext['getScreens']>>['data'][0];
    onDelete: () => void;
    onCopy: () => void;
};

export function ScreensTableRowActions({ 
    screen: { screenId },
    onDelete, 
    onCopy,
}: Props) {
    const { scriptId, } = useParams();

    const { viewOnly } = useAppContext();

    const editHref = `/script/${scriptId}/screen/${screenId}`;

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
                            href={editHref}
                        >
                            {!viewOnly ? <><Edit className="mr-2 h-4 w-4" /> Edit</> : <><Eye className="mr-2 h-4 w-4" /> View</>}
                        </Link>
                    </DropdownMenuItem>

                    {!viewOnly && (
                        <>
                            <DropdownMenuItem 
                                onClick={() => onCopy()}
                            >
                                <Copy className="h-4 w-4 mr-2" /> Copy
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={onDelete}
                                className="text-danger focus:bg-danger focus:text-danger-foreground"
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
