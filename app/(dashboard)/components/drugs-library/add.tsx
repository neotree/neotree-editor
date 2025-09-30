'use client';

import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Props = {
    addDrugLink: string;
    addFluidLink: string;
    disabled?: boolean;
};

export function Add({
    addDrugLink,
    addFluidLink,
    disabled
}: Props) {
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        disabled={!!disabled}
                    >
                        <span>Add</span>
                        <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                        <Link href={addDrugLink}>
                            New drug
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                        <Link href={addFluidLink}>
                            New fluid
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
