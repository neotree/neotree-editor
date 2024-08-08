'use client';

import { MoreVertical, Trash } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "@/hooks/use-search-params";

type Props = {
    hospitalId: string;
    hospitalName: string;
    onDelete: () => void;
};

export function HospitalAction({ 
    hospitalId,
    hospitalName, 
    onDelete, 
}: Props) {
    const searchParams = useSearchParams();

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
                    <DropdownMenuLabel>{hospitalName}</DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem 
                        onClick={() => searchParams.push({ hospitalId })}
                    >
                        Edit
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={onDelete}
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
