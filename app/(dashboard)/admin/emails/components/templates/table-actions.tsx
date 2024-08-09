'use client';

import { MoreVertical, Trash } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IEmailTemplatesContext, useEmailTemplatesContext } from "@/contexts/email-templates";

export function EmailTemplatesTableActions({ item }: {
    item: Awaited<ReturnType<IEmailTemplatesContext['getEmailTemplates']>>['data'][0];
}) {
    const { 
        onDelete, 
        setActiveItemId, 
    } = useEmailTemplatesContext();

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
                        onClick={() => setActiveItemId(item.id)}
                    >
                        Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => onDelete([item.id])}
                        className="text-danger focus:bg-danger focus:text-danger-foreground"
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
